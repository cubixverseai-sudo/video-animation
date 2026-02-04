/**
 * 🎥 VIRTUAL CAMERA
 * Cinematic camera movements for professional video feel
 */

import React, { useMemo } from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Easing } from 'remotion';
import { SPRING_PRESETS, SpringPresetName } from '../utils/springs';
import { EASING, EasingName } from '../utils/easings';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export type CameraMoveType = 
  | 'dolly_in'      // Push forward (zoom in feel)
  | 'dolly_out'     // Pull back (reveal)
  | 'pan_left'      // Horizontal pan left
  | 'pan_right'     // Horizontal pan right
  | 'tilt_up'       // Vertical tilt up
  | 'tilt_down'     // Vertical tilt down
  | 'crane_up'      // Rising crane shot
  | 'crane_down'    // Descending crane shot
  | 'truck_left'    // Lateral move left
  | 'truck_right'   // Lateral move right
  | 'zoom_in'       // Optical zoom in
  | 'zoom_out'      // Optical zoom out
  | 'shake'         // Camera shake
  | 'drift'         // Subtle floating movement
  | 'orbit'         // Circular orbit around center
  | 'push_in'       // Combined dolly + zoom
  | 'pull_out'      // Combined dolly out + zoom
  | 'dutch_angle'   // Rotation tilt
  | 'settle';       // Slight settle/landing

export interface CameraMove {
  type: CameraMoveType;
  startFrame: number;
  endFrame: number;
  intensity?: number; // 0-1, default 0.5
  easing?: EasingName;
  springPreset?: SpringPresetName;
  useSpring?: boolean;
}

export interface VirtualCameraProps {
  children: React.ReactNode;
  
  /** Array of camera movements */
  moves?: CameraMove[];
  
  /** Global base scale (1 = 100%) */
  baseScale?: number;
  
  /** Enable subtle ambient drift */
  ambientDrift?: boolean;
  /** Drift intensity */
  driftIntensity?: number;
  /** Drift speed */
  driftSpeed?: number;
  
  /** Transform origin */
  origin?: string;
  
  /** Debug mode (shows camera info) */
  debug?: boolean;
}

// ═══════════════════════════════════════════════════════════════
// CAMERA PRESETS (Common camera move combinations)
// ═══════════════════════════════════════════════════════════════

