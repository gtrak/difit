# Implementation Plan: difit - Git Diff Viewer Application

**Branch**: `001-difit-spec` | **Date**: 2026-02-03 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-difit-spec/spec.md`

## Summary

A Rust/Dioxus CLI tool that displays Git diffs in a GitHub-style viewer interface. Provides both web-based UI (served locally via Dioxus fullstack) and terminal UI (TUI via ratatui) modes. Supports reviewing local git diffs, comparing commits/branches, and fetching GitHub pull request diffs. Key differentiators: AI review comment system with prompt generation, viewed files tracking with SQLite persistence, file-based locking for concurrent access, and keyboard-driven navigation.

**Clarifications Applied**:

- Comments delete when target commit no longer in repository
- File-based locking prevents concurrent write conflicts
- Global SQLite storage at `~/.local/share/difit/`
- Auto-reload only applies to mutable references (HEAD, branches)

## Technical Context

**Language/Version**: Rust 1.93+ with Dioxus 0.7+  
**Primary Dependencies**:

- Dioxus fullstack - Server-side rendering with server functions
- gix (gitoxide) - Pure Rust git operations library
- tokio (async runtime) - for async operations and file watching
- ratatui - Terminal UI framework (Dioxus TUI not production-ready)
- syntect (syntax highlighting) - for code highlighting
- crossterm - Terminal handling for TUI mode
- sqlx - Async SQL toolkit for SQLite with compile-time query checking
  **Storage**: SQLite database at `~/.local/share/difit/difit.db` (global storage, repo-scoped tables)  
  **Testing**: cargo test with rstest for parameterized tests  
  **Target Platform**: Cross-platform CLI tool (Linux, macOS, Windows)  
  **Project Type**: Single CLI application with dual interfaces (Web + TUI)  
  **Performance Goals**:
- <3 seconds from command execution to diff display
- 300ms file change detection and UI update
- Support for diffs up to 10MB files
  **Constraints**:
- Single-user local tool (no multi-user sync)
- Must work offline (except GitHub PR fetching)
- Memory efficient for large diffs
- File-based locking for concurrent tab access
  **Scale/Scope**:
- Single developer local workflow
- Repository-agnostic (works with any git repo)
- Global database shared across all repositories

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Gate                          | Status  | Notes                                                                      |
| ----------------------------- | ------- | -------------------------------------------------------------------------- |
| **G1: Single Responsibility** | ✅ PASS | CLI tool with clear scope: git diff viewing only                           |
| **G2: Test Coverage**         | ✅ PASS | All user stories have independent test paths                               |
| **G3: No Over-Engineering**   | ✅ PASS | Core features (P1/P2) are essential; P3 features are extensions            |
| **G4: Clear Interfaces**      | ✅ PASS | CLI args, server functions, and keyboard shortcuts well-defined            |
| **G5: Error Handling**        | ✅ PASS | Edge cases documented with specific error scenarios including file locking |
| **G6: Documentation**         | ✅ PASS | User stories include acceptance criteria; quickstart will be generated     |

**Constitution Violations**: None identified. The feature follows YAGNI principles with clear scope boundaries.

## Project Structure

### Documentation (this feature)

```text
specs/001-difit-spec/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
# Single CLI application with dual UI modes
src/
├── main.rs              # CLI entry point, argument parsing
├── cli/                 # CLI argument definitions and validation
│   └── args.rs
├── git/                 # Git operations using gix
│   ├── mod.rs
│   ├── diff.rs          # Diff parsing and generation
│   ├── repo.rs          # Repository operations
│   └── github.rs        # GitHub PR fetching (server-side only)
├── web/                 # Dioxus fullstack web UI
│   ├── mod.rs
│   ├── app.rs           # Main web app component
│   ├── server.rs        # Dioxus server functions (replaces separate server)
│   ├── components/      # Reusable UI components
│   │   ├── diff_view.rs
│   │   ├── file_list.rs
│   │   ├── comment_form.rs
│   │   └── progress.rs
│   └── state.rs         # Application state management
├── tui/                 # Terminal UI mode (ratatui, not Dioxus)
│   ├── mod.rs
│   ├── app.rs           # TUI main loop
│   ├── views/           # TUI screens
│   │   ├── file_list.rs
│   │   └── diff_view.rs
│   └── events.rs        # Input handling
├── models/              # Data structures (shared)
│   ├── mod.rs
│   ├── diff.rs          # DiffFile, DiffChunk, DiffLine
│   ├── comment.rs       # Comment, ViewedFileRecord
│   └── revision.rs      # RevisionInfo
└── db/                  # Database layer (SQLite via sqlx)
    ├── mod.rs
    ├── connection.rs    # Database connection with file locking
    ├── lock.rs          # File-based locking for concurrent access
    ├── comments.rs      # Comments repository
    ├── viewed_files.rs  # Viewed files repository
    └── preferences.rs   # User preferences repository

tests/
├── unit/                # Unit tests
├── integration/         # Integration tests
└── contracts/           # API contract tests
```

**Structure Decision**: Single Rust crate with modular architecture. Dioxus fullstack provides both frontend and backend in one framework, eliminating the need for a separate HTTP server. TUI uses ratatui as Dioxus TUI is not production-ready. SQLite provides centralized storage with file-based locking for concurrent access. Comment cleanup is triggered on startup to remove orphaned comments for unreachable commits.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No complexity violations identified. All design decisions align with the spec requirements and maintain simplicity.

## Clarifications Impact

The following clarifications from the spec session impact implementation:

1. **Comment Lifecycle**: Comments are deleted when target commit is no longer reachable (garbage collection)
   - Implementation: Periodic cleanup on startup or background task
   - Check if commits exist using gix before loading comments

2. **Concurrent Access**: File-based locking for SQLite database
   - Implementation: Advisory file lock on database file
   - Other tabs show warning when database is locked

3. **Storage Location**: Global database at `~/.local/share/difit/difit.db`
   - Implementation: XDG directories compliance
   - All repositories share same database, scoped by repo_path + SHAs

4. **File Watching**: Auto-reload only for mutable references
   - Implementation: Check if revision is SHA (fixed) or symbolic ref (mutable)
   - Skip watching for fixed commit SHAs
