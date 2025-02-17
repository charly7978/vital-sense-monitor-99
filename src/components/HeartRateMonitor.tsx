
import React, { useState } from 'react';
import { Settings, ArrowRight } from 'lucide-react';
import CameraView from './CameraView';
import VitalChart from './VitalChart';
import VitalSignsDisplay from './vitals/VitalSignsDisplay';
import SignalQualityIndicator from './vitals/SignalQualityIndicator';
import MeasurementControls from './vitals/MeasurementControls';
import CalibrationPanel from './CalibrationPanel';
import { useVitals } from '@/contexts/VitalsContext';
import { Button } from "@/components/ui/button";

interface HeartRateMonitorProps {
  onShowControls: () => void;
}

const HeartRateMonitor: React.FC<HeartRateMonitorProps> = ({ onShowControls }) => {
  const [currentView, setCurrentView] = useState<'monitor' | 'calibration'>('monitor');
  const { 
    bpm, 
    spo2, 
    systolic, 
    diastolic, 
    hasArrhythmia, 
    arrhythmiaType,
    readings,
    isStarted,
    measurementProgress,
    measurementQuality,
    toggleMeasurement,
    processFrame,
    sensitivitySettings,
    updateSensitivitySettings
  } = useVitals();

  const showFingerIndicator = isStarted && measurementQuality < 0.2;

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      <button 
        onClick={onShowControls}
        className="absolute top-3 right-3 z-30 p-2 rounded-full bg-black/30 backdrop-blur-sm border border-white/10 text-white/80 hover:bg-black/40 transition-colors cursor-pointer"
      >
        <ArrowRight className="w-5 h-5" />
      </button>

      <div className="absolute inset-0 z-0">
        <CameraView onFrame={processFrame} isActive={isStarted} />
      </div>

      <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/60 z-10" />

      <div className="absolute inset-0 z-20">
        <div className="h-full w-full relative">
          {/* Vista del Monitor */}
          <div className={`absolute inset-0 transition-transform duration-500 ${currentView === 'monitor' ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="h-full w-full p-3 flex flex-col">
              <div className="space-y-2">
                {isStarted && (
                  <div className="bg-black/30 backdrop-blur-md rounded-lg p-2 border border-white/10">
                    <SignalQualityIndicator
                      isStarted={isStarted}
                      measurementQuality={measurementQuality}
                      measurementProgress={measurementProgress}
                    />
                  </div>
                )}
                
                {showFingerIndicator && (
                  <div className="px-3 py-2 bg-yellow-500/10 border border-yellow-500/20 backdrop-blur-md rounded-lg">
                    <div className="flex items-center justify-center space-x-2">
                      <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"/>
                      <p className="text-yellow-300 text-xs">
                        Coloque su dedo sobre el lente de la cámara
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-3 space-y-2">
                <div className="bg-black/30 backdrop-blur-md rounded-lg p-2.5 border border-white/10">
                  <VitalSignsDisplay
                    bpm={bpm}
                    spo2={spo2}
                    systolic={systolic}
                    diastolic={diastolic}
                    hasArrhythmia={hasArrhythmia}
                    arrhythmiaType={arrhythmiaType}
                  />
                </div>

                <div className="rounded-lg p-2">
                  <h3 className="text-xs font-medium mb-1 text-gray-100">PPG en Tiempo Real</h3>
                  <div className="h-[80px]">
                    <VitalChart data={readings} color="#ea384c" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Vista de Calibración */}
          <div className={`absolute inset-0 transition-transform duration-500 ${currentView === 'calibration' ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className="h-full w-full p-3">
              <CalibrationPanel 
                settings={sensitivitySettings}
                onUpdateSettings={updateSensitivitySettings}
              />
            </div>
          </div>

          {/* Controles fijos en la parte inferior */}
          <div className="absolute bottom-6 left-0 right-0 px-4 z-30">
            <div className="flex gap-2 justify-center mb-4">
              <Button
                variant={currentView === 'monitor' ? 'default' : 'secondary'}
                className="flex-1 max-w-40"
                onClick={() => setCurrentView('monitor')}
              >
                Monitor
              </Button>
              <Button
                variant={currentView === 'calibration' ? 'default' : 'secondary'}
                className="flex-1 max-w-40 gap-2"
                onClick={() => setCurrentView('calibration')}
              >
                <Settings className="w-4 h-4" />
                Calibración
              </Button>
            </div>

            <div className="w-40 mx-auto">
              <MeasurementControls
                isStarted={isStarted}
                onToggleMeasurement={toggleMeasurement}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeartRateMonitor;
