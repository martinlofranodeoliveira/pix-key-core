# Contract — pix-key-core

Pure ESM in `src/pix.mjs`, zero runtime dependencies, Node >= 22.
Dispatch order is fixed and documented: `@` → email, UUID shape → EVP,
`+`/55-lead/bare-10-digit → phone, 11 digits → CPF, 14 digits → CNPJ.

| Export | Result |
| --- | --- |
| `MAX_LENGTH` (77+20) | Input cap (email registry limit is 77). |
| `classify(input)` | `{ kind, normalized }`. Email lowercased, phones `+55…`, UUID lowercase, docs digits-only. |
| `check(input)` | `{ ok:true, ... }` or `{ ok:false, code }`. |

CPF/CNPJ reuse Federal Revenue mod-11 with repeated-digit rejection.
An 11-digit mobile without `+55` dispatches to CPF and fails `BAD_CPF` —
documented, never silently reinterpreted as phone.

Errors: `NOT_STRING` · `EMPTY` · `TOO_LONG` · `BAD_EMAIL` ·
`BAD_PHONE_COUNTRY` · `BAD_PHONE_LEN` · `BAD_PHONE` · `BAD_CPF` ·
`BAD_CNPJ` · `UNKNOWN_KIND`.
