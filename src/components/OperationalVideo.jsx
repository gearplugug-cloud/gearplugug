import React from 'react';

export default function OperationalVideo() {
  return (
    <section className="operational-video container" style={{ padding: '80px 24px' }}>
      <h2 className="section-title text-center">See it in Action</h2>
      <div className="video-wrapper" style={{ 
        position: 'relative', 
        paddingBottom: '56.25%', /* 16:9 */
        height: 0,
        backgroundColor: '#111',
        borderRadius: '12px',
        overflow: 'hidden',
        border: '1px solid var(--border-color)'
      }}>
        {/* Placeholder for actual video iframe */}
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: 'var(--text-muted)' }}>
          Operational Video / Tutorial
        </div>
      </div>
    </section>
  );
}
