// js/userprofile.js - SECURE VERSION - XSS vulnerabilities fixed

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

// Check user session and redirect if not logged in
function checkUserSession() {
    if (window.sessionManager && !window.sessionManager.isLoggedIn()) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    // Check session first
    if (!checkUserSession()) {
        return;
    }
    
    // Load user profile data
    loadUserProfile();
    
    // Set up event listeners
    setupEventListeners();
});

// SECURITY FIX: Load and display user profile securely
async function loadUserProfile() {
    try {
        const response = await fetch('php/get_user_profile.php', {
            method: 'GET',
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success && data.user) {
            displayUserProfileSecurely(data.user);
        } else {
            showError('Failed to load profile: ' + (data.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error loading profile:', error);
        showError('Failed to load profile data. Please try again.');
    }
}

// SECURITY FIX: Display user profile using DOM methods
function displayUserProfileSecurely(user) {
    // Update profile display securely
    updateElementText('profile-username', user.username);
    updateElementText('profile-email', user.email);
    updateElementText('profile-name', `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Not provided');
    updateElementText('profile-phone', user.phone || 'Not provided');

    // Update form fields securely using value property
    updateInputValue('firstName', user.first_name);
    updateInputValue('lastName', user.last_name);
    updateInputValue('email', user.email);
    updateInputValue('phone', user.phone);

    // Update user navigation securely
    updateUserNavigationSecurely(user);
}

// SECURITY FIX: Update user navigation using DOM methods
function updateUserNavigationSecurely(user) {
    const userNavigation = document.getElementById('userNavigation');
    if (!userNavigation) return;

    // Find and preserve the cart link
    const cartLink = userNavigation.querySelector('a[href="cart.html"]');
    
    // Clear existing content
    userNavigation.innerHTML = '';
    
    // Re-add cart link if it existed
    if (cartLink) {
        userNavigation.appendChild(cartLink.cloneNode(true));
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
    userNavigation.appendChild(userDropdown);
}

// Helper functions for secure DOM updates
function updateElementText(elementId, text) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = text || '';
    }
}

function updateInputValue(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) {
        element.value = value || '';
    }
}

// Toggle user dropdown
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

// Setup event listeners
function setupEventListeners() {
    // Profile update form
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', handleProfileUpdate);
    }

    // Password change form
    const passwordForm = document.getElementById('passwordForm');
    if (passwordForm) {
        passwordForm.addEventListener('submit', handlePasswordChange);
    }

    // Account deletion
    const deleteAccountBtn = document.getElementById('deleteAccountBtn');
    if (deleteAccountBtn) {
        deleteAccountBtn.addEventListener('click', handleAccountDeletion);
    }
}

// Handle profile update
async function handleProfileUpdate(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    
    try {
        const response = await fetch('php/update_user_profile.php', {
            method: 'POST',
            credentials: 'include',
            body: formData
        });

        const data = await response.json();

        if (data.success) {
            showSuccess('Profile updated successfully!');
            // Reload profile data to reflect changes
            await loadUserProfile();
        } else {
            showError('Failed to update profile: ' + (data.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('Profile update error:', error);
        showError('Failed to update profile. Please try again.');
    }
}

// Handle password change
async function handlePasswordChange(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    
    // Client-side validation
    const newPassword = formData.get('newPassword');
    const confirmPassword = formData.get('confirmNewPassword');
    
    if (newPassword !== confirmPassword) {
        showError('New passwords do not match.');
        return;
    }

    try {
        const response = await fetch('php/change_password.php', {
            method: 'POST',
            credentials: 'include',
            body: formData
        });

        const data = await response.json();

        if (data.success) {
            showSuccess('Password changed successfully!');
            event.target.reset(); // Clear form
        } else {
            showError('Failed to change password: ' + (data.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('Password change error:', error);
        showError('Failed to change password. Please try again.');
    }
}

// Handle account deletion
async function handleAccountDeletion() {
    const confirmPassword = prompt('Please enter your password to confirm account deletion:');
    if (!confirmPassword) {
        return;
    }

    if (!confirm('Are you absolutely sure you want to delete your account? This action cannot be undone.')) {
        return;
    }

    try {
        const formData = new FormData();
        formData.append('confirmPassword', confirmPassword);

        const response = await fetch('php/delete_account.php', {
            method: 'POST',
            credentials: 'include',
            body: formData
        });

        const data = await response.json();

        if (data.success) {
            showSuccess('Account deleted successfully. You will be redirected to the home page.');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
        } else {
            showError('Failed to delete account: ' + (data.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('Account deletion error:', error);
        showError('Failed to delete account. Please try again.');
    }
}

// Logout function
async function logout() {
    try {
        // Get CSRF token first
        const csrfResponse = await fetch('php/get_csrf_token.php', {
            method: 'GET',
            credentials: 'include'
        });
        
        if (!csrfResponse.ok) {
            throw new Error('Failed to get CSRF token');
        }
        
        const csrfData = await csrfResponse.json();
        const csrfToken = csrfData.token;

        // Create form data with CSRF token
        const formData = new FormData();
        formData.append('csrf_token', csrfToken);

        const response = await fetch('php/logout.php', {
            method: 'POST',
            credentials: 'include',
            body: formData
        });

        const result = await response.json();

        if (response.ok && result.success) {
            showSuccess('Logged out successfully!');

            // Update session manager
            if (window.sessionManager) {
                window.sessionManager.currentUser = null;
                window.sessionManager.sessionCheckComplete = false;
            }

            // Redirect to home page after logout
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        } else {
            showError('Error logging out. Please try again.');
        }
    } catch (error) {
        console.error('Logout error:', error);
        showError('Error logging out. Please try again.');
    }
}

// SECURITY FIX: Secure notification functions
function showSuccess(message) {
    showNotification(message, 'success');
}

function showError(message) {
    showNotification(message, 'error');
}

function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existing = document.querySelectorAll('.profile-notification');
    existing.forEach(el => el.remove());
    
    const notification = document.createElement('div');
    notification.className = `profile-notification alert alert-${type === 'error' ? 'danger' : type === 'success' ? 'success' : 'info'}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        max-width: 400px;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        font-family: Arial, sans-serif;
        background: ${type === 'success' ? '#d4edda' : type === 'error' ? '#f8d7da' : '#d1ecf1'};
        color: ${type === 'success' ? '#155724' : type === 'error' ? '#721c24' : '#0c5460'};
        border: 1px solid ${type === 'success' ? '#c3e6cb' : type === 'error' ? '#f5c6cb' : '#bee5eb'};
    `;
    
    notification.textContent = message; // Safe text insertion
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}