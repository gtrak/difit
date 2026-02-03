# Research: difit Technology Stack Decisions

**Date**: 2026-02-03  
**Feature**: difit - Git Diff Viewer Application  
**Researcher**: Implementation Planning Agent

---

## Overview

This document consolidates research findings for all technical decisions. All NEEDS CLARIFICATION items have been resolved.

---

## Decisions

### D1: Rust UI Framework Selection

**Decision**: Use **Dioxus 0.7+ fullstack** for Web UI

**Rationale**:

- Dioxus fullstack provides both frontend and backend in a unified framework
- Server-side rendering with server functions eliminates need for separate HTTP framework
- Streams support for real-time updates (file watching)
- React-like component model with hooks and state management
- Single codebase for frontend and backend logic

**Key Features for difit**:

- `#[server]` functions for API endpoints
- `dioxus::prelude::use_resource` for async data fetching
- Built-in streaming support for Server-Sent Events
- Hot-reload for development

**Alternatives Considered**:

- **Axum + separate Dioxus**: More complex, requires maintaining two interfaces
- **Leptos**: Good fullstack support, but smaller ecosystem
- **Yew**: Web-only, no fullstack

**Why Dioxus Fullstack Chosen**: Unified framework reduces complexity and maintenance burden.

---

### D2: Git Operations Library

**Decision**: Use **gix (gitoxide)** - Pure Rust git operations

**Rationale**:

- Pure Rust implementation with excellent performance
- All required operations are stable and production-ready:
  - ✅ Repository discovery
  - ✅ Diff generation (tree/tree, tree/worktree)
  - ✅ Line-by-line diffs via imara-diff
  - ✅ Reference resolution (branches, tags, HEAD)
  - ✅ Rev-parse and rev-walk
  - ✅ Status checking (index/worktree differences)
  - ✅ Untracked file detection
- Better performance than git2 for most operations
- Type-safe API with good error handling

**Alternatives Considered**:

- **git2-rs**: Mature but requires libgit2 C dependency; gix is pure Rust
- **Command-line git**: Subprocess spawning; more fragile

**Why gix Chosen**: Pure Rust, excellent performance, all required features stable.

---

### D3: Web Server Framework

**Decision**: Use **Dioxus fullstack server functions** (replaces separate web framework)

**Rationale**:

- Dioxus fullstack includes built-in server capabilities
- `#[server]` macro creates API endpoints automatically
- No need for Axum or separate HTTP framework
- Seamless integration with frontend components
- Built-in streaming support for file watching

**Implementation**:

- Server functions replace REST API endpoints
- File watching via async streams
- Static file serving for Dioxus frontend

**Alternatives Considered**:

- **Axum**: Would require separate server crate and HTTP client calls
- **Actix-web**: Similar complexity to Axum

**Why Dioxus Server Chosen**: Eliminates server/client boundary complexity.

---

### D4: Terminal UI Framework

**Decision**: Use **ratatui** (not Dioxus TUI)

**Rationale**:

- Dioxus TUI renderer is experimental and not production-ready
- ratatui is the most mature Rust TUI framework
- Used by popular tools like gitui, bottom, and bandwhich
- Excellent documentation and community

**Integration Challenge**:

- TUI will run as separate mode from web UI
- Shared business logic in `models/` and `git/` modules
- TUI has its own main loop (not integrated with Dioxus backend)

**Alternatives Considered**:

- **Dioxus TUI**: Experimental, not production-ready
- **cursive**: Higher-level, less flexible

**Why ratatui Chosen**: Production-ready, mature, excellent ecosystem.

---

### D5: Async Runtime

**Decision**: Use **Tokio** as the async runtime

**Rationale**:

- Required by Dioxus fullstack
- Excellent file watching support (tokio::fs, notify crate)
- Great ecosystem of compatible libraries
- Mature and battle-tested

---

### D6: Syntax Highlighting

**Decision**: Use **Syntect** for code syntax highlighting

**Rationale**:

- Rust-native syntax highlighting library
- Uses Sublime Text syntax definitions (extensive language support)
- Fast and efficient highlighting
- Can output to HTML for web UI or ANSI colors for TUI
- Battle-tested (used by bat, delta, and other tools)

---

### D7: File Watching Implementation

**Decision**: Use **notify** crate with Tokio integration

