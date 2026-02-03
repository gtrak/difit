---
description: 'Task list for difit - Git Diff Viewer Application'
---

# Tasks: difit - Git Diff Viewer Application

**Input**: Design documents from `/specs/001-difit-spec/`
**Prerequisites**: plan.md, spec.md, data-model.md, contracts/

**Tests**: Tests are NOT requested in the specification. Focus on implementation only.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and Rust toolchain setup

- [ ] T001 Create Cargo.toml with Dioxus 0.7+, gix, tokio, ratatui, syntect, sqlx dependencies
- [ ] T002 [P] Create project directory structure: src/{cli,git,web,tui,models,db}/
- [ ] T003 [P] Create tests/ directory structure: tests/{unit,integration,contracts}/
- [ ] T004 Configure .gitignore for Rust project
- [ ] T005 Setup rustfmt.toml and clippy configuration

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Database Layer (SQLite with sqlx)

- [ ] T006 [P] Create database schema in src/db/schema.sql (comments, viewed_files, preferences tables)
- [ ] T007 Implement database connection pool in src/db/connection.rs with XDG path resolution
- [ ] T008 Implement file-based locking in src/db/lock.rs for concurrent access
- [ ] T009 [P] Create Comment database repository in src/db/comments.rs
- [ ] T010 [P] Create ViewedFile database repository in src/db/viewed_files.rs
- [ ] T011 Create Preferences repository in src/db/preferences.rs

### Shared Data Models

- [ ] T012 [P] Define FileStatus, LineType, Side enums in src/models/mod.rs
- [ ] T013 [P] Implement DiffLine struct in src/models/diff.rs
- [ ] T014 [P] Implement DiffChunk struct in src/models/diff.rs
- [ ] T015 [P] Implement DiffFile struct in src/models/diff.rs
- [ ] T016 Implement Comment struct in src/models/comment.rs
- [ ] T017 Implement ViewedFileRecord struct in src/models/comment.rs
- [ ] T018 Implement RevisionInfo and related structs in src/models/revision.rs

### Git Operations Foundation

- [ ] T019 Create git module structure in src/git/mod.rs
- [ ] T020 Implement repository detection and operations in src/git/repo.rs
- [ ] T021 Implement diff parsing from gix output in src/git/diff.rs
- [ ] T022 Implement revision resolution (HEAD, branches, SHAs) in src/git/repo.rs

### Error Handling & Utilities

- [ ] T023 Create error types and conversions in src/error.rs
- [ ] T024 Implement generated file detection heuristics in src/git/utils.rs

**Checkpoint**: Foundation ready - database connects, models compile, git operations work

---

## Phase 3: User Story 1 - View Local Git Diffs (Priority: P1) 🎯 MVP

**Goal**: Display local git diffs in a GitHub-style web interface

**Independent Test**: Run `difit` in a git repo with uncommitted changes and see diffs rendered in browser

### CLI Arguments

- [ ] T025 Implement CLI argument parsing in src/cli/args.rs (commit refs, --port, --host, --no-open, --mode)
- [ ] T026 Handle special arguments: ".", "staged", "working" in src/cli/args.rs

### Web UI Foundation

- [ ] T027 Setup Dioxus fullstack app structure in src/web/mod.rs
- [ ] T028 Create main app component in src/web/app.rs
- [ ] T029 Implement application state management in src/web/state.rs

### Server Functions

- [ ] T030 Implement get_diff server function in src/web/server.rs
- [ ] T031 Implement get_revisions server function in src/web/server.rs

### Web Components

- [ ] T032 [P] Create DiffView component in src/web/components/diff_view.rs
- [ ] T033 [P] Create FileList component in src/web/components/file_list.rs
- [ ] T034 Create Progress component in src/web/components/progress.rs

### Syntax Highlighting

- [ ] T035 Integrate syntect for syntax highlighting in src/web/components/diff_view.rs
- [ ] T036 Implement word-level diff highlighting in src/web/components/diff_view.rs

### Entry Point

- [ ] T037 Implement main.rs with CLI parsing and server startup
- [ ] T038 Add browser auto-open logic in src/main.rs

**Checkpoint**: User Story 1 complete - can view local diffs in browser with syntax highlighting

---

## Phase 4: User Story 2 - Review with Comments (Priority: P1)

**Goal**: Add, edit, delete comments on diff lines with AI prompt generation

