import React, { useLayoutEffect, useRef } from 'react';
import { Img, staticFile, useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion';
import { gsap } from 'gsap';
import { PROJECT_ID, LOGO_FILENAME } from '../constants';

export const Logo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const containerRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(glowRef.current, {
        opacity: 0.6,
        scale: 1.2,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: 'power1.inOut',
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  const entrance = spring({
    frame,
    fps,
    config: {
      damping: 12,
      stiffness: 100,
    },
  });

  const scale = interpolate(entrance, [0, 1], [0.8, 1]);
  const opacity = interpolate(frame, [0, 20], [0, 1]);
  const blur = interpolate(frame, [0, 30], [20, 0]);

  return (
    <div
      ref={containerRef}
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
        transform: `scale(${scale})`,
        opacity,
        filter: `blur(${blur}px)`,
        position: 'relative',
      }}
    >
      <div
        ref={glowRef}
        style={{
          position: 'absolute',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.15) 0%, transparent 70%)',
          borderRadius: '50%',
          opacity: 0,
          zIndex: -1,
        }}
      />
      <div style={{
        padding: '40px',
        borderRadius: '30px',
        background: 'rgba(255, 255, 255, 0.03)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Shine effect overlay */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: '-100%',
          width: '50%',
          height: '100%',
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)',
          transform: 'skewX(-25deg)',
          animation: 'shine 4s infinite linear',
        }} />
        <style>{`
          @keyframes shine {
            0% { left: -100%; }
            30% { left: 200%; }
            100% { left: 200%; }
          }
        `}</style>
        <Img
          src={staticFile(`assets/${PROJECT_ID}/images/${LOGO_FILENAME}`)}
          style={{
            width: 500,
            height: 'auto',
            filter: 'drop-shadow(0 0 20px rgba(255,255,255,0.2))',
          }}
        />
      </div>
    </div>
  );
};
