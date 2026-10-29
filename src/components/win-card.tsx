import { useTranslation } from "react-i18next";
import { useState } from "react";
import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { categoryMeta, formatDate, type Win } from "@/lib/wins";
import { useDeleteWin } from "@/hooks/use-wins";
import { WinFormDialog } from "./win-form-dialog";
import { GrowWin } from "./grow-win";

export function CategoryIcon({ win }: { win: Win }) {
  const m = categoryMeta(win.category);
  return (
    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${m.tone} text-heading`}>
      <m.icon className="h-5 w-5" strokeWidth={1.6} />
    </span>
  );
}

export function WinCard({ win }: { win: Win }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const del = useDeleteWin();
  const m = categoryMeta(win.category);

  return (
    <>
      <Button
        variant="ghost"
        onClick={() => setOpen(true)}
        className="group flex h-full min-h-44 w-full items-stretch justify-start flex-col gap-3 whitespace-normal rounded-2xl border bg-card p-5 text-start shadow-soft transition-colors hover:border-primary/50 hover:bg-card focus-visible:outline-2 focus-visible:outline-ring"
      >
        <div className="flex items-center justify-between gap-3">
          <CategoryIcon win={win} />
          <span className="text-xs text-muted-foreground">{formatDate(win.achievement_date)}</span>
        </div>
        <h3 className="break-words text-lg font-semibold leading-snug group-hover:text-heading">{win.title}</h3>
        {win.description && <p className="line-clamp-2 text-sm text-muted-foreground">{win.description}</p>}
        <span className={`mt-auto self-start rounded-full px-2.5 py-1 text-xs font-medium text-heading ${m.tone}`}>{m.label}</span>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85dvh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <div className="mb-2 flex items-center gap-3">
              <CategoryIcon win={win} />
              <span className="text-sm text-muted-foreground">{m.label} · {formatDate(win.achievement_date)}</span>
            </div>
            <DialogTitle dir="auto" className="break-words font-display text-2xl text-heading">{win.title}</DialogTitle>
            <DialogDescription dir="auto" className="whitespace-pre-wrap pt-2 text-base text-foreground">
              {win.description || t("wins.noDescription")}
            </DialogDescription>
          </DialogHeader>
          <GrowWin key={`${win.id}:${win.title}:${win.description}:${win.category}:${win.achievement_date}`} id={win.id} />
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="ghost" onClick={() => setConfirm(true)}><Trash2 /> {t("common.delete")}</Button>
            <Button variant="outline" onClick={() => { setOpen(false); setEditing(true); }}><Pencil /> {t("common.edit")}</Button>
          </div>
        </DialogContent>
      </Dialog>

      <WinFormDialog open={editing} onOpenChange={setEditing} win={win} />

      <AlertDialog open={confirm} onOpenChange={setConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("wins.deleteTitle")}</AlertDialogTitle>
            <AlertDialogDescription>{t("wins.deleteBody", { title: win.title })}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.keepIt")}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() =>
                del.mutate(win.id, {
                  onSuccess: () => { toast.success(t("wins.deleted")); setOpen(false); },
                  onError: (e) => toast.error(t("wins.deleteError", { message: e.message })),
                })
              }
            >
              {t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
