# AGENTS.md - AI Agent Collaboration Guide

## Overview

This document provides guidelines for AI coding assistants (Claude, Gemini, etc.) working on the Vertebra project. It covers project structure, development workflows, testing requirements, and common patterns to help agents contribute effectively.

## Project Summary

**Vertebra** is a distraction-free outline editor for long-form writing, built with Tauri v2 (Rust + React + TypeScript). It uses local Markdown files for storage and provides a fluid outline editing experience.

### Tech Stack
- **Backend**: Tauri v2 (Rust) - File system, native menus, window management
- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Testing**: Vitest (unit/component), Playwright (E2E)
- **Styling**: Modular CSS (`src/styles/` + Component CSS) + Tailwind CSS (via @import)

## Development Workflow

### Branch Strategy
1. **Always start from `main`**: `git checkout main && git pull origin main`
2. **Create feature branch**: `git checkout -b feature/[descriptive-name]`
   - Examples: `feature/export-docx`, `feature/split-view`, `feature/missing-tests`
3. **Never commit directly to `main`**

### Commit Messages
Follow **Conventional Commits** format:
```
<type>(<scope>): <description>

[optional body]
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `test`: Adding or updating tests
- `docs`: Documentation changes
- `refactor`: Code refactoring
- `style`: Code style changes (formatting, etc.)
- `chore`: Maintenance tasks

**Examples**:
```
feat(export): add DOCX export functionality
fix(editor): resolve line number alignment with wrapped text
test: add missing tests for RichEditor component
docs: update AGENTS.md with testing guidelines
```

### Pull Request Process
1. **Commit changes**: Use conventional commit messages
2. **Push branch**: `git push origin feature/[branch-name]`
3. **Create PR**: Use `gh pr create` or GitHub UI
4. **PR Title**: Same as commit message (for single-commit PRs) or descriptive summary
5. **PR Body**: Include:
   - **Overview**: What changed and why
   - **Changes**: Bullet list of modifications
   - **Verification**: How it was tested
   - **Breaking Changes**: If any (use WARNING callouts)

## Code Organization

### Directory Structure
```
vertebra/
├── src/
│   ├── components/        # React components (Domain-driven)
│   │   ├── Editor/        # Editor components
│   │   │   ├── Editor.tsx
│   │   │   ├── RichEditor.tsx
│   │   │   └── Editor.css
│   │   ├── Sidebar/       # Sidebar components
│   │   │   ├── Sidebar.tsx
│   │   │   ├── FileList.tsx
│   │   │   └── Sidebar.css
│   │   ├── Modals/        # Modal dialogs
│   │   │   ├── SettingsModal.tsx
│   │   │   └── SearchModal.tsx
│   │   └── UI/            # Shared UI components
│   │       ├── StatusBar.tsx
│   │       └── SplashScreen.tsx
│   ├── contexts/          # React contexts (Theme, Language)
│   ├── hooks/             # Custom React hooks
│   │   ├── useModals.ts       # Modal state management
│   │   ├── useFontSize.ts
│   │   ├── useSidebarResize.ts
│   │   └── ...
│   ├── styles/            # Shared styles
│   │   ├── variables.css      # CSS variables/Tokens
│   │   ├── layout.css         # App layout
│   │   └── buttons.css        # Button styles
│   ├── lib/               # Utility functions
│   │   ├── outline.ts     # Outline tree operations
│   │   ├── fileSystem.ts  # Tauri file system wrappers
│   │   └── search.ts      # Search utilities
│   ├── locales/           # i18n translation files
│   └── test/              # Test setup files
├── e2e/                   # Playwright E2E tests
├── src-tauri/             # Rust backend code
└── [docs]                 # README.md, SPEC.md, TESTS.md, etc.
```

### File Naming Conventions
- **Components**: PascalCase (e.g., `RichEditor.tsx`, `StatusBar.tsx`)
- **Hooks**: camelCase with `use` prefix (e.g., `useFontSize.ts`)
- **Utils**: camelCase (e.g., `outline.ts`, `fileSystem.ts`)
- **Tests**: Same as source file + `.test.tsx` or `.spec.ts`
  - Unit: `ComponentName.test.tsx`
  - E2E: `feature-name.spec.ts`

## Testing Requirements

### Before Every Commit
1. **Run unit tests**: `npm test`
2. **Verify all tests pass**: 100% pass rate required
3. **Run E2E tests** (for significant changes): `npm run test:e2e`

### Test File Organization
- **Unit tests**: Co-located with source files in `src/`
- **E2E tests**: Separate `e2e/` directory
- **Test setup**: `src/test/setup.ts` and `vitest.setup.ts`

### Common Test Patterns

#### Mocking Browser APIs
Many components use browser APIs that aren't available in test environments:

```typescript
// ResizeObserver (required for RichEditor)
beforeAll(() => {
    (globalThis as any).ResizeObserver = class ResizeObserver {
        observe() {}
        unobserve() {}
        disconnect() {}
    };
});
```

#### Mocking Tauri APIs
```typescript
// OS detection
vi.mock('@tauri-apps/plugin-os', () => ({
    type: vi.fn().mockResolvedValue('macos'),
}));

