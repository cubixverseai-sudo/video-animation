# 🎭 GSAP + Remotion Cookbook

> **GSAP 3.14.2** is installed and available. Use these patterns to create professional-grade animations in Remotion.

---

## ⚡ Golden Rule: Timeline + Seek Pattern

In Remotion, components re-render every frame. GSAP's normal time-based animation won't work.
Instead, create a **paused timeline** and **seek** to the current frame position:

```tsx
import React, { useRef, useEffect } from 'react';
import { useCurrentFrame, useVideoConfig, AbsoluteFill } from 'remotion';
import gsap from 'gsap';

export const MyScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const containerRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const tl = gsap.timeline({ paused: true });

    tl.from(containerRef.current, { opacity: 0, y: 50, duration: 1 });
    tl.to(containerRef.current, { scale: 1.2, duration: 0.5 }, '+=0.5');

    tlRef.current = tl;
    return () => { tl.kill(); };
  }, []);

  useEffect(() => {
    tlRef.current?.seek(frame / fps);
  }, [frame, fps]);

  return (
    <AbsoluteFill style={{ backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }}>
      <div ref={containerRef} style={{ fontSize: 64, color: '#fff' }}>
        Hello GSAP
      </div>
    </AbsoluteFill>
  );
};
```

**Key rules:**
- Always `{ paused: true }` — never let GSAP auto-play
- `seek(frame / fps)` on every frame render
- Build timeline in `useEffect([], [])` (once)
- `tl.kill()` in cleanup

---

## 1. SplitText — Letter-by-Letter Text Reveal

Split text into individual characters/words/lines and animate each.

```tsx
import React, { useRef, useEffect } from 'react';
import { useCurrentFrame, useVideoConfig, AbsoluteFill } from 'remotion';
import gsap from 'gsap';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(SplitText);

export const TextRevealScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const textRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    if (!textRef.current) return;
    const split = new SplitText(textRef.current, { type: 'chars,words' });
    const tl = gsap.timeline({ paused: true });

    tl.from(split.chars, {
      opacity: 0,
      y: 50,
      rotateX: -90,
      stagger: 0.03,
      duration: 0.8,
      ease: 'back.out(1.7)',
    });

    tlRef.current = tl;
    return () => { split.revert(); tl.kill(); };
  }, []);

  useEffect(() => {
    tlRef.current?.seek(frame / fps);
  }, [frame, fps]);

  return (
    <AbsoluteFill style={{ backgroundColor: '#0a0a0a', justifyContent: 'center', alignItems: 'center' }}>
      <div ref={textRef} style={{ fontSize: 72, fontWeight: 800, color: '#fff', perspective: 400 }}>
        Your Brand Name
      </div>
    </AbsoluteFill>
  );
};
```

**SplitText options:**
| Option | Values | Description |
|--------|--------|-------------|
| `type` | `'chars'`, `'words'`, `'lines'`, `'chars,words,lines'` | What to split |
| `charsClass` | string | CSS class for each char |
| `wordsClass` | string | CSS class for each word |
| `linesClass` | string | CSS class for each line |
| `mask` | `'lines'`, `'words'`, `'chars'` | Clip overflow for reveal effects |
| `tag` | `'div'`, `'span'` | Wrapper element tag |
| `propIndex` | boolean | Adds CSS `--char`, `--word`, `--line` variables |

---

## 2. DrawSVGPlugin — SVG Path Drawing

Animate SVG strokes drawing on/off screen.

```tsx
import React, { useRef, useEffect } from 'react';
import { useCurrentFrame, useVideoConfig, AbsoluteFill } from 'remotion';
import gsap from 'gsap';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';

gsap.registerPlugin(DrawSVGPlugin);

export const SVGDrawScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pathRef = useRef<SVGPathElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    if (!pathRef.current) return;
    const tl = gsap.timeline({ paused: true });

    // Draw from 0% to 100%
    tl.fromTo(pathRef.current,
      { drawSVG: '0%' },
      { drawSVG: '100%', duration: 2, ease: 'power2.inOut' }
    );

    tlRef.current = tl;
    return () => { tl.kill(); };
  }, []);

  useEffect(() => {
    tlRef.current?.seek(frame / fps);
  }, [frame, fps]);

  return (
    <AbsoluteFill style={{ backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }}>
      <svg width="400" height="400" viewBox="0 0 400 400">
        <path
          ref={pathRef}
          d="M50,200 C50,100 150,50 200,50 C250,50 350,100 350,200 C350,300 250,350 200,350 C150,350 50,300 50,200"
          fill="none"
          stroke="#00ff88"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </svg>
    </AbsoluteFill>
  );
};
```

