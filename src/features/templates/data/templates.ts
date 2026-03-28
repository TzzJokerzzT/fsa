import type {
  ArchitectureEdge,
  ArchitectureNode,
  ArchitectureType,
} from '@/shared/types';

/**
 * Architecture Template
 * Pre-built patterns for common frontend architectures
 */
export interface ArchitectureTemplate {
  id: string;
  name: string;
  type: ArchitectureType;
  description: string;
  complexity: 'simple' | 'medium' | 'complex';
  nodes: Omit<ArchitectureNode, 'id'>[];
  edges: Omit<ArchitectureEdge, 'id'>[];
}

/**
 * Template edge reference - uses node indices instead of IDs
 * since IDs are generated at runtime
 */
interface TemplateEdgeRef {
  sourceIndex: number;
  targetIndex: number;
  data: ArchitectureEdge['data'];
}

// Helper to create template with proper edge references
function createTemplate(
  template: Omit<ArchitectureTemplate, 'edges'> & {
    edgeRefs: TemplateEdgeRef[];
  },
): ArchitectureTemplate {
  const { edgeRefs, ...rest } = template;
  return {
    ...rest,
    edges: edgeRefs.map((ref) => ({
      source: `node-${ref.sourceIndex}`,
      target: `node-${ref.targetIndex}`,
      data: ref.data,
    })),
    nodes: rest.nodes.map((node, index) => ({
      ...node,
      id: `node-${index}`,
    })) as Omit<ArchitectureNode, 'id'>[],
  };
}

// ==================== Templates ====================

export const fluxTemplate = createTemplate({
  id: 'flux',
  name: 'Flux Pattern',
  type: 'modular',
  description:
    'Unidirectional data flow pattern: Actions -> Dispatcher -> Store -> View',
  complexity: 'medium',
  nodes: [
    {
      type: 'component',
      position: { x: 400, y: 27 },
      data: {
        label: 'View (React)',
        type: 'component',
        description: 'React components that render UI based on store state',
      },
    },
    {
      type: 'util',
      position: { x: 66, y: 208 },
      data: {
        label: 'Action Creators',
        type: 'util',
        description: 'Functions that create action objects',
      },
    },
    {
      type: 'module',
      position: { x: 400, y: 200 },
      data: {
        label: 'Dispatcher',
        type: 'module',
        description: 'Central hub that broadcasts actions to all stores',
      },
    },
    {
      type: 'state',
      position: { x: 400, y: 421 },
      data: {
        label: 'Store',
        type: 'state',
        description: 'Holds application state and business logic',
      },
    },
  ],
  edgeRefs: [
    {
      sourceIndex: 0,
      targetIndex: 1,
      data: { type: 'event', label: 'User Action' },
    },
    {
      sourceIndex: 1,
      targetIndex: 2,
      data: { type: 'event', label: 'Dispatch' },
    },
    {
      sourceIndex: 2,
      targetIndex: 3,
      data: { type: 'state', label: 'Update' },
    },
    { sourceIndex: 3, targetIndex: 0, data: { type: 'props', label: 'State' } },
  ],
});

