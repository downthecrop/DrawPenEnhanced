import React, { useEffect, useRef } from 'react';
import './RadialColorPicker.scss';

const RadialColorPicker = ({ 
  colors, 
  position, 
  isVisible, 
  onHoverChange
}) => {
  const containerRef = useRef(null);
  const activeWedgeRef = useRef(null);

  // Calculate angle for each color wedge in radians and degrees
  const anglePerWedgeRad = (2 * Math.PI) / colors.length;
  const anglePerWedgeDeg = 360 / colors.length;

  // Handle mouse movement to detect hover over wedges
  useEffect(() => {
    if (!isVisible) return;

    const handleMouseMove = (event) => {
      if (!containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const mouseX = event.clientX;
      const mouseY = event.clientY;
      
      const deltaX = mouseX - centerX;
      const deltaY = mouseY - centerY; // Normal Y coordinate (macOS screen coordinates)
      
      // Calculate distance from center
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      
      // Check if mouse is within the radial menu area (between inner and outer radius)
      if (distance >= 25 && distance <= 70) { // Between 25 and 70px radius
        // Calculate angle of mouse position relative to center
        // Add 90 degrees to compensate for starting from top (instead of right)
        let angle = (Math.atan2(deltaY, deltaX) * 180 / Math.PI + 360 + 90) % 360;
        
        // Determine which wedge the mouse is over
        const wedgeIndex = Math.floor(angle / anglePerWedgeDeg);
        // Use modulo to wrap around if needed
        const correctedIndex = wedgeIndex % colors.length;
        
        // Highlight the active wedge
        const wedges = containerRef.current.querySelectorAll('.wedge');
        wedges.forEach((wedge, index) => {
          if (index === correctedIndex) {
            wedge.classList.add('active');
            if (activeWedgeRef.current !== index) {
              activeWedgeRef.current = index;
              onHoverChange && onHoverChange(index); // Notify parent of hover change
            }
          } else {
            wedge.classList.remove('active');
          }
        });
      } else {
        // Mouse is outside, remove all active states
        const wedges = containerRef.current.querySelectorAll('.wedge');
        wedges.forEach(wedge => wedge.classList.remove('active'));
        if (activeWedgeRef.current !== null) {
          activeWedgeRef.current = null;
          onHoverChange && onHoverChange(null); // Notify parent that no wedge is hovered
        }
      }
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isVisible, colors, anglePerWedgeDeg, onHoverChange]);

  if (!isVisible) return null;

  return (
    <div 
      className="radial-color-picker" 
      ref={containerRef}
      style={{
        left: position.x,
        top: position.y,
        transform: 'translate(-50%, -50%)'
      }}
    >
      <div className="radial-container">
        {colors.map((color, index) => {
          // Calculate wedge path using proper SVG path syntax
          const startAngle = index * anglePerWedgeRad - Math.PI/2; // Start from top
          const endAngle = (index + 1) * anglePerWedgeRad - Math.PI/2;
          
          const innerRadius = 25;
          const outerRadius = 65;
          
          // Calculate coordinates
          const x1 = 65 + innerRadius * Math.cos(startAngle);
          const y1 = 65 + innerRadius * Math.sin(startAngle);
          const x2 = 65 + outerRadius * Math.cos(startAngle);
          const y2 = 65 + outerRadius * Math.sin(startAngle);
          const x3 = 65 + outerRadius * Math.cos(endAngle);
          const y3 = 65 + outerRadius * Math.sin(endAngle);
          const x4 = 65 + innerRadius * Math.cos(endAngle);
          const y4 = 65 + innerRadius * Math.sin(endAngle);
          
          // Large arc flag: 1 if anglePerWedgeRad > Math.PI, else 0
          const largeArc = anglePerWedgeRad > Math.PI ? 1 : 0;
          
          // Create the path data
          const pathData = `M ${x1} ${y1} L ${x2} ${y2} A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${x3} ${y3} L ${x4} ${y4} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x1} ${y1} Z`;
          
          return (
            <div
              key={index}
              className="wedge"
              style={{
                position: 'absolute',
                width: '130px',
                height: '130px',
              }}
              data-index={index}
            >
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  clipPath: `path("${pathData}")`,
                  background: color.name === 'color_rainbow' ? 'conic-gradient(red, yellow, lime, aqua, blue, magenta, red)' : color.color,
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RadialColorPicker;