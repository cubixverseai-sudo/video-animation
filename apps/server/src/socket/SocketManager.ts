import { Server, Socket } from 'socket.io';

export class SocketManager {
    private io: Server;

    constructor(io: Server) {
        this.io = io;
        this.setupConnection();
    }

    public projectStartCallback?: (data: any) => void;
    public projectJoinCallback?: (projectId: string) => void;
    public renderStartCallback?: (data: any) => void;

    private setupConnection() {
        this.io.on('connection', (socket: Socket) => {
            console.log('Client connected:', socket.id);

            socket.on('disconnect', () => {
                console.log('Client disconnected:', socket.id);
            });

            // Handle client events here if needed
            socket.on('project:start', (data) => {
                console.log('Project start requested:', data);
                if (this.projectStartCallback) {
                    this.projectStartCallback(data);
                }
            });

            socket.on('project:join', (data) => {
                console.log('Project join requested:', data);
                if (this.projectJoinCallback && data.projectId) {
                    this.projectJoinCallback(data.projectId);
                }
            });

            socket.on('agent:prompt', (data) => {
                console.log('Agent prompt received:', data);
                if (this.projectStartCallback) {
                    this.projectStartCallback(data);
                }
            });

            socket.on('render:start', (data) => {
                console.log('Render start requested:', data);
                if (this.renderStartCallback) {
                    this.renderStartCallback(data);
                }
            });
        });
    }

    public onProjectStart(callback: (data: any) => void) {
        this.projectStartCallback = callback;
    }

    public onProjectJoin(callback: (projectId: string) => void) {
        this.projectJoinCallback = callback;
    }

    public onRenderStart(callback: (data: any) => void) {
        this.renderStartCallback = callback;
    }

    // Generic broadcast method
    public broadcast(event: string, data: any) {
        this.io.emit(event, data);
    }

    public emit(event: string, data: any) {
        this.broadcast(event, data);
    }

    // Specific Agent Events
    public emitAgentThinking(message: string) {
        this.broadcast('agent:log', {
            id: Date.now().toString(),
            type: 'thinking',
            message,
            timestamp: new Date().toLocaleTimeString()
        });
    }

    public emitAgentLog(type: 'info' | 'success' | 'warning' | 'error', message: string) {
        this.broadcast('agent:log', {
            id: Date.now().toString(),
            type,
            message,
            timestamp: new Date().toLocaleTimeString()
        });
    }
}
