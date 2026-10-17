# Rules

Typescript should be simple and human-readable.

# HTML templates

- Opening tags with more than three attributes must put each attribute on its
  own line, indented four spaces from the tag, and put `>` or `/>` on its own
  line aligned with the tag.
- Count boolean attributes, property bindings, two-way bindings, event handlers,
  and template references as attributes. Preserve their order and values.
- Keep the existing layout for tags with three or fewer attributes.

# Browser verification

- Check UI changes in the internal browser at `http://localhost:4200` first.
- Use Chrome MCP only when network request inspection is needed.

# More info

See [README.md](README.md) for repository instructions.
