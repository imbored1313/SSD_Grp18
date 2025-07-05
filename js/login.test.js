/**
 * @jest-environment jsdom
 */

// Mock DOM elements
document.body.innerHTML = `
  <form id="loginForm">
    <input type="email" id="email" name="email" />
    <input type="password" id="password" name="password" />
    <button type="submit">Login</button>
  </form>
  <div id="errorMessage"></div>
`;

// Import the login functionality
require('./login.js');

describe('Login Form Validation', () => {
    let emailInput;
    let passwordInput;

    beforeEach(() => {
        emailInput = document.createElement('input');
        passwordInput = document.createElement('input');
    });

    test('should validate email format', () => {
        emailInput.value = 'invalid-email';
        passwordInput.value = 'password123';

        const isValid = validateEmail(emailInput.value);
        expect(isValid).toBe(false);
    });

    test('should accept valid email format', () => {
        emailInput.value = 'test@example.com';
        passwordInput.value = 'password123';

        const isValid = validateEmail(emailInput.value);
        expect(isValid).toBe(true);
    });

    test('should require password', () => {
        emailInput.value = 'test@example.com';
        passwordInput.value = '';

        const isValid = validatePassword(passwordInput.value);
        expect(isValid).toBe(false);
    });

    test('should accept valid password', () => {
        emailInput.value = 'test@example.com';
        passwordInput.value = 'password123';

        const isValid = validatePassword(passwordInput.value);
        expect(isValid).toBe(true);
    });
});

// Helper functions for testing
function validateEmail(email)
{
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validatePassword(password)
{
    return password.length >= 6;
} 