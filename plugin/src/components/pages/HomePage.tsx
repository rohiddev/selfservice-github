import React from 'react';
import { Grid, Icon, Typography, makeStyles } from '@material-ui/core';
import { WORKFLOW_URLS } from '../../config';

const useStyles = makeStyles(theme => ({
  hero: {
    background: 'linear-gradient(135deg, #1A1A2E 0%, #16213E 100%)',
    borderRadius: 16,
    padding: theme.spacing(5, 4),
    marginBottom: theme.spacing(4),
    color: '#fff',
  },
  heroTitle: {
    fontWeight: 800,
    fontSize: 28,
    color: '#fff',
    marginBottom: theme.spacing(1),
  },
  heroSubtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.85)',
    maxWidth: 560,
    lineHeight: 1.6,
  },
  sectionTitle: {
    fontWeight: 700,
    fontSize: 16,
    color: '#1a1a1a',
    marginBottom: theme.spacing(2),
  },
  quickCard: {
    background: '#fff',
    border: '1.5px solid #e8eaed',
    borderRadius: 12,
    padding: theme.spacing(2.5),
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2),
    cursor: 'pointer',
    transition: 'box-shadow 0.15s, border-color 0.15s',
    '&:hover': {
      boxShadow: '0 4px 16px rgba(26,26,46,0.10)',
      borderColor: '#C7D2FE',
    },
  },
  quickIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#EEF2FF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  quickTitle: { fontWeight: 700, fontSize: 14, color: '#1a1a1a' },
  quickDesc: { fontSize: 12, color: '#777', marginTop: 2 },
}));

const QUICK_LINKS = [
  { icon: 'folder',          title: 'Create Repository',      desc: 'Provision a new GitHub repo',         url: WORKFLOW_URLS.createRepo    },
  { icon: 'group_add',       title: 'Create AD Group',         desc: 'Create a new Active Directory group', url: ''                          },
  { icon: 'manage_accounts', title: 'Manage AD Group Users',   desc: 'Add or remove group members',         url: ''                          },
  { icon: 'dns',             title: 'Kubernetes Onboarding',   desc: 'Provision a PaaS namespace',          url: WORKFLOW_URLS.k8sOnboarding },
  { icon: 'cloud',           title: 'Public Cloud Onboarding', desc: 'Jarvis infrastructure provisioning',  url: WORKFLOW_URLS.publicCloud   },
  { icon: 'science',         title: 'Create Test Environment', desc: 'Reserve a TEMS test environment',     url: WORKFLOW_URLS.temsReserve   },
];

export function HomePage() {
  const classes = useStyles();

  return (
    <div>
      {/* Hero */}
      <div className={classes.hero}>
        <Typography className={classes.heroTitle}>Developer Self-Service Portal</Typography>
        <Typography className={classes.heroSubtitle}>
          Provision infrastructure, manage access, and automate platform tasks — all from one place.
          No tickets. No waiting.
        </Typography>
      </div>

      {/* Quick links */}
      <Typography className={classes.sectionTitle}>Quick Access</Typography>
      <Grid container spacing={2}>
        {QUICK_LINKS.map(link => (
          <Grid item xs={12} sm={6} md={4} key={link.title}>
            <div
              className={classes.quickCard}
              onClick={() => { if (link.url) window.open(link.url, '_blank', 'noopener,noreferrer'); }}
              role="button"
              tabIndex={link.url ? 0 : -1}
              onKeyDown={(e: React.KeyboardEvent) => {
                if (link.url && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); window.open(link.url, '_blank', 'noopener,noreferrer'); }
              }}
              style={{ opacity: link.url ? 1 : 0.5, cursor: link.url ? 'pointer' : 'default' }}
              aria-label={link.title}
            >
              <div className={classes.quickIcon}>
                <Icon style={{ color: '#1A1A2E', fontSize: 22 }} aria-hidden="true">{link.icon}</Icon>
              </div>
              <div>
                <Typography className={classes.quickTitle}>{link.title}</Typography>
                <Typography className={classes.quickDesc}>{link.desc}</Typography>
              </div>
            </div>
          </Grid>
        ))}
      </Grid>
    </div>
  );
}
