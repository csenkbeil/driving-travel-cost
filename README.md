# Driving Travel Cost

A static Svelte application for estimating the fuel cost of a driving trip with a simple baseline calculator and an optional advanced what-if section. The calculator runs entirely in the browser and does not require a backend server or any live API integration.

## Features

- Provide manual distance, current fuel price, and vehicle fuel efficiency.
- Get one clear baseline trip estimate with a compact breakdown view.
- Explore an optional what-if scenario driven by fuel price and fuel efficiency sliders.
- Switch between `L/100 km` and `km/L` efficiency units.
- Compare one-way and return-trip estimates and optionally see how a scenario would change total cost and fuel usage.
- Use a mobile-friendly and desktop-friendly responsive interface.
- Generate a production-ready static build in `dist/`.

## How the calculation works

1. Convert the vehicle efficiency to litres per 100 kilometres when needed.
2. Calculate litres required for the one-way journey from distance and efficiency.
3. Multiply litres required by the fuel price to estimate cost.
4. Double the totals when the return-trip option is enabled.
5. Optionally apply scenario multipliers from half to double for fuel price and fuel efficiency to compare a second case against the baseline result.

## Development

```bash
npm install
npm run dev
```

Open the local Vite URL shown in the terminal to use the app in development mode.

## Testing

```bash
npm run test
```

The project includes:

- Unit tests for the calculation helpers in `src/lib/costCalculator.js`
- A UI-level test for the interactive calculator in `src/App.svelte`

## Production build

```bash
npm run build
```

Deploy the generated `dist/` folder to any static hosting provider.

### Optional base path

The app supports an optional `BASE_PATH` environment variable for subpath hosting.

- Leave `BASE_PATH` unset to build for root hosting at `/`
- Set `BASE_PATH=/driving-travel-cost` to build for `/driving-travel-cost/`

The value is normalized automatically:

- empty or unset -> `/`
- `/` -> `/`
- `/driving-travel-cost` -> `/driving-travel-cost/`

Examples:

```bash
npm run build
BASE_PATH=/driving-travel-cost npm run build
```

PowerShell:

```powershell
npm run build
$env:BASE_PATH = '/driving-travel-cost'
npm run build
Remove-Item Env:BASE_PATH
```

## Docker

The container reads the resolved base path from the generated build output, so the Docker image serves the same path that Vite built for.

Build and run the app at the root path:

```bash
npm run build
docker build -t driving-travel-cost .
docker run --rm -p 8080:80 driving-travel-cost
```

Then open `http://localhost:8080`.

Build and run the app under `/driving-travel-cost/`:

```bash
BASE_PATH=/driving-travel-cost npm run build
docker build -t driving-travel-cost .
docker run --rm -p 8080:80 driving-travel-cost
```

Then open `http://localhost:8080/driving-travel-cost/`.

## Deploy to GitHub Pages

This app can be deployed to GitHub Pages as a static Vite site.

### 1. Set the Vite base path

For a project site hosted at `https://<your-user-name>.github.io/DrivingTravelCost/`, build with:

```bash
BASE_PATH=/DrivingTravelCost npm run build
```

If you are deploying to a user or organization site such as `https://<your-user-name>.github.io/`, build with the default root path instead:

```bash
npm run build
```

### 2. Add a GitHub Actions workflow

Create [\.github/workflows/deploy.yml](c:\Users\cliff\Development\DrivingTravelCost\.github\workflows\deploy.yml) with:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 24
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Build app
        run: BASE_PATH=/driving-travel-cost npm run build

      - name: Upload Pages artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### 3. Enable GitHub Pages in the repository

In GitHub:

1. Open `Settings`.
2. Open `Pages`.
3. Under `Build and deployment`, choose `GitHub Actions`.

### 4. Push to main

Commit your changes and push to `main`:

```bash
git add README.md vite.config.js .github/workflows/deploy.yml
git commit -m "Add GitHub Pages deployment setup"
git push origin main
```

After the workflow finishes, the app will be available at:

`https://<your-user-name>.github.io/driving-travel-cost/`