export const reduxTemplate = createTemplate({
  id: 'redux',
  name: 'Redux Pattern',
  type: 'modular',
  description:
    'Predictable state container with reducers, actions, and middleware',
  complexity: 'medium',
  nodes: [
    {
      type: 'component',
      position: { x: 389, y: 15 },
      data: {
        label: 'Connected Component',
        type: 'component',
        description: 'React component connected to Redux store via hooks',
      },
    },
    {
      type: 'util',
      position: { x: 48, y: 145 },
      data: {
        label: 'Action Creators',
        type: 'util',
        description: 'Functions that return action objects or thunks',
      },
    },
    {
      type: 'effect',
      position: { x: 51, y: 359 },
      data: {
        label: 'Middleware',
        type: 'effect',
        description: 'Redux middleware (thunk, saga, etc.)',
      },
    },
    {
      type: 'module',
      position: { x: 400, y: 351 },
      data: {
        label: 'Reducers',
        type: 'module',
        description: 'Pure functions that update state based on actions',
      },
    },
    {
      type: 'state',
      position: { x: 412, y: 561 },
      data: {
        label: 'Store',
        type: 'state',
        description: 'Single source of truth for app state',
      },
    },
    {
      type: 'hook',
      position: { x: 650, y: 150 },
      data: {
        label: 'useSelector',
        type: 'hook',
        description: 'Hook to read state from store',
      },
    },
  ],
  edgeRefs: [
    {
      sourceIndex: 0,
      targetIndex: 1,
      data: { type: 'event', label: 'dispatch()' },
    },
    {
      sourceIndex: 1,
      targetIndex: 2,
      data: { type: 'event', label: 'Action' },
    },
    {
      sourceIndex: 2,
      targetIndex: 3,
      data: { type: 'event', label: 'Action' },
    },
    {
      sourceIndex: 3,
      targetIndex: 4,
      data: { type: 'state', label: 'New State' },
    },
    {
      sourceIndex: 4,
      targetIndex: 5,
      data: { type: 'state', label: 'State Slice' },
    },
    {
      sourceIndex: 5,
      targetIndex: 0,
      data: { type: 'props', label: 'Selected Data' },
    },
  ],
});

export const mvcTemplate = createTemplate({
  id: 'mvc',
  name: 'MVC Pattern',
  type: 'modular',
  description: 'Model-View-Controller pattern adapted for frontend',
  complexity: 'simple',
  nodes: [
    {
      type: 'component',
      position: { x: 400, y: 50 },
      data: {
        label: 'View',
        type: 'component',
        description: 'UI components that display data to users',
      },
    },
    {
      type: 'module',
      position: { x: 67, y: 187 },
      data: {
        label: 'Controller',
        type: 'module',
        description: 'Handles user input and updates model',
      },
    },
    {
      type: 'state',
      position: { x: 400, y: 350 },
      data: {
        label: 'Model',
        type: 'state',
        description: 'Data and business logic layer',
      },
    },
  ],
  edgeRefs: [
    {
      sourceIndex: 0,
      targetIndex: 1,
      data: { type: 'event', label: 'User Input' },
    },
    {
      sourceIndex: 1,
      targetIndex: 2,
      data: { type: 'state', label: 'Update' },
    },
    { sourceIndex: 2, targetIndex: 0, data: { type: 'props', label: 'Data' } },
  ],
});

export const mvvmTemplate = createTemplate({
  id: 'mvvm',
  name: 'MVVM Pattern',
  type: 'modular',
  description: 'Model-View-ViewModel with two-way data binding',
  complexity: 'medium',
  nodes: [
    {
      type: 'component',
      position: { x: 400, y: 50 },
      data: {
        label: 'View',
        type: 'component',
        description: 'React components with declarative UI',
      },
    },
    {
      type: 'hook',
      position: { x: 401, y: 260 },
      data: {
        label: 'ViewModel (Hook)',
        type: 'hook',
        description: 'Custom hook managing view state and logic',
      },
    },
    {
      type: 'state',
      position: { x: 96, y: 347 },
      data: {
        label: 'Model',
        type: 'state',
        description: 'Domain data and business rules',
      },
    },
    {
      type: 'api',
      position: { x: 436, y: 489 },
      data: {
        label: 'Data Service',
        type: 'api',
        description: 'API communication layer',
      },
    },
  ],
  edgeRefs: [
    {
      sourceIndex: 0,
      targetIndex: 1,
      data: { type: 'event', label: 'User Events' },
    },
    {
      sourceIndex: 1,
      targetIndex: 0,
      data: { type: 'props', label: 'View State' },
    },
    {
      sourceIndex: 1,
      targetIndex: 2,
      data: { type: 'state', label: 'Read/Write' },
    },
    {
      sourceIndex: 1,
      targetIndex: 3,
      data: { type: 'event', label: 'API Calls' },
    },
    { sourceIndex: 3, targetIndex: 2, data: { type: 'state', label: 'Data' } },
  ],
});

