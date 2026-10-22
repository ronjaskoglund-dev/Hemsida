# Ronja Skoglunds portfolio

Statisk portfolio byggd med HTML, CSS och JavaScript. Vite sammanställer källfilerna i `src/` till den genererade publiceringsmappen `dist/`.

## Kommandon

```bash
pnpm install
pnpm dev
pnpm build
pnpm check
pnpm preview
```

`pnpm optimize:images` skapar optimerade WebP-versioner när en källbild har bytts ut. Kör därefter `node scripts/enhance-media.mjs` om en helt ny bildreferens har lagts till.

## Struktur

- `src/*.html` – webbplatsens sex sidor.
- `src/partials/` – gemensamt sidhuvud och sidfot.
- `src/styles/` – grundregler, komponenter och sidunika stilar.
- `src/scripts/` – tema, språk, cookies, analys och kontaktformulär.
- `src/assets/` – endast resurser som används av webbplatsen.
- `archive/` – äldre och oanvända resurser som inte publiceras.
- `dist/` – genereras av bygget och versionshanteras inte.

Publicera aldrig genom att redigera `dist/` manuellt. Ändra källfilerna i `src/` och kör ett nytt bygge.
