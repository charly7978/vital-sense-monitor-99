
import React, { useState, useCallback } from 'react';
import { Heart, Droplets, Activity, AlertTriangle } from 'lucide-react';
import CameraView from './CameraView';
import VitalChart from './VitalChart';
import { PPGProcessor } from '../utils/ppgProcessor';
import type { VitalReading } from '../utils/types';

const ppgProcessor = new PPGProcessor();

const HeartRateMonitor: React.FC = () => {
  const [bpm, setBpm] = useState<number>(0);
  const [spo2, setSpo2] = useState<number>(0);
  const [systolic, setSystolic] = useState<number>(0);
  const [diastolic, setDiastolic] = useState<number>(0);
  const [hasArrhythmia, setHasArrhythmia] = useState<boolean>(false);
  const [arrhythmiaType, setArrhythmiaType] = useState<string>('Normal');
  const [readings, setReadings] = useState<VitalReading[]>([]);

  const handleFrame = useCallback((imageData: ImageData) => {
    const vitals = ppgProcessor.processFrame(imageData);
    setBpm(vitals.bpm);
    setSpo2(vitals.spo2);
    setSystolic(vitals.systolic);
    setDiastolic(vitals.diastolic);
    setHasArrhythmia(vitals.hasArrhythmia);
    setArrhythmiaType(vitals.arrhythmiaType);
    setReadings(ppgProcessor.getReadings());
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center justify-between bg-black/5 backdrop-blur-sm rounded-xl p-4">
          <div className="flex items-center space-x-2">
            <Heart className="w-6 h-6 text-[#ea384c]" />
            <h2 className="text-xl font-semibold">Heart Rate</h2>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-4xl font-bold">{bpm}</span>
            <span className="text-sm text-gray-400">BPM</span>
          </div>
        </div>

        <div className="flex items-center justify-between bg-black/5 backdrop-blur-sm rounded-xl p-4">
          <div className="flex items-center space-x-2">
            <Droplets className="w-6 h-6 text-[#3b82f6]" />
            <h2 className="text-xl font-semibold">SpO2</h2>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-4xl font-bold">{spo2}</span>
            <span className="text-sm text-gray-400">%</span>
          </div>
        </div>

        <div className="flex items-center justify-between bg-black/5 backdrop-blur-sm rounded-xl p-4">
          <div className="flex items-center space-x-2">
            <Activity className="w-6 h-6 text-[#10b981]" />
            <h2 className="text-xl font-semibold">Blood Pressure</h2>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-4xl font-bold">{systolic}/{diastolic}</span>
            <span className="text-sm text-gray-400">mmHg</span>
          </div>
        </div>

        <div className="flex items-center justify-between bg-black/5 backdrop-blur-sm rounded-xl p-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className={`w-6 h-6 ${hasArrhythmia ? 'text-[#f59e0b]' : 'text-[#10b981]'}`} />
            <h2 className="text-xl font-semibold">Rhythm</h2>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className={`text-xl font-bold ${hasArrhythmia ? 'text-[#f59e0b]' : 'text-[#10b981]'}`}>
              {arrhythmiaType}
            </span>
          </div>
        </div>
      </div>

      <CameraView onFrame={handleFrame} />
      
      <div className="bg-gradient-to-br from-black/5 to-black/10 backdrop-blur-lg rounded-xl p-6">
        <h3 className="text-lg font-medium mb-4">Real-time PPG Signal</h3>
        <VitalChart data={readings} color="#ea384c" />
      </div>
    </div>
  );
};

export default HeartRateMonitor;
