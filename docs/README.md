# PierceDesk Documentation

Welcome to the PierceDesk documentation hub. This directory contains all project documentation organized into two main areas:

## 📁 Documentation Structure

### [/system/](./system/) - Internal System Documentation

Internal documentation for development team, architects, and AI agents. Includes design documents, execution logs, test results, and system architecture.

**When to use:** Planning features, tracking implementation, documenting architecture, recording test results.

👉 [Browse System Documentation](./system/)

### [/user-docs/](./user-docs/) - User-Facing Documentation

End-user documentation including feature guides, how-to tutorials, and API reference for PierceDesk users.

**When to use:** Creating user guides, documenting features for end users, writing help content.

👉 [Browse User Documentation](./user-docs/)

---

## Quick Navigation

### For Developers & Architects

| Document Type | Location | Purpose |
|--------------|----------|---------|
| **Design Docs** | [system/design/](./system/design/) | Pre-implementation architecture and decisions |
| **Execution Logs** | [system/execution/](./system/execution/) | Implementation progress, test results, verification |
| **As-Built Docs** | [system/as-builts/](./system/as-builts/) | Current deployed state documentation |
| **Implementation Plans** | [system/plans/](./system/plans/) | Detailed phase implementation plans |
| **Product Vision** | [system/vision/](./system/vision/) | Product vision and goals |
| **Roadmap** | [system/roadmap/](./system/roadmap/) | Strategic planning documents |

### For End Users & Documentation Writers

| Document Type | Location | Purpose |
|--------------|----------|---------|
| **Feature Guides** | [user-docs/features/](./user-docs/features/) | What PierceDesk can do |
| **How-To Guides** | [user-docs/guides/](./user-docs/guides/) | Step-by-step task instructions |
| **API Docs** | [user-docs/api/](./user-docs/api/) | Integration and API reference |

---

## Naming Conventions

### System Documentation (`/system/`)

Format: `{type}-{feature|phase}-{topic}.md`

**Examples:**
- `design-phase1.1-crm-schema.md`
- `execution-phase1.2-auth-integration.md`
- `as-built-crm-desk-mvp.md`
- `INDEX-crm-desk-mvp.md`

**Prefixes:** `design-`, `execution-`, `as-built-`, `plan-`, `INDEX-`, `debug-`, `realign-`

