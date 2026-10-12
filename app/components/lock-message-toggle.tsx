import { useId } from "react";

export default function LockMessageToggle({
  value,
  onChange,
  disabled,
}: {
  value: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}) {
  const hintId = useId();
  return (
    <div className="space-y-1">
      <label className="flex items-center gap-2 py-1 text-gray-800 dark:text-gray-200 cursor-pointer">
        <input
          type="checkbox"
          checked={value}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          aria-describedby={hintId}
          className="h-4 w-4 accent-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
        />
        Lock message
      </label>
      <p id={hintId} className="text-sm text-gray-600 dark:text-gray-400">
        When ticked, payers can&apos;t change the message. Rows without a
        message always let the payer write one.
      </p>
    </div>
  );
}
