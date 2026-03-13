import React, { useEffect, useState } from 'react';
import {
  Divider,
  Grid,
  Icon,
  ListItem,
  ListItemText,
  Typography,
  makeStyles,
} from '@material-ui/core';
import { useApi, identityApiRef } from '@backstage/core-plugin-api';
import { PageHeader } from './PageHeader';
import { ServiceCard, Service } from './ServiceCard';

// ── Update this URL after registering the workflow in Harness IDP ─────────────
// Format: https://app.harness.io/ng/account/<ACCOUNT_ID>/module/idp/orgs/default/
//         projects/platform_engineering/workflows/<WORKFLOW_IDENTIFIER>
const CREATE_REPO_WORKFLOW_URL =
  'https://app.harness.io/ng/account/YOUR_ACCOUNT_ID/module/idp/orgs/default/projects/platform_engineering/workflows/github_repo_okta_teams_provisioner';
// ─────────────────────────────────────────────────────────────────────────────

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
    gap: theme.spacing(1),
    padding: theme.spacing(1, 1.5, 0.5, 2),
  },
  sectionIcon: { color: '#fff', fontSize: 18 },
  sectionLabel: {
    fontSize: 12,
    fontWeight: 700,
    color: '#fff',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  },
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
  childText: {
    fontSize: 13,
    color: '#fff',
    fontWeight: 600,
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
  const [displayName, setDisplayName] = useState<string>('');

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
            <Typography className={classes.navSubtitle}>GitHub Services</Typography>
          </div>
        </div>

        <Divider className={classes.navDivider} />

        {/* GitHub Services section */}
        <div
          className={classes.sectionHeader}
          role="presentation"
        >
          <Icon className={classes.sectionIcon} aria-hidden="true">code</Icon>
          <Typography className={classes.sectionLabel}>GitHub Services</Typography>
        </div>

        <ListItem
          className={classes.childItem}
          disableGutters
          role="menuitem"
          aria-current="page"
          tabIndex={0}
        >
          <ListItemText
            primary="Create Repository"
            primaryTypographyProps={{ className: classes.childText }}
          />
        </ListItem>

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
        <div className={classes.pageInner}>
          {/* User identity chip */}
          {displayName && (
            <div className={classes.topbar}>
              <div className={classes.userChip}>
                <div className={classes.avatar} aria-hidden="true">
                  {initials || '?'}
                </div>
                <Typography className={classes.userDisplayName}>
                  {displayName}
                </Typography>
              </div>
            </div>
          )}

          {/* ── Hero banner ── */}
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
            title="GitHub Services"
            subtitle="Provision and manage GitHub repositories with Okta groups and GitHub Teams — built-in approval workflows included."
          />

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={4}>
              <ServiceCard service={CREATE_REPO_SERVICE} />
            </Grid>
          </Grid>
        </div>
      </main>
    </div>
  );
}