**DrawSVG values:**
- `"0%"` → hidden
- `"100%"` → fully drawn
- `"0% 100%"` → draw from start to end
- `"50% 50%"` → draw from middle outward
- `"0 100"` → pixel-based values

---

## 3. ScrambleTextPlugin — Hacker/Decode Effect

Text scrambles with random characters before revealing the final text.

```tsx
import React, { useRef, useEffect } from 'react';
import { useCurrentFrame, useVideoConfig, AbsoluteFill } from 'remotion';
import gsap from 'gsap';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';

gsap.registerPlugin(ScrambleTextPlugin);

export const ScrambleScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const textRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    if (!textRef.current) return;
    const tl = gsap.timeline({ paused: true });

    tl.to(textRef.current, {
      duration: 2,
      scrambleText: {
        text: 'SYSTEM ONLINE',
        chars: '01',           // scramble with binary
        speed: 0.3,
        revealDelay: 0.5,
      },
      ease: 'none',
    });

    tlRef.current = tl;
    return () => { tl.kill(); };
  }, []);

  useEffect(() => {
    tlRef.current?.seek(frame / fps);
  }, [frame, fps]);

  return (
    <AbsoluteFill style={{ backgroundColor: '#0a0a0a', justifyContent: 'center', alignItems: 'center' }}>
      <div ref={textRef} style={{
        fontSize: 56, fontFamily: 'monospace', fontWeight: 700,
        color: '#00ff41', letterSpacing: 4,
      }}>
        INITIALIZING
      </div>
    </AbsoluteFill>
  );
};
```

**ScrambleText options:**
| Option | Values | Description |
|--------|--------|-------------|
| `text` | string | Final text to reveal |
| `chars` | `'upperCase'`, `'lowerCase'`, `'upperAndLowerCase'`, `'01'`, custom string | Characters to scramble with |
| `speed` | number (0.1-1) | Scramble speed |
| `revealDelay` | number | Seconds before reveal starts |
| `rightToLeft` | boolean | Reveal direction |
| `newClass` | string | CSS class for revealed text |
| `oldClass` | string | CSS class for scrambled text |

---

## 4. TextPlugin — Typewriter Effect

Gradually replace text content character by character.

```tsx
import React, { useRef, useEffect } from 'react';
import { useCurrentFrame, useVideoConfig, AbsoluteFill } from 'remotion';
import gsap from 'gsap';
import { TextPlugin } from 'gsap/TextPlugin';

gsap.registerPlugin(TextPlugin);

export const TypewriterScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const textRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    if (!textRef.current) return;
    const tl = gsap.timeline({ paused: true });

    tl.to(textRef.current, {
      duration: 2,
      text: { value: 'Welcome to the future of design.', delimiter: '' },
      ease: 'none',
    });

    tlRef.current = tl;
    return () => { tl.kill(); };
  }, []);

  useEffect(() => {
    tlRef.current?.seek(frame / fps);
  }, [frame, fps]);

  return (
    <AbsoluteFill style={{ backgroundColor: '#111', justifyContent: 'center', alignItems: 'center' }}>
      <div ref={textRef} style={{
        fontSize: 48, fontFamily: 'monospace', color: '#fff',
        borderRight: '2px solid #fff', paddingRight: 8,
      }} />
    </AbsoluteFill>
  );
};
```

---

## 5. CustomEase — Custom Easing Curves

Create easing from SVG path data for unique motion feel.

```tsx
import gsap from 'gsap';
import { CustomEase } from 'gsap/CustomEase';

gsap.registerPlugin(CustomEase);

// Create custom eases (do this once, at module level)
CustomEase.create('smoothSnap', 'M0,0 C0.14,0 0.27,0.56 0.32,0.72 0.37,0.88 0.39,1 1,1');
CustomEase.create('dramaticIn', 'M0,0 C0.55,0 0.67,0.19 0.74,0.33 0.82,0.5 0.88,0.82 1,1');

// Then use in any tween:
tl.to(element, { x: 300, duration: 1, ease: 'smoothSnap' });
tl.to(element, { opacity: 1, duration: 0.5, ease: 'dramaticIn' });
```

---

## 6. CustomBounce — Realistic Bounce Easing

