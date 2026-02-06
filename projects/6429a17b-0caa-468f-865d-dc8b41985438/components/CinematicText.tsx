import React from 'react';
import { useCurrentFrame, useVideoConfig, spring } from 'remotion';

interface Props {
 text: string;
 delay?: number;
 fontSize?: number;
 color?: string;
 tracking?: number;
}

export const CinematicText: React.FC<Props> = (props) => {
 const { text, delay = 0, fontSize = 100, color = '#ffffff', tracking = 0 } = props;
 const { fps } = useVideoConfig();
 const frame = useCurrentFrame();
 const letters = text.split('');

 return (
 <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
 {letters.map((t, i) => {
 const spr = spring({
 frame: frame - delay - i * 3,
 fps,
 config: { damping: 12, stiffness: 200 }
 });

 return (
 <span
 key={i}
 style={{ color: color,
 fontSize: fontSize,
 fontFamily: 'Inter',
 fontWeight: 900,
 display: 'inline-block',
 transform: 'scale(' + spr + ')',
 opacity: spr,
 marginRight: tracking
 }}
 >
 {t}
 </span>
 );
 })}
 </div>
 );
};
