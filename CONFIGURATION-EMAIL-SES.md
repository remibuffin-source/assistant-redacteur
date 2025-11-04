# 📧 Configuration Email avec Amazon SES

## 🎯 Architecture Email

### Production (AWS)
```
Frontend (Amplify - HTTPS)
    ↓ VITE_EMAIL_SERVER_URL
AWS Lambda (email-service)
    ↓ FROM_EMAIL
Amazon SES
    ↓
Destinataire
```

### Local (Développement)
```
Frontend (localhost:3003)
    ↓ http://localhost:3001
Serveur Email (server.js)
    ↓ VITE_EMAIL_USER + VITE_EMAIL_PASSWORD
Gmail SMTP
    ↓
Destinataire
```

---

## ⚙️ Variables d'environnement

### Amplify (Production - Frontend)
```bash
VITE_EMAIL_SERVER_URL=https://e6f6kya0zj.execute-api.eu-west-1.amazonaws.com/default/email-service
```

### Lambda (Production - Backend Email)
```bash
FROM_EMAIL=assistant.studioducapbrun@gmail.com
```

### .env.local (Développement)
```bash
VITE_EMAIL_USER=assistant.studioducapbrun@gmail.com
VITE_EMAIL_PASSWORD=ylma gxrm hnto fpqx
```

---

## 💰 Tarification Amazon SES

- **62,000 emails GRATUITS par mois** (à vie avec Lambda)
- **$0.10 par 1,000 emails** au-delà
- Pas de limite de temps (contrairement à d'autres services AWS)

---

## 🔐 Permissions Lambda

La fonction Lambda nécessite la politique IAM :
- **AmazonSESFullAccess**

---

## 📝 Notes

- Email vérifié dans SES : `assistant.studioducapbrun@gmail.com`
- Mode actuel : **Sandbox** (envoi uniquement vers emails vérifiés)
- Pour sortir du sandbox : Demander l'accès production dans la console SES

---

## 🧪 Test

### Test local
```bash
.\test-local-email.ps1
```

### Test Lambda
```bash
.\test-lambda-email.ps1
```

---

Date de configuration : 4 novembre 2025
