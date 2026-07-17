let allProducts = [];
let currentCategory = 'all';
let isLoading = false;

async function loadProducts() {
  if (isLoading) return;
  isLoading = true;
  
  const productsDiv = document.getElementById("products");
  productsDiv.innerHTML = '<div class="loading"><div class="spinner"></div><p>Loading products...</p></div>';
  
  try {
    const cachedData = sessionStorage.getItem('productsCache');
    const cacheTime = sessionStorage.getItem('productsCacheTime');
    const now = Date.now();
    
    if (cachedData && cacheTime && (now - parseInt(cacheTime) < 300000)) {
      allProducts = JSON.parse(cachedData);
      displayOptimized(allProducts);
      isLoading = false;
      
      // Check if returning from folder and scroll
      const returnToFolder = sessionStorage.getItem('returnToFolder');
      if (returnToFolder) {
        setTimeout(() => {
          scrollToFolder(returnToFolder);
          sessionStorage.removeItem('returnToFolder');
        }, 500);
      }
      
      refreshProductsInBackground();
      return;
    }
    
    let { data, error } = await supabaseClient
      .from("products")
      .select("*")
      .order('clicks', { ascending: false })
      .limit(50);
    
    if(error) throw error;
    
    sessionStorage.setItem('productsCache', JSON.stringify(data));
    sessionStorage.setItem('productsCacheTime', String(now));
    
    allProducts = data;
    
    const returnToFolder = sessionStorage.getItem('returnToFolder');
    if (returnToFolder) {
      displayOptimized(allProducts);
      setTimeout(() => {
        scrollToFolder(returnToFolder);
        sessionStorage.removeItem('returnToFolder');
      }, 500);
    } else {
      displayOptimized(allProducts);
    }
    
  } catch(error) {
    console.error("Error loading products:", error);
    productsDiv.innerHTML = '<p style="text-align:center; padding:40px;">Error loading products. Please refresh.</p>';
  } finally {
    isLoading = false;
  }
}

async function refreshProductsInBackground() {
  try {
    let { data, error } = await supabaseClient
      .from("products")
      .select("*")
      .order('clicks', { ascending: false })
      .limit(50);
      
    if (!error && data) {
      sessionStorage.setItem('productsCache', JSON.stringify(data));
      sessionStorage.setItem('productsCacheTime', String(Date.now()));
    }
  } catch(e) {
    console.log("Background refresh failed:", e);
  }
}

function displayOptimized(products) {
  let box = document.getElementById("products");
  
  if(!products || products.length === 0) {
    box.innerHTML = '<p style="text-align:center; padding:40px;">No products found</p>';
    return;
  }
  
  const fragment = document.createDocumentFragment();
  
  products.forEach((p, index) => {
    const isFolder = p.product_type === 'folder';
    const folderProducts = p.folder_products || [];
    
    let links = p.links || [];
    if (links.length === 0 && !isFolder) {
      const oldLinkFields = ['amazon_link', 'flipkart_link', 'meesho_link', 'myntra_link', 'shopsy_link', 
                             'ajio_link', 'nykaa_link', 'tatacliq_link', 'snapdeal_link', 'paytm_link',
                             'shopclues_link', 'limeroad_link', 'croma_link', 'reliance_link', 'pepperfry_link',
                             'urbanladder_link', 'firstcry_link', 'babychakra_link'];
      
      oldLinkFields.forEach(field => {
        if (p[field]) {
          const platformName = field.replace('_link', '').charAt(0).toUpperCase() + field.replace('_link', '').slice(1);
          links.push({ url: p[field], platform: platformName });
        }
      });
    }
    
    const card = document.createElement('div');
    card.className = `card ${isFolder ? 'folder-card' : ''}`;
    if (isFolder) {
      card.setAttribute('data-folder-id', p.id);
    }
    
    const imgSrc = p.thumbnail || '';
    const imgAlt = escapeHtml(p.title);
    const imgPlaceholder = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300"%3E%3Crect width="300" height="300" fill="%23f0f0f0"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" font-size="40" fill="%23999"%3E📷%3C/text%3E%3C/svg%3E';
    
    let cardHTML = `
      <img src="${imgPlaceholder}" 
           data-src="${imgSrc}" 
           alt="${imgAlt}" 
           loading="lazy"
           class="lazy-image"
           onerror="this.classList.add('error'); this.src='${imgPlaceholder}'">
      <h3>${isFolder ? '📁 ' : ''}${escapeHtml(p.title)}</h3>
    `;
    
    if (isFolder) {
      cardHTML += `
        <p style="color: #667eea; font-size: 13px; padding: 0 15px; margin: 5px 0;">📂 ${folderProducts.length} products inside</p>
        <div style="padding: 10px 15px 15px; display: flex; gap: 10px; flex-wrap: wrap; justify-content: center;">
          <button onclick="openFolderPage('${p.id}')" style="background: #667eea; color: white; border: none; padding: 10px 30px; border-radius: 8px; cursor: pointer; font-weight: 600; transition: transform 0.2s;">📂 Open Folder</button>
        </div>
      `;
    } else {
      let buttonsHTML = links.map(link => {
        const info = detectPlatformFromUrlAdvanced(link.url);
        const platformKey = info.name.toLowerCase().replace(/ /g, '');
        return `<button onclick="trackClick('${p.id}', '${escapeHtml(link.url)}', '${platformKey}')" 
                 class="btn ${platformKey}" 
                 style="background: ${info.color};">
          ${info.icon} ${info.name}
        </button>`;
      }).join('');
      
      cardHTML += `
        <div class="product-buttons">
          ${buttonsHTML}
        </div>
      `;
    }
    
    card.innerHTML = cardHTML;
    card.style.animationDelay = `${(index % 10) * 0.05}s`;
    card.style.opacity = '0';
    card.style.animation = 'fadeIn 0.4s ease forwards';
    card.style.animationDelay = `${(index % 10) * 0.05}s`;
    
    fragment.appendChild(card);
  });
  
  box.innerHTML = '';
  box.appendChild(fragment);
  
  initLazyLoading();
}

