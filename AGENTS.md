<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep progress calculations in the browser-safe wins helpers and render the shared ProgressStory from authenticated achievement records; this avoids invented or cross-account statistics.
- Keep the growth journey as a static, decorative inline SVG in the shared brand component; plant size is not a progress indicator.
- My Growth Story and the Win Garden render only real authenticated achievement records (grouped by month); never seed or fabricate sample wins. The Win Garden shows a static local illustration and reports only stats derived from `src/lib/garden.ts`.
- Restore and inspect the original backend before adding AI or goals; never provision a replacement connection for a remix without the user's approval.
- Lovable AI calls live in a server-only `*.server.ts` module (gateway helpers in `src/lib/run-id.ts`) and are imported dynamically inside `*.functions.ts` handlers; protected server functions rely on the `attachSupabaseAuth` client middleware registered in `src/start.ts` to attach the bearer token.
- Growth AI uses narrowly scoped authenticated RPCs and paginated owner-filtered reads; achievement DATE month boundaries use calendar strings without timezone conversion, and generated reflections remain transient component state to avoid schema changes.
- Future letters become "delivered" by comparing deliver_at with the clock (no job flips a status); email_* columns are reserved for a future server-side sender and are never written by the browser.
