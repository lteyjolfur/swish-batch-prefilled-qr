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
  return (
    <div className="space-y-2">
      <label className="block font-medium text-gray-900 dark:text-gray-100">
        Preset
      </label>
      <div className="flex gap-4">
        <label className="flex items-center gap-1 text-gray-800 dark:text-gray-200">
          <input
            type="radio"
            name="preset"
            value="branded"
            checked={value === "branded"}
            onChange={() => onChange("branded")}
            disabled={disabled}
          />
          Branded
        </label>
        <label className="flex items-center gap-1 text-gray-800 dark:text-gray-200">
          <input
            type="radio"
            name="preset"
            value="plain"
            checked={value === "plain"}
            onChange={() => onChange("plain")}
            disabled={disabled}
          />
          Plain
        </label>
      </div>
    </div>
  );
}
