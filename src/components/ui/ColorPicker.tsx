"use client";

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  label?: string;
}

const PRESET_COLORS = [
  "#EF4444",
  "#F97316",
  "#EAB308",
  "#22C55E",
  "#14B8A6",
  "#3B82F6",
  "#6366F1",
  "#A855F7",
  "#EC4899",
  "#6B7280",
];

export default function ColorPicker({
  value,
  onChange,
  label = "Color",
}: ColorPickerProps): React.ReactElement {
  return (
    <fieldset>
      <legend className="text-sm font-medium text-gray-700">{label}</legend>
      <div className="mt-1 flex flex-wrap gap-2" role="radiogroup">
        {PRESET_COLORS.map((color) => (
          <button
            key={color}
            type="button"
            role="radio"
            aria-checked={value === color}
            aria-label={`Select color ${color}`}
            className={`h-8 w-8 rounded-full border-2 transition-transform ${
              value === color
                ? "scale-110 border-gray-800"
                : "border-transparent hover:scale-105"
            }`}
            style={{ backgroundColor: color }}
            onClick={() => onChange(color)}
          />
        ))}
      </div>
    </fieldset>
  );
}
