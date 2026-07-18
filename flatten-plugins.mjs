import config from './vite.config.ts';
const flatten = (arr) => arr.flat(Infinity).filter(Boolean);
const plugins = flatten(config.plugins ?? []);
console.log('plugin count', plugins.length);
for (const [i, p] of plugins.entries()) {
  if (!p) {
    console.log(i, 'NULL_OR_UNDEFINED');
  } else {
    console.log(i, 'NAME=', p.name, 'ENFORCE=', p.enforce, 'APPLY=', p.apply, 'IS_ARRAY=', Array.isArray(p));
  }
}
