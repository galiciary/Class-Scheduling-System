interface EmptyStateProps {
  title: string;
  description?: string;
}

/**
 * Shared placeholder for "there is nothing here" situations. Used by both the
 * course list (no search matches) and the schedule view (nothing selected yet),
 * so the two read consistently.
 */
export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 px-6 py-12 text-center">
      <p className="text-sm font-medium text-slate-700">{title}</p>
      {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
    </div>
  );
}