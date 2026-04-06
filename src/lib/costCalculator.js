export function clampPositiveNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

export function calculateTripCost({
  distance,
  fuelPrice,
  fuelEfficiency,
  efficiencyMode,
  includeReturnTrip
}) {
  const safeDistance = clampPositiveNumber(distance);
  const safeFuelPrice = clampPositiveNumber(fuelPrice);
  const safeFuelEfficiency = clampPositiveNumber(fuelEfficiency);
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
