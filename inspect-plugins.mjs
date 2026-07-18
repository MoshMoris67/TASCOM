import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';

const plugins = [tanstackRouter(), react(), ...tanstackStart({ server: { entry: 'server' } })];
for (const [i, p] of plugins.entries()) {
  console.log('plugin', i, 'type', typeof p, 'isArray', Array.isArray(p));
  if (p && typeof p === 'object') {
    console.log('keys', Object.keys(p));
    console.log('ownKeys', Reflect.ownKeys(p));
    console.log('name', p.name, 'enforce', p.enforce, 'apply', p.apply);
  } else {
    console.log('value', p);
  }
}
