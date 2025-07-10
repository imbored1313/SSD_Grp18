// passwordreset.js - Complete Password Reset JavaScript

// Password strength checker
function checkPasswordStrength(password)
{
    const strengthElement = document.getElementById('passwordStrength');
    if (!strengthElement) {
        return;
    }

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

// Show specific step
function showStep(stepId)
{
    const steps = ['emailStep', 'successStep', 'codeStep', 'finalSuccessStep'];
    steps.forEach(step => {
        document.getElementById(step).style.display = 'none';
    });
    document.getElementById(stepId).style.display = 'block';
}

// Clear all form errors
function clearErrors()
{
    const errorElements = document.querySelectorAll('.form-error');
    errorElements.forEach(el => el.textContent = '');

    const inputElements = document.querySelectorAll('.form-input');
    inputElements.forEach(el => {
        el.classList.remove('error', 'success');
    });
}

document.addEventListener('DOMContentLoaded', function () {

    // Password strength checker for new password
    const newPasswordInput = document.getElementById('newPassword');
    if (newPasswordInput) {
        newPasswordInput.addEventListener('input', function (e) {
            checkPasswordStrength(e.target.value);
        });
    }

    // Handle email form submission (Step 1)
    document.getElementById('resetEmailForm').addEventListener('submit', async function (e) {
        e.preventDefault();

        clearErrors();

        const email = document.getElementById('email').value.trim();

        // Basic validation
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

        const formData = new FormData();
        formData.append('email', email);

        // Add loading state
        const submitBtn = this.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.classList.add('loading');
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;

        try {
            const response = await fetch('php/password_reset_process.php', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (response.ok && result.success) {
                // Only log to console for development, no popup
                if (result.debug_code) {
                    console.log('🔐 DEBUG CODE (for development):', result.debug_code);
                }

                // Show success step
                showStep('successStep');
            } else {
                document.getElementById('emailError').textContent = result.error || 'Failed to send reset email';
                document.getElementById('email').classList.add('error');
            }
        } catch (error) {
            console.error('Reset request error:', error);
            document.getElementById('emailError').textContent = 'Failed to send reset email. Please try again.';
            document.getElementById('email').classList.add('error');
        } finally {
            // Reset button
            submitBtn.classList.remove('loading');
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });

    // Handle "Enter Verification Code" button
    document.getElementById('enterCodeBtn').addEventListener('click', function () {
        showStep('codeStep');
    });

    // Handle resend link
    document.getElementById('resendLink').addEventListener('click', function (e) {
        e.preventDefault();

        this.textContent = 'Resending...';

        // Simulate resend - you could make another API call here
        setTimeout(() => {
            this.textContent = 'Code sent!';
            setTimeout(() => {
                this.textContent = 'click here to resend';
            }, 3000);
        }, 1000);
    });

    // Handle "Request new code" link
    document.getElementById('backToEmail').addEventListener('click', function (e) {
        e.preventDefault();
        showStep('emailStep');
        // Clear the email form
        document.getElementById('email').value = '';
        clearErrors();
    });

    // Auto-format verification code input (numbers only)
    document.getElementById('verificationCode').addEventListener('input', function (e) {
        // Only allow numbers
        this.value = this.value.replace(/[^0-9]/g, '');

        // Auto-advance or style when 6 digits entered
        if (this.value.length === 6) {
            this.classList.add('success');
            this.classList.remove('error');
        } else {
            this.classList.remove('success', 'error');
        }
    });

    // Handle code verification and password update form (Step 3)
    document.getElementById('codeForm').addEventListener('submit', async function (e) {
        e.preventDefault();

        clearErrors();

        // Get form data
        const code = document.getElementById('verificationCode').value.trim();
        const newPassword = document.getElementById('newPassword').value;
        const confirmNewPassword = document.getElementById('confirmNewPassword').value;

        let isValid = true;

        // Validate verification code
        if (!code) {
            document.getElementById('codeError').textContent = 'Verification code is required';
            document.getElementById('verificationCode').classList.add('error');
            isValid = false;
        } else if (code.length !== 6 || !/^\d{6}$/.test(code)) {
            document.getElementById('codeError').textContent = 'Please enter a valid 6-digit code';
            document.getElementById('verificationCode').classList.add('error');
            isValid = false;
        }

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
            // Check password strength requirements
            const hasUpper = /[A-Z]/.test(newPassword);
            const hasLower = /[a-z]/.test(newPassword);
            const hasNumber = /[0-9]/.test(newPassword);
            const hasSpecial = /[^A-Za-z0-9]/.test(newPassword);

            if (!hasUpper || !hasLower || !hasNumber || !hasSpecial) {
                document.getElementById('newPasswordError').textContent = 'Password must contain uppercase, lowercase, number, and special character';
                document.getElementById('newPassword').classList.add('error');
                isValid = false;
            } else {
                document.getElementById('newPassword').classList.add('success');
            }
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
            document.getElementById('confirmNewPassword').classList.add('success');
        }

        if (!isValid) {
            return;
        }

        // Submit the form
        const formData = new FormData();
        formData.append('code', code);
        formData.append('newPassword', newPassword);

        // Add loading state
        const submitBtn = this.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.classList.add('loading');
        submitBtn.textContent = 'Updating Password...';
        submitBtn.disabled = true;

        try {
            const response = await fetch('php/password_update_process.php', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (response.ok && result.success) {
                // Show final success step
                showStep('finalSuccessStep');

                // Auto-redirect to login after 3 seconds
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 3000);
            } else {
                // Show specific error
                if (result.error.includes('code')) {
                    document.getElementById('codeError').textContent = result.error;
                    document.getElementById('verificationCode').classList.add('error');
                } else if (result.error.includes('password') || result.error.includes('Password')) {
                    document.getElementById('newPasswordError').textContent = result.error;
                    document.getElementById('newPassword').classList.add('error');
                } else {
                    document.getElementById('codeError').textContent = result.error;
                }
            }
        } catch (error) {
            console.error('Password update error:', error);
            document.getElementById('codeError').textContent = 'Failed to update password. Please try again.';
        } finally {
            // Reset button
            submitBtn.classList.remove('loading');
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });

    // Prevent form submission on Enter in code input (optional UX improvement)
    document.getElementById('verificationCode').addEventListener('keypress', function (e) {
        if (e.key === 'Enter' && this.value.length === 6) {
            // Focus on password field instead
            document.getElementById('newPassword').focus();
        }
    });

    // Auto-focus on first input when steps change
    setTimeout(() => {
        const emailInput = document.getElementById('email');
        if (emailInput && emailInput.offsetParent !== null) {
            emailInput.focus();
        }
    }, 100);
});