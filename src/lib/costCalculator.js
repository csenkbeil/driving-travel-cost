export const INPUT_LIMITS = {
  distance: 5000,
  fuelPrice: 10,
  fuelEfficiency: {
    lPer100km: 30,
    kmPerLitre: 50
  }
};

export function clampPositiveNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

export function clampBoundedNumber(value, max) {
  return Math.min(clampPositiveNumber(value), max);
}

export function getFuelEfficiencyLimit(efficiencyMode) {
  return INPUT_LIMITS.fuelEfficiency[efficiencyMode] ?? INPUT_LIMITS.fuelEfficiency.lPer100km;
}

export function normalizeBoundedInput(value, max) {
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return {
      value: 0,
      wasClamped: false
    };
  }

  return {
    value: Math.min(parsed, max),
    wasClamped: parsed > max
  };
}

export function calculateTripCost({
  distance,
  fuelPrice,
  fuelEfficiency,
  efficiencyMode,
  includeReturnTrip
}) {
  const safeDistance = clampBoundedNumber(distance, INPUT_LIMITS.distance);
  const safeFuelPrice = clampBoundedNumber(fuelPrice, INPUT_LIMITS.fuelPrice);
  const efficiencyLimit = getFuelEfficiencyLimit(efficiencyMode);
  const safeFuelEfficiency = clampBoundedNumber(fuelEfficiency, efficiencyLimit);
  const litresPer100km =
    efficiencyMode === 'kmPerLitre' && safeFuelEfficiency > 0
      ? 100 / safeFuelEfficiency
      : safeFuelEfficiency;
  const litresNeeded = (safeDistance / 100) * litresPer100km;
  const tripCost = litresNeeded * safeFuelPrice;
  const totalDistance = includeReturnTrip ? safeDistance * 2 : safeDistance;
  const totalLitres = includeReturnTrip ? litresNeeded * 2 : litresNeeded;
  const totalCost = includeReturnTrip ? tripCost * 2 : tripCost;
  const costPer100Km = litresPer100km * safeFuelPrice;

  return {
    safeDistance,
    safeFuelPrice,
    safeFuelEfficiency,
    litresPer100km,
    litresNeeded,
    tripCost,
    totalDistance,
    totalLitres,
    totalCost,
    costPer100Km
  };
}

export function buildChartData({ includeReturnTrip, litresNeeded, totalDistance, tripCost, totalCost }) {
  return [
    { label: 'One-way', value: tripCost, detail: `${litresNeeded.toFixed(1)} L` },
    {
      label: includeReturnTrip ? 'Return trip' : 'Selected trip',
      value: totalCost,
      detail: `${totalDistance.toFixed(1)} km`
    }
  ];
}

export function buildWhatIfSummary({ includeReturnTrip, currentCase, whatIfCase }) {
  return {
    totalLabel: includeReturnTrip ? 'Return-trip total' : 'Selected trip total',
    currentTotal: currentCase.totalCost,
    whatIfTotal: whatIfCase.totalCost,
    totalDelta: Number((whatIfCase.totalCost - currentCase.totalCost).toFixed(4)),
    currentLitres: currentCase.totalLitres,
    whatIfLitres: whatIfCase.totalLitres,
    litresDelta: Number((whatIfCase.totalLitres - currentCase.totalLitres).toFixed(4))
  };
}
