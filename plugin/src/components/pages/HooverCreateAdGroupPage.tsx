import React from 'react';
import { PageSection } from '../common/PageSection';
import { ServiceCard } from '../common/ServiceCard';

export function HooverCreateAdGroupPage() {
  return (
    <PageSection
      icon="group_add"
      title="Create AD Group"
      subtitle="Create a new Active Directory group for your application or team."
    >
      <ServiceCard
        icon="group_add"
        title="Create Active Directory Group"
        description="Provisions a new Active Directory group scoped to your SYS ID. The group is created with the correct naming convention and ownership, ready for user assignment."
        status="coming-soon"
        workflowUrl=""
        videoUrl="" // SharePoint video URL
        tags={['active-directory', 'iam', 'provisioning']}
      />
    </PageSection>
  );
}
