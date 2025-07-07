// cart.js - Shopping Cart JavaScript with Session Management

let currentUser = null;
let sessionCheckComplete = false;

// Initialize page on load
document.addEventListener('DOMContentLoaded', function() {
    console.log('=== CART PAGE LOADED ===');

    // Start session check immediately
    checkUserSession();

    // Initialize cart features
    initializeCartFeatures();
});

// Initialize cart features
function initializeCartFeatures() {
    // Load and display cart items
    loadCartItems();
    console.log('Cart features initialized');
}

// Check user session and update UI accordingly
async function checkUserSession() {
    console.log('=== CHECKING USER SESSION ===');

    try {
        console.log('Making request to php/check_session.php');

        const response = await fetch('php/check_session.php', {
            method: 'GET',
            credentials: 'include'
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
            // Only redirect after a delay to allow cart items to load for guests
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        }
    } catch (error) {
        console.error('❌ Error checking session:', error);
        currentUser = null;
        updateUIForLoggedOutUser();
        // Only redirect after a delay on error
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
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

    // Fetch product details for cart items
    fetch('get_products.php')
        .then(response => response.json())
        .then(products => {
            const cartItems = products.filter(p => cartIds.includes(p.product_id.toString()));
            displayCartItems(cartItems);
        })
        .catch(error => {
            console.error('Error loading cart items:', error);
            displayEmptyCart();
        });
}

// Display cart items (this will be overridden by cart.html)
function displayCartItems(cartItems) {
    const cartSummary = document.getElementById('cart-summary');
    let total = 0;
    let cartHTML = '';

    cartItems.forEach(item => {
        const price = parseFloat(item.price);
        total += price;

        cartHTML += `
            <div class="cart-item" style="display: flex; align-items: center; padding: 1rem; border-bottom: 1px solid #eee; gap: 1rem;">
                <img src="${item.image_path}" alt="${item.name}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px;">
                <div style="flex: 1;">
                    <h3 style="margin: 0 0 0.5rem 0; font-size: 1.1rem;">${item.name}</h3>
                    <p style="margin: 0; color: #666; font-size: 0.9rem;">${item.description}</p>
                    <p style="margin: 0.5rem 0 0 0; font-weight: bold; color: #333;">$${price.toFixed(2)}</p>
                </div>
                <button onclick="removeFromCart('${item.product_id}')" style="background: #dc3545; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer;">
                    Remove
                </button>
            </div>
        `;
    });

    cartHTML += `
        <div style="padding: 1rem; text-align: right; font-size: 1.2rem; font-weight: bold; border-top: 2px solid #333;">
            Total: $${total.toFixed(2)}
        </div>
    `;

    cartSummary.innerHTML = cartHTML;
}

// Display empty cart message (this will be overridden by cart.html)
function displayEmptyCart() {
    const cartSummary = document.getElementById('cart-summary');
    cartSummary.innerHTML = `
        <div style="text-align: center; padding: 2rem;">
            <div style="font-size: 4rem; margin-bottom: 1rem;">🛒</div>
            <h3>Your cart is empty</h3>
            <p style="color: #666; margin-bottom: 2rem;">Start shopping to add items to your cart!</p>
            <a href="catalog.html" class="btn btn-primary">Browse Products</a>
        </div>
    `;
}

// Remove item from cart
function removeFromCart(productId) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart = cart.filter(id => id !== productId.toString());
    localStorage.setItem('cart', JSON.stringify(cart));

    // Reload cart items
    loadCartItems();

    // Update cart count in header if function exists
    if (typeof updateCartCount === 'function') {
        updateCartCount();
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