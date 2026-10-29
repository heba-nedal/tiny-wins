import { useState } from "react";
import { useTranslation } from "react-i18next";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { formatDate } from "@/lib/format-date";
import { currentMonth } from "@/lib/growth-ai";
import { cn } from "@/lib/utils";

type Props = { id?: string; value: string; onChange: (value: string) => void; min?: string; max?: string; disabled?: boolean };

const pad = (n: number, len = 2) => String(n).padStart(len, "0");

export function MonthPicker({ id, value, onChange, min, max, disabled }: Props) {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const valid = /^\d{4}-(0[1-9]|1[0-2])$/.test(value);
  const today = currentMonth();
  const [year, setYear] = useState(() => Number((valid ? value : today).slice(0, 4)));
  const locale = i18n.language === "ar" ? "ar-PS" : "en-US";
  const monthName = new Intl.DateTimeFormat(locale, { month: "long", numberingSystem: "latn", timeZone: "UTC" });
  const minYear = min ? Number(min.slice(0, 4)) : 1;
  const maxYear = max ? Number(max.slice(0, 4)) : 9998;

  return (
    <Popover open={open} onOpenChange={(next) => { if (next) setYear(Number((valid ? value : today).slice(0, 4))); setOpen(next); }}>
      <PopoverTrigger asChild>
        <button
          id={id}
          type="button"
          disabled={disabled}
          aria-label={t("monthPicker.choose")}
          className="flex h-9 w-full items-center justify-between gap-2 rounded-md border border-input bg-transparent px-3 py-1 text-start text-base shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
        >
          <span>{valid ? formatDate(`${value}-01T00:00:00`, { month: "long", year: "numeric" }) : "\u00a0"}</span>
          <CalendarDays className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64 p-3">
        <div className="mb-3 flex items-center justify-between">
          <button type="button" className="rounded-md p-1 hover:bg-muted disabled:opacity-40" aria-label={t("monthPicker.prevYear")} disabled={year <= minYear} onClick={() => setYear((y) => y - 1)}>
            <ChevronLeft className="h-4 w-4 rtl:rotate-180" aria-hidden />
          </button>
          <span className="text-sm font-medium">{year}</span>
          <button type="button" className="rounded-md p-1 hover:bg-muted disabled:opacity-40" aria-label={t("monthPicker.nextYear")} disabled={year >= maxYear} onClick={() => setYear((y) => y + 1)}>
            <ChevronRight className="h-4 w-4 rtl:rotate-180" aria-hidden />
          </button>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {Array.from({ length: 12 }, (_, i) => {
            const key = `${pad(year, 4)}-${pad(i + 1)}`;
            const out = (min && key < min) || (max && key > max);
            const selected = key === value;
            return (
              <button
                key={key}
                type="button"
                disabled={!!out}
                aria-pressed={selected}
                onClick={() => { onChange(key); setOpen(false); }}
                className={cn(
                  "rounded-md px-1 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40",
                  selected ? "bg-primary text-primary-foreground" : "hover:bg-muted",
                  !selected && key === today && "ring-1 ring-primary/50",
                )}
              >
                {monthName.format(new Date(Date.UTC(2000, i, 1)))}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
