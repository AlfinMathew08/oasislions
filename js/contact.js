// Contact & Membership Enquiries Controller
// Handles client-side validation, spam protection (honeypot), Supabase submission,
// and user feedback for the Get in Touch section on index.html and contact.html.

import { getSupabase, isSupabaseConfigured } from './supabase.js';
import { sanitize } from './utils.js';

const ENQUIRIES_STORAGE_KEY = 'lions_enquiries_store_v1';

const ALLOWED_ENQUIRY_TYPES = [
  'Membership Enquiry',
  'General Enquiry',
  'Volunteering',
  'Partnership or Collaboration',
  'Other'
];

/**
 * Validates email format with standard email pattern.
 */
function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  return re.test(String(email).trim().toLowerCase());
}

/**
 * Validates international phone format.
 */
function isValidPhone(phone) {
  const cleaned = String(phone).trim().replace(/[\s\-\(\)\.]/g, '');
  // Must contain between 7 and 18 digits, optional leading +
  return /^\+?\d{7,18}$/.test(cleaned);
}

/**
 * Initializes the Contact & Membership Enquiry form.
 */
export function initContactSection(formId = 'contact-enquiry-form', feedbackId = 'contact-form-feedback') {
  const form = document.getElementById(formId);
  const feedback = document.getElementById(feedbackId);
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Clear existing feedback
    if (feedback) {
      feedback.style.display = 'none';
      feedback.className = 'contact-feedback-box';
      feedback.innerHTML = '';
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn ? submitBtn.innerHTML : 'Send Enquiry';

    // 1. Honeypot check
    const honeypot = form.querySelector('input[name="enquiry_hp"]');
    if (honeypot && honeypot.value.trim() !== '') {
      // Bot detected: silent reject with artificial simulated delay
      if (submitBtn) submitBtn.disabled = true;
      setTimeout(() => {
        form.reset();
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnText;
        }
        if (feedback) {
          feedback.className = 'contact-feedback-box feedback-success';
          feedback.innerHTML = 'Thank you for your enquiry. We will be in touch shortly.';
          feedback.style.display = 'block';
        }
      }, 800);
      return;
    }

    // 2. Extract and sanitize inputs
    const fullNameInput = form.querySelector('[name="full_name"]');
    const emailInput = form.querySelector('[name="email"]');
    const phoneInput = form.querySelector('[name="phone"]');
    const typeInput = form.querySelector('[name="enquiry_type"]');
    const messageInput = form.querySelector('[name="message"]');

    const fullName = (fullNameInput?.value || '').trim();
    const email = (emailInput?.value || '').trim().toLowerCase();
    const phone = (phoneInput?.value || '').trim();
    const enquiryType = (typeInput?.value || 'Membership Enquiry').trim();
    const message = (messageInput?.value || '').trim();

    // 3. Client-side Validation
    const errors = [];
    if (!fullName || fullName.length < 2) {
      errors.push('Please enter your full name (at least 2 characters).');
    }
    if (!email || !isValidEmail(email)) {
      errors.push('Please enter a valid email address.');
    }
    if (!phone || !isValidPhone(phone)) {
      errors.push('Please enter a valid phone number (e.g. +971 50 123 4567).');
    }
    if (!ALLOWED_ENQUIRY_TYPES.includes(enquiryType)) {
      errors.push('Please select a valid enquiry type.');
    }
    if (!message || message.length < 5) {
      errors.push('Please tell us a little about your enquiry or interest (at least 5 characters).');
    }

    if (errors.length > 0) {
      if (feedback) {
        feedback.className = 'contact-feedback-box feedback-error';
        feedback.innerHTML = `<strong>Please correct the following:</strong><ul>${errors.map(err => `<li>${sanitize(err)}</li>`).join('')}</ul>`;
        feedback.style.display = 'block';
        feedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
      return;
    }

    // 4. Submission in-flight state
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <span class="btn-spinner" aria-hidden="true"></span>
        <span>Submitting Enquiry...</span>
      `;
    }

    const payload = {
      full_name: fullName,
      email: email,
      phone: phone,
      enquiry_type: enquiryType,
      message: message,
      status: 'new',
      is_read: false,
      created_at: new Date().toISOString()
    };

    let savedSuccessfully = false;
    let errorMessage = null;

    // 5. Submit to Supabase
    const supabase = getSupabase();
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('contact_enquiries')
          .insert([payload])
          .select();

        if (error) {
          console.warn('Supabase enquiry insert error:', error);
          errorMessage = error.message;
        } else {
          savedSuccessfully = true;
          if (data && data[0]) {
            payload.id = data[0].id;
          }
        }
      } catch (err) {
        console.warn('Exception during Supabase enquiry submit:', err);
        errorMessage = err.message;
      }
    }

    // 6. Local Storage Fallback sync (ensures enquiries submitted during offline/dev mode are never lost)
    try {
      const storedRaw = localStorage.getItem(ENQUIRIES_STORAGE_KEY);
      const list = storedRaw ? JSON.parse(storedRaw) : [];
      payload.id = payload.id || `enq-${Date.now()}`;
      list.unshift(payload);
      localStorage.setItem(ENQUIRIES_STORAGE_KEY, JSON.stringify(list));
      if (!isSupabaseConfigured() || !supabase) {
        savedSuccessfully = true;
      }
    } catch (e) {
      console.warn('Could not persist enquiry to local store:', e);
    }

    // 7. Reset submission state & render feedback
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnText;
    }

    if (savedSuccessfully) {
      form.reset();
      if (feedback) {
        feedback.className = 'contact-feedback-box feedback-success';
        feedback.innerHTML = `
          <div style="display:flex; align-items:flex-start; gap:12px;">
            <span style="font-size:1.4rem; line-height:1;" aria-hidden="true">✓</span>
            <div>
              <strong style="display:block; font-size:1rem; margin-bottom:4px;">Enquiry Received with Thanks</strong>
              <span>Thank you, <strong>${sanitize(fullName)}</strong>. Your enquiry has been securely received by the Dubai Oasis Lions Club secretariat, and our team will get back to you.</span>
            </div>
          </div>
        `;
        feedback.style.display = 'block';
        feedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    } else {
      if (feedback) {
        feedback.className = 'contact-feedback-box feedback-error';
        feedback.innerHTML = `
          <strong>Submission could not be completed.</strong>
          <p style="margin:4px 0 0 0;">${errorMessage ? sanitize(errorMessage) : 'We were unable to submit your enquiry at this time. Please check your network connection and try again.'}</p>
        `;
        feedback.style.display = 'block';
        feedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  });
}
