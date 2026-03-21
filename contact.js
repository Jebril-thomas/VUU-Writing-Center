/**
 * contact.js — VUU Writing Center
 * Handles contact form submission (JSON)
 */

(function () {
  // ── Configuration ──────────────────────────────────────────
  // Change this to your Render backend URL before deploying
  const API_BASE = window.VUU_API_BASE || 'https://vuu-writing-center.onrender.com';

  // ── DOM refs ────────────────────────────────────────────────
  const form       = document.getElementById('contactForm');
  const alertBox   = document.getElementById('contactAlert');
  const successBox = document.getElementById('successBox');
  const btnText    = document.getElementById('btnText');
  const btnSpinner = document.getElementById('btnSpinner');
  const submitBtn  = document.getElementById('submitBtn');

  if (!form) return;

  // ── Validation ──────────────────────────────────────────────
  function clearErrors() {
    document.getElementById('nameError').textContent = '';
    document.getElementById('emailError').textContent = '';
    document.getElementById('messageError').textContent = '';
    alertBox.className = 'alert hidden';
    alertBox.textContent = '';
  }

  function validate() {
    let valid = true;
    const name    = document.getElementById('name').value.trim();
    const email   = document.getElementById('email').value.trim();
    const message = document.getElementById('message').value.trim();

    if (!name) {
      document.getElementById('nameError').textContent = 'Full name is required.';
      valid = false;
    }

    if (!email) {
      document.getElementById('emailError').textContent = 'Email address is required.';
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      document.getElementById('emailError').textContent = 'Please enter a valid email.';
      valid = false;
    }

    if (!message) {
      document.getElementById('messageError').textContent = 'Message is required.';
      valid = false;
    } else if (message.length < 10) {
      document.getElementById('messageError').textContent = 'Message must be at least 10 characters.';
      valid = false;
    }

    return valid;
  }

  // ── UI helpers ──────────────────────────────────────────────
  function setLoading(loading) {
    submitBtn.disabled = loading;
    btnText.textContent = loading ? 'Sending…' : 'Send Message';
    btnSpinner.classList.toggle('hidden', !loading);
  }

  function showAlert(type, message) {
    alertBox.className = 'alert alert-' + type;
    alertBox.textContent = message;
  }

  // ── Submit ──────────────────────────────────────────────────
  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    clearErrors();

    if (!validate()) return;

    const payload = {
      name:    document.getElementById('name').value.trim(),
      email:   document.getElementById('email').value.trim(),
      message: document.getElementById('message').value.trim()
    };

    setLoading(true);

    try {
      const res = await fetch(API_BASE + '/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.ok) {
        form.classList.add('hidden');
        successBox.classList.remove('hidden');
      } else {
        showAlert('error', data.error || 'Could not send message. Please try again.');
      }
    } catch (err) {
      console.error(err);
      showAlert('error', 'Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  });
})();
