export function ReflectionSections({ sections }: { sections: { heading: string; text: string; title?: React.ReactNode }[] }) {
  return (
    <div className="space-y-5" aria-live="polite">
      {sections.map(({ heading, text, title }) => (
        <section key={heading}>
          <h4 className="font-display text-lg text-heading">{heading}</h4>
          {title && <p dir="auto" className="mt-1 break-words font-semibold">{title}</p>}
          <p dir="auto" className="mt-1 whitespace-pre-wrap break-words text-sm leading-relaxed text-muted-foreground">{text}</p>
        </section>
      ))}
    </div>
  );
}