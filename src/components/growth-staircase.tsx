import growthStaircase from "@/assets/growth-staircase-transparent.png.asset.json";

export function GrowthStaircase({ className = "" }: { className?: string }) {
  return (
    <img
      src={growthStaircase.url}
      alt="Watercolor illustration of stairs with growing plants and a star"
      width={1200}
      height={707}
      loading="eager"
      className={`h-auto w-full max-w-[560px] object-contain ${className}`}
    />
  );
}
