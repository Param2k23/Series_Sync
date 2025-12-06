'use client';

import Spline from '@splinetool/react-spline';

interface SplineSceneProps {
  onLoad?: () => void;
}

export default function SplineScene({ onLoad }: SplineSceneProps) {
  return (
    <Spline
      scene="https://prod.spline.design/bViQJGTgXgXKqDt0/scene.splinecode"
      className="w-full h-full"
      onLoad={onLoad}
    />
  );
}
