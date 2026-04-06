<script>
  import { onMount } from 'svelte';
  import { format } from 'd3-format';
  import { scaleLinear } from 'd3-scale';
  import {
    buildChartData,
    buildWhatIfSummary,
    calculateTripCost,
    getFuelEfficiencyLimit,
    INPUT_LIMITS,
    normalizeBoundedInput
  } from './lib/costCalculator.js';

  const currency = format(',.2f');
  const number = format(',.1f');
  const multiplier = format('.2f');
  const themeStorageKey = 'driving-travel-cost-theme';

  let distance = 20;
  let fuelPrice = 2.20;
  let efficiencyMode = 'lPer100km';
  let fuelEfficiency = 7.6;
  let includeReturnTrip = true;
  let fuelPriceMultiplier = 1;
  let fuelEfficiencyMultiplier = 1;
  let showAdvancedWhatIf = false;
  let currentCase;
  let whatIfFuelPrice;
  let whatIfFuelEfficiency;
  let whatIfCase;
  let chartData;
  let whatIfSummary;
  let maxCost;
  let costScale;
  let theme = 'dark';
  let hasStoredThemePreference = false;
  let limitReached = {
    distance: false,
    fuelPrice: false,
    fuelEfficiency: false
  };

  function updateLimitReached(field, wasClamped) {
    limitReached = {
      ...limitReached,
      [field]: wasClamped
    };
  }

  function applyBoundedValue(field, rawValue, max) {
    const { value, wasClamped } = normalizeBoundedInput(rawValue, max);

    if (field === 'distance') {
      distance = value;
    }

    if (field === 'fuelPrice') {
      fuelPrice = value;
    }

    if (field === 'fuelEfficiency') {
      fuelEfficiency = value;
    }

    updateLimitReached(field, wasClamped);
  }

  function handleDistanceInput(event) {
    applyBoundedValue('distance', event.currentTarget.value, INPUT_LIMITS.distance);
  }

  function handleFuelPriceInput(event) {
    applyBoundedValue('fuelPrice', event.currentTarget.value, INPUT_LIMITS.fuelPrice);
  }

  function handleFuelEfficiencyInput(event) {
    applyBoundedValue('fuelEfficiency', event.currentTarget.value, getFuelEfficiencyLimit(efficiencyMode));
  }

  function setEfficiencyMode(nextMode) {
    efficiencyMode = nextMode;

    const { value, wasClamped } = normalizeBoundedInput(
      fuelEfficiency,
      getFuelEfficiencyLimit(nextMode)
    );

    fuelEfficiency = value;
    updateLimitReached('fuelEfficiency', wasClamped);
  }

  function applyTheme(nextTheme) {
    theme = nextTheme;
    if (typeof document !== 'undefined') {
      document.documentElement.dataset.theme = nextTheme;
      document.documentElement.style.colorScheme = nextTheme;
    }
  }

  function toggleTheme() {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    hasStoredThemePreference = true;
    applyTheme(nextTheme);
    localStorage.setItem(themeStorageKey, nextTheme);
  }

  function resetWhatIfSliders() {
    fuelPriceMultiplier = 1;
    fuelEfficiencyMultiplier = 1;
  }

  onMount(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const storedTheme = localStorage.getItem(themeStorageKey);

    if (storedTheme === 'light' || storedTheme === 'dark') {
      hasStoredThemePreference = true;
      applyTheme(storedTheme);
    } else {
      applyTheme(mediaQuery.matches ? 'dark' : 'light');
    }

    const handleThemeChange = (event) => {
      if (!hasStoredThemePreference) {
        applyTheme(event.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleThemeChange);

    return () => {
      mediaQuery.removeEventListener('change', handleThemeChange);
    };
  });

  $: currentCase = calculateTripCost({
    distance,
    fuelPrice,
    fuelEfficiency,
    efficiencyMode,
    includeReturnTrip
  });
  $: whatIfFuelPrice = Number(fuelPrice) * fuelPriceMultiplier;
  $: whatIfFuelEfficiency = Number(fuelEfficiency) * fuelEfficiencyMultiplier;
  $: whatIfCase = calculateTripCost({
    distance,
    fuelPrice: whatIfFuelPrice,
    fuelEfficiency: whatIfFuelEfficiency,
    efficiencyMode,
    includeReturnTrip,
  });
  $: chartData = buildChartData({
    includeReturnTrip,
    litresNeeded: currentCase.litresNeeded,
    totalDistance: currentCase.totalDistance,
    tripCost: currentCase.tripCost,
    totalCost: currentCase.totalCost
  });
  $: whatIfSummary = buildWhatIfSummary({ includeReturnTrip, currentCase, whatIfCase });
  $: maxCost = Math.max(...chartData.map((item) => item.value), 1);
  $: costScale = scaleLinear().domain([0, maxCost]).range([0, 100]);
  $: fuelEfficiencyLimit = getFuelEfficiencyLimit(efficiencyMode);
  $: fuelEfficiencyLimitText =
    efficiencyMode === 'lPer100km'
      ? `Maximum fuel efficiency is ${number(fuelEfficiencyLimit)} L / 100 km.`
      : `Maximum fuel efficiency is ${number(fuelEfficiencyLimit)} km / litre.`;
</script>

<svelte:head>
  <title>Driving Travel Cost</title>
</svelte:head>

<div class="shell">
  <section class="hero">
    <div class="hero-copy">
      <div class="hero-copy__topline">
        <p class="eyebrow">Driving-cost planner</p>
        <label class="theme-toggle" aria-label="Theme mode toggle">
          <span>{theme === 'dark' ? 'Dark mode' : 'Light mode'}</span>
          <button
            type="button"
            role="switch"
            class:theme-toggle__switch--active={theme === 'dark'}
            class="theme-toggle__switch"
            aria-checked={theme === 'dark'}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            on:click={toggleTheme}
          >
            <span class="theme-toggle__thumb"></span>
          </button>
        </label>
      </div>
      <h1>Work out your driving cost in a few quick steps.</h1>
      <p class="intro">
        Enter three trip details and get one clear estimate straight away. The optional what-if
        tools stay tucked away until you need them.
      </p>
    </div>
  </section>

  <main class="layout">
    <section class="panel">
      <div class="panel-heading">
        <p class="eyebrow">Trip inputs</p>
        <h2>Enter trip details</h2>
      </div>

      <div class="form-grid">
        <label class:field-capped={limitReached.distance}>
          <span>One-way driving distance (km)</span>
          <input
            value={distance}
            type="number"
            min="0"
            max={INPUT_LIMITS.distance}
            step="1"
            aria-describedby={limitReached.distance ? 'distance-limit-message' : undefined}
            on:input={handleDistanceInput}
          />
          {#if limitReached.distance}
            <small id="distance-limit-message" class="field-feedback">
              Maximum distance is 5,000 km.
            </small>
          {/if}
        </label>

        <label class:field-capped={limitReached.fuelPrice}>
          <span>Current fuel price ($ / litre)</span>
          <input
            value={fuelPrice}
            type="number"
            min="0"
            max={INPUT_LIMITS.fuelPrice}
            step="0.01"
            aria-describedby={limitReached.fuelPrice ? 'fuel-price-limit-message' : undefined}
            on:input={handleFuelPriceInput}
          />
          {#if limitReached.fuelPrice}
            <small id="fuel-price-limit-message" class="field-feedback">
              Maximum fuel price is $10.00 per litre.
            </small>
          {/if}
        </label>
      </div>

      <div class="panel-heading compact">
        <h3>Vehicle efficiency</h3>
        <p>Choose the fuel-efficiency unit.</p>
      </div>

      <div class="toggle-row" role="radiogroup" aria-label="Fuel efficiency unit">
        <button
          type="button"
          class:active={efficiencyMode === 'lPer100km'}
          on:click={() => setEfficiencyMode('lPer100km')}
        >
          Litres per 100 km
        </button>
        <button
          type="button"
          class:active={efficiencyMode === 'kmPerLitre'}
          on:click={() => setEfficiencyMode('kmPerLitre')}
        >
          Kilometres per litre
        </button>
      </div>

      <label class="wide-field" class:field-capped={limitReached.fuelEfficiency}>
        <span>
          {efficiencyMode === 'lPer100km'
            ? 'Fuel efficiency (L / 100 km)'
            : 'Fuel efficiency (km / litre)'}
        </span>
        <input
          value={fuelEfficiency}
          type="number"
          min="0"
          max={fuelEfficiencyLimit}
          step="0.1"
          aria-describedby={limitReached.fuelEfficiency ? 'fuel-efficiency-limit-message' : undefined}
          on:input={handleFuelEfficiencyInput}
        />
        {#if limitReached.fuelEfficiency}
          <small id="fuel-efficiency-limit-message" class="field-feedback">
            {fuelEfficiencyLimitText}
          </small>
        {/if}
      </label>

      <label class="checkbox-row">
        <input bind:checked={includeReturnTrip} type="checkbox" />
        <span>Include the return trip in the total estimate</span>
      </label>
    </section>

    <section class="results">
      <article class="metric-card metric-card--primary accent">
        <p>{includeReturnTrip ? 'Estimated return-trip fuel cost' : 'Estimated trip fuel cost'}</p>
        <strong>${currency(currentCase.totalCost)}</strong>
        <span>
          {number(currentCase.totalDistance)} km total distance with {number(currentCase.totalLitres)} L
          of fuel
        </span>
      </article>

      <div class="results-grid results-grid--compact">
        <article class="metric-card">
          <p>One-way cost</p>
          <strong>${currency(currentCase.tripCost)}</strong>
          <span>{number(currentCase.litresNeeded)} litres required</span>
        </article>

        <article class="metric-card">
          <p>Fuel used</p>
          <strong>{number(currentCase.totalLitres)} L</strong>
          <span>{number(currentCase.costPer100Km)} dollars per 100 km</span>
        </article>
      </div>

      <section class="chart-card">
        <div class="panel-heading compact">
          <p class="eyebrow">Trip breakdown</p>
          <h3>Quick cost split</h3>
        </div>

        <div class="chart" aria-label="Trip cost breakdown">
          {#each chartData as item}
            <div class="chart-row">
              <div class="chart-row__label">
                <strong>{item.label}</strong>
                <span>{item.detail}</span>
              </div>
              <div class="chart-row__bar-wrap">
                <div
                  class="chart-row__bar chart-row__bar--simple"
                  style={`width: ${costScale(item.value)}%`}
                ></div>
              </div>
              <div class="chart-row__value">${currency(item.value)}</div>
            </div>
          {/each}
        </div>
      </section>

      <section class="comparison-card">
        <button
          type="button"
          class="advanced-toggle"
          aria-expanded={showAdvancedWhatIf}
          on:click={() => (showAdvancedWhatIf = !showAdvancedWhatIf)}
        >
          <span>Advanced what-if</span>
          <strong>{showAdvancedWhatIf ? 'Hide scenario tools' : 'Explore a different fuel scenario'}</strong>
        </button>

        {#if showAdvancedWhatIf}
          <div class="advanced-panel">
            <div class="panel-heading compact">
              <h3>Try a different fuel scenario</h3>
              <p>Adjust fuel price or efficiency to see how much the total estimate would change.</p>
            </div>

            <div class="scenario-controls">
              <label class="slider-field" for="fuel-price-scenario">
                <span>Fuel price what-if</span>
                <strong>
                  {multiplier(fuelPriceMultiplier)}x -> ${currency(whatIfFuelPrice || 0)} / litre
                </strong>
              </label>
              <input
                id="fuel-price-scenario"
                bind:value={fuelPriceMultiplier}
                type="range"
                min="0.5"
                max="2"
                step="0.05"
              />

              <label class="slider-field" for="fuel-efficiency-scenario">
                <span>Fuel efficiency what-if</span>
                <strong>
                  {multiplier(fuelEfficiencyMultiplier)}x -> {number(whatIfFuelEfficiency || 0)}
                  {efficiencyMode === 'lPer100km' ? ' L / 100 km' : ' km / litre'}
                </strong>
              </label>
              <input
                id="fuel-efficiency-scenario"
                bind:value={fuelEfficiencyMultiplier}
                type="range"
                min="0.5"
                max="2"
                step="0.05"
              />

              <button type="button" class="ghost-button" on:click={resetWhatIfSliders}>
                Reset scenario sliders
              </button>
            </div>

            <article class="delta-card delta-card--summary">
              <p>{whatIfSummary.totalLabel}</p>
              <strong class:item-positive={whatIfSummary.totalDelta > 0} class:item-negative={whatIfSummary.totalDelta < 0}>
                {whatIfSummary.totalDelta > 0 ? '+' : whatIfSummary.totalDelta < 0 ? '-' : ''}
                ${currency(Math.abs(whatIfSummary.totalDelta))}
              </strong>
              <span>
                Current ${currency(whatIfSummary.currentTotal)} -> What-if
                ${currency(whatIfSummary.whatIfTotal)}
              </span>
              <span>
                Fuel use changes by
                {whatIfSummary.litresDelta > 0 ? ' +' : whatIfSummary.litresDelta < 0 ? ' -' : ' '}
                {number(Math.abs(whatIfSummary.litresDelta))} L
              </span>
            </article>
          </div>
        {/if}
      </section>

      <section class="notes-card">
        <h3>How it works</h3>
        <ul>
          <li>Fuel needed is based on your trip distance and vehicle efficiency.</li>
          <li>Total fuel cost is the fuel required multiplied by your fuel price.</li>
          <li>The chart shows a compact one-way versus total cost split.</li>
          <li>Input limits keep the calculator within realistic day-to-day ranges.</li>
        </ul>
      </section>
    </section>
  </main>
</div>
