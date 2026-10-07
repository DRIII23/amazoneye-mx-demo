# AmazonEye MX — Delivery Partner Platform (Demo)

A small demo web app for an Amazon-affiliated delivery platform in Mexico.
When a delivery partner can't reach a customer's door (riots, extreme weather,
regional hazards), the platform reroutes the package to the nearest **OXO**
convenience store as an alternative pickup point, so partners keep their KPIs
and customers still get their parcels.

> Built with **Vite + Tailwind CSS + vanilla JS**. Mock data only — no backend.

## Run it

```bash
npm install
npm run dev
```

Open the printed localhost URL (default http://localhost:5173).

## Two roles

Use the tabs in the header to switch.

### 🚚 Delivery Partner
- **Interactive map of Mexico** (SVG, stylized) with OXO stores, city labels,
  package routes, and reported hazard zones.
- **Report a blocked zone** — pick a reason (civil unrest / weather / hazard) and
  severity, then click the map to drop the zone. Any package whose destination
  falls inside is automatically flagged and rerouted to its nearest OXO.
- **Redirect & confirm** — for each blocked package the panel shows the nearest
  OXO and distance; the partner confirms the drop-off and the status updates.

### 👤 End User
- **Track packages** on the map (route, current position, OXO fallback leg).
- **Notifications** — disruption alerts appear when a package is rerouted.
- **Choose** to *pick up at OXO* or *wait for later delivery*; delay alerts show
  the reason.

## Project layout

```
src/
  main.js             app shell, action router, render loop
  store.js            tiny reactive store + all actions (zone/package logic)
  geo.js              projection + distance helpers
  data/               mock packages, zones, OXO stores
  map/
    mexicoOutline.js  stylized Mexico coastline (mainland + Baja)
    map.js            interactive SVG map renderer
  ui/
    partner.js        delivery partner panel
    user.js           end user panel
    components.js     shared badges / section titles
```

> Note: the real Mexican convenience-store brand is **OXXO** (FEMSA) — spelled
> "OXO" throughout to match the demo spec. Change `src/data/oxoStores.js` if
> you want the real spelling.
