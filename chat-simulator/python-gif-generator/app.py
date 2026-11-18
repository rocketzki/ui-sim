#!/usr/bin/env python3
"""
Python GIF Generator Service
Converts PNG frames to animated GIF using Pillow
"""

import os
import sys
import json
import base64
import tempfile
from pathlib import Path
from typing import List, Dict, Any
from flask import Flask, request, jsonify, send_file
from PIL import Image
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Manual CORS headers
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

class GIFGenerator:
    def __init__(self):
        self.temp_dir = Path(tempfile.gettempdir()) / "gif_generator"
        self.temp_dir.mkdir(exist_ok=True)
        logger.info(f"GIF Generator initialized. Temp dir: {self.temp_dir}")
    
    def create_gif_from_frames(self, frames_data: List[str], output_path: str, 
                              width: int = 400, height: int = 600, 
                              duration: int = 1000, loop: int = 0) -> str:
        """
        Create animated GIF from base64 encoded PNG frames
        
        Args:
            frames_data: List of base64 encoded PNG strings
            output_path: Path where GIF should be saved
            width: GIF width
            height: GIF height  
            duration: Frame duration in milliseconds
            loop: Number of loops (0 = infinite)
        
        Returns:
            Path to created GIF file
        """
        try:
            logger.info(f"Creating GIF with {len(frames_data)} frames")
            logger.info(f"Dimensions: {width}x{height}, Duration: {duration}ms")
            
            # Convert base64 frames to PIL Images
            images = []
            for i, frame_b64 in enumerate(frames_data):
                try:
                    # Decode base64 to bytes
                    frame_bytes = base64.b64decode(frame_b64)
                    
                    # Create PIL Image from bytes
                    img = Image.open(io.BytesIO(frame_bytes))
                    
                    # Resize if needed
                    if img.size != (width, height):
                        img = img.resize((width, height), Image.Resampling.LANCZOS)
                    
                    # Convert to RGB if needed (GIF doesn't support RGBA)
                    if img.mode in ('RGBA', 'LA'):
                        # Create white background
                        background = Image.new('RGB', img.size, (255, 255, 255))
                        if img.mode == 'RGBA':
                            background.paste(img, mask=img.split()[-1])  # Use alpha channel as mask
                        else:
                            background.paste(img, mask=img.split()[-1])
                        img = background
                    elif img.mode != 'RGB':
                        img = img.convert('RGB')
                    
                    images.append(img)
                    logger.info(f"Processed frame {i+1}/{len(frames_data)}")
                    
                except Exception as e:
                    logger.error(f"Error processing frame {i+1}: {e}")
                    continue
            
            if not images:
                raise ValueError("No valid frames processed")
            
            logger.info(f"Successfully processed {len(images)} frames")
            
            # Create GIF
            images[0].save(
                output_path,
                save_all=True,
                append_images=images[1:],
                duration=duration,
                loop=loop,
                optimize=True,
                quality=85
            )
            
            # Verify file was created
            if os.path.exists(output_path):
                file_size = os.path.getsize(output_path)
                logger.info(f"GIF created successfully: {output_path} ({file_size} bytes)")
                return output_path
            else:
                raise ValueError("GIF file was not created")
                
        except Exception as e:
            logger.error(f"Error creating GIF: {e}")
            raise

# Initialize GIF generator
gif_generator = GIFGenerator()

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'python-gif-generator',
        'version': '1.0.0'
    })

@app.route('/generate-gif', methods=['POST'])
def generate_gif():
    """Generate GIF from PNG frames"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No JSON data provided'}), 400
        
        # Extract parameters
        frames_data = data.get('frames', [])
        width = data.get('width', 400)
        height = data.get('height', 600)
        duration = data.get('duration', 1000)
        loop = data.get('loop', 0)
        task_id = data.get('task_id', 'unknown')
        
        logger.info(f"Received GIF generation request for task: {task_id}")
        logger.info(f"Parameters: {width}x{height}, {duration}ms, {len(frames_data)} frames")
        
        if not frames_data:
            return jsonify({'error': 'No frames provided'}), 400
        
        # Create output filename
        output_filename = f"gif_{task_id}.gif"
        output_path = gif_generator.temp_dir / output_filename
        
        # Generate GIF
        result_path = gif_generator.create_gif_from_frames(
            frames_data=frames_data,
            output_path=str(output_path),
            width=width,
            height=height,
            duration=duration,
            loop=loop
        )
        
        return jsonify({
            'success': True,
            'gif_path': result_path,
            'filename': output_filename,
            'task_id': task_id
        })
        
    except Exception as e:
        logger.error(f"Error in generate_gif endpoint: {e}")
        return jsonify({
            'error': str(e),
            'success': False
        }), 500

@app.route('/download/<filename>', methods=['GET'])
def download_gif(filename):
    """Download generated GIF file"""
    try:
        file_path = gif_generator.temp_dir / filename
        
        if not file_path.exists():
            return jsonify({'error': 'File not found'}), 404
        
        return send_file(
            str(file_path),
            as_attachment=True,
            download_name=filename,
            mimetype='image/gif'
        )
        
    except Exception as e:
        logger.error(f"Error downloading file {filename}: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/cleanup', methods=['POST'])
def cleanup():
    """Clean up temporary files"""
    try:
        data = request.get_json()
        filename = data.get('filename')
        
        if filename:
            file_path = gif_generator.temp_dir / filename
            if file_path.exists():
                file_path.unlink()
                logger.info(f"Cleaned up file: {filename}")
        
        return jsonify({'success': True})
        
    except Exception as e:
        logger.error(f"Error in cleanup: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    import io  # Import here to avoid issues
    port = int(os.environ.get('PORT', 5000))
    logger.info(f"Starting Python GIF Generator on port {port}")
    app.run(host='0.0.0.0', port=port, debug=False)
