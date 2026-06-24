import IncludeTag from '../Tags/IncludeTag'
import { parseLatte } from '../latteParser'

const EXPECTATIONS = {
	'{include file-a.latte}': ['file-a.latte', '/base-dir/file-a.latte'],
	"{include 'file-a.latte'}": ['file-a.latte', '/base-dir/file-a.latte'],
	'{include ./dir-1/file-a.latte}': [
		'./dir-1/file-a.latte',
		'/base-dir/dir-1/file-a.latte',
	],
	'{include ./dir-1/dir-2/file-a.latte}': [
		'./dir-1/dir-2/file-a.latte',
		'/base-dir/dir-1/dir-2/file-a.latte',
	],
	"{include './dir-1/file-a'}": ['./dir-1/file-a', '/base-dir/dir-1/file-a.latte'],
	"{include file-a'}": null, // Extra trailing quotes fails the match.
	// Below the extra leading quote doesn't fail the filename regex match, but
	// Latte would interpret it as a block name. See
	// https://github.com/nette/latte/blob/794f252da7437499e467766d633eed85e1a437b7/src/Latte/Essential/CoreExtension.php#L221
	"{include 'file-a}": null,
	"{include '../file-a'}": ['../file-a', '/file-a.latte'],
	"{include '../file-a.latte'}": ['../file-a.latte', '/file-a.latte'],
	"{include '../dir-1/file-a'}": ['../dir-1/file-a', '/dir-1/file-a.latte'],
	"{include '../../../dir-1/file-a'}": [
		'../../../dir-1/file-a',
		'/dir-1/file-a.latte',
	],
	"{include '../../../file-a}": null, // Extra leading quote fails the match.
	"{include ../../../file-a'}": ['../../../file-a', '/file-a.latte'], // Extra trailing quote doesn't fail the match, but is ignored.
	'{include blockname}': null, // Block instead of file fails the match.
	'{include file blockname}': ['blockname', '/base-dir/blockname.latte'],
}

for (const [subject, expected] of Object.entries(EXPECTATIONS)) {
	test(`Test parser: IncludeTag: ${subject}`, () => {
		const filePath = '/base-dir/latte-file.latte'
		const result = parseLatte(subject, filePath)
		const tag = result[0] as IncludeTag

		if (expected !== null) {
			expect([tag.relativePath, tag.absolutePath]).toMatchObject(expected)
		} else {
			expect(result).toEqual([])
		}
	})
}

test('Test parser: IncludeTag: # remains a block reference without alias', () => {
	expect(parseLatte("{include '#button'}", '/workspace/page.latte')).toEqual([])
	expect(parseLatte('{include #button}', '/workspace/page.latte')).toEqual([])
})

test('Test parser: IncludeTag: # can be used as a path alias', () => {
	const context = {
		workspaceFolderPath: '/workspace',
		pathAliases: {
			'#': 'src/templates/components',
		},
	}

	const quotedResult = parseLatte(
		"{include '#button'}",
		'/workspace/site/templates/page.latte',
		context,
	)
	const quotedTag = quotedResult[0] as IncludeTag
	expect([quotedTag.relativePath, quotedTag.absolutePath]).toMatchObject([
		'#button',
		'/workspace/src/templates/components/button.latte',
	])

	const unquotedResult = parseLatte(
		'{include #button}',
		'/workspace/site/templates/page.latte',
		context,
	)
	const unquotedTag = unquotedResult[0] as IncludeTag
	expect([unquotedTag.relativePath, unquotedTag.absolutePath]).toMatchObject([
		'#button',
		'/workspace/src/templates/components/button.latte',
	])
})
