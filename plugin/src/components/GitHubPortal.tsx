import React, { useEffect, useState } from 'react';
import {
  Collapse,
  Divider,
  Grid,
  Icon,
  List,
  ListItem,
  ListItemText,
  Typography,
  makeStyles,
} from '@material-ui/core';
import { useApi, identityApiRef } from '@backstage/core-plugin-api';
import { PageHeader } from './PageHeader';
import { ServiceCard, Service } from './ServiceCard';

// ── Notification banners ──────────────────────────────────────────────────────
// Fallback banners shown when API is unavailable or not yet configured.
// TODO: set NOTIFICATIONS_API_ENABLED = true once proxy is set up in Harness IDP:
//   app-config.yaml → proxy → '/notifications-api': target: 'https://your-api.com'
// Expected API response: GET /api/proxy/notifications-api/banners
//   [{ "type": "info"|"maintenance"|"new", "icon": "<material-icon>", "message": "..." }]
const NOTIFICATIONS_API_ENABLED: boolean = false;
const NOTIFICATIONS_API_PATH = '/api/proxy/notifications-api/banners';

const FALLBACK_BANNERS = [
  { type: 'info',        icon: 'info',           message: 'GitHub Self-Service Portal is now live. Create repositories with Okta groups and GitHub Teams from a single form.' },
  { type: 'maintenance', icon: 'build',           message: 'Scheduled maintenance: Nexus Repository Manager will be unavailable Saturday 08:00–10:00 UTC.' },
  { type: 'new',         icon: 'new_releases',    message: 'New: Archive Repository service coming soon — stay tuned.' },
];
const BANNER_STYLES: Record<string, { bg: string; color: string }> = {
  info:        { bg: '#e3f2fd', color: '#1565c0' },
  maintenance: { bg: '#fff3e0', color: '#e65100' },
  new:         { bg: '#E6F5EF', color: '#007A4D' },
};
// ─────────────────────────────────────────────────────────────────────────────

// ── Update this URL after registering the workflow in Harness IDP ─────────────
// Format: https://app.harness.io/ng/account/<ACCOUNT_ID>/module/idp/orgs/default/
//         projects/platform_engineering/workflows/<WORKFLOW_IDENTIFIER>
const CREATE_REPO_WORKFLOW_URL =
  'https://app.harness.io/ng/account/YOUR_ACCOUNT_ID/module/idp/orgs/default/projects/platform_engineering/workflows/github_repo_okta_teams_provisioner';
// ─────────────────────────────────────────────────────────────────────────────

const TMS_SERVICES: Service[] = [
  {
    id: 'tms-reserve-env',
    title: 'Reserve Environment',
    description:
      'Reserve a dedicated test environment for your application. Select environment tier, duration, and required integrations.',
    icon: 'science',
    status: 'available',
    actionLabel: 'Reserve Environment',
    actionUrl: '#',
    tags: ['testing', 'environment', 'qa'],
  },
  {
    id: 'tms-test-data',
    title: 'Test Data Management',
    description:
      'Request and manage test data sets for your application. Create, clone, or refresh test data in lower environments on demand.',
    icon: 'dataset',
    status: 'available',
    actionLabel: 'Manage Test Data',
    actionUrl: '#',
    tags: ['testing', 'data', 'qa'],
  },
  {
    id: 'tms-perf-testing',
    title: 'Performance Testing',
    description:
      'Submit load, stress, and soak test requests for your service. Configure test parameters and view results directly from the portal.',
    icon: 'speed',
    status: 'available',
    actionLabel: 'Run Performance Test',
    actionUrl: '#',
    tags: ['performance', 'load-test', 'qa'],
  },
];

const FUSE_ONBOARDING_SERVICE: Service = {
  id: 'fuse-onboarding',
  title: 'Onboarding',
  description:
    'Onboard a new service onto the Fuse platform — register your application, configure namespace, and set up service mesh integration from a single form.',
  icon: 'rocket_launch',
  status: 'available',
  actionLabel: 'Start Onboarding',
  actionUrl: '#',
  tags: ['fuse', 'kubernetes', 'namespace', 'service-mesh'],
};

const CREATE_REPO_SERVICE: Service = {
  id: 'create-repository',
  title: 'Create Repository',
  description:
    'Provision a new GitHub repository with Okta Developer and Admin groups, matching GitHub Teams, and correct permissions — all from a single form.',
  icon: 'create_new_folder',
  status: 'available',
  actionLabel: 'Create Repository',
  actionUrl: CREATE_REPO_WORKFLOW_URL,
  tags: ['github', 'okta', 'teams', 'provisioning'],
};

