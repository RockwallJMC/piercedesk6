# User Documentation Governance

**Purpose:** User-facing documentation for PierceDesk application.
**Audience:** End users (sales reps, managers, admins, field technicians)
**NOT for:** Developers, system architects, internal technical details

---

## Naming Conventions

### Standard Format

All user documentation follows simple, descriptive naming:

```
{topic}-{subtopic}.md  OR  {feature-name}.md
```

### Naming Rules

**✅ DO:**
- Use all lowercase with hyphens (kebab-case)
- Use user-friendly, task-oriented names
- Present tense, action-oriented (managing-, creating-, configuring-)
- Organize by user task, not technical structure

**❌ DON'T:**
- Use technical prefixes (design-, execution-, etc.)
- Include version numbers in filenames
- Include dates in filenames
- Use internal technical terms or jargon
- Reference internal file structures

### Examples

```
✅ CORRECT:
getting-started.md
user-authentication.md
managing-contacts.md
creating-opportunities.md
dashboard-overview.md
generating-reports.md
configuring-notifications.md
exporting-data.md

❌ INCORRECT:
design-auth-flow.md
execution-contacts-2026-01-30.md
phase1-getting-started.md
internal-api-reference.md
CRM_User_Guide.md
setup_v2.md
```

---

## Content Standards

### Target Audience

Write for end users who:
- May not have technical backgrounds
- Need to accomplish business tasks
- Want clear, step-by-step instructions
- Prefer visual aids and examples
- Don't care about internal architecture

### Writing Style

**✅ DO:**
- Use active voice, present tense
- Address the user as "you" (second person)
- Keep paragraphs short (3-4 sentences max)
- Use bulleted lists for steps
- Include screenshots and visual aids
- Provide real-world examples
- Focus on "how to" and "what you can do"

**❌ DON'T:**
- Use passive voice ("the button can be clicked")
- Refer to "the user" in third person
- Write long, dense paragraphs
- Use technical jargon without explanation
- Assume technical knowledge
- Reference internal code or file structures
- Include version numbers in content

### Example Comparison

```markdown
❌ BAD (Technical):
The authentication system utilizes Supabase Auth with Row Level Security
policies implemented on the database layer. The session token is stored
in httpOnly cookies with a 7-day expiration.

✅ GOOD (User-Friendly):
To log in to PierceDesk:

1. Enter your email address
2. Enter your password
3. Click **Sign In**

You'll stay logged in for 7 days unless you sign out manually.
```

---

## Folder Organization

### /docs/user-docs/ Structure

```
user-docs/
├── AGENT.md              # This file - governance rules
├── README.md             # User guide navigation
│
├── features/             # Feature overviews and capabilities
│   ├── crm-overview.md
│   ├── contact-management.md
│   ├── opportunity-tracking.md
│   └── proposal-generation.md
│
├── guides/               # How-to guides for specific tasks
│   ├── getting-started.md
│   ├── creating-contacts.md
│   ├── managing-opportunities.md
│   └── generating-reports.md
│
└── api/                  # User-facing API documentation (if applicable)
    ├── api-overview.md
    └── authentication.md
```

### Folder Purpose

| Folder | Purpose | Content Type |
|--------|---------|--------------|
| `features/` | What the application can do | Feature overviews, capabilities, benefits |
| `guides/` | How to accomplish tasks | Step-by-step instructions, tutorials, workflows |
| `api/` | Integration & automation (for power users) | API endpoints, authentication, examples |

---

## Document Structure

### Standard Template

Every user guide should follow this structure:

```markdown
# [Feature/Task Name]

## Overview
Brief 2-3 sentence description of what this feature does or what
you'll accomplish in this guide.

## Prerequisites
- List any required setup
- Required permissions or roles
- Any previous steps that must be completed

## Step-by-Step Instructions

### Step 1: [Action]
Clear description of what to do.

1. First specific action
2. Second specific action
3. Expected result

![Screenshot](./screenshots/step1-example.png)

### Step 2: [Action]
...

## Tips & Best Practices
- Helpful tips
- Common use cases
- Recommended workflows

## Troubleshooting
### Problem: [Issue]
**Solution:** How to resolve it

## Related Topics
- [Link to related guide 1](./related-guide-1.md)
- [Link to related guide 2](./related-guide-2.md)
```

---

## Screenshots & Visuals

### Screenshot Requirements

**✅ DO:**
- Capture full context (relevant UI area, not entire screen)
- Highlight important buttons/fields with red boxes or arrows
- Use consistent screenshot style across all docs
- Update screenshots when UI changes
- Save with descriptive names: `feature-step-description.png`
- Store in `./screenshots/` subdirectory

**❌ DON'T:**
- Include sensitive user data in screenshots
- Use blurry or low-resolution images
- Capture outdated UI
- Mix different screenshot styles
- Use generic names like `image1.png`

### Example Screenshot Usage

```markdown
1. Click the **New Contact** button in the top right corner

   ![New Contact button location](./screenshots/contacts-new-button.png)

2. Fill in the contact details:
   - First Name
   - Last Name
   - Email

   ![Contact form fields](./screenshots/contacts-form-fields.png)
```

