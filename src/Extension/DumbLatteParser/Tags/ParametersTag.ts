import { parsePhpTypeCached, PhpType } from '../../phpTypeParser/phpTypeParser'
import { VARIABLE_REGEX } from '../../regexes'
import { stripIndentation } from '../../utils/stripIndentation'
import { isValidTypeSpec, isValidVariableName } from '../regexes'
import DumbTag from '../Scanner/DumbTag'
import { AbstractTag, ParsingContext, Range } from '../types'

export type ParameterInfo = {
	varName: string
	varType: PhpType
	nameRange: Range
	typeRange: Range
}

/**
 * {parameters SomeType $var, string $other = "value"}
 */
export default class ParametersTag extends AbstractTag {
	public static readonly DUMB_NAME = 'parameters'

	constructor(range: Range, readonly parameters: ParameterInfo[]) {
		super(range)
	}

	static fromDumbTag(
		dumbTag: DumbTag,
		parsingContext: ParsingContext,
	): ParametersTag | null {
		const parameters = splitParameterParts(dumbTag.args).flatMap((part) => {
			const parsed = parseParameterPart(part.text, dumbTag.argsOffset + part.offset)
			return parsed ? [parsed] : []
		})

		return parameters.length ? new this(dumbTag.tagRange, parameters) : null
	}

	public getDescription(): string {
		return stripIndentation(`
		Declares typed parameters passed to the template.

		Example:
		\`\`\`latte
		{parameters App\\Dto\\Button $button, string $label = ''}
		\`\`\`

		[Documentation](https://latte.nette.org/en/type-system#toc-parameters)
		`)
	}
}

function parseParameterPart(text: string, baseOffset: integer): ParameterInfo | null {
	const trimStartLength = text.length - text.trimStart().length
	const trimmed = text.trim()
	if (!trimmed) {
		return null
	}

	const declaration = removeDefaultValue(trimmed)
	const declarationBaseOffset = baseOffset + trimStartLength
	const varRegex = new RegExp(VARIABLE_REGEX.source, 'd')
	const varMatch = varRegex.exec(declaration)
	if (!varMatch) {
		return null
	}

	const varName = varMatch[0]
	const varNameOffset = varMatch.indices![0][0]
	if (!isValidVariableName(varName)) {
		return null
	}

	const typeStr = declaration.substring(0, varNameOffset).trim()
	if (!typeStr || !isValidTypeSpec(typeStr)) {
		return null
	}

	const typeOffset = declaration.indexOf(typeStr)
	const varType = parsePhpTypeCached(typeStr)
	if (!varType) {
		return null
	}

	return {
		varName,
		varType,
		nameRange: {
			startOffset: declarationBaseOffset + varNameOffset,
			endOffset: declarationBaseOffset + varNameOffset + varName.length,
		} as Range,
		typeRange: {
			startOffset: declarationBaseOffset + typeOffset,
			endOffset: declarationBaseOffset + typeOffset + typeStr.length,
		} as Range,
	}
}

function removeDefaultValue(text: string): string {
	const index = findTopLevelEquals(text)
	return index === -1 ? text : text.substring(0, index).trimEnd()
}

function splitParameterParts(input: string): Array<{ text: string; offset: integer }> {
	const result: Array<{ text: string; offset: integer }> = []
	let start = 0
	let quote: string | null = null
	let escaped = false
	let round = 0
	let square = 0
	let curly = 0
	let angle = 0

	for (let index = 0; index < input.length; index++) {
		const char = input[index]

		if (quote) {
			if (escaped) {
				escaped = false
			} else if (char === '\\') {
				escaped = true
			} else if (char === quote) {
				quote = null
			}
			continue
		}

		if (char === "'" || char === '"') {
			quote = char
		} else if (char === '(') {
			round++
		} else if (char === ')' && round) {
			round--
		} else if (char === '[') {
			square++
		} else if (char === ']' && square) {
			square--
		} else if (char === '{') {
			curly++
		} else if (char === '}' && curly) {
			curly--
		} else if (char === '<') {
			angle++
		} else if (char === '>' && angle) {
			angle--
		} else if (
			char === ',' &&
			round === 0 &&
			square === 0 &&
			curly === 0 &&
			angle === 0
		) {
			result.push({ text: input.substring(start, index), offset: start })
			start = index + 1
		}
	}

	result.push({ text: input.substring(start), offset: start })
	return result
}

function findTopLevelEquals(input: string): integer {
	let quote: string | null = null
	let escaped = false
	let round = 0
	let square = 0
	let curly = 0
	let angle = 0

	for (let index = 0; index < input.length; index++) {
		const char = input[index]

		if (quote) {
			if (escaped) {
				escaped = false
			} else if (char === '\\') {
				escaped = true
			} else if (char === quote) {
				quote = null
			}
			continue
		}

		if (char === "'" || char === '"') {
			quote = char
		} else if (char === '(') {
			round++
		} else if (char === ')' && round) {
			round--
		} else if (char === '[') {
			square++
		} else if (char === ']' && square) {
			square--
		} else if (char === '{') {
			curly++
		} else if (char === '}' && curly) {
			curly--
		} else if (char === '<') {
			angle++
		} else if (char === '>' && angle) {
			angle--
		} else if (
			char === '=' &&
			round === 0 &&
			square === 0 &&
			curly === 0 &&
			angle === 0
		) {
			return index
		}
	}

	return -1
}
