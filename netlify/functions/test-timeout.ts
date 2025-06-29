import { Handler } from '@netlify/functions';

export const handler: Handler = async (event) => {
  const startTime = Date.now();
  
  console.log('🧪 Test function started at:', new Date().toISOString());
  
  try {
    // Test 1: Check function can run for different durations
    const testDuration = parseInt(event.queryStringParameters?.duration || '30') * 1000; // seconds to ms
    
    console.log(`⏰ Testing ${testDuration/1000}s duration...`);
    
    // Simulate work with a promise that resolves after the test duration
    await new Promise(resolve => setTimeout(resolve, testDuration));
    
    const endTime = Date.now();
    const actualDuration = (endTime - startTime) / 1000;
    
    console.log(`✅ Function completed after ${actualDuration}s`);
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        success: true,
        message: `Function ran for ${actualDuration} seconds`,
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
        requestedDuration: testDuration / 1000,
        actualDuration: actualDuration,
        netlifyTimeout: 'Unknown - check logs for timeout behavior'
      })
    };
    
  } catch (error) {
    const endTime = Date.now();
    const actualDuration = (endTime - startTime) / 1000;
    
    console.error(`❌ Function failed after ${actualDuration}s:`, error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        actualDuration: actualDuration,
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString()
      })
    };
  }
};