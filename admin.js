const IMGBB_API_1 = "d5b5d8ca4f3a3c0a1e2248d121111692";
const IMGBB_API_2 = "122af555b20f19576ccc38e1719a0e4f";

let editingProductId = null;
let currentImageUrl = null;
let linkCounter = 1;
let folderLinkCounter = 1;
let folderProducts = [];
let editingFolderIndex = -1;
let isEditingFolderProduct = false;

// ============ Advanced Platform Detection Functions ============
function detectPlatform(input) {
    const url = input.value;
    const badge = input.parentElement.querySelector('.platform-badge');
    updatePlatformBadge(badge, url);
}

function detectFolderPlatform(input) {
    const url = input.value;
    const badge = input.parentElement.querySelector('.platform-badge');
    updatePlatformBadge(badge, url);
}

function updatePlatformBadge(badge, url) {
    const platformInfo = detectPlatformFromUrlAdvanced(url);
    
    badge.textContent = platformInfo.icon + ' ' + platformInfo.name;
    badge.style.background = platformInfo.color;
    badge.style.color = 'white';
    badge.style.padding = '4px 12px';
    badge.style.borderRadius = '20px';
    badge.style.fontSize = '12px';
    badge.style.fontWeight = '600';
    badge.style.whiteSpace = 'nowrap';
}

function detectPlatformFromUrlAdvanced(url) {
    if (!url) {
        return { name: 'Auto-Detect', icon: '🏷️', color: '#666' };
    }
    
    const urlLower = url.toLowerCase();
    
    // Platform detection patterns - includes short links and affiliate links
    const platformPatterns = [
        // Amazon (including amzn, amazon.in, amazon.com, etc.)
        { 
            patterns: ['amazon', 'amzn', 'amzn.in', 'amazon.in', 'amazon.com', 'amzn.to'],
            name: 'Amazon', 
            icon: '🛒', 
            color: '#ff9900' 
        },
        // Flipkart (including fktr.in, flipkart.com, etc.)
        { 
            patterns: ['flipkart', 'fktr.in', 'fkrt', 'flipkart.com', 'fktr'],
            name: 'Flipkart', 
            icon: '🛍️', 
            color: '#2874f0' 
        },
        // Meesho (including meesho.com, meesho.in, etc.)
        { 
            patterns: ['meesho', 'meesho.com', 'meesho.in'],
            name: 'Meesho', 
            icon: '✨', 
            color: '#e91e63' 
        },
        // Myntra (including myntr.it, myntra.com, etc.)
        { 
            patterns: ['myntra', 'myntr.it', 'myntra.com', 'myntr'],
            name: 'Myntra', 
            icon: '👗', 
            color: '#e62e4a' 
        },
        // Shopsy (including shopsy.in, bitli.in (shopsy affiliate), etc.)
        { 
            patterns: ['shopsy', 'shopsy.in', 'bitli.in'],
            name: 'Shopsy', 
            icon: '🛍️', 
            color: '#ff6b35' 
        },
        // Ajio
        { 
            patterns: ['ajio', 'ajio.com', 'ajio.in'],
            name: 'Ajio', 
            icon: '👕', 
            color: '#ff9900' 
        },
        // Nykaa
        { 
            patterns: ['nykaa', 'nykaa.com', 'nykaa.in'],
            name: 'Nykaa', 
            icon: '💄', 
            color: '#f15a6c' 
        },
        // Tata Cliq
        { 
            patterns: ['tatacliq', 'tata cliq', 'tatacliq.com'],
            name: 'Tata Cliq', 
            icon: '🛒', 
            color: '#4a8bff' 
        },
        // Snapdeal
        { 
            patterns: ['snapdeal', 'snapdeal.com', 'snapdeal.in'],
            name: 'Snapdeal', 
            icon: '🛒', 
            color: '#ff6600' 
        },
        // Paytm Mall
        { 
            patterns: ['paytm', 'paytmmall', 'paytm.com', 'paytmmall.com'],
            name: 'Paytm Mall', 
            icon: '🛍️', 
            color: '#00baf2' 
        },
        // ShopClues
        { 
            patterns: ['shopclues', 'shopclues.com', 'shopclues.in'],
            name: 'ShopClues', 
            icon: '🛒', 
            color: '#f36f21' 
        },
        // Limeroad
        { 
            patterns: ['limeroad', 'limeroad.com', 'limeroad.in'],
            name: 'Limeroad', 
            icon: '👗', 
            color: '#ff0066' 
        },
        // Croma
        { 
            patterns: ['croma', 'croma.com', 'croma.in'],
            name: 'Croma', 
            icon: '🛒', 
            color: '#e31837' 
        },
        // Reliance Digital
        { 
            patterns: ['reliance', 'reliance digital', 'reliance.com'],
            name: 'Reliance', 
            icon: '🛍️', 
            color: '#1a8f5e' 
        },
        // Pepperfry
        { 
            patterns: ['pepperfry', 'pepperfry.com', 'pepperfry.in'],
            name: 'Pepperfry', 
            icon: '🛋️', 
            color: '#ff6b00' 
        },
        // Urban Ladder
        { 
            patterns: ['urbanladder', 'urban ladder', 'urbanladder.com'],
            name: 'Urban Ladder', 
            icon: '🛋️', 
            color: '#1a8f5e' 
        },
        // FirstCry
        { 
            patterns: ['firstcry', 'firstcry.com', 'firstcry.in'],
            name: 'FirstCry', 
            icon: '🧸', 
            color: '#ff6b6b' 
        },
        // BabyChakra
        { 
            patterns: ['babychakra', 'baby chakra', 'babychakra.com'],
            name: 'BabyChakra', 
            icon: '🧸', 
            color: '#ff6b9d' 
        },
        // Generic link shorteners that might redirect to platforms
        { 
            patterns: ['bit.ly', 'tinyurl', 'shorturl', 'link', 'redirect'],
            name: 'Link Shortener', 
            icon: '🔗', 
            color: '#667eea' 
        }
    ];
    
    // Check for each platform pattern
    for (const platform of platformPatterns) {
        for (const pattern of platform.patterns) {
            if (urlLower.includes(pattern)) {
                return {
                    name: platform.name,
                    icon: platform.icon,
                    color: platform.color
                };
            }
        }
    }
    
    return { name: 'Other', icon: '🔗', color: '#667eea' };
}

