// catalog.js - SIMPLIFIED using session manager
document.addEventListener('DOMContentLoaded', function () {
    console.log('=== CATALOG PAGE LOADED ===');
    
    // Initialize catalog features
    initializeCatalogFeatures();
    
    // Set up session change listeners
    window.sessionManager.onSessionChange(handleSessionChange);
});

// Initialize catalog features
function initializeCatalogFeatures() {
    // Search functionality
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function () {
            filterProducts(this.value);
        });
    }

    // Sort functionality
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
        sortSelect.addEventListener('change', function () {
            sortProducts(this.value);
        });
    }

    console.log('Catalog features initialized');
}

// Handle session changes
function handleSessionChange(event, userData) {
    if (event === 'login') {
        updateUIForLoggedInUser(userData);
    } else if (event === 'logout') {
        updateUIForLoggedOutUser();
    }
}

// Update UI for logged in user
function updateUIForLoggedInUser(user) {
    console.log('=== UPDATING UI FOR LOGGED IN USER (CATALOG) ===');
    
    const navActions = document.querySelector('.nav-actions');
    const loginButton = navActions ? navActions.querySelector('a[href="login.html"]') : null;
    
    if (loginButton && user) {
        loginButton.outerHTML = `
            <div class="user-dropdown" style="position: relative;">
                <button class="user-btn" onclick="toggleUserDropdown()" style="background: none; border: none; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; color: white; font-size: 1rem;">
                    <span style="font-size: 1.5rem;">👤</span>
                    <span>Hi, ${user.username}</span>
                    <span style="font-size: 0.8rem;">▼</span>
                </button>
                <div id="userDropdownMenu" class="dropdown-menu" style="display: none; position: absolute; top: 100%; right: 0; background: white; border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 5px 15px rgba(0,0,0,0.2); min-width: 200px; z-index: 1000;">
                    <div style="padding: 1rem; border-bottom: 1px solid #eee; background: #f8f9fa; border-radius: 8px 8px 0 0;">
                        <div style="font-weight: bold; color: #333;">${user.username}</div>
                        <div style="font-size: 0.9rem; color: #666;">${user.email}</div>
                    </div>
                    <div style="padding: 0.5rem 0;">
                        <a href="userprofile.html" style="display: block; padding: 0.75rem 1rem; color: #333; text-decoration: none; transition: background 0.2s;" onmouseover="this.style.background='#f8f9fa'" onmouseout="this.style.background='transparent'">
                            👤 My Profile
                        </a>
                        <a href="order_history.html" style="display: block; padding: 0.75rem 1rem; color: #333; text-decoration: none; transition: background 0.2s;" onmouseover="this.style.background='#f8f9fa'" onmouseout="this.style.background='transparent'">
                            📦 My Orders
                        </a>
                        <hr style="margin: 0.5rem 0; border: none; border-top: 1px solid #eee;">
                        <button onclick="logout()" style="display: block; width: 100%; padding: 0.75rem 1rem; color: #dc3545; text-decoration: none; background: none; border: none; text-align: left; cursor: pointer; transition: background 0.2s;" onmouseover="this.style.background='#f8f9fa'" onmouseout="this.style.background='transparent'">
                            🚪 Logout
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
}

// Update UI for logged out user
function updateUIForLoggedOutUser() {
    const navActions = document.querySelector('.nav-actions');
    const userDropdown = navActions ? navActions.querySelector('.user-dropdown') : null;
    
    if (userDropdown) {
        userDropdown.outerHTML = '<a href="login.html" class="btn btn-outline">Login</a>';
    }
}

// Toggle user dropdown menu
function toggleUserDropdown() {
    const dropdownMenu = document.getElementById('userDropdownMenu');
    if (dropdownMenu) {
        dropdownMenu.style.display = dropdownMenu.style.display === 'none' ? 'block' : 'none';
    }
}

// Close dropdown when clicking outside
document.addEventListener('click', function (event) {
    const userDropdown = document.querySelector('.user-dropdown');
    if (userDropdown && !userDropdown.contains(event.target)) {
        const dropdownMenu = document.getElementById('userDropdownMenu');
        if (dropdownMenu) {
            dropdownMenu.style.display = 'none';
        }
    }
});

// Logout function using session manager
async function logout() {
    await window.sessionManager.logout();
}

// Filter products based on search input
function filterProducts(searchTerm) {
    const productCards = document.querySelectorAll('.product-card');
    const lowerSearchTerm = searchTerm.toLowerCase();

    productCards.forEach(card => {
        const productName = card.querySelector('.product-title').textContent.toLowerCase();
        const productInfo = card.querySelector('.product-info').textContent.toLowerCase();

        if (productName.includes(lowerSearchTerm) || productInfo.includes(lowerSearchTerm)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// Sort products by price
function sortProducts(sortOrder) {
    if (!sortOrder) return;

    const productGrid = document.getElementById('productCatalog');
    const productCards = Array.from(productGrid.querySelectorAll('.product-card'));

    productCards.sort((a, b) => {
        const priceA = parseFloat(a.querySelector('.product-price').textContent.replace(/[^0-9.]/g, ''));
        const priceB = parseFloat(b.querySelector('.product-price').textContent.replace(/[^0-9.]/g, ''));

        if (sortOrder === 'asc') {
            return priceA - priceB;
        } else {
            return priceB - priceA;
        }
    });

    // Clear and re-append sorted cards
    productCards.forEach(card => card.remove());
    productCards.forEach(card => productGrid.appendChild(card));
}

// Add to cart function using session manager
async function addToCart(productId) {
    console.log('=== ADD TO CART CLICKED (CATALOG) ===');
    console.log('Product ID:', productId);
    
    // Check if user is logged in using session manager
    const loginRequired = await window.sessionManager.requireLogin();
    if (!loginRequired) {
        return; // Will redirect to login
    }
    
    // User is authenticated, add to cart
    addItemToCart(productId);
}

// Add item to cart (only called when user is authenticated)
function addItemToCart(productId) {
    console.log('✅ Adding product to cart:', productId);
    
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const productIdStr = productId.toString();
    
    // Check if item is already in cart
    if (!cart.includes(productIdStr)) {
        cart.push(productIdStr);
        localStorage.setItem('cart', JSON.stringify(cart));
        
        // Update cart count in header if function exists
        if (typeof updateCartCount === 'function') {
            updateCartCount();
        }
        
        // Show success message
        showNotification('Product added to cart!', 'success');
        console.log('✅ Product successfully added to cart');
    } else {
        showNotification('Product is already in your cart!', 'info');
        console.log('ℹ️ Product was already in cart');
    }
}

// Notification function
function showNotification(message, type = 'success') {
    // Remove existing notification first
    const existing = document.getElementById('catalog-notification');
    if (existing) existing.remove();
    
    const notification = document.createElement('div');
    notification.id = 'catalog-notification';
    
    const colors = {
        success: '#28a745',
        error: '#dc3545',
        info: '#17a2b8',
        warning: '#ffc107'
    };
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${colors[type] || colors.info};
        color: white;
        padding: 1rem 2rem;
        border-radius: 8px;
        z-index: 3000;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        font-family: Arial, sans-serif;
        font-size: 14px;
    `;
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 3000);
}