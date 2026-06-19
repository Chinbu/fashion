const IMGBB_API_1 = "d5b5d8ca4f3a3c0a1e2248d121111692";
const IMGBB_API_2 = "122af555b20f19576ccc38e1719a0e4f";

let editingProductId = null;
let currentImageUrl = null;

async function upload(file, key) {
  const form = new FormData();
  form.append("image", file);

  const res = await fetch(`https://api.imgbb.com/1/upload?key=${key}`, {
    method: "POST",
    body: form
  });

  const data = await res.json();
  if (!data.success) throw new Error("fail");
  return data.data.url;
}

async function uploadImage(file) {
  try {
    return await upload(file, IMGBB_API_1);
  } catch {
    return await upload(file, IMGBB_API_2);
  }
}

async function checkAuth() {
  const { data: { user } } = await supabaseClient.auth.getUser();
  if (!user) {
    window.location.href = "login.html";
    return false;
  }
  return true;
}

async function addProduct() {
  const { data: { user } } = await supabaseClient.auth.getUser();
  if (!user) {
    alert("Please login first");
    window.location.href = "login.html";
    return;
  }

  const title = document.getElementById("title").value.trim();
  const category = document.getElementById("category").value;
  const file = document.getElementById("imageFile").files[0];
  const amazon = document.getElementById("amazon").value.trim();
  const flipkart = document.getElementById("flipkart").value.trim();
  const meesho = document.getElementById("meesho").value.trim();

  if(!title || !category) {
    alert("Please fill Title and Category (required)");
    return;
  }

  let imageUrl = currentImageUrl;
  
  if(file) {
    try {
      document.getElementById("publishBtn").disabled = true;
      document.getElementById("publishBtn").textContent = "Uploading Image...";
      imageUrl = await uploadImage(file);
    } catch(error) {
      alert("Error uploading image: " + error.message);
      document.getElementById("publishBtn").disabled = false;
      document.getElementById("publishBtn").textContent = editingProductId ? "Update Product" : "Publish Product";
      return;
    }
  } else if(!editingProductId) {
    alert("Please select an image for new product");
    document.getElementById("publishBtn").disabled = false;
    return;
  }

  try {
    document.getElementById("publishBtn").disabled = true;
    document.getElementById("publishBtn").textContent = editingProductId ? "Updating..." : "Publishing...";
    
    const productData = {
      title,
      category,
      thumbnail: imageUrl,
      amazon_link: amazon || null,
      flipkart_link: flipkart || null,
      meesho_link: meesho || null
    };
    
    if(editingProductId) {
      await supabaseClient.from("products").update(productData).eq("id", editingProductId);
      alert("✅ Product Updated Successfully!");
    } else {
      await supabaseClient.from("products").insert([{
        ...productData,
        clicks: 0,
        amazon_clicks: 0,
        flipkart_clicks: 0,
        meesho_clicks: 0
      }]);
      alert("✅ Product Published Successfully!");
    }
    
    resetForm();
    loadProductsList();
  } catch(error) {
    alert("Error: " + error.message);
  } finally {
    document.getElementById("publishBtn").disabled = false;
    document.getElementById("publishBtn").textContent = editingProductId ? "Update Product" : "Publish Product";
  }
}

function resetForm() {
  document.getElementById("title").value = "";
  document.getElementById("category").value = "";
  document.getElementById("imageFile").value = "";
  document.getElementById("amazon").value = "";
  document.getElementById("flipkart").value = "";
  document.getElementById("meesho").value = "";
  
  const preview = document.getElementById("imagePreview");
  if(preview) preview.remove();
  
  document.getElementById("imageFile").required = true;
  editingProductId = null;
  currentImageUrl = null;
  document.getElementById("publishBtn").textContent = "🚀 Publish Product";
  document.getElementById("formTitle").textContent = "📝 Add New Product";
}