function detectPlatformFromUrl(url) {
    if (!url) return 'Other';
    const result = detectPlatformFromUrlAdvanced(url);
    return result.name;
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
        'Link Shortener': '#667eea',
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
        'Link Shortener': '🔗',
        'Other': '🔗'
    };
    return icons[platform] || '🔗';
}

// ============ Rest of the code remains the same ============
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

// ============ Link Management ============
function addLinkField() {
    linkCounter++;
    const container = document.getElementById('linksContainer');
    const group = document.createElement('div');
    group.className = 'link-group';
    group.id = `linkGroup${linkCounter}`;
    group.innerHTML = `
        <div style="display: flex; gap: 10px; align-items: center; margin: 10px 0;">
            <input type="url" class="admin-input link-input" placeholder="🔗 Product Link *" style="flex: 1;" oninput="detectPlatform(this)">
            <span class="platform-badge" id="platformBadge${linkCounter}" style="background: #666; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; white-space: nowrap;">🏷️ Auto-Detect</span>
            <button type="button" class="remove-link-btn" onclick="removeLink(this)">✕</button>
        </div>
    `;
    container.appendChild(group);
}

function removeLink(btn) {
    const group = btn.closest('.link-group');
    if (document.querySelectorAll('.link-group').length > 1) {
        group.remove();
    } else {
        alert('At least one link is required!');
    }
}

function addFolderLinkField() {
    folderLinkCounter++;
    const container = document.getElementById('folderLinksContainer');
    const group = document.createElement('div');
    group.className = 'link-group';
    group.id = `folderLinkGroup${folderLinkCounter}`;
    group.innerHTML = `
        <div style="display: flex; gap: 10px; align-items: center; margin: 10px 0;">
            <input type="url" class="admin-input folder-link-input" placeholder="🔗 Product Link *" style="flex: 1;" oninput="detectFolderPlatform(this)">
            <span class="platform-badge" id="folderPlatformBadge${folderLinkCounter}" style="background: #666; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; white-space: nowrap;">🏷️ Auto-Detect</span>
            <button type="button" class="remove-link-btn" onclick="removeFolderLink(this)">✕</button>
        </div>
    `;
    container.appendChild(group);
}

