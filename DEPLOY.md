# Mon Gift Delivery - Deployment Guide

## Prerequisites

1. **GitHub account** - Push code to a repository
2. **Render account** (free) - https://render.com
3. **Vercel account** (free) - https://vercel.com
4. **Expo account** (free) - https://expo.dev

---

## Step 1: Push to GitHub

```bash
cd /Users/csridaran/Projects/Gift
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/gift-delivery.git
git push -u origin main
```

---

## Step 2: Deploy Backend to Render

1. Go to https://render.com and sign up/login
2. Click **New +** → **Blueprint**
3. Connect your GitHub repository
4. Render will auto-detect `render.yaml` and create:
   - **Web Service** (`gift-delivery-api`) - .NET 9 API
   - **PostgreSQL Database** (`gift-db`) - Free 0.5GB
5. Wait for deployment to complete (~5-10 minutes)
6. Copy the service URL (e.g., `https://gift-delivery-api.onrender.com`)

### Environment Variables (auto-configured via render.yaml)

| Variable | Value |
|----------|-------|
| `ConnectionStrings__DefaultConnection` | Auto-linked from Render PostgreSQL |
| `JwtSettings__Secret` | Auto-generated |
| `ASPNETCORE_ENVIRONMENT` | Production |

---

## Step 3: Deploy Frontend to Vercel

1. Go to https://vercel.com and sign up/login
2. Click **Add New** → **Project**
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Add Environment Variable:
   - `VITE_API_URL` = `https://gift-delivery-api.onrender.com/api`
6. Click **Deploy**

### Update Mobile API URL

After backend is deployed, update `mobile/src/api/client.ts`:
```typescript
const BASE_URL = 'https://gift-delivery-api.onrender.com/api';
```

---

## Step 4: Build Mobile App with EAS

1. Install EAS CLI:
```bash
npm install -g eas-cli
```

2. Login to Expo:
```bash
eas login
```

3. Initialize EAS project:
```bash
cd mobile
eas init
```

4. Update `eas.json` with your project ID from step 3

5. Build for Android (APK):
```bash
eas build --platform android --profile preview
```

6. Build for iOS:
```bash
eas build --platform ios --profile preview
```

7. Download the build from https://expo.dev

---

## Free Tier Limits

| Service | Free Tier Limit |
|---------|-----------------|
| **Render** | 750 hours/month, spins down after inactivity |
| **Vercel** | 100GB bandwidth, unlimited deploys |
| **Render PostgreSQL** | 0.5GB storage, 90 days lifetime |
| **EAS Build** | 30 builds/month |

---

## Post-Deployment Checklist

- [ ] Backend API responds at `https://gift-delivery-api.onrender.com/api/products`
- [ ] Frontend loads at Vercel URL
- [ ] Frontend can fetch products from backend
- [ ] Mobile app connects to production API
- [ ] Admin login works (`superadmin@giftdelivery.com`)
- [ ] Image uploads work

---

## Troubleshooting

### Backend Render cold start
First request may take 30-60 seconds due to free tier sleep. Subsequent requests are fast.

### CORS issues
The backend already has CORS configured to allow all origins. If issues persist, check the `AllowAll` policy in `Program.cs`.

### Database migrations
Auto-migration runs on backend startup. If it fails, check Render logs for database connection errors.
