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
      <legend className="block font-medium text-gray-900 dark:text-gray-100">
        Preset
      </legend>
      <div className="flex flex-wrap gap-x-6 gap-y-2">
        {options.map((option) => (
          <label
            key={option.value}
            className="flex items-center gap-2 py-1 text-gray-800 dark:text-gray-200 cursor-pointer"
          >
            <input
              type="radio"
              name="preset"
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              className="h-4 w-4 accent-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
            />
            {option.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