📘 [Full System Naming Rules](./system/AGENT.md#naming-conventions)

### User Documentation (`/user-docs/`)

Format: `{topic}-{subtopic}.md` or `{feature-name}.md`

**Examples:**
- `getting-started.md`
- `managing-contacts.md`
- `creating-opportunities.md`

**Rules:** User-friendly, task-oriented, no technical prefixes

📘 [Full User Docs Naming Rules](./user-docs/AGENT.md#naming-conventions)

---

## Governance

Each documentation area has its own AGENT.md file with detailed governance rules:

- **[system/AGENT.md](./system/AGENT.md)** - System documentation governance
  - Naming conventions
  - Required frontmatter
  - Folder organization
  - Quality standards
  - Document lifecycle

- **[user-docs/AGENT.md](./user-docs/AGENT.md)** - User documentation governance
  - Writing style guidelines
  - Screenshot standards
  - Content structure
  - Audience considerations

---

## Getting Started

### I want to...

**Document a new feature (internal)**
1. Create INDEX file: `cp .claude/templates/INDEX-template.md docs/system/INDEX-{feature}.md`
2. Create design doc: Use `design-` prefix in `docs/system/design/`
3. Create execution doc: Use `execution-` prefix in `docs/system/execution/`
4. Follow [Documentation Guide](./system/execution/guides/DOCUMENTATION-GUIDE.md)

**Write a user guide**
1. Choose folder: `features/` or `guides/`
2. Follow [User Docs Template](./user-docs/AGENT.md#document-structure)
3. Include screenshots and step-by-step instructions
4. Review [Writing Examples](./user-docs/AGENT.md#writing-examples)

**Document architecture**
1. Create design doc: `docs/system/design/design-{feature}-{topic}.md`
2. Include diagrams, decisions, trade-offs
3. Link to INDEX if part of feature work
4. Use [Design Template](./.claude/templates/phase-design-template.md)

**Record test results**
1. Add to execution doc: `docs/system/execution/execution-{phase}-{topic}.md`
2. Include command output and screenshots
3. Link test results to verification section
4. Follow [Execution Template](./.claude/templates/phase-execution-template.md)

---

## Templates

Available in `.claude/templates/`:

| Template | Purpose | Location |
|----------|---------|----------|
| **INDEX Template** | Master feature tracking | `INDEX-template.md` |
| **Phase Design** | Pre-implementation design | `phase-design-template.md` |
| **Phase Execution** | Implementation log | `phase-execution-template.md` |
| **As-Built** | Current state documentation | `as-built-template.md` |
| **Debug** | Bug investigation | `debug-template.md` |
| **Realignment** | Plan changes | `realignment-template.md` |

---

## Key Principles

### System Documentation
- **Evidence-based:** Always include verification command output
- **Cross-referenced:** Link to INDEX, design, execution docs
- **Version-controlled:** Use YAML frontmatter with status tracking
- **File:line references:** Always include code locations

### User Documentation
- **User-focused:** Written for non-technical end users
- **Task-oriented:** Focus on "how to" accomplish goals
- **Visual:** Include screenshots and examples
- **Clear:** Simple language, no jargon

### Separation of Concerns
- ✅ System docs: Internal architecture, testing, execution
- ✅ User docs: Feature guides, how-tos, user workflows
- ❌ Never mix internal technical details in user docs
- ❌ Never put user guides in system docs

---

## Documentation Workflow

### Standard Feature Development

```
1. Create INDEX → docs/system/INDEX-{feature}.md
2. Create Design Doc → docs/system/design/design-{phase}-{topic}.md
3. Create Implementation Plan → docs/system/plans/plan-YYYY-MM-DD-{topic}.md
4. Create Execution Doc → docs/system/execution/execution-{phase}-{topic}.md
5. Update As-Built → docs/system/as-builts/as-built-{feature}.md
6. Create User Guide → docs/user-docs/guides/{feature-name}.md
7. Create Feature Overview → docs/user-docs/features/{feature-name}.md
```

### Quick Reference

| Phase | System Docs | User Docs |
|-------|------------|-----------|
| **Planning** | INDEX, design docs | - |
| **Implementation** | Execution logs, plans | - |
| **Testing** | Test results in execution/ | - |
| **Deployment** | As-built docs | - |
| **User Release** | - | Feature guides, how-tos |

---

## Quality Gates

Before merging ANY feature:

- [ ] INDEX file complete and current
- [ ] Design docs have status and verification
- [ ] Execution docs include test evidence
- [ ] As-built reflects deployed state
- [ ] Code references include file:line numbers
- [ ] All YAML frontmatter valid
- [ ] Cross-references verified
- [ ] User-facing docs created (if applicable)

---

## Maintenance

### Monthly
- Update as-built docs with current state
- Verify all links work
- Check screenshot currency (user docs)
- Review naming convention compliance

### Quarterly
- Documentation health audit
- Consolidate duplicate content
- Archive completed/locked docs
- Update roadmap documents

---

## External Resources

- **Aurora UI Template**: https://aurora.themewagon.com/documentation/introduction
- **Material-UI Documentation**: https://mui.com/material-ui/getting-started/
- **Supabase Documentation**: https://supabase.com/docs
- **Next.js Documentation**: https://nextjs.org/docs

---

## Support

**Questions about:**
- **System documentation:** See [system/AGENT.md](./system/AGENT.md)
- **User documentation:** See [user-docs/AGENT.md](./user-docs/AGENT.md)
- **Templates:** Browse `.claude/templates/`
- **Workflow:** Read [DOCUMENTATION-GUIDE.md](./system/execution/guides/DOCUMENTATION-GUIDE.md)

---

**Last Updated:** 2026-01-30
**Structure Version:** 2.0
**Migration Date:** 2026-01-30
