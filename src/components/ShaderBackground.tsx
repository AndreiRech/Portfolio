'use client';

import dynamic from 'next/dynamic';
import { useSettings } from '@/context/SettingsContext';

const ShaderGradientCanvas = dynamic(
  () =>
    import('@shadergradient/react').then((mod) => mod.ShaderGradientCanvas),
  { ssr: false }
);

const ShaderGradientComponent = dynamic(
  () => import('@shadergradient/react').then((mod) => mod.ShaderGradient),
  { ssr: false }
);

// All shader props in one object to avoid individual ts-expect-error lines

export default function ShaderBackground() {
  const { theme } = useSettings();

  const shaderProps = {
  animate: 'on' as const,
  axesHelper: 'off',
  bgColor1: theme === 'light' ? '#ECEFF1' : '#111517',
  bgColor2: theme === 'light' ? '#ECEFF1' : '#111517',
  brightness: 1,
  cAzimuthAngle: 180,
  cDistance: 2.8,
  cPolarAngle: 80,
  cameraZoom: 9.1,
  color1: theme === 'light' ? '#8384B1' : '#8384B1',
  color2: theme === 'light' ? '#ECEFF1' : '#191970',
  color3: theme === 'light' ? '#ECEFF1' : '#212121',
  destination: 'onCanvas',
  embedMode: 'off',
  envPreset: 'city' as const,
  format: 'gif',
  frameRate: 10,
  gizmoHelper: 'hide',
  grain: 'on' as const,
  lightType: '3d' as const,
  pixelDensity: 1,
  positionX: 0,
  positionY: 0,
  positionZ: 0,
  range: 'disabled',
  rangeEnd: 40,
  rangeStart: 0,
  reflection: 0.1,
  rotationX: 50,
  rotationY: 0,
  rotationZ: -60,
  shader: 'defaults',
  type: 'waterPlane' as const,
  uAmplitude: 0,
  uDensity: 1.5,
  uFrequency: 0,
  uSpeed: 0.3,
  uStrength: 1.5,
  uTime: 8,
  wireframe: false,
};

  return (
    <div
      className="fixed inset-0"
      style={{ zIndex: -1 }}
      aria-hidden="true"
    >
      <ShaderGradientCanvas
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
        }}
        pixelDensity={1}
        fov={45}
      >
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <ShaderGradientComponent {...(shaderProps as any)} />
      </ShaderGradientCanvas>
    </div>
  );
}
