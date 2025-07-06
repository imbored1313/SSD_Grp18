// Updated login.js for username or email login

document.addEventListener('DOMContentLoaded', function () {

    document.getElementById('loginForm').addEventListener('submit', async function (e) {
        e.preventDefault();

        // Clear previous errors
        document.getElementById('usernameError').textContent = '';
        document.getElementById('passwordError').textContent = '';

        // Remove error classes
        document.getElementById('username').classList.remove('error');
        document.getElementById('password').classList.remove('error');

        // Get form data
        const formData = new FormData();
        formData.append('username', document.getElementById('username').value.trim());
        formData.append('password', document.getElementById('password').value);

        if (document.getElementById('remember').checked) {
            formData.append('remember', '1');
        }

        // Basic client-side validation
        const username = formData.get('username');
        const password = formData.get('password');

        let isValid = true;

        if (!username) {
            document.getElementById('usernameError').textContent = 'Username or email is required';
            document.getElementById('username').classList.add('error');
            isValid = false;
        }

        if (!password) {
            document.getElementById('passwordError').textContent = 'Password is required';
            document.getElementById('password').classList.add('error');
            isValid = false;
        }

        if (!isValid) {
            return;
        }

        // Add loading state
        const submitBtn = document.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.classList.add('loading');
        submitBtn.textContent = 'Signing in...';
        submitBtn.disabled = true;

        try {
            const response = await fetch('php/login_process.php', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                if (result.user && result.user.role.toLowerCase() === 'admin') {
                    window.location.href = 'admin_dashboard.php';
                } else {
                    window.location.href = 'index.html';
                }
            } else {
                // Handle different error types
                if (response.status === 401) {
                    document.getElementById('passwordError').textContent = result.error || 'Invalid credentials';
                    document.getElementById('password').classList.add('error');
                } else if (response.status === 423) {
                    alert('Account locked: ' + result.error);
                } else {
                    alert('Login failed: ' + (result.error || 'Unknown error'));
                }
            }
        } catch (error) {
            console.error('Login error:', error);
            alert('Login failed. Please try again.');
        } finally {
            // Reset button
            submitBtn.classList.remove('loading');
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });
});

// Username/Email detection helper
function detectInputType(input)
{
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(input) ? 'email' : 'username';
}

// Form validation utilities
const FormValidator = {
    username: function (username) {
        if (username.length < 3) {
            return 'Username must be at least 3 characters';
        }
        if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
            return 'Username can only contain letters, numbers, underscores, and hyphens';
        }
        return null;
    },

    email: function (email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email) ? null : 'Invalid email format';
    },

    password: function (password) {
        const minLength = password.length >= 8;
        const hasUpper = /[A-Z]/.test(password);
        const hasLower = /[a-z]/.test(password);
        const hasNumber = /\d/.test(password);
        const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

        if (!minLength) {
            return 'Password must be at least 8 characters';
        }
        if (!hasUpper) {
            return 'Password must contain an uppercase letter';
        }
        if (!hasLower) {
            return 'Password must contain a lowercase letter';
        }
        if (!hasNumber) {
            return 'Password must contain a number';
        }
        if (!hasSpecial) {
            return 'Password must contain a special character';
        }

        return null;
    },

    name: function (name) {
        if (!name || name.length < 1) {
            return 'This field is required';
        }
        if (name.length > 50) {
            return 'Name is too long';
        }
        if (!/^[a-zA-Z\s'-]+$/.test(name)) {
            return 'Name can only contain letters, spaces, hyphens, and apostrophes';
        }
        return null;
    },

    phone: function (phone) {
        if (!phone) {
            return null; // Phone is optional
        }
        const cleaned = phone.replace(/\D/g, '');
        if (cleaned.length < 10 || cleaned.length > 15) {
            return 'Phone number must be between 10 and 15 digits';
        }
        return null;
    }
};