import type { SignalConditions, CalibrationEntry, CalibratedResult, MeasurementType } from '@/types';

export class AdaptiveCalibrator {
  // OPTIMIZACIÓN: Sistema de aprendizaje mejorado
  private readonly history: Array<CalibrationEntry> = [];
  private readonly maxHistorySize = 100;
  private readonly learningRate = 0.1;
  private readonly minConfidence = 0.6;

  // OPTIMIZACIÓN: Factores de calibración mejorados
  private calibrationFactors = {
    base: 1.35,           // Factor base aumentado
    age: 1.1,             // Factor por edad
    activity: 1.05,       // Factor por actividad
    temperature: 1.02,    // Factor por temperatura
    pressure: 1.03,       // Factor por presión atmosférica
    quality: 1.0          // Factor por calidad de señal
  };

  // OPTIMIZACIÓN: Rangos fisiológicos mejorados
  private readonly RANGES = {
    bpm: { min: 45, max: 180 },
    spo2: { min: 70, max: 100 },
    systolic: { min: 90, max: 180 },
    diastolic: { min: 60, max: 120 }
  };

  // OPTIMIZACIÓN: Calibración adaptativa mejorada
  calibrate(rawValue: number, conditions: SignalConditions): CalibratedResult {
    try {
      // OPTIMIZACIÓN: Búsqueda de casos similares
      const similarCases = this.findSimilarCases(conditions);
      
      // OPTIMIZACIÓN: Cálculo de factor óptimo
      const optimalFactor = this.calculateOptimalFactor(similarCases, conditions);
      
      // OPTIMIZACIÓN: Aplicación de calibración
      const calibratedValue = this.applyCalibration(rawValue, optimalFactor);
      
      // OPTIMIZACIÓN: Validación de resultado
      const validatedValue = this.validateResult(calibratedValue, conditions.measurementType);
      
      // OPTIMIZACIÓN: Actualización de histórico
      this.updateHistory({
        raw: rawValue,
        calibrated: validatedValue,
        conditions,
        factor: optimalFactor,
        timestamp: Date.now()
      });

      return {
        value: validatedValue,
        confidence: this.calculateConfidence(similarCases, conditions),
        factor: optimalFactor
      };
    } catch (error) {
      console.error('Error en calibración:', error);
      return this.getEmptyCalibration();
    }
  }

