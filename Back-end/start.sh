#!/bin/sh

if [ -z "$APP_KEY" ]; then
  APP_KEY=$(php artisan key:generate --show)
fi

cat > /var/www/html/.env << ENVFILE
APP_NAME=SRMS
APP_ENV=production
APP_DEBUG=true
APP_URL=${APP_URL}
APP_KEY=${APP_KEY}

DB_CONNECTION=pgsql
DB_HOST=${DB_HOST}
DB_PORT=5432
DB_DATABASE=${DB_DATABASE}
DB_USERNAME=${DB_USERNAME}
DB_PASSWORD=${DB_PASSWORD}

ADMIN_EMAIL=${ADMIN_EMAIL}
ADMIN_PASSWORD=${ADMIN_PASSWORD}

SANCTUM_STATEFUL_DOMAINS=${SANCTUM_STATEFUL_DOMAINS}
SESSION_DOMAIN=${SESSION_DOMAIN}
SESSION_DRIVER=cookie
CACHE_DRIVER=file
FILESYSTEM_DISK=cloudinary

CLOUDINARY_URL=cloudinary://${CLOUDINARY_API_KEY}:${CLOUDINARY_API_SECRET}@${CLOUDINARY_CLOUD_NAME}
CLOUDINARY_CLOUD_NAME=${CLOUDINARY_CLOUD_NAME}
CLOUDINARY_API_KEY=${CLOUDINARY_API_KEY}
CLOUDINARY_API_SECRET=${CLOUDINARY_API_SECRET}
ENVFILE

echo "=== .env généré ===" 
cat /var/www/html/.env
echo "==================="

cd /var/www/html

php artisan config:clear
php artisan storage:link --force
php artisan migrate --force
php artisan db:seed --class=AdminUserSeeder --force
php artisan serve --host=0.0.0.0 --port=8000