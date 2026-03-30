import React, { useEffect, useState } from 'react';
import {
  Button,
  Chip,
  CircularProgress,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  Icon,
  List,
  ListItem,
  ListItemText,
  Typography,
  makeStyles,
} from '@material-ui/core';
import { useApi, identityApiRef, fetchApiRef } from '@backstage/core-plugin-api';
import { PageHeader } from './PageHeader';
import { ServiceCard, Service } from './ServiceCard';

// ── Notification banners ──────────────────────────────────────────────────────
const NOTIFICATIONS_API_ENABLED: boolean = false;
const NOTIFICATIONS_API_PATH = '/api/proxy/platform-api/hoover-service/notifications-api/banners';

const FALLBACK_BANNERS = [
  { type: 'info',        icon: 'info',        message: 'GitHub Self-Service Portal is now live. Create repositories with Okta groups and GitHub Teams from a single form.' },
  { type: 'maintenance', icon: 'build',        message: 'Scheduled maintenance: Nexus Repository Manager will be unavailable Saturday 08:00–10:00 UTC.' },
  { type: 'new',         icon: 'new_releases', message: 'New: Archive Repository service coming soon — stay tuned.' },
];
const BANNER_STYLES: Record<string, { bg: string; color: string }> = {
  info:        { bg: '#e3f2fd', color: '#1565c0' },
  maintenance: { bg: '#fff3e0', color: '#e65100' },
  new:         { bg: '#E6F5EF', color: '#007A4D' },
};

// ── Onboarding review API ─────────────────────────────────────────────────────
// TODO: set ONBOARDING_API_ENABLED = true once proxy is set up in Harness IDP:
//   app-config.yaml → proxy → '/onboarding-api': target: 'https://internal-api.bank.com'
// GET  /api/proxy/onboarding-api/requests          → list all requests
// PUT  /api/proxy/onboarding-api/requests/{sysId}/status → update status
const ONBOARDING_API_ENABLED: boolean = false;
const ONBOARDING_API_PATH = '/api/proxy/onboarding-api/requests';

// paas_platform_admins group can approve/reject. All others read-only.
const PAAS_ADMIN_GROUP = 'paas_platform_admins';

// ── Onboarding request types ──────────────────────────────────────────────────
type RequestStatus = 'Pending Approval' | 'Validation Failed' | 'Success' | 'Failed' | 'Rejected';

interface OnboardingRequest {
  sysId: string;
  appKey: string;
  appName: string;
  cluster: string;
  clusterZone: string;
  subdomain: string;
  appType: string;
  activeCluster: string;
  town: string;
  demandNumber: string;
  glooMesh: string;
  description: string;
  requestor: string;
  primaryApprover: string;
  secondaryApprover: string;
  status: RequestStatus;
  dateRequested: string;
  reviewer?: string;
  rejectionReason?: string;
}

const MOCK_REVIEW_REQUESTS: OnboardingRequest[] = [
  { sysId: 'SYSID-09750', appKey: 'LQF', appName: 'Data Integration Service', cluster: 'p2', clusterZone: 'EKS', subdomain: 'dev', appType: 'COTS', activeCluster: 'SHARED1', town: 'cyber', demandNumber: 'DMND9988776', glooMesh: 'disabled', description: 'New service onboarding request', requestor: 'SVC_PLATFORM', primaryApprover: 'n001234', secondaryApprover: 'J056789', status: 'Validation Failed', dateRequested: '2026-03-15T05:01:00Z' },
  { sysId: 'SYSID-08827', appKey: 'IMB', appName: 'Security Platform', cluster: 'p2', clusterZone: 'EKS', subdomain: 'dev', appType: 'COTS', activeCluster: 'SHARED1', town: 'cyber', demandNumber: 'DMND1234567', glooMesh: 'disabled', description: 'Town: cyber Owner: dl-dso-IMB-team Systems: SYSID-08827', requestor: 'SVC_SERVICE', primaryApprover: 'n002150', secondaryApprover: 'J042773', status: 'Pending Approval', dateRequested: '2026-03-12T12:25:00Z' },
  { sysId: 'SYSID-09476', appKey: 'YDX', appName: 'Limit Processing', cluster: 'p1', clusterZone: 'AWS-Openshift', subdomain: 'qa', appType: 'Internal', activeCluster: 'SHARED2', town: 'metro', demandNumber: 'DMND5544332', glooMesh: 'enabled', description: 'QA namespace for limit testing', requestor: 'SUBRAMANIAN_K', primaryApprover: 'n003456', secondaryApprover: 'J078901', status: 'Pending Approval', dateRequested: '2026-03-10T09:28:00Z' },
  { sysId: 'SYSID-06759', appKey: 'TTU', appName: 'Pre-Clearance Service', cluster: 'p2', clusterZone: 'EKS', subdomain: 'sit', appType: 'COTS', activeCluster: 'SHARED1', town: 'cyber', demandNumber: 'DMND3322110', glooMesh: 'disabled', description: 'SIT environment setup', requestor: 'MOULI_R', primaryApprover: 'n004567', secondaryApprover: 'J089012', status: 'Success', dateRequested: '2026-03-03T08:17:00Z', reviewer: 'Cindy A' },
  { sysId: 'SYSID-06788', appKey: 'QOO', appName: 'ABL North Service', cluster: 'p2', clusterZone: 'EKS', subdomain: 'dev', appType: 'COTS', activeCluster: 'SHARED3', town: 'uptown', demandNumber: 'DMND2211009', glooMesh: 'disabled', description: 'Dev namespace provisioning', requestor: 'SVC_SERVICE', primaryApprover: 'n005678', secondaryApprover: 'J012345', status: 'Success', dateRequested: '2026-03-05T05:01:00Z', reviewer: 'Cindy A' },
  { sysId: 'SYSID-09467', appKey: 'GEZ', appName: 'Dynamic Pricing', cluster: 'p2', clusterZone: 'EKS', subdomain: 'observability', appType: 'Internal', activeCluster: 'SHARED1', town: 'cyber', demandNumber: 'DMND1100998', glooMesh: 'enabled', description: 'Observability namespace', requestor: 'HIMANISH_P', primaryApprover: 'n006789', secondaryApprover: 'J023456', status: 'Success', dateRequested: '2026-02-25T09:38:00Z', reviewer: 'Abhishek S' },
  { sysId: 'SYSID-09905', appKey: 'GYV', appName: 'Gateway Service', cluster: 'p', clusterZone: 'AWS-Openshift', subdomain: 'prod', appType: 'COTS', activeCluster: 'PROD1', town: 'metro', demandNumber: 'DMND0099887', glooMesh: 'disabled', description: 'Production namespace request', requestor: 'NARESH_V', primaryApprover: 'n007890', secondaryApprover: 'J034567', status: 'Failed', dateRequested: '2026-03-02T16:18:00Z', reviewer: 'Ramakrishna M' },
  { sysId: 'SYSID-09472', appKey: 'OCY', appName: 'OCY Platform', cluster: 'p2', clusterZone: 'EKS', subdomain: 'dev', appType: 'Internal', activeCluster: 'SHARED2', town: 'uptown', demandNumber: 'DMND9876543', glooMesh: 'disabled', description: 'Dev platform setup', requestor: 'YESWANTH_R', primaryApprover: 'n008901', secondaryApprover: 'J045678', status: 'Rejected', dateRequested: '2026-02-23T15:41:00Z', reviewer: 'Cindy A', rejectionReason: 'Invalid demand number provided' },
];

