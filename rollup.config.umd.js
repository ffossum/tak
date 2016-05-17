import config from './rollup.config';

config.format = 'umd';
config.dest = 'dist/tak.umd.js';
config.moduleName = 'TAK';

export default config;