async function loadProductsList() {
  const { data: products, error } = await supabaseClient.from("products").select("*").order('created_at', { ascending: false });
  
  if(error) {
    console.error(error);
    return;
  }
  
  const listDiv = document.getElementById("productsList");
  if(!products || products.length === 0) {
    listDiv.innerHTML = '<p style="text-align:center; padding:20px;">No products yet. Create your first product above! 🚀</p>';
    return;
  }
  
  listDiv.innerHTML = '<h3 style="margin-top:30px;">📦 Your Products</h3>';
  
  products.forEach(product => {
    // Platform clicks data
    const amazonClicks = product.amazon_clicks || 0;
    const flipkartClicks = product.flipkart_clicks || 0;
    const meeshoClicks = product.meesho_clicks || 0;
    const totalClicks = product.clicks || 0;
    
    listDiv.innerHTML += `
      <div class="product-item">
        <img src="${product.thumbnail}" alt="${product.title}" style="width:60px;height:60px;object-fit:cover;border-radius:8px;">
        <div class="product-info">
          <h4 style="margin:0;">${escapeHtml(product.title)}</h4>
          <p style="font-size:12px; color:#667eea; margin:5px 0 0;">
            📊 Total Views: <strong>${totalClicks}</strong>
          </p>
          <div style="display:flex; gap:15px; margin-top:5px; flex-wrap:wrap; font-size:11px;">
            ${product.amazon_link ? `<span style="background:#ff9900; color:white; padding:2px 10px; border-radius:10px;">🛒 Amazon: ${amazonClicks}</span>` : ''}
            ${product.flipkart_link ? `<span style="background:#2874f0; color:white; padding:2px 10px; border-radius:10px;">🛍️ Flipkart: ${flipkartClicks}</span>` : ''}
            ${product.meesho_link ? `<span style="background:#e91e63; color:white; padding:2px 10px; border-radius:10px;">✨ Meesho: ${meeshoClicks}</span>` : ''}
          </div>
        </div>
        <div class="product-actions">
          <button class="edit-btn" onclick="editProduct(${product.id})">✏️ Edit</button>
          <button class="delete-btn" onclick="deleteProduct(${product.id})">🗑️ Delete</button>
        </div>
      </div>
    `;
  });
}

function escapeHtml(str) {
  if(!str) return '';
  return str.replace(/[&<>]/g, function(m) {
    if(m === '&') return '&amp;';
    if(m === '<') return '&lt;';
    if(m === '>') return '&gt;';
    return m;
  });
}

async function editProduct(id) {
  const { data: product, error } = await supabaseClient.from("products").select("*").eq("id", id).single();
  
  if(error) {
    alert("Error loading product");
    return;
  }
  
  editingProductId = id;
  currentImageUrl = product.thumbnail;
  
  document.getElementById("title").value = product.title;
  document.getElementById("category").value = product.category;
  document.getElementById("amazon").value = product.amazon_link || "";
  document.getElementById("flipkart").value = product.flipkart_link || "";
  document.getElementById("meesho").value = product.meesho_link || "";
  
  document.getElementById("publishBtn").textContent = "✏️ Update Product";
  document.getElementById("formTitle").textContent = "✏️ Edit Product";
  
  showImagePreview(product.thumbnail);
  document.getElementById("imageFile").required = false;
  document.getElementById("imageFile").value = "";
  
  document.querySelector(".admin-container").scrollIntoView({ behavior: 'smooth' });
}

function showImagePreview(imageUrl) {
  const existingPreview = document.getElementById("imagePreview");
  if(existingPreview) existingPreview.remove();
  
  const container = document.createElement("div");
  container.id = "imagePreview";
  container.style.cssText = `
    margin: 10px 0;
    padding: 15px;
    background: #f8f9fa;
    border-radius: 10px;
    text-align: center;
    position: relative;
  `;
  
  if(document.body.classList.contains('dark')) {
    container.style.background = '#2a2a35';
  }
  
  container.innerHTML = `
    <p style="font-size:14px; margin-bottom:10px; color:#666;">📸 Current Image</p>
    <img src="${imageUrl}" alt="Current product image" 
         style="max-width:200px; max-height:200px; border-radius:10px; border:2px solid #667eea;">
    <p style="font-size:12px; margin-top:10px; color:#999;">
      💡 Upload a new image to replace this one (optional)
    </p>
  `;
  
  const fileInput = document.getElementById("imageFile");
  fileInput.parentNode.insertBefore(container, fileInput);
}

async function deleteProduct(id) {
  if(!confirm("Are you sure you want to delete this product? This action cannot be undone!")) {
    return;
  }
  
  const { error } = await supabaseClient.from("products").delete().eq("id", id);
  
  if(error) {
    alert("Error deleting product: " + error.message);
  } else {
    alert("✅ Product deleted successfully!");
    loadProductsList();
    
    if(editingProductId === id) {
      resetForm();
    }
  }
}

// Theme toggle functions
function initTheme() {
  const savedTheme = localStorage.getItem('theme');
  if(savedTheme === 'dark') {
    document.body.classList.add('dark');
  }
}

function toggleTheme() {
  document.body.classList.toggle('dark');
  const isDark = document.body.classList.contains('dark');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
  
  const preview = document.getElementById("imagePreview");
  if(preview) {
    if(isDark) {
      preview.style.background = '#2a2a35';
    } else {
      preview.style.background = '#f8f9fa';
    }
  }
}

// Initialize
checkAuth();
loadProductsList();
initTheme();