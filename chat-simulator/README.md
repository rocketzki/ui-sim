# Chat Simulator

A modern chat simulation application that creates animated GIFs of chat conversations across different messaging platforms.

## 🚀 Features

- **Multi-Platform Support**: WhatsApp, Messenger, Telegram, Discord, Slack, iMessage, Signal, Teams
- **Custom Scenarios**: Create your own chat scenarios with the built-in editor
- **Server-Side GIF Generation**: Queue-based GIF generation with real-time progress updates
- **Real-time Notifications**: Get notified when GIFs are ready for download
- **Responsive Design**: Works on desktop and mobile devices

## 🏗️ Architecture

The application is split into two main parts:

### Frontend (React + Vite)
- **Chat Simulation**: Real-time chat animation with typing indicators
- **Scenario Editor**: Create and edit custom chat scenarios
- **Theme System**: Multiple messaging platform themes
- **Notification System**: Real-time updates for GIF generation

### Backend (Express + Node.js)
- **Queue System**: Bull queue with Redis for reliable task processing
- **GIF Generation**: Puppeteer-based server-side rendering
- **WebSocket Support**: Real-time progress updates
- **RESTful API**: Clean API endpoints for task management

## 🛠️ Installation

### Prerequisites
- Node.js 18+
- Redis (optional, falls back to in-memory queue)

### Quick Start

1. **Clone the repository**
```bash
git clone <repository-url>
cd chat-simulator
```

2. **Install all dependencies**
```bash
npm run install:all
```

3. **Start both frontend and backend**
```bash
npm run dev:all
```

This will start:
- Frontend: http://localhost:5173
- Backend: http://localhost:3001

### Manual Setup

#### Frontend Only
```bash
npm install
npm run dev
```

#### Backend Only
```bash
cd server
npm install
npm run dev
```

## 📖 Usage

### Creating a Chat Simulation

1. **Select a Scenario Type**: Choose from predefined scenarios or create custom ones
2. **Choose Platform**: Select the messaging platform theme
3. **Watch the Simulation**: The chat will animate automatically
4. **Generate GIF**: Click the "🎬 GIF" button to create an animated GIF
5. **Download**: Get notified when your GIF is ready and download it

### Custom Scenarios

1. Click "**+ Create Custom**" to open the scenario editor
2. **Configure Participants**: Add names, avatars, and roles
3. **Add Messages**: Create the conversation with timing and delays
4. **Set Theme**: Choose the messaging platform appearance
5. **Save**: Your custom scenario will be available for use

## 🔧 Configuration

### Environment Variables

#### Frontend (.env)
```bash
VITE_API_URL=http://localhost:3001
```

#### Backend (server/.env)
```bash
PORT=3001
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

## 🎨 Themes

The application supports multiple messaging platform themes:

- **WhatsApp**: Green bubbles, familiar layout
- **Messenger**: Blue theme with Facebook styling
- **Discord**: Dark theme with Discord colors
- **Slack**: Professional workplace styling
- **iMessage**: iOS messaging appearance
- **Signal**: Privacy-focused design
- **Teams**: Microsoft Teams styling
- **Telegram**: Telegram's distinctive look

## 🔄 GIF Generation Process

1. **Task Submission**: Frontend sends scenario data to backend
2. **Queue Processing**: Task is added to Bull queue
3. **Server Rendering**: Puppeteer renders chat simulation
4. **Frame Capture**: Multiple screenshots are taken
5. **GIF Creation**: Frames are combined into animated GIF
6. **Download Ready**: User is notified and can download

## 📡 API Endpoints

### GIF Generation
- `POST /api/gif/generate` - Submit new GIF task
- `GET /api/gif/status/:taskId` - Get task status
- `GET /api/gif/download/:taskId` - Download completed GIF
- `GET /api/gif/tasks` - List all tasks

### WebSocket
- `WS /ws/gif-status/:taskId` - Real-time status updates

### Health Check
- `GET /health` - Server health status

## 🚀 Deployment

### Docker (Recommended)

#### Frontend
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 5173
CMD ["npm", "preview"]
```

#### Backend
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3001
CMD ["npm", "start"]
```

### Manual Deployment

1. **Build both applications**
```bash
npm run build:all
```

2. **Start the backend**
```bash
npm run start:server
```

3. **Serve the frontend**
```bash
npm run preview
```

## 🧪 Development

### Project Structure
```
chat-simulator/
├── src/                    # Frontend React app
│   ├── components/         # React components
│   ├── hooks/             # Custom React hooks
│   ├── types/             # TypeScript type definitions
│   └── utils/             # Utility functions
├── server/                # Backend Express server
│   ├── src/
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic
│   │   └── types/         # TypeScript types
│   └── package.json
└── package.json           # Root package.json
```

### Adding New Features

#### Frontend
1. Create components in `src/components/`
2. Add hooks in `src/hooks/`
3. Update types in `src/types/`
4. Test with `npm run dev`

#### Backend
1. Add routes in `server/src/routes/`
2. Implement services in `server/src/services/`
3. Update types in `server/src/types/`
4. Test with `npm run dev:server`

## 🐛 Troubleshooting

### Common Issues

#### GIF Generation Fails
- Check if Redis is running (optional)
- Verify Puppeteer dependencies
- Check server logs for errors

#### Frontend Can't Connect to Backend
- Verify `VITE_API_URL` environment variable
- Check if backend is running on correct port
- Ensure CORS is properly configured

#### Performance Issues
- Reduce GIF quality/width/height
- Limit number of messages in scenarios
- Check server memory usage

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For issues and questions:
- Create an issue on GitHub
- Check the troubleshooting section
- Review the API documentation