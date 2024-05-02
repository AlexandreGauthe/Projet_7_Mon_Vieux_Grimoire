const sharp = require('sharp'); // Module Sharp pour le traitement d'images
const path = require('path'); // Module Path pour la manipulation des chemins de fichiers
const fs = require('fs'); // Module fs pour les opérations de fichiers

// Définition des types MIME pour les extensions d'images
const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png',
};

function resizeImage(file) {
  const absolutePath = path.resolve(file.path);
  // Obtention de l'extension du fichier à partir du type MIME
  const extension = MIME_TYPES[file.mimetype];
  sharp.cache(false); 
  // Utilisation de Sharp pour redimensionner l'image
     sharp(absolutePath)
    .resize({ width: 800, fit: 'contain' })
  // Suppression de l'image originale après redimensionnement
  fs.unlink(absolutePath, (err) => {
    if (err) {
      console.log(err);
    }
  });
}
module.exports = { resizeImage };