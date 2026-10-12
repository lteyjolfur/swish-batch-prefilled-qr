import { Preset } from "./upload-form";

export default function PresetSelector({
  value,
  onChange,
  disabled,
}: {
  value: Preset;
  onChange: (value: Preset) => void;
  disabled?: boolean;
}) {
  const options: { value: Preset; label: string }[] = [
    { value: "branded", label: "Branded" },
    { value: "plain", label: "Plain" },
  ];
  return (
    <fieldset className="space-y-2" disabled={disabled}>
      <legend className="font-medium">Preset</legend>
      <div className="flex flex-wrap gap-x-6 gap-y-2">
        {options.map((option) => (
          <label
            key={option.value}
            className="flex cursor-pointer items-center gap-2 py-1"
          >
            <input
              type="radio"
              name="preset"
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              className="focus-ring h-4 w-4 accent-primary"
            />
            {option.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
