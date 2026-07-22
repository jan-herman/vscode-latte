import * as vscode from 'vscode'
import {
	doComplete,
	type VSCodeEmmetConfig,
} from '@vscode/emmet-helper'
import { TextDocument } from 'vscode-languageserver-textdocument'

import { getSfcEmmetContext } from './SfcBlocks'

const LANG_ID = 'latte'
const EMMET_TRIGGER_CHARACTERS = '!.}:*$]/>-0123456789'.split('')

type EmmetCompletionList = NonNullable<ReturnType<typeof doComplete>>
type EmmetCompletionItem = EmmetCompletionList['items'][number]
type EmmetRange = Extract<
	NonNullable<EmmetCompletionItem['textEdit']>,
	{ range: unknown }
>['range']

export function registerLatteEmmetCompletionProvider(): vscode.Disposable {
	return vscode.languages.registerCompletionItemProvider(
		LANG_ID,
		new SfcEmmetCompletionProvider(),
		...EMMET_TRIGGER_CHARACTERS,
	)
}

class SfcEmmetCompletionProvider implements vscode.CompletionItemProvider {
	public provideCompletionItems(
		document: vscode.TextDocument,
		position: vscode.Position,
		token: vscode.CancellationToken,
	): vscode.CompletionList | null {
		if (token.isCancellationRequested) {
			return null
		}

		const documentOffset = document.offsetAt(position)
		const source = document.getText()
		const context = getSfcEmmetContext(source, documentOffset)

		if (context?.language === null) {
			return null
		}

		const emmetConfig = getEmmetConfig(document.uri)

		return provideEmbeddedCompletions(
			document,
			source,
			documentOffset,
			context?.language ?? 'html',
			context?.contentStart ?? 0,
			context?.contentEnd ?? source.length,
			emmetConfig,
		)
	}
}

function provideEmbeddedCompletions(
	document: vscode.TextDocument,
	source: string,
	documentOffset: number,
	language: 'html' | 'css' | 'scss',
	contentStart: number,
	contentEnd: number,
	emmetConfig: VSCodeEmmetConfig,
): vscode.CompletionList | null {
	if (emmetConfig.excludeLanguages?.includes(LANG_ID)) {
		return null
	}

	const embeddedDocument = TextDocument.create(
		document.uri.toString(),
		language,
		document.version,
		source.slice(contentStart, contentEnd),
	)
	const embeddedPosition = embeddedDocument.positionAt(
		documentOffset - contentStart,
	)
	const completionList = doComplete(
		embeddedDocument,
		embeddedPosition,
		language,
		emmetConfig,
	)

	if (!completionList) {
		return null
	}

	return new vscode.CompletionList(
		completionList.items.map((item) =>
			toVsCodeCompletionItem(item, embeddedDocument, document, contentStart),
		),
		completionList.isIncomplete,
	)
}

function getEmmetConfig(uri: vscode.Uri): VSCodeEmmetConfig {
	const config = vscode.workspace.getConfiguration('emmet', uri)

	return {
		showExpandedAbbreviation: config.get<string>('showExpandedAbbreviation'),
		showAbbreviationSuggestions: config.get<boolean>(
			'showAbbreviationSuggestions',
		),
		syntaxProfiles: config.get<object>('syntaxProfiles'),
		variables: config.get<object>('variables'),
		preferences: config.get<object>('preferences'),
		excludeLanguages: config.get<string[]>('excludeLanguages'),
		showSuggestionsAsSnippets: config.get<boolean>('showSuggestionsAsSnippets'),
	}
}

function toVsCodeCompletionItem(
	item: EmmetCompletionItem,
	embeddedDocument: TextDocument,
	document: vscode.TextDocument,
	contentStart: number,
): vscode.CompletionItem {
	const completion = new vscode.CompletionItem(
		item.label,
		item.kind as vscode.CompletionItemKind | undefined,
	)

	completion.detail = item.detail
	completion.filterText = item.filterText
	completion.sortText = item.sortText
	completion.documentation =
		typeof item.documentation === 'string'
			? item.documentation
			: item.documentation?.value

	if (item.textEdit && 'range' in item.textEdit) {
		completion.range = toVsCodeRange(
			item.textEdit.range,
			embeddedDocument,
			document,
			contentStart,
		)
		completion.insertText = toVsCodeInsertText(
			item.textEdit.newText,
			item.insertTextFormat,
		)
	} else if (item.insertText) {
		completion.insertText = toVsCodeInsertText(
			item.insertText,
			item.insertTextFormat,
		)
	}

	return completion
}

function toVsCodeInsertText(
	insertText: string,
	insertTextFormat: EmmetCompletionItem['insertTextFormat'],
): string | vscode.SnippetString {
	return insertTextFormat === 2
		? new vscode.SnippetString(insertText)
		: insertText
}

function toVsCodeRange(
	range: EmmetRange,
	embeddedDocument: TextDocument,
	document: vscode.TextDocument,
	contentStart: number,
): vscode.Range {
	const toDocumentPosition = (position: EmmetRange['start']) =>
		document.positionAt(
			contentStart + embeddedDocument.offsetAt(position),
		)

	return new vscode.Range(
		toDocumentPosition(range.start),
		toDocumentPosition(range.end),
	)
}
