import React from 'react';
import {
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  Icon,
  Tooltip,
  Typography,
  makeStyles,
} from '@material-ui/core';

export interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
  status: 'available' | 'beta' | 'coming-soon';
  actionLabel: string;
  actionUrl: string;
  tags: string[];
  videoUrl?: string;
  videoDuration?: string;
}

const useStyles = makeStyles(theme => ({
  card: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    borderRadius: 12,
    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
    '&:hover': {
      transform: 'translateY(-3px)',
      boxShadow: theme.shadows[6],
    },
  },
  cardContent: {
    flexGrow: 1,
    paddingBottom: 0,
  },
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: theme.spacing(1.5),
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E6F5EF',
  },
  icon: {
    color: '#00965E',
    fontSize: 26,
  },
  statusAvailable: {
    backgroundColor: '#e8f5e9',
    color: '#2e7d32',
    fontWeight: 600,
    fontSize: 11,
  },
  statusBeta: {
    backgroundColor: '#fff3e0',
    color: '#e65100',
    fontWeight: 600,
    fontSize: 11,
  },
  statusComingSoon: {
    backgroundColor: '#f3e5f5',
    color: '#6a1b9a',
    fontWeight: 600,
    fontSize: 11,
  },
  title: {
    fontWeight: 700,
    marginBottom: theme.spacing(0.5),
  },
  description: {
    color: theme.palette.text.secondary,
    fontSize: 13,
    lineHeight: 1.5,
  },
  tags: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: theme.spacing(1.5),
  },
  tag: {
    fontSize: 11,
    height: 20,
    backgroundColor: '#f5f5f5',
    color: '#555',
  },
  actions: {
    padding: theme.spacing(1.5, 2, 2),
    display: 'flex',
    gap: theme.spacing(1),
  },
  actionButton: {
    borderRadius: 8,
    textTransform: 'none' as const,
    fontWeight: 600,
    flexGrow: 1,
  },
  videoButton: {
    borderRadius: 8,
    textTransform: 'none' as const,
    fontWeight: 600,
    color: '#00965E',
    borderColor: '#00965E',
    whiteSpace: 'nowrap',
    flexShrink: 0,
    '&:hover': {
      backgroundColor: '#E6F5EF',
      borderColor: '#007A4D',
    },
  },
}));

function statusLabel(status: Service['status']) {
  if (status === 'available') return 'Available';
  if (status === 'beta') return 'Beta';
  return 'Coming Soon';
}

export function ServiceCard({ service }: { service: Service }) {
  const classes = useStyles();

  const statusClass =
    service.status === 'available'
      ? classes.statusAvailable
      : service.status === 'beta'
      ? classes.statusBeta
      : classes.statusComingSoon;

  return (
    <Card className={classes.card} elevation={2}>
      <CardContent className={classes.cardContent}>
        <div className={classes.header}>
          <div className={classes.iconBox}>
            <Icon className={classes.icon}>{service.icon}</Icon>
          </div>
          <Chip
            label={statusLabel(service.status)}
            size="small"
            className={statusClass}
          />
        </div>

        <Typography variant="subtitle1" className={classes.title}>
          {service.title}
        </Typography>
        <Typography variant="body2" className={classes.description}>
          {service.description}
        </Typography>

        <div className={classes.tags}>
          {service.tags.slice(0, 3).map(tag => (
            <Chip key={tag} label={tag} size="small" className={classes.tag} />
          ))}
        </div>
      </CardContent>

      <CardActions className={classes.actions}>
        <Button
          variant={service.status === 'coming-soon' ? 'outlined' : 'contained'}
          color="primary"
          size="small"
          disabled={service.status === 'coming-soon'}
          className={classes.actionButton}
          href={service.status !== 'coming-soon' ? service.actionUrl : undefined}
        >
          {service.actionLabel}
        </Button>

        {service.videoUrl && (
          <Tooltip
            title={`Watch how-to video${service.videoDuration ? ` (${service.videoDuration})` : ''}`}
            placement="top"
          >
            <Button
              variant="outlined"
              size="small"
              className={classes.videoButton}
              href={service.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              startIcon={<Icon style={{ fontSize: 16 }}>play_circle</Icon>}
            >
              {service.videoDuration ?? 'Watch'}
            </Button>
          </Tooltip>
        )}
      </CardActions>
    </Card>
  );
}
