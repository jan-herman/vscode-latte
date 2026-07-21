type SfcEmmetContext =
	| {
			language: 'css' | 'scss'
			contentStart: number
			contentEnd: number
	  }
	| { language: null }

const OPEN_TAG = /\{(style|script)(?=\s|\})[^}]*\}/g
const LANG_ARGUMENT =
	/(?:^|[\s,])lang\s*:\s*(?:'([^']*)'|"([^"]*)"|([^\s,}]+))/

/** Returns the SFC context at an offset, or null for the HTML template. */
export function getSfcEmmetContext(
	source: string,
	offset: number,
): SfcEmmetContext | null {
	OPEN_TAG.lastIndex = 0

	let openingTag: RegExpExecArray | null
	while ((openingTag = OPEN_TAG.exec(source))) {
		const tagName = openingTag[1] as 'style' | 'script'
		const contentStart = OPEN_TAG.lastIndex
		const closingTag = `{/${tagName}}`
		const closingTagStart = source.indexOf(closingTag, contentStart)
		const contentEnd =
			closingTagStart === -1 ? source.length + 1 : closingTagStart
		const blockEnd =
			closingTagStart === -1
				? source.length + 1
				: closingTagStart + closingTag.length

		if (offset >= openingTag.index && offset < blockEnd) {
			if (
				tagName === 'script' ||
				offset < contentStart ||
				offset >= contentEnd
			) {
				return { language: null }
			}

			const langArgument = LANG_ARGUMENT.exec(openingTag[0])
			const lang =
				langArgument?.[1] ?? langArgument?.[2] ?? langArgument?.[3]

			return {
				language: lang === 'scss' ? 'scss' : 'css',
				contentStart,
				contentEnd,
			}
		}

		if (closingTagStart === -1) {
			break
		}

		OPEN_TAG.lastIndex = blockEnd
	}

	return null
}
