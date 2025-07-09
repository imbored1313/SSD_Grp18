// header.js - SIMPLIFIED using session manager
document.addEventListener('DOMContentLoaded', function () {
    const placeholder = document.getElementById('header-placeholder');

    fetch('header.html')
        .then(res => res.text())
        .then(data => {
            placeholder.innerHTML = data;
            highlightActiveTab();
            
            // Set up session change listeners
            window.sessionManager.onSessionChange(handleSessionChange);
            
            // Initial check for existing session
            if (window.sessionManager.isLoggedIn()) {
                handleSessionChange('login', window.sessionManager.getUser());
            }
        })
        .catch(error => {
            console.error('Error loading header:', error);
        });

    function highlightActiveTab() {
        const currentPath = window.location.pathname.split("/").pop();
        document.querySelectorAll(".nav-menu a").forEach(link => {
            const href = link.getAttribute("href");
            if (currentPath.includes(href)) {
                link.classList.add("active");
            }
        });
    }

    // Cross-tab cart sync
    window.addEventListener("storage", (event) => {
        if (event.key === "cartUpdated" || event.key === "cart") {
            fetchCartCount();
        }
    });
});

// Handle session changes
function handleSessionChange(event, userData) {
    if (event === 'login' && userData) {
        renderUserDropdown(userData);
        fetchCartCount();
    } else if (event === 'logout') {
        renderLoginButton();
        updateCartCount(0);
    }
}

function fetchCartCount() {
    if (!window.sessionManager.isLoggedIn()) {
        updateCartCount(0);
        return;
    }

    fetch('php/get_cart.php', {
        method: 'GET',
        credentials: 'include'
    })
    .then(res => res.json())
    .then(data => {
        const count = data.success ? data.cartCount || 0 : 0;
        updateCartCount(count);
    })
    .catch(() => updateCartCount(0));
}

function updateCartCount(count = 0) {
    const span = document.getElementById('cartCount');
    if (span) {
        span.textContent = count;
    }
}

function renderUserDropdown(user) {
    const nav = document.querySelector('.nav-actions');
    if (!nav) return;

    // Find and preserve the cart link
    const cartLink = nav.querySelector('a[href="cart.html"]');
    const cartHTML = cartLink ? cartLink.outerHTML : '';

    nav.innerHTML = `
        ${cartHTML}
        <div class="user-dropdown" style="position: relative;">
            <button onclick="toggleUserDropdown()" style="background: none; border: none; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; color: white; font-size: 1rem;">
                👤 ${user.username} ▼
            </button>
            <div id="userDropdownMenu" class="dropdown-menu" style="display:none; position: absolute; top: 100%; right: 0; background: white; border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 5px 15px rgba(0,0,0,0.2); min-width: 200px; z-index: 1000;">
                <div style="padding: 1rem; border-bottom: 1px solid #eee; background: #f8f9fa; border-radius: 8px 8px 0 0;">
                    <div style="font-weight: bold; color: #333;">${user.username}</div>
                    <div style="font-size: 0.9rem; color: #666;">${user.email}</div>
                </div>
                <div style="padding: 0.5rem 0;">
                    <a href="userprofile.html" style="display: block; padding: 0.75rem 1rem; color: #333; text-decoration: none; transition: background 0.2s;" onmouseover="this.style.background='#f8f9fa'" onmouseout="this.style.background='transparent'">
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

function renderLoginButton() {
    const nav = document.querySelector('.nav-actions');
    if (!nav) return;

    // Find and preserve the cart link
    const cartLink = nav.querySelector('a[href="cart.html"]');
    const cartHTML = cartLink ? cartLink.outerHTML : '';

    nav.innerHTML = `
        ${cartHTML}
        <a href="login.html" class="btn btn-outline">Login</a>
    `;
}

function toggleUserDropdown() {
    const menu = document.getElementById('userDropdownMenu');
    if (menu) {
        menu.style.display = (menu.style.display === 'none') ? 'block' : 'none';
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

// Logout using session manager
async function logout() {
    await window.sessionManager.logout();
}