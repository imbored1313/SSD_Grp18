// userprofile.js - User Profile Page JavaScript with Database Integration
//testing

let currentUserData = null;

// Initialize page on load
document.addEventListener('DOMContentLoaded', function () {
    console.log('Profile page loaded, starting initialization...'); // Debug log

    // Only need session check - it will populate everything
    checkUserSession();
    initializeEventListeners();
});

// Check if user is logged in, redirect if not
async function checkUserSession()
{
    try {
        console.log('Checking user session...'); // Debug log

        const response = await fetch('php/check_session.php', {
            method: 'GET',
            credentials: 'include'
        });

        console.log('Session check response status:', response.status); // Debug log

        const result = await response.json();
        console.log('Session check result:', result); // Debug log

        if (!response.ok || !result.success || !result.user) {
            console.log('Session check failed, redirecting to login'); // Debug log
            // User not logged in, redirect to login
            window.location.href = 'login.html';
            return;
        }

        console.log('Session check successful, user:', result.user.username); // Debug log
        currentUserData = result.user;

        // Immediately update navigation and populate profile data
        updateNavigation();
        populateProfileData(currentUserData);
    } catch (error) {
        console.error('Session check error:', error);
        // On error, redirect to login immediately
        window.location.href = 'login.html';
    }
}

// Load user profile data from database
async function loadUserProfile()
{
    try {
        console.log('Loading user profile...'); // Debug log

        const response = await fetch('php/get_user_profile.php', {
            method: 'GET',
            credentials: 'include'
        });

        console.log('Profile load response status:', response.status); // Debug log

        const result = await response.json();
        console.log('Profile load result:', result); // Debug log

        if (response.ok && result.success) {
            populateProfileData(result.user);
        } else {
            showNotification('Error loading profile data: ' + (result.error || 'Unknown error'), 'error');
        }
    } catch (error) {
        console.error('Load profile error:', error);
        showNotification('Error loading profile data', 'error');
    }
}

// Populate profile data on the page
function populateProfileData(userData)
{
    console.log('Populating profile data:', userData); // Debug log

    // Update header info
    document.getElementById('displayName').textContent =
        userData.first_name && userData.last_name ?
        `${userData.first_name} ${userData.last_name}` :
        userData.username;


    // Update display mode fields
    document.getElementById('fullNameDisplay').textContent =
        userData.first_name && userData.last_name ?
        `${userData.first_name} ${userData.last_name}` :
        'Not provided';

    document.getElementById('emailDisplay').textContent = userData.email;
    document.getElementById('phoneDisplay').textContent = userData.phone || 'Not provided';

    // Update form fields
    document.getElementById('firstName').value = userData.first_name || '';
    document.getElementById('lastName').value = userData.last_name || '';
    document.getElementById('email').value = userData.email;
    document.getElementById('phone').value = userData.phone || '';
}

// Initialize all event listeners
function initializeEventListeners()
{
    // Password strength checker for new password
    const newPasswordInput = document.getElementById('newPassword');
    if (newPasswordInput) {
        newPasswordInput.addEventListener('input', function (e) {
            checkPasswordStrength(e.target.value);
        });
    }

    // Profile form submission
    document.getElementById('profileForm').addEventListener('submit', handleProfileUpdate);

    // Address form submission (placeholder for now)
    document.getElementById('addressForm').addEventListener('submit', handleAddressUpdate);

    // Change password form submission
    document.getElementById('changePasswordForm').addEventListener('submit', handlePasswordChange);

    // Preferences form submission (placeholder for now)
    document.getElementById('preferencesForm').addEventListener('submit', handlePreferencesUpdate);
}

