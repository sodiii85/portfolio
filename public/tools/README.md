Drop icon files here with these exact names (svg or png, transparent background,
roughly square, at least ~128px if using png). The dock tiles look for them at
`/tools/<file>` and just show an empty dark square until a matching file exists.

- slack.svg
- jira.svg
- confluence.svg
- github.svg
- illustrator.svg
- photoshop.svg
- figma.svg
- claude.svg
- clickup.svg
- linear.svg
- vscode.svg
- framer.svg
- webflow.svg

To rename a file or add/remove a tool, edit the `TOOLS` list in
src/components/cards/ToolCarouselCard.tsx.
