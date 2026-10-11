import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { useErp } from '../../hooks/useErp';
import { Plus, FileText, Truck, CheckCircle2, Factory, ArrowRight, Clock, ShieldCheck, AlertTriangle } from 'lucide-react';

export function ProductionPage() {
  const navigate = useNavigate();
  const { salesOrders, products, qcRecords, addProductionOutput, releaseDeliveryToDispatch } = useErp();

  const [selectedSoForPlan, setSelectedSoForPlan] = useState(null);
  const [isDailyEntryModalOpen, setIsDailyEntryModalOpen] = useState(false);

  const [batchForm, setBatchForm] = useState({
    productId: '',
    batchNo: 'B-2610-888',
    quantityKg: 25000,
    reactor: 'Reactor 01 (Fractionation)',
  });

  // Approved SOs for Production view (active SOs)
  const approvedSos = salesOrders.filter((s) => s.status === 'open' || s.status === 'in production' || s.status === 'part-delivered' || s.status === 'dispatched');

  const handleRecordBatch = (e) => {
    e.preventDefault();
    const prod = products.find((p) => p.id === batchForm.productId) || products[0];

    addProductionOutput({
      productId: prod.id,
      productName: prod.productName,
      quantityKg: Number(batchForm.quantityKg),
    });

    setIsDailyEntryModalOpen(false);
  };

  const soColumns = [
    {
      key: 'id',
      title: 'Sales Order #',
      render: (val) => <strong style={{ color: 'var(--color-primary-dark)' }}>{val}</strong>,
    },
    { key: 'customerName', title: 'Customer Account' },
    {
      key: 'product',
      title: 'Chemical Grade',
      render: (_, row) => row.items?.[0]?.productName || row.product || '—',
    },
    {
      key: 'qty',
      title: 'Ordered Volume',
      align: 'right',
      render: (_, row) => `${row.items?.[0]?.qty || row.quantity || 0} MT`,
    },
    {
      key: 'deliveries',
      title: 'Multi-Part Split (D1, D2)',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {(row.deliveries || []).map((d) => (
            <span
              key={d.id}
              style={{
                fontSize: '0.625rem',
                fontWeight: 700,
                padding: '2px 6px',
                borderRadius: 'var(--radius-pill)',
                background: d.status === 'dispatched' || d.status === 'delivered' ? '#DCFCE7' : '#FEF3C7',
                color: d.status === 'dispatched' || d.status === 'delivered' ? '#166534' : '#92400E',
                border: '1px solid var(--color-border)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 3,
              }}
            >
              {d.status === 'dispatched' || d.status === 'delivered' ? '✓' : '⚙'} {d.id}: {d.qty}MT ({d.status === 'dispatched' || d.status === 'delivered' ? 'Dispatched' : 'Plant'})
            </span>
          ))}
        </div>
      ),
    },
    {
      key: 'status',
      title: 'Production State',
      render: (val, row) => {
        const soQc = (qcRecords || []).filter((q) => q.soNumber === row.id);
        const isQcPassed = soQc.length > 0 && soQc.every((q) => q.status === 'passed');
        const isQcFailed = soQc.some((q) => q.status === 'failed');

        const allDispatched = row.deliveries && row.deliveries.length > 0 && row.deliveries.every((d) => d.status === 'dispatched' || d.status === 'delivered');
        const anyDispatched = row.deliveries && row.deliveries.some((d) => d.status === 'dispatched' || d.status === 'delivered');

        if (allDispatched) {
          return (
            <span
              className="badge badge--success"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
            >
              <CheckCircle2 size={12} /> Dispatched to Logistics
            </span>
          );
        }
        if (anyDispatched) {
          return (
            <span
              className="badge badge--info"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
            >
              Part Dispatched ({row.deliveries.filter((d) => d.status === 'dispatched' || d.status === 'delivered').map((d) => d.id).join(', ')})
            </span>
          );
        }

        if (isQcFailed) {
          return (
            <span
              className="badge badge--danger"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
            >
              <AlertTriangle size={12} /> QC Failed (OCAP Hold)
            </span>
          );
        }

        if (!isQcPassed) {
          return (
            <span
              className="badge badge--warning"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
            >
              <Clock size={12} /> Pending QC Clearance
            </span>
          );
        }

        return (
          <span
            className="badge badge--success"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
          >
            <ShieldCheck size={12} /> QC Passed (Ready for Dispatch)
          </span>
        );
      },
    },
    {
      key: 'actions',
      title: 'Actions',
      align: 'right',
      render: (_, row) => {
        const soQc = (qcRecords || []).filter((q) => q.soNumber === row.id);
        const isQcPassed = soQc.length > 0 && soQc.every((q) => q.status === 'passed');

        if (!isQcPassed) {
          return (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: '#92400e',
                  background: '#fef3c7',
                  padding: '4px 8px',
                  borderRadius: 'var(--radius-sm)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  border: '1px solid #fde68a',
                }}
              >
                <Clock size={12} /> Awaiting QC/QA Pass
              </span>
              <Button
                size="sm"
                variant="secondary"
                icon={<ShieldCheck size={13} />}
                onClick={() => navigate('/qc')}
              >
                QC Lab
              </Button>
            </div>
          );
        }

        const allDispatched = row.deliveries && row.deliveries.length > 0 && row.deliveries.every((d) => d.status === 'dispatched' || d.status === 'delivered');
        const anyDispatched = row.deliveries && row.deliveries.some((d) => d.status === 'dispatched' || d.status === 'delivered');

        // Once all parts are dispatched, do not show the Multi-Part Dispatch button
        if (allDispatched) {
          return (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: '#15803d',
                  background: '#dcfce7',
                  padding: '4px 8px',
                  borderRadius: 'var(--radius-sm)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  border: '1px solid #bbf7d0',
                }}
              >
                <CheckCircle2 size={12} /> All Lots Dispatched
              </span>
              <Button
                size="sm"
                variant="secondary"
                icon={<Truck size={13} />}
                onClick={() => navigate('/dispatch')}
              >
                Track Logistics
              </Button>
            </div>
          );
        }

        // If partially dispatched, prompt for remaining lots
        if (anyDispatched) {
          const remainingCount = row.deliveries.filter((d) => d.status !== 'dispatched' && d.status !== 'delivered').length;
          return (
            <Button
              size="sm"
              variant="primary"
              icon={<Truck size={13} />}
              onClick={() => setSelectedSoForPlan(row)}
            >
              Dispatch Remaining ({remainingCount} Part{remainingCount > 1 ? 's' : ''})
            </Button>
          );
        }

        return (
          <Button
            size="sm"
            variant="primary"
            icon={<Truck size={13} />}
            onClick={() => setSelectedSoForPlan(row)}
          >
            Multi-Part Dispatch (D1, D2)
          </Button>
        );
      },
    },
  ];

  return (
    <div>
      <PageHeader
        title="Production Scheduling & Reactor Vessels"
        description="Workflow: Approved Sales Orders → Daily Output Recording → Lab QC Handover → Dispatch Allocation"
        actions={
          <Button
            variant="primary"
            icon={<Plus size={15} />}
            onClick={() => setIsDailyEntryModalOpen(true)}
          >
            Record Daily Batch Output
          </Button>
        }
      />

      {/* Production View: Approved Orders */}
      <Card
        title="Active Sales Orders Committed for Plant Synthesis"
        subtitle="Read-only production plan with packaging checklists and palletization flags"
        noPadding
      >
        <DataTable columns={soColumns} data={approvedSos} keyField="id" />
      </Card>

      {/* Production Plan & Multi-Part Dispatch Handover Modal */}
      {selectedSoForPlan && (
        <Modal
          isOpen={Boolean(selectedSoForPlan)}
          onClose={() => setSelectedSoForPlan(null)}
          title={`Production Work Order & Dispatch: ${selectedSoForPlan.id}`}
          description={`Customer: ${selectedSoForPlan.customerName} • Target Synthesis Lot`}
          size="md"
          footer={
            <Button variant="secondary" onClick={() => setSelectedSoForPlan(null)}>
              Close
            </Button>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', fontSize: 'var(--font-size-xs)' }}>
            <div style={{ padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', background: 'var(--color-bg-subtle)' }}>
              <div><strong>Product:</strong> {selectedSoForPlan.items?.[0]?.productName || selectedSoForPlan.product}</div>
              <div><strong>Target Volume:</strong> {selectedSoForPlan.items?.[0]?.qty || selectedSoForPlan.quantity} MT</div>
              <div><strong>Packaging Type:</strong> {selectedSoForPlan.items?.[0]?.packaging || selectedSoForPlan.packaging || 'Bulk Road Tanker'}</div>
              <div><strong>Chemical Specification:</strong> {selectedSoForPlan.items?.[0]?.spec || selectedSoForPlan.spec || 'Standard Guaranteed'}</div>
            </div>

            {/* Multi Part Delivery (D1, D2) to Logistics Handover */}
            <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <strong style={{ color: 'var(--color-primary-dark)', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8125rem' }}>
                  <Truck size={14} /> Multi-Part Delivery Handover (D1, D2 ➔ Tanker Dispatch)
                </strong>
                <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-secondary)' }}>
                  Per Flow Diagram: Release synthesized lots directly to Logistics
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 10 }}>
                {(selectedSoForPlan.deliveries || [{ id: 'D1', qty: selectedSoForPlan.quantity || 20, status: 'open' }]).map((del) => {
                  const isDispatched = del.status === 'dispatched' || del.status === 'delivered';
                  return (
                    <div
                      key={del.id}
                      style={{
                        padding: 10,
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-sm)',
                        background: isDispatched ? '#F0FDF4' : '#FAFAFB',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 8,
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.8125rem', color: 'var(--color-primary-dark)' }}>
                          Part {del.id} ({del.qty} MT)
                        </span>
                        <span
                          className={`badge ${isDispatched ? 'badge--success' : 'badge--warning'}`}
                          style={{ fontSize: '0.625rem' }}
                        >
                          {isDispatched ? 'Dispatched' : 'In Reactor'}
                        </span>
                      </div>

                      <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-secondary)' }}>
                        <div><strong>Vessel:</strong> {del.reactorVessel || 'Reactor R-101 (Fractionation)'}</div>
                        <div><strong>Dispatch Slot:</strong> {del.dispatchDate || 'Phase Scheduled'}</div>
                      </div>

                      {isDispatched ? (
                        <div style={{ fontSize: '0.6875rem', color: 'var(--color-success)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <CheckCircle2 size={13} /> Active in Tanker Logistics
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="primary"
                          icon={<Truck size={13} />}
                          onClick={() => {
                            releaseDeliveryToDispatch(selectedSoForPlan.id, del.id, 'Reactor R-101 (Fractionation)');
                            setSelectedSoForPlan((prev) => {
                              const newDels = prev.deliveries?.map((d) => d.id === del.id ? { ...d, status: 'dispatched' } : d);
                              const allDisp = newDels?.every((d) => d.status === 'dispatched' || d.status === 'delivered');
                              return {
                                ...prev,
                                status: allDisp ? 'dispatched' : 'part-delivered',
                                deliveries: newDels,
                              };
                            });
                          }}
                        >
                          Release {del.id} to Dispatch
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, paddingTop: 4 }}>
              <div><strong>Palletization Required:</strong> Yes (ISPM-15 Heat Treated)</div>
              <div><strong>Special Labeling:</strong> GHS Hazchem Diamond + QR</div>
              <div><strong>Transportation Bay:</strong> Gate 2 Weighbridge Tanker Bay</div>
              <div><strong>Multi-delivery Split:</strong> {selectedSoForPlan.deliveries?.length > 1 ? 'Yes (Split D1, D2)' : 'No (Single Run)'}</div>
            </div>

            <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 8 }}>
              <strong>Pre-batch Safety Checklist:</strong>
              <div style={{ color: 'var(--color-success)', marginTop: 4 }}>
                ✓ Reactor vessel purged with Nitrogen<br />
                ✓ Heat exchanger steam pressure verified at 3.2 bar<br />
                ✓ In-line filtration mesh 50 micron installed
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Record Daily Batch Modal */}
      <Modal
        isOpen={isDailyEntryModalOpen}
        onClose={() => setIsDailyEntryModalOpen(false)}
        title="Record Daily Reactor Batch Run"
        description="Deducts raw feedstock and posts chemical output into live inventory."
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsDailyEntryModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleRecordBatch}>
              Commit Output Batch
            </Button>
          </>
        }
      >
        <form onSubmit={handleRecordBatch} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Select
            label="Product Synthesized"
            required
            value={batchForm.productId}
            onChange={(e) => setBatchForm({ ...batchForm, productId: e.target.value })}
            options={products.map((p) => ({ value: p.id, label: p.productName }))}
          />
          <Select
            label="Processing Vessel"
            value={batchForm.reactor}
            onChange={(e) => setBatchForm({ ...batchForm, reactor: e.target.value })}
            options={[
              { value: 'Reactor 01 (Fractionation)', label: 'Reactor 01 (Fractionation)' },
              { value: 'Reactor 02 (Esterification)', label: 'Reactor 02 (Esterification)' },
              { value: 'Autoclave A-02 (Hydrogenation)', label: 'Autoclave A-02 (Hydrogenation)' },
              { value: 'Vacuum Distillation Column 04', label: 'Vacuum Distillation Column 04' },
            ]}
          />
          <Input
            label="Batch Serial Number"
            required
            value={batchForm.batchNo}
            onChange={(e) => setBatchForm({ ...batchForm, batchNo: e.target.value })}
          />
          <Input
            label="Quantity Produced (kg)"
            type="number"
            required
            value={batchForm.quantityKg}
            onChange={(e) => setBatchForm({ ...batchForm, quantityKg: e.target.value })}
          />
        </form>
      </Modal>
    </div>
  );
}

export default ProductionPage;
