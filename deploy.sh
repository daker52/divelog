#!/bin/bash
set -e
REPO="https://raw.githubusercontent.com/daker52/divelog/main"
DEST="/var/www/html/divelog"
apt-get install -y nginx -qq
mkdir -p "$DEST/assets"
for f in index.html app.js styles.css manifest.json sw.js; do
  curl -fsSL "$REPO/$f" -o "$DEST/$f"
done
curl -fsSL "$REPO/assets/logo.png" -o "$DEST/assets/logo.png" 2>/dev/null || true
chown -R www-data:www-data "$DEST"
cat > /etc/nginx/sites-available/default <<'EOF'
server {
    listen 80;
    listen [::]:80;
    root /var/www/html/divelog;
    index index.html;
    location / { try_files $uri $uri/ =404; }
}
EOF
nginx -t && systemctl restart nginx
echo "=== Hotovo! Portal bezi ==="
