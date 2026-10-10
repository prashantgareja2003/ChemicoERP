import { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { CheckCircle2, XCircle, RotateCcw, AlertTriangle } from 'lucide-react';
import { useErp } from '../../hooks/useErp';

/**
 * Universal Approval Component
 * Used across Quotation, Sales Order, Purchase Order, and Failed QC.
 * Actions: Approve, Reject (reason required), Send Back.
 * Records stakeholder, timestamp, audit log, and dispatches in-app notification.
 */
export function ApprovalModal({
  isOpen,
  onClose,
  targetType, // 'quotation' | 'sales_order' | 'purchase_order' | 'qc_failed'
  record, // The object being approved
  onSuccess,
}) {
  const { handleUniversalApproval, currentUser } = useErp();
  const [rejectReason, setRejectReason] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!record) return null;

  const handleAction = (action) => {
    if ((action === 'reject' || action === 'send_back') && !rejectReason.trim()) {
      setErrorMsg(`A specific explanation/reason is mandatory when ${action === 'reject' ? 'rejecting' : 'sending back'} this item.`);
      return;
    }

    handleUniversalApproval(targetType, record.id, action, rejectReason);
    setRejectReason('');
    setErrorMsg('');
    if (onSuccess) onSuccess();
    onClose();
  };

  const getRecordTitle = () => {
    switch (targetType) {
      case 'quotation':
        return `Quotation ${record.id} • ${record.customerName}`;
      case 'sales_order':
        return `Sales Order ${record.id} • ${record.customerName}`;
      case 'purchase_order':
        return `Purchase Order ${record.id} • ${record.supplierName}`;
      case 'qc_failed':
        return `Failed QC Inspection ${record.id} • ${record.product}`;
      default:
        return `Record ${record.id}`;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Management & HOD Authorization`}
      description={`Sign-off gate for ${getRecordTitle()}`}
      size="md"
      footer={
        <div className="erp-modal-actions-wrap">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>

          <Button
            variant="warning"
            icon={<RotateCcw size={14} />}
            onClick={() => handleAction('send_back')}
          >
            Send Back
          </Button>

          <Button
            variant="danger"
            icon={<XCircle size={14} />}
            onClick={() => handleAction('reject')}
          >
            Reject
          </Button>

          <Button
            variant="primary"
            icon={<CheckCircle2 size={14} />}
            onClick={() => handleAction('approve')}
          >
            Approve & Authorize
          </Button>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {/* Record Overview Box */}
        <div
          style={{
            padding: 'var(--space-3)',
            borderRadius: 'var(--radius-md)',
            background: 'var(--color-bg-subtle)',
            border: '1px solid var(--color-border)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
              Target Reference
            </span>
            <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, color: 'var(--color-primary-dark)' }}>
              {record.id}
            </span>
          </div>

          <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-primary)' }}>
            {targetType === 'quotation' && (
              <div>
                <strong>Client:</strong> {record.customerName} • <strong>Value:</strong> ₹
                {(record.items || []).reduce((acc, it) => acc + (it.unitPrice * it.qty), 0).toLocaleString()} • {record.deliverySchedule}
              </div>
            )}
            {targetType === 'sales_order' && (
              <div>
                <strong>Client:</strong> {record.customerName} • <strong>Value:</strong> ₹
                {(record.totalValue || 0).toLocaleString()} • Terms: {record.orderTerms}
              </div>
            )}
            {targetType === 'purchase_order' && (
              <div>
                <strong>Supplier:</strong> {record.supplierName} • <strong>Material:</strong> {record.material} ({record.qty} {record.uom}) • ₹
                {(record.totalWithTax || record.totalValue || 0).toLocaleString()}
              </div>
            )}
            {targetType === 'qc_failed' && (
              <div>
                <div style={{ color: 'var(--color-error)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <AlertTriangle size={15} /> Laboratory Test Failed Specifications
                </div>
                <div style={{ marginTop: 4, fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                  Batch #{record.batchNo} • SO: {record.soNumber} • Tested by: {record.checkedBy}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Authorizing Stakeholder info */}
        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
          Authorizing Official: <strong>{currentUser.name}</strong> ({currentUser.role} • Dahej Complex)
        </div>

        {/* Reason Input Box */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600 }}>
            Comments / Decision Notes / Rejection Reason (Mandatory if Rejecting or Sending Back)
          </label>
          <Input
            placeholder="Enter reason for rejection, conditions for concession, or revision notes..."
            value={rejectReason}
            onChange={(e) => {
              setRejectReason(e.target.value);
              setErrorMsg('');
            }}
          />
          {errorMsg && (
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-error)', fontWeight: 500 }}>
              {errorMsg}
            </span>
          )}
        </div>

        {/* Audit Disclaimer */}
        <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>
          * Every decision generates an immutable audit timestamp, pushes an in-app priority banner, and dispatches a notification copy to the department initiator.
        </div>
      </div>
    </Modal>
  );
}

export default ApprovalModal;
