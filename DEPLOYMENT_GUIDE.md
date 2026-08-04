# Free Deployment Guide - Step by Step

## Prerequisites
- GitHub account
- Render account (free) - https://render.com
- Vercel account (free) - https://vercel.com
- Expo account (free) - https://expo.dev

---

## Step 1: Push to GitHub (DONE)

```bash
cd /Users/csridaran/Projects/Gift
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/sridaranc/Mongift.git
git push -u origin main
```

---

## Step 2: Deploy Backend API to Render

### 2.1 Create PostgreSQL Database
1. Go to https://render.com → Login
2. Click **New** → **PostgreSQL**
3. Fill in:
   - **Name**: `gift-db`
   - **Database**: `giftdeliverydb` (lowercase only)
   - **Plan**: Free
4. Click **Create Database**
5. Wait for database to be created
6. Copy these values:
   - Host: `dpg-xxxxx-a.oregon-postgres.render.com`
   - Username: `xxxxx`
   - Password: `xxxxx`

### 2.2 Create Web Service
1. Click **New** → **Web Service**
2. Connect GitHub repository: `https://github.com/sridaranc/Mongift`
3. Fill in:
   - **Name**: `mongift`
   - **Runtime**: Docker
   - **Dockerfile Path**: `./Dockerfile`
   - **Plan**: Free
4. Add Environment Variables:

| Key | Value |
|-----|-------|
| `ConnectionStrings__DefaultConnection` | `Host=YOUR_HOST;Port=5432;Database=giftdeliverydb;Username=YOUR_USER;Password=YOUR_PASS` |
| `JwtSettings__Secret` | `SuperSecretKeyForProduction_12345!` |
| `JwtSettings__Issuer` | `GiftDeliveryApi` |
| `JwtSettings__Audience` | `GiftDeliveryClients` |
| `JwtSettings__ExpirationInMinutes` | `60` |
| `ASPNETCORE_ENVIRONMENT` | `Production` |

5. Click **Create Web Service**
6. Wait for deployment (5-10 minutes)
7. Copy your API URL (e.g., `https://mongift.onrender.com`)

### 2.3 Test API
Open browser: `https://your-api-url.onrender.com/api/products`
Should return JSON data.

---

## Step 3: Deploy Frontend to Vercel

### 3.1 Create Project
1. Go to https://vercel.com → Login
2. Click **Add New** → **Project**
3. Import GitHub repository: `sridaranc/Mongift`
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### 3.2 Add Environment Variable
1. Click **Environment Variables**
2. Add:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://mongift.onrender.com/api` (your Render URL)
3. Click **Add**

### 3.3 Deploy
1. Click **Deploy**
2. Wait for deployment (1-2 minutes)
3. Copy your Vercel URL (e.g., `https://mongift.vercel.app`)

### 3.4 Test Frontend
Open: `https://your-app.vercel.app`
Should load the homepage with products.

---

## Step 4: Build Mobile App with EAS

### 4.1 Install EAS CLI
```bash
npm install -g eas-cli
```

### 4.2 Login to Expo
```bash
eas login
```

### 4.3 Update Mobile API URL
Edit `mobile/src/api/client.ts`:
```typescript
const BASE_URL = 'https://mongift.onrender.com/api';
```

### 4.4 Initialize EAS
```bash
cd mobile
eas init
```
Follow prompts, copy the project ID.

### 4.5 Update app.json
Edit `mobile/app.json` and replace `your-eas-project-id` with your actual project ID.

### 4.6 Build for Android
```bash
eas build --platform android --profile preview
```

### 4.7 Download APK
1. Go to https://expo.dev
2. Select your project
3. Download the APK
4. Install on Android device

---

## Step 5: Update Render with Real Secrets

### 5.1 Generate JWT Secret
Go to https://generate-secret.org/ and copy the generated secret.

### 5.2 Update Render Environment
1. Go to Render Dashboard → mongift service → **Environment**
2. Update `JwtSettings__Secret` with the generated secret
3. Click **Save**
4. **Manual Deploy** → Deploy latest commit

---

## Step 6: Custom Domains (Optional)

### 6.1 Vercel Custom Domain
1. Go to Vercel → Settings → Domains
2. Add your domain
3. Update DNS records as shown

### 6.2 Render Custom Domain
1. Go to Render → Settings → Custom Domains
2. Add your domain
3. Update DNS records as shown

---

## URLs Summary

| Service | URL |
|---------|-----|
| **Backend API** | https://mongift.onrender.com |
| **Frontend** | https://mongift.vercel.app |
| **Mobile** | Download APK from Expo |

---

## Default Login Credentials

| Role | Email | Password |
|------|-------|----------|
| **Super Admin** | superadmin@giftdelivery.com | SuperSecurePassword123! |
| **Admin** | admin@gift.com | admin123 |
| **Admin** | srimon265@gmail.com | admin123 |

---

## Troubleshooting

### Backend not responding
- Check Render logs for errors
- Ensure database connection string is correct
- Wait 30 seconds for cold start

### Frontend can't load data
- Check `VITE_API_URL` environment variable
- Ensure backend is running
- Check browser console for CORS errors

### Mobile app crash
- Ensure API URL is correct
- Check Expo build logs
- Test with Expo Go first: `npx expo start`

---

## Free Tier Limits

| Service | Limit |
|---------|-------|
| **Render** | 750 hours/month, spins down after 15 min inactivity |
| **Vercel** | 100GB bandwidth, unlimited deploys |
| **Render PostgreSQL** | 0.5GB storage, 90 days |
| **EAS Build** | 30 builds/month |

---

## Cost: $0/month

All services are free tier. No credit card required.
