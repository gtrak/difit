# Feature Specification: difit - Git Diff Viewer Application

**Feature Branch**: `001-difit-spec`  
**Created**: 2026-02-03  
**Status**: Draft  
**Input**: User description: "Make a detailed specification to match this implementation. Spin off subagents as necessary. I want to reimplement this as a rust/dioxus application, but leave those language details out of the specification."

## Overview

difit is a CLI tool that displays Git diffs in a GitHub-style viewer interface. It provides both a web-based UI accessible via local server and a terminal UI (TUI) mode. The application supports reviewing local git diffs, comparing commits/branches, and fetching GitHub pull request diffs for review.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - View Local Git Diffs (Priority: P1)

As a developer, I want to view my local git diffs in a clean, GitHub-style interface so I can easily review my changes before committing.

**Why this priority**: This is the core functionality that delivers immediate value. Without this, the tool has no purpose.

**Independent Test**: Can be fully tested by running the tool in a git repository with uncommitted changes. The user should see their diffs rendered in a familiar interface.

**Acceptance Scenarios**:

1. **Given** I'm in a git repository with uncommitted changes, **When** I run the tool without arguments, **Then** it displays the diff between HEAD and my working directory
2. **Given** I want to see staged changes only, **When** I provide the "staged" argument, **Then** it shows only the staging area diff
3. **Given** I want to see all uncommitted changes, **When** I provide the "." argument, **Then** it shows both staged and unstaged changes
4. **Given** I'm comparing specific commits, **When** I provide two commit references, **Then** it shows the diff between those commits

---

### User Story 2 - Review with Comments (Priority: P1)

As a developer using AI coding agents, I want to add review comments to specific lines of code and generate formatted prompts so I can provide clear feedback to the AI.

**Why this priority**: This is a key differentiator that enables AI-assisted code review workflows, making the tool valuable for the "AI era" as described in the original README.

**Independent Test**: Can be fully tested by clicking on a diff line, adding a comment, and copying the generated prompt to clipboard.

**Acceptance Scenarios**:

1. **Given** I'm viewing a diff, **When** I click on a line number, **Then** I can add a comment with a text input
2. **Given** I've added a comment, **When** I click "Copy Prompt", **Then** the comment is formatted as `{file}:L{line}\n{comment}` and copied to my clipboard
3. **Given** I have multiple comments, **When** I click "Copy All", **Then** all comments are formatted with separators and copied to clipboard
4. **Given** I've added comments, **When** I close and reopen the tool for the same diff, **Then** my comments are restored from persistent storage

---

### User Story 3 - Track Reviewed Files (Priority: P2)

As a developer reviewing a large change set, I want to mark files as "viewed" and track my progress so I can systematically review all changes.

**Why this priority**: This improves the UX for large diffs and helps users track their review progress systematically.

**Independent Test**: Can be fully tested by clicking checkboxes next to files and observing the progress indicator updates.

**Acceptance Scenarios**:

1. **Given** I'm viewing a multi-file diff, **When** I click the checkbox next to a file, **Then** the file is marked as viewed and visually distinguished
2. **Given** I've marked some files as viewed, **When** I look at the progress bar, **Then** it shows "X of Y files viewed" with a visual progress indicator
3. **Given** I've marked all files as viewed, **When** all files are checked, **Then** a celebration animation plays and the text shows "All diffs difit-ed!"
4. **Given** Generated or deleted files exist, **When** the diff loads, **Then** these files are automatically marked as viewed by default

---

### User Story 4 - Navigate with Keyboard (Priority: P2)

As a power user, I want to navigate the diff view entirely with keyboard shortcuts so I can review code efficiently without switching between keyboard and mouse.

**Why this priority**: Keyboard navigation significantly speeds up the review process for power users and matches the workflow of similar tools like Gerrit.

**Independent Test**: Can be fully tested by using only keyboard shortcuts to navigate through files, chunks, and lines, and to perform actions like marking files reviewed.

**Acceptance Scenarios**:

1. **Given** I'm viewing a diff, **When** I press 'j' or down arrow, **Then** the cursor moves to the next line
2. **Given** I'm viewing a diff, **When** I press 'n', **Then** the cursor jumps to the next changed chunk
3. **Given** I'm viewing a diff, **When** I press 'v', **Then** the current file is marked as viewed
4. **Given** I'm viewing a diff, **When** I press 'c', **Then** a comment form opens for the current line
5. **Given** I'm viewing a diff, **When** I press Shift+N, **Then** the cursor jumps to the next comment

