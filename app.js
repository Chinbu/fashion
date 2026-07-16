let allProducts = [];
let currentCategory = 'all';
let isInitialLoad = true;

async function loadProducts() {
  const productsDiv = document.getElementById("products");
  productsDiv.innerHTML = '<div class="loading"><div class="spinner"></div><p>Loading products...</p></div>';
  
  let { data, error } = await supabaseClient.from("products").select("*").order('clicks', { ascending: false });
  
  if(error) {
    console.error(error);
    productsDiv.innerHTML = '<p>Error loading products</p>';
    return;
  }
  
  console.log("Products loaded:", data);
  allProducts = data;
  
  // Check if returning from folder page
  const returnToFolder = sessionStorage.getItem('returnToFolder');
  if (returnToFolder) {
    sessionStorage.removeItem('returnToFolder');
    // Wait for display to complete then scroll to folder
    display(allProducts);
    setTimeout(() => {
      scrollToFolder(returnToFolder);
    }, 300);
  } else {
    display(allProducts);
  }
  
  isInitialLoad = false;
}

function scrollToFolder(folderId) {
  // Find the folder card and scroll to it
  const cards = document.querySelectorAll('.card.folder-card');
  for (let card of cards) {
    const button = card.querySelector('button[onclick*="openFolderPage"]');
    if (button) {
      const onclickAttr = button.getAttribute('onclick');
      if (onclickAttr && onclickAttr.includes(folderId)) {
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Highlight the folder card
        card.style.transition = 'all 0.3s ease';
        card.style.boxShadow = '0 0 0 3px #667eea, 0 8px 30px rgba(102,126,234,0.4)';
        setTimeout(() => {
          card.style.boxShadow = '';
        }, 3000);
        break;
      }
    }
  }
}

function getPlatformColor(platform) {
  const colors = {
    'Amazon': '#ff9900',
    'Flipkart': '#2874f0',
    'Meesho': '#e91e63',
    'Myntra': '#e62e4a',
    'Shopsy': '#ff6b35',
    'Ajio': '#ff9900',
    'Nykaa': '#f15a6c',
    'Tata Cliq': '#4a8bff',
    'Other': '#667eea'
  };
  return colors[platform] || '#667eea';
}

function getPlatformIcon(platform) {
  const icons = {
    'Amazon': '🛒',
    'Flipkart': '🛍️',
    'Meesho': '✨',
    'Myntra': '👗',
    'Shopsy': '🛍️',
    'Ajio': '👕',
    'Nykaa': '💄',
    'Tata Cliq': '🛒',
    'Other': '🔗'
  };
  return icons[platform] || '🔗';
}

function detectPlatformFromUrl(url) {
  if (!url) return 'Other';
  const platforms = {
    'amazon': 'Amazon',
    'flipkart': 'Flipkart',
    'meesho': 'Meesho',
    'myntra': 'Myntra',
    'shopsy': 'Shopsy',
    'ajio': 'Ajio',
    'nykaa': 'Nykaa',
    'tatacliq': 'Tata Cliq'
  };
  
  url = url.toLowerCase();
  for (const [key, value] of Object.entries(platforms)) {
    if (url.includes(key)) {
      return value;
    }
  }
  return 'Other';
}

