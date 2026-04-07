import {
  createPlugin,
  createRoutableExtension,
  createRouteRef,
} from '@backstage/core-plugin-api';
import { SelfServicePortal } from './components/SelfServicePortal';

export const rootRouteRef = createRouteRef({
  id: 'selfservice-github',
});

export const selfserviceGithubPlugin = createPlugin({
  id: 'selfservice-github',
  routes: {
    root: rootRouteRef,
  },
});

export const SelfService = selfserviceGithubPlugin.provide(
  createRoutableExtension({
    name: 'SelfService',
    component: () => Promise.resolve(SelfServicePortal),
    mountPoint: rootRouteRef,
  }),
);
