// Test script to call the GIF generation endpoint
import fetch from 'node-fetch';

const testData = {
  scenario: {
    id: "test-scenario",
    title: "Test Chat",
    theme: "discord",
    participants: [
      { id: "user1", name: "User1", avatar: "👤", type: "sender" },
      { id: "user2", name: "User2", avatar: "👤", type: "receiver" }
    ],
    messages: [
      {
        id: 1,
        sender: "user1",
        content: "Hello!",
        timestamp: "10:00",
        typing_duration: 1000,
        delay: 1000
      },
      {
        id: 2,
        sender: "user2", 
        content: "Hi there!",
        timestamp: "10:01",
        typing_duration: 1000,
        delay: 1000
      }
    ],
    settings: {
      auto_play: true,
      loop: false,
      typing_speed: "normal"
    }
  },
  options: {
    width: 400,
    height: 600,
    quality: 10,
    delay: 1000,
    theme: "discord"
  }
};

async function testServer() {
  console.log('🧪 Testing server endpoints...');
  
  try {
    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await fetch('http://localhost:3001/health');
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData);
    
    // Test GIF generation endpoint
    console.log('2. Testing GIF generation endpoint...');
    const gifResponse = await fetch('http://localhost:3001/api/gif/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });
    
    const gifData = await gifResponse.json();
    console.log('✅ GIF generation response:', gifData);
    
    if (gifData.taskId) {
      console.log('3. Testing status endpoint...');
      const statusResponse = await fetch(`http://localhost:3001/api/gif/status/${gifData.taskId}`);
      const statusData = await statusResponse.json();
      console.log('✅ Status response:', statusData);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testServer();
