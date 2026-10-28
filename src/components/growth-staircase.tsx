import growthStaircase from "@/assets/growth-staircase.png";

const fade = {
  WebkitMaskImage:
    "linear-gradient(to right, transparent 0%, #000 8%, #000 92%, transparent 100%), linear-gradient(to bottom, transparent 0%, #000 2%, #000 92%, transparent 100%)",
  maskImage:
    "linear-gradient(to right, transparent 0%, #000 8%, #000 92%, transparent 100%), linear-gradient(to bottom, transparent 0%, #000 2%, #000 92%, transparent 100%)",
  WebkitMaskComposite: "source-in",
  maskComposite: "intersect",
} as const;

export function GrowthStaircase({ className = "" }: { className?: string }) {
  return (
    <img
      src={growthStaircase}
      alt="Watercolor illustration of stairs with growing plants and a star"
      width={1774}
      height={887}
      loading="eager"
      style={fade}
      className={`h-auto w-full max-w-[640px] object-contain mix-blend-multiply ${className}`}
    />
  );
}
