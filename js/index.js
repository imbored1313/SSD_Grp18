// index.js - ElectraEdge Homepage JavaScript SIMPLIFIED

// Shopping cart functionality
let cart = [];

// Initialize page on load
document.addEventListener('DOMContentLoaded', function() {
    console.log('=== HOME PAGE LOADED ===');
    
    // Load cart from storage
    loadCartFromStorage();
    updateCartCount();
    
    // Set up session change listeners
    window.sessionManager.onSessionChange(handleSessionChange);
    
    // Initialize other features
    initializePageFeatures();
});

// Handle session changes
function handleSessionChange(event, userData) {
    if (event === 'login') {
        updateUIForLoggedInUser(userData);
    } else if (event === 'logout') {
        updateUIForLoggedOutUser();
    }
}

// Initialize page features (non-session dependent)
function initializePageFeatures() {
    // Newsletter subscription handler
    const newsletterForm = document.getElementById('newsletterForm');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('newsletterEmail').value.trim();
            
            if (!email) {
                showNotification('Please enter your email address', 'warning');
                return;
            }
            
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                showNotification('Please enter a valid email address', 'error');
                return;
            }
            
            // Simulate API call
            showNotification('Thank you for subscribing to our newsletter!', 'success');
            document.getElementById('newsletterEmail').value = '';
        });
    }
    
    // Add smooth scrolling behavior
    document.documentElement.style.scrollBehavior = 'smooth';
    
    // Add animation classes to elements as they come into view
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe product cards for animation
    document.querySelectorAll('.product-card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });
}

// Update UI for logged in user
function updateUIForLoggedInUser(user) {
    console.log('=== UPDATING UI FOR LOGGED IN USER (HOME) ===');
    
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
                        <a href="userprofile.php" style="display: block; padding: 0.75rem 1rem; color: #333; text-decoration: none; transition: background 0.2s;" onmouseover="this.style.background='#f8f9fa'" onmouseout="this.style.background='transparent'">
                            👤 My Profile
                        </a>
                        <a href="my_orders.html" style="display: block; padding: 0.75rem 1rem; color: #333; text-decoration: none; transition: background 0.2s;" onmouseover="this.style.background='#f8f9fa'" onmouseout="this.style.background='transparent'">
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
    console.log('=== UPDATING UI FOR LOGGED OUT USER (HOME) ===');
    
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
document.addEventListener('click', function(event) {
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

// Add item to cart with authentication check
async function addToCart(event, productId, price) {
    // Prevent card click event
    event.stopPropagation();
    
    console.log('=== ADD TO CART CLICKED (HOME PAGE) ===');
    console.log('Product ID:', productId, 'Price:', price);
    
    // Check if user is logged in using session manager
    const loginRequired = await window.sessionManager.requireLogin();
    if (!loginRequired) {
        return; // Will redirect to login
    }
    
    // User is authenticated, proceed with adding to cart
    console.log('✅ User authenticated, adding to cart');
    
    const productNames = {
        'smartphone': 'ElectraPhone Pro Max',
        'laptop': 'UltraBook Elite X1',
        'headphones': 'SoundWave Pro Wireless',
        'smartwatch': 'TimeSync Smart Watch',
        'tablet': 'TabletPro Ultra 12',
        'speaker': 'BoomBox Smart Speaker'
    };
    
    const productEmojis = {
        'smartphone': '📱',
        'laptop': '💻',
        'headphones': '🎧',
        'smartwatch': '⌚',
        'tablet': '📟',
        'speaker': '🔊'
    };
    
    // Add to homepage cart (for modal display)
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
        showNotification(`Increased quantity of ${productNames[productId]}!`, 'info');
    } else {
        cart.push({
            id: productId,
            name: productNames[productId],
            emoji: productEmojis[productId],
            price: price,
            quantity: 1
        });
        showNotification(`${productNames[productId]} added to cart!`, 'success');
    }
    
    // Add to shared cart storage (for catalog/cart pages)
    let sharedCart = JSON.parse(localStorage.getItem('cart')) || [];
    const productIdStr = productId.toString();
    
    if (!sharedCart.includes(productIdStr)) {
        sharedCart.push(productIdStr);
        localStorage.setItem('cart', JSON.stringify(sharedCart));
    }
    
    // Update both cart systems
    updateCartCount();
    saveCartToStorage();
}

// Update cart count - use shared cart storage
function updateCartCount() {
    const sharedCart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalItems = sharedCart.length;
    
    const cartCountElement = document.getElementById('cartCount');
    if (cartCountElement) {
        cartCountElement.textContent = totalItems;
        console.log('✅ Cart count updated to:', totalItems);
    }
}

// Toggle cart modal
function toggleCart() {
    const modal = document.getElementById('cartModal');
    if (modal) {
        if (modal.style.display === 'flex') {
            modal.style.display = 'none';
        } else {
            modal.style.display = 'flex';
            updateCartDisplay();
        }
    }
}

// Update cart display in modal
function updateCartDisplay() {
    const cartItems = document.getElementById('cartItems');
    const totalAmount = document.getElementById('totalAmount');
    
    if (!cartItems || !totalAmount) return;
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p style="text-align: center; color: #666; padding: 2rem;">Your cart is empty</p>';
        totalAmount.textContent = '$0.00';
        return;
    }
    
    let cartHTML = '';
    let total = 0;
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        cartHTML += `
            <div style="display: flex; align-items: center; gap: 1rem; padding: 1rem; border-bottom: 1px solid #eee;">
                <div style="font-size: 2rem;">${item.emoji}</div>
                <div style="flex: 1;">
                    <h4 style="margin-bottom: 0.5rem;">${item.name}</h4>
                    <p style="color: #666;">$${item.price.toFixed(2)} each</p>
                </div>
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <button onclick="changeQuantity('${item.id}', -1)" style="background: #f8f9fa; border: 1px solid #ddd; width: 30px; height: 30px; border-radius: 4px; cursor: pointer;">-</button>
                    <span style="min-width: 30px; text-align: center;">${item.quantity}</span>
                    <button onclick="changeQuantity('${item.id}', 1)" style="background: #f8f9fa; border: 1px solid #ddd; width: 30px; height: 30px; border-radius: 4px; cursor: pointer;">+</button>
                </div>
                <div style="font-weight: bold; min-width: 80px; text-align: right;">$${itemTotal.toFixed(2)}</div>
                <button onclick="removeFromCart('${item.id}')" style="background: #dc3545; color: white; border: none; width: 30px; height: 30px; border-radius: 4px; cursor: pointer; margin-left: 0.5rem;">×</button>
            </div>
        `;
    });
    
    cartItems.innerHTML = cartHTML;
    totalAmount.textContent = `$${total.toFixed(2)}`;
}

