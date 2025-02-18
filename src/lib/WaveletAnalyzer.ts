// ==================== WaveletAnalyzer.ts ====================

export class WaveletAnalyzer {
  // OPTIMIZACIÓN: Configuración de wavelets mejorada
  private readonly WAVELET_CONFIG = {
    levels: 5,                    // Niveles de descomposición
    motherWavelet: 'db4',        // Wavelet Daubechies-4
    threshold: 0.1,              // Umbral de denoising
    minFrequency: 0.75,          // 45 BPM
    maxFrequency: 3.0,           // 180 BPM
    samplingRate: 30             // 30 fps
  };

  // OPTIMIZACIÓN: Buffers mejorados
  private readonly bufferSize = 256;  // Potencia de 2 para FFT
  private signalBuffer: number[] = [];
  private coefficientsBuffer: number[][] = [];
  private lastAnalysis: WaveletAnalysis | null = null;

  // OPTIMIZACIÓN: Análisis wavelet mejorado
  analyzeSignal(signal: number[]): SignalCharacteristics {
    try {
      // OPTIMIZACIÓN: Actualización de buffer
      this.updateBuffer(signal);

      // OPTIMIZACIÓN: Descomposición wavelet
      const wavelets = this.discreteWaveletTransform();

      // OPTIMIZACIÓN: Extracción de características
      const features = this.extractWaveletFeatures(wavelets);

      // OPTIMIZACIÓN: Análisis de calidad
      const quality = this.calculateSignalQuality(features);

      // OPTIMIZACIÓN: Detección de picos
      const peaks = this.detectReliablePeaks(features);

      // OPTIMIZACIÓN: Estimación de ruido
      const noise = this.estimateNoiseLevel(features);

      // OPTIMIZACIÓN: Análisis de frecuencia
      const frequency = this.analyzeFrequencyContent(features);

      this.lastAnalysis = {
        features,
        quality,
        peaks,
        noise,
        frequency
      };

      return {
        quality,
        peaks,
        noise,
        frequency,
        characteristics: this.extractSignalCharacteristics(features)
      };
    } catch (error) {
      console.error('Error en análisis wavelet:', error);
      return this.getEmptyAnalysis();
    }
  }

  // OPTIMIZACIÓN: Transformada wavelet discreta mejorada
  private discreteWaveletTransform(): WaveletDecomposition {
    const signal = [...this.signalBuffer];
    const coefficients: number[][] = [];
    
    // OPTIMIZACIÓN: Implementación de Mallat
    for (let level = 0; level < this.WAVELET_CONFIG.levels; level++) {
      const { approximation, detail } = this.decompose(signal);
      coefficients.push(detail);
      signal.length = approximation.length;
      signal.set(approximation);
    }
    
    coefficients.push(signal); // Aproximación final

    return {
      coefficients,
      levels: this.WAVELET_CONFIG.levels
    };
  }

  // OPTIMIZACIÓN: Extracción de características mejorada
  private extractWaveletFeatures(wavelets: WaveletDecomposition): WaveletFeatures {
    const energies = this.calculateSubbandEnergies(wavelets);
    const entropy = this.calculateWaveletEntropy(wavelets);
    const peaks = this.findWaveletPeaks(wavelets);
    
    return {
      energies,
      entropy,
      peaks,
      coefficients: wavelets.coefficients
    };
  }

  // OPTIMIZACIÓN: Cálculo de calidad de señal mejorado
  private calculateSignalQuality(features: WaveletFeatures): number {
    const energyQuality = this.calculateEnergyQuality(features.energies);
    const entropyQuality = this.calculateEntropyQuality(features.entropy);
    const peakQuality = this.calculatePeakQuality(features.peaks);
    
    return (
      energyQuality * 0.4 +
      entropyQuality * 0.3 +
      peakQuality * 0.3
    );
  }

  // OPTIMIZACIÓN: Detección de picos mejorada
  private detectReliablePeaks(features: WaveletFeatures): Peak[] {
    const candidates = this.findPeakCandidates(features);
    const validated = this.validatePeaks(candidates);
    
    return this.rankPeaks(validated);
  }

  // OPTIMIZACIÓN: Estimación de ruido mejorada
  private estimateNoiseLevel(features: WaveletFeatures): number {
    const detailCoefficients = features.coefficients[0];
    const medianAbsDev = this.calculateMedianAbsoluteDeviation(detailCoefficients);
    
    return medianAbsDev / 0.6745; // Estimador robusto de ruido
  }

  // OPTIMIZACIÓN: Métodos de descomposición mejorados
  private decompose(signal: number[]): {
    approximation: number[];
    detail: number[];
  } {
    const N = signal.length;
    const half = Math.floor(N/2);
    
    const approximation = new Array(half);
    const detail = new Array(half);
    
    for (let i = 0; i < half; i++) {
      let sum_a = 0;
      let sum_d = 0;
      
      for (let k = 0; k < 4; k++) {
        const idx = 2*i + k;
        if (idx < N) {
          sum_a += signal[idx] * this.getScalingCoefficient(k);
          sum_d += signal[idx] * this.getWaveletCoefficient(k);
        }
      }
      
      approximation[i] = sum_a;
      detail[i] = sum_d;
    }
    
    return { approximation, detail };
  }

