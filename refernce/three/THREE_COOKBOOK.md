# 🎲 React Three Fiber + Remotion Cookbook

> **@remotion/three**, **three**, **@react-three/fiber**, and **@react-three/drei** are installed. Use these patterns to create stunning 3D animations in Remotion.

---

## ⚡ Golden Rule: useCurrentFrame() — NOT useFrame()

In Remotion, you must **NOT** use React Three Fiber's `useFrame()` hook. Instead, use Remotion's `useCurrentFrame()` and compute everything **declaratively**:

```tsx
import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { ThreeCanvas } from '@remotion/three';

export const My3DScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();

  return (
    <ThreeCanvas
      orthographic={false}
      width={width}
      height={height}
      style={{ backgroundColor: '#000' }}
      camera={{ fov: 75, position: [0, 0, 5] }}
    >
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <mesh rotation={[frame * 0.02, frame * 0.03, 0]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="hotpink" />
      </mesh>
    </ThreeCanvas>
  );
};
```

**Key rules:**
- **Always use `<ThreeCanvas>`** from `@remotion/three` (NOT `<Canvas>` from R3F)
- **Always pass `width` and `height`** props to `<ThreeCanvas>`
- **Never use `useFrame()`** — compute rotation/position/scale from `frame` directly
- **`<Sequence layout="none">`** — required inside ThreeCanvas (no `<div>` wrapper)
- All animation is driven by `frame` — multiply by small constants for speed

---

## 1. Spinning 3D Cube (Base Pattern)

```tsx
import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { ThreeCanvas } from '@remotion/three';

export const SpinningCube: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const scale = interpolate(Math.sin(frame / 10), [-1, 1], [0.8, 1.2]);

  return (
    <ThreeCanvas
      orthographic={false}
      width={width}
      height={height}
      style={{ backgroundColor: '#111' }}
      camera={{ fov: 75, position: [0, 0, 470] }}
    >
      <ambientLight intensity={0.15} />
      <pointLight args={[undefined, 0.4]} position={[200, 200, 0]} />
      <mesh
        position={[0, 0, 0]}
        rotation={[frame * 0.03, frame * 0.04, frame * 0.02]}
        scale={scale}
      >
        <boxGeometry args={[100, 100, 100]} />
        <meshStandardMaterial
          color={[
            Math.sin(frame * 0.12) * 0.5 + 0.5,
            Math.cos(frame * 0.11) * 0.5 + 0.5,
            Math.sin(frame * 0.08) * 0.5 + 0.5,
          ]}
        />
      </mesh>
    </ThreeCanvas>
  );
};
```

---

## 2. 3D Text with Text3D (drei)

Render extruded 3D text with lighting and rotation.

```tsx
import React, { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { Text3D, Center, Environment } from '@react-three/drei';

const AnimatedText: React.FC<{ text: string }> = ({ text }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({ frame, fps, config: { damping: 15, stiffness: 80 } });
  const rotY = interpolate(frame, [0, 300], [0, Math.PI * 2]);

  return (
    <Center>
      <Text3D
        font="/fonts/Inter_Bold.json"
        size={1.5}
        height={0.3}
        curveSegments={12}
        bevelEnabled
        bevelThickness={0.02}
        bevelSize={0.02}
        rotation={[0, rotY * 0.1, 0]}
        scale={entrance}
      >
        {text}
        <meshStandardMaterial color="#ffffff" metalness={0.8} roughness={0.2} />
      </Text3D>
    </Center>
  );
};

export const Text3DScene: React.FC = () => {
  const { width, height } = useVideoConfig();

  return (
    <ThreeCanvas
      orthographic={false}
      width={width}
      height={height}
      style={{ backgroundColor: '#0a0a0a' }}
      camera={{ fov: 50, position: [0, 0, 8] }}
    >
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      <AnimatedText text="SHAHID" />
    </ThreeCanvas>
  );
};
```

