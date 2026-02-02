import React from 'react';
import { AbsoluteFill } from 'remotion';

/**
 * Default placeholder composition.
 * The agent will update this file when a project is loaded/previewed.
 */
export const CurrentComposition: React.FC = () => {
    return (
        <AbsoluteFill
            style={{
                backgroundColor: '#0a0a0a',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                fontFamily: 'system-ui, sans-serif',
            }}
        >
            <div style={{ textAlign: 'center', color: '#888' }}>
                <h1 style={{ fontSize: 48, margin: 0, color: '#fff' }}>Director Agent</h1>
                <p style={{ fontSize: 24, marginTop: 16 }}>No composition loaded</p>
                <p style={{ fontSize: 16, marginTop: 8 }}>Create or select a project to begin</p>
            </div>
        </AbsoluteFill>
    );
};

/**
 * Default props for the composition.
 * The agent will update this when setting up a preview.
 */
export const currentProps: Record<string, unknown> = {};
