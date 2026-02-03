# Data Model

This document defines the data models for the difit application based on the entities from the spec.

## Domain Models

```rust
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

/// Represents a file in the diff
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DiffFile {
    /// File path
    pub path: String,
    /// Previous file path (for renamed files)
    pub old_path: Option<String>,
    /// File status
    pub status: FileStatus,
    /// Number of additions
    pub additions: u32,
    /// Number of deletions
    pub deletions: u32,
    /// Diff chunks for this file
    pub chunks: Vec<DiffChunk>,
    /// Whether the file is generated
    pub is_generated: bool,
}

/// Represents a contiguous block of changes
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DiffChunk {
    /// Chunk header (e.g., "@@ -1,5 +1,6 @@")
    pub header: String,
    /// Starting line number in the old version
    pub old_start: u32,
    /// Number of lines in the old version
    pub old_lines: u32,
    /// Starting line number in the new version
    pub new_start: u32,
    /// Number of lines in the new version
    pub new_lines: u32,
    /// Lines in this chunk
    pub lines: Vec<DiffLine>,
}

/// Represents a single line in the diff
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DiffLine {
    /// Type of line (addition, deletion, or normal)
    pub line_type: LineType,
    /// Line content
    pub content: String,
    /// Line number in the old version (if applicable)
    pub old_line_number: Option<u32>,
    /// Line number in the new version (if applicable)
    pub new_line_number: Option<u32>,
}

/// User comment on a diff
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Comment {
    /// Unique identifier for the comment
    pub id: String,
    /// File path where the comment is attached
    pub file_path: String,
    /// Comment body
    pub body: String,
    /// Side of the diff (old or new)
    pub side: Side,
    /// Line range (single line or range)
    pub line: LineRange,
    /// Creation timestamp
    pub created_at: DateTime<Utc>,
    /// Last update timestamp
    pub updated_at: DateTime<Utc>,
    /// Code snapshot at the time of comment
    pub code_snapshot: Option<CodeSnapshot>,
    /// Repository path for context
    pub repo_path: String,
    /// Base commit SHA
    pub base_sha: String,
    /// Target commit SHA
    pub target_sha: String,
}

/// Tracks viewed state for a file
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ViewedFileRecord {
    /// File path
    pub file_path: String,
    /// Repository path
    pub repo_path: String,
    /// Base commit SHA
    pub base_sha: String,
    /// Target commit SHA
    pub target_sha: String,
    /// Timestamp when the file was viewed
    pub viewed_at: DateTime<Utc>,
    /// SHA-256 hash of the diff content
    pub diff_content_hash: String,
}

/// Git revision information
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RevisionInfo {
    /// Special options used for the diff
    pub special_options: Vec<String>,
    /// Branches involved in the diff
    pub branches: Vec<BranchInfo>,
    /// Commits involved in the diff
    pub commits: Vec<CommitInfo>,
}

/// Line range (single line or range)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LineRange {
    /// Start line number
    pub start: u32,
    /// End line number (inclusive)
    pub end: Option<u32>,
}

/// Code snapshot at a specific point in time
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CodeSnapshot {
    /// File content
    pub content: String,
    /// Programming language for syntax highlighting
    pub language: Option<String>,
}

/// Branch information
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BranchInfo {
    /// Branch name
    pub name: String,
    /// Commit hash
    pub commit_hash: String,
    /// Is the branch current
    pub is_current: bool,
}

/// Commit information
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CommitInfo {
    /// Commit hash
    pub hash: String,
    /// Short commit hash (7 chars)
    pub short_hash: String,
    /// Commit message
    pub message: String,
    /// Timestamp
    pub timestamp: DateTime<Utc>,
}

/// File status enum
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum FileStatus {
    Modified,
    Added,
    Deleted,
    Renamed,
}

/// Line type enum
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum LineType {
    Add,
    Delete,
    Normal,
}

/// Side enum
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum Side {
    Old,
    New,
}
```

