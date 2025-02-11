
import React, { useEffect, useState, useCallback } from 'react';
import { Camera as CapCamera } from '@capacitor/camera';

interface CameraInitializerProps {
  onInitialized: (stream: MediaStream) => void;
  isActive: boolean;
  onError: (error: string) => void;
}

interface ExtendedCapabilities extends MediaTrackCapabilities {
  torch?: boolean;
}

interface ExtendedConstraints extends MediaTrackConstraintSet {
  torch?: boolean;
}

const CameraInitializer: React.FC<CameraInitializerProps> = ({
  onInitialized,
  isActive,
  onError,
}) => {
  const [isAndroid, setIsAndroid] = useState(false);
  const [currentStream, setCurrentStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    setIsAndroid(userAgent.includes('android'));
  }, []);

  const stopCurrentStream = useCallback(() => {
    if (currentStream) {
      currentStream.getTracks().forEach(track => {
        track.stop();
        currentStream.removeTrack(track);
      });
      setCurrentStream(null);
    }
  }, [currentStream]);

  const initializeCamera = useCallback(async () => {
    try {
      stopCurrentStream();

      const permission = await CapCamera.checkPermissions();
      if (permission.camera !== 'granted') {
        const request = await CapCamera.requestPermissions();
        if (request.camera !== 'granted') {
          throw new Error('Permiso de cámara denegado');
        }
      }

      if (!isActive) return;

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: isAndroid ? 'environment' : 'user',
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (!isActive) {
        stream.getTracks().forEach(track => track.stop());
        return;
      }

      setCurrentStream(stream);

      if (isAndroid) {
        const videoTrack = stream.getVideoTracks()[0];
        const capabilities = videoTrack.getCapabilities() as ExtendedCapabilities;
        
        if (capabilities?.torch) {
          try {
            const advancedConstraint: ExtendedConstraints = { torch: true };
            await videoTrack.applyConstraints({
              advanced: [advancedConstraint]
            });
          } catch (e) {
            console.error('Error activando la linterna:', e);
          }
        }
      }

      onInitialized(stream);
    } catch (error) {
      console.error('Error iniciando la cámara:', error);
      onError('Error al iniciar la cámara. Por favor, verifica los permisos y reintenta.');
      stopCurrentStream();
    }
  }, [isActive, isAndroid, onInitialized, onError, stopCurrentStream]);

  useEffect(() => {
    let initTimeout: NodeJS.Timeout;

    if (isActive) {
      initTimeout = setTimeout(() => {
        initializeCamera();
      }, 100);
    } else {
      stopCurrentStream();
    }

    return () => {
      clearTimeout(initTimeout);
      stopCurrentStream();
    };
  }, [isActive, initializeCamera, stopCurrentStream]);

  return null;
};

export default CameraInitializer;
