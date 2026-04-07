import React, { useEffect, useRef, useState } from 'react';
import {
  Badge,
  Divider,
  Icon,
  IconButton,
  Popover,
  Tab,
  Tabs,
  Typography,
  makeStyles,
} from '@material-ui/core';
import { useApi, identityApiRef } from '@backstage/core-plugin-api';

import { HooverCreateRepoPage } from './pages/HooverCreateRepoPage';
import { HooverCreateAdGroupPage } from './pages/HooverCreateAdGroupPage';
import { HooverManageUsersPage } from './pages/HooverManageUsersPage';
import { FuseKubernetesPage } from './pages/FuseKubernetesPage';
import { JarvisCloudPage } from './pages/JarvisCloudPage';
import { TemsCreateEnvPage } from './pages/TemsCreateEnvPage';
import { HomePage } from './pages/HomePage';

// ── Navigation structure ──────────────────────────────────────────────────────
interface NavChild {
  id: string;
  label: string;
  page: string;
}
interface NavSection {
  id: string;
  label: string;
  children: NavChild[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    id: 'hoover',
    label: 'Hoover',
    children: [
      { id: 'create-repo',    label: 'Create Repository',       page: 'create-repo'    },
      { id: 'create-adgroup', label: 'Create AD Group',          page: 'create-adgroup' },
      { id: 'manage-users',   label: 'Manage Users in AD Group', page: 'manage-users'   },
    ],
  },
  {
    id: 'fuse',
    label: 'Fuse',
    children: [
      { id: 'k8s-onboarding', label: 'Kubernetes Onboarding', page: 'k8s-onboarding' },
    ],
  },
  {
    id: 'jarvis',
    label: 'Jarvis',
    children: [
      { id: 'public-cloud', label: 'Public Cloud Onboarding', page: 'public-cloud' },
    ],
  },
  {
    id: 'tems',
    label: 'TEMS',
    children: [
      { id: 'create-test-env', label: 'Create Test Env', page: 'create-test-env' },
    ],
  },
];

// ── Notifications ─────────────────────────────────────────────────────────────
type NotifType = 'success' | 'info' | 'warning';

interface Notification {
  id: string;
  type: NotifType;
  title: string;
  body: string;
  time: string;
}

const NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'success',
    title: 'Portal is live',
    body: 'Developer Self-Service Portal is now available. Create repositories with Okta groups and GitHub Teams from a single form.',
    time: 'Today',
  },
  {
    id: '2',
    type: 'info',
    title: 'Public Cloud Onboarding updated',
    body: 'The Jarvis workflow now supports additional cloud regions. Review your infrastructure pattern fitment.',
    time: 'Yesterday',
  },
  {
    id: '3',
    type: 'warning',
    title: 'Create AD Group — coming soon',
    body: 'Active Directory group provisioning is under development and will be available shortly.',
    time: '3 days ago',
  },
];

const NOTIF_ICON: Record<NotifType, string> = {
  success: 'check_circle',
  info:    'info',
  warning: 'schedule',
};
const NOTIF_COLOR: Record<NotifType, string> = {
  success: '#3730A3',
  info:    '#0369A1',
  warning: '#B45309',
};

// ── Page router ───────────────────────────────────────────────────────────────
function PageContent({ page }: { page: string }) {
  switch (page) {
    case 'home':           return <HomePage />;
    case 'create-repo':    return <HooverCreateRepoPage />;
    case 'create-adgroup': return <HooverCreateAdGroupPage />;
    case 'manage-users':   return <HooverManageUsersPage />;
    case 'k8s-onboarding': return <FuseKubernetesPage />;
    case 'public-cloud':   return <JarvisCloudPage />;
    case 'create-test-env':return <TemsCreateEnvPage />;
    default:               return <HomePage />;
  }
}

