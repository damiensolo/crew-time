import React, { useState, useMemo, useRef } from 'react';
import { TASKS } from '../constants';
import AllocationTaskCard from '../components/AllocationTaskCard';
import { formatTime } from '../hooks/useTimer';
import { useDragToScroll } from '../hooks/useDragToScroll';

interface TimeAllocationScreenProps {
  totalShiftSeconds: number;
  onConfirm: () => void;
  onCancel: () => void;
}

const TOTAL_SHIFT_GOAL_SECONDS = 8 * 60 * 60; // 8 hours

const TimeAllocationScreen: React.FC<TimeAllocationScreenProps> = ({
  totalShiftSeconds,
  onConfirm,
  onCancel
}) => {
  const [trackedAllocations, setTrackedAllocations] = useState<Record<number, number>>({});
  const [manualAllocations, setManualAllocations] = useState<Record<number, number>>({});
  const [isConfirming, setIsConfirming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  useDragToScroll(scrollRef);

  const totalAllocatedSeconds = useMemo(() => {
    // Fix: Explicitly type the accumulator (sum) and value (seconds) in the `reduce` callback to resolve a type inference issue.
    const tracked = Object.values(trackedAllocations).reduce((sum: number, seconds: number) => sum + (seconds || 0), 0);
    const manual = Object.values(manualAllocations).reduce((sum: number, seconds: number) => sum + (seconds || 0), 0);
    return tracked + manual;
  }, [trackedAllocations, manualAllocations]);

  const remainingSeconds = totalShiftSeconds - totalAllocatedSeconds;
  const isAllocationComplete = remainingSeconds === 0;

  const handleTrackedAllocationChange = (taskId: number, seconds: number) => {
    setTrackedAllocations(prev => ({
      ...prev,
      [taskId]: seconds,
    }));
  };

  const handleManualAllocationChange = (taskId: number, seconds: number) => {
    setManualAllocations(prev => ({
      ...prev,
      [taskId]: seconds,
    }));
  };

  const handleConfirmClick = () => {
    if (!isAllocationComplete) return;

    if (totalShiftSeconds < TOTAL_SHIFT_GOAL_SECONDS) {
      setIsConfirming(true);
    } else {
      onConfirm();
    }
  };
  
  const handleProceedWithUnderAllocation = () => {
    onConfirm();
    setIsConfirming(false);
  };

  const handleCancelConfirmation = () => {
    setIsConfirming(false);
  };
  
  const getButtonText = () => {
    if (!isAllocationComplete) {
      if (remainingSeconds > 0) {
        return `Allocate remaining ${formatTime(remainingSeconds)}`;
      }
      return `Overallocated by ${formatTime(Math.abs(remainingSeconds))}`;
    }
    return 'Confirm Allocation';
  };

  const getButtonClasses = () => {
    if (!isAllocationComplete) {
      return 'bg-slate-400 cursor-not-allowed';
    }
    if (totalShiftSeconds < TOTAL_SHIFT_GOAL_SECONDS) {
      return 'bg-orange-500 hover:bg-orange-600'; // Warning state
    }
    return 'bg-green-600 hover:bg-green-700'; // Success state
  };

  return (
    <div className="flex flex-col h-full bg-slate-100">
      <main className="flex-grow flex flex-col p-4 space-y-4 overflow-hidden">
        <div className="bg-white rounded-xl shadow p-4 grid grid-cols-3 divide-x divide-slate-200 text-center">
            <div>
                <p className="text-xs font-bold text-slate-500 tracking-wider uppercase">Tracked</p>
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
            <div className="space-y-3 p-1">
                {TASKS.map(task => (
                    <AllocationTaskCard
                      key={task.id}
                      task={task}
                      trackedSeconds={trackedAllocations[task.id] || 0}
                      onTrackedChange={handleTrackedAllocationChange}
                      manualSeconds={manualAllocations[task.id] || 0}
                      onManualChange={handleManualAllocationChange}
                    />
                ))}
            </div>
        </div>

      </main>

      <footer className="p-4 bg-white/75 backdrop-blur-xl border-t border-slate-200 flex-shrink-0">
        <button
          onClick={handleConfirmClick}
          disabled={!isAllocationComplete}
          className={`w-full py-4 text-white font-bold rounded-lg transition-colors text-lg ${getButtonClasses()}`}
        >
          {getButtonText()}
        </button>
      </footer>

      {isConfirming && (
        <div className="absolute inset-0 bg-black/40 z-30 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm text-center space-y-4">
            <h2 className="text-lg font-bold text-slate-800">Confirm Submission</h2>
            <p className="text-sm text-slate-600">
              Your total shift time ({formatTime(totalShiftSeconds)}) is less than the standard 8-hour shift.
            </p>
            <p className="text-sm text-slate-600 font-medium">Are you sure you want to submit?</p>
            <div className="flex justify-center space-x-3 !mt-6">
              <button
                onClick={handleCancelConfirmation}
                className="px-6 py-2 rounded-lg bg-slate-200 text-slate-700 font-semibold hover:bg-slate-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleProceedWithUnderAllocation}
                className="px-6 py-2 rounded-lg bg-orange-500 text-white font-semibold hover:bg-orange-600 transition-colors"
              >
                Proceed Anyway
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeAllocationScreen;