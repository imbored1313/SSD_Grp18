// login.js - SECURE VERSION - Enhanced input sanitization

// XSS Prevention: Input sanitization functions
const InputSanitizer = {
    // Remove potentially dangerous characters
    sanitizeText: function(input) {
        if (typeof input !== 'string') return '';
        return input
            .trim()
            .replace(/[<>]/g, '') // Remove angle brackets
            .replace(/javascript:/gi, '') // Remove javascript: protocol
            .replace(/on\w+=/gi, '') // Remove event handlers
            .substring(0, 1000); // Limit length
    },

    // Sanitize for display (more strict)
    sanitizeForDisplay: function(input) {
        if (typeof input !== 'string') return '';
        return input
            .replace(/[&<>"']/g, function(match) {
                const map = {
                    '&': '&amp;',
                    '<': '&lt;',
                    '>': '&gt;',
                    '"': '&quot;',
                    "'": '&#39;'
                };
                return map[match];
            });
    },

    // Validate and sanitize email
    sanitizeEmail: function(email) {
        if (typeof email !== 'string') return '';
        const sanitized = email.trim().toLowerCase();
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return emailRegex.test(sanitized) ? sanitized : '';
    }
};

document.addEventListener('DOMContentLoaded', function () {
    console.log('=== LOGIN PAGE LOADED ===');

    // Initialize login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLoginSubmit);
    }

    // 2FA modal events
    const resend2FA = document.getElementById('resend2FA');
    if (resend2FA) {
        resend2FA.addEventListener('click', async function (e) {
            e.preventDefault();
            resend2FA.textContent = 'Resending...';
            if (loginForm) {
                await handleLoginSubmit(new Event('submit'));
            }
            setTimeout(() => { resend2FA.textContent = "Didn't get a code? Resend"; }, 2000);
        });
    }
    const closeBtn = document.getElementById('close2FAModal');
    if (closeBtn) {
        closeBtn.addEventListener('click', hide2FAModal);
    }
    const twoFAForm = document.getElementById('twoFAForm');
    if (twoFAForm) {
        twoFAForm.addEventListener('submit', handle2FASubmit);
    }

    // Real-time validation for better UX
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    if (usernameInput) {
        usernameInput.addEventListener('blur', function () {
            const value = InputSanitizer.sanitizeText(this.value);
            if (value) {
                const errorElement = document.getElementById('usernameError');
                if (errorElement) {
                    errorElement.textContent = '';
                    errorElement.style.display = 'none';
                }
                this.classList.remove('error');
            }
        });
        usernameInput.addEventListener('input', function () {
            this.classList.remove('error');
        });
    }
    if (passwordInput) {
        passwordInput.addEventListener('input', function () {
            this.classList.remove('error');
            const errorElement = document.getElementById('passwordError');
            if (errorElement) {
                errorElement.textContent = '';
                errorElement.style.display = 'none';
            }
        });
    }

    // Check if user is already logged in using session manager
    checkExistingSession();

    // Handle Enter key press for login
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
            if (loginForm) {
                const submitButton = loginForm.querySelector('button[type="submit"]');
                if (submitButton && !submitButton.disabled) {
                    submitButton.click();
                }
            }
        }
    });
});

// Check if user is already logged in and redirect if so
async function checkExistingSession() {
    console.log('Checking existing session...');

    // Wait for session manager to complete its check
    if (window.sessionManager.sessionCheckInProgress) {
        await window.sessionManager.waitForSessionCheck();
    }

    if (window.sessionManager.isLoggedIn()) {
        const user = window.sessionManager.getUser();
        console.log('✅ User already logged in, redirecting...');
        showNotification('You are already logged in. Redirecting...', 'info');

        // Redirect based on user role
        setTimeout(() => {
            if (user.role && user.role.toLowerCase() === 'admin') {
                window.location.href = 'admin_dashboard.php';
            } else {
                window.location.href = 'index.html';
            }
        }, 1000);
    }
}

