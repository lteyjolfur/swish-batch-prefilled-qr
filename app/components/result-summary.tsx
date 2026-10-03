export default function ResultSummary({
  result,
}: {
  result: { success?: boolean; errors?: string[]; serverError?: string };
}) {
  return (
    <div className="mt-4 space-y-2">
      {/* Live regions stay mounted so screen readers announce changes */}
      <div role="status" aria-live="polite">
        {result.success && (
          <p className="text-green-700 dark:text-green-400 font-medium">
            ZIP generated and downloaded!
          </p>
        )}
      </div>
      <div role="alert">
        {result.errors && result.errors.length > 0 && (
          <>
            <p className="text-red-700 dark:text-red-400 font-medium">
              Fix the following in your CSV and try again:
            </p>
            <ul className="text-red-700 dark:text-red-400 list-disc pl-5 space-y-1 break-words">
              {result.errors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </>
        )}
        {result.serverError && (
          <p className="text-red-700 dark:text-red-400 font-medium break-words">
            {result.serverError}
          </p>
        )}
      </div>
    </div>
  );
}
