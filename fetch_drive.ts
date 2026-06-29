import fs from 'fs';

function main() {
  const html = fs.readFileSync('drive_folder.html', 'utf8');
  console.log('HTML starting part:');
  console.log(html.slice(0, 1000));
  
  console.log('HTML ending part:');
  console.log(html.slice(-1000));

  // Check if "Sign in" or "ServiceLogin" or similar is inside the HTML
  const hasSignIn = html.includes('ServiceLogin') || html.includes('Sign in') || html.includes('login');
  console.log('Contains Sign in/login:', hasSignIn);
}

main();
