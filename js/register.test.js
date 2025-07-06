// Jest tests for registration validation logic

describe('Registration Validation', () => {
    // Username validation logic (from register.js)
    function validateUsername(username) {
        if (username.length < 3) {
            return 'Username must be at least 3 characters';
        }
        if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
            return 'Username can only contain letters, numbers, underscores, and hyphens';
        }
        return null;
    }

    // Password strength logic (from register.js)
    function passwordStrength(password) {
        let strength = 0;
        if (password.length >= 8) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;
        return strength;
    }

    test('should reject short usernames', () => {
        expect(validateUsername('ab')).toBe('Username must be at least 3 characters');
    });

    test('should reject usernames with invalid characters', () => {
        expect(validateUsername('user!@#')).toBe('Username can only contain letters, numbers, underscores, and hyphens');
    });

    test('should accept valid usernames', () => {
        expect(validateUsername('user_123')).toBeNull();
        expect(validateUsername('user-name')).toBeNull();
    });

    test('should detect weak password', () => {
        expect(passwordStrength('abc')).toBeLessThan(3);
    });

    test('should detect strong password', () => {
        expect(passwordStrength('Abcdef1!')).toBe(5);
    });
}); 