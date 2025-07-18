import { ComponentChildren } from 'preact';

interface LabelProps {
  htmlFor?: string;
  className?: string;
  children: ComponentChildren;
}

export function Label({
  htmlFor,
  className = '',
  children,
}: LabelProps) {
  return (
    <label
      htmlFor={htmlFor}
      className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`}
    >
      {children}
    </label>
  );
} 