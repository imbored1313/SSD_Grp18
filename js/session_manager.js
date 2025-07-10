// js/session-manager.js - Unified Session Management
class SessionManager {
    constructor() {
        this.currentUser = null;
        this.sessionCheckInProgress = false;
        this.sessionCheckComplete = false;
        this.callbacks = [];
        
        // Auto-check session on load
        this.checkSession();
    }

    async checkSession() {
        if (this.sessionCheckInProgress) {
            return this.waitForSessionCheck();
        }

        this.sessionCheckInProgress = true;
        console.log('🔍 Checking user session...');

        try {
            const response = await fetch('php/check_session.php', {
                method: 'GET',
                credentials: 'include',
                cache: 'no-cache'
            });

            const result = await response.json();
            console.log('Session check result:', result);

            if (response.ok && result.success && result.user) {
                this.currentUser = result.user;
                this.notifyCallbacks('login', this.currentUser);
                console.log('✅ User logged in:', this.currentUser.username);
            } else {
                this.currentUser = null;
                this.notifyCallbacks('logout');
                console.log('❌ User not logged in');
            }

            return result;

        } catch (error) {
            console.error('❌ Session check error:', error);
            this.currentUser = null;
            this.notifyCallbacks('error', error);
            return { success: false, error: error.message };

        } finally {
            this.sessionCheckInProgress = false;
            this.sessionCheckComplete = true;
        }
    }

    async waitForSessionCheck() {
        let attempts = 0;
        while (this.sessionCheckInProgress && attempts < 50) { // 5 second timeout
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        return { success: !!this.currentUser, user: this.currentUser };
    }

    onSessionChange(callback) {
        this.callbacks.push(callback);
    }

    notifyCallbacks(event, data) {
        this.callbacks.forEach(callback => {
            try {
                callback(event, data);
            } catch (error) {
                console.error('Callback error:', error);
            }
        });
    }

    isLoggedIn() {
        return !!this.currentUser;
    }

    getUser() {
        return this.currentUser;
    }

    async requireLogin() {
        if (this.sessionCheckInProgress) {
            await this.waitForSessionCheck();
        }

        if (!this.sessionCheckComplete) {
            await this.checkSession();
        }

        if (!this.isLoggedIn()) {
            this.showLoginPrompt();
            return false;
        }

        return true;
    }

    showLoginPrompt() {
        this.showNotification('Please log in to continue', 'warning');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
    }

    async logout() {
        try {
            const response = await fetch('php/logout.php', {
                method: 'POST',
                credentials: 'include',
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                this.currentUser = null;
                this.notifyCallbacks('logout');
                this.showNotification('Logged out successfully!', 'success');
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1000);
            } else {
                this.showNotification('Logout failed. Please try again.', 'error');
            }
        } catch (error) {
            console.error('Logout error:', error);
            this.showNotification('Logout failed. Please try again.', 'error');
        }
    }

    showNotification(message, type = 'info') {
        // Remove existing notification
        const existing = document.getElementById('session-notification');
        if (existing) existing.remove();

        const notification = document.createElement('div');
        notification.id = 'session-notification';
        
        const colors = {
            success: '#28a745',
            error: '#dc3545',
            warning: '#ffc107',
            info: '#17a2b8'
        };

        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${colors[type] || colors.info};
            color: white;
            padding: 1rem 2rem;
            border-radius: 8px;
            z-index: 3000;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            font-family: Arial, sans-serif;
            font-size: 14px;
        `;

        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 3000);
    }
}

// Create global instance
window.sessionManager = new SessionManager();

// Export for modules (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SessionManager;
}