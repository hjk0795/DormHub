(function (window) {
  const ACK_STORAGE_KEY = 'dormhub_ack_verified_v1';
  const GOOGLE_SESSION_KEY = 'dormhub_google_session_v1';
  const SERVER_SYNC_KEY = 'dormhub_ack_server_sync_v1';
  const PREFILL_STORAGE_KEY = 'dormhub_google_prefill_v1';

  function readJson(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (error) {
      return fallback;
    }
  }

  function writeJson(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {}
  }

  function sanitizeRoom(value) {
    return String(value || '').replace(/\D+/g, '').slice(0, 5);
  }

  function sanitizeName(value) {
    return String(value || '')
      .replace(/[^\p{L}\s]/gu, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function toDisplayName(value) {
    return sanitizeName(value)
      .split(' ')
      .filter(Boolean)
      .map(part => part.charAt(0).toLocaleUpperCase() + part.slice(1).toLocaleLowerCase())
      .join(' ');
  }

  function normalizeName(name) {
    const base = String(name || '')
      .normalize('NFKC')
      .replace(/[\u200B-\u200D\uFEFF]/g, '')
      .replace(/[^\p{L}\s]/gu, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    const lower = base.toLocaleLowerCase();
    const hasLatin = /\p{Script=Latin}/u.test(lower);
    return hasLatin
      ? lower.normalize('NFD').replace(/\p{Diacritic}/gu, '')
      : lower;
  }

  function getAckState() {
    const saved = readJson(ACK_STORAGE_KEY, null);
    if (saved && saved.building && saved.room && saved.name) {
      return {
        building: String(saved.building || '').trim(),
        room: sanitizeRoom(saved.room || ''),
        name: toDisplayName(saved.name || ''),
        lang: saved.lang || 'vi'
      };
    }
    const records = readJson('dorm_ack', []);
    const latest = Array.isArray(records) ? [...records].reverse().find(item => item && item.building && item.room && item.name) : null;
    if (!latest) return null;
    return {
      building: String(latest.building || '').trim(),
      room: sanitizeRoom(latest.room || ''),
      name: toDisplayName(latest.name || ''),
      lang: latest.lang || 'vi'
    };
  }

  function setAckState(record) {
    if (!record?.building || !record?.room || !record?.name) return null;
    const saved = {
      building: String(record.building || '').trim(),
      room: sanitizeRoom(record.room || ''),
      name: toDisplayName(record.name || ''),
      lang: record.lang || 'vi'
    };
    writeJson(ACK_STORAGE_KEY, saved);
    return saved;
  }

  function getGoogleSession() {
    const saved = readJson(GOOGLE_SESSION_KEY, null);
    if (!saved || !saved.email) return null;
    return {
      email: String(saved.email || '').trim().toLowerCase(),
      name: String(saved.name || '').trim()
    };
  }

  function setGoogleSession(profile) {
    const email = String(profile?.email || '').trim().toLowerCase();
    if (!email) return null;
    const session = {
      email,
      name: String(profile?.name || '').trim()
    };
    writeJson(GOOGLE_SESSION_KEY, session);
    return session;
  }

  function clearGoogleSession() {
    try {
      localStorage.removeItem(GOOGLE_SESSION_KEY);
    } catch (error) {}
  }

  function setFlowPrefill(prefill) {
    writeJson(PREFILL_STORAGE_KEY, prefill || null);
  }

  function getFlowPrefill() {
    return readJson(PREFILL_STORAGE_KEY, null);
  }

  function clearFlowPrefill() {
    try {
      localStorage.removeItem(PREFILL_STORAGE_KEY);
    } catch (error) {}
  }

  function buildSyncKey(record, email) {
    return [
      String(email || '').trim().toLowerCase(),
      String(record?.building || '').trim(),
      sanitizeRoom(record?.room || ''),
      normalizeName(record?.name || '')
    ].join('::');
  }

  function hasServerSync(record, email) {
    const map = readJson(SERVER_SYNC_KEY, {});
    return !!map[buildSyncKey(record, email)];
  }

  function markServerSync(record, email) {
    const map = readJson(SERVER_SYNC_KEY, {});
    map[buildSyncKey(record, email)] = {
      at: new Date().toISOString(),
      email: String(email || '').trim().toLowerCase()
    };
    writeJson(SERVER_SYNC_KEY, map);
  }

  function resolveSubmitUrl(formUrl) {
    return String(formUrl || '')
      .replace('/viewform?usp=preview', '/formResponse')
      .replace('/viewform?usp=header', '/formResponse')
      .replace('/viewform', '/formResponse');
  }

  function parseCsv(text) {
    const rows = [];
    let row = [];
    let cell = '';
    let inQuotes = false;
    for (let i = 0; i < text.length; i += 1) {
      const ch = text[i];
      const next = text[i + 1];
      if (ch === '"') {
        if (inQuotes && next === '"') {
          cell += '"';
          i += 1;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (ch === ',' && !inQuotes) {
        row.push(cell);
        cell = '';
      } else if ((ch === '\n' || ch === '\r') && !inQuotes) {
        if (ch === '\r' && next === '\n') i += 1;
        row.push(cell);
        if (row.some(value => value !== '')) rows.push(row);
        row = [];
        cell = '';
      } else {
        cell += ch;
      }
    }
    row.push(cell);
    if (row.some(value => value !== '')) rows.push(row);
    return rows;
  }

  function findHeaderIndex(header, aliases) {
    const normalizedHeader = header.map(cell => normalizeName(cell || ''));
    for (const alias of aliases) {
      const idx = normalizedHeader.findIndex(cell => cell.includes(normalizeName(alias)));
      if (idx !== -1) return idx;
    }
    return -1;
  }

  async function findServerAckByEmail({ email, config }) {
    const lookupCsvUrl = String(config?.lookupCsvUrl || '').trim();
    const safeEmail = String(email || '').trim().toLowerCase();
    if (!lookupCsvUrl || !safeEmail) return null;
    const res = await fetch(lookupCsvUrl, { cache: 'no-store' });
    if (!res.ok) return null;
    const text = await res.text();
    const rows = parseCsv(text);
    const header = rows.shift() || [];
    const idx = {
      email: findHeaderIndex(header, ['email', 'email address', 'emailaddress', 'google email']),
      building: findHeaderIndex(header, ['building', 'toa nha']),
      room: findHeaderIndex(header, ['room', 'so phong']),
      name: findHeaderIndex(header, ['name', 'full name', 'ho va ten'])
    };
    if (idx.email === -1 || idx.building === -1 || idx.room === -1 || idx.name === -1) return null;
    const hit = rows.find(cols => String(cols[idx.email] || '').trim().toLowerCase() === safeEmail);
    if (!hit) return null;
    return {
      email: safeEmail,
      building: String(hit[idx.building] || '').trim(),
      room: sanitizeRoom(hit[idx.room] || ''),
      name: toDisplayName(hit[idx.name] || ''),
      lang: 'en'
    };
  }

  async function submitAckRecordToServer({ record, email, config }) {
    if (!config || !config.formUrl || !config.entries) throw new Error('missing_form_config');
    if (!record?.building || !record?.room || !record?.name || !email) throw new Error('missing_required_values');
    const body = new URLSearchParams();
    const entries = config.entries || {};
    const normalizedName = normalizeName(record.name);

    if (entries.building) body.set(entries.building, record.building);
    if (entries.room) body.set(entries.room, sanitizeRoom(record.room));
    if (entries.nameOriginal) body.set(entries.nameOriginal, toDisplayName(record.name));
    if (entries.nameNormalized) body.set(entries.nameNormalized, normalizedName);
    if (!entries.nameOriginal && !entries.nameNormalized && entries.name) {
      body.set(entries.name, toDisplayName(record.name));
    }
    if (entries.lang) body.set(entries.lang, record.lang || 'vi');
    if (entries.googleEmail) body.set(entries.googleEmail, String(email).trim().toLowerCase());
    if (entries.ackState) body.set(entries.ackState, 'completed');
    if (!entries.googleEmail) body.set('emailAddress', String(email).trim().toLowerCase());

    await fetch(resolveSubmitUrl(config.formUrl), {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
      body: body.toString()
    });
  }

  async function syncAckRecordWithEmail({ record, email, config, reviewSafe }) {
    const safeRecord = record || getAckState();
    const safeEmail = String(email || getGoogleSession()?.email || '').trim().toLowerCase();
    if (!safeRecord || !safeEmail) throw new Error('missing_record_or_email');
    if (hasServerSync(safeRecord, safeEmail)) return { status: 'already-synced' };
    if (reviewSafe) {
      markServerSync(safeRecord, safeEmail);
      return { status: 'mocked' };
    }
    await submitAckRecordToServer({ record: safeRecord, email: safeEmail, config });
    markServerSync(safeRecord, safeEmail);
    return { status: 'submitted' };
  }

  function decodeJwtPayload(credential) {
    const payload = String(credential || '').split('.')[1];
    if (!payload) throw new Error('missing_payload');
    const padded = payload.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(padded)
        .split('')
        .map(char => `%${char.charCodeAt(0).toString(16).padStart(2, '0')}`)
        .join('')
    );
    return JSON.parse(json);
  }

  window.DormResidentSession = {
    ACK_STORAGE_KEY,
    GOOGLE_SESSION_KEY,
    PREFILL_STORAGE_KEY,
    getAckState,
    setAckState,
    getGoogleSession,
    setGoogleSession,
    clearGoogleSession,
    setFlowPrefill,
    getFlowPrefill,
    clearFlowPrefill,
    sanitizeRoom,
    sanitizeName,
    toDisplayName,
    normalizeName,
    decodeJwtPayload,
    findServerAckByEmail,
    syncAckRecordWithEmail,
    submitAckRecordToServer
  };
})(window);
