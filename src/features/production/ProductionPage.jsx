import { useState } from 'react';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { useErp } from '../../hooks/useErp';
import { Plus, FileText } from 'lucide-react';

export function ProductionPage() {
  const { salesOrders, products, addProductionOutput } = useErp();

  const [selectedSoForPlan, setSelectedSoForPlan] = useState(null);
  const [isDailyEntryModalOpen, setIsDailyEntryModalOpen] = useState(false);

  const [batchForm, setBatchForm] = useState({
    productId: '',
    batchNo: 'B-2610-888',
    quantityKg: 25000,
    reactor: 'Reactor 01 (Fractionation)',
  });

  // Approved SOs for Production view (read-only per SO)
  const approvedSos = salesOrders.filter((s) => s.status === 'open' || s.status === 'in production');

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
      render: (_, row) => row.items[0]?.productName || '—',
    },
    {
      key: 'qty',
      title: 'Ordered Volume',
      align: 'right',
      render: (_, row) => `${row.items[0]?.qty || 0} MT`,
    },
    {
      key: 'spec',
      title: 'Specification / Purity',
      render: (_, row) => (
        <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-secondary)' }}>
          {row.items[0]?.spec || 'Standard Specification'}
        </span>
      ),
    },
    {
      key: 'status',
      title: 'Production State',
      render: (val) => <StatusBadge status={val} />,
    },
    {
      key: 'actions',
      title: 'Actions',
      align: 'right',
      render: (_, row) => (
        <Button
          size="sm"
          variant="secondary"
          icon={<FileText size={13} />}
          onClick={() => setSelectedSoForPlan(row)}
        >
          Production Sheet
        </Button>
      ),
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

      {/* Read-Only Production View per SO Modal */}
      {selectedSoForPlan && (
        <Modal
          isOpen={Boolean(selectedSoForPlan)}
          onClose={() => setSelectedSoForPlan(null)}
          title={`Production Work Order: ${selectedSoForPlan.id}`}
          description={`Customer: ${selectedSoForPlan.customerName} • Lead Time: 5-7 Days`}
          size="md"
          footer={
            <Button variant="secondary" onClick={() => setSelectedSoForPlan(null)}>
              Done
            </Button>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', fontSize: 'var(--font-size-xs)' }}>
            <div style={{ padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', background: 'var(--color-bg-subtle)' }}>
              <div><strong>Product:</strong> {selectedSoForPlan.items[0]?.productName}</div>
              <div><strong>Target Quantity:</strong> {selectedSoForPlan.items[0]?.qty} MT</div>
              <div><strong>Packaging Type:</strong> {selectedSoForPlan.items[0]?.packaging || 'Bulk Road Tanker'}</div>
              <div><strong>Chemical Specification:</strong> {selectedSoForPlan.items[0]?.spec}</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
              <div><strong>Palletization Required:</strong> Yes (ISPM-15 Heat Treated)</div>
              <div><strong>Special Requirements / Labelling:</strong> GHS Hazchem Diamond + Certificate Batch QR</div>
              <div><strong>Local Transportation Pickup:</strong> Gate 2 Weighbridge Tanker Bay</div>
              <div><strong>Multi-delivery Shipment Flag:</strong> {selectedSoForPlan.deliveries?.length > 1 ? 'Yes (Split D1, D2)' : 'No (Single Run)'}</div>
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
