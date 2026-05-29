import React, { useEffect, useState } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { CameraBody, Lens, LensHood, TripodLegs, Recorder, Microphone, FluidHead } from './SVGAssets';
import './FloatingParts.css';

export default function FloatingPartsContainer() {
  const { scrollY } = useScroll();
  const [windowHeight, setWindowHeight] = useState(0);

  useEffect(() => {
    setWindowHeight(window.innerHeight);
    const handleResize = () => setWindowHeight(window.innerHeight);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const smoothScrollY = useSpring(scrollY, { damping: 20, stiffness: 100, mass: 0.5 });

  // Dismantle happens between 0 and 1000px scroll
  const dismantleEnd = 800;

  // We will map scrollY to X/Y offsets and Rotations.
  // Base assembled positions (center of screen)
  const centerX = typeof window !== 'undefined' ? window.innerWidth / 2 : 500;
  const centerY = windowHeight / 2;

  // Camera Body
  const bodyX = useTransform(smoothScrollY, [0, dismantleEnd, dismantleEnd + 1000], [0, -100, -100]);
  const bodyY = useTransform(smoothScrollY, [0, dismantleEnd, dismantleEnd + 1000], [0, -50, 600]);
  const bodyRot = useTransform(smoothScrollY, [0, dismantleEnd], [0, -15]);

  // Lens
  const lensX = useTransform(smoothScrollY, [0, dismantleEnd, dismantleEnd + 1000], [0, 150, 150]);
  const lensY = useTransform(smoothScrollY, [0, dismantleEnd, dismantleEnd + 1000], [0, -80, 800]);
  const lensRot = useTransform(smoothScrollY, [0, dismantleEnd], [0, 20]);

  // Lens Hood
  const hoodX = useTransform(smoothScrollY, [0, dismantleEnd, dismantleEnd + 1000], [0, 250, 250]);
  const hoodY = useTransform(smoothScrollY, [0, dismantleEnd, dismantleEnd + 1000], [0, -120, 800]);
  const hoodRot = useTransform(smoothScrollY, [0, dismantleEnd], [0, 45]);

  // Tripod Legs
  const tripodX = useTransform(smoothScrollY, [0, dismantleEnd, dismantleEnd + 1000], [0, -50, -50]);
  const tripodY = useTransform(smoothScrollY, [0, dismantleEnd, dismantleEnd + 1000], [0, 200, 1000]);
  const tripodRot = useTransform(smoothScrollY, [0, dismantleEnd], [0, -10]);

  // Recorder
  const recX = useTransform(smoothScrollY, [0, dismantleEnd, dismantleEnd + 1000], [0, -120, -120]);
  const recY = useTransform(smoothScrollY, [0, dismantleEnd, dismantleEnd + 1000], [0, -200, 1200]);
  const recRot = useTransform(smoothScrollY, [0, dismantleEnd], [0, -30]);

  // Microphone
  const micX = useTransform(smoothScrollY, [0, dismantleEnd, dismantleEnd + 1000], [0, -60, -60]);
  const micY = useTransform(smoothScrollY, [0, dismantleEnd, dismantleEnd + 1000], [0, -250, 1200]);
  const micRot = useTransform(smoothScrollY, [0, dismantleEnd], [0, 10]);

  // Fluid Head
  const headX = useTransform(smoothScrollY, [0, dismantleEnd, dismantleEnd + 1000], [0, 100, 100]);
  const headY = useTransform(smoothScrollY, [0, dismantleEnd, dismantleEnd + 1000], [0, 100, 900]);
  const headRot = useTransform(smoothScrollY, [0, dismantleEnd], [0, 25]);

  return (
    <div className="floating-container">
      {/* Spotlight for Hero */}
      <motion.div 
        className="spotlight"
        style={{ opacity: useTransform(scrollY, [0, dismantleEnd], [1, 0]) }}
      />
      
      <div className="rig-center" style={{ left: centerX, top: centerY }}>
        
        {/* Tripod Legs */}
        <motion.div className="part-wrapper float-delay-1" style={{ x: tripodX, y: tripodY, rotate: tripodRot, left: -150, top: 50 }}>
          <TripodLegs />
          <div className="part-label">TRIPOD LEGS</div>
        </motion.div>

        {/* Fluid Head */}
        <motion.div className="part-wrapper float-delay-2" style={{ x: headX, y: headY, rotate: headRot, left: -60, top: 0 }}>
          <FluidHead />
          <div className="part-label">FLUID HEAD</div>
        </motion.div>

        {/* Camera Body */}
        <motion.div className="part-wrapper float-delay-3" style={{ x: bodyX, y: bodyY, rotate: bodyRot, left: -100, top: -120 }}>
          <CameraBody />
          <div className="part-label">CAMERA BODY</div>
        </motion.div>

        {/* Lens */}
        <motion.div className="part-wrapper float-delay-4" style={{ x: lensX, y: lensY, rotate: lensRot, left: 60, top: -110 }}>
          <Lens />
          <div className="part-label">PRIME LENS</div>
        </motion.div>

        {/* Lens Hood */}
        <motion.div className="part-wrapper float-delay-5" style={{ x: hoodX, y: hoodY, rotate: hoodRot, left: 160, top: -70 }}>
          <LensHood />
          <div className="part-label">LENS HOOD</div>
        </motion.div>

        {/* Recorder */}
        <motion.div className="part-wrapper float-delay-6" style={{ x: recX, y: recY, rotate: recRot, left: -60, top: -220 }}>
          <Recorder />
          <div className="part-label">ZOOM RECORDER</div>
        </motion.div>

        {/* Microphone */}
        <motion.div className="part-wrapper float-delay-7" style={{ x: micX, y: micY, rotate: micRot, left: -50, top: -280 }}>
          <Microphone />
          <div className="part-label">XY MICROPHONE</div>
        </motion.div>

      </div>
    </div>
  );
}