---

### User Story 5 - View GitHub Pull Requests (Priority: P3)

As a developer, I want to review GitHub pull requests locally so I can use my preferred review interface and tools.

**Why this priority**: This extends the tool's utility beyond local development to code review workflows, but requires external API integration.

**Independent Test**: Can be fully tested by providing a GitHub PR URL and seeing the PR diff loaded with proper commit resolution.

**Acceptance Scenarios**:

1. **Given** I have a GitHub PR URL, **When** I provide it via --pr option, **Then** the tool fetches the PR and displays the diff
2. **Given** I'm reviewing a PR, **When** the PR has multiple commits, **Then** I can navigate between individual commits in the PR
3. **Given** I'm reviewing a PR from a private repository, **When** I have proper authentication, **Then** the tool can access and display the PR diff

---

### User Story 6 - Use Terminal UI Mode (Priority: P3)

As a developer working in a terminal environment, I want to view diffs without opening a browser so I can stay in my terminal workflow.

**Why this priority**: Provides an alternative interface for terminal-focused workflows, expanding the tool's accessibility.

**Independent Test**: Can be fully tested by running with --tui flag and navigating with keyboard-only controls.

**Acceptance Scenarios**:

1. **Given** I prefer terminal interfaces, **When** I provide the --tui flag, **Then** the tool displays the diff in the terminal
2. **Given** I'm in TUI mode, **When** I press Tab, **Then** I can navigate between files
3. **Given** I'm in TUI mode, **When** I press Enter on a file, **Then** I can view the diff for that file
4. **Given** I'm in TUI mode, **When** I press 'r', **Then** the diff refreshes to show latest changes

---

### Edge Cases

1. **Empty diff**: When there are no changes, the tool should display a clear message and not open the browser automatically
2. **Large files**: Binary files and files over 10MB should be handled gracefully with appropriate messages
3. **Invalid git references**: When invalid commit SHAs or branch names are provided, clear error messages with troubleshooting hints should be shown
4. **Non-git directory**: When run outside a git repository, the tool should either fail gracefully with a helpful message or fall back to stdin diff mode
5. **Authentication failures**: When GitHub API authentication fails, detailed error messages should explain how to set up authentication
6. **Port conflicts**: When the preferred port is in use, the tool should automatically try the next available port
7. **File watching failures**: When file watching cannot start (e.g., due to OS limitations), the tool should continue without watching
8. **Concurrent access**: When multiple browser tabs are open, comments should be synchronized (if supported by implementation)

## Requirements _(mandatory)_

### Functional Requirements

#### CLI Interface

- **FR-001**: The system MUST accept commit-ish references as positional arguments (target and optional base)
- **FR-002**: The system MUST support special arguments: "." (all uncommitted), "staged" (staging area), "working" (unstaged changes)
- **FR-003**: The system MUST accept a --pr option for GitHub pull request URLs
- **FR-004**: The system MUST accept --port and --host options to configure the server
- **FR-005**: The system MUST accept --no-open flag to prevent automatic browser opening
- **FR-006**: The system MUST accept --mode option with values "side-by-side" or "inline" for default view mode
- **FR-007**: The system MUST accept --tui flag to use terminal UI instead of web UI
- **FR-008**: The system MUST accept --clean flag to clear existing comments on startup
- **FR-009**: The system MUST accept --include-untracked flag to include untracked files in diff
- **FR-010**: The system MUST support reading unified diff from stdin (pipe mode)
- **FR-011**: The system MUST validate commit references using git rules and reject invalid formats
- **FR-012**: The system MUST detect if running in a git repository and handle non-repository gracefully

#### Git Operations

- **FR-013**: The system MUST parse git diff output into structured data with file paths, change types, line numbers, and content
- **FR-014**: The system MUST handle file path encoding including quoted paths and octal escape sequences
- **FR-015**: The system MUST detect file status: added, deleted, modified, or renamed
- **FR-016**: The system MUST support comparing working directory, staging area, and committed states
- **FR-017**: The system MUST handle untracked files by optionally marking them with --intent-to-add
- **FR-018**: The system MUST detect generated files using path patterns and content-based heuristics
- **FR-019**: The system MUST resolve symbolic refs (HEAD, branches, tags) to actual commit SHAs
- **FR-020**: The system MUST get available branches and recent commits for revision selection

#### GitHub Integration

