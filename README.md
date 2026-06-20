# 🚀 Stickers Proyecto Marte

A PWA for optimizing delivery routes to multiple locations, built for [Proyecto Marte](https://proyectomarte.com.ar/) — a foundation that humanizes hospital spaces for children.

## Use case

Proyecto Marte funds itself by selling stickers in cafés around the city. Once a week, someone needs to visit all the cafés and restock them. This app optimizes that route automatically.

## Features

- 📍 Add locations with Google Places autocomplete
- 🗺️ Optimized route from your current GPS position (nearest-neighbor TSP)
- 🚗 One-tap turn-by-turn navigation via Google Maps (Android Auto compatible)
- ✓ Mark each stop as delivered — automatically opens Maps to the next one
- 💾 All data stored locally on device (no backend, no account needed)
- 📱 Installable as a PWA on Android

## Tech stack

- React + TypeScript + Vite
- Dexie.js (IndexedDB)
- @vis.gl/react-google-maps
- vite-plugin-pwa
- Deployed on Vercel

## Setup

### 1. Clone and install

```bash
git clone https://github.com/luc45hn/stickers-proyecto-marte.git
cd stickers-proyecto-marte
npm install
```

### 2. Google Maps API key

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a project and enable **Places API** and **Maps JavaScript API**
3. Create an API key and restrict it to your domain
4. Create a `.env.local` file:

```
VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
```

### 3. Run locally

```bash
npm run dev
```

### 4. Deploy

Connect the repo to [Vercel](https://vercel.com) and add `VITE_GOOGLE_MAPS_API_KEY` as an environment variable. Vercel auto-detects Vite.

## Android installation

Open Chrome on Android → navigate to your deployed URL → tap ⋮ → "Add to home screen".

## License

MIT
