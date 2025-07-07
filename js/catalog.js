// catalog.js - Product Catalog JavaScript with Session Management

let currentUser = null;

// Initialize page on load
document.addEventListener('DOMContentLoaded', function() {
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
        searchInput.addEventListener('input', function() {
            filterProducts(this.value);
        });
    }
    
    // Sort functionality
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            sortProducts(this.value);
        });
    }
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
        }
    } catch (error) {
        console.error('❌ Error checking session:', error);
        currentUser = null;
        updateUIForLoggedOutUser();
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

// Add to cart function 
function addToCart(productId) {
    if (!currentUser) {
        alert('Please log in to add items to your cart.');
        window.location.href = 'login.html';
        return;
    }

    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart.push(productId);
    localStorage.setItem('cart', JSON.stringify(cart));

    alert(`Product ${productId} added to cart!`);
}

// Handle Add to Cart button clicks
document.addEventListener('click', function (event) {
    if (event.target.classList.contains('add-to-cart-btn')) {
        const productId = event.target.getAttribute('data-product-id');
        addToCart(productId);
    }
});
