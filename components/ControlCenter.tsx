import React, { useState, useRef, useEffect, WheelEvent, MouseEvent, useCallback } from 'react';
import type { Location } from '../types';
import { PinIcon } from './icons';
import { useTimer } from '../hooks/useTimer';

interface ControlCenterProps {
  targetLocation: Location;
  radius: number;
  currentLocation: Location | null;
  isInside: boolean | null;
  distance: number | null;
  error: string | null;
  isGeofenceOverridden: boolean;
  isClockedIn: boolean;
  clockInTime: Date | null;
  onClockToggle: () => void;
  timeMultiplier: number;
  canClockIn: boolean;
}

const ControlCenter: React.FC<ControlCenterProps> = ({
  currentLocation,
  isInside,
  distance,
  radius,
  error,
  isGeofenceOverridden,
  isClockedIn,
  clockInTime,
  onClockToggle,
  timeMultiplier,
  canClockIn
}) => {
  const [transform, setTransform] = useState({ scale: 1, x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const timer = useTimer(clockInTime, isClockedIn, timeMultiplier, { showSeconds: true });
  
  const mapBackground = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2YwZjJmNSIvPjxwYXRoIGQ9Ik0gNTAsMCBWIDIwMCBNIDAsODAgSCAyMDAgTSAxNTAsMCBWIDkwIEwgMjAwLCA3MCIgc3Ryb2tlPSIjZDlkZGUyIiBzdHJva2Utd2lkdGg9IjE1Ii8+PHBhdGggZD0iTSAwLDE2MCBIIDE0MCBMIDE2MCwgMjAwIiBzdHJva2U9IiNkOWRkZTIiIHN0cm9rZS13aWR0aD0iMTIiLz48cmVjdCB4PSI3MCIgeT0iMTAwIiB3aWR0aD0iNjAiIGhlaWdodD0iNTAiIGZpbGw9IiNlNmYxZTYiIHJ4PSI1Ii8+PHJlY3QgeD0iMTYwIiB5PSIxMCIgd2lkdGg9IjMwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjZThlOGU4Ii8+PC9zdmc+';

  const getStatusText = () => {
    if (isGeofenceOverridden) return 'Job Site Location Active (Overridden)';
    if (error) return error;
    if (isInside === null && !currentLocation) return 'Searching for location...';
    if (isInside === null && currentLocation) return 'Calculating distance...';
    return isInside ? 'You are at the job site.' : 'You are outside the job site.';
  };

  const getStatusColor = () => {
    if (isGeofenceOverridden || isInside) return 'text-green-600';
    if (error || isInside === false) return 'text-red-600';
    return 'text-slate-700';
  };
  
  const MAP_RADIUS_PX = 72; 
  const MAX_DISPLAY_RADIUS_PX = MAP_RADIUS_PX * 1.5;

  let userDotStyle: React.CSSProperties = { visibility: 'hidden' };

  if (distance !== null && currentLocation) {
    const pixelsPerMeter = MAP_RADIUS_PX / radius;
    const distanceInPixels = distance * pixelsPerMeter;
    const displayPixels = Math.min(distanceInPixels, MAX_DISPLAY_RADIUS_PX);
    
    const angle = Math.PI;
    const xOffset = Math.cos(angle) * displayPixels;
    const yOffset = Math.sin(angle) * displayPixels;

    userDotStyle = {
      transform: `translate(calc(-50% + ${xOffset}px), calc(-50% + ${yOffset}px))`,
      backgroundColor: isInside ? '#16a34a' : '#dc2626',
      transition: 'transform 0.5s ease-in-out, background-color 0.5s ease-in-out',
    };
  }
  
  const handleMouseDown = useCallback((e: MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation(); // Stop mousedown event from triggering page drag-scroll
    setIsDragging(true);
  }, []);
  
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMouseMove = useCallback((e: globalThis.MouseEvent) => {
    if (!isDragging) return;
    setTransform(prev => ({
      ...prev,
      x: prev.x + e.movementX,
      y: prev.y + e.movementY,
    }));
  }, [isDragging]);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const handleNativeWheel = (e: globalThis.WheelEvent) => {
        e.preventDefault();
        const rect = element.getBoundingClientRect();
        const zoomFactor = 1 - e.deltaY * 0.001;
        
        setTransform(prev => {
            const newScale = Math.max(0.5, Math.min(prev.scale * zoomFactor, 4));
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            const newX = mouseX - (mouseX - prev.x) * (newScale / prev.scale);
            const newY = mouseY - (mouseY - prev.y) * (newScale / prev.scale);
            return { scale: newScale, x: newX, y: newY };
        });
    };

    // Add native event listener with { passive: false } to ensure preventDefault works
    element.addEventListener('wheel', handleNativeWheel, { passive: false });

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      element.removeEventListener('wheel', handleNativeWheel);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const getButtonClasses = () => {
    if (isClockedIn) {
      return 'bg-red-500 hover:bg-red-600';
    }
    if (canClockIn) {
      return 'bg-green-600 hover:bg-green-700';
    }
    return 'bg-slate-400 cursor-not-allowed';
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="relative">
            <div 
                ref={containerRef}
                className="w-full h-48 relative overflow-hidden bg-slate-200"
                onMouseDown={handleMouseDown}
                aria-label="Interactive map showing job site location and your current position."
            >
                <div
                className={`w-full h-full ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                style={{
                    transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
                    transformOrigin: '0 0',
                }}
                >
                    <img 
                        src={mapBackground} 
                        className="absolute top-0 left-0 w-full h-full object-cover" 
                        alt="Map background"
                    />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                        <div 
                            className="w-36 h-36 rounded-full border-4 border-indigo-500 bg-indigo-500/10 flex items-center justify-center"
                            aria-label="Geofence area"
                        >
                            <PinIcon className="w-8 h-8 text-indigo-700" />
                        </div>
                        {currentLocation && (
                            <div 
                                className="absolute top-1/2 left-1/2 w-5 h-5 rounded-full border-2 border-white shadow-lg"
                                style={userDotStyle}
                                title="You are here"
                                aria-label={`Your location: ${isInside ? 'Inside' : 'Outside'} geofence`}
                            />
                        )}
                    </div>
                </div>
            </div>
            <div 
                className="absolute top-2 left-1/2 -translate-x-1/2 w-auto whitespace-nowrap px-6 py-2 bg-white/90 backdrop-blur-lg z-20 text-center rounded-full shadow-lg"
                aria-live="polite"
            >
                <p 
                    key={getStatusText()} 
                    className={`font-bold text-base ${getStatusColor()} animate-fadeIn`}
                >
                  {getStatusText()}
                </p>
            </div>
        </div>
      
      <div className="p-4 text-center space-y-4">
          <div>
            <h2 className="text-xs font-bold text-slate-500 tracking-wider uppercase">Total Hours</h2>
            <p 
                key={isClockedIn ? 'timer-running' : 'timer-stopped'}
                className={`text-5xl font-light text-slate-800 tracking-tighter mt-1 ${isClockedIn && clockInTime ? 'animate-fadeInUp' : ''}`}
            >
                {timer}
            </p>
          </div>
          
          <button
            onClick={onClockToggle}
            className={`w-full py-4 text-white font-bold rounded-lg transition-all duration-150 ease-in-out transform active:scale-95 text-lg ${getButtonClasses()}`}
          >
            {isClockedIn ? 'CLOCK OUT' : 'CLOCK IN'}
          </button>
      </div>

    </div>
  );
};

export default ControlCenter;