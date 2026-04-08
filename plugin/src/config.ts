// ── Harness IDP portal configuration ─────────────────────────────────────────
// Update HARNESS_HOST and HARNESS_ACCOUNT_ID when deploying to a new environment.

export const HARNESS_HOST = 'citizensbankdev.harness.io';
export const HARNESS_ACCOUNT_ID = 'N2EzMWI4YjQtNDU4OS00Zj';

export const IDP_BASE = `https://${HARNESS_HOST}/ng/account/${HARNESS_ACCOUNT_ID}/module/idp`;

// ── Workflow URLs ─────────────────────────────────────────────────────────────
export const WORKFLOW_URLS = {
  createRepo:   `${IDP_BASE}/entity/edit/account/workflow/v2_github_repo_ad_provisioner`,
  k8sOnboarding:`${IDP_BASE}/create/templates/account/v2_PaaS_Namespace_Onboarding`,
  publicCloud:  `${IDP_BASE}/create/templates/account/platform_public_cloud_onboarding`,
  temsReserve:  `${IDP_BASE}/create/templates/account/tems_reserve_environment`,
};
