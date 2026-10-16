import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CATEGORIES, DESC_MAX, TITLE_MAX, validateWin, type Category, type Win, type WinInput } from "@/lib/wins";
import { useSaveWin } from "@/hooks/use-wins";

const today = () => new Date().toLocaleDateString("en-CA");

export function WinFormDialog({ open, onOpenChange, win }: { open: boolean; onOpenChange: (o: boolean) => void; win?: Win | null }) {
  const [v, setV] = useState<WinInput>({ title: "", description: "", category: "", achievement_date: today() });
  const [errors, setErrors] = useState<ReturnType<typeof validateWin>>({});
  const save = useSaveWin();

  useEffect(() => {
    if (open) {
      setErrors({});
      setV(win
        ? { title: win.title, description: win.description ?? "", category: win.category, achievement_date: win.achievement_date }
        : { title: "", description: "", category: "", achievement_date: today() });
    }
  }, [open, win]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateWin(v);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    save.mutate(
      { id: win?.id, title: v.title.trim(), description: v.description.trim() || null, category: v.category as Category, achievement_date: v.achievement_date },
      {
        onSuccess: () => { toast.success(win ? "Win updated." : "Win added — well done!"); onOpenChange(false); },
        onError: (err) => toast.error(`Couldn't save your win: ${err.message}`),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl text-heading">{win ? "Edit win" : "Add a win"}</DialogTitle>
          <DialogDescription>Big or small, it counts.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="title">Title</Label>
            <Input id="title" maxLength={TITLE_MAX} value={v.title} onChange={(e) => setV({ ...v, title: e.target.value })} aria-invalid={!!errors.title} />
            {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="description">Description <span className="text-muted-foreground">(optional)</span></Label>
            <Textarea id="description" rows={3} maxLength={DESC_MAX} value={v.description} onChange={(e) => setV({ ...v, description: e.target.value })} />
            <p className="text-right text-xs text-muted-foreground">{v.description.length}/{DESC_MAX}</p>
            {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="category">Category</Label>
              <Select value={v.category} onValueChange={(c) => setV({ ...v, category: c as Category })}>
                <SelectTrigger id="category" aria-invalid={!!errors.category}><SelectValue placeholder="Choose…" /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                </SelectContent>
              </Select>
              {errors.category && <p className="text-sm text-destructive">{errors.category}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" value={v.achievement_date} onChange={(e) => setV({ ...v, achievement_date: e.target.value })} />
              {errors.achievement_date && <p className="text-sm text-destructive">{errors.achievement_date}</p>}
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={save.isPending}>{save.isPending ? "Saving…" : "Save win"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
