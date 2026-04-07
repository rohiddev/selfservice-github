import React from 'react';
import { Button, Chip, Icon, Typography, makeStyles } from '@material-ui/core';

export type ServiceStatus = 'available' | 'beta' | 'coming-soon';

export interface ServiceCardProps {
  icon: string;
  title: string;
  description: string;
  status: ServiceStatus;
  workflowUrl: string;
  videoUrl?: string;
  tags?: string[];
}

const STATUS_CONFIG: Record<ServiceStatus, { label: string; color: string; bg: string }> = {
  'available':    { label: 'Available',    color: '#3730A3', bg: '#E8EAF6' },
  'beta':         { label: 'Beta',         color: '#e65100', bg: '#fff3e0' },
  'coming-soon':  { label: 'Coming Soon',  color: '#757575', bg: '#f5f5f5' },
};

const useStyles = makeStyles(theme => ({
  card: {
    background: '#fff',
    border: '1.5px solid #e8eaed',
    borderRadius: 12,
    padding: theme.spacing(3),
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
    transition: 'box-shadow 0.18s, border-color 0.18s',
    '&:hover': {
      boxShadow: '0 4px 20px rgba(26,26,46,0.10)',
      borderColor: '#C7D2FE',
    },
  },
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: theme.spacing(2),
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#EEF2FF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  icon: {
    color: '#1A1A2E',
    fontSize: 26,
  },
  title: {
    fontWeight: 700,
    fontSize: 16,
    color: '#1a1a1a',
    lineHeight: 1.3,
    marginBottom: theme.spacing(0.5),
  },
  description: {
    fontSize: 14,
    color: '#555',
    lineHeight: 1.6,
    flexGrow: 1,
  },
  tags: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: theme.spacing(0.5),
    marginTop: theme.spacing(0.5),
  },
  tag: {
    fontSize: 11,
    height: 22,
    backgroundColor: '#f0f0f0',
    color: '#555',
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    marginTop: theme.spacing(1),
  },
  videoBtn: {
    border: '1.5px solid #C7D2FE',
    color: '#1A1A2E',
    textTransform: 'none' as const,
    fontWeight: 600,
    fontSize: 13,
    borderRadius: 8,
    padding: theme.spacing(0.75, 2),
    backgroundColor: '#fff',
    '&:hover': { backgroundColor: '#EEF2FF', borderColor: '#1A1A2E' },
    '&:disabled': { borderColor: '#e0e0e0', color: '#bbb' },
  },
  launchBtn: {
    backgroundColor: '#1A1A2E',
    color: '#fff',
    textTransform: 'none' as const,
    fontWeight: 600,
    fontSize: 13,
    borderRadius: 8,
    padding: theme.spacing(0.75, 2.5),
    marginLeft: 'auto',
    '&:hover': { backgroundColor: '#16213E' },
    '&:disabled': { backgroundColor: '#bdbdbd', color: '#fff' },
  },
}));

export function ServiceCard({ icon, title, description, status, workflowUrl, videoUrl, tags }: ServiceCardProps) {
  const classes = useStyles();
  const statusCfg = STATUS_CONFIG[status];
  const isDisabled = status === 'coming-soon';

  return (
    <div className={classes.card}>
      <div className={classes.header}>
        <div className={classes.iconWrap}>
          <Icon className={classes.icon} aria-hidden="true">{icon}</Icon>
        </div>
        <Chip
          label={statusCfg.label}
          size="small"
          style={{ backgroundColor: statusCfg.bg, color: statusCfg.color, fontWeight: 700, fontSize: 11 }}
        />
      </div>

      <Typography className={classes.title}>{title}</Typography>
      <Typography className={classes.description}>{description}</Typography>

      <div className={classes.tags}>
        {tags?.map(t => (
          <Chip key={t} label={t} size="small" className={classes.tag} />
        ))}
      </div>

      <div className={classes.actions}>
        <Button
          className={classes.videoBtn}
          disabled={!videoUrl}
          onClick={() => videoUrl && window.open(videoUrl, '_blank', 'noopener,noreferrer')}
          startIcon={<Icon style={{ fontSize: 16 }}>play_circle</Icon>}
          aria-label={`Watch video for ${title}`}
        >
          Watch Video
        </Button>
        <Button
          className={classes.launchBtn}
          disabled={isDisabled}
          onClick={() => !isDisabled && window.open(workflowUrl, '_blank', 'noopener,noreferrer')}
          endIcon={<Icon style={{ fontSize: 16 }}>arrow_forward</Icon>}
          aria-label={`Launch ${title} workflow`}
        >
          {isDisabled ? 'Coming Soon' : 'Launch'}
        </Button>
      </div>
    </div>
  );
}