// ── Styles ────────────────────────────────────────────────────────────────────
const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    backgroundColor: '#f8f9fa',
  },

  // Top nav bar
  topNav: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#1A1A2E',
    padding: theme.spacing(0, 2),
    gap: theme.spacing(2),
    flexShrink: 0,
    minHeight: 52,
    position: 'sticky',
    top: 0,
    zIndex: 100,
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    flexShrink: 0,
    cursor: 'pointer',
    padding: theme.spacing(0.5, 1),
    borderRadius: 6,
    '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
  },
  brandText: {
    color: '#fff',
    fontWeight: 800,
    fontSize: 15,
    whiteSpace: 'nowrap' as const,
  },
  primaryTabs: {
    flex: 1,
    '& .MuiTabs-indicator': { backgroundColor: '#fff', height: 3 },
    '& .MuiTabs-scrollButtons': { color: '#fff' },
  },
  primaryTab: {
    color: 'rgba(255,255,255,0.72)',
    fontWeight: 600,
    fontSize: 13,
    textTransform: 'none' as const,
    minWidth: 'auto',
    padding: theme.spacing(1.5, 2),
    '&.Mui-selected': { color: '#fff' },
  },

  // Bell button
  bellBtn: {
    color: 'rgba(255,255,255,0.8)',
    padding: theme.spacing(0.75),
    flexShrink: 0,
    '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)', color: '#fff' },
  },
  badge: {
    '& .MuiBadge-badge': {
      backgroundColor: '#E53935',
      color: '#fff',
      fontSize: 10,
      minWidth: 16,
      height: 16,
      padding: '0 4px',
    },
  },

  // Notification panel
  notifPanel: {
    width: 360,
  },
  notifHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing(2, 2, 1.5),
  },
  notifTitle: {
    fontWeight: 700,
    fontSize: 15,
    color: '#1a1a1a',
  },
  markRead: {
    fontSize: 12,
    fontWeight: 600,
    color: '#1A1A2E',
    cursor: 'pointer',
    background: 'none',
    border: 'none',
    padding: 0,
    fontFamily: 'inherit',
    '&:hover': { textDecoration: 'underline' },
  },
  notifItem: {
    display: 'flex',
    gap: theme.spacing(1.5),
    padding: theme.spacing(1.5, 2),
    transition: 'background 0.12s',
    '&:hover': { backgroundColor: '#f5f5f5' },
  },
  notifItemUnread: {
    backgroundColor: '#F5F5FF',
    '&:hover': { backgroundColor: '#EDEDFD' },
  },
  notifIconWrap: {
    flexShrink: 0,
    marginTop: 2,
  },
  notifBody: {
    flex: 1,
    minWidth: 0,
  },
  notifItemTitle: {
    fontWeight: 700,
    fontSize: 13,
    color: '#1a1a1a',
    marginBottom: 2,
  },
  notifItemBody: {
    fontSize: 12,
    color: '#666',
    lineHeight: 1.5,
  },
  notifItemTime: {
    fontSize: 11,
    color: '#aaa',
    marginTop: 4,
  },
  unreadDot: {
    width: 7,
    height: 7,
    borderRadius: '50%',
    backgroundColor: '#1A1A2E',
    flexShrink: 0,
    marginTop: 6,
  },
  notifEmpty: {
    padding: theme.spacing(4),
    textAlign: 'center',
    color: '#aaa',
    fontSize: 13,
  },

  // Sub-tabs bar
  subNav: {
    backgroundColor: '#fff',
    borderBottom: '2px solid #C7D2FE',
    padding: theme.spacing(0, 3),
    flexShrink: 0,
  },
  subTab: {
    fontSize: 13,
    fontWeight: 500,
    textTransform: 'none' as const,
    color: '#555',
    minWidth: 'auto',
    padding: theme.spacing(1.25, 2),
    '&.Mui-selected': { color: '#1A1A2E', fontWeight: 700 },
  },

  // User chip
  userChip: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    background: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    padding: '4px 12px 4px 6px',
    flexShrink: 0,
  },
  avatar: {
    width: 26,
    height: 26,
    borderRadius: '50%',
    backgroundColor: 'rgba(255,255,255,0.18)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 11,
    fontWeight: 700,
    color: '#fff',
    flexShrink: 0,
  },
  userName: {
    fontSize: 13,
    color: '#fff',
    fontWeight: 600,
    whiteSpace: 'nowrap' as const,
  },

  // Content
  content: {
    flexGrow: 1,
    padding: theme.spacing(4),
  },
}));

