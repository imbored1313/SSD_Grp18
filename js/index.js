// index.js - ElectraEdge Homepage JavaScript with FINAL FIXES

// Shopping cart functionality
let cart = [];
let currentUser = null;
let sessionCheckComplete = false;
let sessionCheckInProgress = false;

// Initialize page on load
document.addEventListener('DOMContentLoaded', function() {
    console.log('=== HOME PAGE LOADED ===');
    
    // Load cart from storage FIRST
    loadCartFromStorage();
    updateCartCount();
    
    // Start session check immediately
    checkUserSession();
    
    // Initialize other features
    initializePageFeatures();
});

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

// Check user session and update UI accordingly
async function checkUserSession() {
    console.log('=== CHECKING USER SESSION (HOME) ===');
    sessionCheckInProgress = true;
    sessionCheckComplete = false;
    
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
        console.log('✅ Session check completed (HOME). User:', currentUser ? currentUser.username : 'not logged in');
    }
}

// Update UI for logged in user
function updateUIForLoggedInUser() {
    console.log('=== UPDATING UI FOR LOGGED IN USER (HOME) ===');
    
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
    console.log('=== UPDATING UI FOR LOGGED OUT USER (HOME) ===');
    
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
document.addEventListener('click', function(event) {
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
    console.log('=== LOGGING OUT (HOME) ===');
    
    try {
        const response = await fetch('php/logout.php', {
            method: 'POST',
            credentials: 'include'
        });
        
        const result = await response.json();
        console.log('Logout response:', result);
        
        if (response.ok && result.success) {
            console.log('✅ Logout successful');
            currentUser = null;
            updateUIForLoggedOutUser();
            showNotification('Logged out successfully!', 'success');
        } else {
            console.log('❌ Logout failed:', result.message);
            showNotification('Error logging out. Please try again.', 'error');
        }
    } catch (error) {
        console.error('❌ Logout error:', error);
        showNotification('Error logging out. Please try again.', 'error');
    }
}

// 🔐 AUTHENTICATION LAYER: Add item to cart with authentication check
async function addToCart(event, productId, price) {
    // Prevent card click event
    event.stopPropagation();
    
    console.log('=== ADD TO CART CLICKED (HOME PAGE) ===');
    console.log('Product ID:', productId, 'Price:', price);
    console.log('Session state - Complete:', sessionCheckComplete, 'In Progress:', sessionCheckInProgress, 'User:', currentUser?.username || 'null');
    
    // Wait for session check if in progress
    if (sessionCheckInProgress) {
        console.log('⏳ Waiting for session check to complete...');
        showNotification('Checking login status...', 'info');
        
        let waitTime = 0;
        while (sessionCheckInProgress && waitTime < 5000) {
            await new Promise(resolve => setTimeout(resolve, 100));
            waitTime += 100;
        }
        hideNotification();
    }
    
    // Fresh session check if no cached user
    if (!currentUser) {
        console.log('🔄 No cached user, doing fresh session check...');
        showNotification('Verifying login status...', 'info');
        
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
                updateUIForLoggedInUser();
            } else {
                console.log('❌ Fresh session check: user not logged in');
                hideNotification();
                showNotification('Please login to add items to your cart', 'warning');
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 1500);
                return;
            }
        } catch (error) {
            console.error('❌ Error in verification check:', error);
            hideNotification();
            showNotification('Error checking login status. Please try again.', 'error');
            return;
        }
        
        hideNotification();
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
    
    // FIXED: Add to both cart systems for compatibility
    // 1. Add to homepage cart (for modal display)
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
    
    // 2. Add to shared cart storage (for catalog/cart pages)
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

// FIXED: Update cart count - use shared cart storage
function updateCartCount() {
    // Use the shared cart storage that other pages use
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

// View product details
function viewProduct(productId) {
    const productNames = {
        'smartphone': 'ElectraPhone Pro Max',
        'laptop': 'UltraBook Elite X1',
        'headphones': 'SoundWave Pro Wireless',
        'smartwatch': 'TimeSync Smart Watch',
        'tablet': 'TabletPro Ultra 12',
        'speaker': 'BoomBox Smart Speaker'
    };
    
    showNotification(`Viewing ${productNames[productId]} details...`, 'info');
    
    // In a real app, you would navigate to product detail page:
    // window.location.href = `product-detail.html?id=${productId}`;
}

// Checkout function
function checkout() {
    if (cart.length === 0) {
        showNotification('Your cart is empty!', 'warning');
        return;
    }
    
    // Check if user is logged in before checkout
    if (!currentUser) {
        showNotification('Please login to continue with checkout', 'warning');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
        return;
    }
    
    // For demo purposes. In real app, would redirect to checkout page
    showNotification('Redirecting to secure checkout...', 'info');
    
    // Simulate checkout process
    setTimeout(() => {
        alert('Thank you for your purchase, ' + currentUser.username + '! Your order has been placed.');
        // Clear cart after successful checkout
        cart = [];
        localStorage.removeItem('cart'); // Clear shared cart too
        updateCartCount();
        updateCartDisplay();
        saveCartToStorage();
        toggleCart();
    }, 1000);
}

// 📢 NOTIFICATION SYSTEM: Show notification
function showNotification(message, type = 'success') {
    // Remove existing notification first
    hideNotification();
    
    let notification = document.createElement('div');
    notification.id = 'home-notification';
    
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
    const notification = document.getElementById('home-notification');
    if (notification && notification.parentNode) {
        notification.style.opacity = '0';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }
}

// FIXED: Save cart to localStorage using consistent storage
function saveCartToStorage() {
    try {
        // Save homepage cart format for modal display
        localStorage.setItem('electraedge_cart', JSON.stringify(cart));
        console.log('✅ Homepage cart saved to storage');
    } catch (error) {
        console.log('Storage not available in this environment');
    }
}

// FIXED: Load cart from localStorage - sync with shared cart
function loadCartFromStorage() {
    try {
        // Load shared cart first (for consistency with other pages)
        const sharedCart = JSON.parse(localStorage.getItem('cart')) || [];
        
        // Load homepage cart format
        const savedCart = localStorage.getItem('electraedge_cart');
        if (savedCart) {
            cart = JSON.parse(savedCart);
        }
        
        // Sync carts if they're out of sync
        syncCartSystems();
        
        updateCartCount();
        console.log('✅ Cart loaded from storage');
    } catch (error) {
        console.log('Storage not available in this environment');
    }
}

// Sync between homepage cart and shared cart
function syncCartSystems() {
    const sharedCart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // If shared cart has items but homepage cart doesn't, create placeholder items
    if (sharedCart.length > 0 && cart.length === 0) {
        sharedCart.forEach(productId => {
            // Create placeholder items for products in shared cart
            cart.push({
                id: productId,
                name: `Product ${productId}`,
                emoji: '📦',
                price: 0, // Will be updated when actual product info is available
                quantity: 1
            });
        });
        saveCartToStorage();
    }
}

// Handle window resize for responsive behavior
window.addEventListener('resize', function() {
    // Close cart modal on mobile if window is resized
    if (window.innerWidth < 768) {
        const modal = document.getElementById('cartModal');
        if (modal && modal.style.display === 'flex') {
            modal.style.display = 'none';
        }
    }
    
    // Close user dropdown on resize
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
    // Close cart modal with Escape key
    if (e.key === 'Escape') {
        const modal = document.getElementById('cartModal');
        if (modal && modal.style.display === 'flex') {
            toggleCart();
        }
        
        // Close user dropdown with Escape key
        const dropdownMenu = document.getElementById('userDropdownMenu');
        if (dropdownMenu && dropdownMenu.style.display === 'block') {
            dropdownMenu.style.display = 'none';
        }
    }
});

// 🔄 SESSION PERSISTENCE: Handle page navigation
window.addEventListener('beforeunload', function() {
    // Store session state in sessionStorage for quick recovery
    if (currentUser) {
        try {
            sessionStorage.setItem('tempUserSession', JSON.stringify({
                user: currentUser,
                timestamp: Date.now()
            }));
        } catch (error) {
            console.log('Cannot save temp session');
        }
    }
});

// Quick session recovery on page load
document.addEventListener('DOMContentLoaded', function() {
    try {
        const tempSession = sessionStorage.getItem('tempUserSession');
        if (tempSession) {
            const sessionData = JSON.parse(tempSession);
            const now = Date.now();
            
            // If temp session is less than 30 seconds old, use it temporarily
            if (now - sessionData.timestamp < 30000) {
                console.log('🔄 Using temporary session data');
                currentUser = sessionData.user;
                sessionCheckComplete = true;
                
                // Still do the real session check in background
                setTimeout(checkUserSession, 500);
            }
        }
    } catch (error) {
        console.log('Cannot load temp session');
    }
});