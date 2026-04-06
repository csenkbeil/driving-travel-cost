# Svelte and D3 Patterns

Use this reference when building charts, dashboards, timelines, network views, or animated graphics inside Svelte components.

## Recommended Ownership Split

- Svelte owns component composition, props, stores, conditional rendering, semantic markup, and most mark rendering.
- D3 owns scales, axes helpers, layouts, path generation, interpolation, spatial math, drag/zoom/brush behaviors, and data transforms.
- Shared helper modules own reusable formatting, domain calculation, and chart configuration.

## Good Default Architecture

1. Normalize incoming data close to the boundary.
2. Derive scales and geometry from normalized data.
3. Render marks declaratively in Svelte.
4. Attach imperative D3 behavior only where needed.
5. Lift only reusable interaction state into stores.

## Reach for Imperative D3 When

- A behavior requires direct DOM ownership, such as `zoom`, `brush`, or `drag`.
- Canvas rendering is significantly faster than SVG for the target density.
- Transition choreography is already D3-based and replacing it would increase complexity.

## Prefer Declarative Svelte When

- Rendering bars, lines, points, labels, areas, and legends with manageable mark counts.
- Expressing loading and empty states.
- Coordinating chart state with surrounding filters, tabs, route params, or forms.

## Performance Checklist

- Memoize expensive derived arrays only when profiling shows repeat work is costly.
- Avoid rebuilding projections, quadtrees, or large path strings on unrelated state changes.
- Throttle or batch pointer-driven updates when they trigger heavy recomputation.
- Use canvas or level-of-detail strategies for dense scatterplots, heatmaps, or moving particles.
- Virtualize long tables and side panels around charts when layout thrash becomes visible.

## Integration Notes

- In SvelteKit, guard browser-only code with environment checks or client-only mounting.
- Keep resize behavior explicit; use `ResizeObserver` or existing app utilities instead of window resize hacks.
- For tooltips, separate screen coordinates from data selection state so touch and keyboard interactions remain possible.
- For animations, prefer meaningful entry/update/exit motion and avoid running transitions on every reactive change.
