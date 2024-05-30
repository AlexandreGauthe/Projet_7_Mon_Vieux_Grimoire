// Fonction asynchrone pour redimensionner une image

const sharp = require('sharp'); 
const path = require('path');
const fs = require('fs'); 

const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
};

async function resizeImage(file) {
  const absolutePath = path.resolve(file.path);
  const extension = MIME_TYPES[file.mimetype];
  const destinationPath = absolutePath.replace(`.${extension}`, '.avif');
  
  sharp.cache(false); 
  await sharp(absolutePath)
    .resize({ width: 800, fit: 'contain' })
    .avif()
    .toFile(destinationPath);

  fs.unlink(absolutePath, (err) => {
    if (err) {
      console.log(err);
    }
  });
  return file.path.replace(`.${extension}`, '.avif');
}
module.exports = { resizeImage };