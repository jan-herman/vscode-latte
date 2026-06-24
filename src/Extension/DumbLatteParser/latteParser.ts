import * as vscode from 'vscode'
import DumbTag from './Scanner/DumbTag'
import { Scanner } from './Scanner/Scanner'
import { AbstractTag, ParsingContext } from './types'
import { isString } from '../utils/common'
import { createFromDumbTag } from './Tags/tagFactory'
import { TemplatePathAliases } from './templatePathResolver'

export function parseLatte(
	source: string,
	uri: vscode.Uri | string | null = null,
	contextOverrides: Partial<ParsingContext> = {},
): AbstractTag[] {
	const scanner = new Scanner(source)

	const parsingContext = createParsingContext(uri, contextOverrides)

	return createTags(scanner.scan(), parsingContext)
}

function createParsingContext(
	uri: vscode.Uri | string | null,
	contextOverrides: Partial<ParsingContext>,
): ParsingContext {
	const documentUri = uri && !isString(uri) ? (uri as vscode.Uri) : null
	const filePath = uri
		? isString(uri)
			? (uri as string)
			: documentUri!.fsPath
		: null
	const workspaceFolderPath = documentUri
		? vscode.workspace.getWorkspaceFolder(documentUri)?.uri.fsPath ?? null
		: null
	const pathAliases = documentUri
		? vscode.workspace
				.getConfiguration('latte.intelliSense', documentUri)
				.get<TemplatePathAliases>('pathAliases', {})
		: {}

	return {
		filePath,
		workspaceFolderPath,
		pathAliases,
		...contextOverrides,
	}
}

function createTags(dumbTags: DumbTag[], parsingContext: ParsingContext): AbstractTag[] {
	const result = []
	for (const dumbTag of dumbTags) {
		const tag = createFromDumbTag(dumbTag, parsingContext)
		if (tag) {
			result.push(tag)
		}
	}

	return result
}
