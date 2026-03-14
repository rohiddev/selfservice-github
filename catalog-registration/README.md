# Catalog Auto-Registration at Scale

How to register `catalog-info.yaml` across a large GitHub organisation (tested approach for 18,000+ repos).

Author: Rohid Dev · github.com/rohiddev

---

## Background

Harness IDP 2.0 (Backstage) requires a `catalog-info.yaml` file in each repository to register it in the Software Catalog. Manually adding this file to thousands of repos is not feasible. This document describes a phased, automated approach.

---

## Recommended Strategy — Tier by Value

Do not attempt all repos at once. 80% of catalog value comes from the 20% of actively maintained repos.

| Tier | Target | Criteria | Approach |
|------|--------|----------|----------|
| 1 | ~500–2,000 repos | Pushed to in the last 90 days | Bulk bootstrap script |
| 2 | ~2,000–5,000 repos | Has an active CI/CD pipeline | Add step to existing pipeline |
| 3 | All new repos | Created going forward | IDP scaffolder (already handled) |
| 4 | Remaining legacy/dormant | Not touched in 12+ months | Low priority — skip for now |

---

## Phase Plan

### Phase 1 — Enable Auto-Discovery (Day 1)
Configure Harness IDP to scan the GitHub org and automatically register any repo that already has a `catalog-info.yaml`. This catches existing files with zero additional work.

Add to `app-config.yaml` in Harness IDP:

```yaml
catalog:
  providers:
    github:
      your-org:
        organization: 'your-org-name'
        catalogPath: '/catalog-info.yaml'
        filters:
          branch: 'main'
        schedule:
          frequency: { minutes: 30 }
          timeout: { minutes: 10 }
```

Harness IDP re-scans every 30 minutes and registers any newly added files automatically.

---

### Phase 2 — Bulk Bootstrap Script (Month 1)
A one-time script that iterates all repos via the GitHub API, infers metadata, generates a `catalog-info.yaml`, and opens a pull request in each active repo.

**What the script infers from the GitHub API:**

| Catalog field | Inferred from |
|---|---|
| `metadata.name` | `repo.name` |
| `metadata.description` | `repo.description` |
| `metadata.tags` | `repo.topics` |
| `spec.owner` | `CODEOWNERS` file or first team with write access |
| `spec.lifecycle` | `production` if last push > 1 year ago, else `experimental` |
| `spec.language` | `repo.language` |
| `spec.type` | `service` (default), override by topic tag e.g. `library`, `website` |

**Script outline (Python):**

```python
import requests, yaml, base64

GH_TOKEN = "..."
ORG      = "your-org"
BRANCH   = "add/catalog-info"
CUTOFF   = 90  # days — only process repos active within this window

headers = {"Authorization": f"Bearer {GH_TOKEN}", "Accept": "application/vnd.github+json"}

def get_repos():
    url = f"https://api.github.com/orgs/{ORG}/repos"
    while url:
        r = requests.get(url, headers=headers, params={"per_page": 100})
        yield from r.json()
        url = r.links.get("next", {}).get("url")

def get_owner(repo):
    r = requests.get(
        f"https://api.github.com/repos/{ORG}/{repo}/contents/CODEOWNERS",
        headers=headers
    )
    if r.status_code == 200:
        content = base64.b64decode(r.json()["content"]).decode()
        # Parse first team from CODEOWNERS e.g. @org/platform-engineering
        for line in content.splitlines():
            if line.startswith("*"):
                parts = line.split()
                if len(parts) > 1:
                    return parts[1].replace("@your-org/", "")
    return "platform-engineering"  # fallback

def already_has_catalog(repo):
    r = requests.get(
        f"https://api.github.com/repos/{ORG}/{repo}/contents/catalog-info.yaml",
        headers=headers
    )
    return r.status_code == 200

def generate_catalog_info(repo):
    return yaml.dump({
        "apiVersion": "backstage.io/v1alpha1",
        "kind": "Component",
        "metadata": {
            "name": repo["name"],
            "description": repo.get("description") or "",
            "tags": repo.get("topics", []),
            "annotations": {
                "github.com/project-slug": f"{ORG}/{repo['name']}"
            }
        },
        "spec": {
            "type": "service",
            "lifecycle": "production",
            "owner": get_owner(repo["name"]),
            "system": "platform"
        }
    }, default_flow_style=False)

for repo in get_repos():
    from datetime import datetime, timezone, timedelta
    pushed = datetime.fromisoformat(repo["pushed_at"].replace("Z", "+00:00"))
    if (datetime.now(timezone.utc) - pushed).days > CUTOFF:
        continue  # skip dormant repos
    if already_has_catalog(repo["name"]):
        continue  # already registered

    content = generate_catalog_info(repo)
    # Create branch + commit + PR
    # ... (standard GitHub API calls)
    print(f"PR opened: {repo['name']}")
```

