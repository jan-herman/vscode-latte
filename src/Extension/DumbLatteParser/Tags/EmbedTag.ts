import { stripIndentation } from '../../utils/stripIndentation'
import IncludeTag from './IncludeTag'

/**
 * {embed "file"} is an include-like tag with an overridable block body.
 */
export default class EmbedTag extends IncludeTag {
	public static readonly DUMB_NAME = 'embed'

	public getDescription(): string {
		return stripIndentation(`
		Embeds a template file \`${this.absolutePath}\` and allows overriding its blocks.

		Example:
		\`\`\`latte
		{embed 'card.latte'}
			{block title}Title{/block}
		{/embed}
		\`\`\`

		[Documentation](https://latte.nette.org/en/template-inheritance#toc-embedding-templates)
		`)
	}
}