**Independent Test**: Click a line number, add comment, see it persist after reload

### Database & Models

- [ ] T039 Add CommentRecord to database models in src/db/mod.rs
- [ ] T040 Implement Comment type conversions in src/models/comment.rs

### Server Functions

- [ ] T041 [P] Implement get_comments server function in src/web/server.rs
- [ ] T042 [P] Implement add_comment server function in src/web/server.rs
- [ ] T043 [P] Implement update_comment server function in src/web/server.rs
- [ ] T044 Implement delete_comment server function in src/web/server.rs

### Web Components

- [ ] T045 Create CommentForm component in src/web/components/comment_form.rs
- [ ] T046 Integrate comment display into DiffView in src/web/components/diff_view.rs
- [ ] T047 Add line click handlers to open comment form in src/web/components/diff_view.rs

### AI Prompt Generation

- [ ] T048 Implement prompt formatting: `{filepath}:L{line}\n{comment}` in src/models/comment.rs
- [ ] T049 Implement multi-line range formatting in src/models/comment.rs
- [ ] T050 Add "Copy Prompt" and "Copy All" buttons in src/web/components/comment_form.rs

### Comment Persistence

- [ ] T051 Load comments on diff view initialization in src/web/state.rs
- [ ] T052 Implement comment cleanup for unreachable commits in src/db/comments.rs

**Checkpoint**: User Story 2 complete - can add/edit/delete comments and copy AI prompts

---

## Phase 5: User Story 3 - Track Reviewed Files (Priority: P2)

**Goal**: Mark files as viewed with progress tracking and persistence

**Independent Test**: Click checkboxes next to files, see progress bar update, verify persistence

### Database & Models

- [ ] T053 Add ViewedFileRecord to database models in src/db/mod.rs

### Server Functions

- [ ] T054 [P] Implement get_viewed_files server function in src/web/server.rs
- [ ] T055 [P] Implement mark_file_viewed server function in src/web/server.rs
- [ ] T056 Implement mark_file_unviewed server function in src/web/server.rs

### Web Components

- [ ] T057 Add viewed checkbox to FileList component in src/web/components/file_list.rs
- [ ] T058 Implement progress indicator in src/web/components/progress.rs
- [ ] T059 Add celebration animation when all files viewed in src/web/components/progress.rs

### Viewed State Management

- [ ] T060 Auto-mark generated/deleted files as viewed on load in src/web/state.rs
- [ ] T061 Auto-collapse files when marked as viewed in src/web/components/file_list.rs
- [ ] T062 Persist viewed state to database in src/db/viewed_files.rs

**Checkpoint**: User Story 3 complete - can track viewed files with visual progress

---

## Phase 6: User Story 4 - Navigate with Keyboard (Priority: P2)

**Goal**: Full keyboard navigation for efficient code review

**Independent Test**: Use only keyboard (j/k, n/p, v, c) to navigate and interact with diff

### Keyboard Event Handling

- [ ] T063 Implement keyboard event handler in src/web/events.rs
- [ ] T064 Add global keyboard shortcut listener in src/web/app.rs

### Navigation Logic

- [ ] T065 Implement line navigation (j/k, arrows) in src/web/events.rs
- [ ] T066 Implement chunk navigation (n/p) in src/web/events.rs
- [ ] T067 Implement file navigation (]/[) in src/web/events.rs
- [ ] T068 Implement side switching in side-by-side mode (h/l) in src/web/events.rs
- [ ] T069 Implement comment navigation (Shift+N/Shift+P) in src/web/events.rs

### Action Shortcuts

- [ ] T070 Implement 'v' to toggle viewed state in src/web/events.rs
- [ ] T071 Implement 'c' to create comment at current line in src/web/events.rs
- [ ] T072 Implement '?' to show keyboard shortcuts help in src/web/events.rs

### Visual Feedback

- [ ] T073 Add visual cursor indicator in src/web/components/diff_view.rs
- [ ] T074 Create keyboard shortcuts help modal in src/web/components/mod.rs

**Checkpoint**: User Story 4 complete - can navigate entire UI with keyboard only

---

## Phase 7: User Story 5 - View GitHub Pull Requests (Priority: P3)

**Goal**: Fetch and display GitHub PR diffs locally

**Independent Test**: Run `difit --pr <url>` and see PR diff loaded

### GitHub Integration

