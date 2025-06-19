// login.js - Login Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    
    document.getElementById('loginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Clear previous errors
        document.getElementById('emailError').textContent = '';
        document.getElementById('passwordError').textContent = '';
        
        // Get form data
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        
        // Basic validation
        let isValid = true;
        
        if (!email) {
            document.getElementById('emailError').textContent = 'Email is required';
            document.getElementById('email').classList.add('error');
            isValid = false;
        } else {
            document.getElementById('email').classList.remove('error');
            document.getElementById('email').classList.add('success');
        }
        
        if (!password) {
            document.getElementById('passwordError').textContent = 'Password is required';
            document.getElementById('password').classList.add('error');
            isValid = false;
        } else if (password.length < 6) {
            document.getElementById('passwordError').textContent = 'Password must be at least 6 characters';
            document.getElementById('password').classList.add('error');
            isValid = false;
        } else {
            document.getElementById('password').classList.remove('error');
            document.getElementById('password').classList.add('success');
        }
        
        if (isValid) {
            // Add loading state
            const submitBtn = document.querySelector('button[type="submit"]');
            submitBtn.classList.add('loading');
            submitBtn.textContent = 'Signing in...';
            
            // Simulate API call (replace with actual form submission)
            setTimeout(() => {
                // For demo - redirect to home page
                // this.submit(); // Uncomment for actual form submission
                alert('Login successful! (Demo)');
                window.location.href = 'home.php';
            }, 1000);
        }
    });
    
});