```tsx
import gsap from 'gsap';
import { CustomEase } from 'gsap/CustomEase';
import { CustomBounce } from 'gsap/CustomBounce';

gsap.registerPlugin(CustomEase, CustomBounce);

CustomBounce.create('myBounce', { strength: 0.6, squash: 3 });

// Use in tweens:
tl.from(element, { y: -300, duration: 1.5, ease: 'myBounce' });
// squash ease is auto-created:
tl.to(element, { scaleX: 1.3, scaleY: 0.7, duration: 1.5, ease: 'myBounce-squash' });
```

| Option | Default | Description |
|--------|---------|-------------|
| `strength` | 0.7 | Bounce height decay (0-0.999) |
| `squash` | 0 | Squash amount on impact (0-100) |
| `endAtStart` | false | End at starting position |

---

## 7. CustomWiggle — Shake/Wiggle Easing

```tsx
import gsap from 'gsap';
import { CustomEase } from 'gsap/CustomEase';
import { CustomWiggle } from 'gsap/CustomWiggle';

gsap.registerPlugin(CustomEase, CustomWiggle);

CustomWiggle.create('jitter', { wiggles: 8, type: 'easeOut' });
CustomWiggle.create('shakeHard', { wiggles: 20, type: 'uniform' });

// Use in tweens:
tl.to(element, { x: 15, duration: 1, ease: 'jitter' });     // gentle jitter
tl.to(element, { rotation: 5, duration: 0.5, ease: 'shakeHard' }); // hard shake
```

| Type | Description |
|------|-------------|
| `'easeOut'` | Strong start, fades out |
| `'easeInOut'` | Gentle start and end, strong middle |
| `'anticipate'` | Slight delay before wiggle begins |
| `'uniform'` | Constant intensity throughout |
| `'random'` | Random amplitude each wiggle |

---

## 8. Physics2DPlugin — Particle Explosions

```tsx
import React, { useRef, useEffect } from 'react';
import { useCurrentFrame, useVideoConfig, AbsoluteFill, random } from 'remotion';
import gsap from 'gsap';
import { Physics2DPlugin } from 'gsap/Physics2DPlugin';

gsap.registerPlugin(Physics2DPlugin);

export const ExplosionScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const particlesRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const PARTICLE_COUNT = 30;

  useEffect(() => {
    if (!particlesRef.current) return;
    const dots = particlesRef.current.querySelectorAll('.particle');
    const tl = gsap.timeline({ paused: true });

    dots.forEach((dot, i) => {
      tl.to(dot, {
        physics2D: {
          velocity: 200 + random('vel-' + i) * 300,
          angle: random('angle-' + i) * 360,
          gravity: 400,
          friction: 0.05,
        },
        opacity: 0,
        duration: 2,
      }, 0);
    });

    tlRef.current = tl;
    return () => { tl.kill(); };
  }, []);

  useEffect(() => {
    tlRef.current?.seek(frame / fps);
  }, [frame, fps]);

  return (
    <AbsoluteFill style={{ backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }}>
      <div ref={particlesRef} style={{ position: 'relative' }}>
        {Array.from({ length: PARTICLE_COUNT }).map((_, i) => (
          <div key={i} className="particle" style={{
            position: 'absolute',
            width: 8 + random('size-' + i) * 12,
            height: 8 + random('size-' + i) * 12,
            borderRadius: '50%',
            backgroundColor: `hsl(${random('hue-' + i) * 60 + 10}, 100%, 60%)`,
            top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
          }} />
        ))}
      </div>
    </AbsoluteFill>
  );
};
```

**Physics2D options:**
| Option | Description |
|--------|-------------|
| `velocity` | Initial speed (pixels/sec) |
| `angle` | Launch angle in degrees (0=right, 90=down) |
| `gravity` | Downward acceleration |
| `friction` | 0-1 (0=none, 1=full stop) |
| `xProp` / `yProp` | Custom properties to animate (default: x, y) |

---

## 9. MotionPathPlugin — Animate Along a Path

```tsx
import React, { useRef, useEffect } from 'react';
import { useCurrentFrame, useVideoConfig, AbsoluteFill } from 'remotion';
import gsap from 'gsap';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';

gsap.registerPlugin(MotionPathPlugin);

export const MotionPathScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const dotRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    if (!dotRef.current) return;
    const tl = gsap.timeline({ paused: true });

    tl.to(dotRef.current, {
      motionPath: {
        path: 'M0,0 C100,-200 300,-200 400,0 S700,200 800,0',
        autoRotate: true,
      },
      duration: 3,
      ease: 'power1.inOut',
    });

    tlRef.current = tl;
    return () => { tl.kill(); };
  }, []);

  useEffect(() => {
    tlRef.current?.seek(frame / fps);
  }, [frame, fps]);

  return (
    <AbsoluteFill style={{ backgroundColor: '#0d1117', justifyContent: 'center', alignItems: 'center' }}>
      <div ref={dotRef} style={{
        width: 30, height: 30, borderRadius: '50%',
        background: 'linear-gradient(135deg, #ff6b6b, #ffd93d)',
        position: 'absolute', top: '50%', left: '10%',
      }} />
    </AbsoluteFill>
  );
};
```

