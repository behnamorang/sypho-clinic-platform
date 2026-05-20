/**
 * @file app/platform/layout.tsx
 * @description Layout segment for Platform feature deep-dive pages.
 */

interface PlatformLayoutProps {
  children: React.ReactNode;
}

/**
 * Pass-through layout — reserved for shared platform nav or breadcrumbs.
 */
export default function PlatformLayout({ children }: PlatformLayoutProps) {
  return <>{children}</>;
}
