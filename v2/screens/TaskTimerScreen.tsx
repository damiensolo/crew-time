import React, { useState, useEffect, useCallback, useRef } from 'react';
import TaskList from '../components/TaskList';
import ControlCenter from '../components/ControlCenter';
import { useGeolocation } from '../../hooks/useGeolocation';
import { TARGET_LOCATION, GEOFENCE_RADIUS_METERS, TASKS } from '../../constants';
import type { GeolocationState, Project, Location } from '../../types';
import { useDragToScroll } from '../../hooks/useDragToScroll';

interface TaskTimerScreenProps {
  project: Project;
  isGeofenceOverridden: boolean;
  timeMultiplier: number;
  simulatedDistance: number;
  onShiftEnd: (data: { totalSeconds: number; finalTaskTimes: Record<number, number> }) => void;
}

const TaskTimerScreen: React.FC<TaskTimerScreenProps> = ({ project, isGeofenceOverridden, timeMultiplier, simulatedDistance, onShiftEnd }) => {
  const [isClockedIn, setIsClockedIn] = useState<boolean>(false);
  const [clockInTime, setClockInTime] = useState<Date | null>(null);
  const [simulatedLocation, setSimulatedLocation] = useState<Location | null>(null);
  const scrollRef = useRef<HTMLElement>(null);
  useDragToScroll(scrollRef);
  
  const [taskTimers, setTaskTimers] = useState<Record<number, number>>(() => 
    TASKS.reduce((acc, task) => ({ ...acc, [task.id]: 0 }), {})
  );
  const [activeTask, setActiveTask] = useState<{ id: number; startTime: number } | null>(null);
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    if (activeTask && isClockedIn) {
      const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
      return () => clearInterval(timer);
    }
  }, [activeTask, isClockedIn]);
  
  const locationState: GeolocationState = useGeolocation(TARGET_LOCATION, GEOFENCE_RADIUS_METERS, simulatedLocation);
  const [showGeofenceWarning, setShowGeofenceWarning] = useState<boolean>(false);
  const effectiveIsInside = locationState.isInside || isGeofenceOverridden;

  const handleTaskTimerToggle = useCallback((taskId: number) => {
    if (!isClockedIn) return;

    setTaskTimers(prevTimers => {
      let updatedTimers = { ...prevTimers };
      let newActiveTask = null;

      if (activeTask) {
        const elapsed = (Date.now() - activeTask.startTime) * timeMultiplier;
        updatedTimers[activeTask.id] += Math.round(elapsed / 1000);
      }
      
      if (activeTask?.id !== taskId) {
        newActiveTask = { id: taskId, startTime: Date.now() };
      }

      setActiveTask(newActiveTask);
      return updatedTimers;
    });
  }, [isClockedIn, activeTask, timeMultiplier]);


  const handleClockToggle = useCallback(() => {
    if (!effectiveIsInside && !isClockedIn) {
        setShowGeofenceWarning(true);
        setTimeout(() => setShowGeofenceWarning(false), 3000);
        return;
    }

    setIsClockedIn(prevIsClockedIn => {
      // Clocking OUT
      if (prevIsClockedIn) {
        let finalTaskTimes = { ...taskTimers };
        if (activeTask) {
          const elapsed = (Date.now() - activeTask.startTime) * timeMultiplier;
          finalTaskTimes[activeTask.id] += Math.round(elapsed / 1000);
        }

        const totalShiftSeconds = clockInTime
          ? Math.floor(((new Date().getTime() - clockInTime.getTime()) / 1000) * timeMultiplier)
          : 0;

        // Round to the nearest minute for allocation.
        const totalMinutes = Math.round(totalShiftSeconds / 60);
        const roundedTotalSeconds = totalMinutes * 60;

        onShiftEnd({ totalSeconds: roundedTotalSeconds, finalTaskTimes });
        
        // Reset state
        setClockInTime(null);
        setActiveTask(null);
        setTaskTimers(TASKS.reduce((acc, task) => ({ ...acc, [task.id]: 0 }), {}));
        return false;
      } 
      // Clocking IN
      else {
        setClockInTime(new Date());
        return true;
      }
    });
  }, [effectiveIsInside, activeTask, taskTimers, timeMultiplier, onShiftEnd, clockInTime]);

  useEffect(() => {
    const latitudeOffset = simulatedDistance / 111100;
    setSimulatedLocation({
      latitude: TARGET_LOCATION.latitude + latitudeOffset,
      longitude: TARGET_LOCATION.longitude,
    });
  }, [simulatedDistance]);

  return (
    <div className="flex flex-col h-full">
      <main ref={scrollRef} className="flex-grow px-4 pt-3 pb-4 space-y-6 overflow-y-auto no-scrollbar">
          <ControlCenter
            locationState={locationState}
            radius={GEOFENCE_RADIUS_METERS}
            isGeofenceOverridden={isGeofenceOverridden}
            isClockedIn={isClockedIn}
            clockInTime={clockInTime}
            timeMultiplier={timeMultiplier}
            onClockToggle={handleClockToggle}
            canClockIn={effectiveIsInside}
          />

          {showGeofenceWarning && (
              <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-md animate-fadeIn" role="alert">
                  <p>You must be inside the job site to clock in.</p>
              </div>
          )}
        
        <h2 className="text-slate-800 font-bold text-xl pt-2">Today's tasks</h2>
        <TaskList 
          isClockedIn={isClockedIn}
          activeTaskId={activeTask?.id || null}
          taskTimers={taskTimers}
          onTaskTimerToggle={handleTaskTimerToggle}
          currentTime={currentTime}
          activeTaskStartTime={activeTask?.startTime || null}
          timeMultiplier={timeMultiplier}
        />
      </main>
    </div>
  );
};

export default TaskTimerScreen;