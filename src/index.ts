import { cosmiconfig } from 'cosmiconfig';
import chalk from 'chalk';
import TypeScriptLoader from '@endemolshinegroup/cosmiconfig-typescript-loader';
import { publishTo } from './sync-to-storage';

const moduleName = 'sync-to-storage';

(async () => {
  const searchPlaces = [
    'package.json',
    `.${moduleName}rc`,
    `.${moduleName}rc.json`,
    `.${moduleName}rc.yaml`,
    `.${moduleName}rc.yml`,
    `.${moduleName}rc.js`,
    `.${moduleName}.config.js`,
    `.${moduleName}.config.ts`,
  ];
  const explorer = cosmiconfig(moduleName, {
    searchPlaces,
    loaders: {
      '.ts': TypeScriptLoader,
    },
  });
  const result = await explorer.search();
  if (result && !result.isEmpty) {
    publishTo(result.config);
  } else {
    // eslint-disable-next-line no-console
    console.log(
      chalk.red(`Configuration does not exist!
    `)
    );
  }
})();
