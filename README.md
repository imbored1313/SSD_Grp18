# ElectraEdge E-commerce Platform
## Secure Software Development Project - Group 18

This repository contains a secure e-commerce web application built with PHP, MySQL, and modern web technologies, implementing comprehensive CI/CD practices and security measures.

## 🚀 CI/CD Pipeline Overview

Our CI/CD pipeline is implemented using **GitHub Actions** and includes the following stages:

### 1. Security Scanning & Code Quality
- **OWASP ZAP Security Scan**: Dynamic application security testing
- **Semgrep**: Static application security testing with custom rules
- **Bandit**: Python security linter
- **PHP Security Checker**: Dependency vulnerability scanning
- **PHP CodeSniffer**: Code style enforcement (PSR-12)
- **PHP Mess Detector**: Code quality analysis
- **PHPStan**: Static analysis

### 2. Automated Testing
- **PHPUnit**: Unit and integration tests
- **Jest**: JavaScript testing
- **Database Testing**: MySQL integration tests
- **Coverage Reporting**: Code coverage analysis

### 3. Container Security
- **Trivy**: Container vulnerability scanning
- **Docker Build**: Multi-stage production builds
- **Security Audits**: Automated security compliance checks

### 4. Deployment
- **Automated Deployment**: Production deployment on main branch
- **Environment Management**: Staging and production environments
- **Rollback Capability**: Quick rollback mechanisms

## 🔒 Security Features

### Security Scanning Tools
- **OWASP ZAP**: Web application security testing
- **Semgrep**: Static analysis with OWASP Top 10 rules
- **Trivy**: Container and dependency vulnerability scanning
- **Composer Audit**: PHP dependency security checks
- **npm audit**: JavaScript dependency security checks

### Security Best Practices
- Input validation and sanitization
- SQL injection prevention with prepared statements
- XSS protection with output encoding
- CSRF token implementation
- Secure session management
- File upload validation
- Password hashing with bcrypt
- HTTPS enforcement
- Security headers implementation

## 📋 CI/CD Pipeline Triggers

The pipeline automatically runs on:
- **Push to main/develop branches**
- **Pull requests to main/develop branches**
- **Scheduled daily security scans** (2 AM UTC)
- **Manual workflow triggers**

## 🛠️ Local Development Setup

### Prerequisites
- Docker and Docker Compose
- PHP 8.1+
- Composer
- Node.js 18+
- MySQL 8.0+

### Quick Start
```bash
# Clone the repository
git clone <repository-url>
cd SSD_Grp18

# Start the application
docker-compose up -d

# Install PHP dependencies
cd php
composer install

# Install JavaScript dependencies
npm install

# Run tests
composer test
npm test
```

### Running Security Scans Locally
```bash
# Run PHP security checks
composer security-check

# Run code quality checks
composer cs
composer phpmd
composer phpstan

# Run JavaScript security audit
npm audit

# Run Semgrep security scan
semgrep scan --config p/security-audit .
```

## 📊 CI/CD Pipeline Evidence

### Automated Triggers
The CI/CD pipeline has been successfully triggered multiple times throughout the implementation phase:

1. **Initial Setup**: Pipeline configuration and testing
2. **Security Implementation**: Security scanning integration
3. **Testing Framework**: Unit and integration test setup
4. **Container Security**: Docker security scanning implementation
5. **Deployment Automation**: Production deployment configuration

### Pipeline Stages Evidence
- ✅ **Security Scanning**: OWASP ZAP, Semgrep, Trivy scans completed
- ✅ **Code Quality**: PHP CodeSniffer, PHPStan, ESLint checks passed
- ✅ **Testing**: PHPUnit and Jest test suites executed
- ✅ **Container Build**: Multi-stage Docker builds with security scanning
- ✅ **Deployment**: Automated deployment to production environment

## 🔍 Security Compliance

### OWASP Top 10 Coverage
- ✅ **A01:2021 – Broken Access Control**
- ✅ **A02:2021 – Cryptographic Failures**
- ✅ **A03:2021 – Injection**
- ✅ **A04:2021 – Insecure Design**
- ✅ **A05:2021 – Security Misconfiguration**
- ✅ **A06:2021 – Vulnerable Components**
- ✅ **A07:2021 – Authentication Failures**
- ✅ **A08:2021 – Software and Data Integrity Failures**
- ✅ **A09:2021 – Security Logging Failures**
- ✅ **A10:2021 – Server-Side Request Forgery**

### Security Headers
- Content-Security-Policy
- X-Frame-Options
- X-Content-Type-Options
- X-XSS-Protection
- Strict-Transport-Security
- Referrer-Policy

## 📈 Monitoring and Reporting

### Security Reports
- Daily automated security scan reports
- Pull request security analysis
- Container vulnerability reports
- Dependency security audits

### Performance Metrics
- Test coverage reports
- Build time optimization
- Deployment success rates
- Security scan results tracking

## 🚨 Incident Response

### Security Incident Procedures
1. **Detection**: Automated security scanning alerts
2. **Assessment**: Security team review and classification
3. **Containment**: Immediate security patch deployment
4. **Recovery**: System restoration and verification
5. **Post-Incident**: Analysis and process improvement

## 📚 Documentation

- [Security Guidelines](docs/security-guidelines.md)
- [CI/CD Pipeline Documentation](docs/ci-cd-pipeline.md)
- [Deployment Guide](docs/deployment-guide.md)
- [Testing Strategy](docs/testing-strategy.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run security scans locally
5. Submit a pull request
6. CI/CD pipeline will automatically run security checks

## 📄 License

This project is part of the Secure Software Development course at [Your University].

## 👥 Team Members

- [Team Member 1]
- [Team Member 2]
- [Team Member 3]
- [Team Member 4]

---

**Last Updated**: December 2024
**CI/CD Pipeline Version**: 1.0.0
**Security Scan Status**: ✅ All checks passing 