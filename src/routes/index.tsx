import { createFileRoute, Link } from "@tanstack/react-router";
import { Brand, StepsIllustration } from "@/components/brand";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Tiny Wins — Small steps. Real progress." },
      { name: "description", content: "A calm personal gallery for recognizing and celebrating your small accomplishments." },
      { property: "og:title", content: "Tiny Wins — Small steps. Real progress." },
      { property: "og:description", content: "A calm personal gallery for recognizing and celebrating your small accomplishments." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-5">
      <header className="flex items-center justify-between py-6">
        <Brand />
        <Button asChild variant="ghost"><Link to="/auth">Sign in</Link></Button>
      </header>
      <main className="grid flex-1 items-center gap-10 py-10 md:grid-cols-2">
        <div className="space-y-6">
          <h1 className="text-5xl font-semibold leading-tight md:text-6xl">Small steps.<br />Real progress.</h1>
          <p className="max-w-md text-lg text-muted-foreground">Every little achievement deserves a place. Tiny Wins is a quiet gallery for the things you did today.</p>
          <Button asChild size="lg"><Link to="/dashboard">Start your gallery</Link></Button>
        </div>
        <StepsIllustration className="w-full" />
      </main>
    </div>
  );
}
