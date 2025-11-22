# Stockage Dropbox Centralisé

## Vue d'ensemble

Le système de stockage Dropbox a été reconfiguré pour fonctionner comme un **stockage centralisé** (similaire à AWS S3), plutôt qu'une authentification OAuth par utilisateur.

## Architecture

### Backend

**Service de stockage** : `backend/services/dropboxStorageService.js`
- Utilise `DROPBOX_ACCESS_TOKEN` (token d'application permanent)
- Gère tous les fichiers dans la Dropbox de l'application
- Organisation : `/Assistant-Redacteur/users/{userId}/{folder}/`

**Routes API** : `backend/routes/storage.js`
- `POST /api/storage/upload` - Upload un fichier
- `GET /api/storage/files?folder=...` - Liste les fichiers
- `GET /api/storage/download?path=...` - Télécharge un fichier
- `DELETE /api/storage/file` - Supprime un fichier
- `POST /api/storage/folder` - Crée un dossier
- `GET /api/storage/metadata?path=...` - Métadonnées d'un fichier
- `GET /api/storage/status` - Statut du service

### Frontend

**Service** : `react-app/src/services/dropboxService.js`
- Appelle le backend via `/api/storage/*`
- Utilise le token JWT de l'utilisateur pour l'authentification
- Pas besoin d'OAuth Dropbox côté client

**Composant** : `react-app/src/components/files/DropboxManager.jsx`
- Interface simplifiée sans bouton "Se connecter à Dropbox"
- Upload/download/liste des fichiers directement

## Configuration

### Variables d'environnement backend

Dans `backend/.env` :

```env
# Token d'accès permanent de votre application Dropbox
DROPBOX_ACCESS_TOKEN=sl.xxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Comment obtenir le token

1. Aller sur https://www.dropbox.com/developers/apps
2. Sélectionner votre app "Assistant-Redacteur"
3. Dans l'onglet "Settings", section "OAuth 2"
4. Générer un "Access Token" (permanent)
5. Copier ce token dans `DROPBOX_ACCESS_TOKEN`

## Structure des dossiers Dropbox

```
/Assistant-Redacteur/
  /users/
    /{userId}/
      /uploads/        # Fichiers uploadés par l'utilisateur
      /documents/      # Documents générés
      /templates/      # Modèles sauvegardés
      /exports/        # Exports de données
```

## Utilisation

### Depuis le code backend

```javascript
import { dropboxStorageService } from '../services/dropboxStorageService.js';

// Upload
await dropboxStorageService.uploadFile(fileBuffer, userId, 'uploads', 'mon-fichier.pdf');

// Liste
const files = await dropboxStorageService.listFiles(userId, 'uploads');

// Download
const file = await dropboxStorageService.downloadFile('/Assistant-Redacteur/users/123/uploads/mon-fichier.pdf');

// Delete
await dropboxStorageService.deleteFile('/Assistant-Redacteur/users/123/uploads/mon-fichier.pdf');
```

### Depuis le frontend

```javascript
import { dropboxService } from './services/dropboxService';

// Upload
await dropboxService.uploadFile(file, 'uploads');

// Liste
const files = await dropboxService.listFiles('uploads');

// Download
await dropboxService.downloadFile(filePath, filename);

// Delete
await dropboxService.deleteFile(filePath);
```

## Fichiers supprimés

Les fichiers suivants ont été supprimés car ils ne sont plus nécessaires :

- `backend/routes/dropbox.js` (anciennes routes OAuth)
- `react-app/src/components/auth/DropboxAuth.jsx` (composant OAuth)
- `react-app/src/components/ui/DropboxButton.jsx` (bouton de connexion)

## Avantages

✅ **Simplicité** : Pas besoin que chaque utilisateur connecte sa Dropbox  
✅ **Sécurité** : Le token d'app reste côté backend, jamais exposé au client  
✅ **Centralisation** : Tous les fichiers dans une seule Dropbox (la vôtre)  
✅ **Organisation** : Structure claire par utilisateur  
✅ **Maintenance** : Plus simple à gérer qu'OAuth multi-utilisateurs  

## Migration

Si vous aviez déjà des fichiers avec l'ancienne approche OAuth, ils ne sont pas affectés. Le nouveau système crée sa propre structure dans `/Assistant-Redacteur/`.

## Tests

Pour tester le système :

1. Vérifier que `DROPBOX_ACCESS_TOKEN` est bien configuré dans `backend/.env`
2. Démarrer le backend : `npm run dev`
3. Tester le statut : `GET http://localhost:4000/api/storage/status`
4. Depuis l'interface : aller sur `/files` et uploader un fichier
5. Vérifier dans votre Dropbox que le fichier apparaît dans `/Assistant-Redacteur/users/{userId}/uploads/`

## Support

En cas de problème :
- Vérifier les logs backend (Winston)
- Vérifier que le token Dropbox est valide
- Vérifier les permissions de l'app Dropbox (lecture/écriture)
