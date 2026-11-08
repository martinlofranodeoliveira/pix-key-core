import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { classify, check, PixError } from '../src/pix.mjs';

describe('classify', () => {
  it('routes all five kinds', () => {
    assert.deepEqual(classify('52998224725'), { kind: 'cpf', normalized: '52998224725' });
    assert.deepEqual(classify('11.222.333/0001-81'), { kind: 'cnpj', normalized: '11222333000181' });
    assert.deepEqual(classify('Nome@Exemplo.com.br'), { kind: 'email', normalized: 'nome@exemplo.com.br' });
    assert.deepEqual(classify('+55 11 98765-4321'), { kind: 'phone', normalized: '+5511987654321' });
    assert.deepEqual(classify('123e4567-e89b-12d3-a456-426614174000'), { kind: 'evp', normalized: '123e4567-e89b-12d3-a456-426614174000' });
    assert.deepEqual(classify('2134567890'), { kind: 'phone', normalized: '+552134567890' });
  });
  it('rejects each kind distinctly', () => {
    assert.equal(check('52998224726').code, 'BAD_CPF');
    assert.equal(check('11222333000182').code, 'BAD_CNPJ');
    assert.equal(check('not-an-email').code, 'UNKNOWN_KIND');
    assert.equal(check('a@b').code, 'BAD_EMAIL');
    assert.equal(check('+54 11 98765-4321').code, 'BAD_PHONE_COUNTRY');
    assert.equal(check('(00) 98765-4321').code, 'BAD_CPF'); // 11 digits dispatch to CPF
    assert.throws(() => classify(42), (e) => e.code === 'NOT_STRING');
    assert.ok(new PixError('X') instanceof Error);
  });
});