## Database Models (SQLite with sqlx)

The following models are used for SQLite database persistence via sqlx.

```rust
use sqlx::FromRow;
use chrono::{DateTime, Utc};

/// Database record for comments
#[derive(Debug, Clone, FromRow)]
pub struct CommentRecord {
    pub id: String,
    pub file_path: String,
    pub body: String,
    pub side: String,  -- 'old' or 'new'
    pub start_line: i64,
    pub end_line: Option<i64>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub repo_path: String,
    pub base_sha: String,
    pub target_sha: String,
}

/// Database record for viewed files
#[derive(Debug, Clone, FromRow)]
pub struct ViewedFileRecord {
    pub id: i64,
    pub file_path: String,
    pub repo_path: String,
    pub base_sha: String,
    pub target_sha: String,
    pub viewed_at: DateTime<Utc>,
    pub diff_content_hash: String,
}

/// Database record for user preferences
#[derive(Debug, Clone, FromRow)]
pub struct PreferenceRecord {
    pub key: String,
    pub value: String,
    pub updated_at: DateTime<Utc>,
}
```

## Database Schema

```sql
-- Enable foreign keys
PRAGMA foreign_keys = ON;

-- Comments table: stores user comments on diffs
CREATE TABLE IF NOT EXISTS comments (
    id TEXT PRIMARY KEY,
    file_path TEXT NOT NULL,
    body TEXT NOT NULL,
    side TEXT NOT NULL CHECK(side IN ('old', 'new')),
    start_line INTEGER NOT NULL,
    end_line INTEGER,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    repo_path TEXT NOT NULL,
    base_sha TEXT NOT NULL,
    target_sha TEXT NOT NULL
);

-- Index for querying comments by repository context
CREATE INDEX IF NOT EXISTS idx_comments_context
ON comments(repo_path, base_sha, target_sha);

-- Index for querying comments by file
CREATE INDEX IF NOT EXISTS idx_comments_file
ON comments(file_path, repo_path, base_sha, target_sha);

-- Viewed files table: tracks which files have been marked as viewed
CREATE TABLE IF NOT EXISTS viewed_files (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    file_path TEXT NOT NULL,
    repo_path TEXT NOT NULL,
    base_sha TEXT NOT NULL,
    target_sha TEXT NOT NULL,
    viewed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    diff_content_hash TEXT NOT NULL,
    UNIQUE(file_path, repo_path, base_sha, target_sha)
);

-- Index for querying viewed files by context
CREATE INDEX IF NOT EXISTS idx_viewed_context
ON viewed_files(repo_path, base_sha, target_sha);

-- Preferences table: stores user preferences
CREATE TABLE IF NOT EXISTS preferences (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Enable WAL mode for better concurrency
PRAGMA journal_mode = WAL;
```

## Type Conversions

```rust
impl From<CommentRecord> for Comment {
    fn from(record: CommentRecord) -> Self {
        Comment {
            id: record.id,
            file_path: record.file_path,
            body: record.body,
            side: match record.side.as_str() {
                "old" => Side::Old,
                "new" => Side::New,
                _ => Side::New, // default
            },
            line: LineRange {
                start: record.start_line as u32,
                end: record.end_line.map(|v| v as u32),
            },
            created_at: record.created_at,
            updated_at: record.updated_at,
            code_snapshot: None, // Loaded separately if needed
            repo_path: record.repo_path,
            base_sha: record.base_sha,
            target_sha: record.target_sha,
        }
    }
}

impl From<ViewedFileRecord> for ViewedFileRecord {
    fn from(record: ViewedFileRecord) -> Self {
        ViewedFileRecord {
            file_path: record.file_path,
            repo_path: record.repo_path,
            base_sha: record.base_sha,
            target_sha: record.target_sha,
            viewed_at: record.viewed_at,
            diff_content_hash: record.diff_content_hash,
        }
    }
}
```