**Tips for running at scale:**
- Add `time.sleep(0.1)` between API calls to stay within GitHub rate limits (5,000 req/hr for PAT, higher for GitHub App)
- Run in batches of 200–500 repos per day to avoid overwhelming teams with PRs
- Use a GitHub App token instead of a PAT for higher rate limits and better audit trail
- Consider pushing directly to a branch and using auto-merge if your org allows it

---

### Phase 3 — CI/CD Pipeline Hook (Month 2)
Add a step to existing CI/CD pipelines that checks for `catalog-info.yaml` and creates it if missing. This picks up repos that have active pipelines but weren't caught by the bulk script.

**GitHub Actions example:**

```yaml
# Add to existing workflow or as a standalone reusable workflow
- name: Register in IDP Catalog
  if: ${{ !fileExists('catalog-info.yaml') }}
  run: |
    cat > catalog-info.yaml << EOF
    apiVersion: backstage.io/v1alpha1
    kind: Component
    metadata:
      name: ${{ github.event.repository.name }}
      tags: []
    spec:
      type: service
      lifecycle: production
      owner: platform-engineering
    EOF
    git config user.name "platform-bot"
    git config user.email "platform-bot@company.com"
    git add catalog-info.yaml
    git commit -m "chore: add catalog-info.yaml for IDP registration"
    git push
```

**Jenkins example:**

```groovy
stage('Register in IDP Catalog') {
    when { expression { !fileExists('catalog-info.yaml') } }
    steps {
        sh '''
            cat > catalog-info.yaml << EOF
            apiVersion: backstage.io/v1alpha1
            kind: Component
            metadata:
              name: ${JOB_BASE_NAME}
            spec:
              type: service
              lifecycle: production
              owner: platform-engineering
            EOF
            git add catalog-info.yaml
            git commit -m "chore: add catalog-info.yaml for IDP registration"
            git push
        '''
    }
}
```

---

### Phase 4 — New Repos via Scaffolder (Ongoing)
All repos created through the Harness IDP self-service portal already get a `catalog-info.yaml` via the `catalog:register` step in the scaffolder template. No additional work needed here.

---

### Phase 5 — GitHub App for Full Automation (Later)
A GitHub App that listens for `repository.created` events and automatically opens a PR with a generated `catalog-info.yaml`. This gives ongoing automation for repos created outside the IDP scaffolder.

**Events to handle:**
- `repository.created` — new repo detected, open PR immediately
- `push` (to main, first time) — catch repos that existed but never had the file

This is the end state — once deployed, every new repo gets a catalog entry within minutes of creation.

---

## catalog-info.yaml Template

Minimum viable entry. Teams can enrich over time.

```yaml
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: your-service-name
  description: Brief description of what this service does
  tags:
    - java          # primary language/framework
    - payments      # business domain
  annotations:
    github.com/project-slug: your-org/your-repo-name
spec:
  type: service       # service | library | website | infrastructure
  lifecycle: production  # production | experimental | deprecated
  owner: your-team-name
  system: platform    # optional — logical grouping of related services
```

---

## Measuring Progress

Track registration coverage over time:

```bash
# Count repos with catalog-info.yaml via GitHub API
curl -s "https://api.github.com/search/code?q=filename:catalog-info.yaml+org:your-org" \
  -H "Authorization: Bearer $GH_TOKEN" | jq '.total_count'
```

Target milestones:
- Month 1: Top 500 active repos registered
- Month 3: All repos with active CI/CD pipelines registered
- Month 6: Full org coverage for non-dormant repos

---

## Related

- [Harness IDP GitHub Integration docs](https://developer.harness.io/docs/internal-developer-portal)
- [Backstage catalog-info.yaml reference](https://backstage.io/docs/features/software-catalog/descriptor-format)
- `harnessidp-createrepo/` — scaffolder template that handles new repos automatically
