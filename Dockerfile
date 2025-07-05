# Multi-stage build for production
FROM php:8.1-fpm-alpine AS base

# Install system dependencies
RUN apk add --no-cache \
    nginx \
    mysql-client \
    git \
    curl \
    zip \
    unzip \
    && rm -rf /var/cache/apk/*

# Install PHP extensions
RUN docker-php-ext-install \
    mysqli \
    pdo \
    pdo_mysql \
    && docker-php-ext-enable \
    mysqli \
    pdo \
    pdo_mysql

# Set working directory
WORKDIR /var/www/html

# Copy composer files
COPY php/composer.json php/composer.lock ./

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Install dependencies
RUN composer install --no-dev --optimize-autoloader --no-interaction

# Copy application code
COPY . .

# Set proper permissions
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html \
    && chmod -R 777 /var/www/html/uploads

# Security stage - run security scans
FROM base AS security

# Install security tools
RUN apk add --no-cache \
    nodejs \
    npm \
    && npm install -g \
    audit-ci \
    snyk

# Run security audits
RUN composer audit --format=json --no-interaction || true
RUN npm audit --audit-level=moderate || true

# Production stage
FROM base AS production

# Copy nginx configuration
COPY docker/nginx/default.conf /etc/nginx/conf.d/default.conf

# Create non-root user
RUN addgroup -g 1000 appuser \
    && adduser -D -s /bin/sh -u 1000 -G appuser appuser

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/ || exit 1

# Start nginx and php-fpm
CMD ["sh", "-c", "php-fpm -D && nginx -g 'daemon off;'"] 