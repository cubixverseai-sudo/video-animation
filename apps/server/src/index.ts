import { Server as HttpServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import app from './app';
import { SocketManager } from './socket/SocketManager';
import dotenv from 'dotenv';
import { AgentCore } from './agent/AgentCore';

dotenv.config();

const PORT = process.env.PORT || 4000;

const httpServer = new HttpServer(app);
const io = new SocketIOServer(httpServer, {
    cors: {
        origin: "*", // Allow all origins for dev
        methods: ["GET", "POST"]
    }
});

// Initialize Managers
const socketManager = new SocketManager(io);
const agentCore = new AgentCore(socketManager);

// Wire up events
socketManager.onProjectStart(async (data) => {
    if (data.prompt) {
        // If we are already in a project context, just process prompt
        // Ideally frontend should force a join first
        await agentCore.processPrompt(data.prompt);
    }
});

socketManager.onProjectJoin(async (projectId) => {
    await agentCore.switchProject(projectId);
});

httpServer.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