- **FR-021**: The system MUST parse GitHub PR URLs to extract owner, repository, and PR number
- **FR-022**: The system MUST support both github.com and GitHub Enterprise Server URLs
- **FR-023**: The system MUST authenticate with GitHub API using GITHUB_TOKEN environment variable
- **FR-024**: The system MUST fallback to GitHub CLI authentication (gh auth token)
- **FR-025**: The system MUST fetch PR details including base and head commit SHAs
- **FR-026**: The system MUST resolve PR commits in the local repository

#### Diff Display (Web UI)

- **FR-027**: The system MUST display diffs in two modes: side-by-side (parallel columns) and inline (unified)
- **FR-028**: The system MUST show line numbers for both old and new versions
- **FR-029**: The system MUST syntax highlight code based on file extension
- **FR-030**: The system MUST highlight word-level differences within changed lines
- **FR-031**: The system MUST support collapsing and expanding individual files
- **FR-032**: The system MUST auto-collapse generated and deleted files by default
- **FR-033**: The system MUST handle different file types: text, images, and markdown
- **FR-034**: The system MUST display images with dimensions and allow side-by-side comparison
- **FR-035**: The system MUST render markdown diffs with preview mode showing rendered output
- **FR-036**: The system MUST provide an "ignore whitespace" toggle
- **FR-037**: The system MUST support expanding context lines to show more surrounding code

#### Comment System

- **FR-038**: The system MUST allow users to add comments on single lines or line ranges
- **FR-039**: The system MUST associate comments with either the old (deletion) or new (addition) side
- **FR-040**: The system MUST persist comments in localStorage with repository isolation
- **FR-041**: The system MUST restore comments when viewing the same diff context
- **FR-042**: The system MUST generate prompts in format: `{filepath}:L{line}\n{comment}`
- **FR-043**: The system MUST support multi-line ranges in format: `{filepath}:L{start}-L{end}\n{comment}`
- **FR-044**: The system MUST allow copying individual or all comments to clipboard
- **FR-045**: The system MUST support editing and deleting existing comments
- **FR-046**: The system MUST capture code snapshots with comments for context

#### Viewed Files Tracking

- **FR-047**: The system MUST allow marking files as "viewed" via checkbox interaction
- **FR-048**: The system MUST persist viewed state across sessions
- **FR-049**: The system MUST display progress indicator showing "X of Y files viewed"
- **FR-050**: The system MUST auto-mark generated and deleted files as viewed on initial load
- **FR-051**: The system MUST auto-collapse files when marked as viewed
- **FR-052**: The system MUST track viewed state per diff context (base vs target commits)

#### Keyboard Navigation

- **FR-053**: The system MUST support keyboard shortcuts for all primary actions
- **FR-054**: The system MUST use 'j'/'k' or arrows for line navigation
- **FR-055**: The system MUST use 'n'/'p' for chunk navigation (next/previous change)
- **FR-056**: The system MUST use ']'/'[' for file navigation (next/previous file)
- **FR-057**: The system MUST use 'h'/'l' or left/right arrows for side switching in side-by-side mode
- **FR-058**: The system MUST use Shift+N/Shift+P for comment navigation
- **FR-059**: The system MUST use 'v' to toggle viewed state of current file
- **FR-060**: The system MUST use 'c' to create comment at current line
- **FR-061**: The system MUST use '?' to show keyboard shortcuts help
- **FR-062**: The system MUST provide visual cursor indicator showing current position

#### File Watching

- **FR-063**: The system MUST watch for file changes and notify the UI to reload
- **FR-064**: The system MUST use Server-Sent Events (SSE) for real-time notifications
- **FR-065**: The system MUST support different watch modes: DEFAULT, WORKING, STAGED, DOT, SPECIFIC
- **FR-066**: The system MUST debounce rapid file changes to prevent excessive reloads
- **FR-067**: The system MUST respect .gitignore patterns when watching working directory
- **FR-068**: The system MUST differentiate change types: file changes, commit changes, staging changes

#### Terminal UI

- **FR-069**: The system MUST provide a terminal-based UI when --tui flag is used
- **FR-070**: The system MUST support three TUI modes: file list, inline diff, side-by-side diff
- **FR-071**: The system MUST support keyboard navigation in TUI with vim-style bindings (j/k, h/l)
- **FR-072**: The system MUST use semantic colors in terminal: green for additions, red for deletions, yellow for paths
- **FR-073**: The system MUST support reloading in TUI mode with 'r' key
- **FR-074**: The system MUST exit TUI with 'q' or Ctrl+C

#### Server & Communication

