export default function ResultSummary({
  result,
}: {
  result: { success?: boolean; errors?: string[]; serverError?: string };
}) {
  return (
    <div className="mt-4 space-y-2 font-medium break-words">
      {/* Live regions stay mounted so screen readers announce changes */}
      <div role="status" aria-live="polite" className="text-success">
        {result.success && <p>ZIP generated and downloaded!</p>}
      </div>
      <div role="alert" className="text-danger">
        {result.errors && result.errors.length > 0 && (
          <>
            <p>Fix the following in your CSV and try again:</p>
            <ul className="list-disc space-y-1 pl-5 font-normal">
              {result.errors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </>
        )}
        {result.serverError && <p>{result.serverError}</p>}
      </div>
    </div>
  );
}
