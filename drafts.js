/**
 * drafts.js — VUU Writing Center
 * Handles draft submission form (multipart/form-data)
 */

(function () {
  // ── Configuration ──────────────────────────────────────────
  // Change this to your Render backend URL before deploying
  const API_BASE = window.VUU_API_BASE || 'https://vuu-writing-center-api.onrender.com';

  // ── DOM refs ────────────────────────────────────────────────
  const form      = document.getElementById('draftForm');
  const alertBox  = document.getElementById('draftAlert');
  const successBox = document.getElementById('successBox');
  const btnText   = document.getElementById('btnText');
  const btnSpinner = document.getElementById('btnSpinner');
  const submitBtn = document.getElementById('submitBtn');
  const fileDrop  = document.getElementById('fileDrop');
  const fileInput = document.getElementById('file');
  const fileLabel = document.getElementById('fileLabel');

  if (!form) return;

  // ── File drag-and-drop visuals ──────────────────────────────
  fileDrop.addEventListener('dragover', function (e) {
    e.preventDefault();
    fileDrop.classList.add('drag-over');
  });

  fileDrop.addEventListener('dragleave', function () {
    fileDrop.classList.remove('drag-over');
  });

  fileDrop.addEventListener('drop', function (e) {
    e.preventDefault();
    fileDrop.classList.remove('drag-over');
    if (e.dataTransfer.files.length) {
      fileInput.files = e.dataTransfer.files;
      updateFileLabel(e.dataTransfer.files[0].name);
    }
  });

  fileInput.addEventListener('change', function () {
    if (fileInput.files.length) {
      updateFileLabel(fileInput.files[0].name);
    }
  });

  function updateFileLabel(name) {
    if (fileLabel) {
      fileLabel.textContent = '📄 ' + name;
    }
  }

  // ── Validation ──────────────────────────────────────────────
  function clearErrors() {
    document.getElementById('nameError').textContent = '';
    document.getElementById('emailError').textContent = '';
    document.getElementById('fileError').textContent = '';
    alertBox.className = 'alert hidden';
    alertBox.textContent = '';
  }

  function validate() {
    let valid = true;
    const name  = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const file  = fileInput.files[0];

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

    if (!file) {
      document.getElementById('fileError').textContent = 'Please select a file to upload.';
      valid = false;
    } else {
      const allowed = ['application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      const ext = file.name.split('.').pop().toLowerCase();
      if (!['pdf','doc','docx'].includes(ext)) {
        document.getElementById('fileError').textContent = 'Only PDF, DOC, or DOCX files are allowed.';
        valid = false;
      } else if (file.size > 10 * 1024 * 1024) {
        document.getElementById('fileError').textContent = 'File must be under 10MB.';
        valid = false;
      }
    }

    return valid;
  }

  // ── UI helpers ──────────────────────────────────────────────
  function setLoading(loading) {
    submitBtn.disabled = loading;
    btnText.textContent = loading ? 'Submitting…' : 'Submit Draft';
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

    const formData = new FormData();
    formData.append('name',  document.getElementById('name').value.trim());
    formData.append('email', document.getElementById('email').value.trim());
    formData.append('file',  fileInput.files[0]);

    setLoading(true);

    try {
      const res = await fetch(API_BASE + '/api/drafts', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();

      if (res.ok) {
        form.classList.add('hidden');
        successBox.classList.remove('hidden');
      } else {
        showAlert('error', data.error || 'Submission failed. Please try again.');
      }
    } catch (err) {
      console.error(err);
      showAlert('error', 'Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  });
})();
