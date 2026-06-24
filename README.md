# Nette Latte extension for VS Code

Advanced Latte template syntax highlighting for Visual Studio Code, with Neon support and snippets included.

This extension is inspired by the original [Kasik96.latte Marketplace extension](https://marketplace.visualstudio.com/items?itemName=Kasik96.latte) and focuses on modern, PHP-aware Latte highlighting for real-world templates.

## Features

- Advanced `.latte` syntax highlighting for Latte tags, expressions, filters, functions, comments, type annotations, dynamic tags, and embedded PHP-like expressions.
- PHP-aware attribute highlighting for `n:` attributes, smart Latte attributes, curly attributes, and regular HTML attribute interpolation.
- Alpine.js support for `x-*`, shorthand `:class`, event listeners like `@click`, modifiers like `@click.prevent`, and JavaScript highlighting inside Alpine attribute values.
- Latte interpolation inside JavaScript and Alpine expressions.
- Neon syntax highlighting for `.neon` files.
- Latte snippets for blocks, loops, conditionals, includes, forms, filters, type tags, and common template helpers.
- PHP-aware IntelliSense for typed Latte variables from `{parameters}`, `{varType}`, and `{templateType}`.
- Cmd/Ctrl-click and hover for Latte template file references, including Barista-style path aliases.
- Editor support for Latte comments, bracket matching, region folding, and HTML Emmet abbreviations in `.latte` files.

## Examples

```latte
<a
	n:class="button, $variant ? 'button--' . $variant, $class"
	n:attr="href: $href, target: $target, ...$attr"
	:class="{ active: open }"
	@click.prevent="copyToClipboard({ text: {_('copy.label')} })"
	href="/{$slug}"
>
	{$title|noescape}
</a>
```

## Path Aliases

If your project uses [Barista](https://github.com/jan-herman/kirby-barista) template path aliases, mirror the string aliases in VS Code settings:

```json
{
	"latte.pathAliases": {
		"@components": "site/snippets/components",
		"@snippets": "site/snippets",
		"@templates": "${workspaceFolder}/site/templates"
	}
}
```

Alias targets may be:

- workspace-relative paths, such as `site/snippets/components`
- absolute paths, such as `/Users/me/project/site/snippets`
- paths using `${workspaceFolder}`, such as `${workspaceFolder}/site/templates`

Currently `${workspaceFolder}` is the only supported replacement variable. Callable Barista aliases cannot be evaluated by VS Code, so add explicit string mappings for paths you want to navigate.

## Not Included

This extension does not include a formatter, diagnostics, or full Latte language server. Runtime features are intentionally focused on PHP-aware completion, hover, and navigation.

## Credits

Inspired by [Kasik96.latte](https://marketplace.visualstudio.com/items?itemName=Kasik96.latte).

The Latte template engine is part of the [Nette](https://nette.org/) ecosystem.

## License

MIT