// ── Workflow URLs ─────────────────────────────────────────────────────────────
// TODO: replace YOUR_ACCOUNT_ID after registering workflows in Harness IDP
const CREATE_REPO_WORKFLOW_URL =
  'https://app.harness.io/ng/account/YOUR_ACCOUNT_ID/module/idp/orgs/default/projects/platform_engineering/workflows/github_repo_okta_teams_provisioner';

const FUSE_ONBOARDING_WORKFLOW_URL =
  'https://app.harness.io/ng/account/YOUR_ACCOUNT_ID/module/idp/orgs/default/projects/platform_engineering/workflows/platform_a_onboarding';

// ── Static service definitions ────────────────────────────────────────────────
const TEMS_SERVICES: Service[] = [
  {
    id: 'tms-reserve-env',
    title: 'Reserve Environment',
    description: 'Reserve a dedicated test environment for your application. Select environment tier, duration, and required integrations.',
    icon: 'science',
    status: 'available',
    actionLabel: 'Reserve Environment',
    actionUrl: '#',
    tags: ['testing', 'environment', 'qa'],
  },
  {
    id: 'tms-test-data',
    title: 'Test Data Management',
    description: 'Request and manage test data sets for your application. Create, clone, or refresh test data in lower environments on demand.',
    icon: 'dataset',
    status: 'available',
    actionLabel: 'Manage Test Data',
    actionUrl: '#',
    tags: ['testing', 'data', 'qa'],
  },
  {
    id: 'tms-perf-testing',
    title: 'Performance Testing',
    description: 'Submit load, stress, and soak test requests for your service. Configure test parameters and view results directly from the portal.',
    icon: 'speed',
    status: 'available',
    actionLabel: 'Run Performance Test',
    actionUrl: '#',
    tags: ['performance', 'load-test', 'qa'],
  },
];

const FUSE_ONBOARDING_SERVICE: Service = {
  id: 'fuse-onboarding-request',
  title: 'Onboarding',
  description: 'Onboard a new service onto the Fuse platform — register your application, configure namespace, and set up service mesh integration from a single form.',
  icon: 'rocket_launch',
  status: 'available',
  actionLabel: 'Start Onboarding',
  actionUrl: FUSE_ONBOARDING_WORKFLOW_URL,
  tags: ['fuse', 'kubernetes', 'namespace', 'service-mesh'],
};

const CREATE_REPO_SERVICE: Service = {
  id: 'create-repository',
  title: 'Create Repository',
  description: 'Provision a new GitHub repository with Okta Developer and Admin groups, matching GitHub Teams, and correct permissions — all from a single form.',
  icon: 'create_new_folder',
  status: 'available',
  actionLabel: 'Create Repository',
  actionUrl: CREATE_REPO_WORKFLOW_URL,
  tags: ['github', 'okta', 'teams', 'provisioning'],
};

// ── Status chip config ────────────────────────────────────────────────────────
const STATUS_CHIP: Record<RequestStatus, { bg: string; color: string }> = {
  'Pending Approval':   { bg: '#FFF9C4', color: '#F57F17' },
  'Validation Failed':  { bg: '#FFEBEE', color: '#B71C1C' },
  'Success':            { bg: '#E8F5E9', color: '#2E7D32' },
  'Failed':             { bg: '#EEEEEE', color: '#616161' },
  'Rejected':           { bg: '#FFF3E0', color: '#E65100' },
};

const NAV_WIDTH = 240;

