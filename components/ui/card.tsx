/**
 * @file components/ui/card.tsx
 * @description Card layout primitives for Sypho.io.
 *
 * Provides a compound component pattern:
 *   <Card>
 *     <CardHeader>
 *       <CardTitle />
 *       <CardDescription />
 *     </CardHeader>
 *     <CardContent />
 *     <CardFooter />
 *   </Card>
 */

import { forwardRef } from 'react';

// ---------------------------------------------------------------------------
// Card (container)
// ---------------------------------------------------------------------------

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

/**
 * Base card container with white background, border, and subtle shadow.
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className = '', ...props }, ref) => (
    <div
      ref={ref}
      className={[
        'bg-white rounded-xl border border-surface-200 shadow-card',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    />
  ),
);

Card.displayName = 'Card';

// ---------------------------------------------------------------------------
// CardHeader
// ---------------------------------------------------------------------------

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className = '', ...props }, ref) => (
    <div
      ref={ref}
      className={['flex flex-col gap-1.5 p-6 pb-0', className]
        .filter(Boolean)
        .join(' ')}
      {...props}
    />
  ),
);

CardHeader.displayName = 'CardHeader';

// ---------------------------------------------------------------------------
// CardTitle
// ---------------------------------------------------------------------------

export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

export const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className = '', ...props }, ref) => (
    <h2
      ref={ref}
      className={[
        'text-xl font-semibold leading-tight text-surface-900',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    />
  ),
);

CardTitle.displayName = 'CardTitle';

// ---------------------------------------------------------------------------
// CardDescription
// ---------------------------------------------------------------------------

export interface CardDescriptionProps
  extends React.HTMLAttributes<HTMLParagraphElement> {}

export const CardDescription = forwardRef<
  HTMLParagraphElement,
  CardDescriptionProps
>(({ className = '', ...props }, ref) => (
  <p
    ref={ref}
    className={['text-sm text-surface-500 leading-relaxed', className]
      .filter(Boolean)
      .join(' ')}
    {...props}
  />
));

CardDescription.displayName = 'CardDescription';

// ---------------------------------------------------------------------------
// CardContent
// ---------------------------------------------------------------------------

export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
  ({ className = '', ...props }, ref) => (
    <div
      ref={ref}
      className={['p-6', className].filter(Boolean).join(' ')}
      {...props}
    />
  ),
);

CardContent.displayName = 'CardContent';

// ---------------------------------------------------------------------------
// CardFooter
// ---------------------------------------------------------------------------

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

export const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className = '', ...props }, ref) => (
    <div
      ref={ref}
      className={[
        'flex items-center gap-3 p-6 pt-0',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    />
  ),
);

CardFooter.displayName = 'CardFooter';
