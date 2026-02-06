import { Server as HttpServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import app from './app';
import { SocketManager } from './socket/SocketManager';
import dotenv from 'dotenv';
import { AgentCore } from './agent/AgentCore';
import { RenderService } from './render/RenderService';

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
const renderService = new RenderService(socketManager);

// Wire up events
socketManager.onProjectStart(async (data) => {
    if (data.prompt) {
        // If we are already in a project context, just process prompt
        // Ideally frontend should force a join first
        const duration = data.duration || 10; // Default 10 seconds
        await agentCore.processPrompt(data.prompt, duration);
    }
});

socketManager.onProjectJoin(async (projectId) => {
    await agentCore.switchProject(projectId);
});

// ═══════════════════════════════════════════════════════════════
// 🎬 RENDER EVENTS
// ═══════════════════════════════════════════════════════════════
socketManager.onRenderStart(async (data) => {
    const { projectId, format = 'mp4', quality = 'high' } = data;
    console.log(`🎬 Render requested: ${projectId} (${format}, ${quality})`);

    const result = await renderService.render({ projectId, format, quality });

    if (result.success) {
        socketManager.emit('render:complete', {
            downloadUrl: result.downloadUrl,
            filename: result.filename,
            durationMs: result.durationMs,
        });
        console.log(`✅ Render complete: ${result.filename} (${Math.round((result.durationMs || 0) / 1000)}s)`);
    } else {
        socketManager.emit('render:error', { error: result.error });
        console.error(`❌ Render failed: ${result.error}`);
    }
});

httpServer.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
