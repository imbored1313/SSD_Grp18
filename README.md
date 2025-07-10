# ElectraEdge E-commerce Platform

**ElectraEdge** is a secure, full-stack e-commerce platform. It demonstrates best practices in authentication, authorization, secure coding, and modern deployment using Docker.

---

## Features

- **User Registration & Login**
  - Register with username, email, and strong password validation.
  - Login with username or email.
  - Two-Factor Authentication (2FA) via email for all logins.
  - Session management with secure session regeneration and validation.

- **Password Management**
  - Secure password hashing (PHP `password_hash`).
  - Password reset with email verification and rate limiting.
  - Change password (requires current password).
  - Password reset codes expire after 15 minutes and are rate-limited.

- **User Profile**
  - View and update profile (requires password confirmation).
  - Email uniqueness enforced.

- **Product Catalog & Cart**
  - Browse, search, and view products.
  - Add, update, and remove items from cart (with stock checks).
  - Cart is synchronized between client and server.

- **Order Management**
  - Place orders with PayPal integration (sandbox).
  - View order history and details.
  - Admins can view all orders.

- **Admin Dashboard**
  - Manage users, products, and orders.
  - Only accessible to users with the `admin` role.
  - All admin actions are logged in an `AuditLogs` table.

- **File Uploads**
  - Product image uploads restricted to admins.
  - Strict file type and size validation (max 2MB, only images).

- **Audit Logging**
  - All critical actions (login, registration, password changes, admin actions) are logged with user ID, action, timestamp, and IP address.

---

## Security Highlights

- **Authentication & Authorization**
  - 2FA for all logins.
  - Role-based access control for admin endpoints.
  - Session fixation prevention (`session_regenerate_id`).

- **Input Validation & Sanitization**
  - All user input is sanitized and validated on the server.
  - Strong password and email validation.

- **Rate Limiting**
  - Password reset requests are rate-limited per session.

- **Error Handling**
  - Consistent JSON error responses.
  - Sensitive errors are logged server-side, not exposed to users.

- **Secure Deployment**
  - Dockerized for consistent, isolated environments.
  - Multi-stage Docker build with security scanning (`composer audit`, `npm audit`, `snyk`).
  - Runs as a non-root user in production containers.

---

## Tech Stack

- **Backend:** PHP 8.2 (PDO, PHPMailer)
- **Frontend:** HTML, CSS, JavaScript
- **Database:** MySQL 8.0
- **Web Server:** Nginx (via Docker)
- **Testing:** Jest (JavaScript unit tests)
- **Deployment:** Docker, Docker Compose, AWS EC2 (production)

---

## Getting Started

### Prerequisites

- [Docker](https://www.docker.com/get-started)
- [Docker Compose](https://docs.docker.com/compose/)

### Local Development & Testing

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/SSD_Grp18.git
   cd SSD_Grp18
   ```

2. **Configure Environment Variables:**
   - Copy your SMTP credentials (for email/2FA) into environment variables or a `.env` file as required by `php/email_config.php`.

3. **Start the application locally:**
   ```bash
   docker-compose up --build
   ```
   - The app will be available at [http://localhost:8080](http://localhost:8080)
   - phpMyAdmin is available at [http://localhost:8081](http://localhost:8081)

4. **Run Security Scans (optional):**
   - The Dockerfile includes stages for `composer audit`, `npm audit`, and `snyk`.

### Production Deployment

- After local testing, the application is deployed to a live server on **AWS EC2** for production use.
- Ensure all environment variables and credentials are securely configured on the EC2 instance.
- You may use Docker or a traditional LAMP/LEMP stack on EC2, depending on your team's deployment strategy.

### Default Credentials

- You may need to register a new user and have an admin promote your account, or seed the database with an admin user.

---

## Project Structure

- `php/` - All backend PHP scripts (auth, user, admin, cart, orders, etc.)
- `js/` - Frontend JavaScript (login, register, cart, etc.)
- `uploads/` - Product images (write-protected except for admin uploads)
- `docker/` - Nginx configuration
- `Dockerfile`, `docker-compose.yml` - Deployment setup

---

## Security Best Practices Demonstrated

- 2FA for all logins
- Secure password storage and reset
- Role-based access control
- Audit logging of sensitive actions
- Rate limiting on sensitive endpoints
- Input validation and sanitization
- Secure file upload handling
- Session management and fixation prevention
- Secure Docker deployment

---

## Authors

- Group 18 