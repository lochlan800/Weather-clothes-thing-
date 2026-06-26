# What Should I Wear?

A small web app: search a place in England, see the current weather, and get
clothing suggestions based on it. It starts by showing the weather in **Horbury**.

## How it works

- **Search bar** — type a place (defaults to Horbury on load).
- **Weather** — fetched from the free [Open-Meteo](https://open-meteo.com) API
  (no API key needed). Geocoding turns the place name into coordinates, then the
  forecast API returns current temperature, "feels like", wind and rain chance.
- **Clothing advice** — `decideClothing()` in `app.js` picks layers based on how
  cold it feels, plus extras for rain, snow, wind and strong sun.

## Running it

It's plain HTML/CSS/JS — no build step. Open `index.html` in a browser, or serve
the folder:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Files

- `index.html` — page structure
- `styles.css` — styling
- `app.js` — search, weather fetch and clothing logic
