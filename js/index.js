// index.js - ElectraEdge Homepage JavaScript with COMPLETE FIXED Session Management

// Shopping cart functionality
let cart = [];
let currentUser = null;
let sessionCheckComplete = false;

// Initialize page on load
document.addEventListener('DOMContentLoaded', function() {
    console.log('=== HOME PAGE LOADED ===');
    updateCartCount();
    loadCartFromStorage();
    
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
    console.log('=== CHECKING USER SESSION ===');
    
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
        sessionCheckComplete = true;
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
    console.log('=== LOGGING OUT ===');
    
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
function addToCart(event, productId, price) {
    // Prevent card click event
    event.stopPropagation();
    
    console.log('=== ADD TO CART CLICKED (HOME PAGE) ===');
    console.log('Product ID:', productId, 'Price:', price);
    console.log('Current user:', currentUser?.username || 'not logged in');
    
    // Check if user is logged in
    if (!currentUser) {
        showNotification('Please login to add items to your cart', 'warning');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
        return;
    }
    
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
    
    // Check if item already exists in cart
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
    
    updateCartCount();
    saveCartToStorage();
}

// Update cart count in header
function updateCartCount() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCountElement = document.getElementById('cartCount');
    if (cartCountElement) {
        cartCountElement.textContent = totalItems;
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
    cart = cart.filter(item => item.id !== productId);
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

// Save cart to localStorage
function saveCartToStorage() {
    try {
        localStorage.setItem('electraedge_cart', JSON.stringify(cart));
    } catch (error) {
        console.log('Storage not available in this environment');
    }
}

// Load cart from localStorage
function loadCartFromStorage() {
    try {
        const savedCart = localStorage.getItem('electraedge_cart');
        if (savedCart) {
            cart = JSON.parse(savedCart);
            updateCartCount();
        }
    } catch (error) {
        console.log('Storage not available in this environment');
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