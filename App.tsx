import React, { useState } from 'react';
import TestingToolsPanel from './components/TestingToolsPanel';
import AppV1 from './AppV1';
import AppV2 from './AppV2';

type AppVersion = 'v1' | 'v2';

const App: React.FC = () => {
  const [appVersion, setAppVersion] = useState<AppVersion>('v1');
  
  // State for testing tools, passed down to the active app version
  const [isGeofenceOverridden, setIsGeofenceOverridden] = useState<boolean>(false);
  const [timeMultiplier, setTimeMultiplier] = useState(1);
  const [simulatedDistance, setSimulatedDistance] = useState<number>(1000); // Start outside at max distance

  const appProps = {
    isGeofenceOverridden,
    timeMultiplier,
    simulatedDistance,
  };

  return (
    <>
      {appVersion === 'v1' ? <AppV1 {...appProps} /> : <AppV2 {...appProps} />}
      
      <TestingToolsPanel 
        isGeofenceOverridden={isGeofenceOverridden}
        onGeofenceOverrideToggle={() => setIsGeofenceOverridden(prev => !prev)}
        simulatedDistance={simulatedDistance}
        onSimulatedDistanceChange={setSimulatedDistance}
        timeMultiplier={timeMultiplier}
        onTimeMultiplierChange={setTimeMultiplier}
        currentVersion={appVersion}
        onVersionChange={setAppVersion}
      />
    </>
  );
};

export default App;