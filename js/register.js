// Password strength checker
function checkPasswordStrength(password)
{
    const strengthElement = document.getElementById('passwordStrength');
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

document.addEventListener('DOMContentLoaded', function () {

    // Password strength checker event listener
    document.getElementById('password').addEventListener('input', function (e) {
        checkPasswordStrength(e.target.value);
    });

    // Real-time username validation
    document.getElementById('username').addEventListener('input', function (e) {
        const username = e.target.value;
        const usernameError = document.getElementById('usernameError');

        if (username.length > 0) {
            if (username.length < 3) {
                usernameError.textContent = 'Username must be at least 3 characters';
                e.target.classList.add('error');
                e.target.classList.remove('success');
            } else if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
                usernameError.textContent = 'Username can only contain letters, numbers, underscores, and hyphens';
                e.target.classList.add('error');
                e.target.classList.remove('success');
            } else {
                usernameError.textContent = '';
                e.target.classList.remove('error');
                e.target.classList.add('success');
            }
        } else {
            usernameError.textContent = '';
            e.target.classList.remove('error', 'success');
        }
    });

    // Registration form submission
    document.getElementById('registerForm').addEventListener('submit', async function (e) {
        e.preventDefault();

        // Clear previous errors
        const errorElements = document.querySelectorAll('.form-error');
        errorElements.forEach(el => el.textContent = '');

        // Remove error/success classes
        const inputElements = document.querySelectorAll('.form-input');
        inputElements.forEach(el => {
            el.classList.remove('error', 'success');
        });

        // Get form data
        const formData = new FormData();
        formData.append('username', document.getElementById('username').value.trim());
        formData.append('firstName', document.getElementById('firstName').value.trim());
        formData.append('lastName', document.getElementById('lastName').value.trim());
        formData.append('email', document.getElementById('email').value.trim());
        formData.append('phone', document.getElementById('phone').value.trim());
        formData.append('password', document.getElementById('password').value);
        formData.append('confirmPassword', document.getElementById('confirmPassword').value);

        if (document.getElementById('terms').checked) {
            formData.append('terms', '1');
        }

        if (document.getElementById('newsletter').checked) {
            formData.append('newsletter', '1');
        }

        // Add loading state
        const submitBtn = document.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.classList.add('loading');
        submitBtn.textContent = 'Creating Account...';
        submitBtn.disabled = true;

        try {
            const response = await fetch('php/register_process.php', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (response.ok && result.success) {
                // Success
                alert('Account created successfully! You can now login.');
                window.location.href = 'login.html';
            } else {
                // Handle errors
                if (result.errors) {
                    // Field-specific errors
                    Object.keys(result.errors).forEach(field => {
                        const errorElement = document.getElementById(field + 'Error');
                        const inputElement = document.getElementById(field);

                        if (errorElement) {
                            errorElement.textContent = result.errors[field];
                        }
                        if (inputElement) {
                            inputElement.classList.add('error');
                        }
                    });
                } else {
                    // General error
                    alert('Registration failed: ' + (result.error || 'Unknown error'));
                }
            }
        } catch (error) {
            console.error('Registration error:', error);
            alert('Registration failed. Please try again.');
        } finally {
            // Reset button
            submitBtn.classList.remove('loading');
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });
});