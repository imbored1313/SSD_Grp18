// Jest tests for password reset validation logic

describe('Password Reset Validation', () => {
    // Email validation logic (from passwordreset.js)
    function validateEmail(email) {
        if (!email) return 'Email is required';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) return 'Please enter a valid email address';
        return null;
    }

    // Code validation logic (from passwordreset.js)
    function validateCode(code) {
        if (!code) return 'Verification code is required';
        if (code.length !== 6 || !/^\d{6}$/.test(code)) return 'Please enter a valid 6-digit code';
        return null;
    }

    // New password validation logic (from passwordreset.js)
    function validateNewPassword(password) {
        if (!password) return 'New password is required';
        if (password.length < 8) return 'Password must be at least 8 characters long';
        const hasUpper = /[A-Z]/.test(password);
        const hasLower = /[a-z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSpecial = /[^A-Za-z0-9]/.test(password);
        if (!hasUpper || !hasLower || !hasNumber || !hasSpecial) {
            return 'Password must contain uppercase, lowercase, number, and special character';
        }
        return null;
    }

    // Confirm password validation logic (from passwordreset.js)
    function validateConfirmPassword(password, confirmPassword) {
        if (!confirmPassword) return 'Please confirm your new password';
        if (password !== confirmPassword) return 'Passwords do not match';
        return null;
    }

    test('should require email', () => {
        expect(validateEmail('')).toBe('Email is required');
    });
    test('should validate email format', () => {
        expect(validateEmail('invalid-email')).toBe('Please enter a valid email address');
        expect(validateEmail('test@example.com')).toBeNull();
    });

    test('should require code', () => {
        expect(validateCode('')).toBe('Verification code is required');
    });
    test('should validate code format', () => {
        expect(validateCode('123')).toBe('Please enter a valid 6-digit code');
        expect(validateCode('abcdef')).toBe('Please enter a valid 6-digit code');
        expect(validateCode('123456')).toBeNull();
    });

    test('should require new password', () => {
        expect(validateNewPassword('')).toBe('New password is required');
    });
    test('should validate new password length', () => {
        expect(validateNewPassword('Abc1!')).toBe('Password must be at least 8 characters long');
    });
    test('should validate new password strength', () => {
        expect(validateNewPassword('abcdefgh')).toBe('Password must contain uppercase, lowercase, number, and special character');
        expect(validateNewPassword('Abcdefgh')).toBe('Password must contain uppercase, lowercase, number, and special character');
        expect(validateNewPassword('Abcdefg1')).toBe('Password must contain uppercase, lowercase, number, and special character');
        expect(validateNewPassword('Abcdefg!')).toBe('Password must contain uppercase, lowercase, number, and special character');
        expect(validateNewPassword('Abcdef1!')).toBeNull();
    });

    test('should require confirm password', () => {
        expect(validateConfirmPassword('Abcdef1!', '')).toBe('Please confirm your new password');
    });
    test('should validate confirm password match', () => {
        expect(validateConfirmPassword('Abcdef1!', 'Abcdef2!')).toBe('Passwords do not match');
        expect(validateConfirmPassword('Abcdef1!', 'Abcdef1!')).toBeNull();
    });
}); 