---

## Quality Standards

### 1. Accuracy

- Test every procedure before documenting
- Verify all screenshots match current UI
- Review with actual users when possible
- Update immediately when features change

### 2. Clarity

- Use simple language (avoid jargon)
- Break complex tasks into smaller steps
- Define technical terms when necessary
- Use consistent terminology throughout

### 3. Completeness

- Cover all common use cases
- Include error handling
- Provide troubleshooting tips
- Link to related topics

### 4. Accessibility

- Use descriptive link text (not "click here")
- Provide alt text for images
- Use heading hierarchy correctly (H1 → H2 → H3)
- Ensure color contrast in visuals

---

## Prohibited Content

**NEVER include in /docs/user-docs/:**

❌ Internal technical architecture
❌ Database schema details
❌ Code snippets (unless API examples)
❌ Development workflows
❌ Testing procedures
❌ Design decisions and rationale
❌ Execution logs or verification output
❌ References to internal file paths
❌ Git commits or version control info
❌ Internal project management docs

**User docs focus exclusively on helping end users accomplish their goals.**

---

## Writing Examples

### Feature Overview Example

```markdown
# Contact Management

PierceDesk's Contact Management feature helps you organize and track
all your business contacts in one place. You can store contact information,
track interactions, and manage relationships with customers and prospects.

## What You Can Do

- **Add new contacts** with complete profile information
- **Search and filter** contacts by name, company, or tags
- **Track interactions** like calls, emails, and meetings
- **Segment contacts** into lists for targeted campaigns
- **Export contact data** for reports and analysis

## Getting Started

New to contact management? Start with [Creating Your First Contact](../guides/creating-contacts.md).
```

### How-To Guide Example

```markdown
# Creating a New Contact

This guide shows you how to add a new contact to PierceDesk.

## Prerequisites

- You must have a PierceDesk account
- You need permission to create contacts (Contact Manager or Admin role)

## Steps

### Step 1: Navigate to Contacts

1. Click **CRM** in the left sidebar
2. Click **Contacts** in the submenu

You'll see the contacts list page.

![Contacts navigation](./screenshots/contacts-navigation.png)

### Step 2: Open the New Contact Form

1. Click the **New Contact** button in the top right
2. The contact form will open

![New contact button](./screenshots/contacts-new-button.png)

### Step 3: Enter Contact Information

Fill in the contact details:

1. **First Name** (required) - Enter the contact's first name
2. **Last Name** (required) - Enter the contact's last name
3. **Email** (required) - Enter a valid email address
4. **Phone** (optional) - Enter phone number with area code
5. **Company** (optional) - Select or create a company
6. **Title** (optional) - Job title (e.g., "Sales Manager")

![Contact form](./screenshots/contacts-form.png)

### Step 4: Save the Contact

1. Review the information you entered
2. Click **Save Contact**

The contact is now added to your CRM. You'll see a success message and
be redirected to the contact detail page.

## Tips

- **Email is required** - Every contact must have a unique email address
- **Use consistent naming** - Enter first and last names separately for
  better sorting and filtering
- **Add tags** - Tag contacts to organize them into groups

## Troubleshooting

### Problem: "Email already exists" error

**Solution:** This email is already associated with another contact. Check
your contacts list or use a different email address.

### Problem: Save button is disabled

**Solution:** Make sure you've filled in all required fields (marked with *).

## Related Topics

- [Editing Contact Information](./editing-contacts.md)
- [Importing Contacts from CSV](./importing-contacts.md)
- [Contact List Views](./contact-lists.md)
```

---

## Review Checklist

Before publishing any user documentation:

- [ ] Content is accurate (tested in current application version)
- [ ] Language is clear and user-friendly (no jargon)
- [ ] All steps are complete and in correct order
- [ ] Screenshots are current and clearly annotated
- [ ] Links work and point to correct locations
- [ ] Formatting is consistent with other docs
- [ ] Spelling and grammar are correct
- [ ] Document follows standard template structure
- [ ] No internal technical details exposed
- [ ] Reviewed by non-technical user (if possible)

---

## Maintenance

### Update Triggers

Update user documentation when:
- UI changes (buttons, menus, layouts)
- Features are added or modified
- User workflows change
- Screenshots become outdated
- Users report confusion or errors
- New use cases are discovered

### Monthly Review

- [ ] Verify all screenshots are current
- [ ] Test all documented procedures
- [ ] Check for broken links
- [ ] Review for outdated information
- [ ] Gather user feedback on clarity

### Version Management

- Use git for version control
- Don't include version numbers in content
- Update changelog in commit messages
- Archive major versions if complete rewrite needed

---

## Questions?

For guidance on:
- **Writing style:** See Writing Examples section above
- **Screenshot standards:** See Screenshots & Visuals section
- **Document structure:** See Document Structure section
- **Content guidelines:** See Content Standards section

**Last Updated:** 2026-01-30
**Version:** 1.0
**Owner:** Documentation Team
