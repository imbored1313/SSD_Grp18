// login.js - COMPLETE FIXED login JavaScript for username or email login

document.addEventListener('DOMContentLoaded', function () {
    console.log('=== LOGIN PAGE LOADED ===');

    // Initialize login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLoginSubmit);
    }

    // Check if user is already logged in
    checkExistingSession();
});

// Check if user is already logged in and redirect if so
async function checkExistingSession() {
    try {
        const response = await fetch('php/check_session.php', {
            method: 'GET',
            credentials: 'include',
            cache: 'no-cache'
        });

        const result = await response.json();

        if (response.ok && result.success && result.user) {
            console.log('✅ User already logged in, redirecting...');
            showNotification('You are already logged in. Redirecting...', 'info');
            
            // Redirect based on user role
            setTimeout(() => {
                if (result.user.role && result.user.role.toLowerCase() === 'admin') {
                    window.location.href = 'admin_dashboard.php';
                } else {
                    window.location.href = 'index.html';
                }
            }, 1000);
        }
    } catch (error) {
        console.log('No existing session found, staying on login page');
    }
}

// Handle login form submission
async function handleLoginSubmit(e) {
    e.preventDefault();
    console.log('=== LOGIN FORM SUBMITTED ===');

    // Clear previous errors
    clearErrors();

    // Get form data
    const formData = new FormData();
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const rememberInput = document.getElementById('remember');

    const username = usernameInput.value.trim();
    const password = passwordInput.value;

    formData.append('username', username);
    formData.append('password', password);

    if (rememberInput && rememberInput.checked) {
        formData.append('remember', '1');
    }

    // Client-side validation
    if (!validateForm(username, password)) {
        return;
    }

    // Show loading state
    const submitBtn = document.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    setLoadingState(submitBtn, true);

    try {
        console.log('Making login request to php/login_process.php');

        const response = await fetch('php/login_process.php', {
            method: 'POST',
            body: formData,
            credentials: 'include'
        });

        console.log('Login response status:', response.status);

        const result = await response.json();
        console.log('Login response data:', result);

        if (result.success) {
            console.log('✅ Login successful');
            showNotification('Login successful! Redirecting...', 'success');
            
            // Clear form
            document.getElementById('loginForm').reset();
            
            // Redirect based on user role
            setTimeout(() => {
                if (result.user && result.user.role && result.user.role.toLowerCase() === 'admin') {
                    window.location.href = 'admin_dashboard.php';
                } else {
                    window.location.href = 'index.html';
                }
            }, 1000);
        } else {
            console.log('❌ Login failed:', result.error);
            handleLoginError(response.status, result.error);
        }
    } catch (error) {
        console.error('❌ Login error:', error);
        showNotification('Login failed. Please check your connection and try again.', 'error');
    } finally {
        // Reset button state
        setLoadingState(submitBtn, false, originalText);
    }
}

// Validate form inputs
function validateForm(username, password) {
    let isValid = true;

    // Validate username/email
    if (!username) {
        showFieldError('username', 'Username or email is required');
        isValid = false;
    } else if (username.length < 3) {
        showFieldError('username', 'Username must be at least 3 characters');
        isValid = false;
    }

    // Validate password
    if (!password) {
        showFieldError('password', 'Password is required');
        isValid = false;
    } else if (password.length < 6) {
        showFieldError('password', 'Password must be at least 6 characters');
        isValid = false;
    }

    return isValid;
}

// Handle login errors based on response
function handleLoginError(status, errorMessage) {
    switch (status) {
        case 401:
            // Invalid credentials
            showFieldError('password', errorMessage || 'Invalid username/email or password');
            break;
        case 423:
            // Account locked
            showNotification('Account locked: ' + errorMessage, 'error');
            break;
        case 400:
            // Bad request (validation error)
            showNotification(errorMessage || 'Please check your input and try again', 'error');
            break;
        default:
            // Other errors
            showNotification('Login failed: ' + (errorMessage || 'Unknown error'), 'error');
            break;
    }
}

// Show field-specific error
function showFieldError(fieldName, message) {
    const field = document.getElementById(fieldName);
    const errorElement = document.getElementById(fieldName + 'Error');
    
    if (field) {
        field.classList.add('error');
    }
    
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
}

// Clear all form errors
function clearErrors() {
    // Clear error messages
    const errorElements = document.querySelectorAll('.form-error');
    errorElements.forEach(element => {
        element.textContent = '';
        element.style.display = 'none';
    });

    // Remove error classes
    const inputElements = document.querySelectorAll('.form-input');
    inputElements.forEach(element => {
        element.classList.remove('error');
    });
}

// Set loading state for submit button
function setLoadingState(button, loading, originalText = 'Sign In') {
    if (loading) {
        button.classList.add('loading');
        button.textContent = 'Signing in...';
        button.disabled = true;
    } else {
        button.classList.remove('loading');
        button.textContent = originalText;
        button.disabled = false;
    }
}

// 📢 NOTIFICATION SYSTEM: Show notification
function showNotification(message, type = 'success') {
    // Remove existing notification first
    hideNotification();
    
    let notification = document.createElement('div');
    notification.id = 'login-notification';
    
    // Set colors based on type
    let backgroundColor = '#28a745'; // success (green)
    if (type === 'error') backgroundColor = '#dc3545'; // error (red)
    if (type === 'info') backgroundColor = '#17a2b8'; // info (blue)
    if (type === 'warning') backgroundColor = '#ffc107'; // warning (yellow)
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${backgroundColor};
        color: white;
        padding: 1rem 2rem;
        border-radius: 8px;
        z-index: 3000;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        transition: opacity 0.3s ease;
        max-width: 300px;
        word-wrap: break-word;
        font-family: Arial, sans-serif;
        font-size: 14px;
        line-height: 1.4;
    `;
    
    notification.textContent = message;
    notification.style.opacity = '1';
    document.body.appendChild(notification);
    
    // Auto-hide after 4 seconds
    setTimeout(() => {
        hideNotification();
    }, 4000);
}

// Hide notification function
function hideNotification() {
    const notification = document.getElementById('login-notification');
    if (notification && notification.parentNode) {
        notification.style.opacity = '0';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }
}

// Username/Email detection helper
function detectInputType(input) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(input) ? 'email' : 'username';
}

// Form validation utilities (enhanced)
const FormValidator = {
    username: function (username) {
        if (!username || username.length < 3) {
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
        if (!password || password.length < 6) {
            return 'Password must be at least 6 characters';
        }
        return null;
    },

    // Enhanced password validation for registration
    strongPassword: function (password) {
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

// Real-time validation for better UX
document.addEventListener('DOMContentLoaded', function() {
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');

    if (usernameInput) {
        usernameInput.addEventListener('blur', function() {
            const value = this.value.trim();
            if (value) {
                // Clear any existing errors when user starts typing
                const errorElement = document.getElementById('usernameError');
                if (errorElement) {
                    errorElement.textContent = '';
                    errorElement.style.display = 'none';
                }
                this.classList.remove('error');
            }
        });

        usernameInput.addEventListener('input', function() {
            // Clear error state when user starts typing
            this.classList.remove('error');
        });
    }

    if (passwordInput) {
        passwordInput.addEventListener('input', function() {
            // Clear error state when user starts typing
            this.classList.remove('error');
            const errorElement = document.getElementById('passwordError');
            if (errorElement) {
                errorElement.textContent = '';
                errorElement.style.display = 'none';
            }
        });
    }
});

// Handle Enter key press
document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            const submitButton = loginForm.querySelector('button[type="submit"]');
            if (submitButton && !submitButton.disabled) {
                submitButton.click();
            }
        }
    }
});