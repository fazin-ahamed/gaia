
import React from 'react';
import { Severity } from '../types';
import { Flame, ShieldAlert, AlertTriangle, Info } from 'lucide-react';

interface SeverityBadgeProps {
  severity: Severity;
  showIcon?: boolean;
}

const severityConfig = {
  Low: {
    color: 'bg-severity-low/20 text-severity-low border border-severity-low',
    icon: Info,
  },
  Medium: {
    color: 'bg-severity-medium/20 text-severity-medium border border-severity-medium',
    icon: AlertTriangle,
  },
  High: {
    color: 'bg-severity-high/20 text-severity-high border border-severity-high',
    icon: ShieldAlert,
  },
  Critical: {
    color: 'bg-severity-critical/20 text-severity-critical border border-severity-critical animate-pulse',
    icon: Flame,
  },
};

const SeverityBadge: React.FC<SeverityBadgeProps> = ({ severity, showIcon = true }) => {
  const config = severityConfig[severity];
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${config.color}`}>
      {showIcon && <Icon className="w-3.5 h-3.5 mr-1.5" />}
      {severity}
    </span>
  );
};

export default SeverityBadge;
