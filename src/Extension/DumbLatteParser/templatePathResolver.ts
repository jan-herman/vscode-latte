import path from 'path'

export type TemplatePathAliases = Record<string, unknown>

export type TemplatePathResolutionContext = {
	filePath: string | null
	workspaceFolderPath: string | null
	pathAliases: TemplatePathAliases
}

const DEFAULT_TEMPLATE_EXTENSION = '.latte'

export function resolveTemplatePath(
	targetPath: string,
	context: TemplatePathResolutionContext,
): string | null {
	const aliasPath = resolveAliasPath(targetPath, context)
	if (aliasPath) {
		return ensureDefaultExtension(aliasPath)
	}

	if (!context.filePath) {
		return null
	}

	const resolvedPath = path.resolve(path.dirname(context.filePath), targetPath)
	return ensureDefaultExtension(resolvedPath)
}

function resolveAliasPath(
	targetPath: string,
	context: TemplatePathResolutionContext,
): string | null {
	for (const [alias, replacement] of getSortedStringAliases(context.pathAliases)) {
		if (!targetPath.startsWith(alias)) {
			continue
		}

		const replacementBase = resolveReplacementBase(
			replacement,
			context.workspaceFolderPath,
		)
		if (!replacementBase) {
			return null
		}

		const relativePath = targetPath.substring(alias.length).replace(/^[/\\]+/, '')
		return path.normalize(path.join(replacementBase, relativePath))
	}

	return null
}

function getSortedStringAliases(
	aliases: TemplatePathAliases,
): Array<[string, string]> {
	return Object.entries(aliases)
		.filter((entry): entry is [string, string] => {
			const [alias, replacement] = entry
			return alias.length > 0 && typeof replacement === 'string'
		})
		.sort(([aliasA], [aliasB]) => aliasB.length - aliasA.length)
}

function resolveReplacementBase(
	replacement: string,
	workspaceFolderPath: string | null,
): string | null {
	let result = replacement
	if (result.includes('${workspaceFolder}')) {
		if (!workspaceFolderPath) {
			return null
		}

		result = result.split('${workspaceFolder}').join(workspaceFolderPath)
	}

	if (path.isAbsolute(result)) {
		return path.normalize(result)
	}

	return workspaceFolderPath ? path.resolve(workspaceFolderPath, result) : null
}

function ensureDefaultExtension(filePath: string): string {
	return path.extname(filePath) ? filePath : `${filePath}${DEFAULT_TEMPLATE_EXTENSION}`
}