function initLazyLoading() {
  if ('IntersectionObserver' in window) {
    const lazyImages = document.querySelectorAll('img.lazy-image');
    
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          const src = img.getAttribute('data-src');
          if (src && !img.classList.contains('loaded')) {
            img.src = src;
            img.onload = function() {
              this.classList.add('loaded');
            };
            img.onerror = function() {
              this.classList.add('error');
            };
          }
          imageObserver.unobserve(img);
        }
      });
    }, {
      rootMargin: '50px 0px',
      threshold: 0.01
    });
    
    lazyImages.forEach(img => {
      imageObserver.observe(img);
    });
  } else {
    document.querySelectorAll('img.lazy-image').forEach(img => {
      const src = img.getAttribute('data-src');
      if (src) {
        img.src = src;
        img.classList.add('loaded');
      }
    });
  }
}

const platformCache = new Map();

function detectPlatformFromUrlAdvanced(url) {
    if (!url) {
        return { name: 'Other', icon: '🔗', color: '#667eea', dbKey: null };
    }
    
    if (platformCache.has(url)) {
        return platformCache.get(url);
    }
    
    const urlLower = url.toLowerCase();
    
    const platformPatterns = [
        { patterns: ['amazon', 'amzn', 'amzn.in', 'amazon.in', 'amazon.com', 'amzn.to'], name: 'Amazon', icon: '🛒', color: '#ff9900', dbKey: 'amazon_link' },
        { patterns: ['flipkart', 'fktr.in', 'fkrt', 'flipkart.com', 'fktr'], name: 'Flipkart', icon: '🛍️', color: '#2874f0', dbKey: 'flipkart_link' },
        { patterns: ['meesho', 'meesho.com', 'meesho.in'], name: 'Meesho', icon: '✨', color: '#e91e63', dbKey: 'meesho_link' },
        { patterns: ['myntra', 'myntr.it', 'myntra.com', 'myntr'], name: 'Myntra', icon: '👗', color: '#e62e4a', dbKey: 'myntra_link' },
        { patterns: ['shopsy', 'shopsy.in', 'bitli.in'], name: 'Shopsy', icon: '🛍️', color: '#ff6b35', dbKey: 'shopsy_link' },
        { patterns: ['ajio', 'ajio.com', 'ajio.in'], name: 'Ajio', icon: '👕', color: '#ff9900', dbKey: 'ajio_link' },
        { patterns: ['nykaa', 'nykaa.com', 'nykaa.in'], name: 'Nykaa', icon: '💄', color: '#f15a6c', dbKey: 'nykaa_link' },
        { patterns: ['tatacliq', 'tata cliq', 'tatacliq.com'], name: 'Tata Cliq', icon: '🛒', color: '#4a8bff', dbKey: 'tatacliq_link' },
        { patterns: ['snapdeal', 'snapdeal.com', 'snapdeal.in'], name: 'Snapdeal', icon: '🛒', color: '#ff6600', dbKey: 'snapdeal_link' },
        { patterns: ['paytm', 'paytmmall', 'paytm.com', 'paytmmall.com'], name: 'Paytm Mall', icon: '🛍️', color: '#00baf2', dbKey: 'paytm_link' },
        { patterns: ['shopclues', 'shopclues.com', 'shopclues.in'], name: 'ShopClues', icon: '🛒', color: '#f36f21', dbKey: 'shopclues_link' },
        { patterns: ['limeroad', 'limeroad.com', 'limeroad.in'], name: 'Limeroad', icon: '👗', color: '#ff0066', dbKey: 'limeroad_link' },
        { patterns: ['croma', 'croma.com', 'croma.in'], name: 'Croma', icon: '🛒', color: '#e31837', dbKey: 'croma_link' },
        { patterns: ['reliance', 'reliance digital', 'reliance.com'], name: 'Reliance', icon: '🛍️', color: '#1a8f5e', dbKey: 'reliance_link' },
        { patterns: ['pepperfry', 'pepperfry.com', 'pepperfry.in'], name: 'Pepperfry', icon: '🛋️', color: '#ff6b00', dbKey: 'pepperfry_link' },
        { patterns: ['urbanladder', 'urban ladder', 'urbanladder.com'], name: 'Urban Ladder', icon: '🛋️', color: '#1a8f5e', dbKey: 'urbanladder_link' },
        { patterns: ['firstcry', 'firstcry.com', 'firstcry.in'], name: 'FirstCry', icon: '🧸', color: '#ff6b6b', dbKey: 'firstcry_link' },
        { patterns: ['babychakra', 'baby chakra', 'babychakra.com'], name: 'BabyChakra', icon: '🧸', color: '#ff6b9d', dbKey: 'babychakra_link' }
    ];
    
    let result = { name: 'Other', icon: '🔗', color: '#667eea', dbKey: null };
    
    for (const platform of platformPatterns) {
        for (const pattern of platform.patterns) {
            if (urlLower.includes(pattern)) {
                result = platform;
                break;
            }
        }
        if (result.dbKey) break;
    }
    
    platformCache.set(url, result);
    return result;
}

