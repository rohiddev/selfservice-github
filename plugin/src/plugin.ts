import {
  createPlugin,
  createRoutableExtension,
  createRouteRef,
} from '@backstage/core-plugin-api';

export const rootRouteRef = createRouteRef({
  id: 'selfservice-github',
});

export const selfserviceGithubPlugin = createPlugin({
  id: 'selfservice-github',
  routes: {
    root: rootRouteRef,
  },
});

export const SelfserviceGithubPage = selfserviceGithubPlugin.provide(
  createRoutableExtension({
    name: 'SelfserviceGithubPage',
    component: () =>
      import('./components/GitHubPortal').then(m => m.GitHubPortal),
    mountPoint: rootRouteRef,
  }),
);
