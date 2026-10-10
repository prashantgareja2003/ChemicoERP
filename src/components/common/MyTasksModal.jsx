import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { CheckCircle2 } from 'lucide-react';
import { useErp } from '../../hooks/useErp';

export function MyTasksModal({ isOpen, onClose }) {
  const { currentUser, quotations, salesOrders, purchaseOrders, qcRecords, logisticsTasks } = useErp();

  // Compute stakeholder specific tasks based on role
  const getTasks = () => {
    const list = [];

    // HOD Tasks
    if (currentUser.role === 'HOD' || currentUser.role === 'Admin' || currentUser.role === 'Management') {
      quotations.filter((q) => q.status === 'awaiting approval').forEach((q) => {
        list.push({
          id: q.id,
          title: `Authorize Quotation ${q.id}`,
          stage: 'Awaiting HOD Review',
          dept: 'Sales / Commercial',
          target: q.customerName,
          urgency: 'High',
          action: 'Approve / Reject Quote',
        });
      });

      purchaseOrders.filter((p) => p.status === 'awaiting approval').forEach((p) => {
        list.push({
          id: p.id,
          title: `Approve Raw Material PO ${p.id}`,
          stage: 'Procurement Sign-off',
          dept: 'Purchase',
          target: `${p.material} (${p.supplierName})`,
          urgency: 'Critical',
          action: 'Approve PO',
        });
      });

      qcRecords.filter((qc) => qc.status === 'failed' && qc.failedDetails?.decisionStatus.includes('Awaiting')).forEach((qc) => {
        list.push({
          id: qc.id,
          title: `Review Failed QC Batch ${qc.batchNo}`,
          stage: 'OCAP Disposition',
          dept: 'QC / QA',
          target: qc.product,
          urgency: 'Critical',
          action: 'Authorize Re-work or Concession',
        });
      });
    }

    // Sales Tasks
    if (currentUser.role === 'Sales' || currentUser.role === 'Admin') {
      quotations.filter((q) => q.status === 'approved').forEach((q) => {
        list.push({
          id: q.id,
          title: `Convert Approved Quote ${q.id} to Sales Order`,
          stage: 'Ready for Conversion',
          dept: 'Sales',
          target: q.customerName,
          urgency: 'Normal',
          action: 'Convert to SO',
        });
      });
    }

    // Production Tasks
    if (currentUser.role === 'Prod' || currentUser.role === 'Admin') {
      salesOrders.filter((so) => so.status === 'open' || so.status === 'in production').forEach((so) => {
        list.push({
          id: so.id,
          title: `Execute Batch Production for ${so.id}`,
          stage: 'Reactor Scheduling',
          dept: 'Production',
          target: `${so.items[0]?.productName} (${so.customerName})`,
          urgency: 'High',
          action: 'Log Daily Production',
        });
      });
    }

    // QC/QA Tasks
    if (currentUser.role === 'QC/QA' || currentUser.role === 'Admin') {
      salesOrders.filter((so) => so.status === 'in production').forEach((so) => {
        list.push({
          id: so.id,
          title: `Perform Batch Quality Inspection`,
          stage: 'Awaiting Lab Sample',
          dept: 'QC / QA Lab',
          target: `${so.items[0]?.productName}`,
          urgency: 'Normal',
          action: 'Record Monograph Test',
        });
      });
    }

    // Logistics Tasks
    if (currentUser.role === 'Logistics' || currentUser.role === 'Admin') {
      logisticsTasks.filter((t) => t.stage === 'booking' || t.stage === 'dispatch').forEach((t) => {
        list.push({
          id: t.id,
          title: `Arrange Road Tanker & Gate Pass for ${t.soNumber}`,
          stage: t.stage === 'booking' ? 'Tanker Vehicle Booking' : 'Gate Pass Preparation',
          dept: 'Logistics Desk',
          target: `${t.consignee} (${t.weightMT} MT)`,
          urgency: 'High',
          action: 'Generate Dispatch Slip',
        });
      });
    }

    // Finance Tasks
    if (currentUser.role === 'Finance' || currentUser.role === 'Admin') {
      salesOrders.filter((so) => so.status === 'delivered' && (so.receivedPayment || 0) < so.totalValue).forEach((so) => {
        list.push({
          id: so.id,
          title: `Collect Outstanding Payment for ${so.id}`,
          stage: `Balance Payment (${Math.round(((so.receivedPayment || 0) / so.totalValue) * 100)}% Recv)`,
          dept: 'Accounts Receivable',
          target: `${so.customerName} (Bal: ₹${(so.totalValue - (so.receivedPayment || 0)).toLocaleString()})`,
          urgency: 'Medium',
          action: 'Record Bank Receipt',
        });
      });
    }

    return list;
  };

  const tasks = getTasks();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`My Assigned Operational Tasks`}
      description={`Personal task queue for ${currentUser.name} (${currentUser.role})`}
      size="md"
      footer={
        <Button variant="secondary" onClick={onClose}>
          Done
        </Button>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {tasks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-6)', color: 'var(--color-text-secondary)' }}>
            <CheckCircle2 size={36} color="var(--color-success)" style={{ margin: '0 auto 8px' }} />
            <p style={{ fontWeight: 600 }}>No outstanding pending tasks!</p>
            <p style={{ fontSize: 'var(--font-size-xs)' }}>Your operational queue is completely clear.</p>
          </div>
        ) : (
          tasks.map((tsk, i) => (
            <div
              key={i}
              style={{
                padding: 'var(--space-3)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                background: '#FFFFFF',
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, color: 'var(--color-primary-dark)' }}>
                  {tsk.id} • {tsk.dept}
                </span>
                <span
                  style={{
                    fontSize: '0.6875rem',
                    fontWeight: 600,
                    color: tsk.urgency === 'Critical' ? 'var(--color-error)' : tsk.urgency === 'High' ? 'var(--color-warning)' : 'var(--color-primary)',
                  }}
                >
                  {tsk.urgency}
                </span>
              </div>

              <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                {tsk.title}
              </div>

              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                Scope: {tsk.target} • Stage: <strong>{tsk.stage}</strong>
              </div>
            </div>
          ))
        )}
      </div>
    </Modal>
  );
}

export default MyTasksModal;