- [ ] T075 Implement GitHub URL parsing in src/git/github.rs
- [ ] T076 Implement GitHub API authentication (GITHUB_TOKEN, gh CLI) in src/git/github.rs
- [ ] T077 Implement PR fetching in src/git/github.rs
- [ ] T078 Implement PR commit resolution in src/git/github.rs

### CLI & Server

- [ ] T079 Add --pr option to CLI in src/cli/args.rs
- [ ] T080 Implement fetch_pull_request server function in src/web/server.rs

### Web UI

- [ ] T081 Add PR metadata display in src/web/components/diff_view.rs
- [ ] T082 Support PR commit navigation in src/web/state.rs

**Checkpoint**: User Story 5 complete - can view GitHub PR diffs locally

---

## Phase 8: User Story 6 - Use Terminal UI Mode (Priority: P3)

**Goal**: Terminal-based UI as alternative to web interface

**Independent Test**: Run `difit --tui` and navigate with keyboard-only controls

### TUI Foundation

- [ ] T083 Setup ratatui app structure in src/tui/mod.rs
- [ ] T084 Create TUI main loop in src/tui/app.rs
- [ ] T085 Implement terminal event handling in src/tui/events.rs

### TUI Views

- [ ] T086 [P] Create file list view in src/tui/views/file_list.rs
- [ ] T087 [P] Create inline diff view in src/tui/views/diff_view.rs
- [ ] T088 Create side-by-side diff view in src/tui/views/diff_view.rs

### TUI Navigation

- [ ] T089 Implement vim-style navigation (j/k, h/l, Tab) in src/tui/events.rs
- [ ] T090 Implement Enter to view file diff in src/tui/events.rs
- [ ] T091 Implement 'r' to refresh diff in src/tui/events.rs
- [ ] T092 Implement 'v' to mark file viewed in src/tui/events.rs
- [ ] T093 Implement 'q' and Ctrl+C to exit in src/tui/events.rs

### TUI Styling

- [ ] T094 Apply semantic colors (green/red/yellow) in src/tui/views/
- [ ] T095 Handle terminal resize events in src/tui/app.rs

### CLI Integration

- [ ] T096 Add --tui flag to CLI in src/cli/args.rs
- [ ] T097 Launch TUI mode from main.rs when --tui is provided

**Checkpoint**: User Story 6 complete - can use terminal UI as alternative to web

---

## Phase 9: File Watching & Auto-Reload (Cross-Cutting)

**Purpose**: Real-time UI updates when files change

- [ ] T098 Implement file watcher with notify in src/git/watch.rs
- [ ] T099 Implement debouncing for rapid changes in src/git/watch.rs
- [ ] T100 Implement Server-Sent Events endpoint in src/web/server.rs
- [ ] T101 Add file_watch_stream server function for SSE in src/web/server.rs
- [ ] T102 Integrate file watching with web UI state in src/web/state.rs
- [ ] T103 Differentiate change types (file/commit/staging) in src/git/watch.rs
- [ ] T104 Skip watching for fixed commit SHAs in src/git/watch.rs

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

### Error Handling & Edge Cases

- [ ] T105 Handle empty diffs with clear message in src/web/app.rs
- [ ] T106 Handle large files (>10MB) gracefully in src/git/diff.rs
- [ ] T107 Handle invalid git references with helpful errors in src/git/repo.rs
- [ ] T108 Handle non-git directory gracefully in src/git/repo.rs
- [ ] T109 Handle port conflicts with auto-detection in src/main.rs
- [ ] T110 Handle authentication failures with detailed messages in src/git/github.rs
- [ ] T111 Handle database lock conflicts in src/db/lock.rs

### Performance & Optimization

- [ ] T112 Optimize diff parsing for large files in src/git/diff.rs
- [ ] T113 Implement lazy loading for large diffs in src/web/components/diff_view.rs
- [ ] T114 Add caching for syntax highlighting in src/web/components/diff_view.rs

### Additional Features

- [ ] T115 Implement view mode toggle (side-by-side/inline) in src/web/components/diff_view.rs
- [ ] T116 Implement ignore whitespace toggle in src/web/components/diff_view.rs
- [ ] T117 Implement expand context lines in src/web/components/diff_view.rs
- [ ] T118 Implement image diff display in src/web/components/diff_view.rs
- [ ] T119 Implement markdown preview mode in src/web/components/diff_view.rs
- [ ] T120 Add --clean flag to clear comments in src/cli/args.rs and src/main.rs
- [ ] T121 Add --include-untracked flag in src/cli/args.rs
- [ ] T122 Implement stdin diff reading in src/cli/args.rs

