import React, { useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Link } from 'react-router-dom';
import './HeroRigAnimation.css';

gsap.registerPlugin(ScrollTrigger);

const TOTAL_FRAMES = 192;

const LANDING_PARTS = [];

function getFrameUrl(index) {
  const num = String(index).padStart(3, '0');
  return `./frames/ezgif-frame-${num}.jpg`;
}

export default function HeroRigAnimation() {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const rigWrapperRef = useRef(null);
  const partsRef = useRef([]);
  const imagesRef = useRef([]);
  const currentFrameRef = useRef({ value: 0 });
  const [loadProgress, setLoadProgress] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    function resizeCanvas() {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(dpr, dpr);
      const img = imagesRef.current[Math.round(currentFrameRef.current.value)];
      if (img) drawFrame(img);
    }
    
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Preload
    let loadedCount = 0;
    const images = new Array(TOTAL_FRAMES);
    for (let i = 0; i < TOTAL_FRAMES; i++) {
      const img = new Image();
      img.src = getFrameUrl(i + 1);
      img.onload = () => {
        loadedCount++;
        setLoadProgress(Math.round((loadedCount / TOTAL_FRAMES) * 100));
        if (i === 0) drawFrame(img);
      };
      images[i] = img;
    }
    imagesRef.current = images;

    function drawFrame(img) {
      if (!img || !img.complete) return;
      const cw = window.innerWidth;
      const ch = window.innerHeight;
      const iw = img.naturalWidth;
      const ih = img.naturalHeight;
      const scale = Math.max(cw / iw, ch / ih);
      const sw = iw * scale;
      const sh = ih * scale;
      const sx = (cw - sw) / 2;
      const sy = (ch - sh) / 2;
      ctx.clearRect(0, 0, cw, ch);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, sx, sy, sw, sh);
    }

    // ── THE MAIN ANIMATION ──
    const mainTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top top',
        end: '+=2500', 
        pin: true,
        scrub: 1,
      }
    });

    // 1. Frame Scrubbing
    mainTimeline.to(currentFrameRef.current, {
      value: TOTAL_FRAMES - 1,
      ease: 'none',
      onUpdate: () => drawFrame(images[Math.round(currentFrameRef.current.value)])
    });

    // 2. Cross-fade Canvas to High-Res Parts
    mainTimeline.to(canvas, { opacity: 0, duration: 0.1 }, '>-0.05');

    const partStarts = [
      { x: -18, y: -8, s: 1.1 },
      { x: -38, y: 2, s: 0.8 },
      { x: 12, y: -18, s: 0.7 },
      { x: 18, y: -35, s: 0.6 },
      { x: 35, y: 15, s: 0.9 },
    ];

    partsRef.current.forEach((part, i) => {
      if (!part) return;
      const config = LANDING_PARTS[i];

      // Initial state (fixed inside Portal)
      gsap.set(part, { 
        xPercent: -50, yPercent: -50,
        left: '50%', top: '50%',
        x: `${partStarts[i].x}vw`,
        y: `${partStarts[i].y}vh`,
        scale: partStarts[i].s,
        opacity: 0,
        display: 'block',
        position: 'fixed'
      });

      // Reveal parts at the end of dismantle
      mainTimeline.to(part, { opacity: 1, duration: 0.1 }, '<');

      // 3. TRAVEL & DROP (Continuous motion down the page)
      // Master journey from Hero to Category
      const journeyTL = gsap.timeline({
        scrollTrigger: {
          trigger: 'body',
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1.2,
        }
      });

      // Assemble phase (inside hero pin)
      journeyTL.fromTo(part, { opacity: 0, scale: 0.5 }, { opacity: 1, scale: partStarts[i].s, duration: 0.1 });

      // 4. THE PERMANENT LANDING (Docking Just Besides Heading)
      gsap.to(part, {
        scrollTrigger: {
          trigger: config.target,
          start: 'top 80%', 
          end: 'top 20%',  
          scrub: 1,
          onLeave: () => {
            const section = document.querySelector(config.target);
            if (section) {
              const heading = section.querySelector('h3');
              if (heading) {
                gsap.set(part, { 
                  position: 'absolute',
                  top: '10px', 
                  left: config.offset ? `${-100 + config.offset}px` : '-100px',
                  x: 0,
                  yPercent: 0,
                  opacity: 1,
                  scale: 0.4,
                  zIndex: 100
                });
                heading.style.position = 'relative';
                heading.appendChild(part);
              }
            }
          },
          onEnterBack: () => {
            const portal = document.querySelector('.landing-parts-overlay');
            if (portal) {
              portal.appendChild(part);
              gsap.set(part, { position: 'fixed' });
            }
          }
        },
        left: '5vw',
        top: '10vh',
        opacity: 0.8,
        scale: 0.4,
        ease: 'power2.inOut'
      });
    });

    // Scroll Hint
    gsap.to('.scroll-hint', {
      opacity: 0,
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top top',
        end: '200px top',
        scrub: true,
      }
    });

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      // SAFETY CLEANUP: Return all parts to the portal before React unmounts
      const portal = document.querySelector('.landing-parts-overlay');
      partsRef.current.forEach(part => {
        if (part && portal && part.parentNode !== portal) {
          portal.appendChild(part);
        }
      });
      ScrollTrigger.getAll().forEach(st => st.kill());
    };
  }, []);

  // Use createPortal to render parts at the root level (prevents clipping/pinning issues)
  const partsOverlay = createPortal(
    <div className="landing-parts-overlay">
      {LANDING_PARTS.map((part, i) => (
        <img 
          key={part.id}
          src={part.src}
          alt={part.name}
          className="floating-landing-part"
          ref={el => partsRef.current[i] = el}
        />
      ))}
    </div>,
    document.body
  );

  return (
    <div className="hero-rig-section" ref={containerRef}>
      <div className="rig-pin-wrapper" ref={rigWrapperRef}>
        <canvas ref={canvasRef} className="hero-rig-canvas" />
        
        {partsOverlay}

        <div className="hero-text-overlay">
          <h1 className="hero-title">GEAR UP IN <span className="text-accent">KAMPALA</span></h1>
          <p className="hero-subtitle mb-8">High-End Cinema Rental & Pro Gear Sales</p>
          <div className="flex justify-center pointer-events-auto">
            <Link to="/shop" className="btn-shop-portal">
              SHOP PORTAL
            </Link>
          </div>
        </div>

        <div className="scroll-hint">
          <span>Scroll to dismantle</span>
          <div className="scroll-arrow">↓</div>
        </div>
      </div>

      {loadProgress < 100 && (
        <div className="frame-loader">
          <div className="loader-bar">
            <div className="loader-fill" style={{ width: `${loadProgress}%` }} />
          </div>
          <span className="loader-text">PREPARING RIG... {loadProgress}%</span>
        </div>
      )}
    </div>
  );
}
