# Plan 22: GnomeShellMonitorProvider File I/O Extraction

## Overview

Extract file I/O responsibilities from `GnomeShellMonitorProvider` into a dedicated repository class, following the layer architecture pattern established in Plan 18.

## Background

`GnomeShellMonitorProvider` in `infra/monitor/` directly performs file I/O operations using `getExtensionDataPath` from `infra/file/`. This violates single responsibility and creates inappropriate cross-dependencies within the infrastructure layer.

## Current State

`GnomeShellMonitorProvider` (`infra/monitor/gnome-shell-monitor-provider.ts`) has two methods that perform file I/O:

- `loadStorage()`: Loads monitor environment configuration from file
- `saveMonitors()`: Saves monitor configuration to file

Both methods use `getExtensionDataPath(MONITORS_FILE_NAME)` to access `monitors.snappa.json`.

### Existing Layer Structure

```
usecase/monitor/
  MonitorProvider           # Interface for monitor access (already exists)
  MonitorCountRepository    # Interface for loading monitor count (already exists)
  MonitorDetector           # Interface for detecting monitors (already exists)

infra/monitor/
  GnomeShellMonitorProvider # Implements MonitorProvider (has file I/O problem)
  GdkMonitorDetector        # Implements MonitorDetector

infra/file/
  FileMonitorCountRepository  # Implements MonitorCountRepository
```

## Problem

- `GnomeShellMonitorProvider` has mixed responsibilities (monitor detection + file storage)
- `infra/monitor/` depends on `infra/file/` utilities (`getExtensionDataPath`)
- Difficult to test monitor logic in isolation from file system

## Solution

### Separation of Concerns

The current `saveMonitors()` method contains two distinct responsibilities:

1. **Business logic**: Environment ID generation, change detection, collection activation decision
2. **File I/O**: Reading/writing `MonitorEnvironmentStorage` to disk

The repository will handle only file I/O. Business logic remains in `GnomeShellMonitorProvider`.

### Create New Repository Interface

Create `MonitorEnvironmentRepository` interface in `usecase/monitor/`:

```typescript
interface MonitorEnvironmentRepository {
  load(): MonitorEnvironmentStorage | null;
  save(storage: MonitorEnvironmentStorage): void;
}
```

### Create File-based Implementation

Create `FileMonitorEnvironmentRepository` in `infra/file/`:

```typescript
class FileMonitorEnvironmentRepository implements MonitorEnvironmentRepository {
  constructor(private readonly filePath: string) {}

  load(): MonitorEnvironmentStorage | null { ... }
  save(storage: MonitorEnvironmentStorage): void { ... }
}
```

### Refactor GnomeShellMonitorProvider

- Inject `MonitorEnvironmentRepository` via constructor
- Replace direct Gio file operations with repository calls
- Keep all environment management logic (ID generation, change detection, `saveMonitors()` return value)

## Implementation Steps

1. Create `MonitorEnvironmentRepository` interface in `usecase/monitor/`
2. Create `FileMonitorEnvironmentRepository` in `infra/file/`
3. Refactor `GnomeShellMonitorProvider`:
   - Add constructor parameter: `repository: MonitorEnvironmentRepository`
   - Replace `loadStorage()` file operations with `this.repository.load()`
   - Replace `saveMonitors()` file operations with `this.repository.save()`
   - Keep `saveMonitors()` return type as `string | null` (business logic unchanged)
4. Update `Controller` to instantiate and inject dependencies:
   ```typescript
   const repository = new FileMonitorEnvironmentRepository(
     getExtensionDataPath(MONITORS_FILE_NAME)
   );
   this.monitorProvider = new GnomeShellMonitorProvider(repository);
   ```
5. Remove `getExtensionDataPath` and `Gio` imports from `gnome-shell-monitor-provider.ts`
6. Export `FileMonitorEnvironmentRepository` from `infra/file/index.ts`
7. Run build, check, and tests

## Expected Outcome

```
usecase/monitor/
  MonitorProvider               # Interface (existing)
  MonitorCountRepository        # Interface (existing)
  MonitorDetector               # Interface (existing)
  MonitorEnvironmentRepository  # Interface (new)

infra/file/
  FileMonitorCountRepository       # Implementation (existing)
  FileMonitorEnvironmentRepository # Implementation (new)

infra/monitor/
  GnomeShellMonitorProvider  # No longer imports from infra/file/
  GdkMonitorDetector         # Unchanged

composition/
  Controller  # Wires FileMonitorEnvironmentRepository → GnomeShellMonitorProvider
```

### Dependency Flow

```
Controller (composition)
    │
    ├── creates FileMonitorEnvironmentRepository (infra/file)
    │
    └── injects into GnomeShellMonitorProvider (infra/monitor)
            │
            └── uses MonitorEnvironmentRepository interface (usecase)
```

## Related

- Plan 18: Layer Architecture Refactoring
