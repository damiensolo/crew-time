import React, { useState, useEffect, useCallback, useRef } from 'react';
import TaskList from '../components/TaskList';
import ControlCenter from '../components/ControlCenter';
import { useGeolocation } from '../hooks/useGeolocation';
import { TARGET_LOCATION, GEOFENCE_RADIUS_METERS } from '../constants';
import type { GeolocationState, Project, Location } from '../types';
import { useDragToScroll } from '../hooks/useDragToScroll';

interface TaskTimerScreenProps {
  project: Project;
  isGeofenceOverridden: boolean;
  timeMultiplier: number;
  simulatedDistance: number;
  onShiftEnd: (totalSeconds: number) => void;
}

const TaskTimerScreen: React.FC<TaskTimerScreenProps> = ({ project, isGeofenceOverridden, timeMultiplier, simulatedDistance, onShiftEnd }) => {
  const [isClockedIn, setIsClockedIn] = useState<boolean>(false);
  const [clockInTime, setClockInTime] = useState<Date | null>(null);
  const [simulatedLocation, setSimulatedLocation] = useState<Location | null>(null);
  const scrollRef = useRef<HTMLElement>(null);
  useDragToScroll(scrollRef);
  
  // Calculate a simulated location based on the distance from the testing slider
  useEffect(() => {
    // 1 degree of latitude is approximately 111.1km
    const latitudeOffset = simulatedDistance / 111100;
    
    const newLocation: Location = {
      latitude: TARGET_LOCATION.latitude + latitudeOffset,
      longitude: TARGET_LOCATION.longitude,
    };
    setSimulatedLocation(newLocation);
  }, [simulatedDistance]);

  const locationState: GeolocationState = useGeolocation(TARGET_LOCATION, GEOFENCE_RADIUS_METERS, simulatedLocation);
  const [showGeofenceWarning, setShowGeofenceWarning] = useState<boolean>(false);

  const effectiveIsInside = locationState.isInside || isGeofenceOverridden;

  const handleClockToggle = useCallback(() => {
    if (!effectiveIsInside && !isClockedIn) {
        setShowGeofenceWarning(true);
        setTimeout(() => setShowGeofenceWarning(false), 5000);
        return;
    }

    setIsClockedIn(prev => {
      if (!prev) {
        // Clocking IN
        setClockInTime(new Date());
        return true;
      } else {
        // Clocking OUT
        if (clockInTime) {
          const durationSeconds = Math.floor((new Date().getTime() - clockInTime.getTime()) / 1000);
          const simulatedDuration = durationSeconds * timeMultiplier;
          // Round down to the nearest minute to avoid dealing with seconds in allocation
          const totalMinutes = Math.floor(simulatedDuration / 60);
          onShiftEnd(totalMinutes * 60);
        }
        setClockInTime(null);
        return false;
      }
    });
  }, [effectiveIsInside, isClockedIn, clockInTime, timeMultiplier, onShiftEnd]);

  useEffect(() => {
    // Automatically clock out if user leaves the geofence
    if (isClockedIn && !effectiveIsInside) {
        setIsClockedIn(false);
        setClockInTime(null);
        // Optionally show a notification to the user
        alert("You have been automatically clocked out for leaving the job site.");
    }
  }, [isClockedIn, effectiveIsInside]);

  return (
    <div className="flex flex-col h-full">
      <main ref={scrollRef} className="flex-grow px-4 pt-3 pb-4 space-y-6 overflow-y-auto no-scrollbar">
          
          <ControlCenter
            targetLocation={TARGET_LOCATION}
            radius={GEOFENCE_RADIUS_METERS}
            currentLocation={locationState.currentLocation}
            isInside={locationState.isInside}
            distance={locationState.distance}
            error={locationState.error}
            isGeofenceOverridden={isGeofenceOverridden}
            isClockedIn={isClockedIn}
            clockInTime={clockInTime}
            onClockToggle={handleClockToggle}
            timeMultiplier={timeMultiplier}
            canClockIn={effectiveIsInside}
          />

          {showGeofenceWarning && (
              <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-md" role="alert">
                  <p className="font-bold">Location Warning</p>
                  <p>You must be inside the job site to clock in.</p>
              </div>
          )}
        
        <h2 className="text-slate-800 font-bold text-xl pt-2">Today's tasks</h2>
        <TaskList />
      </main>
    </div>
  );
};

export default TaskTimerScreen;
