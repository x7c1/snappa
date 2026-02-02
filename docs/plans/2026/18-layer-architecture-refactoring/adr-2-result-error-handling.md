# ADR-2: Error Handling Strategy with Result Types

## Status

Accepted

## Context

TypeScript exceptions are untyped and invisible in function signatures. Callers can easily forget to handle errors. We want a safer approach without abandoning the exception-based ecosystem entirely.

Rust uses `Result<T, E>` types that force callers to handle errors explicitly. We want similar guarantees at the UI boundary.

## Options Considered

### Option 1: Exceptions Everywhere

```typescript
class LicenseKey {
  constructor(readonly value: string) {
    if (!/.../test(value)) throw new ValidationError('...');
  }
}

class ActivateLicense {
  async execute(rawKey: string): Promise<License> {
    const key = new LicenseKey(rawKey);  // may throw
    // ...
  }
}

// UI
try {
  const license = await activateLicense.execute(rawKey);
  showSuccess(license);
} catch (e) {
  showError(e);  // easy to forget
}
```

**Cons:**
- Caller can forget `try/catch`
- No compile-time enforcement
- Error types not visible in signature

### Option 2: Result Types Everywhere

```typescript
class LicenseKey {
  private constructor(readonly value: string) {}

  static create(value: string): Result<LicenseKey, ValidationError> {
    if (!/.../test(value)) {
      return { ok: false, error: new ValidationError('...') };
    }
    return { ok: true, value: new LicenseKey(value) };
  }
}
```

**Cons:**
- Verbose in Domain layer
- Doesn't match ecosystem conventions
- Every operation needs Result unwrapping

### Option 3: Exceptions in Domain, Result at UseCase Boundary

```typescript
// Domain layer: throw exceptions (simple, conventional)
class LicenseKey {
  #brand: void;
  constructor(readonly value: string) {
    if (!/.../test(value)) throw new ValidationError('...');
  }
}

// UseCase layer: catch and convert to Result
class ActivateLicense {
  async execute(rawKey: string): Promise<Result<License, ActivationError>> {
    try {
      const key = new LicenseKey(rawKey);
      const response = await this.apiClient.activate(key, deviceId);
      const license = new License(...);
      await this.repository.save(license);
      return { ok: true, value: license };
    } catch (e) {
      return { ok: false, error: toActivationError(e) };
    }
  }
}

// UI layer: always receives Result
const result = await activateLicense.execute(rawKey);
if (!result.ok) {
  showError(result.error.message);  // must handle
  return;
}
showSuccess(result.value);
```

## Decision

Use **Option 3: Exceptions in Domain, Result at UseCase Boundary**.

## Rationale

- **Domain stays simple**: Conventional exception-based validation
- **UseCase encapsulates errors**: Converts exceptions to typed Result
- **UI gets compile-time safety**: Cannot access `value` without checking `ok`
- **Gradual adoption**: Can be introduced incrementally per UseCase
- **Ecosystem compatible**: Works with exception-throwing libraries (Soup, GLib, etc.)

## Result Type Definition

```typescript
type Result<T, E> =
  | { ok: true; value: T }
  | { ok: false; error: E };

// Helper functions (optional)
function ok<T>(value: T): Result<T, never> {
  return { ok: true, value };
}

function err<E>(error: E): Result<never, E> {
  return { ok: false, error };
}
```

## Error Type Guidelines

Each UseCase defines its own error type:

```typescript
type ActivationError =
  | { type: 'INVALID_KEY'; message: string }
  | { type: 'NETWORK_ERROR'; message: string }
  | { type: 'ALREADY_ACTIVATED'; message: string };

type LoadCollectionError =
  | { type: 'NOT_FOUND'; message: string }
  | { type: 'CORRUPTED'; message: string };
```

This makes error handling explicit and exhaustive:

```typescript
switch (result.error.type) {
  case 'INVALID_KEY':
    // ...
  case 'NETWORK_ERROR':
    // ...
  case 'ALREADY_ACTIVATED':
    // ...
  // TypeScript warns if a case is missing
}
```

## Layer Responsibilities

| Layer | Error Handling |
|-------|----------------|
| Domain | Throw exceptions for invariant violations |
| UseCase | Catch exceptions, return `Result<T, E>` |
| Infrastructure | Throw exceptions (wrapped if needed) |
| UI | Receive `Result<T, E>`, handle both cases |