function removeFolderLink(btn) {
    const group = btn.closest('.link-group');
    if (document.querySelectorAll('#folderLinksContainer .link-group').length > 1) {
        group.remove();
    } else {
        alert('At least one link is required!');
    }
}

// ============ Folder Management ============
function toggleFolderFields() {
    const type = document.getElementById('productType').value;
    const folderContainer = document.getElementById('folderProductsContainer');
    const linksSection = document.getElementById('linksSection');
    const titleField = document.getElementById('title');
    
    if (type === 'folder') {
        folderContainer.style.display = 'block';
        linksSection.style.display = 'none';
        titleField.placeholder = '📁 Folder Name *';
        document.getElementById('formTitle').textContent = '📁 Create New Folder';
        document.getElementById('thumbnailSection').querySelector('label').textContent = '🖼️ Folder Cover Image:';
    } else {
        folderContainer.style.display = 'none';
        linksSection.style.display = 'block';
        titleField.placeholder = 'Product Name *';
        document.getElementById('formTitle').textContent = '📝 Add New Product';
        document.getElementById('thumbnailSection').querySelector('label').textContent = '🖼️ Thumbnail Image:';
    }
}

function openFolderProductModal() {
    document.getElementById('folderProductModal').style.display = 'block';
    document.getElementById('folderModalTitle').textContent = '📝 Add Product to Folder';
    document.getElementById('folderProductTitle').value = '';
    document.getElementById('folderProductImage').value = '';
    
    const container = document.getElementById('folderLinksContainer');
    container.innerHTML = `
        <div class="link-group" id="folderLinkGroup1">
            <div style="display: flex; gap: 10px; align-items: center; margin: 10px 0;">
                <input type="url" class="admin-input folder-link-input" placeholder="🔗 Product Link *" style="flex: 1;" oninput="detectFolderPlatform(this)">
                <span class="platform-badge" id="folderPlatformBadge1" style="background: #666; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; white-space: nowrap;">🏷️ Auto-Detect</span>
                <button type="button" class="remove-link-btn" onclick="removeFolderLink(this)" style="display:none;">✕</button>
            </div>
        </div>
    `;
    folderLinkCounter = 1;
    isEditingFolderProduct = false;
    editingFolderIndex = -1;
}

function closeFolderProductModal() {
    document.getElementById('folderProductModal').style.display = 'none';
}

async function saveFolderProduct() {
    const title = document.getElementById('folderProductTitle').value.trim();
    if (!title) {
        alert('Please enter product title!');
        return;
    }
    
    const file = document.getElementById('folderProductImage').files[0];
    let imageUrl = '';
    
    if (file) {
        try {
            imageUrl = await uploadImage(file);
        } catch(error) {
            alert('Error uploading image: ' + error.message);
            return;
        }
    }
    
    const linkInputs = document.querySelectorAll('.folder-link-input');
    const links = [];
    linkInputs.forEach(input => {
        if (input.value.trim()) {
            const platform = detectPlatformFromUrl(input.value);
            links.push({ url: input.value.trim(), platform: platform });
        }
    });
    
    if (links.length === 0) {
        alert('Please add at least one link!');
        return;
    }
    
    const productData = {
        title: title,
        image: imageUrl,
        links: links
    };
    
    if (isEditingFolderProduct && editingFolderIndex >= 0) {
        folderProducts[editingFolderIndex] = productData;
    } else {
        folderProducts.push(productData);
    }
    
    renderFolderProducts();
    closeFolderProductModal();
}

