import React, { useState } from 'react';
import type { Task } from '../../types';
import { formatTime } from '../../hooks/useTimer';
import { ChatBubbleIcon, ChevronDownIcon } from '../../components/icons';

interface TimeInputProps {
  label: string;
  totalSeconds: number;
  onTimeChange: (newHours: number, newMinutes: number) => void;
}

const TimeInput: React.FC<TimeInputProps> = ({ label, totalSeconds, onTimeChange }) => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  const handleHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newHours = parseInt(e.target.value, 10);
    if (isNaN(newHours) || newHours < 0) newHours = 0;
    onTimeChange(newHours, minutes);
  };

  const handleMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newMinutes = parseInt(e.target.value, 10);
    if (isNaN(newMinutes) || newMinutes < 0) {
        newMinutes = 0;
    } else if (newMinutes > 59) {
        newMinutes = 59;
    }
    onTimeChange(hours, newMinutes);
  };

  return (
    <div className="flex items-center justify-between">
      <label className="text-sm font-medium text-slate-600">{label}</label>
      <div className="flex items-center space-x-2">
        <div className="relative">
          <input
            type="number"
            value={hours.toString()}
            onChange={handleHoursChange}
            min="0"
            className="w-16 h-10 text-center bg-white border border-slate-300 rounded-md font-mono text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
          className="w-16 h-10 text-center bg-white border border-slate-300 rounded-md font-mono text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          aria-label={`${label} minutes`}
        />
      </div>
    </div>
  );
};


interface AllocationTaskCardProps {
  task: Task;
  originalTrackedSeconds: number;
  trackedSeconds: number;
  manualSeconds: number;
  onAllocationChange: (taskId: number, type: 'tracked' | 'manual', seconds: number) => void;
  totalShiftSeconds: number;
}

const AllocationTaskCard: React.FC<AllocationTaskCardProps> = ({
  task,
  originalTrackedSeconds,
  trackedSeconds,
  manualSeconds,
  onAllocationChange,
  totalShiftSeconds,
}) => {
  const [isNoteExpanded, setIsNoteExpanded] = useState(false);
  const [note, setNote] = useState('');
  
  const handleTimeChange = (type: 'tracked' | 'manual', newHours: number, newMinutes: number) => {
    const totalSeconds = (newHours * 3600) + (newMinutes * 60);
    onAllocationChange(task.id, type, totalSeconds);
  };

  const totalTaskSeconds = trackedSeconds + manualSeconds;
  
  // Percentages for the visual allocation bar, relative to the total shift duration
  const trackedPct = (trackedSeconds / totalShiftSeconds) * 100;
  const manualPct = (manualSeconds / totalShiftSeconds) * 100;
  const originalMarkerPct = (originalTrackedSeconds / totalShiftSeconds) * 100;

  return (
    <div className="bg-slate-50 rounded-lg p-4 flex flex-col space-y-3 transition-shadow hover:shadow-sm border border-slate-200/80">
      <div className="flex items-start justify-between">
        <h3 className="font-semibold text-slate-800 text-base leading-tight pr-4">{task.name}</h3>
        <div className="text-right flex-shrink-0">
          <p className="font-mono text-lg font-semibold text-slate-700">{formatTime(totalTaskSeconds)}</p>
          <p className="text-xs text-slate-500 -mt-1">total</p>
        </div>
      </div>
      
      {/* Visual Allocation Bar */}
      <div className="relative w-full h-4 bg-slate-200 rounded-full my-2" aria-hidden="true">
        <div
          style={{ width: `${trackedPct}%` }}
          className="absolute h-full bg-indigo-500 rounded-l-full transition-all duration-200"
        />
        <div
          style={{ left: `${trackedPct}%`, width: `${manualPct}%` }}
          className="absolute h-full bg-yellow-400 transition-all duration-200"
        />
        <div
          style={{ left: `${originalMarkerPct}%` }}
          className="absolute top-1/2 -translate-y-1/2 h-5 w-0.5 bg-slate-700 rounded-full"
          title={`Original tracked time: ${formatTime(originalTrackedSeconds)}`}
        />
      </div>

      <div className="space-y-2 pt-1">
        <TimeInput
          label="Tracked Time"
          totalSeconds={trackedSeconds}
          onTimeChange={(h, m) => handleTimeChange('tracked', h, m)}
        />
        <TimeInput
          label="Manual Time"
          totalSeconds={manualSeconds}
          onTimeChange={(h, m) => handleTimeChange('manual', h, m)}
        />
      </div>

      {(manualSeconds > 0 || trackedSeconds < originalTrackedSeconds) && (
        <>
          <hr className="!mt-4 border-slate-200" />
          <div className="flex flex-col items-start !mt-3">
            <button
              onClick={() => setIsNoteExpanded(!isNoteExpanded)}
              className="flex items-center space-x-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-800"
            >
              <ChatBubbleIcon className="w-4 h-4" />
              <span>+ Add Note</span>
              <ChevronDownIcon className={`w-4 h-4 transition-transform duration-200 ${isNoteExpanded ? 'rotate-180' : ''}`} />
            </button>
            <div className={`w-full overflow-hidden transition-all duration-300 ease-in-out ${isNoteExpanded ? 'max-h-40 mt-2' : 'max-h-0'}`}>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add reason for time adjustment..."
                className="w-full h-24 p-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AllocationTaskCard;