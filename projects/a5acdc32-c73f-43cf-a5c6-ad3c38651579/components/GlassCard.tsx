import React from 'react';

interface GlassCardProps {
 children: React.ReactNode;
 style?: React.CSSProperties;
 className?: string;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, style, className }) => {
 return (
 <div
 className={className}
 style={{ background: 'rgba(255, 255, 255, 0.05)',
 backdropFilter: 'blur(10px)',
 border: '1px solid rgba(255, 255, 255, 0.1)',
 borderRadius: 20,
 boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
 overflow: 'hidden',
 ...style,
 }}
 >
 {children}
 </div>
 );
};
