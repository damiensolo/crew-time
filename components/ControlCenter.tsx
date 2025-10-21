import React from 'react';
import type { Location } from '../types';
import { useTimer } from '../hooks/useTimer';
import InteractiveMap from './InteractiveMap';

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
  isClockedIn,
  clockInTime,
  onClockToggle,
  timeMultiplier,
  canClockIn
}) => {
  const timer = useTimer(clockInTime, isClockedIn, timeMultiplier, { showSeconds: true });
  
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
      <InteractiveMap
        currentLocation={currentLocation}
        isInside={isInside}
        distance={distance}
        radius={radius}
      />
      
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