import React from 'react';
import { PageSection } from '../common/PageSection';
import { ServiceCard } from '../common/ServiceCard';
import { WORKFLOW_URLS } from '../../config';

export function HooverCreateRepoPage() {
  return (
    <PageSection
      icon="folder"
      title="Create Repository"
      subtitle="Provision a new GitHub repository with Okta groups and GitHub Teams — all from a single form."
    >
      <ServiceCard
        icon="folder_special"
        title="Create GitHub Repository"
        description="Creates a new GitHub repository under the organisation, provisions matching Okta Developer and Reviewer groups, and sets up corresponding GitHub Teams with correct permissions — all tied to your SYS ID."
        status="available"
        workflowUrl={WORKFLOW_URLS.createRepo}
        tags={['github', 'okta', 'teams', 'provisioning']}
      />
    </PageSection>
  );
}
