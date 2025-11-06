const api = {
  listByRoute: (routeId) => fetch(`/api/routes/${routeId}/reviews`).then(r => r.json()),
  summary: (routeId) => fetch(`/api/routes/${routeId}/rating`).then(r => r.json()),
  create: (payload) => fetch('/api/reviews', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }).then(r => r.ok ? r.json() : Promise.reject(r)),
  update: (id, commuterId, payload) => fetch(`/api/reviews/${id}?commuterId=${commuterId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }).then(r => r.ok ? r.json() : Promise.reject(r)),
  delete: (id, commuterId) => fetch(`/api/reviews/${id}?commuterId=${commuterId}`, { method: 'DELETE' }).then(r => r.ok ? true : Promise.reject(r)),
};

let editState = { id: null, commuterId: null };
let uiState = { page: 1, pageSize: 10, sortBy: 'newest', items: [] };

function getFormValues() {
  return {
    routeId: Number(document.getElementById('routeId').value),
    commuterId: Number(document.getElementById('commuterId').value),
    rating: Number(document.getElementById('rating').value),
    title: document.getElementById('title').value.trim(),
    comment: document.getElementById('comment').value.trim()
  };
}

function validate(values) {
  const errors = {};
  if (!values.routeId) errors.routeId = 'Route is required';
  if (!values.commuterId) errors.commuterId = 'Commuter is required';
  if (!values.rating || values.rating < 1 || values.rating > 5) errors.rating = 'Rating must be 1-5';
  if (!values.title) errors.title = 'Title is required';
  if (values.title && values.title.length > 120) errors.title = 'Max 120 characters';
  if (values.comment && values.comment.length > 2000) errors.comment = 'Max 2000 characters';
  return errors;
}

function showErrors(errors) {
  ['routeId','commuterId','rating','title','comment'].forEach(k => {
    const el = document.getElementById(`${k}-err`);
    if (el) el.textContent = errors[k] || '';
  });
}

async function load() {
  const routeId = Number(document.getElementById('routeId').value);
  if (!routeId) return;
  const [items, sum] = await Promise.all([
    api.listByRoute(routeId),
    api.summary(routeId)
  ]);
  uiState.items = items.slice();
  uiState.page = 1;
  applyListState();
  document.getElementById('summary').textContent = `Average: ${sum.averageRating} (${sum.totalReviews} reviews)`;
}

function applyListState() {
  const sorted = sortItems(uiState.items, uiState.sortBy);
  const { page, pageSize } = uiState;
  const start = (page - 1) * pageSize;
  const pageItems = sorted.slice(start, start + pageSize);
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  document.getElementById('pageInfo').textContent = `${page} / ${totalPages}`;
  document.getElementById('prevPage').disabled = page <= 1;
  document.getElementById('nextPage').disabled = page >= totalPages;
  renderList(pageItems);
  document.getElementById('empty').style.display = sorted.length ? 'none' : 'block';
}

function sortItems(items, sortBy) {
  const arr = items.slice();
  switch (sortBy) {
    case 'oldest':
      return arr.sort((a,b) => new Date(a.createdAt) - new Date(b.createdAt));
    case 'highest':
      return arr.sort((a,b) => b.rating - a.rating || new Date(b.createdAt) - new Date(a.createdAt));
    case 'lowest':
      return arr.sort((a,b) => a.rating - b.rating || new Date(a.createdAt) - new Date(b.createdAt));
    case 'newest':
    default:
      return arr.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
}

function renderList(items) {
  const list = document.getElementById('reviews');
  list.innerHTML = '';
  items.forEach(r => {
    const div = document.createElement('div');
    div.className = 'card';
    div.innerHTML = `
      <div class="title">${r.rating} ⭐ - ${escapeHtml(r.title)}</div>
      <div>${escapeHtml(r.comment || '')}</div>
      <div class="muted">Route ${r.routeId} • Commuter ${r.commuterId} • ${new Date(r.createdAt).toLocaleString()}</div>
      <div class="actions">
        <button class="ghost" onclick="startEdit(${r.id}, ${r.commuterId}, '${encodeURIComponent(r.title)}', '${encodeURIComponent(r.comment || '')}', ${r.rating})">Edit</button>
        <button onclick="doDelete(${r.id}, ${r.commuterId})">Delete</button>
      </div>
    `;
    list.appendChild(div);
  });
}

function escapeHtml(s) {
  return s.replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
}

async function submitForm() {
  const values = getFormValues();
  const errors = validate(values);
  showErrors(errors);
  if (Object.keys(errors).length) return;

  const submitBtn = document.getElementById('submitBtn');
  const prevText = submitBtn.textContent;
  submitBtn.disabled = true;
  submitBtn.textContent = editState.id ? 'Updating…' : 'Submitting…';
  try {
    if (editState.id) {
      const resp = await api.update(editState.id, editState.commuterId, {
        rating: values.rating,
        title: values.title,
        comment: values.comment,
      });
      if (!resp || !resp.id) throw new Error('Update failed');
      resetEdit();
      toast('Review updated');
    } else {
      const created = await api.create(values);
      if (!created || !created.id) throw new Error('Create failed');
      toast('Review added');
    }
    clearFormAfterSubmit();
    await load();
  } catch (e) {
    try {
      // Attempt to extract server error details
      if (e && typeof e.text === 'function') {
        const txt = await e.text();
        toast(parseServerError(txt) || 'Request failed', true);
      } else {
        toast(e && e.message ? e.message : 'Request failed', true);
      }
    } catch (_) {
      toast('Request failed', true);
    }
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = prevText;
  }
}

function startEdit(id, commuterId, encTitle, encComment, rating) {
  editState.id = id;
  editState.commuterId = commuterId;
  document.getElementById('title').value = decodeURIComponent(encTitle);
  document.getElementById('comment').value = decodeURIComponent(encComment);
  document.getElementById('rating').value = rating;
  document.getElementById('submitBtn').textContent = 'Update Review';
  document.getElementById('cancelBtn').style.display = 'inline-block';
}

function resetEdit() {
  editState.id = null;
  editState.commuterId = null;
  document.getElementById('submitBtn').textContent = 'Submit Review';
  document.getElementById('cancelBtn').style.display = 'none';
}

function clearFormAfterSubmit() {
  document.getElementById('title').value = '';
  document.getElementById('comment').value = '';
}

async function doDelete(id, commuterId) {
  const ok = await showConfirm();
  if (!ok) return;
  try {
    await api.delete(id, commuterId);
    toast('Review deleted');
    await load();
  } catch (e) {
    toast('Delete failed', true);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('routeId').addEventListener('input', load);
  document.getElementById('submitBtn').addEventListener('click', submitForm);
  document.getElementById('cancelBtn').addEventListener('click', () => { resetEdit(); clearFormAfterSubmit(); });
  initStars();
  initControls();
  initTheme();
  load();
});

function initStars() {
  const stars = Array.from(document.querySelectorAll('#stars .star'));
  const ratingInput = document.getElementById('rating');
  const setActive = (val) => {
    stars.forEach(s => s.classList.toggle('active', Number(s.dataset.value) <= val));
    ratingInput.value = val;
  };
  stars.forEach(s => {
    s.addEventListener('mouseenter', () => setActive(Number(s.dataset.value)));
    s.addEventListener('click', () => setActive(Number(s.dataset.value)));
  });
  document.getElementById('stars').addEventListener('mouseleave', () => setActive(Number(ratingInput.value)));
  setActive(Number(ratingInput.value || 5));
}

let toastTimer;
function toast(message, isError = false) {
  const t = document.getElementById('toast');
  t.textContent = message;
  t.style.background = isError ? '#b91c1c' : '#111827';
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2200);
}

function parseServerError(txt) {
  // Try JSON first
  try {
    const obj = JSON.parse(txt);
    if (obj && obj.message) return obj.message;
    if (obj && obj.errors) {
      const first = Object.values(obj.errors)[0];
      return Array.isArray(first) ? first[0] : first;
    }
  } catch (_) {}
  // Fallback: extract brief text
  if (typeof txt === 'string') {
    const m = txt.match(/"message"\s*:\s*"([^"]+)"/);
    if (m) return m[1];
    return txt.substring(0, 160);
  }
  return null;
}

function initControls() {
  const sortBy = document.getElementById('sortBy');
  const pageSize = document.getElementById('pageSize');
  const prev = document.getElementById('prevPage');
  const next = document.getElementById('nextPage');
  sortBy.addEventListener('change', () => { uiState.sortBy = sortBy.value; uiState.page = 1; applyListState(); });
  pageSize.addEventListener('change', () => { uiState.pageSize = Number(pageSize.value); uiState.page = 1; applyListState(); });
  prev.addEventListener('click', () => { if (uiState.page > 1) { uiState.page--; applyListState(); }});
  next.addEventListener('click', () => { uiState.page++; applyListState(); });
}

function initTheme() {
  const key = 'commuter-theme';
  const saved = localStorage.getItem(key);
  if (saved === 'dark') document.body.classList.add('dark');
  document.getElementById('themeBtn').addEventListener('click', () => {
    document.body.classList.toggle('dark');
    localStorage.setItem(key, document.body.classList.contains('dark') ? 'dark' : 'light');
  });
}

// Confirm modal
let confirmResolve;
function showConfirm() {
  return new Promise((resolve) => {
    confirmResolve = resolve;
    const m = document.getElementById('confirmModal');
    m.style.display = 'flex';
  });
}
function hideConfirm() {
  const m = document.getElementById('confirmModal');
  m.style.display = 'none';
}
document.addEventListener('DOMContentLoaded', () => {
  const ok = document.getElementById('confirmOk');
  const cancel = document.getElementById('confirmCancel');
  ok.addEventListener('click', () => { hideConfirm(); confirmResolve && confirmResolve(true); });
  cancel.addEventListener('click', () => { hideConfirm(); confirmResolve && confirmResolve(false); });
});



