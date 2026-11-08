# Design — pix-key-core

Kinds are disjoint by shape except the deliberate 11-digit rule: without
a country prefix there is no way to tell a mobile from a CPF, so the
registry-plausible reading (CPF) wins and the other fails loudly. Email
validation is intentionally shallow (shape + length) — deliverability is
out of scope.

Oracle: one valid fixture per kind with exact normalized output, plus a
distinct error per kind. No registry lookup, syntactic only.
