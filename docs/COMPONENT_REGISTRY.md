# Component Registry - HomeHarbor React Frontend

## Overview
This document serves as the authoritative source for all React components, hooks, and patterns in the HomeHarbor frontend application. It ensures perfect continuity across iterations by providing complete specifications for all UI elements.

## Architecture Overview

### State Management
- **Context Providers**: PropertyProvider, AIProvider for global state
- **Custom Hooks**: Business logic separated from UI components
- **Local State**: useState for component-specific state
- **Server State**: React Query/SWR planned for future API integration

### Component Patterns
- **Functional Components**: All components use modern React patterns
- **Custom Hooks**: Business logic extracted to reusable hooks
- **Compound Components**: Related components grouped logically
- **Render Props**: For flexible component composition

---

## Component Inventory

### Core Components

#### App.jsx
**Purpose**: Root application component with provider setup
**Props**: None
**State**: None (managed by providers)
**Children**: Header, SearchSection, ResultsSection, AIChatSection, HelpModal
**Hooks Used**: None
**Testing**: Mount test, provider composition test

#### Header.jsx
**Purpose**: Application header with branding and help access
**Props**: None
**State**: None
**Events**: `openHelp` custom event dispatch
**Accessibility**: ARIA label on help button
**Testing**: Content rendering, event dispatching, accessibility

#### SearchSection.jsx
**Purpose**: Property search form with filters and validation
**Props**: None (uses PropertyProvider)
**State**: Local form state via PropertyProvider
**Features**:
- City autocomplete with dropdown
- Price range inputs
- Property type/bedroom/bathroom filters
- Form submission handling
**Hooks Used**: usePropertySearch
**Testing**: Form interactions, validation, API calls

#### ResultsSection.jsx (Placeholder)
**Purpose**: Display search results with pagination
**Props**: None (uses PropertyProvider)
**State**: Results data, pagination state
**Features**: Property cards, pagination controls, loading states
**Hooks Used**: usePropertySearch
**Testing**: Result rendering, pagination, loading states

#### AIChatSection.jsx (Placeholder)
**Purpose**: AI assistant chat interface
**Props**: None (uses AIProvider)
**State**: Chat messages, loading state
**Features**: Message input, response display, analysis triggers
**Hooks Used**: useAIChat
**Testing**: Message sending, response display, error handling

#### HelpModal.jsx
**Purpose**: Contextual help and documentation modal
**Props**: None
**State**: Modal open/closed, active tab
**Events**: Listens for `openHelp` custom events
**Features**: Tabbed interface (User Guide, Developer Info)
**Testing**: Modal open/close, tab switching, content display

---

## Custom Hooks

### usePropertySearch.js
**Purpose**: Property search state and API integration
**State Structure**:
```javascript
{
  loading: boolean,
  results: Array,
  error: string|null,
  filters: {
    city: string,
    minPrice: string,
    maxPrice: string,
    bedrooms: string,
    bathrooms: string,
    propertyType: string
  },
  pagination: {
    page: number,
    pageSize: number,
    total: number,
    totalPages: number
  }
}
```
**Actions**:
- `searchProperties(filters, page)`: Execute search API call
- `setFilters(filters)`: Update search filters
- `setPage(page)`: Change current page
- `clearResults()`: Reset search state
**Error Handling**: Network errors, API failures
**Testing**: State updates, API integration, error scenarios

### useAIChat.js
**Purpose**: AI chat functionality and state management
**State Structure**:
```javascript
{
  loading: boolean,
  response: string,
  error: string|null,
  aiReady: boolean
}
```
**Actions**:
- `sendMessage(message, propertyId?)`: Send chat message
- `analyzeProperty(propertyId)`: Request property analysis
- `clearChat()`: Reset chat state
- `setAiReady(ready)`: Update AI availability status
**Error Handling**: API failures, rate limiting
**Testing**: Message flows, error states, property analysis

---

## Context Providers

### PropertyProvider
**Context Value**: `{ ...state, searchProperties, setFilters, setPage, clearResults }`
**Consumer Hook**: `usePropertySearch()`
**Error Boundary**: Recommended for API failures
**Testing**: Provider setup, hook integration

### AIProvider
**Context Value**: `{ ...state, sendMessage, analyzeProperty, clearChat, setAiReady }`
**Consumer Hook**: `useAIChat()`
**Error Boundary**: Recommended for API failures
**Testing**: Provider setup, hook integration

---

## Component Composition Patterns

### Provider Wrapping
```jsx
<PropertyProvider>
  <AIProvider>
    <App />
  </AIProvider>
</PropertyProvider>
```

### Hook Usage in Components
```jsx
function SearchSection() {
  const { filters, setFilters, searchProperties, loading } = usePropertySearch();
  // Component logic
}
```

### Error Handling Pattern
```jsx
function SearchSection() {
  const { error } = usePropertySearch();

  if (error) {
    return <ErrorMessage message={error} onRetry={handleRetry} />;
  }
  // Normal component render
}
```

---

## Testing Patterns

### Component Testing
- **Rendering**: Content, structure, accessibility attributes
- **Interactions**: Click handlers, form submissions, keyboard navigation
- **State Changes**: Loading states, error states, data updates
- **Accessibility**: ARIA labels, focus management, screen reader support

### Hook Testing
- **State Management**: Initial state, state transitions
- **API Integration**: Mock API calls, error handling
- **Side Effects**: Async operations, cleanup functions

### Integration Testing
- **Provider Composition**: Context value propagation
- **Component Communication**: Event dispatching, prop drilling
- **API Workflows**: Complete user journeys

---

## Future Component Plans

### PropertyCard Component
- Display individual property information
- Image gallery integration
- AI analysis trigger buttons
- Favorite/save functionality (future)

### Pagination Component
- Page navigation controls
- Results count display
- Page size selection
- Accessibility-compliant navigation

### LoadingSpinner Component
- Consistent loading states
- Size variants (small, medium, large)
- Accessibility announcements

### ErrorBoundary Component
- Catch JavaScript errors
- Fallback UI display
- Error reporting integration
- Recovery mechanisms

---

## Accessibility Standards

### ARIA Implementation
- **Labels**: All interactive elements have accessible names
- **Live Regions**: Dynamic content announced to screen readers
- **Focus Management**: Logical tab order, visible focus indicators
- **Semantic HTML**: Proper heading hierarchy, landmark roles

### Keyboard Navigation
- **Tab Order**: Logical navigation through interactive elements
- **Enter/Space**: Activate buttons and links
- **Escape**: Close modals and dropdowns
- **Arrow Keys**: Navigate dropdowns and pagination

### Screen Reader Support
- **Announcements**: Status changes, errors, loading states
- **Context**: Sufficient context for screen reader users
- **Alternative Text**: Meaningful descriptions for images
- **Form Labels**: Associated labels for all form inputs

---

## Performance Considerations

### Code Splitting
- **Route-based**: Future routing implementation
- **Component-based**: Lazy loading for heavy components
- **Vendor chunks**: Separate third-party libraries

### Memoization
- **React.memo**: Prevent unnecessary re-renders
- **useMemo**: Expensive calculations
- **useCallback**: Stable function references

### Bundle Optimization
- **Tree shaking**: Remove unused code
- **Minification**: Reduce bundle size
- **Compression**: Gzip/Brotli compression
- **Caching**: Long-term caching strategies

---

## Version History

- **v1.0** (February 3, 2026): Initial React foundation with core components and hooks
- **Future**: Property cards, pagination, error boundaries, advanced AI features