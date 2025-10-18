import React, { useState, useMemo, useRef } from 'react';
import { TASKS } from '../../constants';
import AllocationTaskCard from '../components/AllocationTaskCard';
import { formatTime } from '../../hooks/useTimer';
import { useDragToScroll } from '../../hooks/useDragToScroll';

interface Allocation {
  tracked: number;
  manual: number;
}

interface TimeAllocationScreenProps {
  totalShiftSeconds: number;
  initialAllocations: Record<number, number>; // This is the auto-tracked time
  onConfirm: () => void;
  onCancel: () => void;
}

const TimeAllocationScreen: React.FC<TimeAllocationScreenProps> = ({
  totalShiftSeconds,
  initialAllocations,
  onConfirm,
  onCancel
}) => {
  const [allocations, setAllocations] = useState<Record<number, Allocation>>(() => {
    return TASKS.reduce((acc, task) => {
      const trackedSeconds = initialAllocations[task.id] || 0;
      // Round to the nearest minute to align with the rounded total shift time
      const trackedMinutes = Math.round(trackedSeconds / 60);
      acc[task.id] = {
        tracked: trackedMinutes * 60, // Store as seconds
        manual: 0,
      };
      return acc;
    }, {} as Record<number, Allocation>);
  });

  const scrollRef = useRef<HTMLDivElement>(null);
  useDragToScroll(scrollRef);

  const totalAllocatedSeconds = useMemo(() => {
    return Object.values(allocations).reduce((sum: number, alloc: Allocation) => {
      return sum + (alloc.tracked || 0) + (alloc.manual || 0);
    }, 0);
  }, [allocations]);

  const remainingSeconds = totalShiftSeconds - totalAllocatedSeconds;
  const isSubmissionDisabled = remainingSeconds !== 0;

  const handleAllocationChange = (taskId: number, type: 'tracked' | 'manual', seconds: number) => {
    setAllocations(prev => ({
      ...prev,
      [taskId]: {
        ...prev[taskId],
        [type]: seconds,
      },
    }));
  };

  const getButtonText = () => {
    if (!isSubmissionDisabled) {
      return 'Send for approval';
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
                      trackedSeconds={allocations[task.id]?.tracked || 0}
                      manualSeconds={allocations[task.id]?.manual || 0}
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