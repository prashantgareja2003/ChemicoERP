import Badge from '../ui/Badge';

/**
 * Enterprise StatusBadge for Industrial ERP
 * Automatically maps standard ERP statuses to appropriate semantic tokens.
 */
export function StatusBadge({ status, className = '' }) {
  if (!status) return null;

  const normalized = String(status).toLowerCase().trim();

  const getVariant = (val) => {
    switch (val) {
      case 'approved':
      case 'completed':
      case 'active':
      case 'passed':
      case 'quality passed':
      case 'paid':
      case 'delivered':
        return 'success';

      case 'in production':
      case 'processing':
      case 'dispatched':
      case 'in transit':
        return 'emerald';

      case 'pending':
      case 'pending approval':
      case 'awaiting qc':
      case 'under review':
      case 'partial':
      case 'low stock':
        return 'warning';

      case 'rejected':
      case 'cancelled':
      case 'critical':
      case 'out of stock':
      case 'failed':
        return 'danger';

      case 'draft':
      case 'scheduled':
      case 'planned':
        return 'info';

      default:
        return 'neutral';
    }
  };

  return (
    <Badge variant={getVariant(normalized)} dot className={className}>
      {status}
    </Badge>
  );
}

export default StatusBadge;