const useStyles = makeStyles(theme => ({
  root: { display: 'flex', minHeight: '100vh', backgroundColor: '#ffffff' },

  // ── Left nav ────────────────────────────────────────────────────────────────
  nav: {
    width: NAV_WIDTH, flexShrink: 0, backgroundColor: '#00965E', color: '#fff',
    display: 'flex', flexDirection: 'column', position: 'sticky', top: 0,
    height: '100vh', overflowY: 'auto',
  },
  navLogo: { display: 'flex', alignItems: 'center', gap: theme.spacing(1.5), padding: theme.spacing(2.5, 2.5, 2) },
  navLogoIcon: { width: 36, height: 36, backgroundColor: '#007A4D', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  navTitle: { fontWeight: 800, fontSize: 15, color: '#fff', lineHeight: 1.2 },
  navSubtitle: { fontSize: 11, color: 'rgba(255,255,255,0.85)' },
  navDivider: { backgroundColor: 'rgba(255,255,255,0.2)', margin: theme.spacing(1, 2) },
  navDividerSpacing: { backgroundColor: 'rgba(255,255,255,0.2)', margin: theme.spacing(1.5, 2, 0.5) },
  sectionHeader: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: theme.spacing(1, 1.5, 0.5, 2), cursor: 'pointer', userSelect: 'none' as const,
    '&:hover': { backgroundColor: 'rgba(0,0,0,0.08)' },
  },
  sectionHeaderLeft: { display: 'flex', alignItems: 'center', gap: theme.spacing(1) },
  sectionIcon: { color: '#fff', fontSize: 18 },
  sectionLabel: { fontSize: 12, fontWeight: 700, color: '#fff', textTransform: 'uppercase' as const, letterSpacing: '0.06em' },
  chevron: { color: 'rgba(255,255,255,0.8)', fontSize: '16px !important', transition: 'transform 0.2s', marginRight: theme.spacing(0.5) },
  chevronOpen: { transform: 'rotate(180deg)' },
  childItem: {
    borderRadius: 8, margin: theme.spacing(0.2, 1, 0.2, 2.5), padding: theme.spacing(0.75, 1.5),
    cursor: 'pointer', transition: 'background 0.15s', backgroundColor: 'rgba(0,122,77,0.35)',
    borderLeft: '3px solid #80CBA8', '&:hover': { backgroundColor: 'rgba(0,122,77,0.45)' },
  },
  childItemActive: { backgroundColor: 'rgba(255,255,255,0.2)', borderLeft: '3px solid #fff' },
  childText: { fontSize: 13, color: '#fff', fontWeight: 600 },
  navFooter: { marginTop: 'auto', padding: theme.spacing(2), borderTop: '1px solid rgba(255,255,255,0.08)' },
  navFooterText: { fontSize: 11, color: 'rgba(255,255,255,0.7)', textAlign: 'center' },

  // ── Topbar ────────────────────────────────────────────────────────────────
  topbar: { display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: theme.spacing(2) },
  userChip: {
    display: 'flex', alignItems: 'center', gap: theme.spacing(1), background: '#fff',
    border: '1.5px solid #e8eaed', borderRadius: 24, padding: '5px 12px 5px 6px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  },
  avatar: {
    width: 28, height: 28, borderRadius: '50%', backgroundColor: '#00965E',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0,
  },
  userDisplayName: { fontSize: 13, color: '#1a1a1a', fontWeight: 600, whiteSpace: 'nowrap' as const },

  // ── Content ──────────────────────────────────────────────────────────────
  content: { flexGrow: 1, overflowY: 'auto', maxWidth: `calc(100% - ${NAV_WIDTH}px)` },
  pageInner: { padding: theme.spacing(4) },

  // ── Notification banner ────────────────────────────────────────────────────
  banner: { display: 'flex', alignItems: 'center', gap: theme.spacing(1.5), padding: theme.spacing(1, 3), fontSize: 12.5 },
  bannerMessage: { flex: 1, fontSize: 13, fontWeight: 500 },
  bannerNav: {
    background: 'none', border: 'none', cursor: 'pointer', padding: 2,
    display: 'flex', alignItems: 'center', opacity: 0.6, '&:hover': { opacity: 1 },
  },

  // ── Hero banner ────────────────────────────────────────────────────────────
  hero: {
    background: 'linear-gradient(135deg, #00965E 0%, #007A4D 100%)',
    borderRadius: 16, padding: theme.spacing(4, 5), marginBottom: theme.spacing(4),
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#fff',
  },
  heroLeft: { display: 'flex', flexDirection: 'column' as const, gap: theme.spacing(1) },
  heroGreeting: { fontSize: 13, color: 'rgba(255,255,255,0.8)', fontWeight: 500 },
  heroTitle: { fontSize: 26, fontWeight: 800, color: '#fff', lineHeight: 1.2 },
  heroSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.85)', maxWidth: 480, lineHeight: 1.6 },
  heroIconBox: {
    width: 80, height: 80, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.15)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  heroIcon: { fontSize: '44px !important', color: '#fff' },

  // ── Review table ───────────────────────────────────────────────────────────
  reviewTableWrap: { overflowX: 'auto' as const, marginTop: theme.spacing(2) },
  reviewTable: { width: '100%', borderCollapse: 'collapse' as const, fontSize: 13 },
  reviewTh: {
    textAlign: 'left' as const, padding: theme.spacing(1.5, 2),
    borderBottom: '2px solid #e8eaed', fontWeight: 700, color: '#555',
    fontSize: 12, whiteSpace: 'nowrap' as const, backgroundColor: '#fafafa',
  },
  reviewTd: {
    padding: theme.spacing(1.5, 2), borderBottom: '1px solid #f0f0f0',
    verticalAlign: 'middle' as const, whiteSpace: 'nowrap' as const,
  },
  reviewRow: { cursor: 'pointer', '&:hover': { backgroundColor: '#f8fffe' } },
  reviewEmpty: { textAlign: 'center' as const, padding: theme.spacing(6), color: '#999' },
  reviewLoading: { display: 'flex', justifyContent: 'center', padding: theme.spacing(6) },

  // ── Status chip ────────────────────────────────────────────────────────────
  statusChip: { fontSize: 11, fontWeight: 700, height: 22, borderRadius: 11 },

  // ── Detail dialog ─────────────────────────────────────────────────────────
  dialogHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  dialogSysId: { fontSize: 16, fontWeight: 700, color: '#1a1a1a' },
  dialogDate: { fontSize: 12, color: '#888', marginTop: 2 },
  dialogSectionTitle: { fontSize: 13, fontWeight: 700, color: '#555', marginTop: theme.spacing(2), marginBottom: theme.spacing(1.5), textTransform: 'uppercase' as const, letterSpacing: '0.05em' },
  dialogField: { marginBottom: theme.spacing(2) },
  dialogLabel: { fontSize: 12, color: '#666', fontWeight: 600, marginBottom: 4, display: 'block' },
  dialogValue: {
    padding: '8px 12px', border: '1px solid #e8eaed', borderRadius: 6,
    fontSize: 13, backgroundColor: '#fafafa', display: 'block',
  },
  dialogGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: theme.spacing(0, 2) },

  // ── Admin action buttons ────────────────────────────────────────────────────
  approveBtn: {
    backgroundColor: '#00965E', color: '#fff',
    '&:hover': { backgroundColor: '#007A4D' },
    textTransform: 'none' as const, fontWeight: 600,
  },
  rejectBtn: {
    backgroundColor: '#fff', color: '#c62828', border: '1.5px solid #c62828',
    '&:hover': { backgroundColor: '#FFEBEE' },
    textTransform: 'none' as const, fontWeight: 600,
  },
  rejectForm: {
    marginTop: theme.spacing(2), padding: theme.spacing(2),
    backgroundColor: '#FFF8F8', border: '1px solid #FFCDD2', borderRadius: 8,
  },
  rejectInput: {
    width: '100%', padding: '10px 12px', border: '1.5px solid #FFCDD2', borderRadius: 8,
    fontSize: 13, fontFamily: 'inherit', outline: 'none', resize: 'vertical' as const,
    minHeight: 80, '&:focus': { borderColor: '#c62828' },
  },

  // ── Contact page ───────────────────────────────────────────────────────────
  contactGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: theme.spacing(2.5), marginTop: theme.spacing(3) },
  contactCard: {
    border: '1px solid #e8eaed', borderRadius: 12, padding: theme.spacing(3),
    display: 'flex', flexDirection: 'column' as const, gap: theme.spacing(1),
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)', transition: 'transform 0.15s, box-shadow 0.15s',
    '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' },
  },
  contactIcon: { color: '#00965E', fontSize: 28 },
  contactLabel: { fontWeight: 700, fontSize: 15, color: '#1a1a1a' },
  contactValue: { fontSize: 13, color: '#555' },
  contactLink: { marginTop: 'auto', display: 'inline-block', fontSize: 13, fontWeight: 600, color: '#00965E', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } },

  // ── Request a Feature page ─────────────────────────────────────────────────
  featureForm: { maxWidth: 560, marginTop: theme.spacing(3), display: 'flex', flexDirection: 'column' as const, gap: theme.spacing(2) },
  formLabel: { fontWeight: 600, fontSize: 13, color: '#1a1a1a', marginBottom: 4 },
  formInput: { width: '100%', padding: '10px 12px', border: '1.5px solid #e8eaed', borderRadius: 8, fontSize: 13, fontFamily: 'inherit', outline: 'none', '&:focus': { borderColor: '#00965E' } },
  formTextarea: { width: '100%', padding: '10px 12px', border: '1.5px solid #e8eaed', borderRadius: 8, fontSize: 13, fontFamily: 'inherit', resize: 'vertical' as const, minHeight: 100, outline: 'none', '&:focus': { borderColor: '#00965E' } },
  submitBtn: {
    alignSelf: 'flex-start', backgroundColor: '#00965E', color: '#fff', border: 'none',
    borderRadius: 8, padding: '10px 24px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
    '&:hover': { backgroundColor: '#007A4D' }, '&:disabled': { opacity: 0.5, cursor: 'not-allowed' },
  },
  successBox: {
    display: 'flex', alignItems: 'center', gap: theme.spacing(1.5),
    backgroundColor: '#E6F5EF', border: '1px solid #b2dfdb', borderRadius: 10,
    padding: theme.spacing(2), marginTop: theme.spacing(2),
  },

  // ── Video Guides page ──────────────────────────────────────────────────────
  videoGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: theme.spacing(2.5), marginTop: theme.spacing(3) },
  videoCard: { border: '1px solid #e8eaed', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', transition: 'transform 0.15s, box-shadow 0.15s', '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' } },
  videoThumb: { backgroundColor: '#E6F5EF', height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' as const },
  videoThumbIcon: { color: '#00965E', fontSize: '48px !important' },
  videoDuration: { position: 'absolute' as const, bottom: 8, right: 10, fontSize: 11, fontWeight: 700, backgroundColor: 'rgba(0,0,0,0.55)', color: '#fff', padding: '2px 6px', borderRadius: 4 },
  videoBody: { padding: theme.spacing(2) },
  videoTitle: { fontWeight: 700, fontSize: 14, color: '#1a1a1a', marginBottom: 4 },
  videoDesc: { fontSize: 12, color: '#666', lineHeight: 1.5, marginBottom: theme.spacing(1.5) },
  videoWatchBtn: { display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600, color: '#00965E', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } },
}));

