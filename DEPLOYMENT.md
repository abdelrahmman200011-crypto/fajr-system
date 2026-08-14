# Deployment Guide

## 1) Create Firebase project
- Open Firebase Console
- Create a new project or use the existing one
- Enable Authentication and Firestore
- Enable Hosting

## 2) Prepare environment file
Copy `.env.example` to `.env` and fill in the values from your Firebase project settings.

```bash
copy .env.example .env
```

## 3) Deploy to Firebase Hosting
```bash
npm install
npm run build
npx firebase login
npx firebase use default
npx firebase deploy --only hosting
```

## 4) Deploy to GitHub Pages
```bash
npm run deploy:ghpages
```

## 5) Production configuration notes
- Keep all Firebase secrets in `.env` and never commit them.
- Use Firestore security rules to restrict access to admin/branch roles.
- Validate production build before each deploy.
