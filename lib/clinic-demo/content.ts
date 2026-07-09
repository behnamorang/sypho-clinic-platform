/**
 * @file lib/clinic-demo/content.ts
 * @description Static content for the premium clinic marketing demo.
 */

export const CLINIC = {
  name:    'Lumière Institute',
  tagline: 'Aesthetic Medicine · Regenerative Care · Longevity',
  phone:   '+32 2 808 45 00',
  email:   'concierge@lumiere-institute.eu',
  city:    'Brussels',
} as const;

export const NAV_LINKS = [
  { href: '#about',       label: 'About' },
  { href: '#services',    label: 'Treatments' },
  { href: '#specialists', label: 'Specialists' },
  { href: '#technology',  label: 'Technology' },
  { href: '#journey',     label: 'Your visit' },
  { href: '#locations',   label: 'Locations' },
  { href: '#faq',         label: 'FAQ' },
] as const;

export const STATS = [
  { value: '18+', label: 'Years of excellence' },
  { value: '42k', label: 'Patients cared for' },
  { value: '4.9', label: 'Average satisfaction' },
  { value: '12',  label: 'Board-certified specialists' },
] as const;

export const ACCREDITATIONS = [
  'JCI Accredited',
  'EU GDPR Compliant',
  'ISAPS Member',
  'EBOPRAS Standards',
  'ISO 13485',
  'Belgian Health Council',
] as const;

export const SERVICES = [
  {
    id: 'facial',
    title: 'Advanced facial aesthetics',
    desc: 'Tailored injectables, skin quality protocols, and non-surgical lifting guided by 3D analysis.',
    image: 'https://images.unsplash.com/photo-1570172619644-dac3ff40f8f7?w=800&q=80',
    tag: 'Aesthetics',
  },
  {
    id: 'body',
    title: 'Body contouring & wellness',
    desc: 'Cryolipolysis, RF tightening, and lymphatic programmes for refined, natural silhouettes.',
    image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&q=80',
    tag: 'Body',
  },
  {
    id: 'derm',
    title: 'Medical dermatology',
    desc: 'Acne, pigmentation, rosacea, and scar revision with laser- and peel-based pathways.',
    image: 'https://images.unsplash.com/photo-1629909613654-28e737c879b0?w=800&q=80',
    tag: 'Dermatology',
  },
  {
    id: 'hair',
    title: 'Hair restoration',
    desc: 'FUE transplantation, PRP, and mesotherapy plans designed by trichology specialists.',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80',
    tag: 'Hair',
  },
  {
    id: 'longevity',
    title: 'Longevity & hormone health',
    desc: 'Biomarker-led programmes, IV therapy, and metabolic optimisation for proactive ageing.',
    image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&q=80',
    tag: 'Longevity',
  },
  {
    id: 'dental',
    title: 'Aesthetic dentistry',
    desc: 'Digital smile design, veneers, and whitening within a spa-like clinical environment.',
    image: 'https://images.unsplash.com/photo-1606811971618-4486d14f4f99?w=800&q=80',
    tag: 'Dental',
  },
  {
    id: 'surgery',
    title: 'Day-case surgery suite',
    desc: 'Minor surgical procedures with anaesthesiology cover and private recovery lounges.',
    image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&q=80',
    tag: 'Surgery',
  },
  {
    id: 'concierge',
    title: 'International concierge',
    desc: 'Visa letters, luxury transfers, interpreter services, and partner hotel arrangements.',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80',
    tag: 'Concierge',
  },
] as const;

export const PILLARS = [
  { title: 'Physician-led protocols', desc: 'Every plan is signed off by a specialist — never delegated to untrained staff.' },
  { title: 'Transparent outcomes', desc: 'Digital imaging, documented consent, and realistic timelines before treatment.' },
  { title: 'Private by design', desc: 'Discrete entrances, sound-insulated suites, and strict confidentiality policies.' },
  { title: 'Continuity of care', desc: 'Dedicated patient coordinators from first consult through follow-up reviews.' },
] as const;

