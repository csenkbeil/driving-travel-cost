import { fireEvent, render, screen } from '@testing-library/svelte';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App.svelte';
import { INPUT_LIMITS } from './lib/costCalculator.js';

function mockMatchMedia(matches = true) {
  const listeners = new Set();

  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(() => ({
      matches,
      media: '(prefers-color-scheme: dark)',
      onchange: null,
      addEventListener: (_event, listener) => listeners.add(listener),
      removeEventListener: (_event, listener) => listeners.delete(listener)
    }))
  });
}

describe('App', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.style.colorScheme = '';
    mockMatchMedia(true);
  });

  it('renders a simple default calculator view with advanced tools hidden', () => {
    render(App);

    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(screen.getByText('Work out your driving cost in a few quick steps.')).toBeInTheDocument();
    expect(screen.getByText('Enter trip details')).toBeInTheDocument();
    expect(screen.getByText('Estimated return-trip fuel cost')).toBeInTheDocument();
    expect(screen.getByText('Quick cost split')).toBeInTheDocument();
    expect(screen.getByText('Advanced what-if')).toBeInTheDocument();
    expect(screen.getByRole('switch', { name: /switch to light mode/i })).toBeInTheDocument();
    expect(screen.queryByText('Fuel price what-if')).not.toBeInTheDocument();
    expect(screen.getAllByText('$6.69').length).toBeGreaterThan(0);
    expect(screen.getByText('3.0 L')).toBeInTheDocument();
    expect(screen.getByText('Fuel used')).toBeInTheDocument();

    expect(screen.getByLabelText('One-way driving distance (km)')).toHaveAttribute(
      'max',
      String(INPUT_LIMITS.distance)
    );
    expect(screen.getByLabelText('Current fuel price ($ / litre)')).toHaveAttribute(
      'max',
      String(INPUT_LIMITS.fuelPrice)
    );
    expect(screen.getByLabelText('Fuel efficiency (L / 100 km)')).toHaveAttribute(
      'max',
      String(INPUT_LIMITS.fuelEfficiency.lPer100km)
    );
  });

  it('uses the browser default theme and lets the user toggle it', async () => {
    mockMatchMedia(false);
    render(App);

    expect(document.documentElement.dataset.theme).toBe('light');
    expect(screen.getByRole('switch', { name: /switch to dark mode/i })).toBeInTheDocument();

    await fireEvent.click(screen.getByRole('switch', { name: /switch to dark mode/i }));

    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(localStorage.getItem('driving-travel-cost-theme')).toBe('dark');
    expect(screen.getByRole('switch', { name: /switch to light mode/i })).toBeInTheDocument();
  });

  it('updates the baseline estimate and reveals advanced what-if tools on demand', async () => {
    render(App);

    const distanceInput = screen.getByLabelText('One-way driving distance (km)');
    const priceInput = screen.getByLabelText('Current fuel price ($ / litre)');
    const efficiencyToggle = screen.getByRole('button', { name: 'Kilometres per litre' });
    const advancedToggle = screen.getByRole('button', { name: /Explore a different fuel scenario/i });

    await fireEvent.input(distanceInput, { target: { value: '300' } });
    await fireEvent.input(priceInput, { target: { value: '1.90' } });
    await fireEvent.click(efficiencyToggle);
    await fireEvent.input(screen.getByLabelText('Fuel efficiency (km / litre)'), {
      target: { value: '15' }
    });

    expect(screen.getAllByText('$38.00').length).toBeGreaterThan(0);
    expect(screen.getByText(/600.0 km total distance with 40.0 L/)).toBeInTheDocument();
    expect(screen.getByText('20.0 litres required')).toBeInTheDocument();
    expect(screen.queryByText('Fuel price what-if')).not.toBeInTheDocument();

    await fireEvent.click(advancedToggle);

    const priceSlider = screen.getByRole('slider', { name: /Fuel price what-if/i });
    const efficiencySlider = screen.getByRole('slider', { name: /Fuel efficiency what-if/i });

    await fireEvent.input(priceSlider, { target: { value: '1.5' } });
    await fireEvent.input(efficiencySlider, { target: { value: '0.8' } });

    expect(screen.getByText(/Current \$76.00 -> What-if \$142.50/)).toBeInTheDocument();
    expect(screen.getByText(/Fuel use changes by \+ 10.0 L/)).toBeInTheDocument();
    expect(screen.getByText(/1.50x\s+-> \$2.85 \/ litre/)).toBeInTheDocument();
    expect(screen.getByText(/0.80x\s+-> 12.0\s+km \/ litre/)).toBeInTheDocument();
  });

  it('clamps overly large input values to the practical limits', async () => {
    render(App);

    const distanceInput = screen.getByLabelText('One-way driving distance (km)');
    const fuelPriceInput = screen.getByLabelText('Current fuel price ($ / litre)');
    const fuelEfficiencyInput = screen.getByLabelText('Fuel efficiency (L / 100 km)');

    await fireEvent.input(distanceInput, {
      target: { value: '999999' }
    });
    await fireEvent.input(fuelPriceInput, {
      target: { value: '99' }
    });
    await fireEvent.input(fuelEfficiencyInput, {
      target: { value: '99' }
    });

    expect(distanceInput).toHaveValue(INPUT_LIMITS.distance);
    expect(fuelPriceInput).toHaveValue(INPUT_LIMITS.fuelPrice);
    expect(fuelEfficiencyInput).toHaveValue(INPUT_LIMITS.fuelEfficiency.lPer100km);
    expect(screen.getByText('Maximum distance is 5,000 km.')).toBeInTheDocument();
    expect(screen.getByText('Maximum fuel price is $10.00 per litre.')).toBeInTheDocument();
    expect(
      screen.getByText(
        `Maximum fuel efficiency is ${INPUT_LIMITS.fuelEfficiency.lPer100km.toFixed(1)} L / 100 km.`
      )
    ).toBeInTheDocument();

    await fireEvent.input(distanceInput, {
      target: { value: '250' }
    });

    expect(distanceInput).toHaveValue(250);
    expect(screen.queryByText('Maximum distance is 5,000 km.')).not.toBeInTheDocument();
    expect(screen.getAllByText('$1,500.00').length).toBeGreaterThan(0);
    expect(screen.getByText(/500.0 km total distance with 150.0 L/)).toBeInTheDocument();
  });

  it('updates the efficiency cap feedback when the unit mode changes', async () => {
    render(App);

    const efficiencyInput = screen.getByLabelText('Fuel efficiency (L / 100 km)');

    await fireEvent.input(efficiencyInput, {
      target: { value: '99' }
    });

    expect(efficiencyInput).toHaveValue(INPUT_LIMITS.fuelEfficiency.lPer100km);
    expect(
      screen.getByText(
        `Maximum fuel efficiency is ${INPUT_LIMITS.fuelEfficiency.lPer100km.toFixed(1)} L / 100 km.`
      )
    ).toBeInTheDocument();

    await fireEvent.click(screen.getByRole('button', { name: 'Kilometres per litre' }));

    const kmPerLitreInput = screen.getByLabelText('Fuel efficiency (km / litre)');

    expect(kmPerLitreInput).toHaveAttribute(
      'max',
      String(INPUT_LIMITS.fuelEfficiency.kmPerLitre)
    );
    expect(
      screen.queryByText(
        `Maximum fuel efficiency is ${INPUT_LIMITS.fuelEfficiency.lPer100km.toFixed(1)} L / 100 km.`
      )
    ).not.toBeInTheDocument();

    await fireEvent.input(kmPerLitreInput, {
      target: { value: '99' }
    });

    expect(kmPerLitreInput).toHaveValue(INPUT_LIMITS.fuelEfficiency.kmPerLitre);
    expect(
      screen.getByText(
        `Maximum fuel efficiency is ${INPUT_LIMITS.fuelEfficiency.kmPerLitre.toFixed(1)} km / litre.`
      )
    ).toBeInTheDocument();
  });

  it('switches the main estimate and advanced summary with the return-trip toggle', async () => {
    render(App);

    const returnTripCheckbox = screen.getByLabelText('Include the return trip in the total estimate');
    const advancedToggle = screen.getByRole('button', { name: /Explore a different fuel scenario/i });

    await fireEvent.click(returnTripCheckbox);
    await fireEvent.click(advancedToggle);

    expect(screen.getByText('Estimated trip fuel cost')).toBeInTheDocument();
    expect(screen.getAllByText('$3.34').length).toBeGreaterThan(0);
    expect(screen.getByText(/Current \$3.34 -> What-if \$3.34/)).toBeInTheDocument();
    expect(screen.getByText(/Fuel use changes by 0.0 L/)).toBeInTheDocument();
  });
});