export const cleanArchitectureTemplate = createTemplate({
  id: 'clean-architecture',
  name: 'Clean Architecture',
  type: 'clean-architecture',
  description: 'Layered architecture with domain at center, framework at edges',
  complexity: 'complex',
  nodes: [
    // Presentation Layer
    {
      type: 'component',
      position: { x: 501, y: 6 },
      data: {
        label: 'UI Components',
        type: 'component',
        description: 'React components (Presentation Layer)',
      },
    },
    {
      type: 'hook',
      position: { x: 63, y: 55 },
      data: {
        label: 'Presenters/ViewModels',
        type: 'hook',
        description: 'Hooks that prepare data for views',
      },
    },
    // Application Layer
    {
      type: 'module',
      position: { x: 400, y: 200 },
      data: {
        label: 'Use Cases',
        type: 'module',
        description: 'Application-specific business rules',
      },
    },
    // Domain Layer
    {
      type: 'state',
      position: { x: 390, y: 385 },
      data: {
        label: 'Entities',
        type: 'state',
        description: 'Enterprise business rules and domain models',
      },
    },
    {
      type: 'util',
      position: { x: 726, y: 194 },
      data: {
        label: 'Domain Services',
        type: 'util',
        description: 'Business logic that spans multiple entities',
      },
    },
    // Infrastructure Layer
    {
      type: 'api',
      position: { x: 105, y: 189 },
      data: {
        label: 'Repository',
        type: 'api',
        description: 'Data access abstraction',
      },
    },
    {
      type: 'api',
      position: { x: 92, y: 391 },
      data: {
        label: 'API Gateway',
        type: 'api',
        description: 'External API communication',
      },
    },
  ],
  edgeRefs: [
    {
      sourceIndex: 0,
      targetIndex: 1,
      data: { type: 'event', label: 'Events' },
    },
    {
      sourceIndex: 1,
      targetIndex: 0,
      data: { type: 'props', label: 'View Data' },
    },
    {
      sourceIndex: 1,
      targetIndex: 2,
      data: { type: 'import', label: 'Execute' },
    },
    { sourceIndex: 2, targetIndex: 3, data: { type: 'import', label: 'Uses' } },
    { sourceIndex: 2, targetIndex: 4, data: { type: 'import', label: 'Uses' } },
    {
      sourceIndex: 2,
      targetIndex: 5,
      data: { type: 'import', label: 'Depends On' },
    },
    {
      sourceIndex: 5,
      targetIndex: 6,
      data: { type: 'import', label: 'Implements' },
    },
    {
      sourceIndex: 6,
      targetIndex: 3,
      data: { type: 'state', label: 'Hydrates' },
    },
  ],
});

