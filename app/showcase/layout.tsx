import type { Metadata } from 'next';
import { Cormorant_Garamond, DM_Sans } from 'next/font/google';

const cormorant = Cormorant_Garamond({
  subsets:  ['latin'],
  variable: '--font-cormorant',
  weight:   ['400', '500', '600'],
  display:  'swap',
});

const dmSans = DM_Sans({
  subsets:  ['latin'],
  variable: '--font-dm-sans',
  weight:   ['400', '500', '600'],
  display:  'swap',
});

export const metadata: Metadata = {
  title:       'Lumière Institute — Premium Clinic Showcase',
  description: 'World-class aesthetic and medical clinic design concept powered by Sypho.',
  robots:      { index: false, follow: false },
};

export default function ShowcaseLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${cormorant.variable} ${dmSans.variable} font-clinic-sans scroll-smooth`}>
      {children}
    </div>
  );
}