**MotionPath options:**
| Option | Description |
|--------|-------------|
| `path` | SVG path string or element reference |
| `autoRotate` | Auto-rotate along path (true/false/degrees offset) |
| `align` | Element to align path to (`'self'` or element) |
| `start` / `end` | Portion of path to use (0-1) |
| `curviness` | Path smoothness (0=straight, 2=very curvy) |

---

## 10. GSAP Easing Reference

All easing functions available with `ease: 'name'`:

### Standard Easing
| Ease | .in | .out | .inOut | Character |
|------|-----|------|--------|-----------|
| `power1` (Quad) | Gentle acceleration | Gentle deceleration | Gentle both | Subtle |
| `power2` (Cubic) | Medium acceleration | Medium deceleration | Medium both | Balanced |
| `power3` (Quart) | Strong acceleration | Strong deceleration | Strong both | Dramatic |
| `power4` (Quint) | Very strong | Very strong | Very strong | Intense |
| `sine` | Gentle sine | Gentle sine | Gentle sine | Organic |
| `expo` | Exponential | Exponential | Exponential | Sharp |
| `circ` | Circular | Circular | Circular | Smooth |
| `back` | Pulls back | Overshoots | Both | Playful |
| `elastic` | Elastic wind | Elastic settle | Both | Bouncy |
| `bounce` | Bounce in | Bounce out | Both | Fun |

### Usage
```tsx
ease: 'power2.out'      // smooth deceleration (most common)
ease: 'power3.inOut'     // dramatic entrance + exit
ease: 'back.out(1.7)'   // overshoot with custom magnitude
ease: 'elastic.out(1, 0.3)' // elastic with amplitude and period
ease: 'none'             // linear (for constant speed)
ease: 'steps(12)'        // step-based (stop motion feel)
```

### Special Easing (requires EasePack)
```tsx
import { EasePack } from 'gsap/EasePack';
gsap.registerPlugin(EasePack);

ease: 'slow(0.7, 0.7, false)' // SlowMo — fast-slow-fast
ease: 'rough({strength: 1, points: 20, template: "none"})' // RoughEase — jittery
ease: 'expoScale(1, 2)'  // ExpoScaleEase — exponential scaling
```

---

## 11. 🏗️ COMPLEX SCENE — Multi-Plugin Cinematic Intro (FULL EXAMPLE)

This is a **production-ready** scene combining multiple GSAP plugins with multi-layer JSX. Study this pattern carefully — it shows how to safely combine GSAP with complex JSX.

