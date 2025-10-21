import React, { useState, useMemo } from 'react';
import type { Task } from '../../types';
import { formatTime } from '../../hooks/useTimer';
import { ChatBubbleIcon, ChevronDownIcon } from '../../components/icons';

interface AllocationTaskCardProps {
  task: Task;
  originalTrackedSeconds: number;
  allocatedSeconds: number;
  onAllocationChange: (taskId: number, seconds: number) => void;
  totalShiftSeconds: number;
}

const AllocationTaskCard: React.FC<AllocationTaskCardProps> = ({
  task,
  originalTrackedSeconds,
  allocatedSeconds,
  onAllocationChange,
  totalShiftSeconds,
}) => {
  const [isNoteExpanded, setIsNoteExpanded] = useState(false);
  const [note, setNote] = useState('');
  
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onAllocationChange(task.id, parseInt(e.target.value, 10));
  };
  
  const {
    trackedTime,
    untrackedTime,
    allocatedPct,
    trackedPct,
    untrackedPct,
    originalMarkerPct
  } = useMemo(() => {
    const tracked = Math.min(allocatedSeconds, originalTrackedSeconds);
    const untracked = Math.max(0, allocatedSeconds - originalTrackedSeconds);
    
    const toPct = (val: number) => totalShiftSeconds > 0 ? (val / totalShiftSeconds) * 100 : 0;

    return {
      trackedTime: tracked,
      untrackedTime: untracked,
      allocatedPct: toPct(allocatedSeconds),
      trackedPct: toPct(tracked),
      untrackedPct: toPct(untracked),
      originalMarkerPct: toPct(originalTrackedSeconds),
    }
  }, [allocatedSeconds, originalTrackedSeconds, totalShiftSeconds]);


  return (
    <div className="bg-slate-50 rounded-lg p-4 flex flex-col space-y-4 transition-shadow hover:shadow-sm border border-slate-200/80">
      <h3 className="font-semibold text-slate-800 text-base leading-tight">{task.name}</h3>
      
      {/* Unified Smart Slider */}
      <div className="pt-2">
        <div className="relative h-8 flex items-center group">
          {/* Floating Time Readout */}
          <div 
            className="absolute -top-6 bg-slate-800 text-white text-xs font-bold px-2 py-1 rounded-md transition-opacity duration-150 opacity-0 group-hover:opacity-100 group-active:opacity-100"
            style={{ 
              left: `${allocatedPct}%`,
              transform: `translateX(-50%)`,
            }}
          >
            {formatTime(allocatedSeconds)}
          </div>
          
          {/* Visual Track */}
          <div className="absolute w-full h-3 bg-slate-200 rounded-full top-1/2 -translate-y-1/2" />
          <div style={{ width: `${trackedPct}%`}} className="absolute h-3 bg-indigo-500 rounded-l-full transition-all duration-100 top-1/2 -translate-y-1/2" />
          <div style={{ left: `${originalMarkerPct}%`, width: `${untrackedPct}%`}} className="absolute h-3 bg-amber-400 transition-all duration-100 top-1/2 -translate-y-1/2" />
          <div style={{ left: `${originalMarkerPct}%`}} title={`Original tracked time: ${formatTime(originalTrackedSeconds)}`} className="absolute top-1/2 -translate-y-1/2 h-5 w-1 bg-slate-700 rounded-full" />
          
          {/* Actual Slider Input */}
          <input
            type="range"
            min="0"
            max={totalShiftSeconds}
            value={allocatedSeconds}
            step={60}
            onChange={handleSliderChange}
            className="absolute w-full h-3 top-1/2 -translate-y-1/2 appearance-none bg-transparent cursor-pointer group-focus-within:outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:ring-2 [&::-webkit-slider-thumb]:ring-indigo-600 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:ring-2 [&::-moz-range-thumb]:ring-indigo-600"
          />
        </div>

        {/* Time Breakdown Labels */}
        <div className="flex justify-between items-center text-xs font-medium text-slate-500 mt-2 px-1">
          <span>
            <span className="font-bold text-indigo-600">Tracked:</span> {formatTime(trackedTime)}
          </span>
          {untrackedTime > 0 && (
            <span className="transition-opacity duration-300">
              <span className="font-bold text-amber-600">Untracked:</span> {formatTime(untrackedTime)}
            </span>
          )}
        </div>
      </div>

      {/* Note Section */}
      {(untrackedTime > 0 || allocatedSeconds < originalTrackedSeconds) && (
        <>
          <hr className="!mt-3 border-slate-200" />
          <div className="flex flex-col items-start !mt-2">
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