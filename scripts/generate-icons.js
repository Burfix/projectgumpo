// Enhanced icon generation with proper goose logo design
const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconDir = path.join(__dirname, '../public/icons');

// Ensure directory exists
if (!fs.existsSync(iconDir)) {
  fs.mkdirSync(iconDir, { recursive: true });
}

// Enhanced goose logo design
const createGooseLogo = (size) => {
  const scale = size / 512;
  const strokeWidth = Math.max(2, 8 * scale);
  
  return `
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <!-- Background -->
  <rect width="512" height="512" fill="#10b981" rx="80"/>
  
  <!-- Goose Body -->
  <ellipse cx="256" cy="300" rx="120" ry="140" fill="white" opacity="0.95"/>
  
  <!-- Goose Neck -->
  <path d="M 256 180 Q 240 140, 260 100" 
        stroke="white" 
        stroke-width="${strokeWidth * 2}" 
        fill="none" 
        stroke-linecap="round" 
        opacity="0.95"/>
  
  <!-- Goose Head -->
  <circle cx="265" cy="95" r="35" fill="white" opacity="0.95"/>
  
  <!-- Beak -->
  <path d="M 295 95 L 320 90 L 295 100 Z" fill="#f59e0b" opacity="0.9"/>
  
  <!-- Eye -->
  <circle cx="275" cy="88" r="6" fill="#1f2937"/>
  
  <!-- Wing accent -->
  <path d="M 200 280 Q 160 260, 180 240" 
        stroke="white" 
        stroke-width="${strokeWidth}" 
        fill="none" 
        stroke-linecap="round" 
        opacity="0.7"/>
  
  <!-- Project Name (for larger sizes) -->
  ${size >= 192 ? `
  <text x="256" y="470" 
        font-family="Arial, sans-serif" 
        font-size="${Math.floor(40 * scale)}" 
        font-weight="bold"
        fill="white" 
        text-anchor="middle">
    PROJECT GOOSE
  </text>` : ''}
  
  <!-- Subtle gradient overlay -->
  <defs>
    <linearGradient id="shine" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:white;stop-opacity:0.1" />
      <stop offset="100%" style="stop-color:white;stop-opacity:0" />
    </linearGradient>
  </defs>
  <rect width="512" height="512" fill="url(#shine)" rx="80"/>
</svg>`.trim();
};

// Generate all icon sizes
sizes.forEach(size => {
  const svg = createGooseLogo(size);
  const filename = path.join(iconDir, `icon-${size}x${size}.svg`);
  fs.writeFileSync(filename, svg);
  console.log(`✓ Created ${filename}`);
});

// Create favicon.ico alternative (SVG)
const faviconSvg = createGooseLogo(32);
fs.writeFileSync(path.join(__dirname, '../public/favicon.svg'), faviconSvg);
console.log('✓ Created /public/favicon.svg');

console.log('\n🎨 Enhanced goose logo icons created successfully!');
console.log('📱 Icons include proper branding and are production-ready.');
console.log('💡 For even better results, consider hiring a designer for custom artwork.\n');