export const atomicDesignTemplate = createTemplate({
  id: 'atomic-design',
  name: 'Atomic Design',
  type: 'atomic-design',
  description:
    'Component hierarchy: Atoms -> Molecules -> Organisms -> Templates -> Pages',
  complexity: 'medium',
  nodes: [
    // Pages
    {
      type: 'component',
      position: { x: 384, y: 0 },
      data: {
        label: 'Page',
        type: 'component',
        description: 'Specific instances of templates with real content',
      },
    },
    // Templates
    {
      type: 'component',
      position: { x: 400, y: 200 },
      data: {
        label: 'Template',
        type: 'component',
        description: 'Page-level layouts with placeholder content',
      },
    },
    // Organisms
    {
      type: 'component',
      position: { x: 104, y: 211 },
      data: {
        label: 'Header',
        type: 'component',
        description: 'Organism: Complex UI section',
      },
    },
    {
      type: 'component',
      position: { x: 573, y: 390 },
      data: {
        label: 'ProductCard',
        type: 'component',
        description: 'Organism: Complex UI section',
      },
    },
    {
      type: 'component',
      position: { x: 797, y: 201 },
      data: {
        label: 'Footer',
        type: 'component',
        description: 'Organism: Complex UI section',
      },
    },
    // Molecules
    {
      type: 'component',
      position: { x: -48, y: 489 },
      data: {
        label: 'SearchBar',
        type: 'component',
        description: 'Molecule: Group of atoms functioning together',
      },
    },
    {
      type: 'component',
      position: { x: 281, y: 489 },
      data: {
        label: 'NavMenu',
        type: 'component',
        description: 'Molecule: Group of atoms functioning together',
      },
    },
    // Atoms
    {
      type: 'component',
      position: { x: -19, y: 701 },
      data: {
        label: 'Button',
        type: 'component',
        description: 'Atom: Basic building block',
      },
    },
    {
      type: 'component',
      position: { x: 233, y: 707 },
      data: {
        label: 'Input',
        type: 'component',
        description: 'Atom: Basic building block',
      },
    },
    {
      type: 'component',
      position: { x: 474, y: 705 },
      data: {
        label: 'Icon',
        type: 'component',
        description: 'Atom: Basic building block',
      },
    },
    {
      type: 'component',
      position: { x: 665, y: 575 },
      data: {
        label: 'Label',
        type: 'component',
        description: 'Atom: Basic building block',
      },
    },
  ],
  edgeRefs: [
    { sourceIndex: 0, targetIndex: 1, data: { type: 'import', label: 'uses' } },
    {
      sourceIndex: 1,
      targetIndex: 2,
      data: { type: 'import', label: 'contains' },
    },
    {
      sourceIndex: 1,
      targetIndex: 3,
      data: { type: 'import', label: 'contains' },
    },
    {
      sourceIndex: 1,
      targetIndex: 4,
      data: { type: 'import', label: 'contains' },
    },
    { sourceIndex: 2, targetIndex: 5, data: { type: 'import', label: 'uses' } },
    { sourceIndex: 2, targetIndex: 6, data: { type: 'import', label: 'uses' } },
    { sourceIndex: 5, targetIndex: 7, data: { type: 'import', label: 'uses' } },
    { sourceIndex: 5, targetIndex: 8, data: { type: 'import', label: 'uses' } },
    { sourceIndex: 6, targetIndex: 9, data: { type: 'import', label: 'uses' } },
    {
      sourceIndex: 6,
      targetIndex: 10,
      data: { type: 'import', label: 'uses' },
    },
  ],
});

export const reactQueryTemplate = createTemplate({
  id: 'react-query',
  name: 'React Query + Zustand',
  type: 'feature-based',
  description:
    'Modern React stack with server state (React Query) and client state (Zustand)',
  complexity: 'medium',
  nodes: [
    {
      type: 'component',
      position: { x: 296, y: -16 },
      data: {
        label: 'Page Component',
        type: 'component',
        description: 'Top-level page component',
      },
    },
    {
      type: 'hook',
      position: { x: 59, y: 254 },
      data: {
        label: 'useQuery',
        type: 'hook',
        description: 'React Query hook for fetching data',
      },
    },
    {
      type: 'hook',
      position: { x: 506, y: 266 },
      data: {
        label: 'useMutation',
        type: 'hook',
        description: 'React Query hook for mutations',
      },
    },
    {
      type: 'state',
      position: { x: 583, y: -25 },
      data: {
        label: 'Zustand Store',
        type: 'state',
        description: 'Client-side UI state (modals, filters, etc.)',
      },
    },
    {
      type: 'module',
      position: { x: 338, y: 401 },
      data: {
        label: 'Query Client',
        type: 'module',
        description: 'Caches and manages server state',
      },
    },
    {
      type: 'api',
      position: { x: 356, y: 627 },
      data: {
        label: 'API Layer',
        type: 'api',
        description: 'Fetch functions for API calls',
      },
    },
  ],
  edgeRefs: [
    { sourceIndex: 0, targetIndex: 1, data: { type: 'import', label: 'uses' } },
    { sourceIndex: 0, targetIndex: 2, data: { type: 'import', label: 'uses' } },
    { sourceIndex: 0, targetIndex: 3, data: { type: 'import', label: 'uses' } },
    {
      sourceIndex: 1,
      targetIndex: 4,
      data: { type: 'state', label: 'reads cache' },
    },
    {
      sourceIndex: 2,
      targetIndex: 4,
      data: { type: 'state', label: 'invalidates' },
    },
    {
      sourceIndex: 4,
      targetIndex: 5,
      data: { type: 'event', label: 'fetches' },
    },
  ],
});

