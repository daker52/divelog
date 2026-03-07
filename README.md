# 🤿 YourDiveLog

> **Moderní digitální potápěčský deník** – loguj ponory, spravuj vybavení, sdílej zážitky ve fóru.

🌐 **Live demo:** [http://194.182.80.24](http://194.182.80.24)

---

## ✨ Funkce

| Modul | Popis |
|---|---|
| 📋 **Dive Log** | Záznam ponorů s profilem hloubky, GPS souřadnicemi, fotografiemi |
| 📊 **Statistiky** | Grafy a přehledy – celkový čas, max hloubka, nejoblíbenější lokace |
| 🗺️ **Mapa** | Interaktivní OpenStreetMap s vyznačenými lokalitami ponorů |
| 🎒 **Vybavení** | Správa potápěčského vybavení s upozorněním na servisní termíny |
| 👥 **Komunita** | Profily potápěčů, sdílení zkušeností |
| 💬 **Fórum** | Diskuze open pro všechny, příspěvky vyžadují přihlášení |
| 👤 **Profil** | Avatar, certifikace, domovská lokalita, bio |
| 🔒 **Autentizace** | Registrace, přihlášení, reset hesla, verifikace e-mailu |

---

## 🏗️ Architektura

```
┌─────────────────────────────────────────┐
│            Browser (Vanilla JS)          │
│   index.html · app.js · styles.css      │
│              PWA + Service Worker        │
└──────────────────┬──────────────────────┘
                   │ /api/*
┌──────────────────▼──────────────────────┐
│         nginx (reverse proxy)            │
│              port 80                     │
└──────────────────┬──────────────────────┘
                   │ proxy_pass
┌──────────────────▼──────────────────────┐
│       Node.js + Express  (port 3000)     │
│        systemd: divelog-api.service      │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────▼──────────────────────┐
│           SQLite (better-sqlite3)        │
│    /opt/divelog-server/data/divelog.db   │
└─────────────────────────────────────────┘
```

---

## 🗄️ Databázové tabulky

| Tabulka | Obsah |
|---|---|
| `users` | Uživatelé – login, profil, avatar (base64), nastavení, certifikace |
| `dives` | Záznamy ponorů (JSON blob per uživatel) |
| `gear` | Vybavení (JSON blob per uživatel) |
| `forum_posts` | Příspěvky ve fóru |

> 💾 **Veškerá data jsou serverside** – localStorage slouží pouze pro JWT token.

---

## 🔐 API Endpointy

### Auth
| Metoda | Endpoint | Popis |
|---|---|---|
| `POST` | `/api/auth/register` | Registrace nového uživatele |
| `GET` | `/api/auth/verify/:token` | Ověření e-mailu |
| `POST` | `/api/auth/login` | Přihlášení, vrací JWT |
| `POST` | `/api/auth/forgot-password` | Odeslání odkazu pro reset hesla |
| `POST` | `/api/auth/reset-password` | Nastavení nového hesla |
| `GET` | `/api/auth/profile` | 🔒 Profil přihlášeného uživatele |
| `PUT` | `/api/auth/profile` | 🔒 Aktualizace profilu + avataru |
| `GET` | `/api/auth/settings` | 🔒 Načtení nastavení |
| `PUT` | `/api/auth/settings` | 🔒 Uložení nastavení |

### Data (🔒 vše vyžaduje JWT)
| Metoda | Endpoint | Popis |
|---|---|---|
| `GET/POST` | `/api/dives` | Seznam / přidání ponoru |
| `PUT/DELETE` | `/api/dives/:id` | Úprava / smazání ponoru |
| `GET/POST` | `/api/gear` | Seznam / přidání vybavení |
| `PUT/DELETE` | `/api/gear/:id` | Úprava / smazání vybavení |
| `GET` | `/api/forum` | Veřejný seznam příspěvků |
| `POST` | `/api/forum` | 🔒 Přidání příspěvku |
| `DELETE` | `/api/forum/:id` | 🔒 Smazání příspěvku |
| `GET` | `/api/health` | Health check |

---

## 🚀 Deployment

### Automatický (GitHub Actions)

Každý push na `main` automaticky nasadí změny na server:

```
git push origin main  →  GitHub Actions  →  SSH deploy  →  server live
```

Workflow: [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)

### Manuální deploy

```bash
bash <(curl -fsSL https://raw.githubusercontent.com/daker52/divelog/main/deploy.sh)
```

### Co deploy.sh dělá

```
1️⃣  apt install nginx nodejs npm postfix
2️⃣  Stažení frontend souborů → /var/www/html/divelog/
3️⃣  Stažení backend souborů → /opt/divelog-server/
4️⃣  npm install --production
5️⃣  Vytvoření systemd service (divelog-api)
6️⃣  Konfigurace nginx s /api/ proxy_pass
```

---

## ⚙️ Konfigurace serveru

Soubor `/opt/divelog-server/.env`:

```env
JWT_SECRET=<vygenerováno automaticky>
PORT=3000
DB_DIR=/opt/divelog-server/data
FROM_EMAIL=no-reply@yourdivelog.cz
APP_URL=http://194.182.80.24
```

### GitHub Secrets (nutné pro CI/CD)

| Secret | Hodnota |
|---|---|
| `SSH_HOST` | IP adresa serveru |
| `SSH_USER` | SSH uživatel (root) |
| `SSH_PASSWORD` | SSH heslo |

---

## 🛠️ Technologie

### Frontend
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)
![PWA](https://img.shields.io/badge/PWA-5A0FC8?style=flat&logo=pwa&logoColor=white)

- Vanilla JS SPA (bez frameworku)
- OpenStreetMap + Leaflet.js
- Service Worker pro offline podporu

### Backend
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=flat&logo=express&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-003B57?style=flat&logo=sqlite&logoColor=white)

