import { describe, expect, it } from 'vitest';
import {
  buildChartData,
  buildWhatIfSummary,
  calculateTripCost,
  clampPositiveNumber
} from './costCalculator.js';

describe('clampPositiveNumber', () => {
  it('returns positive numeric values unchanged', () => {
    expect(clampPositiveNumber(12.5)).toBe(12.5);
  });

  it('normalizes invalid and negative input to zero', () => {
    expect(clampPositiveNumber(-3)).toBe(0);
    expect(clampPositiveNumber('bad')).toBe(0);
    expect(clampPositiveNumber(0)).toBe(0);
  });
});

describe('calculateTripCost', () => {
  it('calculates one-way and return-trip totals from litres per 100 km', () => {
    const result = calculateTripCost({
      distance: 201,
      fuelPrice: 2.08,
      fuelEfficiency: 7.6,
      efficiencyMode: 'lPer100km',
      includeReturnTrip: true
    });

    expect(result.litresNeeded).toBeCloseTo(15.276, 3);
    expect(result.tripCost).toBeCloseTo(31.77408, 5);
    expect(result.totalDistance).toBe(402);
    expect(result.totalCost).toBeCloseTo(63.54816, 5);
  });

  it('converts kilometres per litre before calculating totals', () => {
    const result = calculateTripCost({
      distance: 300,
      fuelPrice: 1.9,
      fuelEfficiency: 15,
      efficiencyMode: 'kmPerLitre',
      includeReturnTrip: false
    });

    expect(result.litresPer100km).toBeCloseTo(6.6666667, 6);
    expect(result.litresNeeded).toBeCloseTo(20, 6);
    expect(result.totalCost).toBeCloseTo(38, 6);
  });
});

describe('buildChartData', () => {
  it('labels selected-trip mode correctly when return is disabled', () => {
    const chartData = buildChartData({
      includeReturnTrip: false,
      litresNeeded: 11.2,
      totalDistance: 140,
      tripCost: 20.16,
      totalCost: 20.16
    });

    expect(chartData[0]).toEqual({ label: 'One-way', value: 20.16, detail: '11.2 L' });
    expect(chartData[1]).toEqual({ label: 'Selected trip', value: 20.16, detail: '140.0 km' });
  });
});

describe('buildWhatIfSummary', () => {
  it('builds a compact what-if summary for the advanced panel', () => {
    const summary = buildWhatIfSummary({
      includeReturnTrip: false,
      currentCase: {
        tripCost: 31.77,
        totalCost: 31.77,
        totalLitres: 15.2
      },
      whatIfCase: {
        tripCost: 28.5,
        totalCost: 28.5,
        totalLitres: 14.1
      }
    });

    expect(summary).toEqual({
      totalLabel: 'Selected trip total',
      currentTotal: 31.77,
      whatIfTotal: 28.5,
      totalDelta: -3.27,
      currentLitres: 15.2,
      whatIfLitres: 14.1,
      litresDelta: -1.1
    });
  });
});