// Handle profile update
async function handleProfileUpdate(e)
{
    e.preventDefault();

    // Clear previous errors
    document.querySelectorAll('.form-error').forEach(el => el.textContent = '');

    const formData = new FormData();
    formData.append('firstName', document.getElementById('firstName').value.trim());
    formData.append('lastName', document.getElementById('lastName').value.trim());
    formData.append('email', document.getElementById('email').value.trim());
    formData.append('phone', document.getElementById('phone').value.trim());

    // Client-side validation
    const firstName = formData.get('firstName');
    const lastName = formData.get('lastName');
    const email = formData.get('email');

    let isValid = true;

    if (!firstName) {
        document.getElementById('firstNameError').textContent = 'First name is required';
        isValid = false;
    }

    if (!lastName) {
        document.getElementById('lastNameError').textContent = 'Last name is required';
        isValid = false;
    }

    if (!email) {
        document.getElementById('emailError').textContent = 'Email is required';
        isValid = false;
    } else if (!isValidEmail(email)) {
        document.getElementById('emailError').textContent = 'Please enter a valid email address';
        isValid = false;
    }

    if (!isValid) {
        return;
    }

    // Add loading state
    const submitBtn = this.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.classList.add('loading');
    submitBtn.textContent = 'Saving...';
    submitBtn.disabled = true;

    try {
        const response = await fetch('php/update_user_profile.php', {
            method: 'POST',
            body: formData,
            credentials: 'include'
        });

        const result = await response.json();

        if (response.ok && result.success) {
            // Update display values
            populateProfileData({
                ...currentUserData,
                first_name: firstName,
                last_name: lastName,
                email: email,
                phone: formData.get('phone')
            });

            showNotification('Profile updated successfully!', 'success');
            cancelEdit();
        } else {
            showNotification('Error updating profile: ' + (result.error || 'Unknown error'), 'error');
        }
    } catch (error) {
        console.error('Profile update error:', error);
        showNotification('Error updating profile. Please try again.', 'error');
    } finally {
        // Reset button
        submitBtn.classList.remove('loading');
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

// Handle password change
async function handlePasswordChange(e)
{
    e.preventDefault();

    // Clear previous errors
    document.querySelectorAll('#changePasswordModal .form-error').forEach(el => el.textContent = '');

    const formData = new FormData();
    formData.append('currentPassword', document.getElementById('currentPassword').value);
    formData.append('newPassword', document.getElementById('newPassword').value);
    formData.append('confirmNewPassword', document.getElementById('confirmNewPassword').value);

    const currentPassword = formData.get('currentPassword');
    const newPassword = formData.get('newPassword');
    const confirmNewPassword = formData.get('confirmNewPassword');

    let isValid = true;

    if (!currentPassword) {
        document.getElementById('currentPasswordError').textContent = 'Current password is required';
        isValid = false;
    }

    if (!newPassword || newPassword.length < 8) {
        document.getElementById('newPasswordError').textContent = 'New password must be at least 8 characters';
        isValid = false;
    }

    if (newPassword !== confirmNewPassword) {
        document.getElementById('confirmNewPasswordError').textContent = 'Passwords do not match';
        isValid = false;
    }

    if (!isValid) {
        return;
    }

    const submitBtn = this.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.classList.add('loading');
    submitBtn.textContent = 'Updating...';
    submitBtn.disabled = true;

    try {
        const response = await fetch('php/change_password.php', {
            method: 'POST',
            body: formData,
            credentials: 'include'
        });

        const result = await response.json();

        if (response.ok && result.success) {
            showNotification('Password changed successfully!', 'success');
            hideChangePassword();
        } else {
            if (result.error === 'Current password is incorrect') {
                document.getElementById('currentPasswordError').textContent = result.error;
            } else {
                showNotification('Error changing password: ' + (result.error || 'Unknown error'), 'error');
            }
        }
    } catch (error) {
        console.error('Password change error:', error);
        showNotification('Error changing password. Please try again.', 'error');
    } finally {
        // Reset button
        submitBtn.classList.remove('loading');
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

// Handle address update (placeholder for now)
function handleAddressUpdate(e)
{
    e.preventDefault();

    const submitBtn = this.querySelector('button[type="submit"]');
    submitBtn.classList.add('loading');
    submitBtn.textContent = 'Saving...';

    setTimeout(() => {
        const street = document.getElementById('street').value;
        const city = document.getElementById('city').value;
        const state = document.getElementById('state').value;
        const zipCode = document.getElementById('zipCode').value;
        const country = document.getElementById('country').options[document.getElementById('country').selectedIndex].text;

        document.getElementById('addressDisplay').innerHTML = `
            < p > < strong > Primary Address: < / strong > < / p >
            < p > ${street} < br >
            ${city}, ${state} ${zipCode} < br >
            ${country} < / p >
        `;

        submitBtn.classList.remove('loading');
        submitBtn.textContent = 'Save Address';

        showNotification('Address updated successfully!', 'success');
        cancelAddressEdit();
    }, 1000);
}

// Handle preferences update (placeholder for now)
function handlePreferencesUpdate(e)
{
    e.preventDefault();

    const submitBtn = this.querySelector('button[type="submit"]');
    submitBtn.classList.add('loading');
    submitBtn.textContent = 'Saving...';

    setTimeout(() => {
        showNotification('Preferences saved successfully!', 'success');
        submitBtn.classList.remove('loading');
        submitBtn.textContent = 'Save Preferences';
    }, 1000);
}

// Utility functions
function isValidEmail(email)
{
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showNotification(message, type = 'info')
{
    // Create notification element if it doesn't exist
    let notification = document.getElementById('profileNotification');
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'profileNotification';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 2rem;
            border - radius: 8px;
            z - index: 3000;
            box - shadow: 0 5px 15px rgba(0,0,0,0.2);
            font - weight: 500;
        `;
        document.body.appendChild(notification);
    }

    // Set message and style based on type
    notification.textContent = message;

    if (type === 'success') {
        notification.style.background = '#28a745';
        notification.style.color = 'white';
    } else if (type === 'error') {
        notification.style.background = '#dc3545';
        notification.style.color = 'white';
    } else {
        notification.style.background = '#17a2b8';
        notification.style.color = 'white';
    }

    notification.style.display = 'block';

    // Auto-hide after 4 seconds
    setTimeout(() => {
        notification.style.display = 'none';
    }, 4000);
}

// Toggle edit mode for profile
function toggleEditMode()
{
    const displayMode = document.getElementById('displayMode');
    const editMode = document.getElementById('editMode');

    if (displayMode.style.display === 'none') {
        displayMode.style.display = 'block';
        editMode.style.display = 'none';
    } else {
        displayMode.style.display = 'none';
        editMode.style.display = 'block';
    }
}

function cancelEdit()
{
    document.getElementById('displayMode').style.display = 'block';
    document.getElementById('editMode').style.display = 'none';

    // Reset form to original values if user cancels
    if (currentUserData) {
        document.getElementById('firstName').value = currentUserData.first_name || '';
        document.getElementById('lastName').value = currentUserData.last_name || '';
        document.getElementById('email').value = currentUserData.email;
        document.getElementById('phone').value = currentUserData.phone || '';
    }

    // Clear any error messages
    document.querySelectorAll('.form-error').forEach(el => el.textContent = '');
}

// Toggle edit mode for address
function toggleAddressEditMode()
{
    const displayMode = document.getElementById('addressDisplayMode');
    const editMode = document.getElementById('addressEditMode');

    if (displayMode.style.display === 'none') {
        displayMode.style.display = 'block';
        editMode.style.display = 'none';
    } else {
        displayMode.style.display = 'none';
        editMode.style.display = 'block';
    }
}

function cancelAddressEdit()
{
    document.getElementById('addressDisplayMode').style.display = 'block';
    document.getElementById('addressEditMode').style.display = 'none';
}

// Show/hide change password modal
function showChangePassword()
{
    document.getElementById('changePasswordModal').style.display = 'flex';
}

function hideChangePassword()
{
    document.getElementById('changePasswordModal').style.display = 'none';
    document.getElementById('changePasswordForm').reset();
    // Clear any previous error messages
    document.querySelectorAll('#changePasswordModal .form-error').forEach(el => el.textContent = '');
    document.getElementById('newPasswordStrength').textContent = '';
}

// Password strength checker
function checkPasswordStrength(password)
{
    const strengthElement = document.getElementById('newPasswordStrength');
    let strength = 0;
    let feedback = [];

    if (password.length >= 8) {
        strength++;
    } else {
        feedback.push('at least 8 characters');
    }

    if (/[A-Z]/.test(password)) {
        strength++;
    } else {
        feedback.push('an uppercase letter');
    }

    if (/[a-z]/.test(password)) {
        strength++;
    } else {
        feedback.push('a lowercase letter');
    }

    if (/[0-9]/.test(password)) {
        strength++;
    } else {
        feedback.push('a number');
    }

    if (/[^A-Za-z0-9]/.test(password)) {
        strength++;
    } else {
        feedback.push('a special character');
    }

    const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
    const strengthColors = ['#dc3545', '#fd7e14', '#ffc107', '#28a745', '#20c997'];

    if (password.length > 0) {
        strengthElement.textContent = `Password strength: ${strengthLabels[strength - 1] || 'Very Weak'}`;
        strengthElement.style.color = strengthColors[strength - 1] || '#dc3545';

        if (feedback.length > 0) {
            strengthElement.textContent += `(needs: ${feedback.join(', ')})`;
        }
    } else {
        strengthElement.textContent = '';
    }
}

// Other functions (placeholders for future implementation)
function setup2FA()
{
    showNotification('2FA setup will be implemented in the next phase', 'info');
}

function viewLoginActivity()
{
    showNotification('Login activity feature will be implemented in the next phase', 'info');
}

function downloadData()
{
    showNotification('Data download will be implemented in the next phase', 'info');
}

function deleteAccount()
{
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
        showNotification('Account deletion will be implemented in the next phase', 'info');
    }
}

// Navigation management (same as index.js)
function updateNavigation()
{
    if (currentUserData) {
        updateUIForLoggedInUser();
    } else {
        updateUIForLoggedOutUser();
    }
}

// Update UI for logged in user
function updateUIForLoggedInUser()
{
    const navActions = document.querySelector('.nav-actions');
    const userNavigation = document.getElementById('userNavigation');

    if (userNavigation) {
        // Replace login button with user dropdown
        userNavigation.innerHTML = `
            <div class="user-dropdown" style="position: relative;">
                <button class="user-btn" onclick="toggleUserDropdown()" style="background: none; border: none; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; color: white; font-size: 1rem;">
                    <span style="font-size: 1.5rem;">👤</span>
                    <span>Hi, ${currentUserData.username}</span>
                    <span style="font-size: 0.8rem;">▼</span>
                </button>
                <div id="userDropdownMenu" class="dropdown-menu" style="display: none; position: absolute; top: 100%; right: 0; background: white; border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 5px 15px rgba(0,0,0,0.2); min-width: 200px; z-index: 1000;">
                    <div style="padding: 1rem; border-bottom: 1px solid #eee; background: #f8f9fa; border-radius: 8px 8px 0 0;">
                        <div style="font-weight: bold; color: #333;">${currentUserData.username}</div>
                        <div style="font-size: 0.9rem; color: #666;">${currentUserData.email}</div>
                    </div>
                    <div style="padding: 0.5rem 0;">
                        <a href="userprofile.html" style="display: block; padding: 0.75rem 1rem; color: #333; text-decoration: none; transition: background 0.2s; background: #f0f0f0;" onmouseover="this.style.background='#e0e0e0'" onmouseout="this.style.background='#f0f0f0'">
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
    }
}

// Update UI for logged out user
function updateUIForLoggedOutUser()
{
    const userNavigation = document.getElementById('userNavigation');

    if (userNavigation) {
        // Replace user dropdown with login button
        userNavigation.innerHTML = '<a href="login.html" class="btn btn-outline">Login</a>';
    }
}

// Toggle user dropdown menu
function toggleUserDropdown()
{
    const dropdownMenu = document.getElementById('userDropdownMenu');
    if (dropdownMenu) {
        dropdownMenu.style.display = dropdownMenu.style.display === 'none' ? 'block' : 'none';
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
async function logout()
{
    try {
        const response = await fetch('php/logout.php', {
            method: 'POST',
            credentials: 'include'
        });

        const result = await response.json();

        if (response.ok && result.success) {
            showNotification('Logged out successfully!', 'success');

            // Redirect to home page after logout
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        } else {
            showNotification('Error logging out. Please try again.', 'error');
        }
    } catch (error) {
        console.error('Logout error:', error);
        showNotification('Error logging out. Please try again.', 'error');
    }
}