# pix-key-core

Brazilian PIX key classification and validation: CPF, CNPJ, email, phone,
EVP. Zero runtime dependencies, Node >= 22.

Part of the LOFRANO TECNOLOGIA open-source lab. MIT.

```js
import { classify } from './src/pix.mjs';
classify('+55 11 98765-4321'); // { kind: 'phone', normalized: '+5511987654321' }
```

```sh
npm test          # 2 tests, 12 assertions, node:test, no dependencies
npm run demo
```

Syntactic only — an 11-digit mobile without `+55` reads as CPF and fails
loudly instead of guessing. MIT — see `LICENSE`. [Versão em português](README.pt-BR.md).
