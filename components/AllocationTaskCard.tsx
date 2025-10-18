import React from 'react';
import type { Task } from '../types';
import { ClockIcon } from './icons';

interface AllocationTaskCardProps {
  task: Task;
  allocatedSeconds: number;
  onAllocationChange: (taskId: number, seconds: number) => void;
}

const AllocationTaskCard: React.FC<AllocationTaskCardProps> = ({
  task,
  allocatedSeconds,
  onAllocationChange,
}) => {
  const hours = Math.floor(allocatedSeconds / 3600);
  const minutes = Math.floor((allocatedSeconds % 3600) / 60);

  const handleTimeChange = (newHours: number, newMinutes: number) => {
    const totalSeconds = (newHours * 3600) + (newMinutes * 60);
    onAllocationChange(task.id, totalSeconds);
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
    <div className="bg-slate-50 rounded-lg p-3 flex items-center justify-between transition-shadow hover:shadow-md">
      <div className="flex items-center space-x-3 min-w-0">
        <ClockIcon className="w-6 h-6 text-slate-400 flex-shrink-0" />
        <div className="min-w-0">
          <h3 className="font-semibold text-slate-800 text-base truncate">{task.name}</h3>
          <span className="text-xs font-semibold text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full flex-shrink-0">{task.type}</span>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <div className="relative">
          <input
            type="number"
            value={hours.toString().padStart(2, '0')}
            onChange={handleHoursChange}
            min="0"
            className="w-16 h-10 text-center bg-white border border-slate-300 rounded-md font-mono text-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            aria-label={`Hours for ${task.name}`}
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
          aria-label={`Minutes for ${task.name}`}
        />
      </div>
    </div>
  );
};

export default AllocationTaskCard;
