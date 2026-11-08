#!/usr/bin/env node
// Demo: fixed keys, asserts classification. --assert exits non-zero on mismatch.
import { classify } from '../src/pix.mjs';

const CASES = [
  ['52998224725', 'cpf'],
  ['+55 11 98765-4321', 'phone'],
  ['nome@exemplo.com.br', 'email'],
  ['123e4567-e89b-12d3-a456-426614174000', 'evp'],
  ['11.222.333/0001-81', 'cnpj'],
];

let failed = 0;
for (const [input, kind] of CASES) {
  let pass = false;
  try {
    pass = classify(input).kind === kind;
  } catch { pass = false; }
  if (!pass) failed++;
  console.log(`${pass ? 'PASS' : 'FAIL'} ${input} -> ${kind}`);
}
if (process.argv.includes('--assert') && failed > 0) process.exit(1);
if (failed > 0) process.exitCode = 1;
console.log(failed === 0 ? 'demo: all cases as expected' : `demo: ${failed} mismatch(es)`);
