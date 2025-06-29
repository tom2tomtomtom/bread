import { Handler } from '@netlify/functions';

export const handler: Handler = async (event) => {
  const startTime = Date.now();
  
  console.log('🧪 Minimal OpenAI test started at:', new Date().toISOString());
  
  try {
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY not found');
    }
    
    console.log('🔑 API key found, making request...');
    
    // Make the simplest possible OpenAI request
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: 'minimal test image',
        n: 1,
        size: '1024x1024',
        quality: 'standard'
      })
    });
    
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;
    
    console.log(`⏱️  OpenAI API responded after ${duration}s with status: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ OpenAI API error:', errorText);
      
      return {
        statusCode: response.status,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          success: false,
          error: `OpenAI API error: ${response.status} - ${errorText}`,
          duration: duration,
          netlifyFunctionCompleted: true
        })
      };
    }
    
    const data = await response.json();
    
    console.log('✅ OpenAI API successful!');
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        success: true,
        message: 'OpenAI API call completed successfully',
        duration: duration,
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
        imageGenerated: !!data.data?.[0]?.url,
        netlifyFunctionCompleted: true
      })
    };
    
  } catch (error) {
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;
    
    console.error(`❌ Function failed after ${duration}s:`, error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: duration,
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
        netlifyFunctionCompleted: true
      })
    };
  }
};