function detectPlatformFromUrl(url) {
    if (!url) return 'Other';
    return detectPlatformFromUrlAdvanced(url).name;
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
        'Snapdeal': '#ff6600',
        'Paytm Mall': '#00baf2',
        'ShopClues': '#f36f21',
        'Limeroad': '#ff0066',
        'Croma': '#e31837',
        'Reliance': '#1a8f5e',
        'Pepperfry': '#ff6b00',
        'Urban Ladder': '#1a8f5e',
        'FirstCry': '#ff6b6b',
        'BabyChakra': '#ff6b9d',
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
        'Snapdeal': '🛒',
        'Paytm Mall': '🛍️',
        'ShopClues': '🛒',
        'Limeroad': '👗',
        'Croma': '🛒',
        'Reliance': '🛍️',
        'Pepperfry': '🛋️',
        'Urban Ladder': '🛋️',
        'FirstCry': '🧸',
        'BabyChakra': '🧸',
        'Other': '🔗'
    };
    return icons[platform] || '🔗';
}

// ============ Scroll to Folder with Highlight ============
function scrollToFolder(folderId) {
  console.log("Scrolling to folder:", folderId);
  
  // Find all folder cards
  const cards = document.querySelectorAll('.card.folder-card');
  let found = false;
  
  for (let card of cards) {
    const folderIdAttr = card.getAttribute('data-folder-id');
    if (folderIdAttr === folderId) {
      found = true;
      console.log("Found folder card, scrolling...");
      
      // Smooth scroll to card
      card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      // Highlight effect with animation
      card.style.transition = 'all 0.8s ease';
      card.style.boxShadow = '0 0 0 4px #667eea, 0 8px 40px rgba(102,126,234,0.6)';
      card.style.transform = 'scale(1.03)';
      card.style.borderColor = '#667eea';
      card.style.borderWidth = '3px';
      
      // Flash effect
      let flashCount = 0;
      const flashInterval = setInterval(() => {
        if (flashCount % 2 === 0) {
          card.style.backgroundColor = 'rgba(102,126,234,0.15)';
        } else {
          card.style.backgroundColor = '';
        }
        flashCount++;
        if (flashCount > 5) {
          clearInterval(flashInterval);
          card.style.backgroundColor = '';
        }
      }, 300);
      
      // Reset after 4 seconds
      setTimeout(() => {
        card.style.boxShadow = '';
        card.style.transform = '';
        card.style.borderColor = '';
        card.style.borderWidth = '';
      }, 4000);
      
      break;
    }
  }
  
  if (!found) {
    console.log("Folder card not found, trying again after delay...");
    // Try again after a short delay (for cases where cards haven't rendered yet)
    setTimeout(() => {
      const cardsRetry = document.querySelectorAll('.card.folder-card');
      for (let card of cardsRetry) {
        const folderIdAttr = card.getAttribute('data-folder-id');
        if (folderIdAttr === folderId) {
          console.log("Found folder card on retry, scrolling...");
          card.scrollIntoView({ behavior: 'smooth', block: 'center' });
          
          card.style.transition = 'all 0.8s ease';
          card.style.boxShadow = '0 0 0 4px #667eea, 0 8px 40px rgba(102,126,234,0.6)';
          card.style.transform = 'scale(1.03)';
          card.style.borderColor = '#667eea';
          card.style.borderWidth = '3px';
          
          let flashCount = 0;
          const flashInterval = setInterval(() => {
            if (flashCount % 2 === 0) {
              card.style.backgroundColor = 'rgba(102,126,234,0.15)';
            } else {
              card.style.backgroundColor = '';
            }
            flashCount++;
            if (flashCount > 5) {
              clearInterval(flashInterval);
              card.style.backgroundColor = '';
            }
          }, 300);
          
          setTimeout(() => {
            card.style.boxShadow = '';
            card.style.transform = '';
            card.style.borderColor = '';
            card.style.borderWidth = '';
          }, 4000);
          
          break;
        }
      }
    }, 1000);
  }
}