export const microfrontendsTemplate = createTemplate({
  id: 'microfrontends',
  name: 'Microfrontends',
  type: 'microfrontends',
  description: 'Multiple independent apps composed in a shell application',
  complexity: 'complex',
  nodes: [
    {
      type: 'component',
      position: { x: 212, y: -93 },
      data: {
        label: 'Shell App',
        type: 'component',
        description: 'Container that orchestrates microfrontends',
      },
    },
    {
      type: 'module',
      position: { x: 675, y: -81 },
      data: {
        label: 'Module Federation',
        type: 'module',
        description: 'Webpack/Rspack module sharing',
      },
    },
    {
      type: 'component',
      position: { x: 16, y: 202 },
      data: {
        label: 'MFE: Dashboard',
        type: 'component',
        description: 'Independent dashboard microfrontend',
      },
    },
    {
      type: 'component',
      position: { x: 400, y: 200 },
      data: {
        label: 'MFE: Catalog',
        type: 'component',
        description: 'Independent catalog microfrontend',
      },
    },
    {
      type: 'component',
      position: { x: 650, y: 200 },
      data: {
        label: 'MFE: Checkout',
        type: 'component',
        description: 'Independent checkout microfrontend',
      },
    },
    {
      type: 'context',
      position: { x: 27, y: 469 },
      data: {
        label: 'Shared State',
        type: 'context',
        description: 'Cross-MFE communication (events, shared store)',
      },
    },
    {
      type: 'util',
      position: { x: 501, y: 487 },
      data: {
        label: 'Shared Components',
        type: 'util',
        description: 'Design system shared across MFEs',
      },
    },
  ],
  edgeRefs: [
    {
      sourceIndex: 0,
      targetIndex: 1,
      data: { type: 'import', label: 'loads' },
    },
    {
      sourceIndex: 0,
      targetIndex: 2,
      data: { type: 'import', label: 'mounts' },
    },
    {
      sourceIndex: 0,
      targetIndex: 3,
      data: { type: 'import', label: 'mounts' },
    },
    {
      sourceIndex: 0,
      targetIndex: 4,
      data: { type: 'import', label: 'mounts' },
    },
    {
      sourceIndex: 2,
      targetIndex: 5,
      data: { type: 'context', label: 'publishes' },
    },
    {
      sourceIndex: 3,
      targetIndex: 5,
      data: { type: 'context', label: 'subscribes' },
    },
    {
      sourceIndex: 4,
      targetIndex: 5,
      data: { type: 'context', label: 'subscribes' },
    },
    { sourceIndex: 2, targetIndex: 6, data: { type: 'import', label: 'uses' } },
    { sourceIndex: 3, targetIndex: 6, data: { type: 'import', label: 'uses' } },
    { sourceIndex: 4, targetIndex: 6, data: { type: 'import', label: 'uses' } },
  ],
});

