# Future Features

This directory contains code for features that are planned but not yet integrated into the main application.

## Slash Commands

**Status**: Not yet implemented  
**Files**:
- `CommandsList.tsx` - UI component for displaying slash command suggestions
- `SlashCommand.ts` - TipTap extension for slash command functionality
- `suggestion.ts` - Suggestion logic for slash commands

**Description**:
Slash commands would allow users to quickly insert or format content by typing `/` followed by a command (e.g., `/heading`, `/list`, `/code`).

**To implement**:
1. Import `SlashCommand` extension in `RichEditor.tsx`
2. Add to TipTap editor extensions array
3. Style the `CommandsList` component to match app theme
4. Define available commands and their actions

**Dependencies**:
- `@tiptap/suggestion` (already installed)
- React components for command UI

---

## Adding New Future Features

When adding code for future features:
1. Place files in this directory
2. Update this README with feature description
3. Document dependencies and implementation steps
4. Keep code up-to-date with main codebase patterns
