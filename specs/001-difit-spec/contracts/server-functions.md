# Dioxus Fullstack Server Functions

This document defines the server functions for the difit application using Dioxus fullstack.

## Overview

Dioxus fullstack uses `#[server]` functions instead of traditional REST APIs. These functions are callable from both the frontend and backend, with automatic serialization/deserialization.

## Server Functions

### Diff Operations

```rust
use dioxus::prelude::*;

/// Get diff data between two revisions
#[server(GetDiff, endpoint = "/api/diff")]
pub async fn get_diff(
    old_revision: String,
    new_revision: String,
) -> Result<Vec<DiffFile>, ServerFnError> {
    // Implementation
}

/// Get available branches and commits
#[server(GetRevisions, endpoint = "/api/revisions")]
pub async fn get_revisions() -> Result<RevisionInfo, ServerFnError> {
    // Implementation
}

/// Get repository status (for file watching)
#[server(GetRepoStatus, endpoint = "/api/status")]
pub async fn get_repo_status() -> Result<RepoStatus, ServerFnError> {
    // Implementation
}
```

### Comment Operations

```rust
/// Get all comments for a specific diff context
#[server(GetComments, endpoint = "/api/comments")]
pub async fn get_comments(
    repo_path: String,
    base_sha: String,
    target_sha: String,
) -> Result<Vec<Comment>, ServerFnError> {
    // Implementation
}

/// Add a new comment
#[server(AddComment, endpoint = "/api/comments/add")]
pub async fn add_comment(
    file_path: String,
    body: String,
    side: String,
    start_line: u32,
    end_line: Option<u32>,
    repo_path: String,
    base_sha: String,
    target_sha: String,
) -> Result<Comment, ServerFnError> {
    // Implementation
}

/// Update an existing comment
#[server(UpdateComment, endpoint = "/api/comments/update")]
pub async fn update_comment(
    id: String,
    body: String,
) -> Result<Comment, ServerFnError> {
    // Implementation
}

/// Delete a comment
#[server(DeleteComment, endpoint = "/api/comments/delete")]
pub async fn delete_comment(
    id: String,
) -> Result<(), ServerFnError> {
    // Implementation
}
```

### Viewed Files Operations

```rust
/// Get all viewed files for a diff context
#[server(GetViewedFiles, endpoint = "/api/viewed")]
pub async fn get_viewed_files(
    repo_path: String,
    base_sha: String,
    target_sha: String,
) -> Result<Vec<ViewedFileRecord>, ServerFnError> {
    // Implementation
}

/// Mark a file as viewed
#[server(MarkFileViewed, endpoint = "/api/viewed/mark")]
pub async fn mark_file_viewed(
    file_path: String,
    repo_path: String,
    base_sha: String,
    target_sha: String,
    diff_content_hash: String,
) -> Result<ViewedFileRecord, ServerFnError> {
    // Implementation
}

/// Mark a file as unviewed
#[server(MarkFileUnviewed, endpoint = "/api/viewed/unmark")]
pub async fn mark_file_unviewed(
    file_path: String,
    repo_path: String,
    base_sha: String,
    target_sha: String,
) -> Result<(), ServerFnError> {
    // Implementation
}
```

### Preferences Operations

```rust
/// Get user preferences
#[server(GetPreferences, endpoint = "/api/preferences")]
pub async fn get_preferences() -> Result<Vec<(String, String)>, ServerFnError> {
    // Implementation
}

/// Get a specific preference
#[server(GetPreference, endpoint = "/api/preference")]
pub async fn get_preference(
    key: String,
) -> Result<Option<String>, ServerFnError> {
    // Implementation
}

/// Set a preference
#[server(SetPreference, endpoint = "/api/preference/set")]
pub async fn set_preference(
    key: String,
    value: String,
) -> Result<(), ServerFnError> {
    // Implementation
}

/// Delete a preference
#[server(DeletePreference, endpoint = "/api/preference/delete")]
pub async fn delete_preference(
    key: String,
) -> Result<(), ServerFnError> {
    // Implementation
}
```

## File Watching Stream

```rust
use dioxus::prelude::*;
use futures::Stream;

/// Stream of file system changes for real-time updates
/// Uses Dioxus fullstack streaming support
#[server(FileWatchStream, endpoint = "/api/watch/stream")]
pub async fn file_watch_stream() -> Result<impl Stream<Item = FileChangeEvent>, ServerFnError> {
    // Implementation using tokio-stream
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FileChangeEvent {
    pub change_type: ChangeType,
    pub file_path: String,
    pub timestamp: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ChangeType {
    Modified,
    Created,
    Deleted,
    GitIndexChanged,
}
```

## GitHub Integration

```rust
/// Fetch PR information from GitHub
#[server(FetchPullRequest, endpoint = "/api/github/pr")]
pub async fn fetch_pull_request(
    owner: String,
    repo: String,
    pr_number: u64,
) -> Result<PullRequestInfo, ServerFnError> {
    // Implementation - server-side only, can use reqwest here
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PullRequestInfo {
    pub base_sha: String,
    pub head_sha: String,
    pub title: String,
    pub description: String,
}
```

## Error Handling

All server functions return `Result<T, ServerFnError>`. Errors are serialized and sent to the client.

```rust
// Custom error types can be converted to ServerFnError
impl From<git::Error> for ServerFnError {
    fn from(err: git::Error) -> Self {
        ServerFnError::new(err.to_string())
    }
}

impl From<sqlx::Error> for ServerFnError {
    fn from(err: sqlx::Error) -> Self {
        ServerFnError::new(format!("Database error: {}", err))
    }
}
```

## Usage in Components

```rust
#[component]
fn DiffView() -> Element {
    let diff_data = use_resource(|| async {
        get_diff("HEAD~1".to_string(), "HEAD".to_string()).await
    });

    match &*diff_data.read() {
        Some(Ok(files)) => rsx! { /* render diff */ },
        Some(Err(e)) => rsx! { "Error: {e}" },
        None => rsx! { "Loading..." },
    }
}
```