export const featureSlicedTemplate = createTemplate({
  id: 'feature-sliced',
  name: 'Feature-Sliced Design',
  type: 'feature-based',
  description:
    'Architectural methodology with layers: app, pages, widgets, features, entities, shared',
  complexity: 'complex',
  nodes: [
    // App layer
    {
      type: 'module',
      position: { x: 362, y: -89 },
      data: {
        label: 'App (Providers)',
        type: 'module',
        description: 'App initialization, providers, global styles',
      },
    },
    // Pages layer
    {
      type: 'component',
      position: { x: 400, y: 113 },
      data: {
        label: 'Pages',
        type: 'component',
        description: 'Route-level components',
      },
    },
    // Widgets layer
    {
      type: 'component',
      position: { x: 65, y: 146 },
      data: {
        label: 'Widget: Header',
        type: 'component',
        description: 'Complex self-contained UI blocks',
      },
    },
    {
      type: 'component',
      position: { x: 373, y: 313 },
      data: {
        label: 'Widget: Sidebar',
        type: 'component',
        description: 'Complex self-contained UI blocks',
      },
    },
    // Features layer
    {
      type: 'module',
      position: { x: 51, y: 352 },
      data: {
        label: 'Feature: Auth',
        type: 'module',
        description: 'User interactions & business scenarios',
      },
    },
    {
      type: 'module',
      position: { x: 353, y: 508 },
      data: {
        label: 'Feature: Filter',
        type: 'module',
        description: 'User interactions & business scenarios',
      },
    },
    // Entities layer
    {
      type: 'state',
      position: { x: 63, y: 557 },
      data: {
        label: 'Entity: User',
        type: 'state',
        description: 'Business entities with their CRUD',
      },
    },
    {
      type: 'state',
      position: { x: 374, y: 714 },
      data: {
        label: 'Entity: Product',
        type: 'state',
        description: 'Business entities with their CRUD',
      },
    },
    // Shared layer
    {
      type: 'util',
      position: { x: 220, y: 946 },
      data: {
        label: 'Shared (UI, lib, api)',
        type: 'util',
        description: 'Reusable code used across all layers',
      },
    },
  ],
  edgeRefs: [
    {
      sourceIndex: 0,
      targetIndex: 1,
      data: { type: 'import', label: 'routes' },
    },
    { sourceIndex: 1, targetIndex: 2, data: { type: 'import', label: 'uses' } },
    { sourceIndex: 1, targetIndex: 3, data: { type: 'import', label: 'uses' } },
    { sourceIndex: 2, targetIndex: 4, data: { type: 'import', label: 'uses' } },
    { sourceIndex: 3, targetIndex: 5, data: { type: 'import', label: 'uses' } },
    { sourceIndex: 4, targetIndex: 6, data: { type: 'import', label: 'uses' } },
    { sourceIndex: 5, targetIndex: 7, data: { type: 'import', label: 'uses' } },
    { sourceIndex: 6, targetIndex: 8, data: { type: 'import', label: 'uses' } },
    { sourceIndex: 7, targetIndex: 8, data: { type: 'import', label: 'uses' } },
  ],
});

// ==================== Export All Templates ====================

