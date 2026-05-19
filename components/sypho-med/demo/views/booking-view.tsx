/**
 * @file components/sypho-med/demo/views/booking-view.tsx
 * @description Cal.com-inspired multi-step booking flow with doctor rota.
 */

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronRight, Clock, User } from 'lucide-react';
import { MedButton } from '@/components/sypho-med/med-button';
import { useDemo } from '@/components/sypho-med/demo/demo-context';

const STEPS = ['Service', 'Doctor', 'Time', 'Confirm'] as const;

/**
 * Multi-step booking wizard — fully client-side.
 */
export function BookingView() {
  const {
    preset,
    selectedDoctorId,
    selectedServiceId,
    selectedSlotId,
    bookingStep,
    bookingConfirmed,
    setSelectedDoctorId,
    setSelectedServiceId,
    setSelectedSlotId,
    setBookingStep,
    confirmBooking,
    resetBooking,
  } = useDemo();

  const selectedDoctor = preset.doctors.find((d) => d.id === selectedDoctorId);
  const selectedService = preset.services.find((s) => s.id === selectedServiceId);
  const selectedSlot = preset.timeSlots.find((t) => t.id === selectedSlotId);

  const canProceed = (): boolean => {
    if (bookingStep === 1) return !!selectedServiceId;
    if (bookingStep === 2) return !!selectedDoctorId;
    if (bookingStep === 3) return !!selectedSlotId;
    return true;
  };

  const next = () => {
    if (bookingStep < 3) {
      setBookingStep(bookingStep + 1);
    } else if (bookingStep === 3) {
      confirmBooking();
    }
  };

  if (bookingConfirmed && selectedDoctor && selectedService && selectedSlot) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-lg mx-auto med-glass-strong rounded-2xl p-8 text-center border border-neon-400/20"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="w-14 h-14 rounded-full bg-neon-500/20 flex items-center justify-center mx-auto mb-4"
        >
          <Check className="w-7 h-7 text-neon-400" aria-hidden="true" />
        </motion.div>
        <h2 className="text-xl font-medium text-white mb-2">Appointment confirmed</h2>
        <p className="text-sm text-silver-400 mb-6">
          {selectedService.name} with {selectedDoctor.name} at {selectedSlot.label}{' '}
          · {preset.city}
        </p>
        <MedButton variant="secondary" size="md" onClick={resetBooking}>
          Book another
        </MedButton>
      </motion.div>
    );
  }

  return (
    <motion.div
      key={preset.id}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto"
    >
      <motion.div className="mb-6">
        <h2 className="text-lg font-medium text-white">Book appointment</h2>
        <p className="text-sm text-silver-500 mt-1">
          {preset.city} · {preset.timezone}
        </p>
      </motion.div>

      <div className="flex gap-2 mb-8 overflow-x-auto pb-1">
        {STEPS.map((label, i) => {
          const stepNum = i + 1;
          const active = bookingStep === stepNum;
          const done = bookingStep > stepNum;
          return (
            <div
              key={label}
              className={[
                'flex items-center gap-2 shrink-0 px-3 py-2 rounded-xl text-xs font-medium border transition-colors',
                active
                  ? 'bg-neon-500/15 border-neon-400/30 text-neon-300'
                  : done
                    ? 'bg-white/[0.04] border-white/[0.08] text-silver-400'
                    : 'border-transparent text-silver-600',
              ].join(' ')}
            >
              <span
                className={[
                  'w-5 h-5 rounded-full flex items-center justify-center text-[10px]',
                  active || done ? 'bg-neon-500/30 text-neon-300' : 'bg-obsidian-300 text-silver-500',
                ].join(' ')}
              >
                {done ? <Check className="w-3 h-3" /> : stepNum}
              </span>
              {label}
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 med-glass-strong rounded-2xl p-5 sm:p-6 border border-white/[0.06] min-h-[360px]">
          <AnimatePresence mode="wait">
            {bookingStep === 1 && (
              <StepPanel key="service" title="Select service">
                <div className="space-y-2">
                  {preset.services.map((service) => (
                    <button
                      key={service.id}
                      type="button"
                      onClick={() => setSelectedServiceId(service.id)}
                      className={[
                        'w-full flex items-center justify-between p-4 rounded-xl border text-left transition-all',
                        selectedServiceId === service.id
                          ? 'border-neon-400/40 bg-neon-500/10'
                          : 'border-white/[0.06] hover:border-white/15 hover:bg-white/[0.03]',
                      ].join(' ')}
                    >
                      <div>
                        <p className="text-sm font-medium text-white">{service.name}</p>
                        <p className="text-xs text-silver-500 mt-0.5 flex items-center gap-1">
                          <Clock className="w-3 h-3" aria-hidden="true" />
                          {service.durationMinutes} min
                        </p>
                      </div>
                      <span className="text-sm text-neon-400/90">{service.priceLabel}</span>
                    </button>
                  ))}
                </div>
              </StepPanel>
            )}

            {bookingStep === 2 && (
              <StepPanel key="doctor" title="Choose doctor">
                <div className="space-y-2">
                  {preset.doctors.map((doctor) => (
                    <button
                      key={doctor.id}
                      type="button"
                      onClick={() => setSelectedDoctorId(doctor.id)}
                      className={[
                        'w-full flex items-center gap-3 p-4 rounded-xl border text-left transition-all',
                        selectedDoctorId === doctor.id
                          ? 'border-neon-400/40 bg-neon-500/10'
                          : 'border-white/[0.06] hover:border-white/15',
                      ].join(' ')}
                    >
                      <span className="w-10 h-10 rounded-xl bg-neon-500/15 text-neon-300 flex items-center justify-center text-sm font-medium">
                        {doctor.avatarInitials}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-white">{doctor.name}</p>
                        <p className="text-xs text-silver-500">{doctor.specialty}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </StepPanel>
            )}

            {bookingStep === 3 && (
              <StepPanel key="time" title="Pick a time slot">
                <p className="text-xs text-silver-500 mb-4 flex items-center gap-1">
                  <User className="w-3.5 h-3.5" aria-hidden="true" />
                  {selectedDoctor?.name ?? 'Doctor'} · today
                </p>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {preset.timeSlots.map((slot) => (
                    <button
                      key={slot.id}
                      type="button"
                      disabled={!slot.available}
                      onClick={() => slot.available && setSelectedSlotId(slot.id)}
                      className={[
                        'py-2.5 rounded-xl text-sm font-medium border transition-all',
                        !slot.available
                          ? 'opacity-30 cursor-not-allowed border-white/[0.04]'
                          : selectedSlotId === slot.id
                            ? 'border-neon-400/50 bg-neon-500/15 text-neon-300'
                            : 'border-white/[0.08] hover:border-neon-400/30 text-silver-300',
                      ].join(' ')}
                    >
                      {slot.label}
                    </button>
                  ))}
                </div>
              </StepPanel>
            )}
          </AnimatePresence>

          <div className="flex justify-end mt-6 pt-4 border-t border-white/[0.06]">
            <MedButton
              variant="primary"
              size="md"
              onClick={next}
              disabled={!canProceed()}
              className="group"
            >
              {bookingStep === 3 ? 'Confirm booking' : 'Continue'}
              <ChevronRight
                className="w-4 h-4 group-hover:translate-x-0.5 transition-transform"
                aria-hidden="true"
              />
            </MedButton>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="med-glass rounded-2xl p-4 border border-white/[0.06]">
            <h3 className="text-xs uppercase tracking-wider text-silver-500 mb-3">
              Doctor rota
            </h3>
            <motion.div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 14 }).map((_, i) => (
                <div
                  key={i}
                  className={[
                    'h-5 rounded-md',
                    i % 3 === 0 ? 'bg-neon-500/25' : 'bg-white/[0.04]',
                  ].join(' ')}
                />
              ))}
            </motion.div>
            <p className="text-[10px] text-silver-600 mt-3">
              Cyan = available · {preset.city}
            </p>
          </div>

          {(selectedService || selectedDoctor || selectedSlot) && (
            <motion.div
              layout
              className="med-glass rounded-2xl p-4 border border-white/[0.06] text-sm"
            >
              <p className="text-xs text-silver-500 uppercase tracking-wider mb-2">
                Summary
              </p>
              {selectedService && (
                <p className="text-silver-300">{selectedService.name}</p>
              )}
              {selectedDoctor && (
                <p className="text-silver-400 text-xs mt-1">{selectedDoctor.name}</p>
              )}
              {selectedSlot && (
                <p className="text-neon-400/90 text-xs mt-1">{selectedSlot.label}</p>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

interface StepPanelProps {
  title: string;
  children: React.ReactNode;
}

function StepPanel({ title, children }: StepPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -12 }}
      transition={{ duration: 0.25 }}
    >
      <h3 className="text-sm font-medium text-white mb-4">{title}</h3>
      {children}
    </motion.div>
  );
}
