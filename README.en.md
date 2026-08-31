# LanguageApp

LanguageApp is a modular, production-minded cross-platform mobile frontend template aimed at language learning applications. This README is written to present the project professionally during technical evaluations.

[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE) [![Expo](https://img.shields.io/badge/expo-%5E54.0.0-blue)](https://expo.dev)

## Highlights
- Expo-based React Native app (Android / iOS / Web)
- Authentication and remote sync with Supabase
- Hybrid local DB (expo-sqlite) with synchronization patterns
- Context-based state management: Auth, Theme, Data

## Tech Stack
- React Native + Expo
- @react-navigation
- Supabase (Postgres) + expo-sqlite
- TypeScript

## Quickstart
1. git clone https://github.com/tunahanahltc/languageapp.git
2. cd languageapp && npm install
3. Add environment variables (.env): SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY (if needed)
4. Run SQL scripts in sql/ (supabase_security.sql, supabase_seed_data.sql)
5. npm run start

## API & Screenshots
- See docs/API.md for example endpoints and authentication flow
- Place app screenshots in `assets/screenshots/` and reference them in README or docs/screenshots/

## Contributing
Fork → feature/your-change → PR with clear description and testing steps.

## License
MIT (add LICENSE file to the repo to confirm)