export const hexagonalTemplate = createTemplate({
  id: 'hexagonal',
  name: 'Hexagonal Architecture',
  type: 'hexagonal',
  description:
    'Ports and Adapters pattern: Core domain isolated from external concerns through ports (interfaces) and adapters (implementations)',
  complexity: 'complex',
  nodes: [
    // Core Domain (Center)
    {
      type: 'state',
      position: { x: 400, y: 300 },
      data: {
        label: 'Domain Model',
        type: 'state',
        description: 'Core business entities and value objects',
      },
    },
    {
      type: 'module',
      position: { x: 400, y: 150 },
      data: {
        label: 'Application Services',
        type: 'module',
        description: 'Use cases and application logic orchestration',
      },
    },
    {
      type: 'util',
      position: { x: 250, y: 300 },
      data: {
        label: 'Domain Services',
        type: 'util',
        description: 'Business logic spanning multiple entities',
      },
    },
    // Ports (Interfaces)
    {
      type: 'module',
      position: { x: 150, y: 150 },
      data: {
        label: 'Input Port',
        type: 'module',
        description: 'Interface for driving adapters (UI, API)',
      },
    },
    {
      type: 'module',
      position: { x: 650, y: 150 },
      data: {
        label: 'Output Port',
        type: 'module',
        description: 'Interface for driven adapters (DB, external services)',
      },
    },
    // Primary/Driving Adapters (Left side)
    {
      type: 'component',
      position: { x: 50, y: 0 },
      data: {
        label: 'UI Adapter',
        type: 'component',
        description: 'React components that drive the application',
      },
    },
    {
      type: 'api',
      position: { x: 250, y: 0 },
      data: {
        label: 'REST Controller',
        type: 'api',
        description: 'HTTP endpoints that drive the application',
      },
    },
    // Secondary/Driven Adapters (Right side)
    {
      type: 'api',
      position: { x: 550, y: 0 },
      data: {
        label: 'Repository Adapter',
        type: 'api',
        description: 'Database implementation (IndexedDB, API)',
      },
    },
    {
      type: 'api',
      position: { x: 750, y: 0 },
      data: {
        label: 'External API Adapter',
        type: 'api',
        description: 'Third-party service integration',
      },
    },
    {
      type: 'effect',
      position: { x: 650, y: 300 },
      data: {
        label: 'Event Publisher',
        type: 'effect',
        description: 'Publishes domain events to external systems',
      },
    },
  ],
  edgeRefs: [
    // UI Adapter -> Input Port -> Application Services
    {
      sourceIndex: 5,
      targetIndex: 3,
      data: { type: 'event', label: 'calls' },
    },
    {
      sourceIndex: 6,
      targetIndex: 3,
      data: { type: 'event', label: 'calls' },
    },
    {
      sourceIndex: 3,
      targetIndex: 1,
      data: { type: 'import', label: 'invokes' },
    },
    // Application Services -> Domain
    {
      sourceIndex: 1,
      targetIndex: 0,
      data: { type: 'import', label: 'uses' },
    },
    {
      sourceIndex: 1,
      targetIndex: 2,
      data: { type: 'import', label: 'uses' },
    },
    // Application Services -> Output Port -> Adapters
    {
      sourceIndex: 1,
      targetIndex: 4,
      data: { type: 'import', label: 'depends on' },
    },
    {
      sourceIndex: 4,
      targetIndex: 7,
      data: { type: 'import', label: 'implemented by' },
    },
    {
      sourceIndex: 4,
      targetIndex: 8,
      data: { type: 'import', label: 'implemented by' },
    },
    // Domain -> Event Publisher
    {
      sourceIndex: 0,
      targetIndex: 9,
      data: { type: 'event', label: 'emits events' },
    },
    // Domain Services -> Domain Model
    {
      sourceIndex: 2,
      targetIndex: 0,
      data: { type: 'import', label: 'operates on' },
    },
  ],
});

