import {
  createPlugin,
  createRoutableExtension,
  createRouteRef,
} from '@backstage/core-plugin-api';
import { GitHubPortal } from './components/GitHubPortal';

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
    component: () => Promise.resolve(GitHubPortal),
    mountPoint: rootRouteRef,
  }),
);
