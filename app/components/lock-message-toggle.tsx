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
      <label className="flex cursor-pointer items-center gap-2 py-1">
        <input
          type="checkbox"
          checked={value}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          aria-describedby={hintId}
          className="focus-ring h-4 w-4 accent-primary"
        />
        Lock message
      </label>
      <p id={hintId} className="text-sm text-muted">
        When ticked, payers can&apos;t change the message. Rows without a
        message always let the payer write one.
      </p>
    </div>
  );
}
