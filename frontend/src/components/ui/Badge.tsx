import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'slate';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
}) => {
  const variantStyles = {
    default: 'bg-slate-100 text-slate-800 border-slate-200',
    primary: 'bg-blue-50 text-blue-700 border-blue-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    info: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
    slate: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5 rounded',
    md: 'text-xs font-medium px-2.5 py-1 rounded-md border',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 font-medium transition-colors ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {children}
    </span>
  );
};

export const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  switch (status) {
    case 'New':
      return <Badge variant="info">New</Badge>;
    case 'Contacted':
      return <Badge variant="primary">Contacted</Badge>;
    case 'Interested':
      return <Badge variant="purple">Interested</Badge>;
    case 'Site Visit Scheduled':
      return <Badge variant="warning">Visit Scheduled</Badge>;
    case 'Site Visit Done':
      return <Badge variant="info">Visit Done</Badge>;
    case 'Negotiation':
      return <Badge variant="warning">Negotiation</Badge>;
    case 'Booked':
      return <Badge variant="success">Booked</Badge>;
    case 'Lost':
      return <Badge variant="danger">Lost</Badge>;
    case 'Completed':
      return <Badge variant="success">Completed</Badge>;
    case 'Pending':
      return <Badge variant="warning">Pending</Badge>;
    case 'Cancelled':
      return <Badge variant="slate">Cancelled</Badge>;
    case 'No-show':
      return <Badge variant="danger">No-show</Badge>;
    case 'Available':
      return <Badge variant="success">Available</Badge>;
    case 'Reserved':
      return <Badge variant="warning">Reserved</Badge>;
    case 'Sold':
      return <Badge variant="slate">Sold</Badge>;
    default:
      return <Badge variant="default">{status}</Badge>;
  }
};

export const PriorityBadge: React.FC<{ priority: string }> = ({ priority }) => {
  switch (priority) {
    case 'Urgent':
      return <Badge variant="danger">Urgent</Badge>;
    case 'High':
      return <Badge variant="warning">High</Badge>;
    case 'Medium':
      return <Badge variant="primary">Medium</Badge>;
    case 'Low':
      return <Badge variant="slate">Low</Badge>;
    default:
      return <Badge variant="default">{priority}</Badge>;
  }
};

export const RoleBadge: React.FC<{ role: string }> = ({ role }) => {
  switch (role) {
    case 'OWNER':
      return <Badge variant="purple">Owner</Badge>;
    case 'ADMIN':
      return <Badge variant="primary">Admin</Badge>;
    case 'MANAGER':
      return <Badge variant="info">Manager</Badge>;
    case 'EXECUTIVE':
      return <Badge variant="success">Executive</Badge>;
    default:
      return <Badge variant="default">{role}</Badge>;
  }
};