  // OPTIMIZACIÓN: Búsqueda de casos similares mejorada
  private findSimilarCases(conditions: SignalConditions): CalibrationEntry[] {
    return this.history
      .filter(entry => this.calculateSimilarity(entry.conditions, conditions) > 0.8)
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 10);
  }

  // OPTIMIZACIÓN: Cálculo de similitud mejorado
  private calculateSimilarity(a: SignalConditions, b: SignalConditions): number {
    const weights = {
      signalQuality: 0.3,
      lightLevel: 0.2,
      movement: 0.2,
      coverage: 0.2,
      temperature: 0.1
    };

    let similarity = 0;
    
    similarity += weights.signalQuality * 
      (1 - Math.abs(a.signalQuality - b.signalQuality));
    
    similarity += weights.lightLevel * 
      (1 - Math.abs(a.lightLevel - b.lightLevel));
    
    similarity += weights.movement * 
      (1 - Math.abs(a.movement - b.movement));
    
    similarity += weights.coverage * 
      (1 - Math.abs(a.coverage - b.coverage));
    
    similarity += weights.temperature * 
      (1 - Math.abs(a.temperature - b.temperature) / 5);

    return similarity;
  }

  // OPTIMIZACIÓN: Cálculo de factor óptimo mejorado
  private calculateOptimalFactor(similarCases: CalibrationEntry[], 
                               currentConditions: SignalConditions): number {
    if (similarCases.length === 0) {
      return this.calculateBaselineFactor(currentConditions);
    }

    // OPTIMIZACIÓN: Ponderación por similitud y recencia
    const weightedFactors = similarCases.map(entry => {
      const similarity = this.calculateSimilarity(entry.conditions, currentConditions);
      const recency = Math.exp(-(Date.now() - entry.timestamp) / (24 * 60 * 60 * 1000));
      const weight = similarity * recency;
      
      return {
        factor: entry.factor,
        weight
      };
    });

    // OPTIMIZACIÓN: Promedio ponderado
    const totalWeight = weightedFactors.reduce((sum, wf) => sum + wf.weight, 0);
    const weightedAverage = weightedFactors.reduce(
      (sum, wf) => sum + wf.factor * wf.weight, 0
    ) / totalWeight;

    // OPTIMIZACIÓN: Ajuste adaptativo
    return this.adjustFactor(weightedAverage, currentConditions);
  }

  private calculateBaselineFactor(conditions: SignalConditions): number {
    let factor = this.calibrationFactors.base;

    // OPTIMIZACIÓN: Ajustes por condiciones
    factor *= Math.pow(this.calibrationFactors.quality, conditions.signalQuality);
    factor *= this.calculateEnvironmentFactor(conditions);
    factor *= this.calculateMovementFactor(conditions.movement);

    return factor;
  }

  // OPTIMIZACIÓN: Aplicación de calibración mejorada
  private applyCalibration(rawValue: number, factor: number): number {
    // OPTIMIZACIÓN: Aplicación no lineal
    const calibrated = rawValue * factor;
    
    // OPTIMIZACIÓN: Compensación de no linealidad
    const nonLinearAdjustment = this.calculateNonLinearAdjustment(rawValue);
    
    return calibrated * nonLinearAdjustment;
  }

  // OPTIMIZACIÓN: Validación de resultados mejorada
  private validateResult(value: number, type: MeasurementType): number {
    const range = this.RANGES[type];
    if (!range) return value;

    // OPTIMIZACIÓN: Validación con suavizado
    if (value < range.min) {
      return range.min + (value - range.min) * 0.5;
    }
    if (value > range.max) {
      return range.max - (value - range.max) * 0.5;
    }

    return value;
  }

  // OPTIMIZACIÓN: Cálculo de confianza mejorado
  private calculateConfidence(similarCases: CalibrationEntry[], 
                            conditions: SignalConditions): number {
    if (similarCases.length === 0) {
      return Math.min(conditions.signalQuality, this.minConfidence);
    }

    const similarityConfidence = this.calculateSimilarityConfidence(similarCases, conditions);
    const qualityConfidence = conditions.signalQuality;
    const stabilityConfidence = this.calculateStabilityConfidence(similarCases);

    return Math.min(
      similarityConfidence * 0.4 +
      qualityConfidence * 0.4 +
      stabilityConfidence * 0.2,
      1
    );
  }

  // OPTIMIZACIÓN: Métodos auxiliares mejorados
  private calculateEnvironmentFactor(conditions: SignalConditions): number {
    const temperatureFactor = 1 + (conditions.temperature - 20) * 0.005;
    const lightFactor = 1 + (0.5 - conditions.lightLevel) * 0.1;
    
    return temperatureFactor * lightFactor;
  }

  private calculateMovementFactor(movement: number): number {
    return 1 + movement * 0.2;
  }

  private calculateNonLinearAdjustment(value: number): number {
    // OPTIMIZACIÓN: Ajuste no lineal basado en el valor
    return 1 + Math.log10(value / 100) * 0.1;
  }

  private calculateSimilarityConfidence(cases: CalibrationEntry[], 
                                      conditions: SignalConditions): number {
    if (cases.length === 0) return 0;

    const similarities = cases.map(c => 
      this.calculateSimilarity(c.conditions, conditions)
    );

    return Math.max(...similarities);
  }

  private calculateStabilityConfidence(cases: CalibrationEntry[]): number {
    if (cases.length < 2) return 1;

    const factors = cases.map(c => c.factor);
    const variance = this.calculateVariance(factors);
    
    return Math.exp(-variance * 2);
  }

  private calculateVariance(values: number[]): number {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    return values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
  }

  private updateHistory(entry: CalibrationEntry): void {
    this.history.push(entry);
    
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
    }
  }

  private getEmptyCalibration(): CalibratedResult {
    return {
      value: 0,
      confidence: 0,
      factor: this.calibrationFactors.base
    };
  }

    private adjustFactor(factor: number, conditions: SignalConditions): number {
        let adjustedFactor = factor;

        // Ajuste basado en la calidad de la señal
        adjustedFactor += (conditions.signalQuality - 0.5) * 0.1;

        // Ajuste basado en la estabilidad
        adjustedFactor += (conditions.stability - 0.5) * 0.05;

        // Ajuste basado en el nivel de luz
        adjustedFactor += (conditions.lightLevel - 0.5) * 0.03;

        return adjustedFactor;
    }
}
