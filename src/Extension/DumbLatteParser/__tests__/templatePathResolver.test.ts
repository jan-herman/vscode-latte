import { resolveTemplatePath } from '../templatePathResolver'

const BASE_CONTEXT = {
	filePath: '/workspace/site/templates/page.latte',
	workspaceFolderPath: '/workspace',
	pathAliases: {},
}

test('Resolve template path aliases', () => {
	expect(
		resolveTemplatePath('@components/icon', {
			...BASE_CONTEXT,
			pathAliases: {
				'@components': 'site/snippets/components',
			},
		}),
	).toBe('/workspace/site/snippets/components/icon.latte')
})

test('Resolve longest template path alias first', () => {
	expect(
		resolveTemplatePath('@components/forms/input', {
			...BASE_CONTEXT,
			pathAliases: {
				'@components': 'site/snippets/components',
				'@components/forms': 'site/snippets/forms',
			},
		}),
	).toBe('/workspace/site/snippets/forms/input.latte')
})

test('Resolve relative template paths from the current template', () => {
	expect(resolveTemplatePath('partial/header', BASE_CONTEXT)).toBe(
		'/workspace/site/templates/partial/header.latte',
	)
})

test('Resolve workspace folder placeholder in template path aliases', () => {
	expect(
		resolveTemplatePath('@templates/card', {
			...BASE_CONTEXT,
			pathAliases: {
				'@templates': '${workspaceFolder}/site/templates',
			},
		}),
	).toBe('/workspace/site/templates/card.latte')
})

test('Resolve relative path placeholder in template path aliases', () => {
	expect(
		resolveTemplatePath('@blocks/block-name', {
			...BASE_CONTEXT,
			pathAliases: {
				'@blocks': 'src/blocks/${relativePath}',
			},
		}),
	).toBe('/workspace/src/blocks/block-name.latte')

	expect(
		resolveTemplatePath('@blocks/block-name.latte', {
			...BASE_CONTEXT,
			pathAliases: {
				'@blocks': 'src/blocks/${relativePath}',
			},
		}),
	).toBe('/workspace/src/blocks/block-name.latte')
})

test('Normalize slashes around relative path placeholder', () => {
	expect(
		resolveTemplatePath('@blocks//nested\\block-name/', {
			...BASE_CONTEXT,
			pathAliases: {
				'@blocks': 'src/blocks/${relativePath}',
			},
		}),
	).toBe('/workspace/src/blocks/nested/block-name.latte')
})

test('Resolve relative path without extension placeholder in template path aliases', () => {
	expect(
		resolveTemplatePath('@blocks/block-name', {
			...BASE_CONTEXT,
			pathAliases: {
				'@blocks': 'src/blocks/${relativePathWithoutExtension}.template.latte',
			},
		}),
	).toBe('/workspace/src/blocks/block-name.template.latte')

	expect(
		resolveTemplatePath('@blocks/block-name.latte', {
			...BASE_CONTEXT,
			pathAliases: {
				'@blocks': 'src/blocks/${relativePathWithoutExtension}.template.latte',
			},
		}),
	).toBe('/workspace/src/blocks/block-name.template.latte')
})

test('Ignore non-string template path aliases', () => {
	expect(
		resolveTemplatePath('@components/icon', {
			...BASE_CONTEXT,
			pathAliases: {
				'@components': () => '/workspace/site/snippets/components',
			},
		}),
	).toBe('/workspace/site/templates/@components/icon.latte')
})
