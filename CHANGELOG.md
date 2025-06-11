# Changelog

## Version 0.2.0

### Changed
- Replace `selectLineUp` and `selectLineDown` with `cursorUp` and `cursorDown`.

### Added
- Add `select` boolean argument to `cursorUp` and `cursorDown` to enable text selection in addition to cursor movement.
- Add `amountPercent` integer argument to `cursorUp` and `cursorDown` that allows specifying amount as a percentage of the active file size.
- Add `amountMin` and `amountMax` to `cursorUp` and `cursorDown` to provide a way to keep the amount in percent in a certain range regardless of file size.

## Version 0.1.0

### Added
- Alternative sidebar visibility toggle that hides activity bar as well.

## Version 0.0.5

### Added
- Multi-state folding. Folds/unfolds differently based on how many times the command is triggered.
- Descriptions for the commands in the README file.

### Removed
- Commands can no longer be triggered from the command palette.

## Version 0.0.4

### Added
- Test folding capabilities with remote workspaces when running locally.

## Version 0.0.3

### Added
- Now scrolls if selecting outside the visible part of the document.

## Version 0.0.2

### Added
- Include default keyboard shortcuts for line selection.

### Changed
- Refine line selection.

## Version 0.0.1

### Added
- Crude implementation of line selection.
