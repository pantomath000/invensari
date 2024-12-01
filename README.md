InvenSari bagus banget

Semoga kelompok 1 dapet A

Steps to deploy:

0. sudo apt update ; sudo apt upgrade -y ; sudo apt install -y nginx python3 python3-pip python3-dj-static python3-venv git curl nodejs npm certbot python3-certbot-nginx build-essential python3-django python3-django-cors-headers python3-djangorestframework python3-djangorestframework-simplejwt python3-pillow gunicorn ; pip3 install django

1. Add an A Record:
[Name/Host: @,
Type: A,
Value: "Server IP",
TTL: Default]

2. Add another A Record:
[Name/Host: www,
Type: A,
Value: "Server IP",
TTL: Default]

3. cd /root/inventory-frontend/ ; npm install ; nohup npm start &

4. cd /root/inventory_system/ ; python3 manage.py makemigrations ; python3 manage.py migrate ; nohup gunicorn --bind 0.0.0.0:8000 inventory_system.wsgi &

5. cp /root/inventory_system/invensari.shop /etc/nginx/sites-available/ ; sudo ln -s /etc/nginx/sites-available/invensari.shop /etc/nginx/sites-enabled/

6. mkdir /var/www/inventory_system/ ; cp -r /root/inventory_system/media /var/www/inventory_system/ ; chown -R www-data:www-data /var/www/inventory_system/media

7. nginx -t

8. systemctl reload nginx

9. certbot --nginx -d invensari.shop -d www.invensari.shop
