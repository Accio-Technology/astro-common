import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import astro from 'eslint-plugin-astro';

const CONSUMER_ALIASES = ['~/**', '@/**', '@common/**', '@site/**', '@config/**', '@components/**', '@layouts/**', '@assets/**', '@data/**'];

export default tseslint.config(
    {
        ignores: ['dist/**', 'node_modules/**', '.astro/**'],
    },
    js.configs.recommended,
    ...tseslint.configs.recommended,
    ...astro.configs.recommended,
    {
        name: 'astro-common/boundary',
        files: ['components/**/*.astro', 'components/**/*.ts', 'scripts/**/*.ts'],
        rules: {
            'no-restricted-imports': [
                'error',
                {
                    patterns: [
                        {
                            group: CONSUMER_ALIASES,
                            message:
                                'astro-common must not import from the consuming site. Pass configuration in via props instead. See README.md > Boundaries.',
                        },
                        {
                            group: ['@astrojs/cloudflare*', 'wrangler*', 'cloudflare:*'],
                            message: 'astro-common must stay adapter-agnostic. Never reference a specific Cloudflare binding.',
                        },
                        {
                            group: ['node:*'],
                            message:
                                'astro-common must run in any edge runtime. Do not import Node built-ins; the consuming site owns deployment specifics.',
                        },
                        {
                            group: ['react', 'react-dom', 'vue', 'svelte', 'solid-js', 'preact'],
                            message: 'astro-common is framework-agnostic. Use plain Astro + scoped styles.',
                        },
                        {
                            group: ['../../*', '../../../*', '../../../../*'],
                            message: 'Import escapes the astro-common root. Only relative imports inside the library are allowed.',
                        },
                    ],
                },
            ],
        },
    },
);