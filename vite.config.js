import path from 'path';

import { defineConfig } from 'vite';
import assertRemove from 'destam-dom/transform/assertRemove';
import compileHTMLLiteral from 'destam-dom/transform/htmlLiteral';

const createTransform = (name, transform, jsx, options) => ({
	name,
	transform(code, id) {
		if (id.endsWith('.js') || (jsx && id.endsWith('.jsx'))) {
			const transformed = transform(code, {
				sourceFileName: id,
				plugins: id.endsWith('.jsx') ? ['jsx'] : [],
				...options,
			});
			return {
				code: transformed.code,
				map: transformed.map,
			};
		}
	}
});

const plugins = [];

plugins.push(createTransform('transform-literal-html', compileHTMLLiteral, true, {
	jsx_auto_import: {
		h: 'destamatic-ui',
		raw: {
			name: 'h',
			location: 'destam-dom'
		}
	},
}));

if (process.env.ENV === 'production') {
	plugins.push(createTransform('assert-remove', assertRemove));
}

export default defineConfig({
	root: './frontend',
	plugins,
	esbuild: {
		jsx: 'transform', // Changed this setting
		loader: 'jsx',
	},
	base: '',
	resolve: {
		alias: {
			'web-core': path.resolve(__dirname, './web-core'),
		},
        extensions: ['.js', '.ts', '.tsx', '.jsx'],
	},
	optimizeDeps: {
		include: ['web-core'] // Add more if needed
	},
});
