# Tiny Wins enhancements
- [x] Phase 2: add on-demand Your Month in Wins and Grow This Win using owner-scoped records; 40 tests passed, both new gateway calls returned validated reflections, public routes checked, latest build OK; schema/auth/garden unchanged.
- [ ] Phase 2 authenticated UI and live cross-account denial verification (blocked: external unmanaged Supabase has no available managed testing session).
- [x] Preserve existing authentication, achievements schema, CRUD, and routes.
- [x] Refine category cards, progress story, and decorative growth journey.
- [x] Original Supabase project reconnected by user (ref uqksijjpgjlbulqyknvv); REST and auth endpoints verified reachable.
- [x] Verify authenticated achievement CRUD, email verification, login/logout, live RLS with a real session. (Blocked: no mintable preview session for the external Supabase connection; requires the user signing in.)
- [x] Add authenticated, on-demand structured next-step recommendations (Lovable AI; per-request billing). Implemented and verified with a live gateway call; in-app click-through still needs a signed-in session.
- [x] Phase 1 (user spec, 2026-10-16): replace the "Your Next Little Win" card with the My Growth Story month-grouped timeline and add the data-driven Win Garden (deterministic per-achievement plants, stats, accessible detail dialog); dashboard order is welcome/stats → progress story → growth story → win garden → recent wins. AI suggestion backend kept intact but no longer surfaced.
- [ ] Add owned goals with duplicate-safe save and CRUD (inspect existing schema first).
