import React, { useState, useCallback } from 'react';
import TaskTimerScreen from './v4/screens/TaskTimerScreen';
import ProjectListScreen from './v4/screens/ProjectListScreen';
import Header from './components/Header';
import type { Project } from './types';
import TimeAllocationScreen from './v4/screens/TimeAllocationScreen';

interface AppV4Props {
  isGeofenceOverridden: boolean;
  timeMultiplier: number;
  simulatedDistance: number;
}

const AppV4: React.FC<AppV4Props> = ({ isGeofenceOverridden, timeMultiplier, simulatedDistance }) => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [shiftDataForAllocation, setShiftDataForAllocation] = useState<{ 
    totalSeconds: number;
    initialAllocations: Record<number, number>;
  } | null>(null);

  const handleSelectProject = useCallback((project: Project) => {
    setSelectedProject(project);
  }, []);

  const handleGoBack = useCallback(() => {
    setSelectedProject(null);
  }, []);

  const handleShiftEnd = useCallback((data: { totalSeconds: number; finalTaskTimes: Record<number, number> }) => {
    setShiftDataForAllocation({ 
      totalSeconds: data.totalSeconds, 
      initialAllocations: data.finalTaskTimes 
    });
  }, []);

  const handleAllocationComplete = useCallback(() => {
    setShiftDataForAllocation(null);
  }, []);

  const handleMoreOptions = useCallback(() => {
    // Placeholder for more options functionality
    alert('More options clicked! (V4)');
  }, []);

  return (
    <div className="bg-slate-100 h-full flex flex-col font-sans">
      <Header 
        title={shiftDataForAllocation ? 'Shift Details' : (selectedProject ? selectedProject.name : 'Projects')}
        showBackButton={!!selectedProject || !!shiftDataForAllocation}
        onBack={shiftDataForAllocation ? handleAllocationComplete : handleGoBack}
        showMoreOptionsButton={!!selectedProject && !shiftDataForAllocation}
        onMoreOptions={handleMoreOptions}
        version="v4"
      />

      <div className="relative flex-1 overflow-hidden">
        <div 
          className={`absolute top-0 left-0 w-full h-full transition-transform duration-300 ease-in-out ${selectedProject ? '-translate-x-full' : 'translate-x-0'}`}
        >
            <ProjectListScreen onSelectProject={handleSelectProject} />
        </div>
        
        <div 
          className={`absolute top-0 left-0 w-full h-full transition-transform duration-300 ease-in-out ${selectedProject ? 'translate-x-0' : 'translate-x-full'}`}
        >
          {selectedProject && (
            <TaskTimerScreen 
              project={selectedProject} 
              isGeofenceOverridden={isGeofenceOverridden}
              timeMultiplier={timeMultiplier}
              simulatedDistance={simulatedDistance}
              onShiftEnd={handleShiftEnd}
            />
          )}
        </div>

        <div className={`absolute inset-0 bg-white z-30 transition-transform duration-300 ease-in-out ${shiftDataForAllocation ? 'translate-y-0' : 'translate-y-full'}`}>
          {shiftDataForAllocation && (
            <TimeAllocationScreen
              totalShiftSeconds={shiftDataForAllocation.totalSeconds}
              initialAllocations={shiftDataForAllocation.initialAllocations}
              onConfirm={handleAllocationComplete}
              onCancel={handleAllocationComplete}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AppV4;