  // OPTIMIZACIÓN: Coeficientes wavelet mejorados
  private getScalingCoefficient(k: number): number {
    // Coeficientes Daubechies-4
    const h = [0.4829629131445341,
               0.8365163037378079,
               0.2241438680420134,
               -0.1294095225512604];
    return h[k];
  }

  private getWaveletCoefficient(k: number): number {
    // Coeficientes wavelet
    const g = [-0.1294095225512604,
               -0.2241438680420134,
               0.8365163037378079,
               -0.4829629131445341];
    return g[k];
  }

  // OPTIMIZACIÓN: Análisis de energía mejorado
  private calculateSubbandEnergies(wavelets: WaveletDecomposition): number[] {
    return wavelets.coefficients.map(band => {
      return band.reduce((energy, coef) => energy + coef * coef, 0);
    });
  }

  // OPTIMIZACIÓN: Cálculo de entropía mejorado
  private calculateWaveletEntropy(wavelets: WaveletDecomposition): number {
    const totalEnergy = wavelets.coefficients.reduce((sum, band) => 
      sum + band.reduce((e, coef) => e + coef * coef, 0), 0
    );
    
    return wavelets.coefficients.reduce((entropy, band) => {
      const bandEnergy = band.reduce((e, coef) => e + coef * coef, 0);
      const p = bandEnergy / totalEnergy;
      return entropy - (p > 0 ? p * Math.log2(p) : 0);
    }, 0);
  }

  // OPTIMIZACIÓN: Búsqueda de picos mejorada
  private findWaveletPeaks(wavelets: WaveletDecomposition): Peak[] {
    const peaks: Peak[] = [];
    
    for (let level = 0; level < wavelets.levels; level++) {
      const band = wavelets.coefficients[level];
      const threshold = this.calculateAdaptiveThreshold(band);
      
      for (let i = 1; i < band.length - 1; i++) {
        if (this.isPeak(band, i, threshold)) {
          peaks.push({
            position: i,
            magnitude: band[i],
            width: this.estimatePeakWidth(band, i),
            level
          });
        }
      }
    }
    
    return this.mergeSimilarPeaks(peaks);
  }

  // OPTIMIZACIÓN: Validación de picos mejorada
  private validatePeaks(peaks: Peak[]): Peak[] {
    return peaks.filter(peak => {
      const isPhysiological = this.isPhysiologicallyValid(peak);
      const hasGoodShape = this.hasGoodPeakShape(peak);
      const isStable = this.isPeakStable(peak);
      
      return isPhysiological && hasGoodShape && isStable;
    });
  }

  // OPTIMIZACIÓN: Métodos auxiliares mejorados
  private calculateAdaptiveThreshold(band: number[]): number {
    const mad = this.calculateMedianAbsoluteDeviation(band);
    return mad * 2.5;
  }

  private calculateMedianAbsoluteDeviation(values: number[]): number {
    const median = this.calculateMedian(values);
    const deviations = values.map(v => Math.abs(v - median));
    return this.calculateMedian(deviations);
  }

  private calculateMedian(values: number[]): number {
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  }

  private isPeak(band: number[], index: number, threshold: number): boolean {
    return band[index] > threshold &&
           band[index] > band[index - 1] &&
           band[index] > band[index + 1];
  }

  private estimatePeakWidth(band: number[], peakIndex: number): number {
    let width = 1;
    let left = peakIndex - 1;
    let right = peakIndex + 1;
    const threshold = band[peakIndex] * 0.5;
    
    while (left >= 0 && band[left] > threshold) {
      width++;
      left--;
    }
    while (right < band.length && band[right] > threshold) {
      width++;
      right++;
    }
    
    return width;
  }

  private mergeSimilarPeaks(peaks: Peak[]): Peak[] {
    const merged: Peak[] = [];
    const maxDistance = 3;
    
    peaks.sort((a, b) => b.magnitude - a.magnitude);
    
    for (const peak of peaks) {
      const similarPeak = merged.find(p => 
        Math.abs(p.position - peak.position) <= maxDistance &&
        p.level === peak.level
      );
      
      if (!similarPeak) {
        merged.push(peak);
      }
    }
    
    return merged;
  }

  private getEmptyAnalysis(): SignalCharacteristics {
    return {
      quality: 0,
      peaks: [],
      noise: 0,
      frequency: 0,
      characteristics: {
        energy: 0,
        entropy: 0,
        dominantFrequency: 0,
        signalToNoise: 0
      }
    };
  }
}

// OPTIMIZACIÓN: Interfaces mejoradas
interface WaveletDecomposition {
  coefficients: number[][];
  levels: number;
}

interface WaveletFeatures {
  energies: number[];
  entropy: number;
  peaks: Peak[];
  coefficients: number[][];
}

interface Peak {
  position: number;
  magnitude: number;
  width: number;
  level: number;
}

interface SignalCharacteristics {
  quality: number;
  peaks: Peak[];
  noise: number;
  frequency: number;
  characteristics: {
    energy: number;
    entropy: number;
    dominantFrequency: number;
    signalToNoise: number;
  };
}

interface WaveletAnalysis {
  features: WaveletFeatures;
  quality: number;
  peaks: Peak[];
  noise: number;
  frequency: number;
}