- **Express 4** – REST API
- **better-sqlite3** – synchronní SQLite
- **bcryptjs** – hashování hesel
- **jsonwebtoken** – JWT autentizace (30 dní)
- **nodemailer** – e-mailové notifikace přes Postfix

### Infrastruktura
![Ubuntu](https://img.shields.io/badge/Ubuntu_24.04-E95420?style=flat&logo=ubuntu&logoColor=white)
![Nginx](https://img.shields.io/badge/nginx-009639?style=flat&logo=nginx&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=flat&logo=githubactions&logoColor=white)

---

## 📁 Struktura projektu

```
yourdivelog/
├── 📄 index.html          # Hlavní HTML (SPA)
├── 🎨 styles.css          # Styly (dark ocean theme)
├── ⚙️  app.js             # Celá frontend logika (~2500 řádků)
├── 📱 manifest.json       # PWA manifest
├── 🔧 sw.js               # Service Worker
├── 🚀 deploy.sh           # Deploy skript
├── assets/
│   └── 🖼️  logo.png
├── server/
│   ├── 📦 package.json
│   ├── 🚀 index.js        # Express app (port 3000)
│   ├── 🗄️  db.js          # SQLite schema + migrace
│   ├── middleware/
│   │   └── 🔒 auth.js     # JWT middleware
│   ├── routes/
│   │   ├── 👤 auth.js     # Register, login, profil, reset hesla
│   │   ├── 🤿 dives.js    # CRUD ponory
│   │   ├── 🎒 gear.js     # CRUD vybavení
│   │   └── 💬 forum.js    # CRUD fórum
│   └── utils/
│       └── 📧 email.js    # E-mail (Postfix/nodemailer)
└── .github/
    └── workflows/
        └── ⚡ deploy.yml  # CI/CD pipeline
```

---

## 🔄 Jak to funguje

```
Registrace
  └─► Vytvoření účtu v DB → odeslání ověřovacího e-mailu
       └─► Klik na odkaz → email_verified = 1

Přihlášení
  └─► Ověření hesla (bcrypt) + email_verified check
       └─► JWT token (30 dní) → uložen v localStorage

App startup
  └─► JWT token nalezen → loadDataFromAPI()
       └─► Paralelní fetch: ponory + gear + fórum + profil + nastavení
            └─► Vykreslení UI s daty ze serveru
```

---

## 📸 Screenshots

> 🤿 Oceánský dark theme, interaktivní mapa, grafy statistik, fórum

---

*Made with ❤️ for divers · © 2026 YourDiveLog*
