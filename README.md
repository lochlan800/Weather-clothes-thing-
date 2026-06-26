# What Should I Wear?

A small web app: search any place in the world, see the current weather, and get
clothing suggestions based on it. It starts by showing the weather in **Horbury**.

## How it works

- **Search bar** — type any place worldwide (defaults to Horbury on load).
- **Weather** — fetched from the free [Open-Meteo](https://open-meteo.com) API
  (no API key needed). Geocoding turns the place name into coordinates, then the
  forecast API returns current temperature, "feels like", wind and rain chance.
- **Activity** — pick what you're doing (out and about, walking, running,
  cycling, gardening, chilling indoors) and the advice adjusts: active choices
  like running let you dress lighter and add kit like trainers, while "chilling
  indoors" ignores the weather and just suggests comfy clothes.
- **Clothing advice** — `decideClothing()` in `app.js` picks layers based on how
  cold it feels (offset by the activity), plus extras for rain, snow, wind and
  strong sun. Changing the activity updates the advice without re-fetching.
- **The week ahead** — a daily forecast (up to 16 days, as far as Open-Meteo
  provides) showing each day's high/low temperature, conditions and rain chance.

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
