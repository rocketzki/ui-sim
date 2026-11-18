# Quick Start Guide

## 🚀 Getting Started

### Option 1: Start Both Servers Together (Recommended)

```bash
# Install all dependencies
npm run install:all

# Start both frontend and backend
npm run dev:all
```

### Option 2: Start Servers Separately

**Terminal 1 - Backend:**
```bash
cd server
npm install
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm install
npm run dev
```

## 🌐 Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/health

## 🎬 How to Generate GIFs

1. **Select a scenario** from the dropdown
2. **Choose a platform** (WhatsApp, Discord, etc.)
3. **Watch the chat simulation** play automatically
4. **Click "🎬 GIF"** button to generate an animated GIF
5. **Wait for notification** - you'll be notified when ready
6. **Download** the GIF when the notification appears

## ⚠️ Troubleshooting

### "Server is not running" Error
- Make sure the backend server is running on port 3001
- Check the server status indicator in the top-left corner
- Run `cd server && npm run dev` to start the backend

### GIF Generation Fails
- Check browser console for errors
- Verify the backend server is running
- Try reducing GIF quality/size in the options

### Port Already in Use
- Change the port in `server/.env` file
- Update `VITE_API_URL` in frontend `.env` file accordingly

## 📁 Project Structure

```
chat-simulator/
├── src/           # Frontend React app
├── server/        # Backend Express server
├── README.md      # Full documentation
└── QUICKSTART.md  # This file
```

## 🔧 Environment Variables

Create these files if needed:

**Frontend (.env):**
```
VITE_API_URL=http://localhost:3001
```

**Backend (server/.env):**
```
PORT=3001
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

## 🆘 Need Help?

- Check the full [README.md](README.md) for detailed documentation
- Look at the server logs for backend issues
- Check browser console for frontend issues
- Ensure all dependencies are installed with `npm run install:all`
