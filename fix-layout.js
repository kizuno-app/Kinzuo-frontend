const fs = require('fs');
const path = require('path');

const files = [
  'src/app/page.tsx',
  'src/app/discover/page.tsx',
  'src/app/create/page.tsx',
  'src/app/chats/page.tsx',
  'src/app/profile/page.tsx',
  'src/app/profile/[id]/page.tsx',
  'src/app/user/post/[id]/page.tsx'
];

files.forEach(file => {
  const fullPath = path.join(__dirname, file);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    content = content.replace(/import AppLayout from "@\/components\/AppLayout";\r?\n?/g, '');
    content = content.replace(/<AppLayout>/g, '<>');
    content = content.replace(/<\/AppLayout>/g, '</>');
    fs.writeFileSync(fullPath, content);
    console.log(`Updated ${file}`);
  } else {
    console.log(`File not found: ${file}`);
  }
});
