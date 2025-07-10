// header.js - SECURE VERSION - XSS vulnerabilities fixed

// XSS Prevention: HTML escaping function
function escapeHTML(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

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

    // Fetch and display user profile data
    fetchUserProfile();

    // Handle profile form submission
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', function (e) {
            e.preventDefault();
            clearProfileFormErrors();
            const formData = new FormData(profileForm);
            fetch('php/update_user_profile.php', {
                method: 'POST',
                credentials: 'include',
                body: formData
            })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    // Update UI with new data
                    document.getElementById('displayName').textContent = `${escapeHTML(data.user.first_name)} ${escapeHTML(data.user.last_name)}`.trim();
                    document.getElementById('fullNameDisplay').textContent = `${escapeHTML(data.user.first_name)} ${escapeHTML(data.user.last_name)}`.trim();
                    document.getElementById('emailDisplay').textContent = escapeHTML(data.user.email);
                    document.getElementById('phoneDisplay').textContent = escapeHTML(data.user.phone);
                    toggleEditMode();
                } else {
                    showProfileFormError(data.error || 'Failed to update profile.');
                }
            })
            .catch(() => {
                showProfileFormError('Failed to update profile.');
            });
        });
    }
});

function fetchUserProfile() {
    fetch('php/get_user_profile.php', {
        method: 'GET',
        credentials: 'include'
    })
    .then(res => res.json())
    .then(data => {
        if (data.success && data.user) {
            // Populate profile fields
            const user = data.user;
            document.getElementById('displayName').textContent = `${escapeHTML(user.first_name)} ${escapeHTML(user.last_name)}`.trim() || escapeHTML(user.username);
            document.getElementById('fullNameDisplay').textContent = `${escapeHTML(user.first_name)} ${escapeHTML(user.last_name)}`.trim();
            document.getElementById('emailDisplay').textContent = escapeHTML(user.email);
            document.getElementById('phoneDisplay').textContent = escapeHTML(user.phone);
        } else {
            setProfileError('Failed to load profile data.');
        }
    })
    .catch(() => {
        setProfileError('Failed to load profile data.');
    });
}

function setProfileError(msg) {
    document.getElementById('displayName').textContent = msg;
    document.getElementById('fullNameDisplay').textContent = msg;
    document.getElementById('emailDisplay').textContent = msg;
    document.getElementById('phoneDisplay').textContent = msg;
}

function clearProfileFormErrors() {
    document.getElementById('firstNameError').textContent = '';
    document.getElementById('lastNameError').textContent = '';
    document.getElementById('emailError').textContent = '';
    document.getElementById('phoneError').textContent = '';
    document.getElementById('verifyPasswordError').textContent = '';
}

function showProfileFormError(msg) {
    // Show error at the top or in a general way
    document.getElementById('firstNameError').textContent = msg;
}

