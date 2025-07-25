# AniCrush – Seanime onlinestream-provider

## Two ways to install

### 1) **Manifest with payloadUri (recommended)**
- Upload both `manifest.json` and `provider.ts` to your GitHub repo under `AniCrush/`.
- Edit `manifest.json` and set `payloadUri` to the **raw** URL to `provider.ts`.
- In Seanime, add the **raw manifest.json** link.

### 2) **Inline manifest (one-file)**
- Use `manifest-inline.json` (already includes the provider code under `payload`).
- Upload it to GitHub and install it directly in Seanime.

---

## Files

- `provider.ts` – the provider logic with debug logs in `findEpisodes`.
- `manifest.json` – uses `payloadUri` (change the placeholder to your raw GitHub URL).
- `manifest-inline.json` – already contains the provider code inside `payload` (no extra files needed).
