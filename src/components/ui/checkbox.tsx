interface CheckboxProps {
  id?: string;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export function Checkbox({
  id,
  checked = false,
  onCheckedChange,
  disabled = false,
  className = '',
}: CheckboxProps) {
  return (
    <input
      id={id}
      type="checkbox"
      checked={checked}
      onChange={(e) => onCheckedChange?.(e.currentTarget.checked)}
      disabled={disabled}
      className={`h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600 ${className}`}
    />
  );
} 