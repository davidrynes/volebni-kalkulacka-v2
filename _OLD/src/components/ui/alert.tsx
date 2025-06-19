import { ComponentChildren } from 'preact';

interface AlertProps {
  className?: string;
  variant?: 'default' | 'destructive';
  children: ComponentChildren;
}

export function Alert({
  className = '',
  variant = 'default',
  children,
}: AlertProps) {
  return (
    <div
      className={`relative w-full rounded-lg border p-4 ${
        variant === 'destructive'
          ? 'border-red-600 bg-red-50 text-red-600'
          : 'border-gray-200 bg-gray-50 text-gray-900'
      } ${className}`}
    >
      {children}
    </div>
  );
}

interface AlertDescriptionProps {
  className?: string;
  children: ComponentChildren;
}

export function AlertDescription({
  className = '',
  children,
}: AlertDescriptionProps) {
  return (
    <div className={`mt-2 text-sm ${className}`}>
      {children}
    </div>
  );
} 