// Handle login form submission
async function handleLoginSubmit(e) {
    if (e) e.preventDefault();
    console.log('=== LOGIN FORM SUBMITTED ===', new Date().toISOString());

    // Clear previous errors
    clearErrors();

    // Get form data and sanitize
    const formData = new FormData();
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const rememberInput = document.getElementById('remember');

    // Sanitize inputs
    const username = InputSanitizer.sanitizeText(usernameInput.value);
    const password = passwordInput.value; // Don't sanitize password content, just validate length

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

            // DEBUG: Check session immediately after login
            setTimeout(async () => {
                const sessionCheck = await fetch('php/check_session.php', {
                    method: 'GET',
                    credentials: 'include',
                    cache: 'no-cache'
                });
                const sessionResult = await sessionCheck.json();
                console.log('🔍 Session check RIGHT after login:', sessionResult);
            }, 500);

            // Clear form
            document.getElementById('loginForm').reset();

            // Sync localStorage cart to database after login
            await syncCartAfterLogin();

            // Update session manager with new user data
            window.sessionManager.currentUser = result.user;
            window.sessionManager.notifyCallbacks('login', result.user);

            // Redirect based on user role
            setTimeout(() => {
                if (result.user && result.user.role && result.user.role.toLowerCase() === 'admin') {
                    window.location.href = 'admin_dashboard.php';
                } else {
                    window.location.href = 'index.html';
                }
            }, 1000);
        } else if (result['2fa_required']) {
            show2FAModal();
            showNotification(result.message || '2FA required. Please check your email.', 'info');
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

// Show 2FA modal
function show2FAModal() {
    const modal = document.getElementById('twoFAModal');
    if (modal) {
        modal.style.display = 'flex';
        document.getElementById('twoFACode').value = '';
        document.getElementById('twoFAError').textContent = '';
    }
}

// Hide 2FA modal
function hide2FAModal() {
    const modal = document.getElementById('twoFAModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Handle 2FA form submission
async function handle2FASubmit(e) {
    e.preventDefault();
    const codeInput = document.getElementById('twoFACode');
    const code = InputSanitizer.sanitizeText(codeInput.value);
    const errorDiv = document.getElementById('twoFAError');
    errorDiv.textContent = '';
    codeInput.classList.remove('error');

    if (!/^\d{6}$/.test(code)) {
        errorDiv.textContent = 'Please enter a valid 6-digit code.';
        codeInput.classList.add('error');
        return;
    }

    // Show loading state
    const submitBtn = document.querySelector('#twoFAForm button[type="submit"]');
    const originalText = submitBtn.textContent;
    setLoadingState(submitBtn, true, 'Verifying...');

    try {
        const response = await fetch('php/verify_2fa.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            credentials: 'include',
            body: `code=${encodeURIComponent(code)}`
        });
        const result = await response.json();
        if (result.success) {
            hide2FAModal();
            showNotification('Login successful! Redirecting...', 'success');
            // Sync cart and update session manager
            await syncCartAfterLogin();
            window.sessionManager.currentUser = result.user;
            window.sessionManager.notifyCallbacks('login', result.user);
            setTimeout(() => {
                if (result.user && result.user.role && result.user.role.toLowerCase() === 'admin') {
                    window.location.href = 'admin_dashboard.php';
                } else {
                    window.location.href = 'index.html';
                }
            }, 1000);
        } else {
            errorDiv.textContent = result.error || 'Invalid 2FA code.';
            codeInput.classList.add('error');
        }
    } catch (err) {
        errorDiv.textContent = 'Failed to verify code. Please try again.';
        codeInput.classList.add('error');
    } finally {
        setLoadingState(submitBtn, false, originalText);
    }
}

// Sync cart after successful login
async function syncCartAfterLogin() {
    try {
        const localCart = JSON.parse(localStorage.getItem('cart')) || [];

        if (localCart.length > 0) {
            const formattedCart = localCart.map(productId => ({
                product_id: productId,
                quantity: 1
            }));

            const response = await fetch('php/sync_cart.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ cart: formattedCart })
            });

            const data = await response.json();

            if (data.success) {
                console.log('✅ Cart synced to database.');
            } else {
                console.log('❌ Cart sync failed:', data.message);
            }
        }
    } catch (error) {
        console.error('❌ Cart sync failed:', error);
    }
}

// Enhanced form validation with sanitization
function validateForm(username, password) {
    let isValid = true;

    // Validate username/email
    if (!username) {
        showFieldError('username', 'Username or email is required');
        isValid = false;
    } else if (username.length < 3) {
        showFieldError('username', 'Username must be at least 3 characters');
        isValid = false;
    } else if (username.length > 100) {
        showFieldError('username', 'Username is too long');
        isValid = false;
    }

    // Validate password
    if (!password) {
        showFieldError('password', 'Password is required');
        isValid = false;
    } else if (password.length < 6) {
        showFieldError('password', 'Password must be at least 6 characters');
        isValid = false;
    } else if (password.length > 255) {
        showFieldError('password', 'Password is too long');
        isValid = false;
    }

    return isValid;
}

// Handle login errors based on response
function handleLoginError(status, errorMessage) {
    // Sanitize error message before display
    const safeErrorMessage = InputSanitizer.sanitizeForDisplay(errorMessage || '');
    
    switch (status) {
        case 401:
            // Invalid credentials
            showFieldError('password', safeErrorMessage || 'Invalid username/email or password');
            break;
        case 423:
            // Account locked
            showNotification('Account locked: ' + safeErrorMessage, 'error');
            break;
        case 400:
            // Bad request (validation error)
            showNotification(safeErrorMessage || 'Please check your input and try again', 'error');
            break;
        default:
            // Other errors
            showNotification('Login failed: ' + (safeErrorMessage || 'Unknown error'), 'error');
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

// Show notification using session manager's notification system
function showNotification(message, type = 'success') {
    window.sessionManager.showNotification(message, type);
}

// Enhanced Form validation utilities with sanitization
const FormValidator = {
    username: function (username) {
        const sanitized = InputSanitizer.sanitizeText(username);
        if (!sanitized || sanitized.length < 3) {
            return 'Username must be at least 3 characters';
        }
        if (sanitized.length > 50) {
            return 'Username is too long';
        }
        if (!/^[a-zA-Z0-9_.-]+$/.test(sanitized)) {
            return 'Username can only contain letters, numbers, underscores, periods, and hyphens';
        }
        return null;
    },

    email: function (email) {
        const sanitized = InputSanitizer.sanitizeEmail(email);
        return sanitized ? null : 'Invalid email format';
    },

    password: function (password) {
        if (!password || password.length < 6) {
            return 'Password must be at least 6 characters';
        }
        if (password.length > 255) {
            return 'Password is too long';
        }
        return null;
    },

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
        const sanitized = InputSanitizer.sanitizeText(name);
        if (!sanitized || sanitized.length < 1) {
            return 'This field is required';
        }
        if (sanitized.length > 50) {
            return 'Name is too long';
        }
        if (!/^[a-zA-Z\s'-]+$/.test(sanitized)) {
            return 'Name can only contain letters, spaces, hyphens, and apostrophes';
        }
        return null;
    },

    phone: function (phone) {
        if (!phone) {
            return null; // Phone is optional
        }
        const sanitized = InputSanitizer.sanitizeText(phone);
        const cleaned = sanitized.replace(/\D/g, '');
        if (cleaned.length < 10 || cleaned.length > 15) {
            return 'Phone number must be between 10 and 15 digits';
        }
        return null;
    }
};