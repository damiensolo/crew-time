import React from 'react';
import type { Project } from '../../types';
import { PinIcon } from '../../components/icons';
import { useTimer } from '../../hooks/useTimer';

interface ControlCenterProps {
  project: Project;
  isClockedIn: boolean;
  clockInTime: Date | null;
  timeMultiplier: number;
  onClockToggle: () => void;
  canClockIn: boolean;
}

const ControlCenter: React.FC<ControlCenterProps> = ({
  project,
  isClockedIn,
  clockInTime,
  timeMultiplier,
  onClockToggle,
  canClockIn,
}) => {
  const timer = useTimer(clockInTime, isClockedIn, timeMultiplier, { showSeconds: true });
  
  const getButtonClasses = () => {
    if (isClockedIn) {
      // A red button for clocking out, matching the user's image
      return 'bg-red-600 hover:bg-red-700';
    }
    if (canClockIn) {
      // A green button for clocking in, as per the design
      return 'bg-green-600 hover:bg-green-700';
    }
    // A disabled gray button
    return 'bg-slate-400 cursor-not-allowed';
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden text-center">
      <div className="p-6 space-y-6">
        <div className="text-center">
          <p className="text-xs font-bold text-slate-500 tracking-wider uppercase">Shift</p>
          <p className="text-lg font-semibold text-slate-800 tracking-tight mt-1">8:00am-4:00pm</p>
        </div>

        <p className={`text-5xl font-light text-slate-800 tracking-tighter ${isClockedIn && clockInTime ? 'animate-fadeInUp' : ''}`}>
            {timer}
        </p>
        
        <button
          onClick={onClockToggle}
          className={`w-full py-4 text-white font-bold rounded-lg transition-all duration-150 ease-in-out transform active:scale-95 text-lg ${getButtonClasses()}`}
        >
          {isClockedIn ? 'CLOCK OUT' : 'CLOCK IN'}
        </button>
      </div>

      {isClockedIn && (
        <div className="bg-slate-50 border-t border-slate-200 px-4 py-2 flex items-center justify-center space-x-2 animate-fadeIn">
          <PinIcon className="w-4 h-4 text-slate-500 flex-shrink-0" />
          <p className="text-sm text-slate-600 truncate">
            Clocked in at: {project.address}
          </p>
        </div>
      )}
    </div>
  );
};

export default ControlCenter;