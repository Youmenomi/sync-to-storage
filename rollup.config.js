//@ts-check

import { build } from 'rollup-simple-configer'
import pkg from './package.json'

const external = [
  '@auth0/s3',
  'ali-oss-extra',
  'p-each-series',
  'chalk',
  'cosmiconfig',
  'ora',
  './sync-to-storage',
  '@endemolshinegroup/cosmiconfig-typescript-loader',
]

export default [].concat(
  build(
    './src/index.ts',
    {
      banner: `#!/usr/bin/env node
    `,
      file: pkg.bin,
      format: 'cjs',
    },
    { external }
  ),
  build(
    './src/sync-to-storage.ts',
    {
      file: pkg.main,
      format: 'cjs',
    },
    { external }
  ),
  build(
    './src/sync-to-storage.ts',
    {
      file: pkg.module,
      format: 'esm',
    },
    { external }
  )
)
