/**
 * @file lib/sypho-med/demo/riley-chat.ts
 * @description Contextual Riley AI concierge replies for the inbox simulator.
 */

import type { ClinicPreset } from '@/lib/sypho-med/demo/types';

/**
 * Builds a high-converting aesthetic-clinic concierge reply from patient input.
 */
export function generateRileyReply(
  patientMessage: string,
  preset: ClinicPreset,
): string {
  const text = patientMessage.toLowerCase();
  const { currencySymbol, city } = preset;

  const openSlots = preset.timeSlots
    .filter((s) => s.available)
    .slice(0, 2)
    .map((s) => s.label)
    .join(' or ');

  const flagshipService = preset.services[0]?.name ?? 'private consultation';
  const flagshipPrice = preset.services[0]?.priceLabel ?? `${currencySymbol}180`;
  const leadDoctor = preset.doctors[0]?.name ?? 'our lead clinician';

  if (
    text.includes('botox') ||
    text.includes('filler') ||
    text.includes('aesthetic') ||
    text.includes('treatment') ||
    text.includes('laser') ||
    text.includes('skin')
  ) {
    return `Thank you for your interest in our premium aesthetic programme. ${leadDoctor} holds discreet slots for ${flagshipService} — from ${flagshipPrice}. I can reserve ${openSlots || 'Thursday 14:00'} at our ${city} suite. Would you prefer a complimentary video assessment first?`;
  }

  if (
    text.includes('price') ||
    text.includes('cost') ||
    text.includes('how much') ||
    text.includes('fee') ||
    text.includes('quote')
  ) {
    return `Our ${flagshipService} begins at ${flagshipPrice}, with bespoke packages quoted after a brief clinical assessment. I can share a transparent fee guide on WhatsApp and hold a priority slot at ${openSlots || '10:00'} — shall I send a secure booking link?`;
  }

  if (
    text.includes('available') ||
    text.includes('availability') ||
    text.includes('book') ||
    text.includes('appointment') ||
    text.includes('slot') ||
    text.includes('when')
  ) {
    return `Lovely — I have ${openSlots || 'Thursday 14:00 and Friday 11:00'} available with ${leadDoctor} for ${flagshipService}. I will add you to our pipeline and send a one-tap confirmation. May I note your preferred day?`;
  }

  if (
    text.includes('hello') ||
    text.includes('hi') ||
    text.includes('hey') ||
    text.includes('good morning') ||
    text.includes('good afternoon')
  ) {
    return `Good day — Riley, your autonomous concierge at our ${city} clinic. How may I assist with your aesthetic or wellness enquiry today? We currently have priority availability at ${openSlots || '14:00'} for ${flagshipService}.`;
  }

  if (text.includes('thank')) {
    return `You are most welcome. Your care coordinator will receive this thread instantly. If anything changes, I remain here on WhatsApp — including same-day rescheduling within our no-show protection window.`;
  }

  return `Thank you for messaging our ${city} clinic. I have reviewed your note and can offer ${flagshipService} with ${leadDoctor} at ${openSlots || '14:00'} (${flagshipPrice}). Shall I secure this in your personalised workspace and send a confirmation to this thread?`;
}

/** Delay before Riley replies (milliseconds). */
export const RILEY_REPLY_DELAY_MS = 1500;
