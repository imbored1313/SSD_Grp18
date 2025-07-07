// cart.js - Shopping Cart JavaScript with FINAL FIXES

let currentUser = null;
let sessionCheckComplete = false;

// Initialize page on load
document.addEventListener('DOMContentLoaded', function() {
    console.log('=== CART PAGE LOADED ===');

    // Quick session recovery first
    quickSessionRecovery();

    // Start session check immediately
    checkUserSession();

    // Initialize cart features
    initializeCartFeatures();
});

// Quick session recovery from sessionStorage
function quickSessionRecovery() {
    try {
        const tempSession = sessionStorage.getItem('tempUserSession');
        if (tempSession) {
            const sessionData = JSON.parse(tempSession);
            const now = Date.now();
            
            // If temp session is less than 30 seconds old, use it temporarily
            if (now - sessionData.timestamp < 30000) {
                console.log('🔄 Using temporary session data for quick recovery');
                currentUser = sessionData.user;
                sessionCheckComplete = true;
                
                // Update UI immediately with temp data
                updateUIForLoggedInUser();
                
                console.log('✅ Quick session recovery successful for:', currentUser.username);
                return true;
            }
        }
    } catch (error) {
        console.log('Cannot load temp session');
    }
    return false;
}

// Store session for quick recovery
function storeSessionForQuickRecovery() {
    if (currentUser) {
        try {
            sessionStorage.setItem('tempUserSession', JSON.stringify({
                user: currentUser,
                timestamp: Date.now()
            }));
            console.log('✅ Session stored for quick recovery');
        } catch (error) {
            console.log('Cannot save temp session');
        }
    }
}

// Initialize cart features
function initializeCartFeatures() {
    // Load and display cart items
    loadCartItems();
    console.log('Cart features initialized');
}

// Check user session and update UI accordingly
async function checkUserSession() {
    console.log('=== CHECKING USER SESSION (CART) ===');

    try {
        console.log('Making request to php/check_session.php');

        const response = await fetch('php/check_session.php', {
            method: 'GET',
            credentials: 'include',
            cache: 'no-cache'
        });

        console.log('Response status:', response.status);

        const result = await response.json();
        console.log('Response data:', result);

        if (response.ok && result.success && result.user) {
            console.log('✅ User is logged in:', result.user.username);
            currentUser = result.user;
            updateUIForLoggedInUser();
            
            // Store fresh session for quick recovery
            storeSessionForQuickRecovery();
        } else {
            console.log('❌ User not logged in:', result.message);
            currentUser = null;
            updateUIForLoggedOutUser();
            
            // Clear any temp session data
            try {
                sessionStorage.removeItem('tempUserSession');
            } catch (error) {
                console.log('Cannot clear temp session');
            }
            
            // Show message and redirect after delay
            showNotification('Please login to view your cart', 'warning');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        }
    } catch (error) {
        console.error('❌ Error checking session:', error);
        
        // If we had quick recovery data and real check fails, keep using it temporarily
        if (!currentUser) {
            currentUser = null;
            updateUIForLoggedOutUser();
            
            // Show error and redirect after delay
            showNotification('Error checking login status', 'error');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        }
    } finally {
        sessionCheckComplete = true;
    }
}

// Load cart items from localStorage and display them
function loadCartItems() {
    const cartIds = JSON.parse(localStorage.getItem('cart')) || [];

    if (cartIds.length === 0) {
        displayEmptyCart();
        return;
    }

    // Show loading state
    const cartSummary = document.getElementById('cart-summary');
    if (cartSummary) {
        cartSummary.innerHTML = `
            <div style="text-align: center; padding: 2rem;">
                <p>Loading cart items...</p>
            </div>
        `;
    }

    // Fetch product details for cart items
    fetch('get_products.php')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch products');
            }
            return response.json();
        })
        .then(products => {
            const cartItems = products.filter(p => cartIds.includes(p.product_id.toString()));
            if (cartItems.length > 0) {
                displayCartItems(cartItems);
            } else {
                displayEmptyCart();
            }
        })
        .catch(error => {
            console.error('Error loading cart items:', error);
            const cartSummary = document.getElementById('cart-summary');
            if (cartSummary) {
                cartSummary.innerHTML = `
                    <div style="text-align: center; padding: 2rem; color: #dc3545;">
                        <p>Error loading cart items. Please try again.</p>
                        <button onclick="loadCartItems()" class="btn btn-primary">Retry</button>
                    </div>
                `;
            }
        });
}

