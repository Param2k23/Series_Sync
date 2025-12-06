'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

interface LoadingScreenProps {
  readonly isLoading: boolean;
  readonly onLoadingComplete?: () => void;
}

export default function LoadingScreen({
  isLoading,
  onLoadingComplete,
}: LoadingScreenProps) {
  const [phase, setPhase] = useState<
    'entering' | 'merged' | 'waiting' | 'exiting' | 'done'
  >('entering');
  const [isReady, setIsReady] = useState(false);

  // Phase 1: Letters come together (this is the initial loading animation)
  useEffect(() => {
    const timer = setTimeout(() => {
      setPhase('merged');
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Phase 2: After merge, move to waiting
  useEffect(() => {
    if (phase === 'merged') {
      const timer = setTimeout(() => {
        setPhase('waiting');
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  // Phase 3: When waiting and loading complete, start exit
  useEffect(() => {
    if (phase === 'waiting' && !isLoading) {
      const timer = setTimeout(() => {
        setPhase('exiting');
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [phase, isLoading]);

  // Phase 4: After exit animation, mark as done
  useEffect(() => {
    if (phase === 'exiting') {
      const timer = setTimeout(() => {
        setPhase('done');
        setIsReady(true);
      }, 1100);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  // Notify parent when completely done
  useEffect(() => {
    if (isReady) {
      onLoadingComplete?.();
    }
  }, [isReady, onLoadingComplete]);

  if (phase === 'done') return null;

  const isExiting = phase === 'exiting';
  const isMergedOrWaiting = phase === 'merged' || phase === 'waiting';

  // Pre-calculate animation values for cleaner code
  const leftSPosition = isExiting
    ? '-55vw'
    : isMergedOrWaiting
    ? '0vw'
    : '-55vw';
  const rightSPosition = isExiting
    ? '55vw'
    : isMergedOrWaiting
    ? '0vw'
    : '55vw';
  const rightSOpacity = isMergedOrWaiting && !isExiting ? 0 : 1;

  return (
    <div
      className="fixed inset-0 z-100 overflow-hidden"
      style={{
        willChange: 'transform',
        backfaceVisibility: 'hidden',
      }}
    >
      {/* Left black panel */}
      <motion.div
        className="absolute top-0 left-0 w-1/2 h-full bg-black"
        initial={false}
        animate={{ x: isExiting ? '-100%' : '0%' }}
        transition={{
          duration: 0.9,
          ease: [0.32, 0.72, 0, 1],
          delay: isExiting ? 0.15 : 0,
        }}
        style={{
          willChange: 'transform',
          backfaceVisibility: 'hidden',
          transform: 'translateZ(0)',
        }}
      />

      {/* Right black panel */}
      <motion.div
        className="absolute top-0 right-0 w-1/2 h-full bg-black"
        initial={false}
        animate={{ x: isExiting ? '100%' : '0%' }}
        transition={{
          duration: 0.9,
          ease: [0.32, 0.72, 0, 1],
          delay: isExiting ? 0.15 : 0,
        }}
        style={{
          willChange: 'transform',
          backfaceVisibility: 'hidden',
          transform: 'translateZ(0)',
        }}
      />

      {/* Letters container */}
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Left S */}
        <motion.div
          className="absolute text-[12vw] sm:text-[10vw] md:text-[8vw] font-black text-white select-none leading-none"
          initial={{ x: '-55vw' }}
          animate={{ x: leftSPosition }}
          transition={{
            duration: isExiting ? 0.8 : 1.3,
            ease: [0.32, 0.72, 0, 1],
          }}
          style={{
            willChange: 'transform',
            backfaceVisibility: 'hidden',
            transform: 'translateZ(0)',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          S
        </motion.div>

        {/* Right S */}
        <motion.div
          className="absolute text-[12vw] sm:text-[10vw] md:text-[8vw] font-black text-white select-none leading-none"
          initial={{ x: '55vw', opacity: 1 }}
          animate={{ x: rightSPosition, opacity: rightSOpacity }}
          transition={{
            duration: isExiting ? 0.8 : 1.3,
            ease: [0.32, 0.72, 0, 1],
            opacity: { duration: 0.3, delay: rightSOpacity === 0 ? 1.1 : 0 },
          }}
          style={{
            willChange: 'transform, opacity',
            backfaceVisibility: 'hidden',
            transform: 'translateZ(0)',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          S
        </motion.div>

        {/* Pulsing glow when merged/waiting */}
        {isMergedOrWaiting && !isExiting && (
          <motion.div
            className="absolute w-[15vw] h-[15vw] rounded-full pointer-events-none"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              opacity: [0.15, 0.25, 0.15],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            style={{
              background:
                'radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)',
              willChange: 'transform, opacity',
            }}
          />
        )}
      </div>

      {/* Loading text - only show when waiting for 3D */}
      {phase === 'waiting' && isLoading && (
        <motion.div
          className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <span className="text-white/60 text-sm tracking-wide">
            Loading 3D Scene
          </span>
        </motion.div>
      )}

      {/* Loading dots */}
      {isMergedOrWaiting && !isExiting && (
        <motion.div
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-white/40"
              animate={{ opacity: [0.3, 0.8, 0.3] }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.15,
                ease: 'easeInOut',
              }}
            />
          ))}
        </motion.div>
      )}
    </div>
  );
}