// ── Main component ────────────────────────────────────────────────────────────
export function SelfServicePortal() {
  const classes = useStyles();
  const [activePage, setActivePage] = useState('home');
  const identityApi = useApi(identityApiRef);
  const [displayName, setDisplayName] = useState('');
  const [unreadIds, setUnreadIds] = useState<Set<string>>(
    () => new Set(NOTIFICATIONS.map(n => n.id)),
  );
  const [bellAnchor, setBellAnchor] = useState<HTMLElement | null>(null);
  const bellRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    identityApi.getProfileInfo().then(p => {
      setDisplayName(p.displayName ?? p.email ?? '');
    }).catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initials = displayName
    .split(' ')
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() ?? '')
    .join('');

  const navigate = (page: string) => setActivePage(page);

  const openNotifications = (e: React.MouseEvent<HTMLButtonElement>) => {
    setBellAnchor(e.currentTarget);
  };
  const closeNotifications = () => setBellAnchor(null);
  const markAllRead = () => setUnreadIds(new Set());

  // Derive active section from active page
  const activeSection = activePage === 'home'
    ? 'home'
    : NAV_SECTIONS.find(s => s.children.some(c => c.page === activePage))?.id ?? 'home';

  // Handle primary tab click — navigate to first child
  const handleSectionChange = (_e: React.ChangeEvent<{}>, sectionId: string) => {
    if (sectionId === 'home') { navigate('home'); return; }
    const section = NAV_SECTIONS.find(s => s.id === sectionId);
    if (section?.children[0]) navigate(section.children[0].page);
  };

  // Sub-tabs for active section (only when section has 2+ children)
  const activeNavSection = NAV_SECTIONS.find(s => s.id === activeSection);
  const subItems = activeNavSection?.children ?? [];
  const showSubTabs = subItems.length > 1;

  const notifOpen = Boolean(bellAnchor);

  return (
    <div className={classes.root}>

      {/* ── Top navigation bar ─────────────────────────────────────────── */}
      <nav aria-label="Main navigation">
        <div className={classes.topNav}>

          {/* Brand */}
          <div
            className={classes.brand}
            onClick={() => navigate('home')}
            role="button"
            tabIndex={0}
            onKeyDown={(e: React.KeyboardEvent) => {
              if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate('home'); }
            }}
            aria-label="Go to home"
          >
            <Icon style={{ color: '#fff', fontSize: 22 }} aria-hidden="true">developer_board</Icon>
            <Typography className={classes.brandText}>Developer Portal</Typography>
          </div>

          {/* Primary section tabs */}
          <Tabs
            value={activeSection}
            onChange={handleSectionChange}
            variant="scrollable"
            scrollButtons="auto"
            className={classes.primaryTabs}
            aria-label="Main sections"
            TabIndicatorProps={{ style: { backgroundColor: '#fff', height: 3 } }}
          >
            <Tab label="Home" value="home" className={classes.primaryTab} />
            {NAV_SECTIONS.map(s => (
              <Tab key={s.id} label={s.label} value={s.id} className={classes.primaryTab} />
            ))}
          </Tabs>

          {/* Bell icon */}
          <IconButton
            ref={bellRef}
            className={classes.bellBtn}
            onClick={openNotifications}
            aria-label={`Notifications — ${unreadIds.size} unread`}
          >
            <Badge badgeContent={unreadIds.size || undefined} className={classes.badge}>
              <Icon style={{ fontSize: 22 }}>notifications</Icon>
            </Badge>
          </IconButton>

          {/* Notification panel */}
          <Popover
            open={notifOpen}
            anchorEl={bellAnchor}
            onClose={closeNotifications}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            PaperProps={{ style: { borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.15)', marginTop: 6 } }}
          >
            <div className={classes.notifPanel}>
              <div className={classes.notifHeader}>
                <Typography className={classes.notifTitle}>Notifications</Typography>
                {unreadIds.size > 0 && (
                  <button className={classes.markRead} onClick={markAllRead}>
                    Mark all as read
                  </button>
                )}
              </div>
              <Divider />
              {NOTIFICATIONS.length === 0 ? (
                <div className={classes.notifEmpty}>No notifications</div>
              ) : (
                NOTIFICATIONS.map((n, i) => (
                  <React.Fragment key={n.id}>
                    <div
                      className={`${classes.notifItem} ${unreadIds.has(n.id) ? classes.notifItemUnread : ''}`}
                      onClick={() => setUnreadIds(prev => { const s = new Set(prev); s.delete(n.id); return s; })}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e: React.KeyboardEvent) => {
                        if (e.key === 'Enter') setUnreadIds(prev => { const s = new Set(prev); s.delete(n.id); return s; });
                      }}
                    >
                      <div className={classes.notifIconWrap}>
                        <Icon style={{ color: NOTIF_COLOR[n.type], fontSize: 20 }}>{NOTIF_ICON[n.type]}</Icon>
                      </div>
                      <div className={classes.notifBody}>
                        <Typography className={classes.notifItemTitle}>{n.title}</Typography>
                        <Typography className={classes.notifItemBody}>{n.body}</Typography>
                        <Typography className={classes.notifItemTime}>{n.time}</Typography>
                      </div>
                      {unreadIds.has(n.id) && <div className={classes.unreadDot} aria-hidden="true" />}
                    </div>
                    {i < NOTIFICATIONS.length - 1 && <Divider />}
                  </React.Fragment>
                ))
              )}
            </div>
          </Popover>

          {/* User chip */}
          {displayName && (
            <div className={classes.userChip}>
              <div className={classes.avatar} aria-hidden="true">{initials || '?'}</div>
              <Typography className={classes.userName}>{displayName}</Typography>
            </div>
          )}
        </div>

        {/* Sub-tabs — only for sections with 2+ children */}
        {showSubTabs && (
          <div className={classes.subNav}>
            <Tabs
              value={activePage}
              onChange={(_e, val) => navigate(val)}
              TabIndicatorProps={{ style: { backgroundColor: '#1A1A2E', height: 2 } }}
              aria-label="Section navigation"
            >
              {subItems.map(child => (
                <Tab
                  key={child.id}
                  label={child.label}
                  value={child.page}
                  className={classes.subTab}
                />
              ))}
            </Tabs>
          </div>
        )}
      </nav>

      {/* ── Page content ───────────────────────────────────────────────── */}
      <main className={classes.content} aria-label="Page content">
        <PageContent page={activePage} />
      </main>

    </div>
  );
}