export const SPECIALISTS = [
  { name: 'Dr. Elena Varga', role: 'Medical Director · Aesthetics', image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=600&q=80', cred: 'EBOPRAS' },
  { name: 'Dr. James Okonkwo', role: 'Dermatology & Lasers', image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=600&q=80', cred: 'EADV' },
  { name: 'Dr. Sofia Lindström', role: 'Longevity Medicine', image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=600&q=80', cred: 'EFLM' },
  { name: 'Dr. Marc Dubois', role: 'Plastic & Reconstructive', image: 'https://images.unsplash.com/photo-1622253692010-333f457aa16f?w=600&q=80', cred: 'ISAPS' },
  { name: 'Dr. Amira Hassan', role: 'Trichology & Hair', image: 'https://images.unsplash.com/photo-1651008376811-b90baee41c1f?w=600&q=80', cred: 'ISHRS' },
  { name: 'Dr. Thomas Berg', role: 'Aesthetic Dentistry', image: 'https://images.unsplash.com/photo-1537361903819-4b7464f7021e?w=600&q=80', cred: 'AACD' },
] as const;

export const TECHNOLOGY = [
  { name: 'VISIA® 3D skin analysis', image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=700&q=80' },
  { name: 'Ultherapy® micro-focused ultrasound', image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=700&q=80' },
  { name: 'Morpheus8 RF microneedling', image: 'https://images.unsplash.com/photo-1570172619644-dac3ff40f8f7?w=700&q=80' },
  { name: 'CoolSculpting® Elite', image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=700&q=80' },
] as const;

export const JOURNEY = [
  { step: '01', title: 'Private consultation', desc: '60-minute assessment with imaging, medical history, and goal alignment.' },
  { step: '02', title: 'Personalised plan', desc: 'Written protocol with pricing, downtime, and staged treatment calendar.' },
  { step: '03', title: 'Treatment day', desc: 'Dedicated suite, clinical nursing team, and comfort amenities throughout.' },
  { step: '04', title: 'Recovery guidance', desc: 'Take-home care kit, 24/7 nurse line, and digital check-in at 48 hours.' },
  { step: '05', title: 'Review & refine', desc: 'Follow-up at 2 and 12 weeks to assess outcomes and adjust if needed.' },
] as const;

export const OUTCOMES = [
  { stat: '96%', label: 'Would recommend to family', image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&q=80' },
  { stat: '< 2%', label: 'Revision rate (12 mo.)', image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=600&q=80' },
  { stat: '48h', label: 'Avg. return to social events', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&q=80' },
  { stat: '31', label: 'Countries served last year', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80' },
] as const;

export const TESTIMONIALS = [
  { quote: 'The level of discretion and clinical rigour exceeded any clinic I have visited in London or Zurich.', name: 'Catherine M.', detail: 'Facial harmonisation · Geneva' },
  { quote: 'My coordinator arranged everything from airport transfer to pharmacy delivery. Flawless experience.', name: 'Ahmed K.', detail: 'Hair restoration · Dubai' },
  { quote: 'They refused to overtreat. The plan was conservative, honest, and the results look entirely natural.', name: 'Isabelle R.', detail: 'Body contouring · Brussels' },
  { quote: 'Imaging before and after left no ambiguity. I knew exactly what to expect — and received exactly that.', name: 'Michael T.', detail: 'Skin programme · Amsterdam' },
] as const;

export const LOCATIONS = [
  { name: 'Lumière Brussels — Flagship', address: 'Avenue Louise 523, 1050 Brussels', hours: 'Mon–Sat 8:00–20:00', image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=900&q=80' },
  { name: 'Lumière Antwerp', address: 'Meir 50, 2000 Antwerp', hours: 'Tue–Sat 9:00–18:00', image: 'https://images.unsplash.com/photo-1629909613654-28e737c879b0?w=900&q=80' },
  { name: 'Lumière Luxembourg', address: 'Boulevard Royal 12, Luxembourg', hours: 'Wed–Fri 10:00–19:00', image: 'https://images.unsplash.com/photo-1586773866388-0e134a4ae038?w=900&q=80' },
] as const;

export const FAQ = [
  { q: 'Do I need a referral?', a: 'No referral is required for aesthetic and wellness consultations. Surgical cases may require GP clearance — we coordinate this for you.' },
  { q: 'How long is the initial consultation?', a: 'First consultations are 60 minutes and include imaging where clinically appropriate. A deposit secures your slot.' },
  { q: 'What languages are spoken?', a: 'Our team consults in English, French, Dutch, German, and Arabic. Interpreter services are available on request.' },
  { q: 'Is there a minimum age?', a: 'Most aesthetic treatments require patients to be 18+. Selected dermatology pathways are available from 16 with parental consent.' },
  { q: 'Do you offer financing?', a: 'Yes — 0% plans for 6 months and extended financing up to 24 months through regulated EU partners.' },
  { q: 'What is your cancellation policy?', a: '48 hours notice for standard appointments. Surgical dates require 7 days notice; deposits are transferable once.' },
  { q: 'Are treatments GDPR-documented?', a: 'All records are stored in EU data centres with audit trails, consent versioning, and right-to-access workflows.' },
  { q: 'Can international patients book remotely?', a: 'Yes. We offer video pre-assessment, treatment planning, and itinerary coordination before you travel.' },
] as const;

export const INSIGHTS = [
  { title: 'Understanding skin quality vs. volume in facial ageing', date: '12 May 2026', read: '6 min', image: 'https://images.unsplash.com/photo-1570172619644-dac3ff40f8f7?w=600&q=80' },
  { title: 'Preparing for your first aesthetic consultation', date: '3 May 2026', read: '4 min', image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&q=80' },
  { title: 'Longevity biomarkers: what we measure and why', date: '21 Apr 2026', read: '8 min', image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&q=80' },
] as const;

export const HERO_IMAGE = 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1920&q=85';
export const ABOUT_IMAGE = 'https://images.unsplash.com/photo-1586773866388-0e134a4ae038?w=1200&q=80';