function openFolderPage(folderId) {
  console.log("Opening folder with ID:", folderId);
  
  // Store folder ID in both localStorage and sessionStorage
  localStorage.setItem('folderToOpen', folderId);
  sessionStorage.setItem('folderToOpen', folderId);
  
  // Store current category
  sessionStorage.setItem('currentCategory', currentCategory);
  
  // Store return folder ID for scrolling back
  sessionStorage.setItem('returnToFolder', folderId);
  
  window.location.href = 'folder.html';
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
    await supabaseClient.rpc("increment_clicks", {
      product_id: id
    });
    
    const product = allProducts.find(p => p.id === id);
    if(product) {
      product.clicks = (product.clicks || 0) + 1;
      displayOptimized(currentCategory === 'all' ? allProducts : allProducts.filter(p => p.category === currentCategory));
    }
  } catch(e) {
    console.error("Error tracking click:", e);
  }
  
  window.open(link, "_blank");
}

let searchTimeout;

document.getElementById("search")?.addEventListener("input", e => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    let val = e.target.value.toLowerCase();
    let filtered = allProducts.filter(p => p.title.toLowerCase().includes(val));
    displayOptimized(filtered);
  }, 300);
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
    displayOptimized(allProducts);
  } else {
    displayOptimized(allProducts.filter(p => p.category === cat));
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

function checkReturnFromFolder() {
  const returnToFolder = sessionStorage.getItem('returnToFolder');
  if (returnToFolder) {
    const savedCategory = sessionStorage.getItem('currentCategory');
    if (savedCategory) {
      currentCategory = savedCategory;
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

document.addEventListener('DOMContentLoaded', function() {
  checkReturnFromFolder();
  loadProducts();
  initTheme();
});

document.addEventListener('visibilitychange', function() {
  if (!document.hidden) {
    const returnToFolder = sessionStorage.getItem('returnToFolder');
    if (returnToFolder) {
      loadProducts();
    }
  }
});