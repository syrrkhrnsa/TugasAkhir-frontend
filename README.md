# TugasAkhir-frontend

Web app for **waqf (wakaf) land management**, the client of [TugasAkhir-backend](https://github.com/syrrkhrnsa/TugasAkhir-backend). Built as my final project for PC Persis Banjaran.

## Features

**Public**
- Landing page and waqf explorer with an interactive map (Leaflet)
- Land and facility detail pages, PDF viewer

**Authenticated portal**
- Dashboard with statistics and charts
- Land, certificate, facility and inventory management (CRUD)
- Draw land boundaries on the map (polygon drawing, area calculation)
- Approval inbox, notifications, activity log

## Tech stack

React 19 · React Router 7 · Tailwind CSS · Axios · Leaflet / react-leaflet / leaflet-draw · Turf.js · Chart.js

## Run locally

Requirements: Node.js 18+, the backend running on `http://127.0.0.1:8000`.

```bash
git clone https://github.com/syrrkhrnsa/TugasAkhir-frontend.git
cd TugasAkhir-frontend
cp .env.example .env     # then fill in the values
npm install
# some libraries used in src/ are not listed in package.json yet, install them too:
npm install leaflet react-leaflet leaflet-draw leaflet-control-geocoder @turf/turf wellknown chart.js react-chartjs-2 react-icons react-pdf styled-components sweetalert2 http-proxy-middleware
npm start
```

`.env` values:

```
REACT_APP_API_URL=http://127.0.0.1:8000/api
REACT_APP_BINDERBYTE_API_KEY=<your key from binderbyte.com>   # region (province/city) dropdowns
```

## Notes

This is a student project and a work in progress. Known improvements: add the missing libraries to `package.json` (versions must be chosen to work with React 19), move the remaining hardcoded `http://127.0.0.1:8000` URLs to `REACT_APP_API_URL`, and replace the CRA boilerplate test.

Security note: variables starting with `REACT_APP_` are bundled into the public JavaScript, so use a restricted, rotatable key for the region API.
