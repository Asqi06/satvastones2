<!-- BEGIN:crirical-rules -->
# CRITICAL — READ BEFORE MAKING ANY CHANGES

## 1. ALWAYS read FIXES.MD first
Before making ANY code change, read the file `C:\satvastones\FIXES.MD`. This file logs every fix applied to the project.
Reading it ensures you do not reintroduce previously fixed bugs.

## 2. ALWAYS update FIXES.MD after a fix
After completing any fix, add a new entry to `C:\satvastones\FIXES.MD` documenting:
- What the problem was
- Root cause
- What was changed (files, code)
- Commit hash
- What must NOT be reverted

## 3. Follow existing patterns
- Never remove code that was part of a logged fix unless explicitly asked
- When adding features, read FIXES.MD first to understand constraints
<!-- END:crirical-rules -->

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->
