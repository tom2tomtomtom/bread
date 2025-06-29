// Direct OpenAI API test - bypassing all our application code
const https = require('https');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || 'sk-proj-your-key-here';

function testOpenAIDirectly() {
  console.log('🧪 Testing OpenAI API directly...');
  console.log('⏰ Start time:', new Date().toISOString());
  
  const startTime = Date.now();
  
  const postData = JSON.stringify({
    model: "dall-e-3",
    prompt: "A simple test image of a red apple",
    n: 1,
    size: "1024x1024",
    quality: "standard"
  });

  const options = {
    hostname: 'api.openai.com',
    port: 443,
    path: '/v1/images/generations',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const req = https.request(options, (res) => {
    console.log(`📡 Response status: ${res.statusCode}`);
    console.log(`📋 Response headers:`, res.headers);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      const endTime = Date.now();
      const duration = (endTime - startTime) / 1000;
      
      console.log(`⏱️  Total time: ${duration} seconds`);
      console.log('⏰ End time:', new Date().toISOString());
      
      if (res.statusCode === 200) {
        try {
          const response = JSON.parse(data);
          console.log('✅ SUCCESS! Image generated:');
          console.log('🖼️  Image URL:', response.data[0]?.url?.substring(0, 100) + '...');
        } catch (e) {
          console.log('❌ Error parsing response:', e.message);
          console.log('📄 Raw response:', data.substring(0, 500));
        }
      } else {
        console.log('❌ FAILED! Response:', data);
      }
    });
  });

  req.on('error', (e) => {
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;
    console.log(`❌ Request error after ${duration}s:`, e.message);
  });

  req.on('timeout', () => {
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;
    console.log(`⏰ Request timeout after ${duration}s`);
    req.destroy();
  });

  // Set a 45 second timeout
  req.setTimeout(45000);
  
  req.write(postData);
  req.end();
}

// Run the test
testOpenAIDirectly();