### Logging & Output

- [ ] T123 Output comments to console on shutdown in src/main.rs
- [ ] T124 Add structured logging with tracing in src/error.rs

### Final Validation

- [ ] T125 Run cargo test to verify all tests pass
- [ ] T126 Run cargo clippy to ensure code quality
- [ ] T127 Validate against quickstart.md scenarios
- [ ] T128 Cross-platform testing (Linux, macOS, Windows)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies - can start immediately
- **Phase 2 (Foundational)**: Depends on Setup - BLOCKS all user stories
- **Phases 3-8 (User Stories)**: All depend on Foundational completion
  - User stories can proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Phase 9 (File Watching)**: Depends on US1, US2, US3 completion
- **Phase 10 (Polish)**: Depends on all desired user stories

### User Story Dependencies

| Story | Priority | Dependencies | Can Run Parallel With |
| ----- | -------- | ------------ | --------------------- |
| US1   | P1       | Phase 2      | None (MVP first)      |
| US2   | P1       | Phase 2, US1 | US3, US4              |
| US3   | P2       | Phase 2, US1 | US2, US4              |
| US4   | P2       | Phase 2, US1 | US2, US3              |
| US5   | P3       | Phase 2, US1 | US6                   |
| US6   | P3       | Phase 2, US1 | US5                   |

### Within Each User Story

1. Server functions first (backend)
2. Models (if any new ones)
3. Web components (frontend)
4. Integration and polish

### Parallel Opportunities

- All Phase 1 tasks marked [P] can run in parallel
- All Phase 2 tasks marked [P] can run in parallel (within the phase)
- Once Foundational phase completes:
  - US2, US3, US4 can start in parallel
  - US5, US6 can start in parallel
- Models within a story marked [P] can run in parallel
- Server functions within a story marked [P] can run in parallel

---

## Parallel Example: User Story 2

```bash
# All server functions for User Story 2 can be developed together:
Task: "Implement get_comments server function"
Task: "Implement add_comment server function"
Task: "Implement update_comment server function"
Task: "Implement delete_comment server function"

# After server functions complete:
Task: "Create CommentForm component"
Task: "Integrate comment display into DiffView"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T005)
2. Complete Phase 2: Foundational (T006-T024) - CRITICAL
3. Complete Phase 3: User Story 1 (T025-T038)
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Add User Story 4 → Test independently → Deploy/Demo
6. Add User Story 5 → Test independently → Deploy/Demo
7. Add User Story 6 → Test independently → Deploy/Demo
8. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 2 (Comments)
   - Developer B: User Story 3 (Viewed Files)
   - Developer C: User Story 4 (Keyboard)
3. Meanwhile:
   - Developer D: User Story 5 (GitHub PR)
   - Developer E: User Story 6 (TUI)
4. Stories complete and integrate independently

---

## Summary

**Total Tasks**: 128

**Task Count by Phase**:

- Phase 1 (Setup): 5 tasks
- Phase 2 (Foundational): 19 tasks
- Phase 3 (US1 - View Local Diffs): 14 tasks
- Phase 4 (US2 - Comments): 14 tasks
- Phase 5 (US3 - Viewed Files): 10 tasks
- Phase 6 (US4 - Keyboard): 12 tasks
- Phase 7 (US5 - GitHub PR): 8 tasks
- Phase 8 (US6 - TUI): 15 tasks
- Phase 9 (File Watching): 7 tasks
- Phase 10 (Polish): 24 tasks

**MVP Scope**: User Story 1 only (14 tasks after foundation)

**Parallel Opportunities**:

- Phase 2 has 13 parallelizable tasks
- User Stories 2, 3, 4 can be developed in parallel after US1
- User Stories 5, 6 can be developed in parallel after US1

**Independent Test Criteria**:

- US1: Run `difit` in git repo with changes, see diffs in browser
- US2: Click line number, add comment, verify persistence after reload
- US3: Click checkboxes, see progress bar update, verify persistence
- US4: Use only keyboard (j/k, n/p, v, c) to navigate entire UI
- US5: Run `difit --pr <url>` and see PR diff loaded
- US6: Run `difit --tui` and navigate with keyboard-only controls
