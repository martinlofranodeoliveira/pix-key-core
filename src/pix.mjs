// SPDX-License-Identifier: MIT
// Brazilian PIX key classification and validation (Banco Central shapes):
// CPF, CNPJ, email (<=77 chars), phone (+55...), EVP (UUID). Strict shapes,
// no guessing across kinds. No network, no I/O.

export const MAX_LENGTH = 77;

export class PixError extends Error {
  constructor(code, detail = '') {
    super(detail ? `${code}: ${detail}` : code);
    this.name = 'PixError';
    this.code = code;
  }
}

function mod11(digits, weights) {
  const sum = digits.split('').reduce((n, d, i) => n + Number(d) * weights[i], 0);
  const r = sum % 11;
  return r < 2 ? 0 : 11 - r;
}

const CPF_W1 = [10, 9, 8, 7, 6, 5, 4, 3, 2];
const CPF_W2 = [11, 10, 9, 8, 7, 6, 5, 4, 3, 2];
const CNPJ_W1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
const CNPJ_W2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

function checkCPF(d) {
  if (!/^[0-9]{11}$/.test(d) || /^(\d)\1+$/.test(d)) return false;
  const d1 = mod11(d.slice(0, 9), CPF_W1);
  const d2 = mod11(d.slice(0, 9) + d1, CPF_W2);
  return d[9] === String(d1) && d[10] === String(d2);
}

function checkCNPJ(d) {
  if (!/^[0-9]{14}$/.test(d) || /^(\d)\1+$/.test(d)) return false;
  const d1 = mod11(d.slice(0, 12), CNPJ_W1);
  const d2 = mod11(d.slice(0, 12) + d1, CNPJ_W2);
  return d[12] === String(d1) && d[13] === String(d2);
}

const UUID_SHAPE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const EMAIL_SHAPE = /^[^\s@]{1,64}@[^\s@]{1,253}\.[^\s@]{2,}$/;

/**
 * Classify and validate. Returns { kind, normalized } where normalized is
 * the canonical form (digits / lowercase email / +55... / lowercase UUID).
 */
export function classify(input) {
  if (typeof input !== 'string') throw new PixError('NOT_STRING');
  const t = input.trim();
  if (t.length === 0) throw new PixError('EMPTY');
  if (t.length > MAX_LENGTH + 20) throw new PixError('TOO_LONG');
  // Email (contains @).
  if (t.includes('@')) {
    if (t.length > MAX_LENGTH || !EMAIL_SHAPE.test(t)) throw new PixError('BAD_EMAIL');
    return { kind: 'email', normalized: t.toLowerCase() };
  }
  // EVP (UUID shape).
  if (UUID_SHAPE.test(t.toLowerCase())) {
    return { kind: 'evp', normalized: t.toLowerCase() };
  }
  // Phone: explicit +55... or 55-leading, or bare 10-digit landline.
  const digits = t.replace(/[^\d]/g, '');
  const hasPlus = t.trim().startsWith('+');
  if (hasPlus || (digits.startsWith('55') && (digits.length === 12 || digits.length === 13))) {
    const national = hasPlus ? digits.slice(2) : digits.slice(2);
    if (hasPlus && !digits.startsWith('55')) throw new PixError('BAD_PHONE_COUNTRY');
    if (national.length !== 10 && national.length !== 11) throw new PixError('BAD_PHONE_LEN');
    if (!/^[1-9]{2}([2-5][0-9]{7}|9[5-9][0-9]{7})$/.test(national)) throw new PixError('BAD_PHONE');
    return { kind: 'phone', normalized: `+55${national}` };
  }
  // Bare 10-digit landline (unambiguous length).
  if (/^[0-9]{10}$/.test(digits) && digits.length === t.replace(/\D/g, '').length) {
    if (!/^[1-9]{2}[2-5][0-9]{7}$/.test(digits)) throw new PixError('BAD_PHONE');
    return { kind: 'phone', normalized: `+55${digits}` };
  }
  // CPF / CNPJ by digit length.
  if (/^[0-9]{11}$/.test(digits) && digits.length === t.replace(/\D/g, '').length) {
    if (!checkCPF(digits)) throw new PixError('BAD_CPF');
    return { kind: 'cpf', normalized: digits };
  }
  if (/^[0-9]{14}$/.test(digits) && digits.length === t.replace(/\D/g, '').length) {
    if (!checkCNPJ(digits)) throw new PixError('BAD_CNPJ');
    return { kind: 'cnpj', normalized: digits };
  }
  throw new PixError('UNKNOWN_KIND');
}

/** Non-throwing: { ok:true, kind, normalized } or { ok:false, code }. */
export function check(input) {
  try {
    return { ok: true, ...classify(input) };
  } catch (err) {
    if (err instanceof PixError) return { ok: false, code: err.code };
    throw err;
  }
}
