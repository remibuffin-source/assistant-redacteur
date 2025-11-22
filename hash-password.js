// Script pour générer le hash bcrypt du mot de passe admin
const bcrypt = require('bcryptjs');

const password = 'AdminStudio2025!';

bcrypt.hash(password, 10, (err, hash) => {
    if (err) {
        console.error('Erreur:', err);
        process.exit(1);
    }
    console.log('Hash bcrypt pour le mot de passe:', password);
    console.log(hash);
});
