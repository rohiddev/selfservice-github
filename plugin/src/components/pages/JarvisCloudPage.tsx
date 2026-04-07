import React from 'react';
import { PageSection } from '../common/PageSection';
import { ServiceCard } from '../common/ServiceCard';
import { WORKFLOW_URLS } from '../../config';

export function JarvisCloudPage() {
  return (
    <PageSection
      icon="cloud"
      title="Public Cloud Onboarding"
      subtitle="Self-service infrastructure pattern fitment for public cloud provisioning via Jarvis."
    >
      <ServiceCard
        icon="cloud_upload"
        title="Public Cloud Infrastructure Onboarding"
        description="Captures your application's infrastructure pattern fitment — cloud type, tier definitions, database configuration, AD group approvers, and governance details. Submits to Jarvis for cloud architect review and provisioning."
        status="available"
        workflowUrl={WORKFLOW_URLS.publicCloud}
        tags={['aws', 'azure', 'jarvis', 'cloud', 'infrastructure']}
      />
    </PageSection>
  );
}
