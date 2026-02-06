import React from 'react';
import { useCurrentFrame, interpolate } from 'remotion';

export const Cursor: React.FC<{ color?: string }> = ({ color = '#fff' }) => {
 const frame = useCurrentFrame();
 const opacity = interpolate(frame % 30, [0, 15, 16, 30], [1, 1, 0, 0]);

 return (
 <div
 style={{ display: 'inline-block',
 width: 4,
 height: '1em',
 backgroundColor: color,
 opacity,
 marginLeft: 4,
 verticalAlign: 'middle',
 }}
 />
 );
};