```tsx
import React, { useRef, useEffect } from 'react';
import { useCurrentFrame, useVideoConfig, AbsoluteFill, Img, staticFile, random } from 'remotion';
import gsap from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import { CustomEase } from 'gsap/CustomEase';

gsap.registerPlugin(SplitText, DrawSVGPlugin, CustomEase);
CustomEase.create('cinematic', 'M0,0 C0.25,0.1 0.25,1 1,1');

export const CinematicIntro: React.FC<{ logoPath: string; brandName: string }> = ({ logoPath, brandName }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Refs for GSAP targets
  const logoRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<SVGPathElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const splitRef = useRef<SplitText | null>(null);

  // Build timeline ONCE
  useEffect(() => {
    const tl = gsap.timeline({ paused: true });

    // Phase 1: SVG line draws in (0s - 2s)
    if (lineRef.current) {
      tl.fromTo(lineRef.current,
        { drawSVG: '0%' },
        { drawSVG: '100%', duration: 2, ease: 'power2.inOut' },
        0
      );
    }

    // Phase 2: Logo scales in with custom ease (0.5s - 2s)
    if (logoRef.current) {
      tl.fromTo(logoRef.current,
        { scale: 0, opacity: 0, rotation: -15 },
        { scale: 1, opacity: 1, rotation: 0, duration: 1.5, ease: 'cinematic' },
        0.5
      );
    }

    // Phase 3: Background glow pulses (1s - 3s)
    if (glowRef.current) {
      tl.fromTo(glowRef.current,
        { opacity: 0, scale: 0.8 },
        { opacity: 0.6, scale: 1.2, duration: 2, ease: 'sine.inOut' },
        1
      );
    }

    // Phase 4: Text splits and reveals (1.5s - 3s)
    if (textRef.current) {
      const split = new SplitText(textRef.current, { type: 'chars' });
      splitRef.current = split;
      tl.from(split.chars, {
        opacity: 0,
        y: 80,
        rotateX: -90,
        stagger: 0.04,
        duration: 0.8,
        ease: 'back.out(1.7)',
      }, 1.5);
    }

    tlRef.current = tl;
    return () => {
      if (splitRef.current) splitRef.current.revert();
      tl.kill();
    };
  }, []);

  // Seek on every frame
  useEffect(() => {
    tlRef.current?.seek(frame / fps);
  }, [frame, fps]);

  // ─── JSX STRUCTURE ─────────────────────────────────────────
  // Rule: Keep JSX clean and properly nested. One AbsoluteFill per layer.
  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>

      {/* LAYER 1: Background glow */}
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div ref={glowRef} style={{
          width: '80%',
          height: '80%',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,200,100,0.3) 0%, transparent 70%)',
          opacity: 0,
        }} />
      </AbsoluteFill>

      {/* LAYER 2: SVG decorative line */}
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
        <svg width="800" height="200" viewBox="0 0 800 200">
          <path
            ref={lineRef}
            d="M0,100 Q200,20 400,100 T800,100"
            fill="none"
            stroke="#00ffcc"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </AbsoluteFill>

      {/* LAYER 3: Logo */}
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div ref={logoRef} style={{ opacity: 0 }}>
          <Img src={staticFile(logoPath)} style={{
            width: 200,
            height: 200,
            objectFit: 'contain',
          }} />
        </div>
      </AbsoluteFill>

      {/* LAYER 4: Brand text */}
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', paddingTop: 300 }}>
        <div ref={textRef} style={{
          fontSize: 80,
          fontWeight: 900,
          color: '#fff',
          letterSpacing: 8,
          fontFamily: 'Inter, sans-serif',
        }}>
          {brandName}
        </div>
      </AbsoluteFill>

    </AbsoluteFill>
  );
};
```

**Key takeaways from this pattern:**
- **One `useEffect` for the whole timeline** — all phases are positioned with the third argument (start time)
- **Each layer is a separate `<AbsoluteFill>`** — clean nesting, easy to reason about
- **Refs are checked with `if (ref.current)`** before adding to timeline
- **SplitText cleanup** — store the split instance and `revert()` in cleanup
- **CustomEase created at module level** — only once, then used by name

---

## 12. Physics2D Particle Explosion (Advanced Full Scene)

```tsx
import React, { useRef, useEffect, useMemo } from 'react';
import { useCurrentFrame, useVideoConfig, AbsoluteFill, random } from 'remotion';
import gsap from 'gsap';
import { Physics2DPlugin } from 'gsap/Physics2DPlugin';

gsap.registerPlugin(Physics2DPlugin);

const PARTICLE_COUNT = 40;

export const ParticleExplosion: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const containerRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  // Generate particle data deterministically
  const particles = useMemo(() => {
    return Array.from({ length: PARTICLE_COUNT }).map((_, i) => ({
      size: 4 + random('size-' + i) * 10,
      hue: random('hue-' + i) * 60 + 10,
      velocity: 150 + random('vel-' + i) * 350,
      angle: random('angle-' + i) * 360,
    }));
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    const dots = containerRef.current.querySelectorAll<HTMLElement>('.particle');
    const tl = gsap.timeline({ paused: true });

    dots.forEach((dot, i) => {
      const p = particles[i];
      tl.to(dot, {
        physics2D: {
          velocity: p.velocity,
          angle: p.angle,
          gravity: 500,
          friction: 0.02,
        },
        opacity: 0,
        scale: 0,
        duration: 2.5,
        ease: 'none',
      }, 0.5); // all start at 0.5s (after a brief pause)
    });

    // Center flash
    tl.fromTo(containerRef.current,
      { backgroundColor: 'rgba(255,255,255,0)' },
      { backgroundColor: 'rgba(255,255,255,0.8)', duration: 0.1, yoyo: true, repeat: 1 },
      0.45
    );

    tlRef.current = tl;
    return () => { tl.kill(); };
  }, [particles]);

  useEffect(() => {
    tlRef.current?.seek(frame / fps);
  }, [frame, fps]);

  return (
    <AbsoluteFill style={{ backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }}>
      <div ref={containerRef} style={{ position: 'relative', width: '100%', height: '100%' }}>
        {particles.map((p, i) => (
          <div
            key={i}
            className="particle"
            style={{
              position: 'absolute',
              width: p.size,
              height: p.size,
              borderRadius: '50%',
              backgroundColor: `hsl(${p.hue}, 100%, 60%)`,
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              boxShadow: `0 0 ${p.size}px hsl(${p.hue}, 100%, 60%)`,
            }}
          />
        ))}
      </div>
    </AbsoluteFill>
  );
};
```