export const CAMERA_PRESETS = {
  // Slow push in (intimate, focus)
  SLOW_PUSH: (startFrame: number, duration: number = 90): CameraMove => ({
    type: 'dolly_in',
    startFrame,
    endFrame: startFrame + duration,
    intensity: 0.15,
    easing: 'CINEMATIC_IN',
  }),
  
  // Reveal pull out
  REVEAL: (startFrame: number, duration: number = 60): CameraMove => ({
    type: 'dolly_out',
    startFrame,
    endFrame: startFrame + duration,
    intensity: 0.3,
    useSpring: true,
    springPreset: 'SMOOTH',
  }),
  
  // Impact shake
  IMPACT_SHAKE: (startFrame: number, duration: number = 15): CameraMove => ({
    type: 'shake',
    startFrame,
    endFrame: startFrame + duration,
    intensity: 0.8,
  }),
  
  // Subtle shake (handheld feel)
  HANDHELD: (startFrame: number, duration: number = 300): CameraMove => ({
    type: 'shake',
    startFrame,
    endFrame: startFrame + duration,
    intensity: 0.1,
  }),
  
  // Epic crane up
  EPIC_CRANE: (startFrame: number, duration: number = 90): CameraMove => ({
    type: 'crane_up',
    startFrame,
    endFrame: startFrame + duration,
    intensity: 0.4,
    easing: 'DRAMATIC_ARRIVE',
  }),
  
  // Gentle drift
  DRIFT: (startFrame: number, duration: number = 300): CameraMove => ({
    type: 'drift',
    startFrame,
    endFrame: startFrame + duration,
    intensity: 0.3,
  }),
  
  // Dramatic zoom
  DRAMATIC_ZOOM: (startFrame: number, duration: number = 45): CameraMove => ({
    type: 'zoom_in',
    startFrame,
    endFrame: startFrame + duration,
    intensity: 0.5,
    easing: 'EXPO_OUT',
  }),
  
  // Pan right
  PAN_RIGHT: (startFrame: number, duration: number = 60): CameraMove => ({
    type: 'pan_right',
    startFrame,
    endFrame: startFrame + duration,
    intensity: 0.3,
    easing: 'CINEMATIC_INOUT',
  }),
  
  // Pan left
  PAN_LEFT: (startFrame: number, duration: number = 60): CameraMove => ({
    type: 'pan_left',
    startFrame,
    endFrame: startFrame + duration,
    intensity: 0.3,
    easing: 'CINEMATIC_INOUT',
  }),
  
  // Tilt up
  TILT_UP: (startFrame: number, duration: number = 60): CameraMove => ({
    type: 'tilt_up',
    startFrame,
    endFrame: startFrame + duration,
    intensity: 0.3,
    easing: 'CINEMATIC_IN',
  }),
  
  // Tilt down
  TILT_DOWN: (startFrame: number, duration: number = 60): CameraMove => ({
    type: 'tilt_down',
    startFrame,
    endFrame: startFrame + duration,
    intensity: 0.3,
    easing: 'CINEMATIC_IN',
  }),
  
  // Zoom out
  ZOOM_OUT: (startFrame: number, duration: number = 45): CameraMove => ({
    type: 'zoom_out',
    startFrame,
    endFrame: startFrame + duration,
    intensity: 0.4,
    easing: 'EXPO_OUT',
  }),
  
  // Orbit
  ORBIT: (startFrame: number, duration: number = 120): CameraMove => ({
    type: 'orbit',
    startFrame,
    endFrame: startFrame + duration,
    intensity: 0.5,
    easing: 'SINE_INOUT',
  }),
};

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════

