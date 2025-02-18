
import React, { useRef, useEffect, useState } from "react";
import Webcam from "react-webcam";
import CameraPreview from "./camera/CameraPreview";
import CameraOverlay from "./camera/CameraOverlay";
import CameraStatus from "./camera/CameraStatus";
import { useCameraProcessor } from "./camera/useCameraProcessor";
import { useCameraInitializer } from "./camera/useCameraInitializer";

interface CameraViewProps {
  onFrame: (imageData: ImageData) => void;
  isActive: boolean;
  onMeasurementEnd?: () => void;
}

const CameraView: React.FC<CameraViewProps> = ({ 
  onFrame, 
  isActive, 
  onMeasurementEnd 
}) => {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [frameCount, setFrameCount] = useState(0);

  const videoConstraints = {
    width: { ideal: 1280 },
    height: { ideal: 720 },
    facingMode: "environment",
    frameRate: { ideal: 30 },
    aspectRatio: { ideal: 16/9 },
    advanced: [{
      exposureMode: "manual",
      exposureTime: 10000,
      exposureCompensation: 2,
      brightness: 1.0,
      contrast: 1.2,
      whiteBalanceMode: "manual",
      colorTemperature: 3300,
      saturation: 1.5,
      sharpness: 1.2,
      torch: false
    }]
  };

  const { initializeCamera } = useCameraInitializer({
    videoConstraints,
    setIsInitializing,
    setHasError
  });

  const { processFrame, animationFrameRef } = useCameraProcessor({
    isActive,
    onFrame,
    setFrameCount
  });

  // Solo inicializa la cámara una vez cuando isActive cambia a true
  useEffect(() => {
    let isMounted = true;

    if (isActive && isInitializing) {
      initializeCamera().then(() => {
        if (isMounted) {
          setIsInitializing(false);
        }
      });
    }

    return () => {
      isMounted = false;
    };
  }, [isActive]);

  // Procesa frames solo cuando la cámara está completamente inicializada
  useEffect(() => {
    if (isActive && !isInitializing && !hasError && webcamRef.current?.video?.readyState === 4) {
      processFrame(webcamRef, canvasRef);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [isActive, isInitializing, hasError, processFrame]);

  return (
    <div className="relative w-full h-screen bg-black">
      {isActive && (
        <>
          <CameraPreview 
            webcamRef={webcamRef}
            videoConstraints={videoConstraints}
          />

          <canvas 
            ref={canvasRef} 
            style={{ display: "none" }}
          />

          <CameraOverlay
            frameCount={frameCount}
            isInitializing={isInitializing}
            hasError={hasError}
          />
        </>
      )}

      <CameraStatus
        isInitializing={isInitializing}
        hasError={hasError}
      />
    </div>
  );
};

export default CameraView;
