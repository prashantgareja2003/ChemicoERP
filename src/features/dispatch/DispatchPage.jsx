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
import { Truck, Plus, FileText, CheckCircle2, Upload, Printer } from 'lucide-react';

export function DispatchPage() {
  const { logisticsTasks, updateLogisticsTask, notify } = useErp();

  const [selectedTask, setSelectedTask] = useState(null);
  const [isOutwardTaskModalOpen, setIsOutwardTaskModalOpen] = useState(false);
  const [activeStageUpdateTask, setActiveStageUpdateTask] = useState(null);

  // Outward Task Form
  const [outwardForm, setOutwardForm] = useState({
    outwardDate: '10 Oct 2026',
    line: 'SafeChem Bulk Carriers',
    rateFreight: '₹14,500',
    vesselName: 'Tanker GJ-16-AX-8921',
    gateOpen: '07:00 AM',
    cutOff: '11:00 AM',
    loadingDate: '10 Oct 2026',
    bol: 'BOL-SC-2026-9912',
    sob: 'SOB-10-OCT-26',
  });

  const columns = [
    {
      key: 'id',
      title: 'Work Order #',
      render: (val) => <strong style={{ color: 'var(--color-primary-dark)' }}>{val}</strong>,
    },
    { key: 'soNumber', title: 'Sales Order Ref' },
    { key: 'deliveryId', title: 'Shipment Part (D1/D2)' },
    { key: 'consignee', title: 'Destination Consignee' },
    { key: 'productName', title: 'Consignment Grade' },
    {
      key: 'weightMT',
      title: 'Payload (MT)',
      align: 'right',
      render: (val) => `${val} MT`,
    },
    {
      key: 'stage',
      title: 'Logistics Stage',
      render: (val) => <StatusBadge status={val} />,
    },
    {
      key: 'actions',
      title: 'Actions',
      align: 'right',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
          <Button
            size="sm"
            variant="secondary"
            icon={<FileText size={13} />}
            onClick={() => setSelectedTask(row)}
          >
            Inward Work Order
          </Button>

          <Button
            size="sm"
            variant="primary"
            icon={<Truck size={13} />}
            onClick={() => {
              setActiveStageUpdateTask(row);
              setIsOutwardTaskModalOpen(true);
            }}
          >
            Update Outward / Stage
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Logistics, Tanker Fleet & Delivery Tracking"
        description="Workflow: Inward Work Order (triggered by SO approval) → Outward Logistics Manifest → 4 Stages: Booking → Dispatch → In Transit → Delivered (POD)."
      />

      <Card title="Road Tanker Manifests & Consignment Tracking" noPadding>
        <DataTable columns={columns} data={logisticsTasks} keyField="id" />
      </Card>

      {/* Inward Work Order Read-Only Modal */}
      {selectedTask && (
        <Modal
          isOpen={Boolean(selectedTask)}
          onClose={() => setSelectedTask(null)}
          title={`Inward Work Order: ${selectedTask.id}`}
          description={`Auto-generated upon HOD approval of ${selectedTask.soNumber} (${selectedTask.deliveryId})`}
          size="md"
          footer={
            <>
              <Button variant="secondary" onClick={() => setSelectedTask(null)}>Close</Button>
              <Button
                variant="primary"
                icon={<Printer size={14} />}
                onClick={() => notify('Dispatch note PDF generated.')}
              >
                Print Dispatch Note
              </Button>
            </>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', fontSize: 'var(--font-size-xs)' }}>
            <div style={{ padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', background: 'var(--color-bg-subtle)', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
              <div><strong>From CX / Place:</strong> {selectedTask.fromPlace || 'SDF Oilchems Dahej Plant #1'}</div>
              <div><strong>To Consignee / Dest:</strong> {selectedTask.consignee}</div>
              <div><strong>Buyer other than Consignee:</strong> {selectedTask.buyerOtherThanConsignee || 'Same as Consignee'}</div>
              <div><strong>Sales Order Ref #:</strong> {selectedTask.soNumber} ({selectedTask.deliveryId})</div>
            </div>

            <div style={{ padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
              <div><strong>Chemical Product Name:</strong> {selectedTask.productName}</div>
              <div><strong>HSN Code:</strong> {selectedTask.hsn || '29054500'}</div>
              <div><strong>Weight / Quantity:</strong> {selectedTask.weightMT} MT</div>
              <div><strong>Price / Unit:</strong> {selectedTask.unitPrice ? `₹${selectedTask.unitPrice.toLocaleString()} / MT` : '₹96,000 / MT'}</div>
              <div><strong>Packaging Type:</strong> {selectedTask.packaging || 'Bulk Road Tanker'}</div>
              <div><strong>Container Type:</strong> {selectedTask.containerType || '20ft ISO Tank / FCL'}</div>
              <div><strong>Stuffing Date:</strong> {selectedTask.stuffingDate || '10 Oct 2026'}</div>
              <div><strong>Tanker Condition:</strong> {selectedTask.condition || 'Cleaned, Passivated & Nitrogen Blanketed'}</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
              <div><strong>Port of Loading (POL):</strong> {selectedTask.pol}</div>
              <div><strong>Port of Delivery (POD):</strong> {selectedTask.pod}</div>
              <div><strong>Vehicle Number:</strong> {selectedTask.vehicleNo}</div>
              <div><strong>Driver Contact:</strong> {selectedTask.driverContact}</div>
              <div><strong>Customer POD Uploaded:</strong> {selectedTask.podUploaded ? '✓ Verified POD on file' : 'Pending Delivery'}</div>
            </div>

            <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 8 }}>
              <strong>Carrier / Outward Line:</strong>
              <div>Line: {selectedTask.outwardTask?.line} • Rate: {selectedTask.outwardTask?.rateFreight}</div>
              <div>BOL Ref: {selectedTask.outwardTask?.bol} • SOB: {selectedTask.outwardTask?.sob}</div>
            </div>
          </div>
        </Modal>
      )}

      {/* Outward Task & Stage Form Modal */}
      {activeStageUpdateTask && (
        <Modal
          isOpen={isOutwardTaskModalOpen}
          onClose={() => {
            setIsOutwardTaskModalOpen(false);
            setActiveStageUpdateTask(null);
          }}
          title={`Outward Task Entry: ${activeStageUpdateTask.id}`}
          description={`Logistics details for ${activeStageUpdateTask.soNumber} (${activeStageUpdateTask.deliveryId})`}
          size="md"
          footer={
            <>
              <Button variant="secondary" onClick={() => setIsOutwardTaskModalOpen(false)}>Cancel</Button>
              <Button
                variant="primary"
                onClick={() => {
                  updateLogisticsTask(activeStageUpdateTask.id, outwardForm.stage || activeStageUpdateTask.stage, {
                    outwardTask: outwardForm,
                    vehicleNo: outwardForm.vesselName,
                    podUploaded: outwardForm.stage === 'delivered',
                  });
                  setIsOutwardTaskModalOpen(false);
                  setActiveStageUpdateTask(null);
                }}
              >
                Save Logistics Task
              </Button>
            </>
          }
        >
          <div className="erp-form-grid">
            <Select
              label="Logistics Stage"
              value={outwardForm.stage || activeStageUpdateTask.stage}
              onChange={(e) => setOutwardForm({ ...outwardForm, stage: e.target.value })}
              options={[
                { value: 'booking', label: 'Booking (Vehicle & Date Scheduled)' },
                { value: 'dispatched', label: 'Dispatched (Left Dahej Gate)' },
                { value: 'in transit', label: 'In Transit (On Highway)' },
                { value: 'delivered', label: 'Delivered (Signed POD Uploaded)' },
              ]}
            />
            <Input
              label="Outward Date"
              value={outwardForm.outwardDate}
              onChange={(e) => setOutwardForm({ ...outwardForm, outwardDate: e.target.value })}
            />
            <Input
              label="Line / Carrier Company"
              value={outwardForm.line}
              onChange={(e) => setOutwardForm({ ...outwardForm, line: e.target.value })}
            />
            <Input
              label="Rate / Freight"
              value={outwardForm.rateFreight}
              onChange={(e) => setOutwardForm({ ...outwardForm, rateFreight: e.target.value })}
            />
            <Input
              label="Vessel Name / Tanker No"
              value={outwardForm.vesselName}
              onChange={(e) => setOutwardForm({ ...outwardForm, vesselName: e.target.value })}
            />
            <Input
              label="Gate Open Hours"
              value={outwardForm.gateOpen}
              onChange={(e) => setOutwardForm({ ...outwardForm, gateOpen: e.target.value })}
            />
            <Input
              label="Cut-Off Time"
              value={outwardForm.cutOff || '11:00 AM'}
              onChange={(e) => setOutwardForm({ ...outwardForm, cutOff: e.target.value })}
            />
            <Input
              label="Loading Date"
              value={outwardForm.loadingDate || '10 Oct 2026'}
              onChange={(e) => setOutwardForm({ ...outwardForm, loadingDate: e.target.value })}
            />
            <Input
              label="Bill of Lading (BOL)"
              value={outwardForm.bol}
              onChange={(e) => setOutwardForm({ ...outwardForm, bol: e.target.value })}
            />
            <Input
              label="Shipped on Board (SOB)"
              value={outwardForm.sob}
              onChange={(e) => setOutwardForm({ ...outwardForm, sob: e.target.value })}
            />
          </div>
        </Modal>
      )}
    </div>
  );
}

export default DispatchPage;