- **FR-075**: The system MUST start a local HTTP server to serve the UI
- **FR-076**: The system MUST automatically find an available port if preferred port is in use
- **FR-077**: The system MUST provide REST API endpoints for: /api/diff, /api/revisions, /api/comments
- **FR-078**: The system MUST provide SSE endpoint for file watching notifications
- **FR-079**: The system MUST output comments to console when server shuts down (Ctrl+C)
- **FR-080**: The system MUST support CORS for local development

### Key Entities

**DiffFile**: Represents a file in the diff

- path: string (file path in repository)
- oldPath: string (previous path for renamed files)
- status: 'modified' | 'added' | 'deleted' | 'renamed'
- additions: number (count of added lines)
- deletions: number (count of deleted lines)
- chunks: DiffChunk[] (array of change hunks)
- isGenerated: boolean (whether file is auto-generated)

**DiffChunk**: Represents a contiguous block of changes

- header: string (the @@ -l,n +m,p @@ line)
- oldStart: number (starting line in old file)
- oldLines: number (lines in old file chunk)
- newStart: number (starting line in new file)
- newLines: number (lines in new file chunk)
- lines: DiffLine[] (individual lines with type and content)

**DiffLine**: Represents a single line in the diff

- type: 'add' | 'delete' | 'normal'
- content: string (line content without diff prefix)
- oldLineNumber: number (line number in old file, undefined for additions)
- newLineNumber: number (line number in new file, undefined for deletions)

**Comment**: Represents a user comment on a diff

- id: string (unique identifier)
- filePath: string (path to commented file)
- body: string (comment text)
- side: 'old' | 'new' (which side of diff)
- line: number | { start: number; end: number } (single line or range)
- createdAt: string (ISO timestamp)
- updatedAt: string (ISO timestamp)
- codeSnapshot: { content: string; language?: string } (optional context)

**ViewedFileRecord**: Tracks viewed state for a file

- filePath: string
- viewedAt: string (ISO timestamp)
- diffContentHash: string (SHA-256 hash for change detection)

**RevisionInfo**: Represents a git revision for selection

- specialOptions: array of special refs (., staged, working)
- branches: array of branch names with current flag
- commits: array of recent commits with hash, short hash, and message

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Users can view any git diff (local changes, commit comparison, PR) in under 3 seconds from command execution
- **SC-002**: 95% of users can successfully add a comment on their first attempt without reading documentation
- **SC-003**: Keyboard navigation allows users to review 50% more files per minute compared to mouse-only navigation
- **SC-004**: Comments persist across browser sessions for the same repository and commit range (100% retention)
- **SC-005**: Generated files are correctly identified with 90% accuracy (minimize false positives while catching most generated files)
- **SC-006**: File watching detects changes within 300ms and triggers UI updates
- **SC-007**: TUI mode provides equivalent functionality to WebUI for basic diff viewing (all core features accessible)
- **SC-008**: GitHub PR integration resolves commits successfully for 95% of valid PR URLs on first attempt
- **SC-009**: The application gracefully handles 100% of edge cases (empty diffs, invalid refs, missing auth) with helpful error messages
- **SC-010**: Users can copy AI-formatted prompts in under 2 clicks from any comment

## Assumptions

1. **Git availability**: The tool assumes git is installed and available in the system PATH
2. **Modern browser**: The WebUI assumes a modern browser supporting ES6+ and CSS Grid/Flexbox
3. **Terminal support**: The TUI assumes a terminal supporting ANSI colors and Unicode characters
4. **Single user**: The tool is designed for single-user local development, not multi-user collaboration
5. **Repository access**: For GitHub PR review, the user has appropriate repository access and authentication
6. **File size limits**: Reasonable file size limits (10MB+) are acceptable for most use cases
7. **Local storage**: Browser localStorage is available and not disabled by user privacy settings

## Scope Boundaries

### In Scope

- Local git diff viewing for all standard git workflows
- GitHub pull request diff fetching and display
- Comment system with AI prompt generation
- Viewed files tracking with persistence
- Keyboard navigation for power users
- File watching with auto-reload
- Terminal UI mode as alternative interface
- Syntax highlighting for common programming languages
- Image and markdown diff visualization

### Out of Scope

- Multi-user real-time collaboration (comments not synchronized across users)
- Integration with other git hosting platforms (GitLab, Bitbucket, etc.)
- Code editing capabilities (read-only diff viewer)
- CI/CD integration or automated workflows
- Mobile-optimized interface
- Custom themes beyond the GitHub-like dark theme
- Plugin/extension system
- Integration with IDE editors (VS Code, IntelliJ, etc.)
