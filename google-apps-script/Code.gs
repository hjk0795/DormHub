const SHEET_NAME = 'DormAcknowledgements';

function doOptions() {
  return ContentService
    .createTextOutput('')
    .setMimeType(ContentService.MimeType.TEXT);
}

function doPost(e) {
  const body = parseBody_(e);
  const action = String(body.action || '').trim();

  if (action === 'submit') {
    return jsonResponse(handleSubmit_(body));
  }
  if (action === 'find') {
    return jsonResponse(handleFind_(body));
  }

  return jsonResponse({ ok: false, error: 'invalid_action' });
}

function handleSubmit_(body) {
  const building = String(body.building || '').trim();
  const room = String(body.room || '').trim();
  const name = String(body.name || '').trim();
  const lang = String(body.lang || '').trim();
  const submittedAt = String(body.date || '').trim();

  if (!building || !room || !name) {
    return { ok: false, error: 'missing_fields' };
  }

  const sheet = getSheet_();
  sheet.appendRow([
    new Date(),
    building,
    room,
    name,
    normalizeName_(name),
    lang,
    submittedAt
  ]);

  return { ok: true };
}

function handleFind_(body) {
  const building = String(body.building || '').trim();
  const room = String(body.room || '').trim();
  const name = String(body.name || '').trim();

  if (!building || !room || !name) {
    return { ok: false, error: 'missing_fields' };
  }

  const normalized = normalizeName_(name);
  const sheet = getSheet_();
  const values = sheet.getDataRange().getValues();

  for (let i = 1; i < values.length; i += 1) {
    const row = values[i];
    if (
      String(row[1]).trim() === building &&
      String(row[2]).trim() === room &&
      normalizeName_(row[3]) === normalized
    ) {
      return {
        ok: true,
        record: {
          building: row[1],
          room: row[2],
          name: row[3],
          lang: row[5],
          date: row[6]
        }
      };
    }
  }

  return { ok: true, record: null };
}

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(['created_at', 'building', 'room', 'name', 'normalized_name', 'lang', 'submitted_at']);
  }
  return sheet;
}

function normalizeName_(name) {
  return String(name || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function jsonResponse(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

function parseBody_(e) {
  const raw = e && e.postData && e.postData.contents ? String(e.postData.contents) : '';
  if (raw && raw.trim().charAt(0) === '{') {
    return JSON.parse(raw);
  }
  return Object.assign({}, e ? e.parameter : {});
}
