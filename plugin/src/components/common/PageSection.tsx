import React from 'react';
import { Icon, Typography, makeStyles } from '@material-ui/core';

interface PageSectionProps {
  icon: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

const useStyles = makeStyles(theme => ({
  header: {
    marginBottom: theme.spacing(3),
  },
  titleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1.5),
    marginBottom: theme.spacing(0.5),
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#EEF2FF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  icon: { color: '#1A1A2E', fontSize: 22 },
  title: {
    fontWeight: 800,
    fontSize: 20,
    color: '#1a1a1a',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginLeft: theme.spacing(7),
  },
  divider: {
    height: 2,
    backgroundColor: '#e8eaed',
    borderRadius: 1,
    margin: theme.spacing(2, 0, 3),
  },
}));

export function PageSection({ icon, title, subtitle, children }: PageSectionProps) {
  const classes = useStyles();
  return (
    <div>
      <div className={classes.header}>
        <div className={classes.titleRow}>
          <div className={classes.iconWrap}>
            <Icon className={classes.icon} aria-hidden="true">{icon}</Icon>
          </div>
          <Typography className={classes.title}>{title}</Typography>
        </div>
        <Typography className={classes.subtitle}>{subtitle}</Typography>
      </div>
      <div className={classes.divider} />
      {children}
    </div>
  );
}