---

## ⚠️ JSX Safety Rules for GSAP Scenes

When combining GSAP with complex JSX, follow these rules **strictly**:

### 1. One AbsoluteFill Per Layer
```tsx
// ✅ CORRECT — each visual layer gets its own AbsoluteFill
<AbsoluteFill>
  <AbsoluteFill>{/* Layer 1: Background */}</AbsoluteFill>
  <AbsoluteFill>{/* Layer 2: SVG */}</AbsoluteFill>
  <AbsoluteFill>{/* Layer 3: Logo */}</AbsoluteFill>
  <AbsoluteFill>{/* Layer 4: Text */}</AbsoluteFill>
</AbsoluteFill>

// ❌ WRONG — mixing layers in one container
<AbsoluteFill>
  <div>{/* background stuff */}</div>
  <svg>{/* svg stuff */}</svg>
  <div>{/* logo and text mixed */}</div>
</AbsoluteFill>
```

### 2. Never Mix GSAP Logic in JSX Return
```tsx
// ✅ CORRECT — all GSAP logic in useEffect, JSX is pure render
useEffect(() => { /* build timeline here */ }, []);
return (<AbsoluteFill>...</AbsoluteFill>);

// ❌ WRONG — GSAP logic mixed into render
return (
  <AbsoluteFill>
    {gsap.to(ref, { x: 100 })} {/* NEVER DO THIS */}
  </AbsoluteFill>
);
```

### 3. Balance ALL Tags Before Submitting
Count before writing:
- Every `<AbsoluteFill>` needs `</AbsoluteFill>`
- Every `<div>` needs `</div>` or be self-closing `<div />`
- Every `{` needs `}`
- Every `(` needs `)`

### 4. Register Plugins at Module Level (NOT inside component)
```tsx
// ✅ CORRECT — top of file
import gsap from 'gsap';
import { SplitText } from 'gsap/SplitText';
gsap.registerPlugin(SplitText);

export const MyScene: React.FC = () => { ... };

// ❌ WRONG — inside component (runs every render)
export const MyScene: React.FC = () => {
  gsap.registerPlugin(SplitText); // BAD
  ...
};
```

---

## 📝 When to Use GSAP vs Remotion Built-in

| Use Case | Use GSAP | Use Remotion |
|----------|----------|-------------|
| Simple fade/slide | ❌ | ✅ `interpolate()` |
| Spring animation | ❌ | ✅ `spring()` |
| Text split + stagger | ✅ SplitText | ❌ |
| SVG path drawing | ✅ DrawSVGPlugin | ❌ |
| Scramble/decode text | ✅ ScrambleTextPlugin | ❌ |
| Complex multi-step choreography | ✅ Timeline | ⚠️ Complex with interpolate |
| Physics/particles | ✅ Physics2DPlugin | ❌ |
| Custom easing curves | ✅ CustomEase | ❌ |
| Morph SVG shapes | ✅ MorphSVGPlugin | ❌ |
| Animate along path | ✅ MotionPathPlugin | ❌ |
| Basic opacity/transform | ❌ | ✅ `interpolate()` |

**Rule of thumb:** Use Remotion's `interpolate` and `spring` for simple animations. Use GSAP when you need advanced effects (text splitting, SVG drawing, physics, complex choreography).

---

## ⚠️ Important Notes for Remotion

1. **Always register plugins** before using them: `gsap.registerPlugin(SplitText)`
2. **Never use GSAP's auto-play** — always `{ paused: true }` + `seek()`
3. **Use `useRef`** for DOM element references — never query DOM directly
4. **Clean up** in useEffect return: `tl.kill()`, `split.revert()`
5. **Use Remotion's `random()`** for deterministic random values, not `Math.random()`
6. **Import plugins** from `gsap/PluginName` (e.g., `gsap/SplitText`)
