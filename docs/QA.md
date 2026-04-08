# LevelUp — QA checklist

Run before releases or large merges. Adjust as features grow.

## Automated (local)

```bash
npm run type-check
npm run lint
npm run build
```

- **Lint** requires `.eslintrc.json` (extends `next/core-web-vitals`). Warnings should be zero before merge.
- **Build** must complete with no type errors; note any prerender warnings in the build log.

## Database / Supabase

- [ ] Migrations applied on the target project (including `00012_coaching.sql` if coaching is in scope).
- [ ] RLS smoke test: sign in as a normal user — cannot read other users’ rows; coaching tables behave as expected.
- [ ] Superadmin (`profiles.is_admin`) can use **Users** and **Coaches** without RLS errors.

## Auth & routing

- [ ] Logged-out visit to `/dashboard`, `/journey`, `/coaching`, `/mentors`, `/assessment`, `/readiness`, `/skills` → redirect to `/login`.
- [ ] Logged-in visit to `/login` or `/signup` → redirect away (e.g. dashboard).
- [ ] `/skills` → redirects to `/assessment` after auth.

## Member flows

- [ ] **Home** (logged in): primary CTAs and nav include Coaching; no console errors.
- [ ] **Leaders**: grid loads; selection / slot flow works; images fall back sensibly if URLs break.
- [ ] **Onboarding**: steps complete; mentor persists.
- [ ] **Assessment**: run or view latest; gaps feed **Coaching → Current goals** when present.
- [ ] **Journey**: semesters render; **Your coach** row per semester (assigned vs “Haven’t been assigned yet”); horizontal rails scroll.
- [ ] **Coaching**: goals, coach tasks (or “No current tasks”), booking / unassigned copy; Calendly embed loads when coach + URL exist (check network / third-party blockers).
- [ ] **Progress / Readiness**: checklist and navigation still work.

## Superadmin

- [ ] Non-admin cannot open `/superadmin/*` (redirect to dashboard).
- [ ] **Coaches**: list, create, edit, delete; inactive coaches hidden from members.
- [ ] **Users**: assign / clear coach; log session (tasks + optional notes); member sees updated tasks on Coaching tab.
- [ ] If coaching tables are missing, amber **migration** banners appear on Coaching (member), Users, and Coaches (admin) — not a generic 500.

## Design & a11y (spot check)

- [ ] **Mobile**: bottom tab bar labels readable (6 tabs); no overlap with `pb-safe` content.
- [ ] **Coach strip** on Journey: link has a clear purpose for screen readers (`aria-label` when unassigned).
- [ ] Focus order sensible on login/signup and main forms.

## Production-only

- [ ] Env vars set: `NEXT_PUBLIC_SUPABASE_*`, `SUPABASE_SERVICE_ROLE_KEY` (server only), AI keys if used.
- [ ] If using a strict **Content-Security-Policy**, allow Calendly `frame-src` / script domains for `/coaching`.

## Regression triggers (re-run relevant sections)

- New Supabase tables or RLS policies.
- Changes to `middleware.ts` protected paths.
- New client boundaries or server actions for forms (verify error handling).
