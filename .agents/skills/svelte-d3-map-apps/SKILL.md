---
name: svelte-d3-map-apps
description: Senior Svelte implementation guidance for data visualization, geospatial interfaces, and D3-driven interaction design. Use when Codex needs to build or improve Svelte or SvelteKit applications featuring charts, dashboards, animated SVG/canvas views, map layers, spatial filtering, projection work, or reusable visualization architecture with strong performance and UX discipline.
---

# Svelte D3 Map Apps

Build visualization-heavy Svelte interfaces that feel deliberate, performant, and maintainable. Favor component boundaries that keep Svelte in charge of state and layout while using D3 for scales, geometry, layout math, axes, behaviors, and transitions where it adds real leverage.

## Workflow

1. Inspect the app before changing it.
   Identify Svelte vs SvelteKit, Svelte version, styling approach, charting stack, map stack, and whether rendering happens in SVG, canvas, WebGL, or a hybrid.
2. Preserve the local architecture.
   Follow existing component conventions, store patterns, route structure, naming, and testing style before introducing new primitives.
3. Decide the rendering split early.
   Let Svelte own data flow, conditional UI, and accessibility semantics. Let D3 own calculations and narrowly scoped DOM behavior. Avoid full DOM takeovers unless the feature is already written that way.
4. Match the renderer to the workload.
   Use SVG for lower-density charts and rich semantics, canvas for thousands of marks or animated particles, and hybrid layering when both accessibility and throughput matter.
5. Design for interaction from the start.
   Tooltips, hover states, brushing, zooming, legends, filtering, and mobile gestures should be part of the component contract, not bolted on at the end.
6. Verify with real states.
   Check empty, loading, error, narrow viewport, high-density, and slow-device scenarios before calling the work done.

## Implementation Rules

- Prefer D3 utilities over D3-controlled app state.
- Keep derived visual state close to the component or in focused helper modules rather than spreading chart math across many files.
- Compute scales, domains, extents, bins, projections, and path generators in plain functions or reactive blocks; keep side effects isolated.
- Use `bind:this`, actions, or lifecycle hooks when D3 must touch the DOM directly.
- Avoid unnecessary store churn for pointer movement or animation frames; local component state is often the right tool.
- Preserve keyboard access and descriptive labels for interactive marks, filters, and map controls.
- Treat legends, annotations, empty states, and unit labeling as part of the chart, not polish.

## Svelte and D3 Patterns

Read [references/svelte-d3-patterns.md](./references/svelte-d3-patterns.md) when the task involves chart architecture, reactive D3 usage, transitions, or performance tuning in Svelte components.

Default approach:

```svelte
<script>
  import { scaleLinear } from 'd3-scale';

  let { data, width = 640, height = 320 } = $props();

  const margin = { top: 16, right: 16, bottom: 28, left: 40 };

  $: innerWidth = width - margin.left - margin.right;
  $: innerHeight = height - margin.top - margin.bottom;
  $: x = scaleLinear()
    .domain([0, Math.max(...data.map((d) => d.x), 1)])
    .range([0, innerWidth]);
</script>
```

Use D3 for scale/projection/path creation, then render marks with Svelte templating unless profiling shows a real need for imperative drawing.

## Mapping and Geospatial Work

Read [references/mapping-checklist.md](./references/mapping-checklist.md) when the task involves slippy maps, choropleths, symbol maps, route overlays, geolocation, or viewport-driven data loading.

Map-specific defaults:

- Pick the projection or tile system first; it determines data transforms, hit testing, and zoom behavior.
- Separate basemap, data overlay, labels, and interaction layers so each can change independently.
- Keep viewport state explicit: center, zoom, bearing, pitch, bounds, hovered feature, selected feature.
- Simplify or cluster dense features before rendering if interaction drops frames.
- Be careful with SSR in SvelteKit; browser-only map code often belongs behind client guards or lazy-loaded components.

## Delivery Standard

- Make the result responsive across desktop and mobile.
- Verify performance for realistic data size, not only toy samples.
- Add or update tests for calculation logic and important user flows; if no testing pattern exists, create a lightweight one rather than skipping coverage.
- Document non-obvious data contracts inline with short comments instead of long prose.
- Update `README.md` whenever the feature, setup, commands, deployment shape, or testing story changes.
- Explain tradeoffs when choosing between SVG, canvas, map libraries, or interaction models.
