import { fireEvent, render, screen } from '@testing-library/svelte';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App.svelte';

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
    expect(screen.getByText('Trip breakdown')).toBeInTheDocument();
    expect(screen.getByText('Advanced what-if')).toBeInTheDocument();
    expect(screen.getByRole('switch', { name: /switch to light mode/i })).toBeInTheDocument();
    expect(screen.queryByText('Fuel price what-if')).not.toBeInTheDocument();
    expect(screen.getAllByText('$63.55').length).toBeGreaterThan(0);
    expect(screen.getByText('30.6 L')).toBeInTheDocument();
    expect(screen.getAllByText('$15.81').length).toBeGreaterThan(0);
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

    const distanceInput = screen.getByLabelText('Driving distance (km)');
    const priceInput = screen.getByLabelText('Current fuel price ($ / litre)');
    const efficiencyToggle = screen.getByRole('button', { name: 'Kilometres per litre' });
    const efficiencyInput = screen.getByLabelText('Fuel efficiency (L / 100 km)');
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

  it('switches the main estimate and advanced summary with the return-trip toggle', async () => {
    render(App);

    const returnTripCheckbox = screen.getByLabelText('Include the return trip in the total estimate');
    const advancedToggle = screen.getByRole('button', { name: /Explore a different fuel scenario/i });

    await fireEvent.click(returnTripCheckbox);
    await fireEvent.click(advancedToggle);

    expect(screen.getByText('Estimated trip fuel cost')).toBeInTheDocument();
    expect(screen.getAllByText('$31.77').length).toBeGreaterThan(0);
    expect(screen.getByText(/Current \$31.77 -> What-if \$31.77/)).toBeInTheDocument();
    expect(screen.getByText(/Fuel use changes by 0.0 L/)).toBeInTheDocument();
  });
});