// Display cart items
function displayCartItems(cartItems) {
    const cartSummary = document.getElementById('cart-summary');
    if (!cartSummary) return;

    let total = 0;
    let cartHTML = '';

    cartItems.forEach(item => {
        const price = parseFloat(item.price);
        total += price;

        cartHTML += `
            <div class="cart-item" style="display: flex; align-items: center; padding: 1rem; border-bottom: 1px solid #eee; gap: 1rem;">
                <img src="${item.image_path}" alt="${item.name}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px;" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjZjhmOWZhIi8+CjxwYXRoIGQ9Ik00MCAyMEM0OC4yODQzIDIwIDU1IDI2LjcxNTcgNTUgMzVDNTUgNDMuMjg0MyA0OC4yODQzIDUwIDQwIDUwQzMxLjcxNTcgNTAgMjUgNDMuMjg0MyAyNSAzNUMyNSAyNi43MTU3IDMxLjcxNTcgMjAgNDAgMjBaIiBmaWxsPSIjZGVlMmU2Ii8+Cjwvc3ZnPgo='">
                <div style="flex: 1;">
                    <h3 style="margin: 0 0 0.5rem 0; font-size: 1.1rem; color: #333;">${item.name}</h3>
                    <p style="margin: 0; color: #666; font-size: 0.9rem;">${item.description || 'No description available'}</p>
                    <p style="margin: 0.5rem 0 0 0; font-weight: bold; color: #333;">$${price.toFixed(2)}</p>
                </div>
                <button onclick="removeFromCart('${item.product_id}')" style="background: #dc3545; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; transition: background-color 0.2s;" onmouseover="this.style.background='#c82333'" onmouseout="this.style.background='#dc3545'">
                    Remove
                </button>
            </div>
        `;
    });

    cartHTML += `
        <div style="padding: 1rem; text-align: right; font-size: 1.2rem; font-weight: bold; border-top: 2px solid #333; background: #f8f9fa;">
            Total: <span id="total-amount">$${total.toFixed(2)}</span>
        </div>
    `;

    cartSummary.innerHTML = cartHTML;

    // Store total for other functions (like PayPal integration)
    window.cartTotal = total;
}

// Display empty cart message
function displayEmptyCart() {
    const cartSummary = document.getElementById('cart-summary');
    if (!cartSummary) return;

    cartSummary.innerHTML = `
        <div style="text-align: center; padding: 2rem;">
            <div style="font-size: 4rem; margin-bottom: 1rem;">🛒</div>
            <h3 style="color: #333; margin-bottom: 1rem;">Your cart is empty</h3>
            <p style="color: #666; margin-bottom: 2rem;">Start shopping to add items to your cart!</p>
            <a href="catalog.html" class="btn btn-primary">Browse Products</a>
        </div>
    `;

    // Hide PayPal button container if it exists
    const paypalContainer = document.getElementById('paypal-button-container');
    if (paypalContainer) {
        paypalContainer.style.display = 'none';
    }

    // Clear total
    window.cartTotal = 0;
}

// FIXED: Remove item from cart with proper cart count update
function removeFromCart(productId) {
    console.log('Removing product from cart:', productId);
    
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const originalLength = cart.length;
    
    cart = cart.filter(id => id !== productId.toString());
    localStorage.setItem('cart', JSON.stringify(cart));

    if (cart.length < originalLength) {
        showNotification('Item removed from cart', 'info');
        console.log('✅ Product removed from cart');
    } else {
        showNotification('Item not found in cart', 'warning');
        console.log('⚠️ Product was not in cart');
    }

    // Reload cart items
    loadCartItems();

    // FIXED: Update cart count in header using the proper function
    if (typeof window.updateCartCount === 'function') {
        window.updateCartCount();
    } else if (typeof updateCartCount === 'function') {
        updateCartCount();
    }

    // Trigger cart update event
    if (typeof window.triggerCartUpdate === 'function') {
        window.triggerCartUpdate();
    }
}

// Update UI for logged in user
function updateUIForLoggedInUser() {
    console.log('=== UPDATING UI FOR LOGGED IN USER (CART) ===');

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
    console.log('=== UPDATING UI FOR LOGGED OUT USER (CART) ===');

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
    console.log('=== LOGGING OUT (CART) ===');

    try {
        const response = await fetch('php/logout.php', {
            method: 'POST',
            credentials: 'include'
        });

        const result = await response.json();

        if (result.success) {
            console.log('✅ Logout successful');
            currentUser = null;
            
            // Clear temp session
            try {
                sessionStorage.removeItem('tempUserSession');
            } catch (error) {
                console.log('Cannot clear temp session');
            }
            
            updateUIForLoggedOutUser();
            showNotification('Logged out successfully!', 'success');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        } else {
            console.error('❌ Logout failed:', result.error);
            showNotification('Logout failed. Please try again.', 'error');
        }
    } catch (error) {
        console.error('❌ Logout error:', error);
        showNotification('Logout failed. Please try again.', 'error');
    }
}

// 📢 NOTIFICATION SYSTEM: Improved notification function
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
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
        hideNotification();
    }, 3000);
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

// 🔄 SESSION PERSISTENCE: Handle page navigation
window.addEventListener('beforeunload', function() {
    // Store session state in sessionStorage for quick recovery
    if (currentUser) {
        storeSessionForQuickRecovery();
    }
});