**Rationale**:

- Cross-platform file watching (inotify, FSEvents, ReadDirectoryChanges)
- Tokio-compatible async API
- Debouncing support built-in
- Respects .gitignore patterns (integrates with ignore crate)

---

### D8: Storage for Comments and Preferences

**Decision**: Use **SQLite** with **sqlx**

**Rationale**:

- Centralized database for all data (comments, preferences, viewed files)
- ACID compliance and data integrity
- Better query capabilities than JSON files
- Single storage location instead of scattered files
- sqlx provides compile-time checked queries

**Database Schema**:

```sql
-- comments table
CREATE TABLE comments (
    id TEXT PRIMARY KEY,
    file_path TEXT NOT NULL,
    body TEXT NOT NULL,
    side TEXT NOT NULL, -- 'old' or 'new'
    start_line INTEGER NOT NULL,
    end_line INTEGER,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    repo_path TEXT NOT NULL,
    base_sha TEXT NOT NULL,
    target_sha TEXT NOT NULL
);

-- viewed_files table
CREATE TABLE viewed_files (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    file_path TEXT NOT NULL,
    repo_path TEXT NOT NULL,
    base_sha TEXT NOT NULL,
    target_sha TEXT NOT NULL,
    viewed_at TIMESTAMP NOT NULL,
    diff_content_hash TEXT NOT NULL,
    UNIQUE(file_path, repo_path, base_sha, target_sha)
);

-- preferences table
CREATE TABLE preferences (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TIMESTAMP NOT NULL
);
```

**Alternatives Considered**:

- **JSON files**: Simpler but harder to query, no ACID
- **sled**: Embedded KV store, but SQLite has better tooling

**Why SQLite Chosen**: Single-file database, excellent tooling, ACID compliance, sqlx integration.

---

### D9: HTTP Client

**Decision**: **NO HTTP CLIENT NEEDED**

**Rationale**:

- Dioxus fullstack eliminates need for separate HTTP client
- Server functions handle all backend communication
- For GitHub API (if needed), can use reqwest only in server functions
- No client-side HTTP calls needed

---

### D10: Testing Framework

**Decision**: Use **cargo test** with **rstest** for parameterized tests

**Rationale**:

- cargo test is Rust's built-in testing framework
- rstest provides fixtures and parameterized test support
- sqlx provides test transactions for database tests
- Mocking with **mockall** for git operations

---

## Summary Table

| Technology          | Choice                   | Status     |
| ------------------- | ------------------------ | ---------- |
| UI Framework (Web)  | Dioxus 0.7+ fullstack    | ✅ Decided |
| UI Framework (TUI)  | ratatui                  | ✅ Decided |
| Git Library         | gix (gitoxide)           | ✅ Decided |
| Web Server          | Dioxus server functions  | ✅ Decided |
| Async Runtime       | Tokio                    | ✅ Decided |
| Syntax Highlighting | Syntect                  | ✅ Decided |
| File Watching       | notify + tokio           | ✅ Decided |
| Storage             | SQLite + sqlx            | ✅ Decided |
| HTTP Client         | None (built into Dioxus) | ✅ Decided |
| Testing             | cargo test + rstest      | ✅ Decided |

---

## Risks and Mitigations

| Risk                           | Impact | Mitigation                                         |
| ------------------------------ | ------ | -------------------------------------------------- |
| Dioxus fullstack maturity      | Medium | Use stable features, avoid cutting-edge APIs       |
| gix API changes                | Low    | Pin to stable version, gix is approaching 1.0      |
| ratatui integration complexity | Medium | Keep TUI modular, shared logic in separate modules |
| SQLite concurrency             | Low    | Single-user tool, WAL mode for better concurrency  |

---

## References

- [Dioxus Fullstack Documentation](https://dioxuslabs.com/learn/0.7/essentials/fullstack/)
- [Dioxus Streams](https://dioxuslabs.com/learn/0.7/essentials/fullstack/streams/)
- [gix Documentation](https://docs.rs/gix/)
- [gix Crate Status](https://github.com/GitoxideLabs/gitoxide/blob/main/crate-status.md)
- [ratatui Documentation](https://docs.rs/ratatui/)
- [sqlx Documentation](https://docs.rs/sqlx/)
- [Syntect Documentation](https://docs.rs/syntect/)
