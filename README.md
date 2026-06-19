# Latte

Advanced Latte template syntax highlighting for Visual Studio Code, with Neon support and snippets included.

This extension is inspired by the original [Kasik96.latte Marketplace extension](https://marketplace.visualstudio.com/items?itemName=Kasik96.latte) and focuses on modern, PHP-aware Latte highlighting for real-world templates.

## Features

- Advanced `.latte` syntax highlighting for Latte tags, expressions, filters, functions, comments, type annotations, dynamic tags, and embedded PHP-like expressions.
- PHP-aware attribute highlighting for `n:` attributes, smart Latte attributes, curly attributes, and regular HTML attribute interpolation.
- Alpine.js support for `x-*`, shorthand `:class`, event listeners like `@click`, modifiers like `@click.prevent`, and JavaScript highlighting inside Alpine attribute values.
- Latte interpolation inside JavaScript and Alpine expressions.
- Neon syntax highlighting for `.neon` files.
- Latte snippets for blocks, loops, conditionals, includes, forms, filters, type tags, and common template helpers.
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

## Not Included

This extension provides syntax highlighting, language configuration, Emmet defaults, and snippets. It does not include a formatter, language server, diagnostics, completion engine, or runtime framework integration.

## Credits

Inspired by [Kasik96.latte](https://marketplace.visualstudio.com/items?itemName=Kasik96.latte).

The Latte template engine is part of the [Nette](https://nette.org/) ecosystem.

## License

MIT
