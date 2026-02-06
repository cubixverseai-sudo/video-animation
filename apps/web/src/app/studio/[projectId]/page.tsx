"use client";

import { useParams, useSearchParams } from 'next/navigation';
import { ConsoleContainer } from '@/components/studio/agent-console/ConsoleContainer';
import { PreviewContainer } from '@/components/studio/live-preview/PreviewContainer';
import { RefinementBar } from '@/components/studio/refinement-bar/RefinementBar';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useSocket } from '@/providers/SocketProvider';
import { StudioNavbar } from '@/components/studio/StudioNavbar';
import { useProjectStore } from '@/stores/projectStore';
import { useAgentStore } from '@/stores/agentStore';

export default function StudioPage() {
    const params = useParams();
    const projectId = params.projectId as string;
    const searchParams = useSearchParams();
    const initialPrompt = searchParams.get('prompt');
    const duration = searchParams.get('duration') || '10'; // Default 10 seconds
    const { socket, isConnected } = useSocket();
    const { setProject, setPrompt, updateStatus } = useProjectStore();
    const { reset, setThinking } = useAgentStore();

    const hasJoinedRef = useRef(false);
    const hasStartedRef = useRef(false);

    // ── Export State (shared between navbar & preview) ──
    const [isExporting, setIsExporting] = useState(false);
    const [exportProgress, setExportProgress] = useState(0);
    const [isPreviewReady, setIsPreviewReady] = useState(false);

    // 1. Project Join & Resume Logic
    useEffect(() => {
        if (socket && isConnected && projectId && !hasJoinedRef.current) {
            console.log("🔌 Joining project context:", projectId);

            // Tell the server which project we are working on
            socket.emit('project:join', { projectId });
            hasJoinedRef.current = true;

            // Fetch metadata to sync local store
            fetch(`http://localhost:4000/projects/${projectId}`)
                .then(res => res.json())
                .then(data => {
                    if (data && data.name) {
                        setProject(data.id, data.name);
                        if (data.prompt) setPrompt(data.prompt);
                        updateStatus(data.status);
                    }
                })
                .catch(err => console.error("Failed to sync project store:", err));
        }
    }, [socket, isConnected, projectId, setProject, setPrompt, updateStatus]);

    // 2. Initial Generation Logic (if prompt is in URL)
    useEffect(() => {
        if (socket && isConnected && initialPrompt && !hasStartedRef.current) {
            console.log("🚀 Powering up generator with initial prompt...");

            // Reset UI state for new task
            reset();
            setThinking(true);

            socket.emit('agent:prompt', { prompt: initialPrompt, duration: parseInt(duration) });
            hasStartedRef.current = true;
        }
    }, [socket, isConnected, initialPrompt, reset, setThinking]);

    // 3. Listen for preview:ready and render events
    useEffect(() => {
        if (!socket) return;

        const handlePreviewReady = () => setIsPreviewReady(true);

        const handleRenderProgress = (data: { percent: number }) => {
            setExportProgress(data.percent);
        };

        const handleRenderComplete = (data: { downloadUrl: string; filename: string }) => {
            setIsExporting(false);
            setExportProgress(100);
            // Auto-download
            const a = document.createElement('a');
            a.href = `http://localhost:4000${data.downloadUrl}`;
            a.download = data.filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        };

        const handleRenderError = (data: { error: string }) => {
            setIsExporting(false);
            setExportProgress(0);
            console.error('Render error:', data.error);
        };

        socket.on('preview:ready', handlePreviewReady);
        socket.on('render:progress', handleRenderProgress);
        socket.on('render:complete', handleRenderComplete);
        socket.on('render:error', handleRenderError);

        return () => {
            socket.off('preview:ready', handlePreviewReady);
            socket.off('render:progress', handleRenderProgress);
            socket.off('render:complete', handleRenderComplete);
            socket.off('render:error', handleRenderError);
        };
    }, [socket]);

    // Reset preview ready when agent starts thinking on a new prompt
    const { isThinking: agentThinking } = useAgentStore();
    useEffect(() => {
        if (agentThinking) setIsPreviewReady(false);
    }, [agentThinking]);

    const handleExport = useCallback((format: string, quality: string) => {
        if (!socket || !projectId) return;
        setIsExporting(true);
        setExportProgress(0);
        socket.emit('render:start', { projectId, format, quality });
    }, [socket, projectId]);

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-[var(--bg-primary)] text-[var(--text-primary)] font-sans">
            <StudioNavbar
                onExport={handleExport}
                isExporting={isExporting}
                exportProgress={exportProgress}
                isPreviewReady={isPreviewReady}
            />

            <div className="flex-1 flex overflow-hidden">
                {/* Left: Agent Console */}
                <ConsoleContainer />

                {/* Center: Main Area */}
                <div className="flex-1 flex flex-col min-w-0 bg-studio-grid relative">
                    <PreviewContainer />
                    <RefinementBar />
                </div>
            </div>
        </div>
    );
}
