// UI Layer
// Thin layer that delegates to UseCase layer
// Creates domain objects from user input and handles exceptions

// GObject synchronization pattern for UI components:
// 1. UI components hold mutable GObject properties for GTK bindings
// 2. Domain objects are immutable - create new instances on changes
// 3. UI sync: domainObj -> GObject properties (one-way)
// 4. User input: GObject properties -> create new domain object -> save via UseCase

export * from './components/index.js';
export { MainPanel } from './main-panel/index.js';