// File system operations
vi.mock('@tauri-apps/api/core', () => ({
    invoke: vi.fn(),
}));
```

#### Component Testing with Providers
```typescript
const renderWithProviders = (ui: React.ReactElement) => {
    return render(
        <LanguageProvider>
            <ThemeProvider>
                {ui}
            </ThemeProvider>
        </LanguageProvider>
    );
};
```

### Test Coverage Expectations
- **New features**: Must include unit tests
- **Bug fixes**: Add regression tests
- **Refactoring**: Maintain or improve existing coverage
- **Target**: Aim for >80% coverage on critical paths

## Common Patterns

### React Component Structure
```typescript
interface ComponentProps {
    // Props interface
}

function Component({ prop1, prop2 }: ComponentProps) {
    // 1. Hooks (useState, useEffect, custom hooks)
    // 2. Event handlers (useCallback)
    // 3. Derived state (useMemo)
    // 4. Effects (useEffect)
    // 5. Render
}

export default Component;
```

### Custom Hooks Pattern
```typescript
export function useFeature() {
    const [state, setState] = useState(initialValue);
    
    // Load from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem('key');
        if (saved) setState(JSON.parse(saved));
    }, []);
    
    // Persist to localStorage on change
    useEffect(() => {
        localStorage.setItem('key', JSON.stringify(state));
    }, [state]);
    
    return { state, setState };
}
```

### Tauri Command Invocation
```typescript
import { invoke } from '@tauri-apps/api/core';

// Backend command
const result = await invoke<ReturnType>('command_name', {
    arg1: value1,
    arg2: value2,
});
```

## Known Issues & Solutions

### 1. ResizeObserver Not Defined in Tests
**Problem**: `ReferenceError: ResizeObserver is not defined`

**Solution**: Add mock in test file or `test/setup.ts`:
```typescript
(globalThis as any).ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
};
```

### 2. Tauri OS Detection Failing in Tests
**Problem**: `TypeError: Cannot read properties of undefined (reading 'os_type')`

**Solution**: Mock the OS plugin:
```typescript
vi.mock('@tauri-apps/plugin-os', () => ({
    type: vi.fn().mockResolvedValue('macos'),
}));
```

### 3. Font Size and Line Height Calculations
**Problem**: Line numbers misalign with wrapped text

**Key Points**:
- Use `getBoundingClientRect().height` (not `clientHeight`) for sub-pixel precision
- Synchronize `word-break` and `overflow-wrap` between textarea and mirror div
- Default font size is **16px** (not 14px)
- Line height is calculated as `Math.round(fontSize * 1.6)`

### 4. CJK Text Wrapping
**Problem**: Japanese/Chinese text doesn't wrap correctly

**Solution**: Use `word-break: break-all` for aggressive wrapping:
```css
.editor {
    white-space: pre-wrap;
    word-break: break-all;
    overflow-wrap: break-word;
}
```

## Documentation Standards

### When to Update Documentation

#### README.md
- New user-facing features
- Changed installation/setup steps
- Updated tech stack

#### SPEC.md
- Architectural changes
- New data structures
- Feature specifications

#### TESTS.md
- New test files created
- Significant test additions (>3 tests)
- Test count changes

#### AGENTS.md (this file)
- New common patterns discovered
- New known issues and solutions
- Workflow improvements

### Documentation Style
- **Be concise**: Agents need quick reference, not essays
- **Use code examples**: Show, don't just tell
- **Keep it current**: Update docs when code changes
- **Link related docs**: Cross-reference README, SPEC, TESTS

## Quick Reference

### Common Commands
```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run tauri dev        # Run Tauri app in dev mode

# Testing
npm test                 # Run unit tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Generate coverage report
npm run test:e2e         # Run E2E tests
npm run test:e2e:ui      # Run E2E tests with UI

# Code Quality
npm run lint             # Run ESLint
npm run type-check       # Run TypeScript compiler check
```

### Key Files to Review
- `README.md` - User-facing documentation
- `SPEC.md` - Technical specifications
- `TESTS.md` - Test documentation
- `package.json` - Dependencies and scripts
- `src/App.tsx` - Main application component
- `src/lib/outline.ts` - Core outline operations

### Default Values
- **Font Size**: 16px (min: 10px, max: 24px)
- **Line Height**: `Math.round(fontSize * 1.6)`
- **Sidebar Width**: 240px (min: 150px, max: 600px)
- **Undo/Redo History**: 50 entries max
- **Debounce Delay**: 500ms for history push

## Best Practices

### DO
✅ Run tests before committing
✅ Use TypeScript strictly (no `any` without good reason)
✅ Follow existing code patterns
✅ Update documentation when adding features
✅ Write descriptive commit messages
✅ Add tests for new features
✅ Use conventional commit format

### DON'T
❌ Commit directly to `main`
❌ Skip running tests
❌ Leave console.logs in production code
❌ Ignore TypeScript errors
❌ Break existing tests
❌ Add dependencies without justification
❌ Use inline styles (use CSS classes)

## Getting Help

### Documentation Hierarchy
1. **This file (AGENTS.md)** - Quick reference for agents
2. **SPEC.md** - Detailed technical specifications
3. **README.md** - User-facing documentation
4. **TESTS.md** - Test documentation and patterns
5. **Code comments** - Inline explanations

### When Stuck
1. Check existing similar implementations
2. Review test files for usage examples
3. Consult SPEC.md for architectural decisions
4. Ask user for clarification on ambiguous requirements

---

**Last Updated**: 2026-01-19
**Version**: 1.0.0