const NAV_WIDTH = 240;

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#ffffff',
  },

  // ── Left nav ─────────────────────────────────────────────────────────────
  nav: {
    width: NAV_WIDTH,
    flexShrink: 0,
    backgroundColor: '#00965E',
    color: '#fff',
    display: 'flex',
    flexDirection: 'column',
    position: 'sticky',
    top: 0,
    height: '100vh',
    overflowY: 'auto',
  },
  navLogo: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1.5),
    padding: theme.spacing(2.5, 2.5, 2),
  },
  navLogoIcon: {
    width: 36,
    height: 36,
    backgroundColor: '#007A4D',
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navTitle: {
    fontWeight: 800,
    fontSize: 15,
    color: '#fff',
    lineHeight: 1.2,
  },
  navSubtitle: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.85)',
  },
  navDivider: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    margin: theme.spacing(1, 2),
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing(1, 1.5, 0.5, 2),
    cursor: 'pointer',
    userSelect: 'none' as const,
    '&:hover': { backgroundColor: 'rgba(0,0,0,0.08)' },
  },
  sectionHeaderLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
  },
  sectionIcon: { color: '#fff', fontSize: 18 },
  sectionLabel: {
    fontSize: 12,
    fontWeight: 700,
    color: '#fff',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.06em',
  },
  chevron: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: '16px !important',
    transition: 'transform 0.2s',
    marginRight: theme.spacing(0.5),
  },
  chevronOpen: { transform: 'rotate(180deg)' },
  childItem: {
    borderRadius: 8,
    margin: theme.spacing(0.2, 1, 0.2, 2.5),
    padding: theme.spacing(0.75, 1.5),
    cursor: 'pointer',
    transition: 'background 0.15s',
    backgroundColor: 'rgba(0,122,77,0.35)',
    borderLeft: '3px solid #80CBA8',
    '&:hover': { backgroundColor: 'rgba(0,122,77,0.45)' },
  },
  childItemActive: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderLeft: '3px solid #fff',
  },
  childText: {
    fontSize: 13,
    color: '#fff',
    fontWeight: 600,
  },
  navDividerSpacing: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    margin: theme.spacing(1.5, 2, 0.5),
  },

  // ── Contact Us page ──────────────────────────────────────────────────────
  contactGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: theme.spacing(2.5),
    marginTop: theme.spacing(3),
  },
  contactCard: {
    border: '1px solid #e8eaed',
    borderRadius: 12,
    padding: theme.spacing(3),
    display: 'flex',
    flexDirection: 'column' as const,
    gap: theme.spacing(1),
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    transition: 'transform 0.15s, box-shadow 0.15s',
    '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' },
  },
  contactIcon: { color: '#00965E', fontSize: 28 },
  contactLabel: { fontWeight: 700, fontSize: 15, color: '#1a1a1a' },
  contactValue: { fontSize: 13, color: '#555' },
  contactLink: {
    marginTop: 'auto',
    display: 'inline-block',
    fontSize: 13,
    fontWeight: 600,
    color: '#00965E',
    textDecoration: 'none',
    '&:hover': { textDecoration: 'underline' },
  },

  // ── Request a Feature page ───────────────────────────────────────────────
  featureForm: {
    maxWidth: 560,
    marginTop: theme.spacing(3),
    display: 'flex',
    flexDirection: 'column' as const,
    gap: theme.spacing(2),
  },
  formLabel: { fontWeight: 600, fontSize: 13, color: '#1a1a1a', marginBottom: 4 },
  formInput: {
    width: '100%',
    padding: '10px 12px',
    border: '1.5px solid #e8eaed',
    borderRadius: 8,
    fontSize: 13,
    fontFamily: 'inherit',
    outline: 'none',
    '&:focus': { borderColor: '#00965E' },
  },
  formTextarea: {
    width: '100%',
    padding: '10px 12px',
    border: '1.5px solid #e8eaed',
    borderRadius: 8,
    fontSize: 13,
    fontFamily: 'inherit',
    resize: 'vertical' as const,
    minHeight: 100,
    outline: 'none',
    '&:focus': { borderColor: '#00965E' },
  },
  submitBtn: {
    alignSelf: 'flex-start',
    backgroundColor: '#00965E',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    padding: '10px 24px',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    '&:hover': { backgroundColor: '#007A4D' },
    '&:disabled': { opacity: 0.5, cursor: 'not-allowed' },
  },
  successBox: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1.5),
    backgroundColor: '#E6F5EF',
    border: '1px solid #b2dfdb',
    borderRadius: 10,
    padding: theme.spacing(2),
    marginTop: theme.spacing(2),
  },

  // ── Video Guides page ────────────────────────────────────────────────────
  videoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: theme.spacing(2.5),
    marginTop: theme.spacing(3),
  },
  videoCard: {
    border: '1px solid #e8eaed',
    borderRadius: 12,
    overflow: 'hidden',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    transition: 'transform 0.15s, box-shadow 0.15s',
    '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' },
  },
  videoThumb: {
    backgroundColor: '#E6F5EF',
    height: 120,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative' as const,
  },
  videoThumbIcon: { color: '#00965E', fontSize: '48px !important' },
  videoDuration: {
    position: 'absolute' as const,
    bottom: 8,
    right: 10,
    fontSize: 11,
    fontWeight: 700,
    backgroundColor: 'rgba(0,0,0,0.55)',
    color: '#fff',
    padding: '2px 6px',
    borderRadius: 4,
  },
  videoBody: { padding: theme.spacing(2) },
  videoTitle: { fontWeight: 700, fontSize: 14, color: '#1a1a1a', marginBottom: 4 },
  videoDesc: { fontSize: 12, color: '#666', lineHeight: 1.5, marginBottom: theme.spacing(1.5) },
  videoWatchBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    fontSize: 12,
    fontWeight: 600,
    color: '#00965E',
    textDecoration: 'none',
    '&:hover': { textDecoration: 'underline' },
  },
  navFooter: {
    marginTop: 'auto',
    padding: theme.spacing(2),
    borderTop: '1px solid rgba(255,255,255,0.08)',
  },
  navFooterText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
  },

  // ── Topbar ────────────────────────────────────────────────────────────────
  topbar: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: theme.spacing(2),
  },
  userChip: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    background: '#fff',
    border: '1.5px solid #e8eaed',
    borderRadius: 24,
    padding: '5px 12px 5px 6px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: '50%',
    backgroundColor: '#00965E',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 11,
    fontWeight: 700,
    color: '#fff',
    flexShrink: 0,
  },
  userDisplayName: {
    fontSize: 13,
    color: '#1a1a1a',
    fontWeight: 600,
    whiteSpace: 'nowrap' as const,
  },

  // ── Content ───────────────────────────────────────────────────────────────
  content: {
    flexGrow: 1,
    overflowY: 'auto',
    maxWidth: `calc(100% - ${NAV_WIDTH}px)`,
  },
  pageInner: {
    padding: theme.spacing(4),
  },

  // ── Notification banner ───────────────────────────────────────────────────
  banner: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1.5),
    padding: theme.spacing(1, 3),
    fontSize: 12.5,
  },
  bannerMessage: {
    flex: 1,
    fontSize: 13,
    fontWeight: 500,
  },
  bannerNav: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 2,
    display: 'flex',
    alignItems: 'center',
    opacity: 0.6,
    '&:hover': { opacity: 1 },
  },

  // ── Hero banner ───────────────────────────────────────────────────────────
  hero: {
    background: 'linear-gradient(135deg, #00965E 0%, #007A4D 100%)',
    borderRadius: 16,
    padding: theme.spacing(4, 5),
    marginBottom: theme.spacing(4),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    color: '#fff',
  },
  heroLeft: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: theme.spacing(1),
  },
  heroGreeting: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: 500,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: 800,
    color: '#fff',
    lineHeight: 1.2,
  },
  heroSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    maxWidth: 480,
    lineHeight: 1.6,
  },
  heroIconBox: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  heroIcon: {
    fontSize: '44px !important',
    color: '#fff',
  },
}));