// Handle session changes
function handleSessionChange(event, userData) {
    if (event === 'login' && userData) {
        renderUserDropdownSecurely(userData);
        fetchCartCount();
    } else if (event === 'logout') {
        renderLoginButtonSecurely();
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

// SECURITY FIX: Secure user dropdown rendering using DOM methods
function renderUserDropdownSecurely(user) {
    const nav = document.querySelector('.nav-actions');
    if (!nav) return;

    // Find and preserve the cart link
    const cartLink = nav.querySelector('a[href="cart.html"]');
    
    // Clear existing content
    nav.innerHTML = '';
    
    // Re-add cart link if it existed
    if (cartLink) {
        nav.appendChild(cartLink.cloneNode(true));
    }

    // Create user dropdown securely
    const userDropdown = document.createElement('div');
    userDropdown.className = 'user-dropdown';
    userDropdown.style.position = 'relative';

    // User button
    const userButton = document.createElement('button');
    userButton.style.cssText = 'background: none; border: none; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; color: white; font-size: 1rem;';
    userButton.onclick = toggleUserDropdown;
    userButton.textContent = `👤 ${user.username} ▼`;

    // Dropdown menu
    const dropdownMenu = document.createElement('div');
    dropdownMenu.id = 'userDropdownMenu';
    dropdownMenu.className = 'dropdown-menu';
    dropdownMenu.style.cssText = 'display:none; position: absolute; top: 100%; right: 0; background: white; border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 5px 15px rgba(0,0,0,0.2); min-width: 200px; z-index: 1000;';

    // User info section
    const userInfoDiv = document.createElement('div');
    userInfoDiv.style.cssText = 'padding: 1rem; border-bottom: 1px solid #eee; background: #f8f9fa; border-radius: 8px 8px 0 0;';

    const usernameDiv = document.createElement('div');
    usernameDiv.style.cssText = 'font-weight: bold; color: #333;';
    usernameDiv.textContent = user.username;
    userInfoDiv.appendChild(usernameDiv);

    const emailDiv = document.createElement('div');
    emailDiv.style.cssText = 'font-size: 0.9rem; color: #666;';
    emailDiv.textContent = user.email;
    userInfoDiv.appendChild(emailDiv);

    dropdownMenu.appendChild(userInfoDiv);

    // Menu items container
    const menuItemsDiv = document.createElement('div');
    menuItemsDiv.style.cssText = 'padding: 0.5rem 0;';

    // Profile link
    const profileLink = document.createElement('a');
    profileLink.href = 'userprofile.php';
    profileLink.style.cssText = 'display: block; padding: 0.75rem 1rem; color: #333; text-decoration: none; transition: background 0.2s;';
    profileLink.textContent = '👤 My Profile';
    profileLink.onmouseover = function() { this.style.background = '#f8f9fa'; };
    profileLink.onmouseout = function() { this.style.background = 'transparent'; };
    menuItemsDiv.appendChild(profileLink);

    // Orders link
    const ordersLink = document.createElement('a');
    ordersLink.href = 'my_orders.html';
    ordersLink.style.cssText = 'display: block; padding: 0.75rem 1rem; color: #333; text-decoration: none; transition: background 0.2s;';
    ordersLink.textContent = '📦 My Orders';
    ordersLink.onmouseover = function() { this.style.background = '#f8f9fa'; };
    ordersLink.onmouseout = function() { this.style.background = 'transparent'; };
    menuItemsDiv.appendChild(ordersLink);

    // Separator
    const separator = document.createElement('hr');
    separator.style.cssText = 'margin: 0.5rem 0; border: none; border-top: 1px solid #eee;';
    menuItemsDiv.appendChild(separator);

    // Logout button
    const logoutButton = document.createElement('button');
    logoutButton.onclick = logout;
    logoutButton.style.cssText = 'display: block; width: 100%; padding: 0.75rem 1rem; color: #dc3545; text-decoration: none; background: none; border: none; text-align: left; cursor: pointer; transition: background 0.2s;';
    logoutButton.textContent = '🚪 Logout';
    logoutButton.onmouseover = function() { this.style.background = '#f8f9fa'; };
    logoutButton.onmouseout = function() { this.style.background = 'transparent'; };
    menuItemsDiv.appendChild(logoutButton);

    dropdownMenu.appendChild(menuItemsDiv);

    userDropdown.appendChild(userButton);
    userDropdown.appendChild(dropdownMenu);
    nav.appendChild(userDropdown);
}

// SECURITY FIX: Secure login button rendering using DOM methods
function renderLoginButtonSecurely() {
    const nav = document.querySelector('.nav-actions');
    if (!nav) return;

    // Find and preserve the cart link
    const cartLink = nav.querySelector('a[href="cart.html"]');
    
    // Clear existing content
    nav.innerHTML = '';
    
    // Re-add cart link if it existed
    if (cartLink) {
        nav.appendChild(cartLink.cloneNode(true));
    }

    // Create login button securely
    const loginLink = document.createElement('a');
    loginLink.href = 'login.html';
    loginLink.className = 'btn btn-outline';
    loginLink.textContent = 'Login';
    nav.appendChild(loginLink);
}

// Keep original function names for backward compatibility
function renderUserDropdown(user) {
    renderUserDropdownSecurely(user);
}

function renderLoginButton() {
    renderLoginButtonSecurely();
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

// --- Profile Edit Mode Toggle ---
function toggleEditMode() {
    const displayMode = document.getElementById('displayMode');
    const editMode = document.getElementById('editMode');
    if (displayMode && editMode) {
        if (displayMode.style.display === 'none') {
            displayMode.style.display = '';
            editMode.style.display = 'none';
        } else {
            displayMode.style.display = 'none';
            editMode.style.display = '';
        }
    }
}

function cancelEdit() {
    toggleEditMode();
}

// --- Address Edit Mode Toggle ---
function toggleAddressEditMode() {
    const displayMode = document.getElementById('addressDisplayMode');
    const editMode = document.getElementById('addressEditMode');
    if (displayMode && editMode) {
        if (displayMode.style.display === 'none') {
            displayMode.style.display = '';
            editMode.style.display = 'none';
        } else {
            displayMode.style.display = 'none';
            editMode.style.display = '';
        }
    }
}

function cancelAddressEdit() {
    toggleAddressEditMode();
}

// --- Change Password Modal ---
function showChangePassword() {
    const modal = document.getElementById('changePasswordModal');
    if (modal) modal.style.display = 'flex';
}

function hideChangePassword() {
    const modal = document.getElementById('changePasswordModal');
    if (modal) modal.style.display = 'none';
}

// --- View Login Activity (placeholder) ---
function viewLoginActivity() {
    alert('Login activity feature coming soon!');
}

// --- Delete Account (placeholder) ---
function deleteAccount() {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
        alert('Account deletion feature coming soon!');
    }
}