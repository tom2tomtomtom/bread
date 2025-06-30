// Manual video export test
// This script will help us manually test the video export functionality

console.log('🎬 Manual Video Export Test Instructions');
console.log('=======================================');
console.log('');
console.log('1. Open https://aideas-redbaez.netlify.app in your browser');
console.log('2. Register/Login with any email and password');
console.log('3. Fill minimal brief: "RedBaez Airwave wireless charging for tech professionals"');
console.log('4. Fill Campaign Goal: "Launch wireless charging"');
console.log('5. Fill Target Audience: "Tech professionals 25-45"');
console.log('6. Click on "🎬Video Template" in the workflow navigation');
console.log('7. Select any template from the template selector');
console.log('8. Fill in video content:');
console.log('   - Frame 1 Headline: "Experience True Wireless Freedom"');
console.log('   - Frame 2 Body: "Charge devices from 3 meters away"');
console.log('   - Frame 3 CTA: "Pre-order Now"');
console.log('9. Click on "📤Export & Download" in the workflow navigation');
console.log('10. Look for the "Video Export" section');
console.log('11. Click "🎬 Generate Video" button');
console.log('12. Wait for video generation to complete');
console.log('13. Click "📥 Download" button when it appears');
console.log('14. Verify the video file downloads');
console.log('');
console.log('Expected Result: A video file should be downloaded to your Downloads folder');
console.log('');

// Let's also check if we can access the site directly
const https = require('https');

console.log('🔍 Checking if site is accessible...');

const options = {
  hostname: 'aideas-redbaez.netlify.app',
  port: 443,
  path: '/',
  method: 'GET',
  timeout: 10000
};

const req = https.request(options, (res) => {
  console.log(`✅ Site is accessible - Status: ${res.statusCode}`);
  
  if (res.statusCode === 200) {
    console.log('🎯 Ready for manual testing!');
    console.log('');
    console.log('Quick test URL: https://aideas-redbaez.netlify.app');
  }
});

req.on('error', (err) => {
  console.log(`❌ Site check failed: ${err.message}`);
});

req.on('timeout', () => {
  console.log('⏰ Site check timed out');
  req.destroy();
});

req.end();