#!/bin/bash
set -e

REPO="https://raw.githubusercontent.com/daker52/divelog/main"
DEST="/var/www/html/divelog"
SERVER_DIR="/opt/divelog-server"
JWT_SECRET="${JWT_SECRET:-$(openssl rand -hex 32)}"

echo "=== 1/5 Instalace nginx, Node.js a Postfix ==="
apt-get update -qq
# Postfix noninteractive setup: Internet Site
DEBIAN_FRONTEND=noninteractive apt-get install -y nginx nodejs npm postfix -qq
# Make sure postfix is running
systemctl enable postfix --quiet
systemctl start postfix

echo "=== 2/5 Stahuji soubory frontendu ==="
mkdir -p "$DEST/assets"
for f in index.html app.js styles.css manifest.json sw.js; do
  curl -fsSL "$REPO/$f" -o "$DEST/$f"
done
curl -fsSL "$REPO/assets/logo.png" -o "$DEST/assets/logo.png" 2>/dev/null || true
chown -R www-data:www-data "$DEST"

echo "=== 3/5 Stahuji a instaluji backend ==="
mkdir -p "$SERVER_DIR/routes" "$SERVER_DIR/middleware" "$SERVER_DIR/utils" "$SERVER_DIR/data"
for f in package.json index.js db.js; do
  curl -fsSL "$REPO/server/$f" -o "$SERVER_DIR/$f"
done
for f in auth.js dives.js gear.js forum.js; do
  curl -fsSL "$REPO/server/routes/$f" -o "$SERVER_DIR/routes/$f"
done
curl -fsSL "$REPO/server/middleware/auth.js" -o "$SERVER_DIR/middleware/auth.js"
curl -fsSL "$REPO/server/utils/email.js" -o "$SERVER_DIR/utils/email.js"

# Uloz JWT secret trvale
if [ ! -f "$SERVER_DIR/.env" ]; then
  echo "JWT_SECRET=$JWT_SECRET" > "$SERVER_DIR/.env"
  echo "PORT=3000" >> "$SERVER_DIR/.env"
  echo "DB_DIR=$SERVER_DIR/data" >> "$SERVER_DIR/.env"
  echo "FROM_EMAIL=no-reply@yourdivelog.cz" >> "$SERVER_DIR/.env"
  echo "APP_URL=http://194.182.80.24" >> "$SERVER_DIR/.env"
else
  # Add missing env vars to existing .env
  grep -q "^FROM_EMAIL" "$SERVER_DIR/.env" || echo "FROM_EMAIL=no-reply@yourdivelog.cz" >> "$SERVER_DIR/.env"
  grep -q "^APP_URL" "$SERVER_DIR/.env"    || echo "APP_URL=http://194.182.80.24" >> "$SERVER_DIR/.env"
  # Remove old SendGrid key if present (no longer needed)
  sed -i '/^SENDGRID_API_KEY/d' "$SERVER_DIR/.env" 2>/dev/null || true
fi

cd "$SERVER_DIR"
npm install --production --silent

echo "=== 4/5 Nastavuji systemd service ==="
cat > /etc/systemd/system/divelog-api.service <<EOF
[Unit]
Description=YourDiveLog API
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=$SERVER_DIR
EnvironmentFile=$SERVER_DIR/.env
ExecStart=/usr/bin/node $SERVER_DIR/index.js
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

chown -R www-data:www-data "$SERVER_DIR"
systemctl daemon-reload
systemctl enable divelog-api
systemctl restart divelog-api

echo "=== 5/5 Konfiguruji nginx ==="
cat > /etc/nginx/sites-available/default <<'EOF'
server {
    listen 80;
    listen [::]:80;
    root /var/www/html/divelog;
    index index.html;

    location /api/ {
        proxy_pass http://127.0.0.1:3000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location / {
        try_files $uri $uri/ =404;
    }
}
EOF

nginx -t && systemctl restart nginx
echo "=== Hotovo! Portal bezi na http://194.182.80.24/ ==="

