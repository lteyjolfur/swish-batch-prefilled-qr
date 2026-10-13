export default function ResultSummary({
  result,
  successText,
  fixIntro,
}: {
  result: { success?: boolean; errors?: string[]; serverError?: string };
  successText: string;
  fixIntro: string;
}) {
  return (
    <div className="mt-4 space-y-2 font-medium break-words">
      {/* Live regions stay mounted so screen readers announce changes */}
      <div role="status" aria-live="polite" className="text-success">
        {result.success && <p>{successText}</p>}
      </div>
      <div role="alert" className="text-danger">
        {result.errors && result.errors.length > 0 && (
          <>
            <p>{fixIntro}</p>
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
