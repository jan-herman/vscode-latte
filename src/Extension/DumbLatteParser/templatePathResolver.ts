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

export function hasTemplatePathAlias(
	targetPath: string,
	pathAliases: TemplatePathAliases,
): boolean {
	return getSortedStringAliases(pathAliases).some(([alias]) =>
		targetPath.startsWith(alias),
	)
}

function resolveAliasPath(
	targetPath: string,
	context: TemplatePathResolutionContext,
): string | null {
	for (const [alias, replacement] of getSortedStringAliases(context.pathAliases)) {
		if (!targetPath.startsWith(alias)) {
			continue
		}

		const relativePath = normalizeAliasRelativePath(
			targetPath.substring(alias.length),
		)
		const relativePathWithoutExtension = removeExtension(relativePath)
		const replacementBase = resolveReplacementBase(
			replacement,
			context.workspaceFolderPath,
			relativePath,
			relativePathWithoutExtension,
		)
		if (!replacementBase) {
			return null
		}

		if (hasRelativePathPlaceholder(replacement)) {
			return replacementBase
		}

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
	relativePath: string,
	relativePathWithoutExtension: string,
): string | null {
	let result = replacement
	if (result.includes('${workspaceFolder}')) {
		if (!workspaceFolderPath) {
			return null
		}

		result = result.split('${workspaceFolder}').join(workspaceFolderPath)
	}

	if (result.includes('${relativePath}')) {
		result = result.split('${relativePath}').join(relativePath)
	}

	if (result.includes('${relativePathWithoutExtension}')) {
		result = result
			.split('${relativePathWithoutExtension}')
			.join(relativePathWithoutExtension)
	}

	if (path.isAbsolute(result)) {
		return path.normalize(result)
	}

	return workspaceFolderPath ? path.resolve(workspaceFolderPath, result) : null
}

function normalizeAliasRelativePath(relativePath: string): string {
	const trimmed = relativePath.replace(/^[/\\]+|[/\\]+$/g, '')
	if (!trimmed) {
		return ''
	}

	return path.normalize(trimmed.replace(/[\\/]+/g, path.sep))
}

function removeExtension(filePath: string): string {
	const extension = path.extname(filePath)
	return extension ? filePath.slice(0, -extension.length) : filePath
}

function hasRelativePathPlaceholder(replacement: string): boolean {
	return (
		replacement.includes('${relativePath}') ||
		replacement.includes('${relativePathWithoutExtension}')
	)
}

function ensureDefaultExtension(filePath: string): string {
	return path.extname(filePath) ? filePath : `${filePath}${DEFAULT_TEMPLATE_EXTENSION}`
}