// Change item quantity
function changeQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            updateCartCount();
            updateCartDisplay();
            saveCartToStorage();
        }
    }
}

// Remove item from cart
function removeFromCart(productId) {
    // Remove from homepage cart
    cart = cart.filter(item => item.id !== productId);
    
    // Remove from shared cart
    let sharedCart = JSON.parse(localStorage.getItem('cart')) || [];
    sharedCart = sharedCart.filter(id => id !== productId.toString());
    localStorage.setItem('cart', JSON.stringify(sharedCart));
    
    updateCartCount();
    updateCartDisplay();
    saveCartToStorage();
    showNotification('Item removed from cart', 'info');
}

// Checkout function
function checkout() {
    if (cart.length === 0) {
        showNotification('Your cart is empty!', 'warning');
        return;
    }
    
    // Check if user is logged in before checkout
    if (!window.sessionManager.isLoggedIn()) {
        showNotification('Please login to continue with checkout', 'warning');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
        return;
    }
    
    const user = window.sessionManager.getUser();
    showNotification('Redirecting to secure checkout...', 'info');
    
    // Simulate checkout process
    setTimeout(() => {
        alert('Thank you for your purchase, ' + user.username + '! Your order has been placed.');
        // Clear cart after successful checkout
        cart = [];
        localStorage.removeItem('cart');
        updateCartCount();
        updateCartDisplay();
        saveCartToStorage();
        toggleCart();
    }, 1000);
}

// Show notification
function showNotification(message, type = 'success') {
    // Remove existing notification first
    const existing = document.getElementById('home-notification');
    if (existing) existing.remove();
    
    const notification = document.createElement('div');
    notification.id = 'home-notification';
    
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

// Save cart to localStorage
function saveCartToStorage() {
    try {
        localStorage.setItem('electraedge_cart', JSON.stringify(cart));
        console.log('✅ Homepage cart saved to storage');
    } catch (error) {
        console.log('Storage not available in this environment');
    }
}

// Load cart from localStorage
function loadCartFromStorage() {
    try {
        const sharedCart = JSON.parse(localStorage.getItem('cart')) || [];
        const savedCart = localStorage.getItem('electraedge_cart');
        
        if (savedCart) {
            cart = JSON.parse(savedCart);
        }
        
        // Sync carts if they're out of sync
        if (sharedCart.length > 0 && cart.length === 0) {
            sharedCart.forEach(productId => {
                cart.push({
                    id: productId,
                    name: `Product ${productId}`,
                    emoji: '📦',
                    price: 0,
                    quantity: 1
                });
            });
            saveCartToStorage();
        }
        
        updateCartCount();
        console.log('✅ Cart loaded from storage');
    } catch (error) {
        console.log('Storage not available in this environment');
    }
}

// Handle window resize and modal interactions
window.addEventListener('resize', function() {
    if (window.innerWidth < 768) {
        const modal = document.getElementById('cartModal');
        if (modal && modal.style.display === 'flex') {
            modal.style.display = 'none';
        }
    }
    
    const dropdownMenu = document.getElementById('userDropdownMenu');
    if (dropdownMenu) {
        dropdownMenu.style.display = 'none';
    }
});

// Close modal when clicking outside
document.addEventListener('DOMContentLoaded', function() {
    const cartModal = document.getElementById('cartModal');
    if (cartModal) {
        cartModal.addEventListener('click', function(e) {
            if (e.target === this) {
                toggleCart();
            }
        });
    }
});

// Keyboard accessibility
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        const modal = document.getElementById('cartModal');
        if (modal && modal.style.display === 'flex') {
            toggleCart();
        }
        
        const dropdownMenu = document.getElementById('userDropdownMenu');
        if (dropdownMenu && dropdownMenu.style.display === 'block') {
            dropdownMenu.style.display = 'none';
        }
    }
});