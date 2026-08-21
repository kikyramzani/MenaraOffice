import { FlatCompat } from '@eslint/eslintrc'

const compat = new FlatCompat({ baseDirectory: import.meta.dirname })

const config = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    ignores: ['.next/**', 'node_modules/**', 'test-results/**', 'playwright-report/**'],
  },
  {
    // The printable company profile is rendered to PDF by Chromium, not served
    // to browsers. `next/image` lazy-loads and swaps srcset entries by viewport,
    // which makes the printed result non-deterministic, so plain <img> with
    // explicit dimensions is the correct element here.
    files: ['src/components/profile/**/*.tsx'],
    rules: { '@next/next/no-img-element': 'off' },
  },
]

export default config