export function GitHubPortal() {
  const classes = useStyles();
  const identityApi = useApi(identityApiRef);
  const fetchApi = useApi(fetchApiRef);

  const [activePage, setActivePage] = useState('github');
  const [displayName, setDisplayName] = useState<string>('');
  const [isPaasAdmin, setIsPaasAdmin] = useState(false);
  const [bannerIndex, setBannerIndex] = useState(0);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [banners, setBanners] = useState(FALLBACK_BANNERS);
  const [featureForm, setFeatureForm] = useState({ title: '', description: '', submitted: false });
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    github: true, fuse: false, tms: false, resources: false, help: false,
  });

  // Review page state
  const [reviewRequests, setReviewRequests] = useState<OnboardingRequest[]>(MOCK_REVIEW_REQUESTS);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<OnboardingRequest | null>(null);
  const [rejectFormOpen, setRejectFormOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const toggleSection = (id: string) => setOpenSections(s => ({ ...s, [id]: !s[id] }));

  // Load user identity + check admin group
  useEffect(() => {
    identityApi.getProfileInfo()
      .then(p => setDisplayName(p.displayName ?? p.email ?? ''))
      .catch(() => {});

    identityApi.getBackstageIdentity()
      .then(({ ownershipEntityRefs }) => {
        setIsPaasAdmin(ownershipEntityRefs.some(r =>
          r.toLowerCase().includes(PAAS_ADMIN_GROUP.toLowerCase()) ||
          r.toLowerCase().replace(/_/g, '-').includes(PAAS_ADMIN_GROUP.replace(/_/g, '-'))
        ));
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load notification banners
  useEffect(() => {
    if (!NOTIFICATIONS_API_ENABLED) return;
    fetchApi.fetch(NOTIFICATIONS_API_PATH)
      .then(r => r.json())
      .then(data => { if (Array.isArray(data) && data.length > 0) setBanners(data); })
      .catch(() => {});
  }, []);

  // Load review requests when review page is opened
  useEffect(() => {
    if (activePage !== 'fuse-onboarding-review' || !ONBOARDING_API_ENABLED) return;
    setReviewLoading(true);
    fetchApi.fetch(ONBOARDING_API_PATH)
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setReviewRequests(data); })
      .catch(() => {})
      .finally(() => setReviewLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePage]);

  const handleApprove = async (sysId: string) => {
    if (!ONBOARDING_API_ENABLED) return;
    setActionLoading(true);
    try {
      await fetchApi.fetch(`${ONBOARDING_API_PATH}/${sysId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Success', reviewer: displayName }),
      });
      setReviewRequests(rs => rs.map(r => r.sysId === sysId ? { ...r, status: 'Success' as RequestStatus, reviewer: displayName } : r));
      setSelectedRequest(null);
    } catch (_) { /* silently handle */ }
    finally { setActionLoading(false); }
  };

  const handleReject = async (sysId: string) => {
    if (!rejectReason.trim()) return;
    if (!ONBOARDING_API_ENABLED) {
      setReviewRequests(rs => rs.map(r => r.sysId === sysId ? { ...r, status: 'Rejected' as RequestStatus, reviewer: displayName, rejectionReason: rejectReason } : r));
      setSelectedRequest(null); setRejectFormOpen(false); setRejectReason('');
      return;
    }
    setActionLoading(true);
    try {
      await fetchApi.fetch(`${ONBOARDING_API_PATH}/${sysId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Rejected', reviewer: displayName, rejectionReason: rejectReason }),
      });
      setReviewRequests(rs => rs.map(r => r.sysId === sysId ? { ...r, status: 'Rejected' as RequestStatus, reviewer: displayName, rejectionReason: rejectReason } : r));
      setSelectedRequest(null); setRejectFormOpen(false); setRejectReason('');
    } catch (_) { /* silently handle */ }
    finally { setActionLoading(false); }
  };

  const initials = displayName.split(' ').slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('');

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={classes.root}>
      {/* ═══════ LEFT NAVIGATION ═══════ */}
      <nav className={classes.nav} aria-label="Main navigation">
        <div className={classes.navLogo}>
          <div className={classes.navLogoIcon} aria-hidden="true">
            <Icon style={{ color: '#fff', fontSize: 20 }}>developer_board</Icon>
          </div>
          <div>
            <Typography className={classes.navTitle}>Developer Portal</Typography>
            <Typography className={classes.navSubtitle}>Hoover Services</Typography>
          </div>
        </div>

        <Divider className={classes.navDivider} />

        {/* Hoover Services */}
        <div className={classes.sectionHeader} onClick={() => toggleSection('github')} role="button" aria-expanded={openSections.github} tabIndex={0} onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleSection('github'); } }}>
          <div className={classes.sectionHeaderLeft}>
            <Icon className={classes.sectionIcon} aria-hidden="true">code</Icon>
            <Typography className={classes.sectionLabel}>Hoover Services</Typography>
          </div>
          <Icon className={`${classes.chevron} ${openSections.github ? classes.chevronOpen : ''}`} aria-hidden="true">expand_more</Icon>
        </div>
        <Collapse in={openSections.github} timeout="auto">
          <List disablePadding>
            <ListItem className={`${classes.childItem} ${activePage === 'github' ? classes.childItemActive : ''}`} onClick={() => setActivePage('github')} disableGutters role="menuitem" tabIndex={0}>
              <ListItemText primary="Create Repository" primaryTypographyProps={{ className: classes.childText }} />
            </ListItem>
          </List>
        </Collapse>

        <Divider className={classes.navDividerSpacing} />

        {/* Fuse Services — Request + Review */}
        <div className={classes.sectionHeader} onClick={() => toggleSection('fuse')} role="button" aria-expanded={openSections.fuse} tabIndex={0} onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleSection('fuse'); } }}>
          <div className={classes.sectionHeaderLeft}>
            <Icon className={classes.sectionIcon} aria-hidden="true">dns</Icon>
            <Typography className={classes.sectionLabel}>Fuse Services</Typography>
          </div>
          <Icon className={`${classes.chevron} ${openSections.fuse ? classes.chevronOpen : ''}`} aria-hidden="true">expand_more</Icon>
        </div>
        <Collapse in={openSections.fuse} timeout="auto">
          <List disablePadding>
            <ListItem className={`${classes.childItem} ${activePage === 'fuse-onboarding-request' ? classes.childItemActive : ''}`} onClick={() => setActivePage('fuse-onboarding-request')} disableGutters role="menuitem" tabIndex={0}>
              <ListItemText primary="Onboarding-Request" primaryTypographyProps={{ className: classes.childText }} />
            </ListItem>
            <ListItem className={`${classes.childItem} ${activePage === 'fuse-onboarding-review' ? classes.childItemActive : ''}`} onClick={() => setActivePage('fuse-onboarding-review')} disableGutters role="menuitem" tabIndex={0}>
              <ListItemText primary="Onboarding-Review" primaryTypographyProps={{ className: classes.childText }} />
            </ListItem>
          </List>
        </Collapse>

        <Divider className={classes.navDividerSpacing} />

        {/* TEMS */}
        <div className={classes.sectionHeader} onClick={() => toggleSection('tms')} role="button" aria-expanded={openSections.tms} tabIndex={0} onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleSection('tms'); } }}>
          <div className={classes.sectionHeaderLeft}>
            <Icon className={classes.sectionIcon} aria-hidden="true">science</Icon>
            <Typography className={classes.sectionLabel}>TEMS</Typography>
          </div>
          <Icon className={`${classes.chevron} ${openSections.tms ? classes.chevronOpen : ''}`} aria-hidden="true">expand_more</Icon>
        </div>
        <Collapse in={openSections.tms} timeout="auto">
          <List disablePadding>
            <ListItem className={`${classes.childItem} ${activePage === 'tms-reserve-env' ? classes.childItemActive : ''}`} onClick={() => setActivePage('tms-reserve-env')} disableGutters role="menuitem" tabIndex={0}>
              <ListItemText primary="Reserve Environment" primaryTypographyProps={{ className: classes.childText }} />
            </ListItem>
          </List>
        </Collapse>

        <Divider className={classes.navDividerSpacing} />

        {/* Resources */}
        <div className={classes.sectionHeader} onClick={() => toggleSection('resources')} role="button" aria-expanded={openSections.resources} tabIndex={0} onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleSection('resources'); } }}>
          <div className={classes.sectionHeaderLeft}>
            <Icon className={classes.sectionIcon} aria-hidden="true">ondemand_video</Icon>
            <Typography className={classes.sectionLabel}>Resources</Typography>
          </div>
          <Icon className={`${classes.chevron} ${openSections.resources ? classes.chevronOpen : ''}`} aria-hidden="true">expand_more</Icon>
        </div>
        <Collapse in={openSections.resources} timeout="auto">
          <List disablePadding>
            <ListItem className={`${classes.childItem} ${activePage === 'videos' ? classes.childItemActive : ''}`} onClick={() => setActivePage('videos')} disableGutters role="menuitem" tabIndex={0}>
              <ListItemText primary="Video Guides" primaryTypographyProps={{ className: classes.childText }} />
            </ListItem>
          </List>
        </Collapse>

        <Divider className={classes.navDividerSpacing} />

        {/* Help & Feedback */}
        <div className={classes.sectionHeader} onClick={() => toggleSection('help')} role="button" aria-expanded={openSections.help} tabIndex={0} onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleSection('help'); } }}>
          <div className={classes.sectionHeaderLeft}>
            <Icon className={classes.sectionIcon} aria-hidden="true">help_outline</Icon>
            <Typography className={classes.sectionLabel}>Help &amp; Feedback</Typography>
          </div>
          <Icon className={`${classes.chevron} ${openSections.help ? classes.chevronOpen : ''}`} aria-hidden="true">expand_more</Icon>
        </div>
        <Collapse in={openSections.help} timeout="auto">
          <List disablePadding>
            <ListItem className={`${classes.childItem} ${activePage === 'contact' ? classes.childItemActive : ''}`} onClick={() => setActivePage('contact')} disableGutters role="menuitem" tabIndex={0}>
              <ListItemText primary="Contact Us" primaryTypographyProps={{ className: classes.childText }} />
            </ListItem>
            <ListItem className={`${classes.childItem} ${activePage === 'request-feature' ? classes.childItemActive : ''}`} onClick={() => setActivePage('request-feature')} disableGutters role="menuitem" tabIndex={0}>
              <ListItemText primary="Request a Feature" primaryTypographyProps={{ className: classes.childText }} />
            </ListItem>
          </List>
        </Collapse>

        <div className={classes.navFooter}>
          <Typography className={classes.navFooterText}>Platform Engineering · Rohid Dev</Typography>
        </div>
      </nav>

      {/* ═══════ MAIN CONTENT ═══════ */}
      <main className={classes.content} aria-label="Page content">

        {/* Notification banner */}
        {!bannerDismissed && (() => {
          const b = banners[bannerIndex];
          const s = BANNER_STYLES[b.type] ?? BANNER_STYLES.info;
          return (
            <div className={classes.banner} style={{ backgroundColor: s.bg }}>
              <Icon style={{ color: s.color, fontSize: 18 }}>{b.icon}</Icon>
              <Typography className={classes.bannerMessage} style={{ color: s.color }}>{b.message}</Typography>
              {banners.length > 1 && (
                <>
                  <button className={classes.bannerNav} style={{ color: s.color }} onClick={() => setBannerIndex(i => (i - 1 + banners.length) % banners.length)} aria-label="Previous"><Icon style={{ fontSize: 16 }}>chevron_left</Icon></button>
                  <Typography style={{ fontSize: 11, color: s.color, opacity: 0.7 }}>{bannerIndex + 1}/{banners.length}</Typography>
                  <button className={classes.bannerNav} style={{ color: s.color }} onClick={() => setBannerIndex(i => (i + 1) % banners.length)} aria-label="Next"><Icon style={{ fontSize: 16 }}>chevron_right</Icon></button>
                </>
              )}
              <button className={classes.bannerNav} style={{ color: s.color }} onClick={() => setBannerDismissed(true)} aria-label="Dismiss"><Icon style={{ fontSize: 16 }}>close</Icon></button>
            </div>
          );
        })()}

        <div className={classes.pageInner}>
          {displayName && (
            <div className={classes.topbar}>
              <div className={classes.userChip}>
                <div className={classes.avatar} aria-hidden="true">{initials || '?'}</div>
                <Typography className={classes.userDisplayName}>{displayName}</Typography>
              </div>
            </div>
          )}

          {/* ══ PAGE: Hoover Services ══ */}
          {activePage === 'github' && (
            <>
              <div className={classes.hero}>
                <div className={classes.heroLeft}>
                  {displayName && <Typography className={classes.heroGreeting}>Welcome back, {displayName.split(' ')[0]}</Typography>}
                  <Typography className={classes.heroTitle}>Developer Self-Service Portal</Typography>
                  <Typography className={classes.heroSubtitle}>Provision GitHub repositories, manage teams, and automate platform tasks — all from one place. No tickets, no waiting.</Typography>
                </div>
                <div className={classes.heroIconBox}><Icon className={classes.heroIcon}>developer_board</Icon></div>
              </div>
              <PageHeader icon="code" title="Hoover Services" subtitle="Provision and manage GitHub repositories with Okta groups and GitHub Teams — built-in approval workflows included." />
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={4}><ServiceCard service={CREATE_REPO_SERVICE} /></Grid>
              </Grid>
            </>
          )}

          {/* ══ PAGE: Fuse Services — Onboarding-Request ══ */}
          {activePage === 'fuse-onboarding-request' && (
            <>
              <PageHeader icon="dns" title="Fuse Services" subtitle="Onboard and manage services on the Fuse platform — namespace setup, service mesh, and more." />
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={4}><ServiceCard service={FUSE_ONBOARDING_SERVICE} /></Grid>
              </Grid>
            </>
          )}

          {/* ══ PAGE: Fuse Services — Onboarding-Review ══ */}
          {activePage === 'fuse-onboarding-review' && (
            <>
              <PageHeader
                icon="fact_check"
                title="Onboarding Requests"
                subtitle={isPaasAdmin ? 'Review and action namespace onboarding requests.' : 'View all namespace onboarding requests.'}
              />

              {reviewLoading ? (
                <div className={classes.reviewLoading}><CircularProgress size={32} style={{ color: '#00965E' }} /></div>
              ) : (
                <div className={classes.reviewTableWrap}>
                  <table className={classes.reviewTable}>
                    <thead>
                      <tr>
                        <th className={classes.reviewTh}>Status</th>
                        <th className={classes.reviewTh}>SYS ID</th>
                        <th className={classes.reviewTh}>App Key</th>
                        <th className={classes.reviewTh}>App Name</th>
                        <th className={classes.reviewTh}>Cluster</th>
                        <th className={classes.reviewTh}>Cluster Zone</th>
                        <th className={classes.reviewTh}>Subdomain</th>
                        <th className={classes.reviewTh}>Requestor</th>
                        <th className={classes.reviewTh}>Reviewer</th>
                        <th className={classes.reviewTh}>Date Requested</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reviewRequests.length === 0 ? (
                        <tr><td colSpan={10} className={classes.reviewEmpty}>No requests found.</td></tr>
                      ) : reviewRequests.map(r => {
                        const sc = STATUS_CHIP[r.status];
                        return (
                          <tr key={r.sysId} className={classes.reviewRow} onClick={() => { setSelectedRequest(r); setRejectFormOpen(false); setRejectReason(''); }}>
                            <td className={classes.reviewTd}>
                              <Chip label={r.status} size="small" className={classes.statusChip} style={{ backgroundColor: sc.bg, color: sc.color }} />
                            </td>
                            <td className={classes.reviewTd}><strong>{r.sysId}</strong></td>
                            <td className={classes.reviewTd}>{r.appKey}</td>
                            <td className={classes.reviewTd}>{r.appName}</td>
                            <td className={classes.reviewTd}>{r.cluster}</td>
                            <td className={classes.reviewTd}>{r.clusterZone}</td>
                            <td className={classes.reviewTd}>{r.subdomain}</td>
                            <td className={classes.reviewTd}>{r.requestor}</td>
                            <td className={classes.reviewTd}>{r.reviewer ?? '—'}</td>
                            <td className={classes.reviewTd}>{formatDate(r.dateRequested)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Detail Dialog */}
              <Dialog open={!!selectedRequest} onClose={() => { setSelectedRequest(null); setRejectFormOpen(false); setRejectReason(''); }} maxWidth="sm" fullWidth>
                {selectedRequest && (() => {
                  const sc = STATUS_CHIP[selectedRequest.status];
                  return (
                    <>
                      <DialogTitle disableTypography>
                        <div className={classes.dialogHeader}>
                          <div>
                            <Typography className={classes.dialogSysId}>{selectedRequest.sysId}</Typography>
                            <Typography className={classes.dialogDate}>Last update: {formatDate(selectedRequest.dateRequested)}</Typography>
                          </div>
                          <Chip label={selectedRequest.status} size="small" className={classes.statusChip} style={{ backgroundColor: sc.bg, color: sc.color }} />
                        </div>
                      </DialogTitle>
                      <DialogContent dividers>
                        <Typography className={classes.dialogSectionTitle}>Onboarding Request</Typography>
                        <div className={classes.dialogGrid}>
                          {[
                            ['SYS ID', selectedRequest.sysId],
                            ['App Key', selectedRequest.appKey],
                            ['App Name', selectedRequest.appName],
                            ['Cluster', selectedRequest.cluster],
                            ['PaaS Cluster Zone', selectedRequest.clusterZone],
                            ['App Type', selectedRequest.appType],
                            ['Active Cluster', selectedRequest.activeCluster],
                            ['Town', selectedRequest.town],
                            ['Sub Domain', selectedRequest.subdomain],
                            ['Demand Number', selectedRequest.demandNumber],
                            ['Gloo Mesh', selectedRequest.glooMesh],
                          ].map(([label, value]) => (
                            <div key={label} className={classes.dialogField}>
                              <span className={classes.dialogLabel}>{label}</span>
                              <span className={classes.dialogValue}>{value}</span>
                            </div>
                          ))}
                        </div>
                        <div className={classes.dialogField} style={{ marginTop: 8 }}>
                          <span className={classes.dialogLabel}>Description</span>
                          <span className={classes.dialogValue}>{selectedRequest.description}</span>
                        </div>

                        <Typography className={classes.dialogSectionTitle}>AD Groups</Typography>
                        <div className={classes.dialogGrid}>
                          {[
                            ['Primary Approver', selectedRequest.primaryApprover],
                            ['Secondary Approver', selectedRequest.secondaryApprover],
                          ].map(([label, value]) => (
                            <div key={label} className={classes.dialogField}>
                              <span className={classes.dialogLabel}>{label}</span>
                              <span className={classes.dialogValue}>{value}</span>
                            </div>
                          ))}
                        </div>

                        {selectedRequest.rejectionReason && (
                          <>
                            <Typography className={classes.dialogSectionTitle}>Rejection Reason</Typography>
                            <div className={classes.dialogField}>
                              <span className={classes.dialogValue}>{selectedRequest.rejectionReason}</span>
                            </div>
                          </>
                        )}

                        {/* Reject reason form (admin only, pending only) */}
                        {isPaasAdmin && selectedRequest.status === 'Pending Approval' && rejectFormOpen && (
                          <div className={classes.rejectForm}>
                            <Typography style={{ fontSize: 13, fontWeight: 600, color: '#c62828', marginBottom: 8 }}>Rejection Reason *</Typography>
                            <textarea
                              className={classes.rejectInput}
                              placeholder="Provide a clear reason for rejection..."
                              value={rejectReason}
                              onChange={e => setRejectReason(e.target.value)}
                            />
                          </div>
                        )}
                      </DialogContent>

                      <DialogActions style={{ padding: '12px 24px' }}>
                        {isPaasAdmin && selectedRequest.status === 'Pending Approval' && (
                          rejectFormOpen ? (
                            <>
                              <Button onClick={() => { setRejectFormOpen(false); setRejectReason(''); }} disabled={actionLoading} style={{ textTransform: 'none' }}>Cancel</Button>
                              <Button variant="contained" className={classes.rejectBtn} onClick={() => handleReject(selectedRequest.sysId)} disabled={!rejectReason.trim() || actionLoading}>
                                {actionLoading ? <CircularProgress size={16} /> : 'Confirm Rejection'}
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button variant="outlined" className={classes.rejectBtn} onClick={() => setRejectFormOpen(true)}>Reject</Button>
                              <Button variant="contained" className={classes.approveBtn} onClick={() => handleApprove(selectedRequest.sysId)} disabled={actionLoading}>
                                {actionLoading ? <CircularProgress size={16} /> : 'Approve'}
                              </Button>
                            </>
                          )
                        )}
                        <Button onClick={() => { setSelectedRequest(null); setRejectFormOpen(false); setRejectReason(''); }} style={{ textTransform: 'none', marginLeft: 'auto' }}>Close</Button>
                      </DialogActions>
                    </>
                  );
                })()}
              </Dialog>
            </>
          )}

          {/* ══ PAGE: TEMS ══ */}
          {TEMS_SERVICES.map(svc => activePage === svc.id && (
            <React.Fragment key={svc.id}>
              <PageHeader icon="science" title="TEMS" subtitle="Test Environment Management System — reserve environments, manage test data, and run performance tests." />
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={4}><ServiceCard service={svc} /></Grid>
              </Grid>
            </React.Fragment>
          ))}

          {/* ══ PAGE: Video Guides ══ */}
          {activePage === 'videos' && (
            <>
              <PageHeader icon="ondemand_video" title="Video Guides" subtitle="Step-by-step walkthroughs for common platform tasks — watch at your own pace." />
              <div className={classes.videoGrid}>
                {[
                  { title: 'Creating a GitHub Repository', desc: 'Learn how to provision a new repo with Okta groups and GitHub Teams using the self-service form.', duration: '4:12' },
                  { title: 'Managing GitHub Teams & Permissions', desc: 'Understand how Developers and Admins groups map to GitHub Team roles.', duration: '3:45' },
                  { title: 'Harness IDP Workflow Overview', desc: 'A quick tour of the IDP scaffolder and how platform workflows are triggered.', duration: '6:30' },
                  { title: 'Okta Group Provisioning Deep Dive', desc: 'How Okta groups are created, named, and linked to GitHub Teams automatically.', duration: '5:00' },
                ].map(v => (
                  <div key={v.title} className={classes.videoCard}>
                    <div className={classes.videoThumb}>
                      <Icon className={classes.videoThumbIcon}>play_circle_filled</Icon>
                      <span className={classes.videoDuration}>{v.duration}</span>
                    </div>
                    <div className={classes.videoBody}>
                      <Typography className={classes.videoTitle}>{v.title}</Typography>
                      <Typography className={classes.videoDesc}>{v.desc}</Typography>
                      <a href="#" className={classes.videoWatchBtn}><Icon style={{ fontSize: 14 }}>play_arrow</Icon> Watch</a>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ══ PAGE: Contact Us ══ */}
          {activePage === 'contact' && (
            <>
              <PageHeader icon="support_agent" title="Contact Us" subtitle="Reach the Platform Engineering team through any of these channels." />
              <div className={classes.contactGrid}>
                {[
                  { icon: 'chat', label: 'Slack', value: '#platform-engineering', link: '#', linkLabel: 'Open Slack' },
                  { icon: 'email', label: 'Email', value: 'platform-eng@company.com', link: 'mailto:platform-eng@company.com', linkLabel: 'Send Email' },
                  { icon: 'bug_report', label: 'Jira', value: 'Platform Engineering board', link: '#', linkLabel: 'Open Jira' },
                  { icon: 'groups', label: 'Office Hours', value: 'Wednesdays 14:00–15:00 UTC', link: '#', linkLabel: 'Join Call' },
                ].map(c => (
                  <div key={c.label} className={classes.contactCard}>
                    <Icon className={classes.contactIcon}>{c.icon}</Icon>
                    <Typography className={classes.contactLabel}>{c.label}</Typography>
                    <Typography className={classes.contactValue}>{c.value}</Typography>
                    <a href={c.link} className={classes.contactLink}>{c.linkLabel} →</a>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ══ PAGE: Request a Feature ══ */}
          {activePage === 'request-feature' && (
            <>
              <PageHeader icon="lightbulb" title="Request a Feature" subtitle="Tell us what would make the portal more useful. We review every submission." />
              {featureForm.submitted ? (
                <div className={classes.successBox}>
                  <Icon style={{ color: '#00965E', fontSize: 28 }}>check_circle</Icon>
                  <div>
                    <Typography style={{ fontWeight: 700, color: '#007A4D' }}>Request submitted!</Typography>
                    <Typography style={{ fontSize: 13, color: '#555' }}>Thanks — the Platform Engineering team will review your idea.</Typography>
                  </div>
                </div>
              ) : (
                <div className={classes.featureForm}>
                  <div>
                    <Typography className={classes.formLabel}>Feature title *</Typography>
                    <input className={classes.formInput} placeholder="e.g. Archive Repository service" value={featureForm.title} onChange={e => setFeatureForm(f => ({ ...f, title: e.target.value }))} />
                  </div>
                  <div>
                    <Typography className={classes.formLabel}>Description *</Typography>
                    <textarea className={classes.formTextarea} placeholder="Describe the feature and why it would be useful..." value={featureForm.description} onChange={e => setFeatureForm(f => ({ ...f, description: e.target.value }))} />
                  </div>
                  <button className={classes.submitBtn} disabled={!featureForm.title.trim() || !featureForm.description.trim()} onClick={() => setFeatureForm(f => ({ ...f, submitted: true }))}>Submit Request</button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
