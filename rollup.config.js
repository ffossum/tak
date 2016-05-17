import babel from 'rollup-plugin-babel';
import nodeResolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

export default {
  entry: 'lib/index.js',
  sourceMap: true,
  globals: {
    lodash: '_',
  },
  plugins: [
    nodeResolve({
      jsnext: true,
      main: true,
      skip: ['lodash'],
    }),
    commonjs(),
    babel(),
  ],
};
