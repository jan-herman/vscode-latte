import DumbTag from '../Scanner/DumbTag'
import { AbstractTag, ParsingContext, Range, TagReferencingTargetFile } from '../types'
import { ArgsParser } from '../argsParser'
import { stripIndentation } from '../../utils/stripIndentation'
import { FILE_REGEX } from '../regexes'
import { resolveTemplatePath } from '../templatePathResolver'

/**
 * Reference: https://github.com/nette/latte/blob/794f252da7437499e467766d633eed85e1a437b7/src/Latte/Essential/CoreExtension.php#L211
 *
 * {include [file] "file" [with blocks] [,] [params]}
 * {include [block] name [,] [params]}
 */
export default class IncludeTag extends AbstractTag implements TagReferencingTargetFile {
	public static DUMB_NAME = 'include'

	constructor(
		range: Range,
		readonly relativePath: string,
		readonly relativePathOffset: integer,
		readonly absolutePath: string | null,
	) {
		super(range)
	}

	static fromDumbTag(
		dumbTag: DumbTag,
		parsingContext: ParsingContext,
	): IncludeTag | null {
		const args = dumbTag.args

		const ap = new ArgsParser(args)
		const type = ap.consumeAnyOfWords('file', 'block')
		const explicitFile = type === 'file'
		if (type && type !== 'file') {
			// We care about files only, if the include type is specifed.
			return null
		}

		let originalTargetPathOffset = ap.offset
		let relativePath = ap.consumeQuotedStringOrRegex(FILE_REGEX)
		if (!relativePath || relativePath[0] === '#') {
			// We care about files only and "#" represents an explicit block name.
			return null
		}

		// If Latte would interpret it as a block name, we don't want it.
		// https://github.com/nette/latte/blob/794f252da7437499e467766d633eed85e1a437b7/src/Latte/Essential/CoreExtension.php#L221
		if (!explicitFile && relativePath.match(/^[\w-]+$/)) {
			return null
		}

		const absolutePath = resolveTemplatePath(relativePath, parsingContext)

		return new this(
			dumbTag.tagRange,
			relativePath,
			dumbTag.argsOffset + getPathContentOffset(args, originalTargetPathOffset),
			absolutePath,
		)
	}

	public getDescription(): string {
		return stripIndentation(`
		Includes a template file \`${this.absolutePath}\`.


		Example:
		\`\`\`latte
		{include 'file.latte'}
		{include 'template.latte', foo: 'bar', id: 123}
		{include 'template.latte' with blocks}
		\`\`\`

		[Documentation](https://latte.nette.org/en/tags#toc-including-templates)
		`)
	}
}

function getPathContentOffset(args: string, targetPathOffset: integer): integer {
	const char = args[targetPathOffset]
	return char === "'" || char === '"' ? targetPathOffset + 1 : targetPathOffset
}
