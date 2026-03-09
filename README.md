# GitHub Self-Service Portal

Slim Harness IDP 2.0 plugin — GitHub Services with a single **Create Repository** card.
Clicking the card launches the Harness IDP workflow that provisions a GitHub repo, Okta groups, and GitHub Teams in one step.

> **POC** — built on Harness IDP 2.0 (Backstage scaffolder compatible).
> Author: Rohid Dev · github.com/rohiddev

---

## What it does

```
Left nav: GitHub Services
  └── Create Repository          ← single card → opens Harness IDP workflow
```

The workflow (`github_repo_okta_teams_provisioner`) provisions:
- GitHub repository (public / private / internal)
- Okta Developer group + Admin group
- GitHub Teams with correct permissions (push / maintain)
- Registers the new component in the IDP catalog

---

## File structure

```
selfservice-github/
├── plugin/
│   ├── src/
│   │   ├── plugin.ts                   ← createPlugin + createRoutableExtension
│   │   ├── index.ts                    ← barrel export
│   │   └── components/
│   │       ├── GitHubPortal.tsx        ← nav + content (WORKFLOW_URL constant at top)
│   │       ├── PageHeader.tsx          ← reusable page header
│   │       └── ServiceCard.tsx         ← reusable service card
│   ├── package.json
│   └── tsconfig.json
├── catalog-info.yaml                   ← registers this plugin in IDP catalog
└── README.md
```

---

## Getting started — Harness IDP deployment

### Prerequisites

| Requirement | Detail |
|---|---|
| Harness IDP 2.0 access | Admin or Developer role on the platform_engineering project |
| GitHub Connector | Harness connector for github.com (OAuth or PAT) |
| Workflow registered | `harnessidp-createrepo` workflow in IDP |
| Node.js ≥ 18 | For building the plugin |

---

### Step 1 — Update the workflow URL

Open `plugin/src/components/GitHubPortal.tsx` and replace the placeholder on line 14:

```ts
const CREATE_REPO_WORKFLOW_URL =
  'https://app.harness.io/ng/account/YOUR_ACCOUNT_ID/module/idp/orgs/default/projects/platform_engineering/workflows/github_repo_okta_teams_provisioner';
```

Get the correct URL from:
**Harness IDP → Workflows → Create GitHub Repository with Okta Groups & GitHub Teams → Copy link**

---

### Step 2 — Build the plugin

```bash
cd plugin
npm install
npm run build
```

This produces a `dist/` folder with `index.cjs.js`, `index.esm.js`, `index.d.ts`.

To package as a `.tgz` for upload:

```bash
npm pack
# produces: internal-plugin-selfservice-github-0.1.0.tgz
```

---

### Step 3 — Upload the plugin to Harness IDP

1. Go to **Harness IDP → Admin → Plugins**
2. Click **Upload Plugin**
3. Upload `internal-plugin-selfservice-github-0.1.0.tgz`
4. Wait for the upload confirmation

---

### Step 4 — Enable and configure the plugin

After upload, Harness IDP shows the plugin in the list.

1. Click the plugin → **Enable**
2. Under **Configuration**, set the mount path (e.g. `/github-services`)
3. Save

Harness IDP automatically wires `SelfserviceGithubPage` to the mount path using the `rootRouteRef` declared in `plugin.ts`.

---

### Step 5 — Add to IDP nav (app-config.yaml / layout)

In **Harness IDP → Admin → Layout**, add a nav entry pointing to your mount path:

```yaml
# In your IDP layout configuration
nav:
  - title: GitHub Services
    url: /github-services
    icon: code
```

Or via `app-config.yaml` if you have direct access:

```yaml
app:
  routes:
    - path: /github-services
      title: GitHub Services
      component: '@internal/plugin-selfservice-github#SelfserviceGithubPage'
```

---

### Step 6 — Register this repo in the IDP catalog

In **Harness IDP → Catalog → Register Component**, provide:

```
https://github.com/rohiddev/selfservice-github/blob/main/catalog-info.yaml
```

This registers the plugin itself as a catalog entity so it appears in the service catalog.

---

### Step 7 — Ensure the Create Repository workflow is registered

The **Create Repository** button links to `github_repo_okta_teams_provisioner`.
If not already registered:

1. Go to **Harness IDP → Workflows → Register Workflow**
2. Provide:
   ```
   https://github.com/rohiddev/harnessidp-createrepo/blob/main/workflow.yaml
   ```
3. Confirm registration

---

### Step 8 — Configure GitHub connector (for the workflow)

The `harnessidp-createrepo` workflow uses `publish:github` which requires a GitHub integration:

**Harness IDP → Admin → Integrations → GitHub**

| Field | Value |
|---|---|
| Integration name | `github_integration` |
| GitHub API URL | `https://api.github.com` |
| Token | PAT with `repo`, `admin:org` scopes — stored in Vault |

Vault reference path: `secret/platform-engineering/github → gh_org_token`

---

### Step 9 — Verify

1. Open IDP → GitHub Services (nav item)
2. Confirm the **Create Repository** card appears with `Available` badge
3. Click **Create Repository** → should open the Harness IDP workflow form
4. Submit a test request and verify the pipeline runs

---

## Updating the workflow URL later

All you need to change is one constant in `GitHubPortal.tsx`:

```ts
// line 14 — plugin/src/components/GitHubPortal.tsx
const CREATE_REPO_WORKFLOW_URL = 'https://app.harness.io/...';
```

Rebuild and re-upload the `.tgz`. No other files change.

---

## Extending — adding more GitHub services

To add a second card (e.g. Archive Repository), add a new `Service` object in `GitHubPortal.tsx` and include it in the `<Grid>`:

```tsx
const ARCHIVE_REPO_SERVICE: Service = {
  id: 'archive-repository',
  title: 'Archive Repository',
  description: 'Archive a GitHub repository...',
  icon: 'archive',
  status: 'available',
  actionLabel: 'Archive Repository',
  actionUrl: 'https://app.harness.io/.../workflows/archive_github_repo',
  tags: ['github', 'archive'],
};

// In the Grid:
<Grid item xs={12} sm={6} md={4}>
  <ServiceCard service={ARCHIVE_REPO_SERVICE} />
</Grid>
```

No data files, no feature flags — add, rebuild, upload.
