const fs = require('fs');

const svg = fs.readFileSync('icon.svg', 'utf8');
const sharp = require('sharp');

sharp(Buffer.from(svg))
  .resize(512, 512)
  .png()
  .toFile('build/icon.png')
  .then(() => console.log('Icon created successfully'))
  .catch(err => console.error('Error creating icon:', err));
