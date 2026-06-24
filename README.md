# Nette Latte extension for VS Code

Complete Latte support for VS Code: full-featured syntax highlighting, comprehensive grammar coverage, and PHP-aware IntelliSense.

## Features

### Syntax Highlighting

Full grammar support for `.latte` and `.neon` files.

- PHP-aware attribute highlighting for `n:` attributes, smart Latte attributes, curly attributes, and regular HTML attribute interpolation.
- Alpine.js support for `x-*`, shorthand `:class`, event listeners like `@click`, modifiers like `@click.prevent`, and JavaScript highlighting inside Alpine attribute values.
- Latte interpolation inside JavaScript and Alpine expressions.

### PHP-Aware IntelliSense

PHP-aware IntelliSense is adapted from [smuuf/vscode-latte-lang](https://github.com/smuuf/vscode-latte-lang) by Přemysl Karbula.

Set `latte.intelliSense.enabled` to `false` to disable the runtime and use this extension for syntax highlighting only. Reload VS Code after changing this setting.

- Class-based declaration of template variables via Latte tags such as `{templateType My\Lovely\Type}`. See the [Latte type system docs](https://latte.nette.org/en/type-system) for detailed usage.
- Go to variable definitions for variables defined in Latte files.
- Go to class definitions for typed variables in Latte files.
- Go to method definitions for methods called on typed variables in Latte files.
- Go to referenced Latte files used in `{include ...}`, `{layout ...}`, `{sandbox ...}`, and `{extends ...}` tags.
- Hover information for variable types in Latte files.
- Hover information for return types of method calls in Latte files.
- Type inference for values coming from known method calls with known return types.
- Type resolution for basic iterables. For example, in `{foreach $a as $b}`, when `$a` is `array<MyType>`, `$b` is inferred as `MyType`.
- Autocomplete support for `$variables` and `$object->methodName()` in Latte files.

### Snippets

Snippets for blocks, loops, includes, forms, filters, `n:` attributes, and common template helpers.

### Native Editor Features

- Region folding with `{* #region *}` and `{* #endregion *}`.
- HTML Emmet completions work out of the box in `.latte` files.
- Bracket matching for `{` and `}` tag pairs.
- Toggle comments with the standard `Ctrl+/` shortcut.

## Path Aliases

If your project uses [Barista](https://github.com/jan-herman/kirby-barista) template path aliases, mirror the string aliases in VS Code settings:

```json
{
	"latte.intelliSense.pathAliases": {
		"@components": "site/snippets/components",
		"@snippets": "site/snippets",
		"@templates": "${workspaceFolder}/site/templates",
		"@blocks": "src/blocks/${relativePath}",
		"@blockTemplates": "src/blocks/${relativePathWithoutExtension}.template.latte"
	}
}
```

Alias targets may be:

- workspace-relative paths, such as `site/snippets/components`
- absolute paths, such as `/Users/me/project/site/snippets`
- paths using `${workspaceFolder}`, such as `${workspaceFolder}/site/templates`
- paths using `${relativePath}`, such as `src/blocks/${relativePath}`
- paths using `${relativePathWithoutExtension}`, such as `src/blocks/${relativePathWithoutExtension}.template.latte`

`${relativePath}` is the normalized path segment after the matched alias, with leading and trailing slashes removed. For example, `{embed '@blocks/block-name'}` with `"@blocks": "src/blocks/${relativePath}"` resolves to `src/blocks/block-name.latte`.

`${relativePathWithoutExtension}` is the same normalized path segment with the final file extension removed. For example, both `{embed '@blocks/block-name'}` and `{embed '@blocks/block-name.latte'}` can resolve to `src/blocks/block-name.template.latte` with `"@blocks": "src/blocks/${relativePathWithoutExtension}.template.latte"`.

Supported replacement variables are `${workspaceFolder}`, `${relativePath}`, and `${relativePathWithoutExtension}`. Callable Barista aliases cannot be evaluated by VS Code, so add explicit string mappings for paths you want to navigate.

Alias prefixes are matched literally, so symbolic aliases such as `"#": "src/templates/components"` are supported. Without a matching `#` alias, paths like `{include '#button'}` stay treated as Latte block references.

## Not Included

This extension does not include a formatter, diagnostics, or full Latte language server. Runtime features are intentionally focused on PHP-aware completion, hover, and navigation.

## Credits

The PHP-aware runtime is adapted from [smuuf/vscode-latte-lang](https://github.com/smuuf/vscode-latte-lang).

The Neon syntax grammar is derived from [Kasik96.latte](https://marketplace.visualstudio.com/items?itemName=Kasik96.latte).

The Latte template engine is part of the [Nette](https://nette.org/) ecosystem.

This is an independent extension and is not affiliated with or endorsed by the [Latte](https://latte.nette.org/) or [Nette](https://nette.org/) project.

## License

MIT