function editFolderProduct(index) {
    const product = folderProducts[index];
    isEditingFolderProduct = true;
    editingFolderIndex = index;
    
    document.getElementById('folderModalTitle').textContent = '✏️ Edit Product';
    document.getElementById('folderProductTitle').value = product.title;
    
    const container = document.getElementById('folderLinksContainer');
    container.innerHTML = '';
    folderLinkCounter = 0;
    
    if (product.links && product.links.length > 0) {
        product.links.forEach((link, i) => {
            folderLinkCounter++;
            const group = document.createElement('div');
            group.className = 'link-group';
            group.id = `folderLinkGroup${folderLinkCounter}`;
            const showRemove = product.links.length > 1 ? 'inline-block' : 'none';
            const platform = link.platform || detectPlatformFromUrl(link.url) || 'Other';
            const platformInfo = detectPlatformFromUrlAdvanced(link.url);
            group.innerHTML = `
                <div style="display: flex; gap: 10px; align-items: center; margin: 10px 0;">
                    <input type="url" class="admin-input folder-link-input" placeholder="🔗 Product Link *" style="flex: 1;" value="${escapeHtml(link.url)}" oninput="detectFolderPlatform(this)">
                    <span class="platform-badge" id="folderPlatformBadge${folderLinkCounter}" style="background: ${platformInfo.color}; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; white-space: nowrap;">${platformInfo.icon} ${platformInfo.name}</span>
                    <button type="button" class="remove-link-btn" onclick="removeFolderLink(this)" style="display:${showRemove};">✕</button>
                </div>
            `;
            container.appendChild(group);
        });
    } else {
        folderLinkCounter++;
        const group = document.createElement('div');
        group.className = 'link-group';
        group.id = `folderLinkGroup${folderLinkCounter}`;
        group.innerHTML = `
            <div style="display: flex; gap: 10px; align-items: center; margin: 10px 0;">
                <input type="url" class="admin-input folder-link-input" placeholder="🔗 Product Link *" style="flex: 1;" oninput="detectFolderPlatform(this)">
                <span class="platform-badge" id="folderPlatformBadge${folderLinkCounter}" style="background: #666; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; white-space: nowrap;">🏷️ Auto-Detect</span>
                <button type="button" class="remove-link-btn" onclick="removeFolderLink(this)" style="display:none;">✕</button>
            </div>
        `;
        container.appendChild(group);
    }
    
    document.getElementById('folderProductImage').value = '';
    document.getElementById('folderProductModal').style.display = 'block';
}

function deleteFolderProduct(index) {
    if (confirm('Delete this product from folder?')) {
        folderProducts.splice(index, 1);
        renderFolderProducts();
    }
}

