const crypto = require('crypto');

const SHEET_TAB = process.env.GOOGLE_SHEET_TAB || 'DormAcknowledgements';
const SHEETS_SCOPE = 'https://www.googleapis.com/auth/spreadsheets';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_SHEETS_API = 'https://sheets.googleapis.com/v4/spreadsheets';

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'method_not_allowed' });
    return;
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  const building = String(body.building || '').trim();
  const room = String(body.room || '').trim();
  const name = String(body.name || '').trim();
  const lang = String(body.lang || '').trim();
  const submittedAt = String(body.date || '').trim();

  if (!building || !room || !name) {
    res.status(400).json({ ok: false, error: 'missing_fields' });
    return;
  }

  if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY || !process.env.GOOGLE_SHEET_ID) {
    res.status(500).json({ ok: false, error: 'missing_server_config' });
    return;
  }

  try {
    const accessToken = await getGoogleAccessToken();
    await appendRow(accessToken, [
      new Date().toISOString(),
      building,
      room,
      name,
      normalizeName(name),
      lang,
      submittedAt
    ]);
    res.status(200).json({ ok: true });
  } catch (error) {
    console.error('ack submit failed', error);
    res.status(500).json({ ok: false, error: 'submit_failed' });
  }
};

function normalizeName(name) {
  return String(name || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

async function appendRow(accessToken, row) {
  const range = encodeURIComponent(`${SHEET_TAB}!A:G`);
  const response = await fetch(
    `${GOOGLE_SHEETS_API}/${process.env.GOOGLE_SHEET_ID}/values/${range}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        majorDimension: 'ROWS',
        values: [row]
      })
    }
  );

  if (!response.ok) {
    throw new Error(`append_failed:${response.status}`);
  }
}

async function getGoogleAccessToken() {
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    scope: SHEETS_SCOPE,
    aud: GOOGLE_TOKEN_URL,
    exp: now + 3600,
    iat: now
  };

  const assertion = signJwt(payload, process.env.GOOGLE_PRIVATE_KEY);
  const body = new URLSearchParams({
    grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
    assertion
  });

  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body
  });

  if (!response.ok) {
    throw new Error(`token_failed:${response.status}`);
  }

  const data = await response.json();
  return data.access_token;
}

function signJwt(payload, privateKey) {
  const header = { alg: 'RS256', typ: 'JWT' };
  const encodedHeader = base64Url(JSON.stringify(header));
  const encodedPayload = base64Url(JSON.stringify(payload));
  const unsigned = `${encodedHeader}.${encodedPayload}`;

  const signer = crypto.createSign('RSA-SHA256');
  signer.update(unsigned);
  signer.end();

  const normalizedKey = String(privateKey).replace(/\\n/g, '\n');
  const signature = signer.sign(normalizedKey);
  return `${unsigned}.${base64Url(signature)}`;
}

function base64Url(value) {
  const buffer = Buffer.isBuffer(value) ? value : Buffer.from(value);
  return buffer
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}
