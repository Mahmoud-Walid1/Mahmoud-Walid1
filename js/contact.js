/**
 * Contact Form & Channel Interactions Engine (contact.js)
 * Clean Architecture, Zero-Network validation, Doherty threshold response, and direct WhatsApp builder.
 */

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contact-form');
  const submitBtn = document.getElementById('submit-btn');
  const successBanner = document.getElementById('success-banner');
  const resetBtn = document.getElementById('reset-form-btn');
  const textarea = document.getElementById('message');
  const charCountEl = document.getElementById('char-count');
  const whatsappBtn = document.getElementById('btn-whatsapp-dynamic');
  const copyEmailBtn = document.getElementById('copy-email-btn');

  const WHATSAPP_PHONE = '201207384245';
  const PRIMARY_EMAIL = 'mahmoud968542@gmail.com';

  // 1. Live Character Counter
  if (textarea && charCountEl) {
    textarea.addEventListener('input', () => {
      const len = textarea.value.length;
      charCountEl.textContent = `${len} chars`;
      if (len > 0 && len < 10) {
        charCountEl.style.color = '#f43f5e';
      } else {
        charCountEl.style.color = 'var(--slate-500)';
      }
    });
  }

  // 2. Direct Dynamic WhatsApp Message Builder
  if (whatsappBtn) {
    whatsappBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const nameInput = document.getElementById('name');
      const subjectInput = document.getElementById('inquiry-type');
      const msgInput = document.getElementById('message');

      const name = nameInput ? nameInput.value.trim() : '';
      const subject = subjectInput ? subjectInput.value : 'General Inquiry';
      const msg = msgInput ? msgInput.value.trim() : '';

      let text = `Hi Mahmoud! I reached out via your portfolio website.`;
      if (name) text += `\n- Name: ${name}`;
      if (subject) text += `\n- Purpose: ${subject}`;
      if (msg) text += `\n- Message: ${msg}`;

      const waUrl = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(text)}`;
      window.open(waUrl, '_blank', 'noopener,noreferrer');
    });
  }

  // 3. One-Click Copy Email
  if (copyEmailBtn) {
    copyEmailBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      try {
        await navigator.clipboard.writeText(PRIMARY_EMAIL);
        const originalText = copyEmailBtn.innerHTML;
        copyEmailBtn.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color: #22c55e;"><polyline points="20 6 9 17 4 12"></polyline></svg>
          <span style="color: #22c55e;">Copied!</span>
        `;
        setTimeout(() => {
          copyEmailBtn.innerHTML = originalText;
        }, 2200);
      } catch (_) {
        window.location.href = `mailto:${PRIMARY_EMAIL}`;
      }
    });
  }

  // 4. Form Submission Lifecycle (Optimistic + Web3Forms / Mailto Dispatch)
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Zero-Network Validation
      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('email').value.trim();
      const inquiryType = document.getElementById('inquiry-type').value;
      const message = document.getElementById('message').value.trim();

      if (!name || !email || !message || message.length < 10) {
        if (!name) document.getElementById('name').focus();
        else if (!email) document.getElementById('email').focus();
        else if (message.length < 10) document.getElementById('message').focus();
        return;
      }

      // Enter Loading State
      submitBtn.classList.add('is-loading');
      submitBtn.disabled = true;

      try {
        // Attempt Web3Forms API submission
        const response = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            access_key: '64d603e8-5ee4-4364-a690-349079f8fe07', // Public portfolio submission endpoint
            name: name,
            email: email,
            subject: `[Portfolio Inquiry] ${inquiryType} from ${name}`,
            message: `Inquiry Type: ${inquiryType}\nSender Email: ${email}\n\nMessage:\n${message}`,
            from_name: name,
            to_email: PRIMARY_EMAIL
          })
        });

        const result = await response.json();

        if (response.status === 200 || result.success) {
          showSuccess();
        } else {
          // Graceful fallback to mailto if submission endpoint is blocked
          window.location.href = `mailto:${PRIMARY_EMAIL}?subject=${encodeURIComponent(`[${inquiryType}] from ${name}`)}&body=${encodeURIComponent(message)}`;
          showSuccess();
        }
      } catch (err) {
        console.warn('Network dispatch error, falling back to mailto:', err);
        window.location.href = `mailto:${PRIMARY_EMAIL}?subject=${encodeURIComponent(`[${inquiryType}] from ${name}`)}&body=${encodeURIComponent(message)}`;
        showSuccess();
      } finally {
        submitBtn.classList.remove('is-loading');
        submitBtn.disabled = false;
      }
    });
  }

  function showSuccess() {
    form.style.display = 'none';
    if (successBanner) {
      successBanner.classList.add('is-visible');
      successBanner.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      form.reset();
      form.style.display = 'flex';
      if (successBanner) {
        successBanner.classList.remove('is-visible');
      }
      if (charCountEl) charCountEl.textContent = '0 chars';
    });
  }
});
