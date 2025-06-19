// passwordreset.js - Password Reset Page JavaScript

// Password strength checker
function checkPasswordStrength(password) {
    const strengthElement = document.getElementById('passwordStrength');
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

document.addEventListener('DOMContentLoaded', function() {
    
    // Check if we have a reset token in URL (for step 3)
    const urlParams = new URLSearchParams(window.location.search);
    const resetToken = urlParams.get('token');
    
    if (resetToken) {
        // Show new password form
        document.getElementById('emailStep').style.display = 'none';
        document.getElementById('newPasswordStep').style.display = 'block';
        document.getElementById('resetToken').value = resetToken;
    }
    
    // Event listener for new password input
    const newPasswordInput = document.getElementById('newPassword');
    if (newPasswordInput) {
        newPasswordInput.addEventListener('input', function(e) {
            checkPasswordStrength(e.target.value);
        });
    }
    
    // Handle email form submission
    document.getElementById('resetEmailForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Clear previous errors
        document.getElementById('emailError').textContent = '';
        
        const email = document.getElementById('email').value.trim();
        
        if (!email) {
            document.getElementById('emailError').textContent = 'Email is required';
            document.getElementById('email').classList.add('error');
            return;
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            document.getElementById('emailError').textContent = 'Please enter a valid email address';
            document.getElementById('email').classList.add('error');
            return;
        }
        
        // Add loading state
        const submitBtn = this.querySelector('button[type="submit"]');
        submitBtn.classList.add('loading');
        submitBtn.textContent = 'Sending...';
        
        // Simulate API call
        setTimeout(() => {
            // Show success step
            document.getElementById('emailStep').style.display = 'none';
            document.getElementById('successStep').style.display = 'block';
        }, 1500);
    });
    
    // Handle new password form submission
    const newPasswordForm = document.getElementById('newPasswordForm');
    if (newPasswordForm) {
        newPasswordForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Clear previous errors
            document.getElementById('newPasswordError').textContent = '';
            document.getElementById('confirmNewPasswordError').textContent = '';
            
            const newPassword = document.getElementById('newPassword').value;
            const confirmNewPassword = document.getElementById('confirmNewPassword').value;
            
            let isValid = true;
            
            // Validate new password
            if (!newPassword) {
                document.getElementById('newPasswordError').textContent = 'New password is required';
                document.getElementById('newPassword').classList.add('error');
                isValid = false;
            } else if (newPassword.length < 8) {
                document.getElementById('newPasswordError').textContent = 'Password must be at least 8 characters long';
                document.getElementById('newPassword').classList.add('error');
                isValid = false;
            } else {
                document.getElementById('newPassword').classList.remove('error');
                document.getElementById('newPassword').classList.add('success');
            }
            
            // Validate confirm password
            if (!confirmNewPassword) {
                document.getElementById('confirmNewPasswordError').textContent = 'Please confirm your new password';
                document.getElementById('confirmNewPassword').classList.add('error');
                isValid = false;
            } else if (newPassword !== confirmNewPassword) {
                document.getElementById('confirmNewPasswordError').textContent = 'Passwords do not match';
                document.getElementById('confirmNewPassword').classList.add('error');
                isValid = false;
            } else {
                document.getElementById('confirmNewPassword').classList.remove('error');
                document.getElementById('confirmNewPassword').classList.add('success');
            }
            
            if (isValid) {
                // Add loading state
                const submitBtn = this.querySelector('button[type="submit"]');
                submitBtn.classList.add('loading');
                submitBtn.textContent = 'Updating...';
                
                // Simulate API call
                setTimeout(() => {
                    alert('Password updated successfully!');
                    window.location.href = 'login.php';
                }, 1500);
            }
        });
    }
    
    // Handle resend link
    document.getElementById('resendLink').addEventListener('click', function(e) {
        e.preventDefault();
        
        this.textContent = 'Sending...';
        
        // Simulate resend
        setTimeout(() => {
            this.textContent = 'Email sent!';
            setTimeout(() => {
                this.textContent = 'click here to resend';
            }, 3000);
        }, 1000);
    });
    
});