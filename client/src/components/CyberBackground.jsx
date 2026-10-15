import React from 'react';

/**
 * CyberBackground — Animated futuristic cybersecurity background.
 * Uses GPU-accelerated CSS keyframe animations for ultra-smooth 60fps
 * motion without impacting application performance.
 */
const CyberBackground = () => {
  return (
    <div className="cyber-bg-wrapper" aria-hidden="true">
      <style>{`
        .cyber-bg-wrapper {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          overflow: hidden;
          pointer-events: none;
          z-index: 0;
          background: #060913;
        }

        /* Deep Ambient Base Gradient */
        .cyber-base-gradient {
          position: absolute;
          inset: 0;
          background: 
            radial-gradient(ellipse 80% 50% at 50% -20%, rgba(30, 58, 138, 0.35), transparent),
            radial-gradient(ellipse 60% 50% at 85% 60%, rgba(88, 28, 135, 0.22), transparent),
            radial-gradient(ellipse 50% 40% at 15% 75%, rgba(14, 116, 144, 0.25), transparent),
            linear-gradient(180deg, #070d1d 0%, #030712 100%);
        }

        /* Perspective 3D Cyber Grid on Floor */
        .cyber-grid-floor {
          position: absolute;
          bottom: 0;
          left: -50%;
          width: 200%;
          height: 60%;
          background-image: 
            linear-gradient(to right, rgba(56, 189, 248, 0.08) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(56, 189, 248, 0.08) 1px, transparent 1px);
          background-size: 50px 50px;
          transform: perspective(600px) rotateX(65deg);
          transform-origin: bottom center;
          animation: gridMove 20s linear infinite;
          mask-image: linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 40%, transparent 85%);
          -webkit-mask-image: linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 40%, transparent 85%);
        }

        @keyframes gridMove {
          0% { background-position: 0 0; }
          100% { background-position: 0 500px; }
        }

        /* Floating Glowing Plasma Orbs */
        .cyber-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.45;
          will-change: transform;
        }

        .orb-cyan {
          width: 550px;
          height: 550px;
          background: radial-gradient(circle, #06b6d4 0%, rgba(6, 182, 212, 0) 70%);
          top: -120px;
          right: 5%;
          animation: floatOrb1 24s ease-in-out infinite alternate;
        }

        .orb-purple {
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, #8b5cf6 0%, rgba(139, 92, 246, 0) 70%);
          bottom: -80px;
          right: 35%;
          animation: floatOrb2 28s ease-in-out infinite alternate;
        }

        .orb-blue {
          width: 450px;
          height: 450px;
          background: radial-gradient(circle, #3b82f6 0%, rgba(59, 130, 246, 0) 70%);
          top: 35%;
          left: -80px;
          animation: floatOrb3 22s ease-in-out infinite alternate;
        }

        @keyframes floatOrb1 {
          0% { transform: translate3d(0, 0, 0) scale(1); }
          50% { transform: translate3d(-80px, 60px, 0) scale(1.12); }
          100% { transform: translate3d(50px, 120px, 0) scale(0.95); }
        }

        @keyframes floatOrb2 {
          0% { transform: translate3d(0, 0, 0) scale(1); }
          50% { transform: translate3d(70px, -90px, 0) scale(1.15); }
          100% { transform: translate3d(-60px, -40px, 0) scale(0.9); }
        }

        @keyframes floatOrb3 {
          0% { transform: translate3d(0, 0, 0) scale(1); }
          50% { transform: translate3d(90px, -60px, 0) scale(1.08); }
          100% { transform: translate3d(40px, 80px, 0) scale(0.92); }
        }

        /* Subtle Laser Scanline Sweep */
        .cyber-scanline {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, 
            transparent 0%, 
            rgba(56, 189, 248, 0.15) 20%, 
            rgba(56, 189, 248, 0.65) 50%, 
            rgba(56, 189, 248, 0.15) 80%, 
            transparent 100%
          );
          box-shadow: 0 0 15px rgba(56, 189, 248, 0.5);
          animation: scanlineSweep 9s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }

        @keyframes scanlineSweep {
          0% { transform: translateY(-10px); opacity: 0; }
          10% { opacity: 0.8; }
          90% { opacity: 0.8; }
          100% { transform: translateY(105vh); opacity: 0; }
        }

        /* Ambient Hex Dot Pattern */
        .cyber-dots-overlay {
          position: absolute;
          inset: 0;
          background-image: radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px);
          background-size: 28px 28px;
          opacity: 0.6;
        }
      `}</style>

      <div className="cyber-base-gradient" />
      <div className="cyber-dots-overlay" />
      <div className="cyber-grid-floor" />
      <div className="cyber-orb orb-cyan" />
      <div className="cyber-orb orb-purple" />
      <div className="cyber-orb orb-blue" />
      <div className="cyber-scanline" />
    </div>
  );
};

export default CyberBackground;