function renderFolderProducts() {
    const list = document.getElementById('folderProductsList');
    if (folderProducts.length === 0) {
        list.innerHTML = '<p style="color: #999; text-align: center; padding: 20px;">No products in this folder yet.</p>';
        return;
    }
    
    list.innerHTML = '';
    folderProducts.forEach((product, index) => {
        const div = document.createElement('div');
        div.className = 'folder-product-item';
        
        const linkBadges = product.links ? product.links.map(l => {
            const info = detectPlatformFromUrlAdvanced(l.url);
            return `<span style="background: ${info.color}; color: white; padding: 2px 10px; border-radius: 10px; font-size: 11px; margin: 2px;">${info.icon} ${info.name}</span>`;
        }).join(' ') : '';
        
        div.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                <div style="display: flex; align-items: center; gap: 15px; flex: 1;">
                    ${product.image ? `<img src="${product.image}" class="folder-product-image" alt="${product.title}">` : '<div style="width:60px;height:60px;background:#e0e0e0;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:24px;">📷</div>'}
                    <div>
                        <strong>${escapeHtml(product.title)}</strong>
                        <div style="margin-top: 5px; display: flex; flex-wrap: wrap; gap: 3px;">${linkBadges}</div>
                    </div>
                </div>
                <div>
                    <button onclick="editFolderProduct(${index})" style="background: #667eea; color: white; border: none; padding: 5px 12px; border-radius: 5px; cursor: pointer; margin-right: 5px;">✏️</button>
                    <button onclick="deleteFolderProduct(${index})" style="background: #ff4757; color: white; border: none; padding: 5px 12px; border-radius: 5px; cursor: pointer;">🗑️</button>
                </div>
            </div>
        `;
        list.appendChild(div);
    });
}

// ============ Main Product Functions ============
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
    const productType = document.getElementById("productType").value;

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
        alert("Please select an image for the product");
        document.getElementById("publishBtn").disabled = false;
        return;
    }

    try {
        document.getElementById("publishBtn").disabled = true;
        document.getElementById("publishBtn").textContent = editingProductId ? "Updating..." : "Publishing...";
        
        let productData = {
            title: title,
            category: category,
            thumbnail: imageUrl,
            product_type: productType,
            clicks: 0
        };
        
        if (productType === 'single') {
            const linkInputs = document.querySelectorAll('.link-input');
            const links = [];
            linkInputs.forEach(input => {
                if (input.value.trim()) {
                    const platform = detectPlatformFromUrl(input.value);
                    links.push({ url: input.value.trim(), platform: platform });
                }
            });
            
            if (links.length === 0) {
                alert('Please add at least one product link!');
                document.getElementById("publishBtn").disabled = false;
                return;
            }
            
            productData.links = links;
            
            links.forEach(link => {
                const key = link.platform.toLowerCase().replace(/ /g, '') + '_link';
                productData[key] = link.url;
            });
        } else {
            if (folderProducts.length === 0) {
                alert('Please add at least one product to the folder!');
                document.getElementById("publishBtn").disabled = false;
                return;
            }
            productData.folder_products = folderProducts;
            productData.links = [];
        }
        
        if(editingProductId) {
            const { error } = await supabaseClient.from("products").update(productData).eq("id", editingProductId);
            if (error) throw error;
            alert("✅ Product Updated Successfully!");
        } else {
            const { error } = await supabaseClient.from("products").insert([productData]);
            if (error) throw error;
            alert("✅ Product Published Successfully!");
        }
        
        resetForm();
        loadProductsList();
    } catch(error) {
        alert("Error: " + error.message);
        console.error("Full error:", error);
    } finally {
        document.getElementById("publishBtn").disabled = false;
        document.getElementById("publishBtn").textContent = editingProductId ? "Update Product" : "Publish Product";
    }
}

function resetForm() {
    document.getElementById("title").value = "";
    document.getElementById("category").value = "";
    document.getElementById("imageFile").value = "";
    document.getElementById("productType").value = "single";
    document.getElementById("folderProductsContainer").style.display = "none";
    document.getElementById("linksSection").style.display = "block";
    
    const container = document.getElementById('linksContainer');
    container.innerHTML = `
        <div class="link-group" id="linkGroup1">
            <div style="display: flex; gap: 10px; align-items: center; margin: 10px 0;">
                <input type="url" class="admin-input link-input" placeholder="🔗 Product Link *" style="flex: 1;" oninput="detectPlatform(this)">
                <span class="platform-badge" id="platformBadge1" style="background: #666; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; white-space: nowrap;">🏷️ Auto-Detect</span>
                <button type="button" class="remove-link-btn" onclick="removeLink(this)" style="display:none;">✕</button>
            </div>
        </div>
    `;
    linkCounter = 1;
    folderProducts = [];
    renderFolderProducts();
    
    const preview = document.getElementById("imagePreview");
    if(preview) preview.remove();
    
    document.getElementById("imageFile").required = true;
    editingProductId = null;
    currentImageUrl = null;
    document.getElementById("publishBtn").textContent = "🚀 Publish Product";
    document.getElementById("formTitle").textContent = "📝 Add New Product";
    document.getElementById('thumbnailSection').querySelector('label').textContent = '🖼️ Thumbnail Image:';
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
        const totalClicks = product.clicks || 0;
        const productType = product.product_type || 'single';
        const isFolder = productType === 'folder';
        const folderCount = product.folder_products ? product.folder_products.length : 0;
        
        let platformBadges = '';
        let links = product.links || [];
        
        if (links.length === 0 && !isFolder) {
            const oldLinks = [];
            if (product.amazon_link) oldLinks.push({ url: product.amazon_link, platform: 'Amazon' });
            if (product.flipkart_link) oldLinks.push({ url: product.flipkart_link, platform: 'Flipkart' });
            if (product.meesho_link) oldLinks.push({ url: product.meesho_link, platform: 'Meesho' });
            if (oldLinks.length > 0) links = oldLinks;
        }
        
        links.forEach(link => {
            const info = detectPlatformFromUrlAdvanced(link.url);
            platformBadges += `<span style="background: ${info.color}; color: white; padding: 2px 10px; border-radius: 10px; font-size: 11px; margin: 2px;">${info.icon} ${info.name}</span>`;
        });
        
        listDiv.innerHTML += `
            <div class="product-item">
                <img src="${product.thumbnail}" alt="${product.title}" style="width:60px;height:60px;object-fit:cover;border-radius:8px;">
                <div class="product-info">
                    <h4 style="margin:0;">${escapeHtml(product.title)} ${isFolder ? '📁' : '📄'}</h4>
                    ${isFolder ? `<p style="font-size:12px; color:#667eea; margin:2px 0;">📂 ${folderCount} products in folder</p>` : ''}
                    <p style="font-size:12px; color:#667eea; margin:5px 0 0;">
                        📊 Total Views: <strong>${totalClicks}</strong>
                    </p>
                    <div style="display:flex; gap:5px; margin-top:5px; flex-wrap:wrap; font-size:11px;">
                        ${platformBadges}
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
    document.getElementById("productType").value = product.product_type || 'single';
    
    const isFolder = product.product_type === 'folder';
    
    if (isFolder) {
        folderProducts = product.folder_products || [];
        renderFolderProducts();
        document.getElementById('folderProductsContainer').style.display = 'block';
        document.getElementById('linksSection').style.display = 'none';
        document.getElementById('title').placeholder = '📁 Folder Name *';
        document.getElementById('formTitle').textContent = '📁 Edit Folder';
        document.getElementById('thumbnailSection').querySelector('label').textContent = '🖼️ Folder Cover Image:';
    } else {
        let links = product.links || [];
        if (links.length === 0) {
            const oldLinks = [];
            if (product.amazon_link) oldLinks.push({ url: product.amazon_link, platform: 'Amazon' });
            if (product.flipkart_link) oldLinks.push({ url: product.flipkart_link, platform: 'Flipkart' });
            if (product.meesho_link) oldLinks.push({ url: product.meesho_link, platform: 'Meesho' });
            if (oldLinks.length > 0) links = oldLinks;
        }
        
        if (links.length > 0) {
            const container = document.getElementById('linksContainer');
            container.innerHTML = '';
            linkCounter = 0;
            links.forEach((link, index) => {
                linkCounter++;
                const group = document.createElement('div');
                group.className = 'link-group';
                group.id = `linkGroup${linkCounter}`;
                const showRemove = links.length > 1 ? 'inline-block' : 'none';
                const info = detectPlatformFromUrlAdvanced(link.url);
                group.innerHTML = `
                    <div style="display: flex; gap: 10px; align-items: center; margin: 10px 0;">
                        <input type="url" class="admin-input link-input" placeholder="🔗 Product Link *" style="flex: 1;" value="${escapeHtml(link.url)}" oninput="detectPlatform(this)">
                        <span class="platform-badge" id="platformBadge${linkCounter}" style="background: ${info.color}; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; white-space: nowrap;">${info.icon} ${info.name}</span>
                        <button type="button" class="remove-link-btn" onclick="removeLink(this)" style="display:${showRemove};">✕</button>
                    </div>
                `;
                container.appendChild(group);
            });
        }
        document.getElementById('folderProductsContainer').style.display = 'none';
        document.getElementById('linksSection').style.display = 'block';
        document.getElementById('title').placeholder = 'Product Name *';
        document.getElementById('formTitle').textContent = '✏️ Edit Product';
        document.getElementById('thumbnailSection').querySelector('label').textContent = '🖼️ Thumbnail Image:';
    }
    
    document.getElementById("publishBtn").textContent = "✏️ Update Product";
    
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

// ============ Theme Functions ============
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

// ============ Initialize ============
checkAuth();
loadProductsList();
initTheme();