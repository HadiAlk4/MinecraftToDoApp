# Minecraft To-Do App

A Minecraft-themed to-do list app built with React Native and Expo. Add to-dos with a description and due date, tick them off, delete them, and put them on a calendar.

## Live demo

**https://hadialk4.github.io/MinecraftToDoApp/**

The web demo uses a demo calendar sign-in, so it doesn't touch your Google account. To-dos are saved in your browser.

## Run it locally

```bash
npm install
npm start        # Expo dev server (press w for web, a for Android, i for iOS)
```

Other scripts:

- `npm run web` – start in the browser
- `npm run build:web` – build the website into `dist/`
- `npm test` – run the calendar tests

## Google Calendar (optional)

To use a real Google account instead of the demo sign-in, set the `EXPO_PUBLIC_GOOGLE_*` client ID environment variables (or the matching `extra` values in `app.json`).

## Deployment

Every push to `main` rebuilds the website and publishes it to GitHub Pages via `.github/workflows/deploy-website.yml`.
