#!/usr/bin/env python3
"""
Test script for Python GIF Generator
"""

import requests
import base64
import json
from PIL import Image
import io

def create_test_frames():
    """Create test PNG frames"""
    frames = []
    
    # Create 3 simple test frames with different colors
    colors = [(255, 0, 0), (0, 255, 0), (0, 0, 255)]  # Red, Green, Blue
    
    for i, color in enumerate(colors):
        # Create a simple colored image
        img = Image.new('RGB', (200, 200), color)
        
        # Add some text
        from PIL import ImageDraw, ImageFont
        draw = ImageDraw.Draw(img)
        
        # Try to use default font, fallback to basic if not available
        try:
            font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 24)
        except:
            font = ImageFont.load_default()
        
        draw.text((50, 90), f"Frame {i+1}", fill=(255, 255, 255), font=font)
        
        # Convert to base64
        buffer = io.BytesIO()
        img.save(buffer, format='PNG')
        frame_b64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
        frames.append(frame_b64)
    
    return frames

def test_gif_generation():
    """Test the GIF generation service"""
    base_url = "http://localhost:5000"
    
    print("🧪 Testing Python GIF Generator Service")
    
    # Test health check
    print("1. Testing health check...")
    try:
        response = requests.get(f"{base_url}/health")
        if response.status_code == 200:
            print("✅ Health check passed")
            print(f"   Response: {response.json()}")
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Health check error: {e}")
        return False
    
    # Test GIF generation
    print("2. Testing GIF generation...")
    try:
        frames = create_test_frames()
        
        payload = {
            "frames": frames,
            "width": 200,
            "height": 200,
            "duration": 1000,
            "loop": 0,
            "task_id": "test_123"
        }
        
        response = requests.post(f"{base_url}/generate-gif", json=payload)
        
        if response.status_code == 200:
            result = response.json()
            print("✅ GIF generation successful")
            print(f"   Result: {result}")
            
            # Test download
            print("3. Testing GIF download...")
            filename = result['filename']
            download_response = requests.get(f"{base_url}/download/{filename}")
            
            if download_response.status_code == 200:
                print(f"✅ GIF download successful ({len(download_response.content)} bytes)")
                
                # Save test GIF
                with open(f"test_output_{filename}", "wb") as f:
                    f.write(download_response.content)
                print(f"   Saved as: test_output_{filename}")
                
                return True
            else:
                print(f"❌ Download failed: {download_response.status_code}")
                return False
        else:
            print(f"❌ GIF generation failed: {response.status_code}")
            print(f"   Error: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ GIF generation error: {e}")
        return False

if __name__ == "__main__":
    success = test_gif_generation()
    if success:
        print("\n🎉 All tests passed! Python GIF Generator is working correctly.")
    else:
        print("\n💥 Tests failed! Check the service logs.")
