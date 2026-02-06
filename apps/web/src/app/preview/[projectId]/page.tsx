'use client';

import { useEffect, useRef, useState } from 'react';
import { Player, PlayerRef } from '@remotion/player';
import { CurrentComposition, currentProps, currentDuration } from '@director/remotion';
import { useParams } from 'next/navigation';
import { useSocket } from '@/providers/SocketProvider';
import { useAgentStore } from '@/stores/agentStore';

export default function IsolatedPreview() {
    const params = useParams();
    const projectId = params.projectId as string;

    const { socket } = useSocket();
    const { isThinking } = useAgentStore();

    const playerRef = useRef<PlayerRef>(null);

    // Used to force the <Player> to remount whenever a new composition
    // is registered or a task completes, so that autoplay reliably
    // restarts from the beginning of the fresh render.
    const [compositionVersion, setCompositionVersion] = useState(0);
    const previewReadyFired = useRef(false);

    // Pause playback whenever the agent starts thinking/building.
    useEffect(() => {
        if (isThinking) {
            playerRef.current?.pause();
            previewReadyFired.current = false; // Reset for next cycle
        }
    }, [isThinking]);

    // Listen to server-side events to know when a new composition is ready.
    useEffect(() => {
        if (!socket) return;

        const handlePreviewReady = () => {
            previewReadyFired.current = true;
            setCompositionVersion(prev => prev + 1);
        };

        const handleAgentComplete = (payload: any) => {
            // Only remount if preview:ready didn't already fire (avoid double-remount)
            if (payload?.success && !previewReadyFired.current) {
                setCompositionVersion(prev => prev + 1);
            }
        };

        socket.on('preview:ready', handlePreviewReady);
        socket.on('agent:complete', handleAgentComplete);

        return () => {
            socket.off('preview:ready', handlePreviewReady);
            socket.off('agent:complete', handleAgentComplete);
        };
    }, [socket]);

    return (
        <div style={{ width: '100vw', height: '100vh', backgroundColor: 'black' }}>
            <Player
                key={compositionVersion}
                ref={playerRef}
                component={CurrentComposition}
                durationInFrames={currentDuration}
                compositionWidth={1920}
                compositionHeight={1080}
                fps={30}
                style={{
                    width: '100%',
                    height: '100%',
                }}
                controls
                autoPlay
                loop
                inputProps={currentProps}
                numberOfSharedAudioTags={16}
                acknowledgeRemotionLicense
            />
        </div>
    );
}
