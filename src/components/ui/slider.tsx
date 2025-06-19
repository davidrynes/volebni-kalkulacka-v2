interface SliderProps {
  value?: number[];
  defaultValue?: number[];
  min?: number;
  max?: number;
  step?: number;
  onValueChange?: (value: number[]) => void;
  className?: string;
}

export function Slider({
  value,
  defaultValue = [0],
  min = 0,
  max = 100,
  step = 1,
  onValueChange,
  className = '',
}: SliderProps) {
  const handleChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    const newValue = parseFloat(target.value);
    onValueChange?.([newValue]);
  };
  
  const currentValue = value ? value[0] : defaultValue[0];
  const percentage = ((currentValue - min) / (max - min)) * 100;
  
  return (
    <div className={`relative flex w-full touch-none select-none items-center ${className}`}>
      <div className="relative w-full h-2 overflow-hidden rounded-full bg-gray-200">
        <div
          className="absolute h-full bg-blue-600"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={currentValue}
        onChange={handleChange}
        className="absolute w-full h-2 opacity-0 cursor-pointer"
      />
    </div>
  );
} 