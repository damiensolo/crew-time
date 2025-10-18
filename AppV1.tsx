import React, { useState, useCallback } from 'react';
import TaskTimerScreen from './screens/TaskTimerScreen';
import ProjectListScreen from './screens/ProjectListScreen';
import Header from './components/Header';
import type { Project } from './types';
import TimeAllocationScreen from './screens/TimeAllocationScreen';

interface AppV1Props {
  isGeofenceOverridden: boolean;
  timeMultiplier: number;
  simulatedDistance: number;
}

const AppV1: React.FC<AppV1Props> = ({ isGeofenceOverridden, timeMultiplier, simulatedDistance }) => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [shiftDataForAllocation, setShiftDataForAllocation] = useState<{ totalSeconds: number } | null>(null);

  const handleSelectProject = useCallback((project: Project) => {
    setSelectedProject(project);
  }, []);

  const handleGoBack = useCallback(() => {
    setSelectedProject(null);
  }, []);

  const handleShiftEnd = useCallback((totalSeconds: number) => {
    setShiftDataForAllocation({ totalSeconds });
  }, []);

  const handleAllocationComplete = useCallback(() => {
    setShiftDataForAllocation(null);
  }, []);

  const handleMoreOptions = useCallback(() => {
    // Placeholder for more options functionality
    alert('More options clicked!');
  }, []);

  return (
    <div className="bg-slate-100 h-full flex flex-col font-sans">
      <Header 
        title={selectedProject ? selectedProject.name : 'Projects'}
        showBackButton={!!selectedProject}
        onBack={handleGoBack}
        showMoreOptionsButton={!!selectedProject}
        onMoreOptions={handleMoreOptions}
        version="v1"
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
      </div>

      <div className={`absolute top-0 left-0 w-full h-full bg-white z-50 transition-transform duration-300 ease-in-out ${shiftDataForAllocation ? 'translate-y-0' : 'translate-y-full'}`}>
        {shiftDataForAllocation && (
          <TimeAllocationScreen
            totalShiftSeconds={shiftDataForAllocation.totalSeconds}
            onConfirm={handleAllocationComplete}
            onCancel={handleAllocationComplete}
          />
        )}
      </div>
    </div>
  );
};

export default AppV1;
