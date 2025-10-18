import React, { useState, useMemo } from 'react';
import { TASKS } from '../constants';
import AllocationTaskCard from '../components/AllocationTaskCard';
import { formatTime } from '../hooks/useTimer';
import { useDragToScroll } from '../hooks/useDragToScroll';
import { useRef } from 'react';

interface TimeAllocationScreenProps {
  totalShiftSeconds: number;
  onConfirm: () => void;
  onCancel: () => void;
}

const TimeAllocationScreen: React.FC<TimeAllocationScreenProps> = ({
  totalShiftSeconds,
  onConfirm,
  onCancel
}) => {
  const [allocations, setAllocations] = useState<Record<number, number>>({});
  const scrollRef = useRef<HTMLDivElement>(null);
  useDragToScroll(scrollRef);

  const totalAllocatedSeconds = useMemo(() => {
    // FIX: Operator '+' cannot be applied to types 'unknown' and 'unknown'. Explicitly type the accumulator and value.
    return Object.values(allocations).reduce((sum: number, seconds: number) => sum + (seconds || 0), 0);
  }, [allocations]);

  const remainingSeconds = totalShiftSeconds - totalAllocatedSeconds;
  const isSubmissionDisabled = remainingSeconds !== 0;

  const handleAllocationChange = (taskId: number, seconds: number) => {
    setAllocations(prev => ({
      ...prev,
      [taskId]: seconds,
    }));
  };
  
  const getButtonText = () => {
    if (!isSubmissionDisabled) {
      return 'Confirm Allocation';
    }
    if (remainingSeconds > 0) {
      return `Allocate remaining ${formatTime(remainingSeconds)}`;
    }
    // remainingSeconds is negative (overallocated)
    return `Overallocated by ${formatTime(Math.abs(remainingSeconds))}`;
  };

  return (
    <div className="flex flex-col h-full bg-slate-100">
      <header className="bg-slate-800 text-slate-100 p-4 flex items-center justify-center relative h-[60px] flex-shrink-0">
        <h1 className="text-lg font-bold">Shift Details</h1>
        <button onClick={onCancel} className="absolute right-4 text-sm font-semibold">Cancel</button>
      </header>

      <main className="flex-grow flex flex-col p-4 space-y-4 overflow-hidden">
        <div className="bg-white rounded-xl shadow p-4 grid grid-cols-3 divide-x divide-slate-200 text-center">
            <div>
                <p className="text-xs font-bold text-slate-500 tracking-wider uppercase">Total Shift</p>
                <p className="text-2xl font-semibold text-slate-800 tracking-tight mt-1">{formatTime(totalShiftSeconds)}</p>
            </div>
            <div>
                <p className="text-xs font-bold text-slate-500 tracking-wider uppercase">Allocated</p>
                <p className="text-2xl font-semibold text-slate-800 tracking-tight mt-1">{formatTime(totalAllocatedSeconds)}</p>
            </div>
            <div>
                <p className="text-xs font-bold text-slate-500 tracking-wider uppercase">Remaining</p>
                <p className={`text-2xl font-semibold tracking-tight mt-1 ${remainingSeconds === 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {formatTime(Math.max(0, remainingSeconds))}
                </p>
            </div>
        </div>
        
        <div ref={scrollRef} className="flex-grow bg-white rounded-xl shadow p-2 overflow-y-auto no-scrollbar">
            <div className="space-y-2">
                {TASKS.map(task => (
                    <AllocationTaskCard
                    key={task.id}
                    task={task}
                    allocatedSeconds={allocations[task.id] || 0}
                    onAllocationChange={handleAllocationChange}
                    />
                ))}
            </div>
        </div>

      </main>

      <footer className="p-4 bg-white/75 backdrop-blur-xl border-t border-slate-200 flex-shrink-0">
        <button
          onClick={onConfirm}
          disabled={isSubmissionDisabled}
          className={`w-full py-4 text-white font-bold rounded-lg transition-colors text-lg ${
            isSubmissionDisabled
              ? 'bg-slate-400 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          {getButtonText()}
        </button>
      </footer>
    </div>
  );
};

export default TimeAllocationScreen;