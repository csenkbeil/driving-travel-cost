# Mapping Checklist

Use this reference when implementing map-heavy product features in Svelte.

## Choose the Right Stack

- Use SVG overlays for accessible thematic layers with moderate feature counts.
- Use canvas overlays for large point clouds, trajectories, or frequent redraws.
- Use WebGL-backed libraries when feature counts or 3D interaction exceed what canvas can comfortably handle.
- Keep library choice aligned with the existing repo unless there is a clear product or performance reason to switch.

## Core State Model

Track these explicitly when relevant:

- viewport or bounds
- zoom level
- selected feature
- hovered feature
- active filters
- fetched tiles or visible data window

## Data Pipeline

1. Confirm the source coordinate reference system.
2. Normalize GeoJSON or tabular coordinates before rendering.
3. Simplify, cluster, or aggregate dense data before drawing.
4. Avoid fetching the full world when viewport-based loading is possible.

## Interaction Checklist

- Support hover and click independently.
- Make popups and tooltips resilient near viewport edges.
- Keep zoom and pan smooth when overlays update.
- Provide a non-pointer path for critical actions where practical.
- Test hit targets on touch screens, not only with a mouse.

## Visual Design Checklist

- Ensure thematic color scales remain legible over the chosen basemap.
- Keep choropleth legends and symbol legends synchronized with the actual encoding.
- Use line widths, point radii, and opacity intentionally; maps become noisy quickly.
- Reserve annotation for the few locations or routes that carry the story.

## Common Failure Modes

- Reprojecting data inconsistently between layers.
- Recomputing every feature path on minor UI state changes.
- Tying tooltip state to fragile array indices instead of stable identifiers.
- Letting basemap styling overpower the data layer.
- Shipping a map that works on desktop but not on touch devices.
