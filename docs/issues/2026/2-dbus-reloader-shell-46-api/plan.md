# Update D-Bus Reloader to GNOME Shell 46 API

## Overview

Update the D-Bus reloader development tool to use proper GNOME Shell 46 ExtensionManager API instead of type-unsafe `as any` workarounds.

## Background

### Current State

The D-Bus reloader (`src/reloader/reloader.ts`) currently uses:
```typescript
const extensionManager = (Main as any).extensionManager;
```

This bypasses TypeScript's type system and doesn't leverage the proper type definitions available in `@girs/gnome-shell@46.0.2`.

### Why This Exists

- During GNOME Shell 42 → 46 migration, the reloader was kept working using `as any`
- Shell 46 introduced breaking API changes to ExtensionManager
- Proper type definitions are now available in `@girs/gnome-shell/dist/ui/extensionSystem.d.ts`
- Old type definition file `src/types/extension-manager.d.ts` (Shell 42 era) has been removed

## Problem Statement

**Type Safety Issue:**
- Using `as any` defeats TypeScript's type checking
- No compile-time verification of ExtensionManager API usage
- Risk of runtime errors if API changes in future GNOME Shell versions

**Maintenance Burden:**
- Code doesn't reflect actual Shell 46 API
- Unclear what methods are available and their signatures
- No IDE autocomplete or type hints

## API Changes (Shell 42 → Shell 46)

Based on `@girs/gnome-shell/dist/ui/extensionSystem.d.ts`:

| Method | Shell 42 | Shell 46 |
|--------|----------|----------|
| `createExtensionObject()` | Returns `Extension` | Returns `void` |
| `loadExtension()` | Synchronous `boolean` | `Promise<void>` |
| `unloadExtension()` | Synchronous `boolean` | `Promise<boolean>` |
| `lookup()` | Returns `Extension \| null` | Returns `ExtensionObject` |

**Key Changes:**
- Extension creation now mutates internal state instead of returning object
- Loading/unloading became asynchronous (Promise-based)
- `Extension` type renamed to `ExtensionObject`

## Implementation Plan

### Step 1: Update Type Imports

Add proper imports from `@girs/gnome-shell`:

```typescript
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
// Main.extensionManager is now properly typed
```

### Step 2: Handle createExtensionObject API Change

**Before (Shell 42 pattern):**
```typescript
const newExtension = extensionManager.createExtensionObject(
  newUuid,
  tmpDirFile,
  1 // ExtensionType.PER_USER
);
extensionManager.loadExtension(newExtension);
```

**After (Shell 46 pattern):**
```typescript
// createExtensionObject returns void, mutates internal state
extensionManager.createExtensionObject(
  newUuid,
  tmpDirFile,
  1 // ExtensionType.PER_USER
);

// Retrieve the created extension using lookup
const newExtension = extensionManager.lookup(newUuid);
if (!newExtension) {
  throw new Error(`Failed to create extension object for ${newUuid}`);
}

await extensionManager.loadExtension(newExtension);
```

### Step 3: Convert to Async/Await

**Current code structure:**
```typescript
reload(): void {
  // ... disable old extension
  GLib.timeout_add(GLib.PRIORITY_DEFAULT, 100, () => {
    // ... load new extension
    return GLib.SOURCE_REMOVE;
  });
}
```

**Updated structure:**
```typescript
async reload(): Promise<void> {
  // ... disable old extension

  // Wait asynchronously instead of using GLib.timeout_add
  await this.waitAsync(100);

  // Use await for loading/unloading
  await extensionManager.loadExtension(newExtension);
}

private waitAsync(ms: number): Promise<void> {
  return new Promise((resolve) => {
    GLib.timeout_add(GLib.PRIORITY_DEFAULT, ms, () => {
      resolve();
      return GLib.SOURCE_REMOVE;
    });
  });
}
```

### Step 4: Update Method Signatures

Update all private methods to use proper types:

**Before:**
```typescript
private cleanupOldInstances(extensionManager: any): void
private unloadOldExtension(extensionManager: any, uuid: string): void
```

**After:**
```typescript
private cleanupOldInstances(extensionManager: typeof Main.extensionManager): void
private async unloadOldExtension(extensionManager: typeof Main.extensionManager, uuid: string): Promise<void>
```

### Step 5: Handle _extensions Internal Property

The `_extensions` property is private/internal. Options:

**Option A: Keep type assertion for internal access**
```typescript
const allExtensions = (extensionManager as any)._extensions;
```

**Option B: Use public API (preferred)**
```typescript
const uuids = extensionManager.getUuids();
for (const uuid of uuids) {
  const extension = extensionManager.lookup(uuid);
  // ...
}
```

**Recommendation:** Use Option B where possible, Option A only when necessary.

## Files to Modify

- `src/reloader/reloader.ts` - Main reloader implementation

## Testing Plan

- Build verification: `npm run build` must pass without errors
- Runtime testing:
  - Enable extension
  - Run `npm run reload`
  - Verify extension reloads successfully
  - Check console logs for errors
  - Verify D-Bus interface re-registers correctly

## Success Criteria

- No `as any` type assertions for ExtensionManager API
- All ExtensionManager method calls use proper types from `@girs/gnome-shell`
- TypeScript compilation succeeds
- Extension reload functionality works correctly
- Console logs show successful reload sequence

## Timeline Estimate

**Total: 3-4 points**

- Understanding Shell 46 API: 0.5 points
- Updating createExtensionObject pattern: 1 point
- Converting to async/await: 1.5 points
- Testing and debugging: 1 point

## Risks and Mitigations

**Risk 1: Async behavior changes**
- **Impact:** Timing-sensitive reload sequence might break
- **Mitigation:** Test thoroughly, add appropriate delays if needed

**Risk 2: Internal API access**
- **Impact:** `_extensions` might not have public alternative
- **Mitigation:** Keep minimal `as any` for truly private properties, document why

**Risk 3: Breaking reload functionality**
- **Impact:** Development workflow becomes slower
- **Mitigation:** Keep git backup before changes, test incrementally

## Future Improvements

After this update:
- Consider extracting reloader logic to separate package
- Add unit tests for reloader (currently untested)
- Document reload mechanism for contributors

## References

- GNOME Shell 46 ExtensionManager API: `node_modules/@girs/gnome-shell/dist/ui/extensionSystem.d.ts`
- Main module types: `node_modules/@girs/gnome-shell/dist/ui/main.d.ts`
- Current implementation: `src/reloader/reloader.ts`
