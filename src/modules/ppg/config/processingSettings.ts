
import { ProcessingSettings } from '@/types/settings';

export const defaultProcessingSettings: ProcessingSettings = {
  MEASUREMENT_DURATION: 30,
  MIN_FRAMES_FOR_CALCULATION: 15,
  MIN_PEAKS_FOR_VALID_HR: 2,
  MIN_PEAK_DISTANCE: 400,
  MAX_PEAK_DISTANCE: 1200,
  PEAK_THRESHOLD_FACTOR: 0.4,
  MIN_RED_VALUE: 15,
  MIN_RED_DOMINANCE: 1.2,
  MIN_VALID_PIXELS_RATIO: 0.2,
  MIN_BRIGHTNESS: 80,
  MIN_VALID_READINGS: 30,
  FINGER_DETECTION_DELAY: 500,
  MIN_SPO2: 75
};