export const VirtualCamera: React.FC<VirtualCameraProps> = ({
  children,
  moves = [],
  baseScale = 1,
  ambientDrift = false,
  driftIntensity = 0.01,
  driftSpeed = 0.02,
  origin = 'center center',
  debug = false,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  // Calculate cumulative transform from all moves
  const transform = useMemo(() => {
    let scale = baseScale;
    let translateX = 0;
    let translateY = 0;
    let rotation = 0;
    let shake = { x: 0, y: 0, rotation: 0 };
    
    // Process each camera move
    for (const move of moves) {
      if (frame < move.startFrame || frame > move.endFrame) continue;
      
      const duration = move.endFrame - move.startFrame;
      const localFrame = frame - move.startFrame;
      const intensity = move.intensity ?? 0.5;
      
      // Calculate progress
      let progress: number;
      if (move.useSpring && move.springPreset) {
        progress = spring({
          frame: localFrame,
          fps,
          config: SPRING_PRESETS[move.springPreset],
        });
      } else {
        const easingFn = move.easing ? EASING[move.easing] : EASING.CINEMATIC_IN;
        progress = easingFn(Math.min(localFrame / duration, 1));
      }
      
      // Apply camera move based on type
      switch (move.type) {
        case 'dolly_in':
        case 'push_in':
          scale += progress * intensity * 0.3;
          break;
        
        case 'dolly_out':
        case 'pull_out':
          scale -= progress * intensity * 0.2;
          break;
        
        case 'zoom_in':
          scale += progress * intensity * 0.5;
          break;
        
        case 'zoom_out':
          scale -= progress * intensity * 0.3;
          break;
        
        case 'pan_left':
          translateX += progress * intensity * 200;
          break;
        
        case 'pan_right':
          translateX -= progress * intensity * 200;
          break;
        
        case 'tilt_up':
        case 'crane_up':
          translateY += progress * intensity * 150;
          break;
        
        case 'tilt_down':
        case 'crane_down':
          translateY -= progress * intensity * 150;
          break;
        
        case 'truck_left':
          translateX += progress * intensity * 150;
          break;
        
        case 'truck_right':
          translateX -= progress * intensity * 150;
          break;
        
        case 'dutch_angle':
          rotation += progress * intensity * 15;
          break;
        
        case 'shake':
          // Decay over time
          const decayProgress = 1 - (localFrame / duration);
          const shakeAmount = intensity * 20 * decayProgress;
          shake.x = (Math.sin(localFrame * 1.5) + Math.sin(localFrame * 2.3)) * shakeAmount;
          shake.y = (Math.cos(localFrame * 1.8) + Math.cos(localFrame * 2.1)) * shakeAmount;
          shake.rotation = Math.sin(localFrame * 2) * intensity * 2 * decayProgress;
          break;
        
        case 'drift':
          translateX += Math.sin(localFrame * 0.05) * intensity * 30;
          translateY += Math.cos(localFrame * 0.03) * intensity * 20;
          break;
        
        case 'orbit':
          const orbitAngle = progress * Math.PI * 2 * intensity;
          translateX += Math.cos(orbitAngle) * 50;
          translateY += Math.sin(orbitAngle) * 30;
          break;
        
        case 'settle':
          // Small bounce settle
          const settleDecay = Math.exp(-localFrame * 0.1);
          translateY += Math.sin(localFrame * 0.5) * intensity * 10 * settleDecay;
          break;
      }
    }
    
    // Add ambient drift
    if (ambientDrift) {
      translateX += Math.sin(frame * driftSpeed) * driftIntensity * 50;
      translateY += Math.cos(frame * driftSpeed * 0.7) * driftIntensity * 30;
    }
    
    return {
      scale,
      translateX: translateX + shake.x,
      translateY: translateY + shake.y,
      rotation: rotation + shake.rotation,
    };
  }, [frame, fps, moves, baseScale, ambientDrift, driftIntensity, driftSpeed]);
  
  return (
    <AbsoluteFill
      style={{
        transform: `
          scale(${transform.scale})
          translate(${transform.translateX}px, ${transform.translateY}px)
          rotate(${transform.rotation}deg)
        `,
        transformOrigin: origin,
      }}
    >
      {children}
      
      {debug && (
        <div
          style={{
            position: 'absolute',
            top: 20,
            left: 20,
            background: 'rgba(0,0,0,0.8)',
            color: '#00ff00',
            padding: 10,
            fontFamily: 'monospace',
            fontSize: 12,
            zIndex: 9999,
          }}
        >
          <div>Frame: {frame}</div>
          <div>Scale: {transform.scale.toFixed(3)}</div>
          <div>X: {transform.translateX.toFixed(1)}px</div>
          <div>Y: {transform.translateY.toFixed(1)}px</div>
          <div>Rotation: {transform.rotation.toFixed(2)}°</div>
        </div>
      )}
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════
// CAMERA SHAKE (Standalone for easy use)
// ═══════════════════════════════════════════════════════════════

export interface CameraShakeProps {
  children: React.ReactNode;
  intensity?: number;
  speed?: number;
  decay?: boolean;
  decayRate?: number;
  startFrame?: number;
}

export const CameraShake: React.FC<CameraShakeProps> = ({
  children,
  intensity = 1,
  speed = 1,
  decay = true,
  decayRate = 0.1,
  startFrame = 0,
}) => {
  const frame = useCurrentFrame();
  const localFrame = Math.max(0, frame - startFrame);
  
  const decayMultiplier = decay ? Math.exp(-localFrame * decayRate) : 1;
  const shakeAmount = intensity * 15 * decayMultiplier;
  
  const offsetX = (Math.sin(localFrame * 1.5 * speed) + Math.sin(localFrame * 2.3 * speed)) * shakeAmount;
  const offsetY = (Math.cos(localFrame * 1.8 * speed) + Math.cos(localFrame * 2.1 * speed)) * shakeAmount;
  const rotation = Math.sin(localFrame * 2 * speed) * intensity * 1.5 * decayMultiplier;
  
  return (
    <AbsoluteFill
      style={{
        transform: `translate(${offsetX}px, ${offsetY}px) rotate(${rotation}deg)`,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

export default VirtualCamera;
