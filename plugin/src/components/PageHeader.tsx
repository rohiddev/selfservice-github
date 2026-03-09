import React from 'react';
import { Box, Divider, Icon, Typography, makeStyles } from '@material-ui/core';

const useStyles = makeStyles(theme => ({
  root: {
    marginBottom: theme.spacing(3),
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1.5),
    marginBottom: theme.spacing(1),
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#E6F5EF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    color: '#00965E',
    fontSize: 22,
  },
  title: {
    fontWeight: 700,
    color: '#007A4D',
  },
  subtitle: {
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(2),
    fontSize: 14,
  },
}));

interface PageHeaderProps {
  icon: string;
  title: string;
  subtitle: string;
}

export function PageHeader({ icon, title, subtitle }: PageHeaderProps) {
  const classes = useStyles();
  return (
    <div className={classes.root}>
      <div className={classes.header}>
        <Box className={classes.iconBox}>
          <Icon className={classes.icon}>{icon}</Icon>
        </Box>
        <Typography variant="h5" className={classes.title}>
          {title}
        </Typography>
      </div>
      <Typography variant="body2" className={classes.subtitle}>
        {subtitle}
      </Typography>
      <Divider />
    </div>
  );
}
