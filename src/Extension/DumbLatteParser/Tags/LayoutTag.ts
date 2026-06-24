import DumbTag from '../Scanner/DumbTag'
import { AbstractTag, ParsingContext, Range, TagReferencingTargetFile } from '../types'
import { ArgsParser } from '../argsParser'
import { stripIndentation } from '../../utils/stripIndentation'
import { FILE_REGEX } from '../regexes'
import { resolveTemplatePath } from '../templatePathResolver'

/**
 * {layout "file"}
 */
export default class LayoutTag extends AbstractTag implements TagReferencingTargetFile {
	// Not readonly, because ExtendsTag extends this class and needs to specify
	// another dumb name.
	public static DUMB_NAME = 'layout'

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
	): LayoutTag | null {
		const args = dumbTag.args

		const ap = new ArgsParser(args)
		let originalTargetPathOffset = ap.offset
		let relativePath = ap.consumeQuotedStringOrRegex(FILE_REGEX)
		if (!relativePath) {
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
		Specifies a layout file \`${this.absolutePath}\` which this template will extend.

		Example:
		\`\`\`latte
		{layout 'layout.latte'}
		\`\`\`

		[Documentation](https://latte.nette.org/en/template-inheritance#toc-layout-inheritance)
		`)
	}
}

function getPathContentOffset(args: string, targetPathOffset: integer): integer {
	const char = args[targetPathOffset]
	return char === "'" || char === '"' ? targetPathOffset + 1 : targetPathOffset
}
