import React from 'react';
import { PageSection } from '../common/PageSection';
import { ServiceCard } from '../common/ServiceCard';
import { WORKFLOW_URLS } from '../../config';

export function FuseKubernetesPage() {
  return (
    <PageSection
      icon="dns"
      title="Kubernetes Onboarding"
      subtitle="Provision a Kubernetes namespace on EKS or OpenShift via the PaaS platform."
    >
      <ServiceCard
        icon="dns"
        title="PaaS Namespace Onboarding"
        description="Provisions a Kubernetes namespace in the PaaS platform (EKS or OpenShift). Requires a valid SYS ID and ServiceNow demand number. Namespace type and cluster are determined by your SYS ID tier and the cluster zone you select."
        status="available"
        workflowUrl={WORKFLOW_URLS.k8sOnboarding}
        videoUrl="" // SharePoint video URL
        tags={['kubernetes', 'eks', 'openshift', 'paas', 'namespace']}
      />
    </PageSection>
  );
}