export const verticalSliceTemplate = createTemplate({
  id: 'vertical-slice',
  name: 'Vertical Slice Architecture',
  type: 'vertical-slice',
  description:
    'Organize code by features/slices instead of technical layers. Each slice contains all layers for a single feature.',
  complexity: 'medium',
  nodes: [
    // Slice 1: User Management
    {
      type: 'component',
      position: { x: 50, y: 0 },
      data: {
        label: 'User List Page',
        type: 'component',
        description: 'UI for user management feature',
      },
    },
    {
      type: 'hook',
      position: { x: 50, y: 150 },
      data: {
        label: 'useUsers',
        type: 'hook',
        description: 'Query hook for user data',
      },
    },
    {
      type: 'module',
      position: { x: 50, y: 300 },
      data: {
        label: 'User Handlers',
        type: 'module',
        description: 'Business logic for user operations',
      },
    },
    {
      type: 'api',
      position: { x: 50, y: 450 },
      data: {
        label: 'User API',
        type: 'api',
        description: 'API calls for user CRUD',
      },
    },
    // Slice 2: Product Catalog
    {
      type: 'component',
      position: { x: 300, y: 0 },
      data: {
        label: 'Product Catalog Page',
        type: 'component',
        description: 'UI for product catalog feature',
      },
    },
    {
      type: 'hook',
      position: { x: 300, y: 150 },
      data: {
        label: 'useProducts',
        type: 'hook',
        description: 'Query hook for product data',
      },
    },
    {
      type: 'module',
      position: { x: 300, y: 300 },
      data: {
        label: 'Product Handlers',
        type: 'module',
        description: 'Business logic for product operations',
      },
    },
    {
      type: 'api',
      position: { x: 300, y: 450 },
      data: {
        label: 'Product API',
        type: 'api',
        description: 'API calls for product CRUD',
      },
    },
    // Slice 3: Shopping Cart
    {
      type: 'component',
      position: { x: 550, y: 0 },
      data: {
        label: 'Cart Page',
        type: 'component',
        description: 'UI for shopping cart feature',
      },
    },
    {
      type: 'hook',
      position: { x: 550, y: 150 },
      data: {
        label: 'useCart',
        type: 'hook',
        description: 'State hook for cart management',
      },
    },
    {
      type: 'module',
      position: { x: 550, y: 300 },
      data: {
        label: 'Cart Handlers',
        type: 'module',
        description: 'Business logic for cart operations',
      },
    },
    {
      type: 'state',
      position: { x: 550, y: 450 },
      data: {
        label: 'Cart Store',
        type: 'state',
        description: 'Local state for cart (Zustand)',
      },
    },
    // Shared Layer (minimal)
    {
      type: 'util',
      position: { x: 300, y: 600 },
      data: {
        label: 'Shared Utilities',
        type: 'util',
        description: 'Common utilities, types, and UI components',
      },
    },
  ],
  edgeRefs: [
    // User Slice vertical flow
    {
      sourceIndex: 0,
      targetIndex: 1,
      data: { type: 'import', label: 'uses' },
    },
    {
      sourceIndex: 1,
      targetIndex: 2,
      data: { type: 'import', label: 'calls' },
    },
    {
      sourceIndex: 2,
      targetIndex: 3,
      data: { type: 'event', label: 'fetches' },
    },
    // Product Slice vertical flow
    {
      sourceIndex: 4,
      targetIndex: 5,
      data: { type: 'import', label: 'uses' },
    },
    {
      sourceIndex: 5,
      targetIndex: 6,
      data: { type: 'import', label: 'calls' },
    },
    {
      sourceIndex: 6,
      targetIndex: 7,
      data: { type: 'event', label: 'fetches' },
    },
    // Cart Slice vertical flow
    {
      sourceIndex: 8,
      targetIndex: 9,
      data: { type: 'import', label: 'uses' },
    },
    {
      sourceIndex: 9,
      targetIndex: 10,
      data: { type: 'import', label: 'calls' },
    },
    {
      sourceIndex: 10,
      targetIndex: 11,
      data: { type: 'state', label: 'updates' },
    },
    // All slices use shared utilities
    {
      sourceIndex: 3,
      targetIndex: 12,
      data: { type: 'import', label: 'uses' },
    },
    {
      sourceIndex: 7,
      targetIndex: 12,
      data: { type: 'import', label: 'uses' },
    },
    {
      sourceIndex: 11,
      targetIndex: 12,
      data: { type: 'import', label: 'uses' },
    },
    // Cross-slice communication (Cart needs Product info)
    {
      sourceIndex: 10,
      targetIndex: 5,
      data: { type: 'import', label: 'reads product' },
    },
  ],
});

export const architectureTemplates: ArchitectureTemplate[] = [
  mvcTemplate,
  mvvmTemplate,
  fluxTemplate,
  reduxTemplate,
  reactQueryTemplate,
  cleanArchitectureTemplate,
  hexagonalTemplate,
  verticalSliceTemplate,
  atomicDesignTemplate,
  featureSlicedTemplate,
  microfrontendsTemplate,
];

// Get template by ID
export function getTemplateById(id: string): ArchitectureTemplate | undefined {
  return architectureTemplates.find((t) => t.id === id);
}

// Get templates by complexity
export function getTemplatesByComplexity(
  complexity: ArchitectureTemplate['complexity'],
): ArchitectureTemplate[] {
  return architectureTemplates.filter((t) => t.complexity === complexity);
}
