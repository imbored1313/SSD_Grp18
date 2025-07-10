<?php session_start(); ?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Profile - ElectraEdge</title>
    <link rel="stylesheet" href="website.css">
    <script src="js/session_manager.js"></script>
</head>
<body>
    <!-- Header -->
    <div id="header-placeholder"></div>

    <script src="js/header.js"></script>
    

    <div class="profile-container">
        <!-- Profile Header -->
        <div class="profile-header">
            <div class="profile-avatar" id="avatarDisplay">
                👤
            </div>
            <h1 id="displayName">Loading...</h1>
            <!-- <p style="color: #666;">Loading...</p> -->
            <button class="btn btn-outline btn-small" onclick="toggleEditMode()">Edit Profile</button>
        </div>

        <!-- Personal Information -->
        <div class="profile-section">
            <h2>Personal Information</h2>
            
            <!-- Display Mode -->
            <div id="displayMode">
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 2rem;">
                    <div>
                        <strong>Full Name:</strong>
                        <p id="fullNameDisplay">Loading...</p>
                    </div>
                    <div>
                        <strong>Email:</strong>
                        <p id="emailDisplay">Loading...</p>
                    </div>
                    <div>
                        <strong>Phone:</strong>
                        <p id="phoneDisplay">Loading...</p>
                    </div>
                </div>
            </div>

            <!-- Edit Mode -->
            <div id="editMode" style="display: none;">
                <form id="profileForm">
                    <input type="hidden" name="csrf_token" value="<?php echo $_SESSION['csrf_token']; ?>">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                        <div class="form-group">
                            <label class="form-label" for="firstName">First Name</label>
                            <input type="text" id="firstName" name="firstName" class="form-input" required>
                            <div class="form-error" id="firstNameError"></div>
                        </div>
                        <div class="form-group">
                            <label class="form-label" for="lastName">Last Name</label>
                            <input type="text" id="lastName" name="lastName" class="form-input" required>
                            <div class="form-error" id="lastNameError"></div>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label" for="email">Email Address</label>
                        <input type="email" id="email" name="email" class="form-input" required>
                        <div class="form-error" id="emailError"></div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label" for="phone">Phone Number</label>
                        <input type="tel" id="phone" name="phone" class="form-input">
                        <div class="form-error" id="phoneError"></div>
                    </div>
                    
                    <div class="form-group">
                        <label for="verifyPassword">Current Password</label>
                        <input type="password" id="verifyPassword" name="verifyPassword" required>
                        <div class="form-error" id="verifyPasswordError"></div>
                    </div>

                    <div style="display: flex; gap: 1rem;">
                        <button type="submit" class="btn btn-primary">Save Changes</button>
                        <button type="button" class="btn btn-secondary" onclick="cancelEdit()">Cancel</button>
                    </div>
                </form>
            </div>
        </div>

        <!-- Address Information -->
        <div class="profile-section">
            <h2>Shipping Address</h2>
            
            <!-- Display Mode -->
            <div id="addressDisplayMode">
                <div id="addressDisplay">
                    <p><strong>Primary Address:</strong></p>
                    <p>123 Electronics Street<br>
                    Tech City, TC 12345<br>
                    United States</p>
                </div>
                <button class="btn btn-outline btn-small mt-2" onclick="toggleAddressEditMode()">Edit Address</button>
            </div>

            <!-- Edit Mode -->
            <div id="addressEditMode" style="display: none;">
                <form id="addressForm">
                    <input type="hidden" name="csrf_token" value="<?php echo $_SESSION['csrf_token']; ?>">
                    <div class="form-group">
                        <label class="form-label" for="street">Street Address</label>
                        <input type="text" id="street" name="street" class="form-input" value="123 Electronics Street">
                        <div class="form-error" id="streetError"></div>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                        <div class="form-group">
                            <label class="form-label" for="city">City</label>
                            <input type="text" id="city" name="city" class="form-input" value="Tech City">
                            <div class="form-error" id="cityError"></div>
                        </div>
                        <div class="form-group">
                            <label class="form-label" for="state">State/Province</label>
                            <input type="text" id="state" name="state" class="form-input" value="TC">
                            <div class="form-error" id="stateError"></div>
                        </div>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                        <div class="form-group">
                            <label class="form-label" for="zipCode">ZIP/Postal Code</label>
                            <input type="text" id="zipCode" name="zipCode" class="form-input" value="12345">
                            <div class="form-error" id="zipError"></div>
                        </div>
                        <div class="form-group">
                            <label class="form-label" for="country">Country</label>
                            <select id="country" name="country" class="form-input">
                                <option value="US" selected>United States</option>
                                <option value="CA">Canada</option>
                                <option value="UK">United Kingdom</option>
                                <option value="AU">Australia</option>
                                <option value="SG">Singapore</option>
                            </select>
                        </div>
                    </div>
                    
                    <div style="display: flex; gap: 1rem;">
                        <button type="submit" class="btn btn-primary">Save Address</button>
                        <button type="button" class="btn btn-secondary" onclick="cancelAddressEdit()">Cancel</button>
                    </div>
                </form>
            </div>
        </div>

        <!-- Security Settings -->
        <div class="profile-section">
            <h2>Security Settings</h2>
            
            <div style="display: grid; gap: 1.5rem;">
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; background: #f8f9fa; border-radius: 8px;">
                    <div>
                        <strong>Password</strong>
                        <p style="color: #666; margin: 0;">Keep your account secure</p>
                    </div>
                    <button class="btn btn-outline btn-small" onclick="showChangePassword()">Change Password</button>
                </div>
                
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; background: #f8f9fa; border-radius: 8px;">
                    <div>
                        <strong>Login Activity</strong>
                        <p style="color: #666; margin: 0;">View recent login attempts</p>
                    </div>
                    <button class="btn btn-outline btn-small" onclick="viewLoginActivity()">View Activity</button>
                </div>
            </div>
        </div>

        <!-- Preferences -->
        <div class="profile-section">
            <h2>Preferences</h2>
            
            <form id="preferencesForm">
                <div class="form-group">
                    <label style="display: flex; align-items: center; gap: 0.5rem;">
                        <input type="checkbox" id="emailNotifications" checked>
                        <span>Email notifications for order updates</span>
                    </label>
                </div>
                
                <div class="form-group">
                    <label style="display: flex; align-items: center; gap: 0.5rem;">
                        <input type="checkbox" id="smsNotifications">
                        <span>SMS notifications for order updates</span>
                    </label>
                </div>
                
                <div class="form-group">
                    <label style="display: flex; align-items: center; gap: 0.5rem;">
                        <input type="checkbox" id="newsletter" checked>
                        <span>Subscribe to newsletter and promotional offers</span>
                    </label>
                </div>
                
                <div class="form-group">
                    <label class="form-label" for="currency">Preferred Currency</label>
                    <select id="currency" name="currency" class="form-input">
                        <option value="USD" selected>USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="GBP">GBP (£)</option>
                        <option value="SGD">SGD (S$)</option>
                    </select>
                </div>
                
                <button type="submit" class="btn btn-primary">Save Preferences</button>
            </form>
        </div>

        <!-- Account Actions -->
        <div class="profile-section">
            <h2>Account Actions</h2>
            
            <div style="display: grid; gap: 1rem;">
                <button class="btn btn-danger w-100" onclick="deleteAccount()">Delete Account</button>
            </div>
        </div>

        <?php if (isset($_SESSION['role']) && $_SESSION['role'] === 'admin'): ?>
            <!-- Admin Management -->
            <div class="profile-section">
                <h2>Admin Management</h2>
                <div style="display: grid; gap: 1rem;">
                    <a href="admin_dashboard.php" class="btn btn-outline w-100">Admin Dashboard</a>
                </div>
            </div>
        <?php endif; ?>
    </div>

    <!-- Change Password Modal -->
    <div id="changePasswordModal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 2000; align-items: center; justify-content: center;">
        <div style="background: white; padding: 2rem; border-radius: 15px; width: 90%; max-width: 400px;">
            <h3 style="margin-bottom: 1.5rem;">Change Password</h3>
            
            <form id="changePasswordForm">
                <div class="form-group">
                    <label class="form-label" for="currentPassword">Current Password</label>
                    <input type="password" id="currentPassword" name="currentPassword" class="form-input" required>
                    <div class="form-error" id="currentPasswordError"></div>
                </div>
                
                <div class="form-group">
                    <label class="form-label" for="newPassword">New Password</label>
                    <input type="password" id="newPassword" name="newPassword" class="form-input" required>
                    <div class="form-error" id="newPasswordError"></div>
                    <div class="form-success" id="newPasswordStrength"></div>
                </div>
                
                <div class="form-group">
                    <label class="form-label" for="confirmNewPassword">Confirm New Password</label>
                    <input type="password" id="confirmNewPassword" name="confirmNewPassword" class="form-input" required>
                    <div class="form-error" id="confirmNewPasswordError"></div>
                </div>
                
                <div style="display: flex; gap: 1rem;">
                    <button type="submit" class="btn btn-primary">Update Password</button>
                    <button type="button" class="btn btn-secondary" onclick="hideChangePassword()">Cancel</button>
                </div>
            </form>
        </div>
    </div>

    <!-- External JavaScript -->
    <script src="js/userprofile.js"></script>
</body>
</html>