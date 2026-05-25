/**
 * Maison Sypho — Client-side booking engine
 * Multi-step wizard: location → service → schedule → patient → confirmation
 * @preserve Logic structure — do not alter step order or state keys without review
 */

(function () {
  'use strict';

  const STEPS = ['location', 'service', 'schedule', 'patient', 'confirm'];
  const STEP_LABELS = {
    location: 'Location',
    service: 'Treatment',
    schedule: 'Date & time',
    patient: 'Your details',
    confirm: 'Confirm',
  };

  const LOCATIONS = [
    {
      id: 'merode',
      name: 'Mérode',
      address: 'Avenue des Celtes, 20 — Ring UFlow',
      city: 'Brussels',
    },
    {
      id: 'uccle-pluridys',
      name: 'Uccle — Espace Pluridys',
      address: 'Dieweg 99',
      city: 'Uccle',
    },
    {
      id: 'uccle-lateral',
      name: 'Uccle — Avenue Latérale',
      address: 'Vivier d\'Oie',
      city: 'Uccle',
    },
  ];

  const SERVICES = [
    { id: 'osteothai-75', name: 'Ostéothaï — Wuo Tai', duration: '1h15', price: 85, category: 'Osteopathy' },
    { id: 'osteothai-60', name: 'Ostéothaï — Wuo Tai', duration: '1h', price: 70, category: 'Osteopathy' },
    { id: 'osteothai-90', name: 'Ostéothaï — Wuo Tai', duration: '1h30', price: 100, category: 'Osteopathy' },
    { id: 'osteothai-120', name: 'Ostéothaï — Wuo Tai', duration: '2h', price: 130, category: 'Osteopathy' },
    { id: 'shiatsu-75', name: 'Shiatsu', duration: '1h15', price: 75, category: 'Bodywork' },
    { id: 'chi-nei-90', name: 'Chi Nei Tsang', duration: '1h30', price: 100, category: 'Abdominal therapy' },
    { id: 'chi-nei-75', name: 'Chi Nei Tsang', duration: '1h15', price: 85, category: 'Abdominal therapy' },
    { id: 'chi-nei-60', name: 'Chi Nei Tsang', duration: '1h', price: 70, category: 'Abdominal therapy' },
    { id: 'acupuncture-60', name: 'Acupuncture', duration: '1h', price: 60, category: 'Traditional medicine' },
    { id: 'cranio-60', name: 'Craniosacral', duration: '1h', price: 65, category: 'Craniosacral' },
  ];

  const TIME_SLOTS = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00',
  ];

  const state = {
    step: 'location',
    location: null,
    service: null,
    date: null,
    time: null,
    patient: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      notes: '',
      gdprConsent: false,
    },
    referenceId: null,
    error: null,
  };

  let root = null;
  let progressEl = null;
  let stepsContainer = null;
  let calendarMonth = new Date();

  function init() {
    root = document.getElementById('sypho-booking-root');
    if (!root) return;

    progressEl = document.getElementById('sypho-booking-progress');
    stepsContainer = document.getElementById('sypho-booking-steps');

    bindNavToggle();
    render();
  }

  function bindNavToggle() {
    const toggle = document.querySelector('[data-sypho-nav-toggle]');
    const mobile = document.querySelector('[data-sypho-nav-mobile]');
    if (toggle && mobile) {
      toggle.addEventListener('click', function () {
        mobile.classList.toggle('sypho-nav-mobile--open');
      });
    }
  }

  function setStep(step) {
    if (!STEPS.includes(step)) return;
    state.step = step;
    state.error = null;
    render();
    root.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function nextStep() {
    const idx = STEPS.indexOf(state.step);
    if (idx < STEPS.length - 1) {
      setStep(STEPS[idx + 1]);
    }
  }

  function prevStep() {
    const idx = STEPS.indexOf(state.step);
    if (idx > 0) {
      setStep(STEPS[idx - 1]);
    }
  }

  function validateCurrentStep() {
    state.error = null;
    switch (state.step) {
      case 'location':
        if (!state.location) {
          state.error = 'Please select a clinic location.';
          return false;
        }
        return true;
      case 'service':
        if (!state.service) {
          state.error = 'Please select a treatment.';
          return false;
        }
        return true;
      case 'schedule':
        if (!state.date || !state.time) {
          state.error = 'Please choose a date and time.';
          return false;
        }
        return true;
      case 'patient': {
        const p = state.patient;
        if (!p.firstName.trim() || !p.lastName.trim()) {
          state.error = 'Please enter your first and last name.';
          return false;
        }
        if (!p.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email)) {
          state.error = 'Please enter a valid email address.';
          return false;
        }
        if (!p.phone.trim()) {
          state.error = 'Please enter a phone number.';
          return false;
        }
        if (!p.gdprConsent) {
          state.error = 'You must accept the privacy policy to complete your booking.';
          return false;
        }
        return true;
      }
      default:
        return true;
    }
  }

  function submitBooking() {
    if (!validateCurrentStep()) {
      render();
      return;
    }
    state.referenceId = 'MS-' + Date.now().toString(36).toUpperCase();
    setStep('confirm');
  }

  function renderProgress() {
    if (!progressEl) return;
    progressEl.innerHTML = STEPS.map(function (step, i) {
      const currentIdx = STEPS.indexOf(state.step);
      const stepIdx = i;
      let cls = 'sypho-progress__step';
      if (stepIdx < currentIdx || state.step === 'confirm') cls += ' sypho-progress__step--done';
      if (step === state.step) cls += ' sypho-progress__step--active';
      return '<div class="' + cls + '">' + escapeHtml(STEP_LABELS[step]) + '</div>';
    }).join('');
  }

  function render() {
    if (!stepsContainer) return;
    renderProgress();

    let html = '';
    if (state.error) {
      html += '<div class="sypho-alert sypho-alert--error" role="alert">' + escapeHtml(state.error) + '</div>';
    }

    switch (state.step) {
      case 'location':
        html += renderLocationStep();
        break;
      case 'service':
        html += renderServiceStep();
        break;
      case 'schedule':
        html += renderScheduleStep();
        break;
      case 'patient':
        html += renderPatientStep();
        break;
      case 'confirm':
        html += renderConfirmStep();
        break;
    }

    if (state.step !== 'confirm') {
      html += renderBookingActions();
    }

    stepsContainer.innerHTML = html;
    bindStepEvents();
  }

  function renderLocationStep() {
    let cards = LOCATIONS.map(function (loc) {
      const selected = state.location && state.location.id === loc.id;
      return (
        '<button type="button" class="sypho-card sypho-card--selectable' + (selected ? ' sypho-card--selected' : '') + '" data-select-location="' + loc.id + '">' +
        '<div class="sypho-card__body">' +
        '<span class="sypho-badge">' + escapeHtml(loc.city) + '</span>' +
        '<h3 class="sypho-heading-3 sypho-mt-4">' + escapeHtml(loc.name) + '</h3>' +
        '<p class="sypho-text-muted sypho-mb-0">' + escapeHtml(loc.address) + '</p>' +
        '</div></button>'
      );
    }).join('');

    return (
      '<div class="sypho-booking-step sypho-booking-step--active">' +
      '<h2 class="sypho-heading-2">Choose your location</h2>' +
      '<p class="sypho-lead sypho-mt-4">Select the Maison Sypho site you wish to visit.</p>' +
      '<div class="sypho-grid sypho-grid--3 sypho-mt-8">' + cards + '</div>' +
      '</div>'
    );
  }

  function renderServiceStep() {
    let cards = SERVICES.map(function (svc) {
      const selected = state.service && state.service.id === svc.id;
      return (
        '<button type="button" class="sypho-card sypho-card--selectable' + (selected ? ' sypho-card--selected' : '') + '" data-select-service="' + svc.id + '">' +
        '<div class="sypho-card__body">' +
        '<span class="sypho-badge">' + escapeHtml(svc.category) + '</span>' +
        '<h3 class="sypho-heading-3 sypho-mt-4">' + escapeHtml(svc.name) + '</h3>' +
        '<div class="sypho-service-meta">' +
        '<span>' + escapeHtml(svc.duration) + '</span>' +
        '<span class="sypho-price">€' + svc.price + '</span>' +
        '</div></div></button>'
      );
    }).join('');

    return (
      '<div class="sypho-booking-step sypho-booking-step--active">' +
      '<h2 class="sypho-heading-2">Select your treatment</h2>' +
      '<p class="sypho-lead sypho-mt-4">All sessions are delivered with clinical precision and restorative care.</p>' +
      '<div class="sypho-grid sypho-grid--2 sypho-mt-8">' + cards + '</div>' +
      '</div>'
    );
  }

  function renderScheduleStep() {
    const cal = buildCalendarHtml();
    const slots = TIME_SLOTS.map(function (t) {
      const selected = state.time === t;
      return '<button type="button" class="sypho-slot' + (selected ? ' sypho-slot--selected' : '') + '" data-select-time="' + t + '">' + t + '</button>';
    }).join('');

    return (
      '<div class="sypho-booking-step sypho-booking-step--active">' +
      '<h2 class="sypho-heading-2">Choose date & time</h2>' +
      '<div class="sypho-grid sypho-grid--2 sypho-mt-8">' +
      '<div class="sypho-panel"><div class="sypho-panel__body">' + cal + '</div></div>' +
      '<div><h3 class="sypho-heading-3">Available times</h3>' +
      '<div class="sypho-slot-grid sypho-mt-4">' + slots + '</div></div>' +
      '</div></div>'
    );
  }

  function buildCalendarHtml() {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPad = (firstDay.getDay() + 6) % 7;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const monthName = firstDay.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });

    let html =
      '<div class="sypho-calendar-nav">' +
      '<button type="button" class="sypho-btn sypho-btn--ghost" data-cal-prev aria-label="Previous month">&larr;</button>' +
      '<span class="sypho-heading-3">' + monthName + '</span>' +
      '<button type="button" class="sypho-btn sypho-btn--ghost" data-cal-next aria-label="Next month">&rarr;</button>' +
      '</div>' +
      '<div class="sypho-calendar-grid">';

    ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].forEach(function (d) {
      html += '<span class="sypho-text-muted" style="font-size:0.7rem">' + d + '</span>';
    });

    for (let i = 0; i < startPad; i++) {
      html += '<span></span>';
    }

    for (let day = 1; day <= lastDay.getDate(); day++) {
      const d = new Date(year, month, day);
      const iso = formatDateIso(d);
      const isPast = d < today;
      const isWeekend = d.getDay() === 0 || d.getDay() === 6;
      const selected = state.date === iso;
      let cls = 'sypho-calendar-day';
      if (selected) cls += ' sypho-calendar-day--selected';
      html += '<button type="button" class="' + cls + '" data-select-date="' + iso + '"' +
        (isPast || isWeekend ? ' disabled' : '') + '>' + day + '</button>';
    }

    html += '</div>';
    return html;
  }

  function renderPatientStep() {
    const p = state.patient;
    return (
      '<div class="sypho-booking-step sypho-booking-step--active">' +
      '<h2 class="sypho-heading-2">Your details</h2>' +
      '<p class="sypho-lead sypho-mt-4">We protect your data under EU GDPR standards.</p>' +
      '<form class="sypho-form-grid sypho-form-grid--2 sypho-mt-8" id="sypho-patient-form" novalidate>' +
      field('firstName', 'First name', p.firstName) +
      field('lastName', 'Last name', p.lastName) +
      field('email', 'Email', p.email, 'email') +
      field('phone', 'Phone', p.phone, 'tel') +
      '<div class="sypho-field" style="grid-column:1/-1">' +
      '<label class="sypho-label" for="notes">Notes (optional)</label>' +
      '<textarea class="sypho-textarea" id="notes" name="notes">' + escapeHtml(p.notes) + '</textarea>' +
      '</div>' +
      '<div class="sypho-checkbox-row" style="grid-column:1/-1">' +
      '<input type="checkbox" id="gdprConsent" name="gdprConsent"' + (p.gdprConsent ? ' checked' : '') + ' />' +
      '<label for="gdprConsent">I agree to the processing of my personal data for appointment scheduling in accordance with the privacy policy.</label>' +
      '</div></form></div>'
    );
  }

  function field(name, label, value, type) {
    type = type || 'text';
    return (
      '<div class="sypho-field">' +
      '<label class="sypho-label" for="' + name + '">' + label + '</label>' +
      '<input class="sypho-input" type="' + type + '" id="' + name + '" name="' + name + '" value="' + escapeHtml(value) + '" required />' +
      '</div>'
    );
  }

  function renderConfirmStep() {
    const loc = state.location;
    const svc = state.service;
    const dateLabel = state.date
      ? new Date(state.date + 'T12:00:00').toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
      : '';

    return (
      '<div class="sypho-booking-step sypho-booking-step--active">' +
      '<div class="sypho-alert sypho-alert--success" role="status">' +
      '<strong>Appointment requested</strong> — Reference ' + escapeHtml(state.referenceId || '') +
      '</div>' +
      '<h2 class="sypho-heading-2">Thank you</h2>' +
      '<p class="sypho-lead sypho-mt-4">Your booking request has been received. Our team will confirm shortly by email.</p>' +
      '<div class="sypho-panel sypho-mt-8"><div class="sypho-panel__body">' +
      summaryRow('Location', loc ? loc.name + ' — ' + loc.address : '') +
      summaryRow('Treatment', svc ? svc.name + ' (' + svc.duration + ')' : '') +
      summaryRow('Date', dateLabel) +
      summaryRow('Time', state.time || '') +
      summaryRow('Price', svc ? '€' + svc.price : '') +
      summaryRow('Guest', state.patient.firstName + ' ' + state.patient.lastName) +
      summaryRow('Email', state.patient.email) +
      '</div></div>' +
      '<div class="sypho-booking-actions">' +
      '<a href="index.html" class="sypho-btn sypho-btn--primary">Return home</a>' +
      '</div></div>'
    );
  }

  function summaryRow(label, value) {
    return '<div class="sypho-summary-row"><span class="sypho-text-muted">' + escapeHtml(label) + '</span><span>' + escapeHtml(value) + '</span></div>';
  }

  function renderBookingActions() {
    const showBack = STEPS.indexOf(state.step) > 0;
    const isLast = state.step === 'patient';
    return (
      '<div class="sypho-booking-actions">' +
      (showBack ? '<button type="button" class="sypho-btn sypho-btn--outline" data-booking-back>Back</button>' : '<span></span>') +
      '<button type="button" class="sypho-btn sypho-btn--gold" data-booking-next>' +
      (isLast ? 'Confirm booking' : 'Continue') +
      '</button></div>'
    );
  }

  function bindStepEvents() {
    stepsContainer.querySelectorAll('[data-select-location]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const id = btn.getAttribute('data-select-location');
        state.location = LOCATIONS.find(function (l) { return l.id === id; }) || null;
        render();
      });
    });

    stepsContainer.querySelectorAll('[data-select-service]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const id = btn.getAttribute('data-select-service');
        state.service = SERVICES.find(function (s) { return s.id === id; }) || null;
        render();
      });
    });

    stepsContainer.querySelectorAll('[data-select-date]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        state.date = btn.getAttribute('data-select-date');
        render();
      });
    });

    stepsContainer.querySelectorAll('[data-select-time]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        state.time = btn.getAttribute('data-select-time');
        render();
      });
    });

    const prev = stepsContainer.querySelector('[data-cal-prev]');
    const next = stepsContainer.querySelector('[data-cal-next]');
    if (prev) {
      prev.addEventListener('click', function () {
        calendarMonth.setMonth(calendarMonth.getMonth() - 1);
        render();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        calendarMonth.setMonth(calendarMonth.getMonth() + 1);
        render();
      });
    }

    const backBtn = stepsContainer.querySelector('[data-booking-back]');
    if (backBtn) {
      backBtn.addEventListener('click', prevStep);
    }

    const nextBtn = stepsContainer.querySelector('[data-booking-next]');
    if (nextBtn) {
      nextBtn.addEventListener('click', function () {
        if (state.step === 'patient') {
          collectPatientForm();
          submitBooking();
        } else {
          if (validateCurrentStep()) nextStep();
          else render();
        }
      });
    }

    const form = document.getElementById('sypho-patient-form');
    if (form) {
      form.querySelectorAll('input, textarea').forEach(function (el) {
        el.addEventListener('change', collectPatientForm);
        el.addEventListener('input', collectPatientForm);
      });
    }
  }

  function collectPatientForm() {
    const form = document.getElementById('sypho-patient-form');
    if (!form) return;
    state.patient.firstName = (form.firstName && form.firstName.value) || '';
    state.patient.lastName = (form.lastName && form.lastName.value) || '';
    state.patient.email = (form.email && form.email.value) || '';
    state.patient.phone = (form.phone && form.phone.value) || '';
    state.patient.notes = (form.notes && form.notes.value) || '';
    state.patient.gdprConsent = !!(form.gdprConsent && form.gdprConsent.checked);
  }

  function formatDateIso(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + day;
  }

  function escapeHtml(str) {
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
