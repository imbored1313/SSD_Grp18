// register.js - Registration Page JavaScript

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
    
    // Password strength checker event listener
    document.getElementById('password').addEventListener('input', function(e) {
        checkPasswordStrength(e.target.value);
    });
    
    // Registration form submission
    document.getElementById('registerForm').addEventListener('submit', function(e) {
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
        const formData = {
            firstName: document.getElementById('firstName').value.trim(),
            lastName: document.getElementById('lastName').value.trim(),
            email: document.getElementById('email').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            password: document.getElementById('password').value,
            confirmPassword: document.getElementById('confirmPassword').value,
            terms: document.getElementById('terms').checked
        };
        
        let isValid = true;
        
        // Validate first name
        if (!formData.firstName) {
            document.getElementById('firstNameError').textContent = 'First name is required';
            document.getElementById('firstName').classList.add('error');
            isValid = false;
        } else {
            document.getElementById('firstName').classList.add('success');
        }
        
        // Validate last name
        if (!formData.lastName) {
            document.getElementById('lastNameError').textContent = 'Last name is required';
            document.getElementById('lastName').classList.add('error');
            isValid = false;
        } else {
            document.getElementById('lastName').classList.add('success');
        }
        
        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email) {
            document.getElementById('emailError').textContent = 'Email is required';
            document.getElementById('email').classList.add('error');
            isValid = false;
        } else if (!emailRegex.test(formData.email)) {
            document.getElementById('emailError').textContent = 'Please enter a valid email address';
            document.getElementById('email').classList.add('error');
            isValid = false;
        } else {
            document.getElementById('email').classList.add('success');
        }
        
        // Validate phone (optional but if provided, should be valid)
        if (formData.phone && !/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/\s/g, ''))) {
            document.getElementById('phoneError').textContent = 'Please enter a valid phone number';
            document.getElementById('phone').classList.add('error');
            isValid = false;
        } else if (formData.phone) {
            document.getElementById('phone').classList.add('success');
        }
        
        // Validate password
        if (!formData.password) {
            document.getElementById('passwordError').textContent = 'Password is required';
            document.getElementById('password').classList.add('error');
            isValid = false;
        } else if (formData.password.length < 8) {
            document.getElementById('passwordError').textContent = 'Password must be at least 8 characters long';
            document.getElementById('password').classList.add('error');
            isValid = false;
        } else {
            document.getElementById('password').classList.add('success');
        }
        
        // Validate confirm password
        if (!formData.confirmPassword) {
            document.getElementById('confirmPasswordError').textContent = 'Please confirm your password';
            document.getElementById('confirmPassword').classList.add('error');
            isValid = false;
        } else if (formData.password !== formData.confirmPassword) {
            document.getElementById('confirmPasswordError').textContent = 'Passwords do not match';
            document.getElementById('confirmPassword').classList.add('error');
            isValid = false;
        } else {
            document.getElementById('confirmPassword').classList.add('success');
        }
        
        // Validate terms
        if (!formData.terms) {
            document.getElementById('termsError').textContent = 'You must agree to the Terms of Service';
            isValid = false;
        }
        
        if (isValid) {
            // Add loading state
            const submitBtn = document.querySelector('button[type="submit"]');
            submitBtn.classList.add('loading');
            submitBtn.textContent = 'Creating Account...';
            
            // Simulate API call (replace with actual form submission)
            setTimeout(() => {
                // For demo - redirect to login page
                // this.submit(); // Uncomment for actual form submission
                alert('Account created successfully! Please check your email for verification.');
                window.location.href = 'login.php';
            }, 1500);
        }
    });
    
});