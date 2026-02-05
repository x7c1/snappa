# Rename usecase to operations

## Overview

Rename the `usecase` layer to `operations` to better reflect its actual responsibilities.

## Background

The current `usecase` layer contains classes like `LicenseUsecase` that:
- Execute business logic (typical usecase responsibility)
- Provide multiple related operations (activate, validate, clear, etc.)
- Notify state changes via callbacks

In Clean Architecture, "usecase" or "interactor" typically refers to stateless, single-action classes. Our classes provide multiple related operations and manage state change notifications, which doesn't match the standard definition.

Note: The actual domain state (license, trial period) is stored in repositories. The usecase only holds callback subscriptions for notification purposes.

Using non-standard terminology causes confusion. The name `operations` better describes what these classes actually do: provide a set of related operations that may hold state and notify changes.

## Scope

- Rename directory: `src/usecase/` → `src/operations/`
- Rename classes: `*Usecase` → `*Operations`
- Update all import paths
- Update tsconfig references
- Do NOT modify `docs/plans/` (historical records)

## Tasks

- Rename `src/usecase/` directory to `src/operations/`
- Rename class files (`license-usecase.ts` → `license-operations.ts`, etc.)
- Rename class names (`LicenseUsecase` → `LicenseOperations`, etc.)
- Update tsconfig.json files (outDir, references)
- Update all import paths across the codebase
- Run build and tests to verify