function display(products) {
  let box = document.getElementById("products");
  
  if(!products || products.length === 0) {
    box.innerHTML = '<p style="text-align:center; padding:40px;">No products found 😢</p>';
    return;
  }
  
  box.innerHTML = "";
  
  products.forEach(p => {
    const isFolder = p.product_type === 'folder';
    const folderProducts = p.folder_products || [];
    
    // Get links - support both old and new format
    let links = p.links || [];
    if (links.length === 0 && !isFolder) {
      const oldLinks = [];
      if (p.amazon_link) oldLinks.push({ url: p.amazon_link, platform: 'Amazon' });
      if (p.flipkart_link) oldLinks.push({ url: p.flipkart_link, platform: 'Flipkart' });
      if (p.meesho_link) oldLinks.push({ url: p.meesho_link, platform: 'Meesho' });
      if (oldLinks.length > 0) links = oldLinks;
    }
    
    if (isFolder) {
      // Display as folder card - NO VIEWS on public site
      box.innerHTML += `
        <div class="card folder-card" data-folder-id="${p.id}">
          <img src="${p.thumbnail}" alt="${p.title}" loading="lazy">
          <h3>📁 ${escapeHtml(p.title)}</h3>
          <p style="color: #667eea; font-size: 13px; padding: 0 15px; margin: 5px 0;">📂 ${folderProducts.length} products inside</p>
          <div style="padding: 10px 15px 15px; display: flex; gap: 10px; flex-wrap: wrap; justify-content: center;">
            <button onclick="openFolderPage('${p.id}')" style="background: #667eea; color: white; border: none; padding: 10px 30px; border-radius: 8px; cursor: pointer; font-weight: 600; transition: transform 0.2s;">📂 Open Folder</button>
          </div>
        </div>
      `;
    } else {
      // Display as single product card - NO VIEWS on public site
      box.innerHTML += `
        <div class="card">
          <img src="${p.thumbnail}" alt="${p.title}" loading="lazy">
          <h3>${escapeHtml(p.title)}</h3>
          <div class="product-buttons">
            ${links.map(link => {
              const platform = link.platform || detectPlatformFromUrl(link.url) || 'Other';
              const platformKey = platform.toLowerCase();
              return `<button onclick="trackClick('${p.id}', '${escapeHtml(link.url)}', '${platformKey}')" 
                       class="btn ${platformKey}" 
                       style="background: ${getPlatformColor(platform)};">
                ${getPlatformIcon(platform)} ${platform}
              </button>`;
            }).join('')}
          </div>
        </div>
      `;
    }
  });
}

// Open folder in new page
function openFolderPage(folderId) {
  console.log("Opening folder page with ID:", folderId);
  
  // Store folder ID in localStorage
  localStorage.setItem('folderToOpen', folderId);
  
  // Store current category and scroll position
  sessionStorage.setItem('currentCategory', currentCategory);
  sessionStorage.setItem('scrollPosition', window.scrollY);
  
  // Open new page
  window.open('folder.html', '_blank');
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
    // Increment total clicks using Supabase RPC
    await supabaseClient.rpc("increment_clicks", {
      product_id: id
    });
    
    // Update local data
    const product = allProducts.find(p => p.id === id);
    if(product) {
      product.clicks = (product.clicks || 0) + 1;
      display(currentCategory === 'all' ? allProducts : allProducts.filter(p => p.category === currentCategory));
    }
  } catch(e) {
    console.error("Error tracking click:", e);
  }
  
  // Open link in new tab
  window.open(link, "_blank");
}

// Search functionality
document.getElementById("search")?.addEventListener("input", e => {
  let val = e.target.value.toLowerCase();
  let filtered = allProducts.filter(p => p.title.toLowerCase().includes(val));
  display(filtered);
});

// Category filter
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

// Theme functions
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

// Check if returning from folder page
function checkReturnFromFolder() {
  const returnToFolder = sessionStorage.getItem('returnToFolder');
  if (returnToFolder) {
    // Restore category
    const savedCategory = sessionStorage.getItem('currentCategory');
    if (savedCategory) {
      currentCategory = savedCategory;
      // Update active category button
      document.querySelectorAll('.cats button').forEach(btn => {
        btn.classList.remove('active');
        if(btn.textContent.toLowerCase() === savedCategory || (savedCategory === 'all' && btn.textContent === 'All')) {
          btn.classList.add('active');
        }
      });
    }
    return true;
  }
  return false;
}

// Load products when page loads
document.addEventListener('DOMContentLoaded', function() {
  // Check if we're returning from folder
  const isReturning = checkReturnFromFolder();
  
  if (isReturning) {
    // Products will be loaded and scrolled in loadProducts
    loadProducts();
  } else {
    loadProducts();
  }
  
  initTheme();
});

// Handle visibility change (when user comes back to tab)
document.addEventListener('visibilitychange', function() {
  if (!document.hidden) {
    // Check if returning from folder
    const returnToFolder = sessionStorage.getItem('returnToFolder');
    if (returnToFolder) {
      // Products will be reloaded and scrolled
      loadProducts();
    }
  }
});