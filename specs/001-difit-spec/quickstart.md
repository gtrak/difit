# difit Quickstart Guide

## Installation

### Prerequisites

- Rust toolchain 1.93+ (install via [rustup](https://rustup.rs/))
- Git installed on your system
- SQLite (usually pre-installed on most systems)

### Install from crates.io

```bash
cargo install difit
```

### Build from Source

```bash
git clone https://github.com/anomalyco/difit.git
cd difit
cargo build --release
./target/release/difit
```

## Basic Usage

### View Local Uncommitted Changes

```bash
difit
```

### View Staged Changes Only

```bash
difit staged
```

### View All Uncommitted Changes (staged + unstaged)

```bash
difit .
```

### Compare Specific Commits

```bash
difit HEAD~1 HEAD
```

### View GitHub Pull Requests

```bash
difit --pr https://github.com/user/repo/pull/123
```

### Pipe Mode from stdin

```bash
git diff | difit --stdin
```

## Command Line Options

```
difit [OPTIONS] [BASE] [TARGET]

ARGUMENTS:
  [BASE]           Base revision (default: HEAD)
  [TARGET]         Target revision (default: working directory)

OPTIONS:
  -h, --help                Show help information
  -V, --version             Show version information
      --pr <URL>            View GitHub pull request
      --port <PORT>         Specify port for web server [default: 8080]
      --host <HOST>         Specify host for web server [default: 127.0.0.1]
      --no-open             Do not open browser automatically
      --tui                 Launch terminal UI mode (ratatui)
      --clean               Clear existing comments on startup
      --include-untracked   Include untracked files in diff
      --mode <MODE>         Default view mode: side-by-side or inline
      --stdin               Read unified diff from stdin
```

## Web UI Navigation

### Side-by-side vs Inline View

- Toggle between views using the view mode buttons in the toolbar
- Side-by-side shows old and new versions in parallel columns
- Inline shows changes in unified format (like `git diff`)

### Adding Comments

1. Click on a line number to add a comment
2. Type your comment in the text input that appears
3. Click "Save" to store the comment

### Copying AI Prompts

1. After adding a comment, click "Copy Prompt" to copy the formatted prompt
2. Format: `{filepath}:L{line}\n{comment}`
3. Click "Copy All" to copy all comments with separators

### Marking Files as Viewed

- Click the checkbox next to each file to mark as viewed
- Progress bar shows "X of Y files viewed"
- Generated and deleted files are auto-marked as viewed

### Keyboard Shortcuts

| Key              | Action                              |
| ---------------- | ----------------------------------- |
| `j` / Down Arrow | Move to next line                   |
| `k` / Up Arrow   | Move to previous line               |
| `n`              | Jump to next changed chunk          |
| `p`              | Jump to previous changed chunk      |
| `]`              | Jump to next file                   |
| `[`              | Jump to previous file               |
| `h` / `l`        | Switch side in side-by-side mode    |
| `v`              | Toggle viewed state of current file |
| `c`              | Create comment at current line      |
| `Shift+N`        | Jump to next comment                |
| `Shift+P`        | Jump to previous comment            |
| `?`              | Show keyboard shortcuts help        |

## Terminal UI (TUI) Mode

### Launch TUI Mode

```bash
difit --tui
```

The TUI mode uses **ratatui** for rendering and provides a terminal-native interface.

### Navigation Controls

| Key          | Action                                   |
| ------------ | ---------------------------------------- |
| `Tab`        | Navigate between file list and diff view |
| `Enter`      | View diff for selected file              |
| `j` / `k`    | Move up/down in lists                    |
| `h` / `l`    | Navigate between panels                  |
| `r`          | Refresh diff (reload from git)           |
| `v`          | Mark file as viewed                      |
| `q` / Ctrl+C | Exit TUI                                 |

### Key Bindings (Diff View)

| Key       | Action            |
| --------- | ----------------- |
| `j` / `k` | Scroll up/down    |
| `gg`      | Go to top         |
| `G`       | Go to bottom      |
| `n`       | Next change       |
| `p`       | Previous change   |
| `r`       | Refresh diff      |
| `q`       | Back to file list |

## Configuration

### Environment Variables

```bash
# GitHub API token (for fetching PRs)
export GITHUB_TOKEN="your_github_token"

# Alternative: GitHub CLI authentication
# difit will automatically use `gh auth token` if available
```

### Database Location

Comments and preferences are stored in a SQLite database:

- **Linux/macOS**: `~/.local/share/difit/difit.db`
- **Windows**: `%LOCALAPPDATA%\difit\difit.db`

### Preferences

Stored in SQLite `preferences` table:

| Key                  | Description              | Default        |
| -------------------- | ------------------------ | -------------- |
| `view_mode`          | Default view mode        | `side-by-side` |
| `theme`              | UI theme                 | `default`      |
| `keyboard_shortcuts` | Enable/disable shortcuts | `true`         |

## Tips and Best Practices

### Workflow Suggestions

- Use `difit` without arguments to review uncommitted changes before committing
- Use `difit staged` to review what's about to be committed
- Use `difit HEAD~1 HEAD` to review the last commit
- Use `difit .` to see all uncommitted changes including staged and unstaged

### Performance Tips

- Large diffs (>10MB files) are handled gracefully with truncation warnings
- File watching automatically refreshes the view when files change
- Use `--clean` to clear old comments when starting a fresh review session

### Troubleshooting Common Issues

- **Port already in use**: The tool will automatically find an available port
- **GitHub API errors**: Ensure `GITHUB_TOKEN` is set or `gh` CLI is authenticated
- **TUI rendering issues**: Ensure your terminal supports Unicode and 256 colors
- **Database locked**: Close other instances of difit before running

## Technology Stack

- **Web UI**: Dioxus 0.7+ fullstack (server-side rendering)
- **TUI**: ratatui (terminal UI framework)
- **Git Operations**: gix (pure Rust gitoxide)
- **Storage**: SQLite with sqlx
- **Syntax Highlighting**: Syntect
- **File Watching**: notify + Tokio

## Building from Source

### Development Build

```bash
cargo build
```

### Release Build

```bash
cargo build --release
```

### Running Tests

```bash
cargo test
```

### Features

```bash
# Build with only TUI (no web dependencies)
cargo build --no-default-features --features tui

# Build web-only (for deployment)
cargo build --no-default-features --features web
```
