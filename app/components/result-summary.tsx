export default function ResultSummary({
  result,
}: {
  result: { success?: boolean; errors?: string[]; serverError?: string };
}) {
  if (!result || (!result.success && !result.errors && !result.serverError))
    return null;
  return (
    <div className="mt-4">
      {result.success && (
        <div className="text-green-700 dark:text-green-400 font-medium">
          ZIP generated and downloaded!
        </div>
      )}
      {result.errors && (
        <ul className="text-red-600 dark:text-red-400 list-disc pl-5 space-y-1">
          {result.errors.map((err, i) => (
            <li key={i}>{err}</li>
          ))}
        </ul>
      )}
      {result.serverError && (
        <div className="text-red-700 dark:text-red-400 font-medium">
          {result.serverError}
        </div>
      )}
    </div>
  );
}
