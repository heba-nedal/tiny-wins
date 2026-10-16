import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Flower2, Layers, Palette, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CategoryIcon } from "@/components/win-card";
import { categoryFill, gardenPlants, gardenStats, type Plant } from "@/lib/garden";
import { categoryMeta, formatDate, type Win } from "@/lib/wins";

const WIDTH = 720;
const HEIGHT = 250;
const GROUND_Y = 210;

function PlantShape({ plant }: { plant: Plant }) {
  const fill = categoryFill(plant.win.category);
  switch (plant.variant) {
    case "sprout":
      return (
        <>
          <path d="M0 0Q-1.5 -14 0 -27" className="stroke-heading" strokeWidth={2.4} fill="none" strokeLinecap="round" />
          <path d="M0 -11Q-15 -10 -18 -24Q-2 -25 0 -11Z" className={`${fill} stroke-heading`} strokeWidth={1} strokeLinejoin="round" />
          <path d="M0 -18Q15 -16 18 -30Q2 -31 0 -18Z" className={`${fill} stroke-heading`} strokeWidth={1} strokeLinejoin="round" />
        </>
      );
    case "leaf":
      return (
        <>
          <path d="M0 0Q-2 -20 0 -42" className="stroke-heading" strokeWidth={2.4} fill="none" strokeLinecap="round" />
          <path d="M0 -12Q-16 -12 -20 -30Q-3 -30 0 -12Z" className={`${fill} stroke-heading`} strokeWidth={1} strokeLinejoin="round" />
          <path d="M0 -24Q16 -23 20 -40Q3 -40 0 -24Z" className={`${fill} stroke-heading`} strokeWidth={1} strokeLinejoin="round" />
          <path d="M0 -36Q-10 -36 -13 -48Q0 -47 0 -36Z" className={`${fill} stroke-heading`} strokeWidth={1} strokeLinejoin="round" />
        </>
      );
    case "flower":
      return (
        <>
          <path d="M0 0Q-1 -18 0 -37" className="stroke-heading" strokeWidth={2.4} fill="none" strokeLinecap="round" />
          <path d="M0 -10Q-10 -9 -12 -18Q-1 -19 0 -10Z" className={`${fill} stroke-heading`} strokeWidth={1} strokeLinejoin="round" />
          <g transform="translate(0 -42)">
            {[0, 72, 144, 216, 288].map((a) => (
              <ellipse key={a} cx={0} cy={-6.5} rx={3.4} ry={7} transform={`rotate(${a})`} className={`${fill} stroke-heading`} strokeWidth={1} />
            ))}
            <circle r={3.6} className="fill-gold stroke-heading" strokeWidth={1} />
          </g>
        </>
      );
  }
}

export function WinGarden({ wins, onAdd }: { wins: Win[]; onAdd: () => void }) {
  const [selected, setSelected] = useState<Win | null>(null);
  const plants = gardenPlants(wins);
  const stats = gardenStats(wins);
  const selectedMeta = selected ? categoryMeta(selected.category) : null;

  return (
    <section className="border-y py-6" aria-labelledby="win-garden-title">
      <div className="flex items-center gap-2">
        <Flower2 className="h-5 w-5 text-heading" strokeWidth={1.6} />
        <h2 id="win-garden-title" className="text-2xl font-semibold">Win Garden</h2>
      </div>
      <p className="mt-1 text-muted-foreground">Every little win helps something grow.</p>

      {wins.length === 0 ? (
        <div className="mt-5 flex flex-col items-center gap-4 rounded-2xl border border-dashed bg-card/60 p-10 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-sage text-heading"><Flower2 strokeWidth={1.6} /></span>
          <h3 className="text-xl font-semibold">Your garden is waiting to grow</h3>
          <p className="max-w-sm text-muted-foreground">Every win you record plants something new here.</p>
          <Button onClick={onAdd}><Plus /> Record your first win</Button>
        </div>
      ) : (
        <>
          <dl className="mt-5 grid grid-cols-3 gap-4">
            <div><dt className="text-sm text-muted-foreground">Total wins</dt><dd className="mt-1 font-display text-2xl text-heading">{stats.total}</dd></div>
            <div><dt className="text-sm text-muted-foreground">Categories</dt><dd className="mt-1 font-display text-2xl text-heading">{stats.categories}</dd></div>
            <div><dt className="text-sm text-muted-foreground">Flowers bloomed</dt><dd className="mt-1 font-display text-2xl text-heading">{stats.flowers}</dd></div>
          </dl>

          <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="mt-4 w-full" role="group" aria-label="Your win garden">
            <line x1={12} y1={GROUND_Y} x2={WIDTH - 12} y2={GROUND_Y} className="stroke-heading/30" strokeWidth={2} strokeLinecap="round" />
            {plants.map((plant, i) => {
              const x = 24 + ((WIDTH - 48) / plants.length) * (i + 0.5);
              const m = categoryMeta(plant.win.category);
              return (
                <g key={plant.win.id} transform={`translate(${x} ${GROUND_Y - plant.jitter}) scale(${plant.scale})`}>
                  <g
                    className="garden-sway cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
                    style={{ animationDelay: `${plant.delay}s` }}
                    role="button"
                    tabIndex={0}
                    aria-label={`${plant.win.title}, ${m.label}, ${formatDate(plant.win.achievement_date)}`}
                    onClick={() => setSelected(plant.win)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setSelected(plant.win);
                      }
                    }}
                  >
                    <PlantShape plant={plant} />
                  </g>
                </g>
              );
            })}
          </svg>

          {stats.hidden > 0 && (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Layers className="h-4 w-4" strokeWidth={1.6} />
              Showing your {stats.total - stats.hidden} most recent plants — all {stats.total} wins live in your story and <Link to="/gallery" className="text-primary hover:underline">gallery</Link>.
            </p>
          )}
        </>
      )}

      <Dialog open={!!selected} onOpenChange={(o) => { if (!o) setSelected(null); }}>
        <DialogContent className="sm:max-w-md">
          {selected && selectedMeta && (
            <DialogHeader>
              <div className="mb-2 flex items-center gap-3">
                <CategoryIcon win={selected} />
                <span className="text-sm text-muted-foreground">{selectedMeta.label} · {formatDate(selected.achievement_date)}</span>
              </div>
              <DialogTitle dir="auto" className="break-words font-display text-2xl text-heading">{selected.title}</DialogTitle>
              <DialogDescription dir="auto" className="whitespace-pre-wrap pt-2 text-base text-foreground">
                {selected.description || "No description added."}
              </DialogDescription>
            </DialogHeader>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" asChild>
              <Link to="/gallery"><Palette className="h-4 w-4" /> See all wins</Link>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
