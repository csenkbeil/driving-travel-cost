<script>
  import { format } from 'd3-format';
  import { scaleLinear } from 'd3-scale';
  import { buildChartData, buildWhatIfSummary, calculateTripCost } from './lib/costCalculator.js';

  const currency = format(',.2f');
  const number = format(',.1f');
  const multiplier = format('.2f');

  let distance = 201;
  let fuelPrice = 2.08;
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

  function resetWhatIfSliders() {
    fuelPriceMultiplier = 1;
    fuelEfficiencyMultiplier = 1;
  }

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
</script>

<svelte:head>
  <title>Driving Travel Cost</title>
</svelte:head>

<div class="shell">
  <section class="hero">
    <div class="hero-copy">
      <p class="eyebrow">Driving-cost planner</p>
      <h1>Work out your driving cost in a few quick steps.</h1>
      <p class="intro">
        Enter your trip distance, fuel price, and vehicle efficiency to get one clear estimate fast.
        If you want to explore alternatives, open the advanced what-if section after you have your
        baseline result.
      </p>
    </div>

    <div class="trip-card">
      <div class="trip-card__header">
        <p>Your estimate</p>
        <strong>{includeReturnTrip ? 'Return-trip total' : 'Trip total'}</strong>
      </div>

      <dl class="trip-stats">
        <div>
          <dt>Total cost</dt>
          <dd>${currency(currentCase.totalCost)}</dd>
        </div>
        <div>
          <dt>Fuel needed</dt>
          <dd>{number(currentCase.totalLitres)} L</dd>
        </div>
        <div>
          <dt>Cost per 100 km</dt>
          <dd>${currency(currentCase.costPer100Km)}</dd>
        </div>
      </dl>
    </div>
  </section>

  <main class="layout">
    <section class="panel">
      <div class="panel-heading">
        <p class="eyebrow">Trip inputs</p>
        <h2>Enter trip details</h2>
        <p>
          Start with the basics and the calculator will update immediately as you type.
        </p>
      </div>

      <div class="form-grid">
        <label>
          <span>Driving distance (km)</span>
          <input bind:value={distance} type="number" min="0" step="1" />
        </label>

        <label>
          <span>Current fuel price ($ / litre)</span>
          <input bind:value={fuelPrice} type="number" min="0" step="0.01" />
        </label>
      </div>

      <div class="panel-heading compact">
        <h3>Vehicle efficiency</h3>
        <p>Choose whichever fuel-efficiency unit you already know.</p>
      </div>

      <div class="toggle-row" role="radiogroup" aria-label="Fuel efficiency unit">
        <button
          type="button"
          class:active={efficiencyMode === 'lPer100km'}
          on:click={() => (efficiencyMode = 'lPer100km')}
        >
          Litres per 100 km
        </button>
        <button
          type="button"
          class:active={efficiencyMode === 'kmPerLitre'}
          on:click={() => (efficiencyMode = 'kmPerLitre')}
        >
          Kilometres per litre
        </button>
      </div>

      <label class="wide-field">
        <span>
          {efficiencyMode === 'lPer100km'
            ? 'Fuel efficiency (L / 100 km)'
            : 'Fuel efficiency (km / litre)'}
        </span>
        <input bind:value={fuelEfficiency} type="number" min="0" step="0.1" />
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
          <p>Fuel cost per 100 km</p>
          <strong>${currency(currentCase.costPer100Km)}</strong>
          <span>Based on your selected vehicle efficiency</span>
        </article>
      </div>

      <section class="chart-card">
        <div class="panel-heading compact">
          <p class="eyebrow">Trip breakdown</p>
          <h3>See the estimate at a glance</h3>
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
        <h3>How this estimate works</h3>
        <ul>
          <li>Fuel needed is based on your trip distance and vehicle efficiency.</li>
          <li>Total fuel cost is the fuel required multiplied by your fuel price.</li>
          <li>The chart shows a simple cost breakdown for the trip you entered.</li>
          <li>The advanced section lets you explore an alternative scenario without changing your baseline result.</li>
        </ul>
      </section>
    </section>
  </main>
</div>
