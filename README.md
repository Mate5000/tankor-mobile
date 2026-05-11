# Verseny Mobile

Expo (React Native) companion to the Verseny education-portal monorepo. Talks to the existing `apps/api` Fastify backend at `v1/apps/api`. The mobile codebase is intentionally separate from the monorepo so it can be developed and shipped independently.

## Stack

- **Expo SDK 52** with **Expo Router** (file-based, typed routes)
- **TypeScript**, strict
- **TanStack Query** for server state
- **Zustand** for auth state
- **expo-secure-store** for refresh-token persistence (mobile substitute for the web app's httpOnly cookie)
- **expo-camera** for QR check-in scanning
- **date-fns** with HU + EN locales
- Custom design system — no UI library — light + dark themes

## What it covers

| Surface | Status |
| --- | --- |
| Server-URL setup (first launch) | ✅ |
| Login + invite registration | ✅ |
| Role-aware dashboard (student / instructor / admin) | ✅ |
| Course browsing, enrolling, detail view | ✅ |
| 30-day schedule view, grouped by day | ✅ |
| Announcements + notifications (polling) | ✅ |
| Profile editing, password change, theme, locale | ✅ |
| Assignment view + submit | ✅ |
| QR check-in (instructor opens, student scans) | ✅ |
| Instructor: courses I teach, lesson/assignment/student tabs | ✅ |
| Admin: users + invites | ✅ |
| Real-time SSE | Replaced by 20-30s polling (RN EventSource is brittle) |
| Messages, events, surveys | Not in MVP — easy to add following the same pattern |

## Run

```bash
cd mobile
npm install   # or pnpm install
npx expo start
```

Then either scan the QR with Expo Go (iOS/Android) or press `a` / `i` for emulator.

**First launch:** the app shows a setup screen where you enter the API URL. On a phone, **do not use `localhost`** — use your computer's LAN IP, e.g. `http://192.168.0.10:3001`. The URL is probed against `/healthz` before being saved to SecureStore. You can change it later from Profile → Server.

## How auth works on mobile

The web app stores the refresh token in an httpOnly cookie. React Native has no equivalent — we instead:

1. On `/auth/login`, parse the `Set-Cookie` header for `verseny_rt` and store the value in SecureStore.
2. On every API call, send `Cookie: verseny_rt=<value>` manually.
3. On 401, hit `/auth/refresh` once. A successful refresh returns a new `Set-Cookie` we re-store.
4. Access token lives only in memory (Zustand) — restored on cold start by replaying the refresh token.

The API didn't need any changes.

## Layout

```
mobile/
├── app/                          # expo-router routes
│   ├── _layout.tsx              # providers + auth-aware redirects
│   ├── setup.tsx                # server URL config
│   ├── (auth)/                  # login, register
│   ├── (tabs)/                  # dashboard, courses, schedule, inbox, profile
│   ├── courses/[id].tsx         # course detail
│   ├── assignments/[id].tsx     # assignment + submit
│   ├── lessons/[id]/checkin.tsx # QR check-in (modal)
│   ├── teach/                   # instructor screens
│   └── admin/                   # admin tools
├── src/
│   ├── api/                     # fetch wrapper + endpoint helpers
│   ├── components/              # design system primitives
│   ├── hooks/                   # useApiError
│   ├── i18n/                    # HU + EN dictionaries
│   ├── store/                   # zustand auth store
│   ├── theme/                   # tokens + ThemeProvider
│   ├── types/                   # DTOs (mirrored from packages/shared)
│   └── utils/                   # date formatters
└── assets/                      # icon / splash placeholders
```

## Notes

- **No image upload yet** for avatars or submissions — text-only assignment content is supported.
- **The faux QR** rendered on the instructor's check-in screen is a visual placeholder, but the **lesson ID** beneath it is what the student scans (or types). The student's camera reads any QR encoding the lesson ID or a `…/check-in/<id>` URL.
- Demo accounts seeded by the API (when running with `DEMO_MODE`) are shown on the login screen — tap a row to fill the form.
