import type { ElementType, ReactNode } from 'react';

type PageContainerProps = {
  as?: ElementType;
  children: ReactNode;
  className?: string;
};

export function PageContainer({ as: Component = 'div', children, className = '' }: PageContainerProps) {
  return <Component className={`mx-auto w-full px-4 sm:px-6 lg:px-[4vw] ${className}`}>{children}</Component>;
}
