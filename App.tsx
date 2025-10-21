import React, { useState } from 'react';
import TestingToolsPanel from './components/TestingToolsPanel';
import AppV1 from './AppV1';
import AppV2 from './AppV2';
import AppV3 from './AppV3';
import SplashScreen from './components/SplashScreen';

type AppVersion = 'v1' | 'v2' | 'v3';

const App: React.FC = () => {
  const [appVersion, setAppVersion] = useState<AppVersion>('v3');
  const [showSplash, setShowSplash] = useState(true);
  
  // State for testing tools, passed down to the active app version
  const [isGeofenceOverridden, setIsGeofenceOverridden] = useState<boolean>(false);
  const [timeMultiplier, setTimeMultiplier] = useState(1);
  const [simulatedDistance, setSimulatedDistance] = useState<number>(1000); // Start outside at max distance

  const appProps = {
    isGeofenceOverridden,
    timeMultiplier,
    simulatedDistance,
  };

  const renderAppVersion = () => {
    switch(appVersion) {
      case 'v1':
        return <AppV1 {...appProps} />;
      case 'v2':
        return <AppV2 {...appProps} />;
      case 'v3':
        return <AppV3 {...appProps} />;
      default:
        return <AppV1 {...appProps} />;
    }
  }

  return (
    <>
      {showSplash && <SplashScreen onFinished={() => setShowSplash(false)} />}
      
      <div className={`h-full flex flex-col ${showSplash ? 'opacity-0' : 'opacity-500 transition-opacity duration-100'}`}>
        {renderAppVersion()}
        
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
      </div>
    </>
  );
};

export default App;