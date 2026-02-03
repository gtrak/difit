/* eslint-disable react-hooks/refs */
// @floating-ui/react uses callback refs which trigger false positives in react-hooks/refs rule
import {
  useFloating,
  autoUpdate,
  offset,
  flip,
  shift,
  useHover,
  useClick,
  useFocus,
  useDismiss,
  useRole,
  useInteractions,
  FloatingFocusManager,
  FloatingPortal,
  safePolygon,
} from '@floating-ui/react';
import { ChevronDown, GitCommit } from 'lucide-react';
import { useState } from 'react';

export interface CommitInRange {
  hash: string;
  shortHash: string;
  message: string;
  author: string;
  date: string;
}

interface CommitSelectorProps {
  commits: CommitInRange[];
  selectedCommit: string | null; // hash of currently selected commit for single-commit view
  onSelectCommit: (commitHash: string | null) => void; // null means "view full range"
  disabled?: boolean;
}

export function CommitSelector({
  commits,
  selectedCommit,
  onSelectCommit,
  disabled = false,
}: CommitSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    middleware: [offset(4), flip(), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
  });

  const hover = useHover(context, {
    handleClose: safePolygon(),
  });
  const click = useClick(context);
  const focus = useFocus(context);
  const dismiss = useDismiss(context);
  const role = useRole(context);

  const { getReferenceProps, getFloatingProps } = useInteractions([
    hover,
    click,
    focus,
    dismiss,
    role,
  ]);

  const getDisplayText = () => {
    if (!selectedCommit) {
      return 'All commits';
    }
    const commit = commits.find((c) => c.hash === selectedCommit || c.shortHash === selectedCommit);
    if (commit) {
      return `${commit.shortHash} - ${commit.message}`;
    }
    return selectedCommit.substring(0, 7);
  };

  const handleSelect = (commitHash: string | null) => {
    onSelectCommit(commitHash);
    setIsOpen(false);
  };

  const getItemClasses = (highlighted: boolean, isDisabled: boolean) => {
    const highlightClasses =
      highlighted ?
        'bg-diff-selected-bg border-l-4 border-l-diff-selected-border font-semibold pl-2'
      : '';
    const hoverClasses =
      highlighted ?
        'hover:bg-diff-selected-bg focus:bg-diff-selected-bg'
      : 'hover:bg-github-bg-tertiary focus:bg-github-bg-tertiary';
    const cursorClasses = isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';

    return [
      'w-full text-left px-3 py-2 text-xs focus:outline-none transition-colors',
      hoverClasses,
      highlightClasses,
      cursorClasses,
    ].join(' ');
  };

  // Calculate initial focus index
  const getInitialFocusIndex = (): number => {
    if (!selectedCommit) return 0;
    const index = commits.findIndex(
      (c) => c.hash === selectedCommit || c.shortHash === selectedCommit,
    );
    return index !== -1 ? index + 1 : 0; // +1 because "All commits" is at index 0
  };

  if (disabled || commits.length === 0) {
    return null;
  }

  return (
    <>
      <button
        ref={refs.setReference}
        type="button"
        className="flex items-center gap-1.5 cursor-pointer group"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        {...getReferenceProps()}
      >
        <span className="text-xs text-github-text-secondary">View:</span>
        <div className="flex items-center gap-1 px-2 py-1 bg-github-bg-tertiary border border-github-border rounded hover:border-github-text-secondary transition-colors">
          <GitCommit size={14} className="text-github-text-secondary" />
          <code className="text-xs text-github-text-primary max-w-[150px] truncate">
            {getDisplayText()}
          </code>
          <ChevronDown
            size={12}
            className="text-github-text-secondary group-hover:text-github-text-primary transition-colors"
          />
        </div>
      </button>

      {isOpen && (
        <FloatingPortal>
          <FloatingFocusManager
            context={context}
            modal={false}
            initialFocus={getInitialFocusIndex()}
          >
            <div
              ref={refs.setFloating}
              style={floatingStyles}
              className="bg-github-bg-secondary border border-github-border rounded shadow-lg z-50 w-[380px] max-h-[400px] overflow-y-auto"
              {...getFloatingProps()}
            >
              {/* All Commits Option */}
              <div className="border-b border-github-border">
                <div className="px-3 py-2 text-xs font-semibold text-github-text-secondary bg-github-bg-tertiary">
                  Range View
                </div>
                <button
                  onClick={() => handleSelect(null)}
                  className={getItemClasses(!selectedCommit, false)}
                >
                  <div className="flex items-center gap-2">
                    <GitCommit size={14} className="text-github-text-secondary" />
                    <span className="text-github-text-primary">All commits</span>
                    <span className="text-xs text-github-text-muted">
                      ({commits.length} commits)
                    </span>
                  </div>
                </button>
              </div>

              {/* Individual Commits */}
              {commits.length > 0 && (
                <div>
                  <div className="px-3 py-2 text-xs font-semibold text-github-text-secondary bg-github-bg-tertiary">
                    Individual Commits (newest first)
                  </div>
                  {commits.map((commit, index) => (
                    <button
                      key={commit.hash}
                      onClick={() => handleSelect(commit.hash)}
                      className={getItemClasses(
                        selectedCommit === commit.hash || selectedCommit === commit.shortHash,
                        false,
                      )}
                    >
                      <div className="flex items-start gap-2">
                        <div className="flex flex-col items-center gap-0.5 pt-0.5">
                          <span className="text-[10px] text-github-text-muted font-mono">
                            {index + 1}
                          </span>
                          <div className="w-px h-full bg-github-border" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <code className="text-xs text-github-text-primary font-mono whitespace-nowrap">
                              {commit.shortHash}
                            </code>
                            <span className="text-[10px] text-github-text-muted">
                              {commit.author}
                            </span>
                          </div>
                          <span className="text-xs text-github-text-secondary block truncate">
                            {commit.message}
                          </span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </FloatingFocusManager>
        </FloatingPortal>
      )}
    </>
  );
}
