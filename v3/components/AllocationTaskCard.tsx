import React, { useRef, useState, useCallback } from 'react';
import type { Task } from '../../types';
import { formatTime } from '../../hooks/useTimer';
import { ChatBubbleIcon, ChevronDownIcon } from '../../components/icons';

interface AllocationTaskCardProps {
  task: Task;
  trackedSeconds: number;
  manualSeconds: number;
  onAllocationChange: (taskId: number, seconds: number) => void;
  maxManualSeconds: number;
  totalShiftSeconds: number;
}

const AllocationTaskCard: React.FC<AllocationTaskCardProps> = ({
  task,
  trackedSeconds,
  manualSeconds,
  onAllocationChange,
  maxManualSeconds,
  totalShiftSeconds
}) => {
  const sliderRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const [isNoteExpanded, setIsNoteExpanded] = useState(false);
  const [note, setNote] = useState('');

  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (!isDraggingRef.current || !sliderRef.current) return;
    
    const rect = sliderRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    
    const totalPixels = rect.width;
    const pixelsForTracked = (trackedSeconds / totalShiftSeconds) * totalPixels;

    // Calculate manual time based on pixels, ensuring it doesn't go below zero
    const manualPixels = Math.max(0, x - pixelsForTracked);
    let newManualSeconds = (manualPixels / totalPixels) * totalShiftSeconds;
    
    // Clamp the value to the max allowed manual seconds for this task
    newManualSeconds = Math.min(newManualSeconds, maxManualSeconds);
    
    // Round to the nearest minute (60 seconds)
    const newManualRounded = Math.round(newManualSeconds / 60) * 60;
    
    if (newManualRounded !== manualSeconds) {
      onAllocationChange(task.id, newManualRounded);
    }
  }, [trackedSeconds, totalShiftSeconds, maxManualSeconds, manualSeconds, onAllocationChange, task.id]);
  
  const handleMouseUp = useCallback(() => {
    isDraggingRef.current = false;
    document.body.style.cursor = 'default';
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
  }, [handleMouseMove]);
  
  const handleMouseDown = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    isDraggingRef.current = true;
    document.body.style.cursor = 'grabbing';
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    // Trigger first move immediately
    handleMouseMove(event.nativeEvent);
  }, [handleMouseMove, handleMouseUp]);

  const trackedPercentage = (trackedSeconds / totalShiftSeconds) * 100;
  const manualPercentage = (manualSeconds / totalShiftSeconds) * 100;
  const totalPercentage = trackedPercentage + manualPercentage;

  return (
    <div className="bg-slate-50 rounded-lg p-4 flex flex-col space-y-3 transition-shadow hover:shadow-sm border border-slate-200/80">
      <h3 className="font-semibold text-slate-800 text-base truncate">{task.name}</h3>

      <div
        ref={sliderRef}
        onMouseDown={handleMouseDown}
        className="relative w-full h-6 bg-slate-200 rounded-full cursor-pointer"
        role="slider"
        aria-valuemin={0}
        aria-valuemax={maxManualSeconds}
        aria-valuenow={manualSeconds}
        aria-label={`Allocate manual time for ${task.name}`}
      >
        {/* Tracked Time Bar */}
        <div
          style={{ width: `${trackedPercentage}%` }}
          className="absolute h-full bg-indigo-500 rounded-l-full"
        />
        {/* Manual Time Bar */}
        <div
          style={{ left: `${trackedPercentage}%`, width: `${manualPercentage}%` }}
          className="absolute h-full bg-yellow-400"
        />
        {/* Handle */}
        <div
          style={{ left: `${totalPercentage}%` }}
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-8 bg-white rounded-sm shadow-md border-2 border-slate-400 cursor-grabbing"
        />
      </div>

      <div className="grid grid-cols-3 divide-x divide-slate-200 text-center text-sm font-medium">
        <div className="pr-2">
          <p className="text-xs text-slate-500">Tracked</p>
          <p className="text-slate-700 font-semibold">{formatTime(trackedSeconds)}</p>
        </div>
        <div className="px-2">
          <p className="text-xs text-slate-500">Manual</p>
          <p className="text-slate-700 font-semibold">{formatTime(manualSeconds)}</p>
        </div>
        <div className="pl-2">
          <p className="text-xs text-slate-500">Total</p>
          <p className="text-slate-700 font-semibold">{formatTime(trackedSeconds + manualSeconds)}</p>
        </div>
      </div>
      
      {manualSeconds > 0 && (
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
                        placeholder="Add reason for untracked time..."
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