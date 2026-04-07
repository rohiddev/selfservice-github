import React from 'react';
import { PageSection } from '../common/PageSection';
import { ServiceCard } from '../common/ServiceCard';

export function HooverManageUsersPage() {
  return (
    <PageSection
      icon="manage_accounts"
      title="Manage Users in AD Group"
      subtitle="Add or remove members from an existing Active Directory group."
    >
      <ServiceCard
        icon="manage_accounts"
        title="Add Users to AD Group"
        description="Add one or more users to an existing Active Directory group. Specify the group and a comma-separated list of employee IDs to grant access."
        status="coming-soon"
        workflowUrl=""
        tags={['active-directory', 'user-management', 'iam']}
      />
      <div style={{ marginTop: 16 }}>
        <ServiceCard
          icon="person_remove"
          title="Remove Users from AD Group"
          description="Remove one or more users from an existing Active Directory group. Access is revoked immediately after the pipeline completes."
          status="coming-soon"
          workflowUrl=""
          videoUrl="" // SharePoint video URL
          tags={['active-directory', 'user-management', 'iam']}
        />
      </div>
    </PageSection>
  );
}
