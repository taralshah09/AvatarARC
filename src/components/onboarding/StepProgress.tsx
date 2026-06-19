export function StepProgress({ step, total = 3 }: { step: number; total?: number }) {
  return (
    <div className="flex items-center gap-2 justify-center mb-8">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={`h-2 rounded-full transition-all duration-300 ${
            i + 1 === step
              ? 'w-8 bg-blue-500'
              : i + 1 < step
              ? 'w-2 bg-blue-500'
              : 'w-2 bg-zinc-700'
          }`}
        />
      ))}
    </div>
  );
}
