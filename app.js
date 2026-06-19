let allProducts = [];
let currentCategory = 'all';

async function loadProducts() {
  const productsDiv = document.getElementById("products");
  productsDiv.innerHTML = '<div class="loading"><div class="spinner"></div><p>Loading products...</p></div>';
  
  let { data, error } = await supabaseClient.from("products").select("*").order('clicks', { ascending: false });
  
  if(error) {
    console.error(error);
    productsDiv.innerHTML = '<p>Error loading products</p>';
    return;
  }
  
  allProducts = data;
  display(allProducts);
}

function display(products) {
  let box = document.getElementById("products");
  
  if(!products || products.length === 0) {
    box.innerHTML = '<p style="text-align:center; padding:40px;">No products found 😢</p>';
    return;
  }
  
  box.innerHTML = "";
  
  products.forEach(p => {
    const views = p.clicks || 0;
    const viewsText = views === 1 ? 'view' : 'views';
    
    box.innerHTML += `
      <div class="card">
        <img src="${p.thumbnail}" alt="${p.title}" loading="lazy">
        <h3>${escapeHtml(p.title)}</h3>
        <span class="views-badge">👁️ ${views} ${viewsText}</span>
        <div class="product-buttons">
          ${p.amazon_link ? `<button onclick="trackClick(${p.id}, '${escapeHtml(p.amazon_link)}', 'amazon')" class="btn amazon">🛒 Amazon</button>` : ""}
          ${p.flipkart_link ? `<button onclick="trackClick(${p.id}, '${escapeHtml(p.flipkart_link)}', 'flipkart')" class="btn flipkart">🛍️ Flipkart</button>` : ""}
          ${p.meesho_link ? `<button onclick="trackClick(${p.id}, '${escapeHtml(p.meesho_link)}', 'meesho')" class="btn meesho">✨ Meesho</button>` : ""}
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

async function trackClick(id, link, platform) {
  try {
    // Update platform-specific clicks
    let updateData = {};
    if(platform === 'amazon') {
      updateData = { amazon_clicks: supabaseClient.rpc('increment_amazon_clicks', { product_id: id }) };
    } else if(platform === 'flipkart') {
      updateData = { flipkart_clicks: supabaseClient.rpc('increment_flipkart_clicks', { product_id: id }) };
    } else if(platform === 'meesho') {
      updateData = { meesho_clicks: supabaseClient.rpc('increment_meesho_clicks', { product_id: id }) };
    }
    
    // Also increment total clicks
    await supabaseClient.rpc("increment_clicks", {
      product_id: id
    });
    
    // Update local display
    const product = allProducts.find(p => p.id === id);
    if(product) {
      product.clicks = (product.clicks || 0) + 1;
      if(platform === 'amazon') product.amazon_clicks = (product.amazon_clicks || 0) + 1;
      if(platform === 'flipkart') product.flipkart_clicks = (product.flipkart_clicks || 0) + 1;
      if(platform === 'meesho') product.meesho_clicks = (product.meesho_clicks || 0) + 1;
      display(currentCategory === 'all' ? allProducts : allProducts.filter(p => p.category === currentCategory));
    }
  } catch(e) {
    console.error("Error tracking click:", e);
  }
  
  window.open(link, "_blank");
}

document.getElementById("search")?.addEventListener("input", e => {
  let val = e.target.value.toLowerCase();
  let filtered = allProducts.filter(p => p.title.toLowerCase().includes(val));
  display(filtered);
});

function filterCat(cat) {
  currentCategory = cat;
  
  document.querySelectorAll('.cats button').forEach(btn => {
    btn.classList.remove('active');
    if(btn.textContent.toLowerCase() === cat || (cat === 'all' && btn.textContent === 'All')) {
      btn.classList.add('active');
    }
  });
  
  if(cat === "all") {
    display(allProducts);
  } else {
    display(allProducts.filter(p => p.category === cat));
  }
}

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
}

loadProducts();
initTheme();