**Note:** Text3D requires a typeface JSON font. Generate from [gero3.github.io/facetype.js](https://gero3.github.io/facetype.js/) and place in `public/fonts/`.

---

## 3. 3D Particle Field (InstancedMesh)

High-performance particles using instanced rendering.

```tsx
import React, { useRef, useMemo } from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import * as THREE from 'three';
import { random } from 'remotion';

const PARTICLE_COUNT = 500;

const Particles: React.FC = () => {
  const frame = useCurrentFrame();
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const particles = useMemo(() => {
    return Array.from({ length: PARTICLE_COUNT }).map((_, i) => ({
      x: (random('x-' + i) - 0.5) * 20,
      y: (random('y-' + i) - 0.5) * 20,
      z: (random('z-' + i) - 0.5) * 20,
      speed: random('speed-' + i) * 0.02 + 0.005,
      size: random('size-' + i) * 0.1 + 0.02,
    }));
  }, []);

  // Update positions every frame
  if (meshRef.current) {
    particles.forEach((p, i) => {
      dummy.position.set(
        p.x + Math.sin(frame * p.speed) * 2,
        p.y + Math.cos(frame * p.speed * 0.7) * 2,
        p.z + Math.sin(frame * p.speed * 1.3) * 1
      );
      dummy.scale.setScalar(p.size);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  }

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, PARTICLE_COUNT]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshBasicMaterial color="#00ffcc" transparent opacity={0.6} />
    </instancedMesh>
  );
};

export const ParticleFieldScene: React.FC = () => {
  const { width, height } = useVideoConfig();

  return (
    <ThreeCanvas
      orthographic={false}
      width={width}
      height={height}
      style={{ backgroundColor: '#000' }}
      camera={{ fov: 60, position: [0, 0, 10] }}
    >
      <Particles />
    </ThreeCanvas>
  );
};
```

---

## 4. Stars Background (drei)

Easy animated starfield using drei's `<Stars>`.

```tsx
import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { Stars } from '@react-three/drei';

export const StarsScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  return (
    <ThreeCanvas
      orthographic={false}
      width={width}
      height={height}
      style={{ backgroundColor: '#000' }}
      camera={{ fov: 60, position: [0, 0, 1] }}
    >
      <group rotation={[0, frame * 0.002, frame * 0.001]}>
        <Stars
          radius={100}
          depth={50}
          count={5000}
          factor={4}
          saturation={0}
          fade
          speed={0}
        />
      </group>
    </ThreeCanvas>
  );
};
```

**Stars props:**
| Prop | Default | Description |
|------|---------|-------------|
| `radius` | 100 | Outer radius of starfield |
| `depth` | 50 | Depth spread |
| `count` | 5000 | Number of stars |
| `factor` | 4 | Size factor |
| `saturation` | 0 | Color saturation (0=white) |
| `fade` | false | Fade stars at edges |
| `speed` | 1 | **Set to 0 for Remotion** — animate via group rotation |

---

## 5. Floating Distorted Sphere (drei)

Organic blob effect using `MeshDistortMaterial` + `Float`.

```tsx
import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { MeshDistortMaterial, Environment } from '@react-three/drei';

const FloatingBlob: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({ frame, fps, config: { damping: 12 } });
  const distort = interpolate(frame, [0, 150], [0.2, 0.6], { extrapolateRight: 'clamp' });

  return (
    <mesh scale={entrance * 2}>
      <sphereGeometry args={[1, 64, 64]} />
      <MeshDistortMaterial
        color="#8b5cf6"
        roughness={0.1}
        metalness={0.8}
        distort={distort}
        speed={0}
      />
    </mesh>
  );
};

export const BlobScene: React.FC = () => {
  const { width, height } = useVideoConfig();

  return (
    <ThreeCanvas
      orthographic={false}
      width={width}
      height={height}
      style={{ backgroundColor: '#0a0a0a' }}
      camera={{ fov: 50, position: [0, 0, 5] }}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      <FloatingBlob />
    </ThreeCanvas>
  );
};
```

**MeshDistortMaterial props:**
| Prop | Description |
|------|-------------|
| `distort` | Distortion amount (0-1) |
| `speed` | **Set to 0 for Remotion** — drive distort from frame |
| `color` | Material color |
| `roughness` | Surface roughness (0=mirror, 1=matte) |
| `metalness` | Metallic appearance (0-1) |

---

## 6. Environment & Studio Lighting (drei)

Professional lighting setup for realistic 3D.

```tsx
import React from 'react';
import { useVideoConfig } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { Environment, ContactShadows, Float } from '@react-three/drei';

export const StudioScene: React.FC = () => {
  const { width, height } = useVideoConfig();

  return (
    <ThreeCanvas
      orthographic={false}
      width={width}
      height={height}
      style={{ backgroundColor: '#111' }}
      camera={{ fov: 45, position: [0, 2, 8] }}
    >
      {/* HDR Environment for realistic reflections */}
      <Environment preset="studio" />

      {/* Ground contact shadows */}
      <ContactShadows
        position={[0, -1.5, 0]}
        opacity={0.4}
        scale={10}
        blur={2}
      />

      {/* Your 3D content here */}
      <mesh position={[0, 0, 0]}>
        <torusKnotGeometry args={[1, 0.3, 256, 32]} />
        <meshStandardMaterial color="#ff6b6b" metalness={0.9} roughness={0.1} />
      </mesh>
    </ThreeCanvas>
  );
};
```

**Environment presets:** `'apartment'`, `'city'`, `'dawn'`, `'forest'`, `'lobby'`, `'night'`, `'park'`, `'studio'`, `'sunset'`, `'warehouse'`

---

## 7. Camera Animation (Moving Camera)

Animate camera position/rotation using frame.

```tsx
import React, { useRef } from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import * as THREE from 'three';

const AnimatedCamera: React.FC = () => {
  const frame = useCurrentFrame();
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);

  // Camera orbits around center
  const angle = interpolate(frame, [0, 300], [0, Math.PI * 2]);
  const radius = 8;
  const camX = Math.sin(angle) * radius;
  const camZ = Math.cos(angle) * radius;
  const camY = interpolate(frame, [0, 150, 300], [3, 1, 3]);

  if (cameraRef.current) {
    cameraRef.current.position.set(camX, camY, camZ);
    cameraRef.current.lookAt(0, 0, 0);
  }

  return <perspectiveCamera ref={cameraRef} makeDefault fov={50} />;
};

export const CameraOrbitScene: React.FC = () => {
  const { width, height } = useVideoConfig();

  return (
    <ThreeCanvas
      orthographic={false}
      width={width}
      height={height}
      style={{ backgroundColor: '#0d1117' }}
    >
      <AnimatedCamera />
      <ambientLight intensity={0.3} />
      <pointLight position={[5, 5, 5]} intensity={1} />

      {/* Scene content */}
      <mesh>
        <torusGeometry args={[2, 0.5, 32, 64]} />
        <meshStandardMaterial color="#00ff88" metalness={0.7} roughness={0.2} />
      </mesh>

      <gridHelper args={[20, 20, '#333', '#222']} position={[0, -2, 0]} />
    </ThreeCanvas>
  );
};
```

---

## 8. 3D + 2D Hybrid (ThreeCanvas as a Layer)

Combine 3D background with 2D overlays using AbsoluteFill layers.

```tsx
import React from 'react';
import { useCurrentFrame, useVideoConfig, AbsoluteFill, interpolate } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { Stars } from '@react-three/drei';

export const HybridScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();

  const textOpacity = interpolate(frame, [30, 60], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill>

      {/* LAYER 1: 3D Background */}
      <AbsoluteFill>
        <ThreeCanvas
          orthographic={false}
          width={width}
          height={height}
          style={{ backgroundColor: '#000' }}
          camera={{ fov: 60, position: [0, 0, 1] }}
        >
          <group rotation={[0, frame * 0.003, 0]}>
            <Stars radius={100} depth={50} count={3000} factor={4} fade speed={0} />
          </group>

          <mesh rotation={[frame * 0.01, frame * 0.02, 0]} position={[0, 0, -5]}>
            <icosahedronGeometry args={[2, 1]} />
            <meshBasicMaterial color="#4a00e0" wireframe />
          </mesh>
        </ThreeCanvas>
      </AbsoluteFill>

      {/* LAYER 2: 2D Text Overlay */}
      <AbsoluteFill style={{
        justifyContent: 'center',
        alignItems: 'center',
        opacity: textOpacity,
      }}>
        <div style={{
          fontSize: 100,
          fontWeight: 900,
          color: '#fff',
          fontFamily: 'Inter, sans-serif',
          textShadow: '0 0 40px rgba(74,0,224,0.5)',
        }}>
          YOUR BRAND
        </div>
      </AbsoluteFill>

    </AbsoluteFill>
  );
};
```

**Key pattern:** `<ThreeCanvas>` goes inside an `<AbsoluteFill>`, then 2D content in another `<AbsoluteFill>` on top. This is the most common pattern for brand intros.

---

## 9. Sparkles Effect (drei)

Floating sparkle particles around content.

```tsx
import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { Sparkles, MeshDistortMaterial } from '@react-three/drei';

export const SparklesScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  return (
    <ThreeCanvas
      orthographic={false}
      width={width}
      height={height}
      style={{ backgroundColor: '#0a0a0a' }}
      camera={{ fov: 50, position: [0, 0, 6] }}
    >
      <ambientLight intensity={0.3} />

      {/* Sparkles around center */}
      <group rotation={[0, frame * 0.005, 0]}>
        <Sparkles
          count={100}
          scale={5}
          size={3}
          speed={0}
          color="#ffd700"
        />
      </group>

      {/* Center object */}
      <mesh scale={1.5}>
        <sphereGeometry args={[1, 64, 64]} />
        <MeshDistortMaterial
          color="#8b5cf6"
          distort={0.3}
          speed={0}
          roughness={0.1}
          metalness={0.8}
        />
      </mesh>
    </ThreeCanvas>
  );
};
```

---

## 10. Drei Helpers Quick Reference

### Staging & Effects
| Helper | Import | Use Case |
|--------|--------|----------|
| **Stars** | `@react-three/drei` | Starfield background |
| **Sparkles** | `@react-three/drei` | Floating sparkle particles |
| **Cloud** | `@react-three/drei` | Volumetric cloud effects |
| **Float** | `@react-three/drei` | Auto-floating animation (set speed=0 for Remotion) |
| **Trail** | `@react-three/drei` | Glowing trail behind moving objects |
| **Environment** | `@react-three/drei` | HDR lighting presets (studio, sunset, etc.) |
| **ContactShadows** | `@react-three/drei` | Soft ground shadows |
| **Stage** | `@react-three/drei` | Quick studio setup (lights + shadows) |
| **Sky** | `@react-three/drei` | Procedural sky dome |

### Materials
| Helper | Import | Use Case |
|--------|--------|----------|
| **MeshDistortMaterial** | `@react-three/drei` | Organic blob/wobble effect |
| **MeshWobbleMaterial** | `@react-three/drei` | Wobbling surface |
| **MeshReflectorMaterial** | `@react-three/drei` | Mirror/reflective floor |
| **MeshTransmissionMaterial** | `@react-three/drei` | Glass/crystal material |

### Text & Shapes
| Helper | Import | Use Case |
|--------|--------|----------|
| **Text3D** | `@react-three/drei` | Extruded 3D text (needs font JSON) |
| **Text** | `@react-three/drei` | 2D text in 3D space (SDF, any font) |
| **Center** | `@react-three/drei` | Auto-center children |
| **RoundedBox** | `@react-three/drei` | Box with rounded corners |
| **Line** | `@react-three/drei` | 3D line |

### Performance
| Helper | Import | Use Case |
|--------|--------|----------|
| **Instances** | `@react-three/drei` | Instanced rendering (many same objects) |
| **Points** | `@react-three/drei` | Point cloud rendering |

---

## ⚠️ Critical Rules for Remotion + Three.js

1. **Use `<ThreeCanvas>` from `@remotion/three`** — never `<Canvas>` from `@react-three/fiber`
2. **Always pass `width={width} height={height}`** to `<ThreeCanvas>`
3. **Never use `useFrame()`** — use `useCurrentFrame()` and compute declaratively
4. **Set `speed={0}` on all drei auto-animating helpers** (Stars, Float, MeshDistortMaterial) — drive animation from `frame` instead
5. **`<Sequence layout="none">`** required inside `<ThreeCanvas>` (no `<div>` wrapper)
6. **Server-side rendering** needs `chromiumOptions: { gl: "angle" }` for Three.js to work
7. **Use Remotion's `random()`** for deterministic random values in particle systems
8. **Hybrid 3D+2D** — put `<ThreeCanvas>` in an `<AbsoluteFill>`, overlay 2D in another `<AbsoluteFill>` on top

---

## � JSX SAFETY RULES (CRITICAL — prevents syntax errors)

Three.js JSX uses special lowercase elements (`<mesh>`, `<boxGeometry>`, `<meshStandardMaterial>`) that are NOT regular HTML. Follow these rules EXACTLY:

### Rule 1: `<mesh>` ALWAYS has exactly 2 children — geometry + material
```tsx
// ✅ CORRECT
<mesh rotation={[rotX, rotY, 0]}>
  <boxGeometry args={[1, 1, 1]} />
  <meshStandardMaterial color="hotpink" />
</mesh>

// ❌ WRONG — missing material
<mesh rotation={[rotX, rotY, 0]}>
  <boxGeometry args={[1, 1, 1]} />
</mesh>

// ❌ WRONG — geometry is not self-closing
<mesh>
  <boxGeometry args={[1, 1, 1]}></boxGeometry>
  <meshStandardMaterial color="red"></meshStandardMaterial>
</mesh>
```

### Rule 2: Geometry and Material are ALWAYS self-closing
```tsx
// ✅ CORRECT
<boxGeometry args={[1, 1, 1]} />
<meshStandardMaterial color="red" />
<sphereGeometry args={[1, 64, 64]} />

// ❌ WRONG
<boxGeometry args={[1, 1, 1]}></boxGeometry>
```

### Rule 3: NO JSX comments inside `<mesh>`, `<group>`, or `<ThreeCanvas>`
```tsx
// ✅ CORRECT — comment above the element
{/* Rotating cube */}
<mesh rotation={[rotX, rotY, 0]}>
  <boxGeometry args={[1, 1, 1]} />
  <meshStandardMaterial color="hotpink" />
</mesh>

// ❌ WRONG — comment INSIDE mesh children
<mesh rotation={[rotX, rotY, 0]}> {/* rotating cube */}
  <boxGeometry args={[1, 1, 1]} />
  <meshStandardMaterial color="hotpink" />
</mesh>
```

### Rule 4: Compute values ABOVE the return
```tsx
// ✅ CORRECT
const rotX = frame * 0.02;
const rotY = frame * 0.03;
const scale = interpolate(frame, [0, 30], [0, 1], { extrapolateRight: 'clamp' });

return (
  <ThreeCanvas ...>
    <mesh rotation={[rotX, rotY, 0]} scale={scale}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="hotpink" />
    </mesh>
  </ThreeCanvas>
);

// ❌ WRONG — complex expressions inline
return (
  <ThreeCanvas ...>
    <mesh rotation={[frame * 0.02, frame * 0.03, 0]} scale={interpolate(frame, [0, 30], [0, 1], { extrapolateRight: 'clamp' })}>
```

### Rule 5: Always complete component structure
```tsx
// ✅ CORRECT — full component with all imports
import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { ThreeCanvas } from '@remotion/three';

export const MyScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const rotY = frame * 0.03;

  return (
    <ThreeCanvas
      orthographic={false}
      width={width}
      height={height}
      style={{ backgroundColor: '#000' }}
      camera={{ fov: 75, position: [0, 0, 5] }}
    >
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <mesh rotation={[0, rotY, 0]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="hotpink" />
      </mesh>
    </ThreeCanvas>
  );
};
```

### Rule 6: Tag counting checklist
Before submitting any Three.js file, verify:
- [ ] Every `<ThreeCanvas>` has `</ThreeCanvas>`
- [ ] Every `<mesh>` has `</mesh>`
- [ ] Every `<group>` has `</group>`
- [ ] Every `<instancedMesh>` has `</instancedMesh>`
- [ ] All `<xxxGeometry />` are self-closing
- [ ] All `<xxxMaterial />` are self-closing
- [ ] `<ambientLight />` and `<pointLight />` are self-closing
- [ ] All `import` statements are spelled correctly (not `immport`)

---

## �📝 When to Use 3D vs 2D

| Use Case | 3D (Three.js) | 2D (GSAP/Remotion) |
|----------|---------------|-------------------|
| Rotating logo | ✅ | ❌ |
| Particle field with depth | ✅ | ⚠️ Limited |
| Extruded 3D text | ✅ Text3D | ❌ |
| Starfield/space background | ✅ Stars | ⚠️ CSS only |
| Glass/metal materials | ✅ | ❌ |
| Simple text animation | ❌ | ✅ SplitText |
| SVG path drawing | ❌ | ✅ DrawSVGPlugin |
| Flat motion graphics | ❌ | ✅ GSAP |
| Cinematic lighting + reflections | ✅ | ❌ |
| Background ambience | ✅ Stars/Sparkles | ⚠️ CSS gradients |

**Rule of thumb:** Use 3D for anything that benefits from depth, lighting, or materials. Use 2D (GSAP) for flat typography, SVG effects, and simple motion graphics. **Combine both** for the most impressive results — 3D background + 2D text overlay.
