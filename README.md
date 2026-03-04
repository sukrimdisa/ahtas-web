# AHTAS Web — Frontend

React + Vite + lucide-react premium dark-theme UI for the AHTAS Therapy Booking System.

## Quick Start

### Prerequisites
- Node.js v20 LTS — https://nodejs.org/en/download
- Backend (`ahtas-api`) must be running on http://localhost:4000

### Install & run
```bash
cd ahtas-web
npm install
npm run dev
```
Frontend runs at: **http://localhost:5173**

---

## Pages & Routes

| Route             | Page                | Who uses it          |
|-------------------|---------------------|----------------------|
| `/`               | Booking Calendar    | Customer             |
| `/therapist`      | Therapist Day View  | Therapist            |
| `/therapist-week` | Therapist Week View | Therapist            |
| `/admin`          | Admin Dashboard     | Admin                |
| `/login`          | Login               | All                  |

---

## Features

### Booking Calendar (`/`)
- Select service → therapist → date
- Full slot grid (green = available, grey = unavailable)
- Auto-refresh every 15 seconds
- Confirm booking → auto room allocation
- Shows suggested slots on conflict

### Therapist Day View (`/therapist`)
- Shows all appointments for selected date
- Colour-coded status badges (BOOKED, CONFIRMED, COMPLETED, NO_SHOW)
- Real-time refresh every 15s

### Therapist Week View (`/therapist-week`)
- Mon–Sun 7-column grid
- Navigate prev/next week
- Today column highlighted in blue
- Real-time refresh every 15s

### Admin Dashboard (`/admin`)
- Date range picker
- Total bookings count
- No-show rate (colour-coded: green/amber/red)
- Utilisation % with animated progress bar
- Booked minutes vs available minutes

---

## Tech Stack

| Package          | Purpose                    |
|------------------|----------------------------|
| React 18         | UI framework               |
| Vite 5           | Build tool & dev server    |
| react-router-dom | Client-side routing        |
| axios            | HTTP client                |
| lucide-react     | Icon library               |
