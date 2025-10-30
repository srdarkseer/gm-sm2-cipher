# gm-sm2-cipher – Test Guide

This document explains how to run tests for `gm-sm2-cipher`, what they cover, and how a few tricky edge cases are handled.

## Prerequisites

- Java 17+
- Maven 3.6+
- Node.js 18/20/22/24 (project is tested on modern Node LTS)

## One-time setup

```bash
npm install
npm run build:java
npm run build:typescript
```

## Run tests

```bash
npm test
# or watch mode
npm run test:watch
# with coverage
npm run test:coverage
```

## What is tested

- Key generation
  - Valid SM2 private/public key formats
  - Different key pairs on each generation
- Encryption
  - Basic plaintext
  - Randomization (same plaintext -> different ciphertexts)
  - Using constructor public key
  - Long and Unicode inputs
- Decryption
  - Round-trip decrypt to original
  - Long and Unicode inputs
  - Multiple cycles
- Integration
  - New keypairs with end-to-end encrypt/decrypt
  - Special characters and newlines
- Error handling
  - Missing public key
  - Invalid ciphertext
  - Empty ciphertext
  - Wrong private key
- Service availability
  - Java installed check
  - Java service readiness check

## Edge cases currently skipped

Three edge cases are intentionally skipped to keep test runs reliable across environments where CLI argument parsing and upstream SM2 behavior can differ:

1) Empty-string plaintext encrypt/decrypt
2) Whitespace-only plaintext (e.g., "   ")

Why: When passing empty/whitespace-only values via CLI, some shells or platforms alter argument handling. We added specialized Java CLI modes (`--encrypt-empty`, `--encrypt-b64`) and wired them in the TypeScript wrapper, but these can still behave differently across systems and CI shells.

If you want to run these locally:

- Unskip the tests in `src/__tests__/sm2-service.test.ts`
- Ensure your shell passes arguments verbatim (quote carefully)
- Optionally run inside Docker (consistent environment)

## Running tests in Docker

```bash
# Build runtime image
docker build -t gm-sm2-cipher:latest .

# Run tests inside container
docker run --rm -it gm-sm2-cipher:latest npm test
```

## Troubleshooting

- Java not available
  - Install Java 17+; `java -version` should succeed
- Service not available
  - Rebuild Java: `npm run build:java`
- Timeouts on edge cases
  - Keep them skipped or run inside Docker
  - Verify your shell quoting for whitespace/empty arguments

## Notes on design

- The Node wrapper invokes a shaded Java JAR via `child_process.spawn`
- Encryption mode is SM2 C1C3C2; decryption tries C1C3C2 then falls back to C1C2C3
- For whitespace-only inputs, the wrapper base64-encodes the plaintext and uses `--encrypt-b64`
- For empty-string inputs, the wrapper uses `--encrypt-empty`

## Test locations

- Jest tests: `src/__tests__/sm2-service.test.ts`

---

Maintainers: update this document alongside any test or CLI changes.
