FROM php:8.2-cli

WORKDIR /var/www/html

RUN apt-get update && apt-get install -y \
    git \
    unzip \
    libzip-dev \
    libpng-dev \
    libjpeg62-turbo-dev \
    libfreetype6-dev \
    libonig-dev \
    libxml2-dev \
    libpq-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install pdo pdo_mysql pdo_pgsql mbstring bcmath exif pcntl zip gd \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

COPY . .

RUN composer install --no-interaction --prefer-dist --optimize-autoloader

RUN mkdir -p storage/framework/sessions \
    storage/framework/views \
    storage/framework/cache \
    storage/logs \
    bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

EXPOSE 8000
ENV APP_ENV=production
CMD sh -c "echo 'APP_NAME=SRMS' > .env && echo 'APP_ENV=production' >> .env && echo 'APP_KEY=' >> .env && echo 'APP_DEBUG=false' >> .env && echo 'APP_URL=${APP_URL}' >> .env && echo 'DB_CONNECTION=pgsql' >> .env && echo 'DB_HOST=${DB_HOST}' >> .env && echo 'DB_PORT=5432' >> .env && echo 'DB_DATABASE=${DB_DATABASE}' >> .env && echo 'DB_USERNAME=${DB_USERNAME}' >> .env && echo 'DB_PASSWORD=${DB_PASSWORD}' >> .env && echo 'ADMIN_EMAIL=${ADMIN_EMAIL}' >> .env && echo 'ADMIN_PASSWORD=${ADMIN_PASSWORD}' >> .env && echo 'SANCTUM_STATEFUL_DOMAINS=${SANCTUM_STATEFUL_DOMAINS}' >> .env && echo 'SESSION_DOMAIN=${SESSION_DOMAIN}' >> .env && php artisan key:generate --force && php artisan config:clear && php artisan migrate --force && php artisan db:seed --class=AdminUserSeeder --force && php artisan serve --host=0.0.0.0 --port=8000"
