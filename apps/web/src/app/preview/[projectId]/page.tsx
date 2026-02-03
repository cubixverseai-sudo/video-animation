'use client';

import { useEffect, useRef, useState } from 'react';
import { Player, PlayerRef } from '@remotion/player';
import { CurrentComposition, currentProps } from '@director/remotion';
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

    // Pause playback whenever the agent starts thinking/building.
    useEffect(() => {
        if (isThinking) {
            playerRef.current?.pause();
        }
    }, [isThinking]);

    // Listen to server-side events to know when a new composition is ready.
    useEffect(() => {
        if (!socket) return;

        const handleProjectUpdate = (payload: any) => {
            if (payload?.type === 'composition_registered') {
                // A brand-new composition for this project was wired up.
                // Bump the key so the Player remounts with the new component.
                setCompositionVersion(prev => prev + 1);
            }
        };

        const handleAgentComplete = (payload: any) => {
            // When the agent finishes successfully, force a remount as well
            // so that the latest composition + audio are visible immediately.
            if (payload?.success) {
                setCompositionVersion(prev => prev + 1);
            }
        };

        socket.on('project:update', handleProjectUpdate);
        socket.on('agent:complete', handleAgentComplete);

        return () => {
            socket.off('project:update', handleProjectUpdate);
            socket.off('agent:complete', handleAgentComplete);
        };
    }, [socket]);

    return (
        <div style={{ width: '100vw', height: '100vh', backgroundColor: 'black' }}>
            <Player
                key={compositionVersion}
                ref={playerRef}
                component={CurrentComposition}
                durationInFrames={300}
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
                acknowledgeRemotionLicense
            />
        </div>
    );
}
