// catalog.js - Product Catalog JavaScript with COMPLETE FIXED Session Management

let currentUser = null;
let sessionCheckInProgress = false;
let sessionCheckComplete = false;

// Initialize page on load
document.addEventListener('DOMContentLoaded', function () {
    console.log('=== CATALOG PAGE LOADED ===');

    // Start session check immediately
    checkUserSession();

    // Initialize catalog features
    initializeCatalogFeatures();
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

// Check user session and update UI accordingly
async function checkUserSession() {
    console.log('=== CHECKING USER SESSION ===');
    sessionCheckInProgress = true;
    sessionCheckComplete = false;

    try {
        console.log('Making request to php/check_session.php');

        const response = await fetch('php/check_session.php', {
            method: 'GET',
            credentials: 'include',
            cache: 'no-cache' // Prevent caching of session check
        });

        console.log('Response status:', response.status);

        const result = await response.json();
        console.log('Response data:', result);

        if (response.ok && result.success && result.user) {
            console.log('✅ User is logged in:', result.user.username);
            currentUser = result.user;
            updateUIForLoggedInUser();
        } else {
            console.log('❌ User not logged in:', result.message);
            currentUser = null;
            updateUIForLoggedOutUser();
        }
    } catch (error) {
        console.error('❌ Error checking session:', error);
        currentUser = null;
        updateUIForLoggedOutUser();
    } finally {
        sessionCheckInProgress = false;
        sessionCheckComplete = true;
        console.log('✅ Session check completed. User:', currentUser ? currentUser.username : 'not logged in');
    }
}

// Update UI for logged in user
function updateUIForLoggedInUser() {
    console.log('=== UPDATING UI FOR LOGGED IN USER ===');

    const navActions = document.querySelector('.nav-actions');
    console.log('Nav actions element found:', !!navActions);

    const loginButton = navActions ? navActions.querySelector('a[href="login.html"]') : null;
    console.log('Login button found:', !!loginButton);

    if (loginButton) {
        console.log('Replacing login button with user dropdown');

        // Replace login button with user dropdown
        loginButton.outerHTML = `
            <div class="user-dropdown" style="position: relative;">
                <button class="user-btn" onclick="toggleUserDropdown()" style="background: none; border: none; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; color: white; font-size: 1rem;">
                    <span style="font-size: 1.5rem;">👤</span>
                    <span>Hi, ${currentUser.username}</span>
                    <span style="font-size: 0.8rem;">▼</span>
                </button>
                <div id="userDropdownMenu" class="dropdown-menu" style="display: none; position: absolute; top: 100%; right: 0; background: white; border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 5px 15px rgba(0,0,0,0.2); min-width: 200px; z-index: 1000;">
                    <div style="padding: 1rem; border-bottom: 1px solid #eee; background: #f8f9fa; border-radius: 8px 8px 0 0;">
                        <div style="font-weight: bold; color: #333;">${currentUser.username}</div>
                        <div style="font-size: 0.9rem; color: #666;">${currentUser.email}</div>
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

        console.log('✅ User dropdown created successfully');
    } else {
        console.log('❌ Could not find login button to replace');
    }
}

// Update UI for logged out user
function updateUIForLoggedOutUser() {
    console.log('=== UPDATING UI FOR LOGGED OUT USER ===');

    const navActions = document.querySelector('.nav-actions');
    const userDropdown = navActions ? navActions.querySelector('.user-dropdown') : null;

    if (userDropdown) {
        console.log('Replacing user dropdown with login button');
        userDropdown.outerHTML = '<a href="login.html" class="btn btn-outline">Login</a>';
        console.log('✅ Login button restored');
    } else {
        console.log('ℹ️ No user dropdown found (user already logged out)');
    }
}

// Toggle user dropdown menu
function toggleUserDropdown() {
    console.log('Toggling user dropdown');
    const dropdownMenu = document.getElementById('userDropdownMenu');
    if (dropdownMenu) {
        dropdownMenu.style.display = dropdownMenu.style.display === 'none' ? 'block' : 'none';
        console.log('Dropdown display:', dropdownMenu.style.display);
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

// Logout function
async function logout() {
    console.log('=== LOGGING OUT ===');

    try {
        const response = await fetch('php/logout.php', {
            method: 'POST',
            credentials: 'include'
        });

        const result = await response.json();

        if (result.success) {
            console.log('✅ Logout successful');
            currentUser = null;
            updateUIForLoggedOutUser();
            window.location.href = 'index.html';
        } else {
            console.error('❌ Logout failed:', result.error);
            alert('Logout failed. Please try again.');
        }
    } catch (error) {
        console.error('❌ Logout error:', error);
        alert('Logout failed. Please try again.');
    }
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

// 🔐 AUTHENTICATION LAYER: Main add to cart function with authentication
async function addToCart(productId) {
    console.log('=== ADD TO CART CLICKED ===');
    console.log('Product ID:', productId);
    console.log('Current state - sessionCheckComplete:', sessionCheckComplete, 'currentUser:', currentUser?.username || 'null');

    // Strategy 1: If session check is still in progress, wait for it
    if (sessionCheckInProgress) {
        console.log('⏳ Session check in progress, waiting...');
        showNotification('Checking login status...');
        
        // Wait for session check to complete (max 5 seconds)
        let waitTime = 0;
        while (sessionCheckInProgress && waitTime < 5000) {
            await new Promise(resolve => setTimeout(resolve, 100));
            waitTime += 100;
        }
        hideNotification();
    }

    // Strategy 2: If we have a user from the initial check, trust it
    if (currentUser && sessionCheckComplete) {
        console.log('✅ Using cached user session:', currentUser.username);
        addItemToCart(productId);
        return;
    }

    // Strategy 3: If no cached user or session check not complete, do ONE fresh check
    console.log('🔄 Doing verification check...');
    showNotification('Verifying login status...');
    
    try {
        const response = await fetch('php/check_session.php', {
            method: 'GET',
            credentials: 'include',
            cache: 'no-cache'
        });

        const result = await response.json();
        
        if (response.ok && result.success && result.user) {
            console.log('✅ Fresh session check confirmed user:', result.user.username);
            currentUser = result.user;
            // Update UI if it wasn't updated before
            if (document.querySelector('a[href="login.html"]')) {
                updateUIForLoggedInUser();
            }
            hideNotification();
            addItemToCart(productId);
        } else {
            console.log('❌ Fresh session check: user not logged in');
            hideNotification();
            showNotification('Please log in to add items to your cart.', 'error');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1500);
        }
    } catch (error) {
        console.error('❌ Error in verification check:', error);
        hideNotification();
        showNotification('Error checking login status. Please try again.', 'error');
    }
}

// 🛒 CART LOGIC LAYER: Pure cart operations (only called when user is authenticated)
function addItemToCart(productId) {
    console.log('✅ Adding product to cart:', productId);
    
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Convert productId to string to maintain consistency
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

// 📢 NOTIFICATION SYSTEM: Improved notification function with types
function showNotification(message, type = 'success') {
    // Remove existing notification first
    hideNotification();
    
    let notification = document.createElement('div');
    notification.id = 'cart-notification';
    
    // Set colors based on type
    let backgroundColor = '#28a745'; // success (green)
    if (type === 'error') backgroundColor = '#dc3545'; // error (red)
    if (type === 'info') backgroundColor = '#17a2b8'; // info (blue)
    if (type === 'warning') backgroundColor = '#ffc107'; // warning (yellow)
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${backgroundColor};
        color: white;
        padding: 1rem 2rem;
        border-radius: 8px;
        z-index: 3000;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        transition: opacity 0.3s ease;
        max-width: 300px;
        word-wrap: break-word;
        font-family: Arial, sans-serif;
        font-size: 14px;
        line-height: 1.4;
    `;
    
    notification.textContent = message;
    notification.style.opacity = '1';
    document.body.appendChild(notification);
    
    // Auto-hide after 3 seconds (except for checking/verifying messages)
    if (!message.toLowerCase().includes('checking') && 
        !message.toLowerCase().includes('verifying') && 
        !message.toLowerCase().includes('loading')) {
        setTimeout(() => {
            hideNotification();
        }, 3000);
    }
}

// Hide notification function
function hideNotification() {
    const notification = document.getElementById('cart-notification');
    if (notification && notification.parentNode) {
        notification.style.opacity = '0';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }
}

// 🔄 PAGE REFRESH HANDLER: Ensure session state is maintained
window.addEventListener('pageshow', function(event) {
    // Handle browser back/forward navigation
    if (event.persisted) {
        console.log('Page loaded from cache, refreshing session check...');
        checkUserSession();
    }
});

// 🎯 VISIBILITY CHANGE HANDLER: Check session when page becomes visible
document.addEventListener('visibilitychange', function() {
    if (!document.hidden && sessionCheckComplete) {
        // Page became visible and we've done initial session check
        // Do a quick session verification if it's been a while
        const now = Date.now();
        const lastCheck = window.lastSessionCheck || 0;
        
        if (now - lastCheck > 30000) { // 30 seconds
            console.log('Page visible after 30s, doing quick session check...');
            checkUserSession();
            window.lastSessionCheck = now;
        }
    }
});

// Set timestamp for session checks
window.lastSessionCheck = Date.now();