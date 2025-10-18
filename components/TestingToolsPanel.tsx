import React from 'react';

interface TestingToolsPanelProps {
  isGeofenceOverridden: boolean;
  onGeofenceOverrideToggle: () => void;
  simulatedDistance: number;
  onSimulatedDistanceChange: (distance: number) => void;
  timeMultiplier: number;
  onTimeMultiplierChange: (speed: number) => void;
}

const TestingToolsPanel: React.FC<TestingToolsPanelProps> = ({
  isGeofenceOverridden,
  onGeofenceOverrideToggle,
  simulatedDistance,
  onSimulatedDistanceChange,
  timeMultiplier,
  onTimeMultiplierChange,
}) => {
  return (
    <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-xl p-4 z-50 max-w-xs w-full space-y-4">
      <div className="text-center">
        <h3 className="text-sm font-bold text-slate-600 tracking-wider uppercase">Testing Tools</h3>
      </div>
      
      <hr/>

      <div>
          <h4 className="text-sm font-semibold text-slate-700 text-center">Geofence Override</h4>
          <div className="flex items-center justify-center space-x-2 mt-3">
              <label htmlFor="geofence-toggle" className="text-sm text-gray-600 font-medium">Status: {isGeofenceOverridden ? 'Active' : 'Inactive'}</label>
              <button
                  id="geofence-toggle"
                  onClick={onGeofenceOverrideToggle}
                  className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 ${isGeofenceOverridden ? 'bg-green-500' : 'bg-gray-300'}`}
                  aria-pressed={isGeofenceOverridden}
                  aria-label="Override Geofence"
              >
                  <span
                      aria-hidden="true"
                      className={`inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${isGeofenceOverridden ? 'translate-x-5' : 'translate-x-0'}`}
                  />
              </button>
          </div>
      </div>

      <hr/>

      <div className="text-center">
          <h4 className="text-sm font-semibold text-slate-700">Location Simulator</h4>
           <p className="text-xs text-slate-500 mt-1 mb-3">Drag to change distance from job site</p>
          <input
              type="range"
              min="0"
              max="1000"
              step="10"
              value={simulatedDistance}
              onChange={(e) => onSimulatedDistanceChange(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              aria-label="Simulate location distance"
          />
          <p className="text-sm font-medium text-slate-600 mt-2">{simulatedDistance}m from job site</p>
      </div>
      
      <hr/>
      
      <div className="text-center">
        <h4 className="text-sm font-semibold text-slate-700">Time Simulator</h4>
        <p className="text-xs text-slate-500 mt-1 mb-3">Speed up time for testing</p>
        <div className="flex justify-center space-x-2">
          {[1, 10, 100, 1000].map(speed => (
            <button
              key={speed}
              onClick={() => onTimeMultiplierChange(speed)}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
                timeMultiplier === speed
                  ? 'bg-slate-700 text-white'
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              }`}
            >
              {speed}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TestingToolsPanel;
