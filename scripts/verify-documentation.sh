#!/bin/bash

# Documentation Compliance Verification Script
# Purpose: Automated verification of PierceDesk documentation standards
# Created: 2026-01-29
# See: _sys_documents/execution/DOCUMENTATION-COMPLIANCE-AUDIT-2026-01-29.md

# Don't exit on error - we want to run all checks
set +e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
total_checks=0
passed_checks=0
failed_checks=0
warning_checks=0

# Output functions
print_header() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
    ((passed_checks++))
    ((total_checks++))
}

print_failure() {
    echo -e "${RED}✗ $1${NC}"
    ((failed_checks++))
    ((total_checks++))
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
    ((warning_checks++))
    ((total_checks++))
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

# Check 1: Verify _sys_documents structure
check_sys_documents_structure() {
    print_header "Checking _sys_documents structure"

    required_dirs=(
        "_sys_documents"
        "_sys_documents/vision"
        "_sys_documents/roadmap"
        "_sys_documents/design"
        "_sys_documents/execution"
        "_sys_documents/as-builts"
    )

    for dir in "${required_dirs[@]}"; do
        if [ -d "$dir" ]; then
            print_success "Directory exists: $dir"
        else
            print_failure "Missing directory: $dir"
        fi
    done

    # Check for AGENT.md
    if [ -f "_sys_documents/AGENT.md" ]; then
        print_success "AGENT.md exists"
    else
        print_failure "AGENT.md missing"
    fi
}

# Check 2: Verify docs structure
check_docs_structure() {
    print_header "Checking docs/ structure"

    required_dirs=(
        "docs"
        "docs/architecture"
        "docs/features"
        "docs/guides"
        "docs/api"
    )

    for dir in "${required_dirs[@]}"; do
        if [ -d "$dir" ]; then
            print_success "Directory exists: $dir"
        else
            print_failure "Missing directory: $dir"
        fi
    done
}

# Check 3: Verify templates
check_templates() {
    print_header "Checking .claude/templates"

    required_templates=(
        ".claude/templates/INDEX-template.md"
        ".claude/templates/phase-design-template.md"
        ".claude/templates/phase-execution-template.md"
        ".claude/templates/debug-template.md"
        ".claude/templates/realignment-template.md"
        ".claude/templates/as-built-template.md"
    )

    for template in "${required_templates[@]}"; do
        if [ -f "$template" ]; then
            print_success "Template exists: $(basename $template)"
        else
            print_failure "Missing template: $(basename $template)"
        fi
    done

    # Check examples directory
    if [ -d ".claude/templates/examples" ]; then
        example_count=$(find .claude/templates/examples -type f -name "*.md" | wc -l)
        if [ "$example_count" -gt 0 ]; then
            print_success "Template examples exist ($example_count files)"
        else
            print_warning "No example files in .claude/templates/examples"
        fi
    else
        print_warning "Examples directory not found"
    fi
}

# Check 4: Verify frontmatter in tracking documents
check_frontmatter() {
    print_header "Checking YAML frontmatter compliance"

    # Find all markdown files in _sys_documents
    tracking_files=$(find _sys_documents -type f -name "*.md" | grep -v "AGENT.md")

    if [ -z "$tracking_files" ]; then
        print_info "No tracking documents found to check"
        return
    fi

    frontmatter_count=0
    no_frontmatter_count=0

    while IFS= read -r file; do
        # Check if file starts with ---
        if head -n 1 "$file" | grep -q "^---$"; then
            ((frontmatter_count++))
        else
            ((no_frontmatter_count++))
            print_warning "No frontmatter: $file"
        fi
    done <<< "$tracking_files"

    if [ "$no_frontmatter_count" -eq 0 ]; then
        print_success "All tracking documents have frontmatter ($frontmatter_count files)"
    else
        print_warning "$no_frontmatter_count files missing frontmatter (out of $((frontmatter_count + no_frontmatter_count)))"
    fi
}

# Check 5: Verify CLAUDE.md
check_claude_md() {
    print_header "Checking CLAUDE.md"

    if [ -f "CLAUDE.md" ]; then
        print_success "CLAUDE.md exists"

        # Check for key sections
        if grep -q "## Documentation Standards" CLAUDE.md; then
            print_success "Contains Documentation Standards section"
        else
            print_failure "Missing Documentation Standards section"
        fi

        if grep -q "## Skills Framework" CLAUDE.md; then
            print_success "Contains Skills Framework section"
        else
            print_failure "Missing Skills Framework section"
        fi

        if grep -q "TDD" CLAUDE.md; then
            print_success "References TDD skill"
        else
            print_warning "No TDD skill reference"
        fi

        if grep -q "VERIFY-BEFORE-COMPLETE" CLAUDE.md; then
            print_success "References VERIFY-BEFORE-COMPLETE skill"
        else
            print_warning "No VERIFY-BEFORE-COMPLETE skill reference"
        fi
    else
        print_failure "CLAUDE.md not found"
    fi
}

# Check 6: Verify Documentation Guide
check_documentation_guide() {
    print_header "Checking Documentation Guide"

    guide_path="docs/guides/DOCUMENTATION-GUIDE.md"

    if [ -f "$guide_path" ]; then
        print_success "DOCUMENTATION-GUIDE.md exists"

        # Check for key sections
        key_sections=(
            "## Documentation Framework Overview"
            "## Documentation Lifecycle"
            "## Template Usage"
            "## GitHub Integration"
        )

        for section in "${key_sections[@]}"; do
            if grep -q "$section" "$guide_path"; then
                print_success "Contains: $section"
            else
                print_warning "Missing: $section"
            fi
        done
    else
        print_failure "DOCUMENTATION-GUIDE.md not found"
    fi
}

# Check 7: Count documentation files
count_documentation() {
    print_header "Documentation File Counts"

    # Count files in each directory
    sys_doc_count=$(find _sys_documents -type f -name "*.md" 2>/dev/null | wc -l || echo 0)
    docs_count=$(find docs -type f -name "*.md" 2>/dev/null | wc -l || echo 0)
    template_count=$(find .claude/templates -type f -name "*.md" 2>/dev/null | wc -l || echo 0)

    print_info "_sys_documents: $sys_doc_count markdown files"
    print_info "docs/: $docs_count markdown files"
    print_info ".claude/templates: $template_count template files"

    total_docs=$((sys_doc_count + docs_count + template_count))
    print_info "Total documentation files: $total_docs"
}

# Check 8: Verify no filename suffixes (deprecated pattern)
check_filename_suffixes() {
    print_header "Checking for deprecated filename suffixes"

    # Look for old patterns like *-DESIGN.md, *-EXECUTION.md
    deprecated_files=$(find _sys_documents -type f \( \
        -name "*-DESIGN.md" -o \
        -name "*-EXECUTION.md" -o \
        -name "*-DEBUG.md" -o \
        -name "*-REALIGN.md" \
    \) 2>/dev/null)

    if [ -z "$deprecated_files" ]; then
        print_success "No deprecated filename suffixes found"
    else
        print_warning "Found files with deprecated suffixes:"
        echo "$deprecated_files" | while read -r file; do
            print_warning "  - $file"
        done
    fi
}

# Check 9: Verify skills exist
check_skills() {
    print_header "Checking skills"

    required_skills=(
        ".claude/skills/TDD/SKILL.md"
        ".claude/skills/VERIFY-BEFORE-COMPLETE/SKILL.md"
        ".claude/skills/using-superpowers/SKILL.md"
        ".claude/skills/software-architecture/SKILL.md"
    )

    for skill in "${required_skills[@]}"; do
        if [ -f "$skill" ]; then
            skill_name=$(basename $(dirname $skill))
            print_success "Skill exists: $skill_name"
        else
            skill_name=$(basename $(dirname $skill))
            print_failure "Missing skill: $skill_name"
        fi
    done
}

# Main execution
main() {
    echo ""
    print_header "PierceDesk Documentation Compliance Verification"
    echo "Started: $(date)"
    echo ""

    check_sys_documents_structure
    echo ""

    check_docs_structure
    echo ""

    check_templates
    echo ""

    check_frontmatter
    echo ""

    check_claude_md
    echo ""

    check_documentation_guide
    echo ""

    check_skills
    echo ""

    check_filename_suffixes
    echo ""

    count_documentation
    echo ""

    # Summary
    print_header "Verification Summary"
    echo -e "${BLUE}Total checks: $total_checks${NC}"
    echo -e "${GREEN}Passed: $passed_checks${NC}"
    echo -e "${RED}Failed: $failed_checks${NC}"
    echo -e "${YELLOW}Warnings: $warning_checks${NC}"
    echo ""

    # Calculate percentage
    if [ "$total_checks" -gt 0 ]; then
        pass_rate=$((passed_checks * 100 / total_checks))
        echo -e "${BLUE}Pass rate: ${pass_rate}%${NC}"
    fi

    echo ""
    echo "Completed: $(date)"
    echo ""

    # Exit with error if there are failures
    if [ "$failed_checks" -gt 0 ]; then
        echo -e "${RED}Verification FAILED with $failed_checks failures${NC}"
        exit 1
    else
        echo -e "${GREEN}Verification PASSED${NC}"
        exit 0
    fi
}

# Run main function
main
