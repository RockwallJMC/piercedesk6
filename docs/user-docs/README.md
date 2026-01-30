# User Documentation

User-facing documentation for PierceDesk application.

**Audience:** End users (sales reps, managers, admins, field technicians)
**Purpose:** Feature guides, how-to instructions, user workflows

---

## 📁 Folder Structure

```
user-docs/
├── AGENT.md              # Governance rules (READ THIS FIRST!)
├── README.md             # This file - navigation guide
│
├── features/             # Feature overviews and capabilities
├── guides/               # How-to guides for specific tasks
└── api/                  # User-facing API documentation
```

---

## 🎯 Quick Start

### New to User Docs?

1. **Read [AGENT.md](./AGENT.md)** - Writing style, standards, templates
2. **Browse [features/](./features/)** - See existing feature overviews
3. **Check [guides/](./guides/)** - See how-to examples
4. **Review examples** - [AGENT.md](./AGENT.md#writing-examples) has templates

### Writing a Feature Guide?

1. **Create feature overview:** `./features/{feature-name}.md`
2. **Focus on benefits:** What users can do, why it matters
3. **Include screenshots:** Show the feature in action
4. **Link to guides:** Reference related how-to guides

### Writing a How-To Guide?

1. **Create guide:** `./guides/{task-name}.md`
2. **Step-by-step instructions:** Clear, numbered steps
3. **Include screenshots:** Annotated with arrows/highlights
4. **Test the steps:** Verify every instruction works
5. **Add troubleshooting:** Common problems and solutions

---

## 📝 Document Types

### Feature Overviews

**Location:** `./features/{feature-name}.md`
**Purpose:** What the feature does, capabilities, benefits
**Audience:** Users learning about the feature

**Examples:**
- `contact-management.md`
- `opportunity-tracking.md`
- `proposal-generation.md`
- `dashboard-analytics.md`

**Structure:**
```markdown
# Feature Name

## Overview
Brief description of what the feature does

## What You Can Do
- Capability 1
- Capability 2
- Capability 3

## Getting Started
Link to relevant how-to guides

## Use Cases
Real-world examples

## Tips & Best Practices
Helpful recommendations
```

### How-To Guides

**Location:** `./guides/{task-name}.md`
**Purpose:** Step-by-step instructions for specific tasks
**Audience:** Users trying to accomplish a goal

**Examples:**
- `creating-contacts.md`
- `managing-opportunities.md`
- `generating-reports.md`
- `exporting-data.md`

**Structure:**
```markdown
# Task Name

## Overview
What you'll accomplish in this guide

## Prerequisites
- Required permissions
- Required setup

## Step-by-Step Instructions

### Step 1: [Action]
1. First specific action
2. Second specific action
3. Expected result

![Screenshot](./screenshots/step1.png)

### Step 2: [Action]
...

## Tips & Best Practices

## Troubleshooting

## Related Topics
```

### API Documentation

**Location:** `./api/{topic}.md`
**Purpose:** User-facing API integration guides
**Audience:** Technical users, integration developers

**Examples:**
- `api-overview.md`
- `authentication.md`
- `webhooks.md`
- `rate-limits.md`

---

## 📐 Naming Conventions

### Standard Format

```
{topic}-{subtopic}.md  OR  {feature-name}.md
```

### Rules

✅ **DO:**
- All lowercase with hyphens (kebab-case)
- User-friendly, task-oriented names
- Present tense, action-oriented
- Descriptive: `managing-contacts`, `creating-opportunities`

❌ **DON'T:**
- Technical prefixes: `design-`, `execution-`
- Version numbers: `guide-v2.md`
- Dates: `contacts-2026-01-30.md`
- Internal terms: `phase1-contacts.md`

**Examples:**

```
✅ CORRECT:
getting-started.md
user-authentication.md
managing-contacts.md
creating-opportunities.md
generating-reports.md
exporting-data.md
dashboard-overview.md

❌ INCORRECT:
design-contacts.md
execution-auth-2026-01-30.md
phase1-getting-started.md
CRM_User_Guide.md
v2-contacts.md
```

📘 **Full Rules:** See [AGENT.md](./AGENT.md#naming-conventions)

---

## 📸 Screenshots & Visuals

### Screenshot Requirements

✅ **DO:**
- Capture relevant UI area (not full screen)
- Highlight important elements (red boxes/arrows)
- Use consistent style
- Save as: `{feature}-{step}-{description}.png`
- Store in `./screenshots/` subdirectory
- Update when UI changes

❌ **DON'T:**
- Include sensitive user data
- Use blurry/low-res images
- Capture outdated UI
- Use generic names: `image1.png`

### Screenshot Example

```markdown
1. Click the **New Contact** button

   ![New Contact button](./screenshots/contacts-new-button.png)

2. Fill in the form

   ![Contact form](./screenshots/contacts-form-fields.png)
```

📘 **Full Guidelines:** See [AGENT.md](./AGENT.md#screenshots--visuals)

---

## ✍️ Writing Style

### Voice & Tone

- **Active voice:** "Click the button" not "The button can be clicked"
- **Second person:** "You can create contacts" not "Users can create contacts"
- **Present tense:** "The dashboard shows" not "The dashboard will show"
- **Conversational:** Friendly but professional

### Clarity

- **Short paragraphs:** 3-4 sentences max
- **Bulleted lists:** For options and features
- **Numbered lists:** For step-by-step instructions
- **Simple language:** Avoid jargon, explain technical terms

### Examples

❌ **Bad (Technical):**
```
The authentication system utilizes Supabase Auth with Row Level
Security policies implemented on the database layer.
```

✅ **Good (User-Friendly):**
```
To log in:
1. Enter your email
2. Enter your password
3. Click **Sign In**
```

📘 **Full Guidelines:** See [AGENT.md](./AGENT.md#writing-style)

---

## 🔍 Finding Documents

### By Feature

```bash
# Find feature overviews
ls ./features/

# Find related guides
grep -r "Related Topics" ./guides/
```

### By Task

```bash
# Find how-to guides
ls ./guides/

# Search by keyword
grep -r "creating" ./guides/
```

### By Topic

```bash
# Find all contact-related docs
find . -name "*contact*.md"

# Find all opportunity-related docs
find . -name "*opportunit*.md"
```

---

## ✅ Quality Checklist

Before publishing user documentation:

- [ ] Content is accurate (tested in current app version)
- [ ] Language is clear and user-friendly (no jargon)
- [ ] All steps are complete and in correct order
- [ ] Screenshots are current and annotated
- [ ] Links work and point to correct locations
- [ ] Formatting is consistent
- [ ] Spelling and grammar correct
- [ ] Follows standard template structure
- [ ] No internal technical details
- [ ] Reviewed by non-technical user (if possible)

📘 **Full Checklist:** See [AGENT.md](./AGENT.md#review-checklist)

---

## 🚫 Prohibited Content

**NEVER include in /docs/user-docs/:**

❌ Internal technical architecture
❌ Database schema details
❌ Development workflows
❌ Testing procedures
❌ Design decisions
❌ Execution logs
❌ Internal file paths
❌ Git commit info
❌ Internal project management

**User docs focus exclusively on helping users accomplish goals.**

---

## 🔄 Maintenance

### Update Triggers

Update documentation when:
- UI changes (buttons, menus, layouts)
- Features added or modified
- User workflows change
- Screenshots become outdated
- Users report confusion
- New use cases discovered

### Monthly Review

- [ ] Verify screenshots are current
- [ ] Test all procedures
- [ ] Check for broken links
- [ ] Review for outdated info
- [ ] Gather user feedback

---

## 🔗 Related Resources

- **[Parent README](../README.md)** - Main documentation hub
- **[AGENT.md](./AGENT.md)** - Complete governance rules
- **[System Docs](../system/)** - Internal documentation
- **[Templates](./AGENT.md#document-structure)** - Document templates

---

## 📦 Available Features (Examples)

Once populated, this section will list all available feature guides:

### CRM Features
- [ ] Contact Management
- [ ] Account Management
- [ ] Opportunity Tracking
- [ ] Lead Management
- [ ] Proposal Generation
- [ ] Dashboard & Reporting

### User Management
- [ ] User Authentication
- [ ] Profile Settings
- [ ] Organization Management
- [ ] Permissions & Roles

### Integrations
- [ ] API Overview
- [ ] Webhooks
- [ ] Data Export
- [ ] Third-Party Integrations

---

**Last Updated:** 2026-01-30
**Owner:** Documentation Team
