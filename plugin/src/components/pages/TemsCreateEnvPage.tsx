import React from 'react';
import { PageSection } from '../common/PageSection';
import { ServiceCard } from '../common/ServiceCard';
import { WORKFLOW_URLS } from '../../config';

export function TemsCreateEnvPage() {
  return (
    <PageSection
      icon="science"
      title="Create Test Environment"
      subtitle="Reserve a managed test environment from the TEMS platform."
    >
      <ServiceCard
        icon="science"
        title="Reserve Test Environment"
        description="Reserve a test environment for your application through the Test Environment Management System (TEMS). Specify your SYS ID, environment type, and duration. The environment is provisioned and access details are returned via the pipeline."
        status="available"
        workflowUrl={WORKFLOW_URLS.temsReserve}
        tags={['tems', 'test', 'environment', 'qa']}
      />
    </PageSection>
  );
}
