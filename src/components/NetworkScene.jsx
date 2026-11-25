import { Component, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { CanvasTexture } from 'three';
import { Line, OrbitControls } from '@react-three/drei';
import { Empty } from './ui.jsx';

// Shows a fallback instead of a blank page if WebGL is unavailable.
class Boundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    return this.state.failed
      ? <Empty title="3D view unavailable" hint="Enable WebGL, or use the device list." />
      : this.props.children;
  }
}

function Packet({ to, offset }) {
  const ref = useRef();
  useFrame(({ clock }) => {
    const t = (clock.elapsedTime * 0.35 + offset) % 1;
    ref.current.position.set(to[0] * t, to[1] * t, to[2] * t);
  });
  return <mesh ref={ref}><sphereGeometry args={[0.05, 8, 8]} /><meshBasicMaterial color="#ffffff" /></mesh>;
}

// Text drawn to a texture, so labels live inside the WebGL scene.
function Label({ text }) {
  const texture = useMemo(() => {
    const canvas = Object.assign(document.createElement('canvas'), { width: 512, height: 64 });
    const g = canvas.getContext('2d');
    g.font = '30px "M PLUS 1 Code", monospace';
    g.fillStyle = '#d4d4d8';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText(text, 256, 32);
    return new CanvasTexture(canvas);
  }, [text]);
  useEffect(() => () => texture.dispose(), [texture]);
  return (
    <sprite position={[0, -0.6, 0]} scale={[2.6, 0.325, 1]} raycast={() => null}>
      <spriteMaterial map={texture} transparent depthWrite={false} />
    </sprite>
  );
}

function Node({ device, position, onSelect, size = 0.22 }) {
  const [hover, setHover] = useState(false);
  useEffect(() => () => { document.body.style.cursor = 'auto'; }, []);
  const unknown = device.status !== 'approved';
  return (
    <group position={position}>
      <mesh
        scale={hover ? 1.35 : 1}
        onClick={(e) => { e.stopPropagation(); onSelect(device.id); }}
        onPointerOver={() => { setHover(true); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { setHover(false); document.body.style.cursor = 'auto'; }}
      >
        {unknown ? <octahedronGeometry args={[size * 1.3]} /> : <sphereGeometry args={[size, 24, 24]} />}
        <meshStandardMaterial color="#ffffff" wireframe={unknown} metalness={0.7} roughness={0.25} />
      </mesh>
      <Label text={device.name} />
    </group>
  );
}

export default function NetworkScene({ devices, onSelect }) {
  const gateway = devices.find((d) => d.type === 'Gateway');
  const nodes = useMemo(() => {
    const others = devices.filter((d) => d.type !== 'Gateway');
    return others.map((d, i) => {
      const a = (i / others.length) * Math.PI * 2;
      return { device: d, position: [Math.cos(a) * 4, ((i % 3) - 1) * 1.1, Math.sin(a) * 4] };
    });
  }, [devices]);

  return (
    <Boundary>
      <Canvas camera={{ position: [0, 5, 10], fov: 48 }} dpr={[1, 1.5]}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[4, 6, 5]} intensity={2} />
        {gateway && <Node device={gateway} position={[0, 0, 0]} onSelect={onSelect} size={0.55} />}
        {nodes.map(({ device, position }, i) => (
          <group key={device.id}>
            <Line points={[[0, 0, 0], position]} color="#8a8a8a" lineWidth={1}
              dashed={device.status !== 'approved'} dashSize={0.2} gapSize={0.15} />
            {device.status !== 'blocked' && <Packet to={position} offset={i / nodes.length} />}
            <Node device={device} position={position} onSelect={onSelect} />
          </group>
        ))}
        <OrbitControls enablePan={false} minDistance={6} maxDistance={16} autoRotate autoRotateSpeed={0.6} />
      </Canvas>
    </Boundary>
  );
}