export function GitHubPortal() {
  const classes = useStyles();

  const identityApi = useApi(identityApiRef);
  const [activePage, setActivePage] = useState('github');
  const [displayName, setDisplayName] = useState<string>('');
  const [bannerIndex, setBannerIndex] = useState(0);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [banners, setBanners] = useState(FALLBACK_BANNERS);
  const [featureForm, setFeatureForm] = useState({ title: '', description: '', submitted: false });
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    github:    true,
    fuse:      false,
    tms:       false,
    resources: false,
    help:      false,
  });
  const toggleSection = (id: string) =>
    setOpenSections(s => ({ ...s, [id]: !s[id] }));

  useEffect(() => {
    if (!NOTIFICATIONS_API_ENABLED) return;
    fetch(NOTIFICATIONS_API_PATH)
      .then(r => r.json())
      .then(data => { if (Array.isArray(data) && data.length > 0) setBanners(data); })
      .catch(() => {}); // silently fall back to FALLBACK_BANNERS
  }, []);

  useEffect(() => {
    identityApi
      .getProfileInfo()
      .then(p => setDisplayName(p.displayName ?? p.email ?? ''))
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initials = displayName
    .split(' ')
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() ?? '')
    .join('');

  return (
    <div className={classes.root}>
      {/* ═══════════════════════════════════════
          LEFT NAVIGATION
      ═══════════════════════════════════════ */}
      <nav className={classes.nav} aria-label="Main navigation">
        {/* Logo */}
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
        <div
          className={classes.sectionHeader}
          onClick={() => toggleSection('github')}
          role="button"
          aria-expanded={openSections.github}
          tabIndex={0}
          onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleSection('github'); } }}
        >
          <div className={classes.sectionHeaderLeft}>
            <Icon className={classes.sectionIcon} aria-hidden="true">code</Icon>
            <Typography className={classes.sectionLabel}>Hoover Services</Typography>
          </div>
          <Icon className={`${classes.chevron} ${openSections.github ? classes.chevronOpen : ''}`} aria-hidden="true">expand_more</Icon>
        </div>
        <Collapse in={openSections.github} timeout="auto">
          <List disablePadding>
            <ListItem
              className={`${classes.childItem} ${activePage === 'github' ? classes.childItemActive : ''}`}
              onClick={() => setActivePage('github')}
              disableGutters role="menuitem" tabIndex={0}
            >
              <ListItemText primary="Create Repository" primaryTypographyProps={{ className: classes.childText }} />
            </ListItem>
          </List>
        </Collapse>

        <Divider className={classes.navDividerSpacing} />

        {/* Fuse Services */}
        <div
          className={classes.sectionHeader}
          onClick={() => toggleSection('fuse')}
          role="button"
          aria-expanded={openSections.fuse}
          tabIndex={0}
          onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleSection('fuse'); } }}
        >
          <div className={classes.sectionHeaderLeft}>
            <Icon className={classes.sectionIcon} aria-hidden="true">dns</Icon>
            <Typography className={classes.sectionLabel}>Fuse Services</Typography>
          </div>
          <Icon className={`${classes.chevron} ${openSections.fuse ? classes.chevronOpen : ''}`} aria-hidden="true">expand_more</Icon>
        </div>
        <Collapse in={openSections.fuse} timeout="auto">
          <List disablePadding>
            <ListItem
              className={`${classes.childItem} ${activePage === 'fuse-onboarding' ? classes.childItemActive : ''}`}
              onClick={() => setActivePage('fuse-onboarding')}
              disableGutters role="menuitem" tabIndex={0}
            >
              <ListItemText primary="Onboarding" primaryTypographyProps={{ className: classes.childText }} />
            </ListItem>
          </List>
        </Collapse>

        <Divider className={classes.navDividerSpacing} />

        {/* TMS */}
        <div
          className={classes.sectionHeader}
          onClick={() => toggleSection('tms')}
          role="button"
          aria-expanded={openSections.tms}
          tabIndex={0}
          onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleSection('tms'); } }}
        >
          <div className={classes.sectionHeaderLeft}>
            <Icon className={classes.sectionIcon} aria-hidden="true">science</Icon>
            <Typography className={classes.sectionLabel}>TMS</Typography>
          </div>
          <Icon className={`${classes.chevron} ${openSections.tms ? classes.chevronOpen : ''}`} aria-hidden="true">expand_more</Icon>
        </div>
        <Collapse in={openSections.tms} timeout="auto">
          <List disablePadding>
            <ListItem
              className={`${classes.childItem} ${activePage === 'tms-reserve-env' ? classes.childItemActive : ''}`}
              onClick={() => setActivePage('tms-reserve-env')}
              disableGutters role="menuitem" tabIndex={0}
            >
              <ListItemText primary="Reserve Environment" primaryTypographyProps={{ className: classes.childText }} />
            </ListItem>
          </List>
        </Collapse>

        <Divider className={classes.navDividerSpacing} />

        {/* Resources */}
        <div
          className={classes.sectionHeader}
          onClick={() => toggleSection('resources')}
          role="button"
          aria-expanded={openSections.resources}
          tabIndex={0}
          onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleSection('resources'); } }}
        >
          <div className={classes.sectionHeaderLeft}>
            <Icon className={classes.sectionIcon} aria-hidden="true">ondemand_video</Icon>
            <Typography className={classes.sectionLabel}>Resources</Typography>
          </div>
          <Icon className={`${classes.chevron} ${openSections.resources ? classes.chevronOpen : ''}`} aria-hidden="true">expand_more</Icon>
        </div>
        <Collapse in={openSections.resources} timeout="auto">
          <List disablePadding>
            <ListItem
              className={`${classes.childItem} ${activePage === 'videos' ? classes.childItemActive : ''}`}
              onClick={() => setActivePage('videos')}
              disableGutters role="menuitem" tabIndex={0}
            >
              <ListItemText primary="Video Guides" primaryTypographyProps={{ className: classes.childText }} />
            </ListItem>
          </List>
        </Collapse>

        <Divider className={classes.navDividerSpacing} />

        {/* Help & Feedback */}
        <div
          className={classes.sectionHeader}
          onClick={() => toggleSection('help')}
          role="button"
          aria-expanded={openSections.help}
          tabIndex={0}
          onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleSection('help'); } }}
        >
          <div className={classes.sectionHeaderLeft}>
            <Icon className={classes.sectionIcon} aria-hidden="true">help_outline</Icon>
            <Typography className={classes.sectionLabel}>Help &amp; Feedback</Typography>
          </div>
          <Icon className={`${classes.chevron} ${openSections.help ? classes.chevronOpen : ''}`} aria-hidden="true">expand_more</Icon>
        </div>
        <Collapse in={openSections.help} timeout="auto">
          <List disablePadding>
            <ListItem
              className={`${classes.childItem} ${activePage === 'contact' ? classes.childItemActive : ''}`}
              onClick={() => setActivePage('contact')}
              disableGutters role="menuitem" tabIndex={0}
            >
              <ListItemText primary="Contact Us" primaryTypographyProps={{ className: classes.childText }} />
            </ListItem>
            <ListItem
              className={`${classes.childItem} ${activePage === 'request-feature' ? classes.childItemActive : ''}`}
              onClick={() => setActivePage('request-feature')}
              disableGutters role="menuitem" tabIndex={0}
            >
              <ListItemText primary="Request a Feature" primaryTypographyProps={{ className: classes.childText }} />
            </ListItem>
          </List>
        </Collapse>

        {/* Footer */}
        <div className={classes.navFooter}>
          <Typography className={classes.navFooterText}>
            Platform Engineering · Rohid Dev
          </Typography>
        </div>
      </nav>

      {/* ═══════════════════════════════════════
          MAIN CONTENT
      ═══════════════════════════════════════ */}
      <main className={classes.content} aria-label="Page content">

        {/* ── Notification banner — full width, above page content ── */}
          {!bannerDismissed && (() => {
            const b = banners[bannerIndex];
            const s = BANNER_STYLES[b.type] ?? BANNER_STYLES.info;
            return (
              <div className={classes.banner} style={{ backgroundColor: s.bg }}>
                <Icon style={{ color: s.color, fontSize: 18 }}>{b.icon}</Icon>
                <Typography className={classes.bannerMessage} style={{ color: s.color }}>
                  {b.message}
                </Typography>
                {banners.length > 1 && (
                  <>
                    <button className={classes.bannerNav} style={{ color: s.color }} onClick={() => setBannerIndex(i => (i - 1 + banners.length) % banners.length)} aria-label="Previous">
                      <Icon style={{ fontSize: 16 }}>chevron_left</Icon>
                    </button>
                    <Typography style={{ fontSize: 11, color: s.color, opacity: 0.7 }}>
                      {bannerIndex + 1}/{banners.length}
                    </Typography>
                    <button className={classes.bannerNav} style={{ color: s.color }} onClick={() => setBannerIndex(i => (i + 1) % banners.length)} aria-label="Next">
                      <Icon style={{ fontSize: 16 }}>chevron_right</Icon>
                    </button>
                  </>
                )}
                <button className={classes.bannerNav} style={{ color: s.color }} onClick={() => setBannerDismissed(true)} aria-label="Dismiss">
                  <Icon style={{ fontSize: 16 }}>close</Icon>
                </button>
              </div>
            );
          })()}

        <div className={classes.pageInner}>
          {/* User identity chip */}
          {displayName && (
            <div className={classes.topbar}>
              <div className={classes.userChip}>
                <div className={classes.avatar} aria-hidden="true">{initials || '?'}</div>
                <Typography className={classes.userDisplayName}>{displayName}</Typography>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════
              PAGE: Hoover Services (home)
          ══════════════════════════════════════════ */}
          {activePage === 'github' && (
            <>
              <div className={classes.hero}>
                <div className={classes.heroLeft}>
                  {displayName && (
                    <Typography className={classes.heroGreeting}>
                      Welcome back, {displayName.split(' ')[0]}
                    </Typography>
                  )}
                  <Typography className={classes.heroTitle}>
                    Developer Self-Service Portal
                  </Typography>
                  <Typography className={classes.heroSubtitle}>
                    Provision GitHub repositories, manage teams, and automate platform tasks — all from one place. No tickets, no waiting.
                  </Typography>
                </div>
                <div className={classes.heroIconBox}>
                  <Icon className={classes.heroIcon}>developer_board</Icon>
                </div>
              </div>

              <PageHeader
                icon="code"
                title="Hoover Services"
                subtitle="Provision and manage GitHub repositories with Okta groups and GitHub Teams — built-in approval workflows included."
              />

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={4}>
                  <ServiceCard service={CREATE_REPO_SERVICE} />
                </Grid>
              </Grid>
            </>
          )}

          {/* ══════════════════════════════════════════
              PAGE: TMS
          ══════════════════════════════════════════ */}
          {TMS_SERVICES.map(svc => activePage === svc.id && (
            <React.Fragment key={svc.id}>
              <PageHeader
                icon="science"
                title="TMS"
                subtitle="Test Management Services — reserve environments, manage test data, and run performance tests."
              />
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={4}>
                  <ServiceCard service={svc} />
                </Grid>
              </Grid>
            </React.Fragment>
          ))}

          {/* ══════════════════════════════════════════
              PAGE: Fuse Services — Onboarding
          ══════════════════════════════════════════ */}
          {activePage === 'fuse-onboarding' && (
            <>
              <PageHeader
                icon="dns"
                title="Fuse Services"
                subtitle="Onboard and manage services on the Fuse platform — namespace setup, service mesh, and more."
              />
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={4}>
                  <ServiceCard service={FUSE_ONBOARDING_SERVICE} />
                </Grid>
              </Grid>
            </>
          )}

          {/* ══════════════════════════════════════════
              PAGE: Video Guides
          ══════════════════════════════════════════ */}
          {activePage === 'videos' && (
            <>
              <PageHeader
                icon="ondemand_video"
                title="Video Guides"
                subtitle="Step-by-step walkthroughs for common platform tasks — watch at your own pace."
              />
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
                      <a href="#" className={classes.videoWatchBtn}>
                        <Icon style={{ fontSize: 14 }}>play_arrow</Icon> Watch
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ══════════════════════════════════════════
              PAGE: Contact Us
          ══════════════════════════════════════════ */}
          {activePage === 'contact' && (
            <>
              <PageHeader
                icon="support_agent"
                title="Contact Us"
                subtitle="Reach the Platform Engineering team through any of these channels."
              />
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

          {/* ══════════════════════════════════════════
              PAGE: Request a Feature
          ══════════════════════════════════════════ */}
          {activePage === 'request-feature' && (
            <>
              <PageHeader
                icon="lightbulb"
                title="Request a Feature"
                subtitle="Tell us what would make the portal more useful. We review every submission."
              />
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
                    <input
                      className={classes.formInput}
                      placeholder="e.g. Archive Repository service"
                      value={featureForm.title}
                      onChange={e => setFeatureForm(f => ({ ...f, title: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Typography className={classes.formLabel}>Description *</Typography>
                    <textarea
                      className={classes.formTextarea}
                      placeholder="Describe the feature and why it would be useful..."
                      value={featureForm.description}
                      onChange={e => setFeatureForm(f => ({ ...f, description: e.target.value }))}
                    />
                  </div>
                  <button
                    className={classes.submitBtn}
                    disabled={!featureForm.title.trim() || !featureForm.description.trim()}
                    onClick={() => setFeatureForm(f => ({ ...f, submitted: true }))}
                  >
                    Submit Request
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
