import React, { useState } from 'react';
import type { Task } from '../types';
import { formatTime } from '../hooks/useTimer';

interface TimeInputProps {
  label: string;
  totalSeconds: number;
  onChange: (seconds: number) => void;
}

const TimeInput: React.FC<TimeInputProps> = ({ label, totalSeconds, onChange }) => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  const handleTimeChange = (newHours: number, newMinutes: number) => {
    const totalSeconds = (newHours * 3600) + (newMinutes * 60);
    onChange(totalSeconds);
  };
  
  const handleHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newHours = parseInt(e.target.value, 10);
    if (isNaN(newHours) || newHours < 0) newHours = 0;
    handleTimeChange(newHours, minutes);
  };

  const handleMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newMinutes = parseInt(e.target.value, 10);
    if (isNaN(newMinutes) || newMinutes < 0) {
        newMinutes = 0;
    } else if (newMinutes > 59) {
        newMinutes = 59;
    }
    handleTimeChange(hours, newMinutes);
  };

  return (
    <div className="flex items-center justify-between py-1">
      <div className="text-sm font-medium text-slate-600 flex items-center">{label}</div>
      <div className="flex items-center space-x-2">
        <div className="relative">
          <input
            type="number"
            value={hours.toString()}
            onChange={handleHoursChange}
            min="0"
            className="w-16 h-10 text-center bg-white border border-slate-300 rounded-md font-mono text-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            aria-label={`${label} hours`}
          />
          <span className="absolute -right-2 top-1/2 -translate-y-1/2 text-slate-400 font-bold">:</span>
        </div>
        <input
          type="number"
          value={minutes.toString().padStart(2, '0')}
          onChange={handleMinutesChange}
          min="0"
          max="59"
          className="w-16 h-10 text-center bg-white border border-slate-300 rounded-md font-mono text-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          aria-label={`${label} minutes`}
        />
      </div>
    </div>
  );
};


interface AllocationTaskCardProps {
  task: Task;
  trackedSeconds: number;
  onTrackedChange: (taskId: number, seconds: number) => void;
  manualSeconds: number;
  onManualChange: (taskId: number, seconds: number) => void;
}

const AllocationTaskCard: React.FC<AllocationTaskCardProps> = ({
  task,
  trackedSeconds,
  onTrackedChange,
  manualSeconds,
  onManualChange
}) => {
  const [isAddingManualTime, setIsAddingManualTime] = useState(manualSeconds > 0);
  const totalSeconds = trackedSeconds + manualSeconds;

  const handleShowManualInput = () => {
    setIsAddingManualTime(true);
  };

  return (
    <div className="bg-slate-50 rounded-lg transition-shadow hover:shadow-sm border border-slate-200/80 p-4 space-y-3">
      {/* Task Header */}
      <div className="flex items-center justify-between">
        <div className="min-w-0">
          <h3 className="font-semibold text-slate-800 text-base truncate">{task.name}</h3>
          <span className="text-xs font-semibold text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full mt-1 inline-block">{task.type}</span>
        </div>
        <div className="text-right ml-2">
            <p className="font-mono text-lg font-semibold text-slate-700">{formatTime(totalSeconds)}</p>
            <p className="text-xs text-slate-500 -mt-1">total</p>
        </div>
      </div>

      {/* Time Allocation Inputs */}
      <div className="border-t border-slate-200 pt-2 space-y-1">
        <TimeInput 
          label="⏱️ Tracked" 
          totalSeconds={trackedSeconds} 
          onChange={(seconds) => onTrackedChange(task.id, seconds)} 
        />
        
        {isAddingManualTime || manualSeconds > 0 ? (
          <TimeInput 
            label="➕ Manual" 
            totalSeconds={manualSeconds} 
            onChange={(seconds) => onManualChange(task.id, seconds)}
          />
        ) : (
          <div className="pt-1">
            <button onClick={handleShowManualInput} className="text-sm font-medium text-orange-600 hover:text-orange-800 py-2 flex items-center space-x-1.5 px-1">
              <span>➕</span>
              <span>Add manual time</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllocationTaskCard;