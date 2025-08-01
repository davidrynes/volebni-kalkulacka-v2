import { VNode } from 'preact';

interface CardProps {
  className?: string;
  children?: any;
}

export function Card({ className, children }: CardProps) {
  return (
    <div className={`rounded-lg border bg-white shadow-sm ${className || ''}`}>
      {children}
    </div>
  );
}

interface CardHeaderProps {
  className?: string;
  children?: any;
}

export function CardHeader({ className, children }: CardHeaderProps) {
  return (
    <div className={`flex flex-col space-y-1.5 p-6 ${className || ''}`}>
      {children}
    </div>
  );
}

interface CardTitleProps {
  className?: string;
  children?: any;
}

export function CardTitle({ className, children }: CardTitleProps) {
  return (
    <h3 className={`text-2xl font-semibold leading-none tracking-tight ${className || ''}`}>
      {children}
    </h3>
  );
}

interface CardDescriptionProps {
  className?: string;
  children?: any;
}

export function CardDescription({ className, children }: CardDescriptionProps) {
  return (
    <p className={`text-sm text-gray-500 ${className || ''}`}>
      {children}
    </p>
  );
}

interface CardContentProps {
  className?: string;
  children?: any;
}

export function CardContent({ className, children }: CardContentProps) {
  return (
    <div className={`p-6 pt-0 ${className || ''}`}>
      {children}
    </div>
  );
}

interface CardFooterProps {
  className?: string;
  children?: any;
}

export function CardFooter({ className, children }: CardFooterProps) {
  return (
    <div className={`flex items-center p-6 pt-0 ${className || ''}`}>
      {children}
    </div>
  );
} 