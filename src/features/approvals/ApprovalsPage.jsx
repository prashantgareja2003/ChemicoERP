import { useState } from 'react';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import ApprovalModal from '../../components/common/ApprovalModal';
import { useErp } from '../../hooks/useErp';
import { CheckCircle2, XCircle, RotateCcw, AlertTriangle, ShieldCheck, FileText, ShoppingCart, ShoppingBag, ShieldAlert, Layers } from 'lucide-react';

export function ApprovalsPage() {
  const { quotations, salesOrders, purchaseOrders, qcRecords } = useErp();

  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'quotes' | 'sos' | 'pos' | 'qc'
  const [modalState, setModalState] = useState({ isOpen: false, targetType: null, record: null });

  // Compile all pending approvals
  const allPending = [];

  quotations.filter((q) => q.status === 'awaiting approval').forEach((q) => {
    allPending.push({
      id: q.id,
      category: 'Sales Quotation',
      targetType: 'quotation',
      title: `Commercial Quotation for ${q.customerName}`,
      detail: `${q.items[0]?.productName} (${q.items[0]?.qty} MT) • Terms: ${q.paymentTerms}`,
      amount: `₹${q.items.reduce((acc, it) => acc + (it.unitPrice * it.qty), 0).toLocaleString()}`,
      urgency: 'Normal',
      waitingWith: 'HOD (Commercial Sales)',
      age: '4 hours',
      record: q,
    });
  });

  salesOrders.filter((s) => s.status === 'open').forEach((s) => {
    allPending.push({
      id: s.id,
      category: 'Sales Order (Production Commit)',
      targetType: 'sales_order',
      title: `Production Commitment for ${s.customerName}`,
      detail: `${s.items[0]?.productName} (${s.items[0]?.qty} MT) • Terms: ${s.orderTerms}`,
      amount: `₹${(s.totalValue).toLocaleString()}`,
      urgency: 'High',
      waitingWith: 'HOD (Plant Operations)',
      age: '2 hours',
      record: s,
    });
  });

  purchaseOrders.filter((p) => p.status === 'awaiting approval').forEach((p) => {
    allPending.push({
      id: p.id,
      category: 'Purchase Order',
      targetType: 'purchase_order',
      title: `Raw Material PO: ${p.material}`,
      detail: `${p.qty} ${p.uom} from ${p.supplierName} • Delivery: ${p.deliverySchedule}`,
      amount: `₹${(p.totalWithTax || p.totalValue).toLocaleString()}`,
      urgency: 'High',
      waitingWith: 'HOD (Procurement)',
      age: '18 hours',
      record: p,
    });
  });

  qcRecords.filter((qc) => qc.status === 'failed').forEach((qc) => {
    allPending.push({
      id: qc.id,
      category: 'Failed QC Monograph (OCAP)',
      targetType: 'qc_failed',
      title: `Batch Failure: ${qc.product}`,
      detail: `Batch #${qc.batchNo} (${qc.quantityKg / 1000} MT). Out of spec on Iodine Value. OCAP required.`,
      amount: `${qc.quantityKg / 1000} MT`,
      urgency: 'Critical',
      waitingWith: 'HOD (Quality Assurance)',
      age: '35 minutes',
      record: qc,
    });
  });

  const filteredPending =
    activeTab === 'quotes'
      ? allPending.filter((p) => p.targetType === 'quotation')
      : activeTab === 'sos'
      ? allPending.filter((p) => p.targetType === 'sales_order')
      : activeTab === 'pos'
      ? allPending.filter((p) => p.targetType === 'purchase_order')
      : activeTab === 'qc'
      ? allPending.filter((p) => p.targetType === 'qc_failed')
      : allPending;

  const columns = [
    {
      key: 'id',
      title: 'Reference #',
      render: (val) => <strong style={{ color: 'var(--color-primary-dark)' }}>{val}</strong>,
    },
    { key: 'category', title: 'Approval Scope' },
    { key: 'title', title: 'Subject / Account' },
    {
      key: 'detail',
      title: 'Specifications / Terms',
      render: (val) => <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-secondary)' }}>{val}</span>,
    },
    {
      key: 'amount',
      title: 'Value / Volume',
      align: 'right',
      render: (val) => <strong style={{ color: 'var(--color-text-primary)' }}>{val}</strong>,
    },
    {
      key: 'waitingWith',
      title: 'Waiting With & Age',
      render: (val, row) => (
        <div>
          <div>{val}</div>
          <div style={{ fontSize: '0.625rem', color: 'var(--color-text-muted)' }}>Elapsed: {row.age}</div>
        </div>
      ),
    },
    {
      key: 'urgency',
      title: 'Urgency',
      render: (val) => (
        <span
          style={{
            fontWeight: 700,
            fontSize: '0.6875rem',
            padding: '2px 7px',
            borderRadius: 'var(--radius-pill)',
            background: val === 'Critical' ? 'var(--color-error-bg)' : val === 'High' ? 'var(--color-warning-bg)' : 'var(--color-bg-subtle)',
            color: val === 'Critical' ? 'var(--color-error)' : val === 'High' ? 'var(--color-warning)' : 'var(--color-text-secondary)',
          }}
        >
          {val}
        </span>
      ),
    },
    {
      key: 'actions',
      title: 'Decision',
      align: 'right',
      render: (_, row) => (
        <Button
          size="sm"
          variant="primary"
          icon={<ShieldCheck size={13} />}
          onClick={() => setModalState({ isOpen: true, targetType: row.targetType, record: row.record })}
        >
          Authorize
        </Button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Approvals Queue & Executive Clearance"
        description="Unified sign-off gate across Quotations, Sales Orders, Purchase Orders, and QC Non-conformances with reason-mandated audit logs."
      />

      {/* Tabs */}
      <div className="erp-tabs-row">
        <Button
          size="sm"
          variant={activeTab === 'all' ? 'primary' : 'secondary'}
          icon={<Layers size={13} />}
          onClick={() => setActiveTab('all')}
        >
          All Waiting Authorizations ({allPending.length})
        </Button>
        <Button
          size="sm"
          variant={activeTab === 'quotes' ? 'primary' : 'secondary'}
          icon={<FileText size={13} />}
          onClick={() => setActiveTab('quotes')}
        >
          Quotations ({allPending.filter((p) => p.targetType === 'quotation').length})
        </Button>
        <Button
          size="sm"
          variant={activeTab === 'sos' ? 'primary' : 'secondary'}
          icon={<ShoppingCart size={13} />}
          onClick={() => setActiveTab('sos')}
        >
          Sales Orders ({allPending.filter((p) => p.targetType === 'sales_order').length})
        </Button>
        <Button
          size="sm"
          variant={activeTab === 'pos' ? 'primary' : 'secondary'}
          icon={<ShoppingBag size={13} />}
          onClick={() => setActiveTab('pos')}
        >
          Purchase Orders ({allPending.filter((p) => p.targetType === 'purchase_order').length})
        </Button>
        <Button
          size="sm"
          variant={activeTab === 'qc' ? 'primary' : 'secondary'}
          icon={<ShieldAlert size={13} />}
          onClick={() => setActiveTab('qc')}
        >
          Failed QC / OCAP ({allPending.filter((p) => p.targetType === 'qc_failed').length})
        </Button>
      </div>

      <Card title={`Pending Multi-Stage Authorizations (${filteredPending.length})`} noPadding>
        <DataTable columns={columns} data={filteredPending} keyField="id" />
      </Card>

      {/* Universal Approval Component */}
      <ApprovalModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ isOpen: false, targetType: null, record: null })}
        targetType={modalState.targetType}
        record={modalState.record}
      />
    </div>
  );
}

export default ApprovalsPage;
