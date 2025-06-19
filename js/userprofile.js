// userprofile.js - User Profile Page JavaScript

// Toggle edit mode for profile
function toggleEditMode() {
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

function cancelEdit() {
    document.getElementById('displayMode').style.display = 'block';
    document.getElementById('editMode').style.display = 'none';
}

// Toggle edit mode for address
function toggleAddressEditMode() {
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

function cancelAddressEdit() {
    document.getElementById('addressDisplayMode').style.display = 'block';
    document.getElementById('addressEditMode').style.display = 'none';
}

// Show/hide change password modal
function showChangePassword() {
    document.getElementById('changePasswordModal').style.display = 'flex';
}

function hideChangePassword() {
    document.getElementById('changePasswordModal').style.display = 'none';
    document.getElementById('changePasswordForm').reset();
    // Clear any previous error messages
    document.querySelectorAll('#changePasswordModal .form-error').forEach(el => el.textContent = '');
    document.getElementById('newPasswordStrength').textContent = '';
}

// Password strength checker
function checkPasswordStrength(password) {
    const strengthElement = document.getElementById('newPasswordStrength');
    let strength = 0;
    let feedback = [];
    
    if (password.length >= 8) strength++;
    else feedback.push('at least 8 characters');
    
    if (/[A-Z]/.test(password)) strength++;
    else feedback.push('an uppercase letter');
    
    if (/[a-z]/.test(password)) strength++;
    else feedback.push('a lowercase letter');
    
    if (/[0-9]/.test(password)) strength++;
    else feedback.push('a number');
    
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    else feedback.push('a special character');
    
    const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
    const strengthColors = ['#dc3545', '#fd7e14', '#ffc107', '#28a745', '#20c997'];
    
    if (password.length > 0) {
        strengthElement.textContent = `Password strength: ${strengthLabels[strength - 1] || 'Very Weak'}`;
        strengthElement.style.color = strengthColors[strength - 1] || '#dc3545';
        
        if (feedback.length > 0) {
            strengthElement.textContent += ` (needs: ${feedback.join(', ')})`;
        }
    } else {
        strengthElement.textContent = '';
    }
}

// Other functions
function setup2FA() {
    alert('2FA setup will be implemented in the next phase');
}

function viewLoginActivity() {
    alert('Login activity feature will be implemented in the next phase');
}

function downloadData() {
    alert('Data download will be implemented in the next phase');
}

function deleteAccount() {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
        alert('Account deletion will be implemented in the next phase');
    }
}

// Initialize event listeners when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    
    // Password strength checker for new password
    const newPasswordInput = document.getElementById('newPassword');
    if (newPasswordInput) {
        newPasswordInput.addEventListener('input', function(e) {
            checkPasswordStrength(e.target.value);
        });
    }
    
    // Profile form submission
    document.getElementById('profileForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Add loading state
        const submitBtn = this.querySelector('button[type="submit"]');
        submitBtn.classList.add('loading');
        submitBtn.textContent = 'Saving...';
        
        // Simulate API call
        setTimeout(() => {
            // Update display values
            const firstName = document.getElementById('firstName').value;
            const lastName = document.getElementById('lastName').value;
            const email = document.getElementById('email').value;
            const phone = document.getElementById('phone').value;
            const dob = new Date(document.getElementById('dateOfBirth').value);
            
            document.getElementById('fullNameDisplay').textContent = `${firstName} ${lastName}`;
            document.getElementById('emailDisplay').textContent = email;
            document.getElementById('phoneDisplay').textContent = phone;
            document.getElementById('dobDisplay').textContent = dob.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            document.getElementById('displayName').textContent = `${firstName} ${lastName}`;
            
            submitBtn.classList.remove('loading');
            submitBtn.textContent = 'Save Changes';
            
            alert('Profile updated successfully!');
            cancelEdit();
        }, 1000);
    });
    
    // Address form submission
    document.getElementById('addressForm').addEventListener('submit', function(e) {
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
                <p><strong>Primary Address:</strong></p>
                <p>${street}<br>
                ${city}, ${state} ${zipCode}<br>
                ${country}</p>
            `;
            
            submitBtn.classList.remove('loading');
            submitBtn.textContent = 'Save Address';
            
            alert('Address updated successfully!');
            cancelAddressEdit();
        }, 1000);
    });
    
    // Change password form submission
    document.getElementById('changePasswordForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Clear previous errors
        document.querySelectorAll('#changePasswordModal .form-error').forEach(el => el.textContent = '');
        
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmNewPassword = document.getElementById('confirmNewPassword').value;
        
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
        
        if (isValid) {
            const submitBtn = this.querySelector('button[type="submit"]');
            submitBtn.classList.add('loading');
            submitBtn.textContent = 'Updating...';
            
            setTimeout(() => {
                alert('Password updated successfully!');
                hideChangePassword();
                submitBtn.classList.remove('loading');
                submitBtn.textContent = 'Update Password';
            }, 1000);
        }
    });
    
    // Preferences form submission
    document.getElementById('preferencesForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const submitBtn = this.querySelector('button[type="submit"]');
        submitBtn.classList.add('loading');
        submitBtn.textContent = 'Saving...';
        
        setTimeout(() => {
            alert('Preferences saved successfully!');
            submitBtn.classList.remove('loading');
            submitBtn.textContent = 'Save Preferences';
        }, 1000);
    });
});