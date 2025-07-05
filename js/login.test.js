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
    let form;
    let emailInput;
    let passwordInput;
    let errorMessage;

    beforeEach(() => {
        form = document.getElementById('loginForm');
        emailInput = document.getElementById('email');
        passwordInput = document.getElementById('password');
        errorMessage = document.getElementById('errorMessage');
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

  test('should prevent form submission with invalid data', () => {
        const submitEvent = new Event('submit');
        const preventDefaultSpy = jest.spyOn(submitEvent, 'preventDefault');

        emailInput.value = 'invalid-email';
        passwordInput.value = '';

        form.dispatchEvent(submitEvent);

        expect(preventDefaultSpy).toHaveBeenCalled();
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