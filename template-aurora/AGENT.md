# AGENT.md - Template Folder Usage Instructions

## Critical Rule: READ-ONLY TEMPLATE REPOSITORY

<EXTREMELY_IMPORTANT>
This folder contains TEMPLATE FILES ONLY. These files are the source of truth and must remain pristine and unmodified.

**ALLOWED OPERATIONS:**
- ✅ EXPLORE: Browse and examine files to understand patterns
- ✅ COPY: Duplicate files to your target location
- ✅ DUPLICATE: Copy entire directories to your workspace
- ✅ READ: View file contents for reference

**STRICTLY FORBIDDEN OPERATIONS:**
- ❌ EDIT: Never modify any file in this folder
- ❌ DELETE: Never remove any file or folder
- ❌ ADD: Never create new files in this folder
- ❌ MOVE: Never move files within this folder
- ❌ RENAME: Never rename files or folders
- ❌ UPDATE: Never update dependencies or configurations

</EXTREMELY_IMPORTANT>

## Usage Pattern

### The ONLY Correct Workflow

1. **Find** the component/file you need in this template folder
2. **Copy** the file to your target location (e.g., `src/` in your app)
3. **Edit** the COPIED file in your workspace, NEVER the template

### Example

```bash
# ✅ CORRECT: Copy from template to your workspace
cp template-aurora/src/components/Example.jsx src/components/Example.jsx
# Now edit src/components/Example.jsx

# ❌ WRONG: Editing the template file directly
# vim template-aurora/src/components/Example.jsx  # NEVER DO THIS
```

## Documentation Rules

<EXTREMELY_IMPORTANT>
**This folder MUST NOT be referenced in documentation except for:**
- ✅ AGENT.md (this file)
- ✅ .claude/PLAN.md files
- ✅ .github/copilot-instructions.md

**NEVER:**
- ❌ Document files in this folder in feature docs
- ❌ Reference template paths in as-built documentation
- ❌ Link to template files in user-facing documentation
- ❌ Include template files in architecture diagrams
- ❌ Cite template files as source code references
- ❌ Reference template paths in INDEX or phase documents

</EXTREMELY_IMPORTANT>

### Why This Matters

Template files are **scaffolding**, not **production code**. Your documentation should reflect what you've built, not what templates you started from.

**Example:**

```markdown
# ❌ WRONG - Referencing template in docs
The login component is based on template-aurora/src/sections/auth/LoginForm.jsx

# ✅ CORRECT - Referencing your implementation
The login component is implemented in src/sections/auth/LoginForm.jsx
```

## Purpose of This Folder

This is the **Aurora Next.js template** - a reference implementation of Material-UI components and patterns. Use it to:

1. **Discover** existing component patterns before building custom ones
2. **Copy** proven implementations to accelerate development
3. **Learn** Material-UI v7 and Aurora design patterns
4. **Reference** proper component structure and prop usage

## Integration with Development Workflow

### Aurora-First Development Pattern

Before creating ANY UI component:

1. **Search** this template folder for similar components
2. **Document** your search (even if you find nothing)
3. **Copy** the closest match to your workspace
4. **Customize** the copied file for your needs
5. **Reference** ONLY your final implementation in docs

### When to Copy vs. Build Custom

**Copy from template when:**
- High similarity component exists (>70% match)
- Standard patterns (forms, tables, cards, layouts)
- Material-UI showcase components

**Build custom when:**
- No similar component exists (<30% match)
- Domain-specific business logic required
- Template component would require 80%+ modifications

## Common Violations to Avoid

### 1. Direct Editing

```bash
# ❌ WRONG
vim template-aurora/src/components/Dashboard.jsx
git add template-aurora/

# ✅ CORRECT
cp template-aurora/src/components/Dashboard.jsx src/components/Dashboard.jsx
vim src/components/Dashboard.jsx
git add src/components/Dashboard.jsx
```

### 2. Documentation References

```markdown
# ❌ WRONG - In your INDEX.md or phase docs
Files modified:
- template-aurora/src/components/Button.jsx

# ✅ CORRECT
Files created:
- src/components/Button.jsx (adapted from Aurora template)
```

### 3. Import Paths

```javascript
// ❌ WRONG - Importing from template
import Button from '../../template-aurora/src/components/Button';

// ✅ CORRECT - Importing from your workspace
import Button from '@/components/Button';
```

### 4. Dependency Management

```bash
# ❌ WRONG
cd template-aurora && npm install new-package

# ✅ CORRECT
# Install dependencies in YOUR workspace
npm install new-package --legacy-peer-deps
```

## Enforcement

**All agents and developers must:**
- Treat this folder as **immutable** and **read-only**
- Never commit changes to files in this folder
- Always copy files before modification
- Reference only copied files in documentation
- Exclude template paths from git tracking (if copied from external source)

**If you find yourself editing a file in this folder, STOP immediately and copy it to your workspace first.**

---

## Summary

| Operation | Template Folder | Your Workspace |
|-----------|-----------------|----------------|
| Browse    | ✅ Yes          | ✅ Yes         |
| Copy      | ✅ Yes          | ✅ Yes         |
| Edit      | ❌ Never        | ✅ Yes         |
| Delete    | ❌ Never        | ✅ Yes (your files) |
| Document  | ❌ No (except AGENT.md) | ✅ Yes |
| Reference | ❌ No (in feature docs) | ✅ Yes |
| Commit    | ❌ Never        | ✅ Yes         |

**Remember: This is a template library, not your codebase. Copy first, edit second, always.**
