import { useState } from 'react';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import ApprovalModal from '../../components/common/ApprovalModal';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { useErp } from '../../hooks/useErp';
import { Plus, AlertTriangle, Eye, ShieldCheck } from 'lucide-react';

export function QcPage() {
  const { qcRecords, products, passQcRecord, salesOrders } = useErp();
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [selectedRecordForTest, setSelectedRecordForTest] = useState(null);
  const [approvalModalState, setApprovalModalState] = useState({ isOpen: false, record: null });

  // Test Entry Form
  const [testForm, setTestForm] = useState({
    productName: '',
    soNumber: '',
    batchNo: '',
    quantityKg: 40000,
    spec: 'USP / BP Pharma Standard',
    p1: '99.82',
    p2: '6',
    p3: '<1',
    p4: '1.2614',
    p5: '0.12',
  });

  const handleOpenRecordTest = (row) => {
    setSelectedRecordForTest(row);
    setTestForm({
      productName: row.product,
      soNumber: row.soNumber,
      batchNo: row.batchNo,
      quantityKg: row.quantityKg || 40000,
      spec: row.spec || 'USP / BP Pharma Standard',
      p1: '99.82',
      p2: '6',
      p3: '<1',
      p4: '1.2614',
      p5: '0.12',
    });
  };

  const handleRecordTest = (e) => {
    e.preventDefault();
    if (!selectedRecordForTest) return;

    const parameters = [
      { parameter: 'Assay Purity %', specification: 'Min 99.7%', result: `${testForm.p1}%`, passed: Number(testForm.p1) >= 99.7 },
      { parameter: 'Color APHA', specification: 'Max 10 APHA', result: `${testForm.p2} APHA`, passed: Number(testForm.p2) <= 10 },
      { parameter: 'Heavy Metals (ppm)', specification: 'Max 5 ppm', result: `${testForm.p3} ppm`, passed: true },
      { parameter: 'Specific Gravity', specification: '1.2612 - 1.2618', result: testForm.p4, passed: true },
      { parameter: 'Water Content %', specification: 'Max 0.3%', result: `${testForm.p5}%`, passed: Number(testForm.p5) <= 0.3 },
    ];

    passQcRecord(selectedRecordForTest.id, parameters);
    setSelectedRecordForTest(null);
  };

  const columns = [
    {
      key: 'id',
      title: 'QC Report #',
      render: (val) => <strong style={{ color: 'var(--color-primary-dark)' }}>{val}</strong>,
    },
    { key: 'product', title: 'Chemical Product Grade' },
    { key: 'batchNo', title: 'Batch ID #' },
    { key: 'soNumber', title: 'Sales Order Ref' },
    {
      key: 'quantityKg',
      title: 'Batch Qty (MT)',
      align: 'right',
      render: (val) => `${(val / 1000).toFixed(1)} MT`,
    },
    { key: 'checkedBy', title: 'Inspecting Chemist' },
    {
      key: 'status',
      title: 'Disposition Status',
      render: (val) => <StatusBadge status={val} />,
    },
    {
      key: 'actions',
      title: 'Actions',
      align: 'right',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', alignItems: 'center' }}>
          {row.status === 'pending' && (
            <Button
              size="sm"
              variant="primary"
              icon={<ShieldCheck size={13} />}
              onClick={() => handleOpenRecordTest(row)}
            >
              Record Laboratory QC Test
            </Button>
          )}
          <Button
            size="sm"
            variant="secondary"
            icon={<Eye size={13} />}
            onClick={() => setSelectedRecord(row)}
          >
            View Monograph
          </Button>
          {row.status === 'failed' && (
            <Button
              size="sm"
              variant="danger"
              icon={<ShieldCheck size={13} />}
              onClick={() => setApprovalModalState({ isOpen: true, record: row })}
            >
              HOD Decision / OCAP
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Quality Control & QA Batch Releases"
        description="Laboratory COA monographs, analytical parameter checks, pass/fail disposition, and Out-of-Control Action Plans (OCAP)."
      />

      <Card title="Batch Release Registry & Testing Monograph Archive" noPadding>
        <DataTable columns={columns} data={qcRecords} keyField="id" />
      </Card>

      {/* Monograph Inspection Modal */}
      {selectedRecord && (
        <Modal
          isOpen={Boolean(selectedRecord)}
          onClose={() => setSelectedRecord(null)}
          title={`Certificate of Analysis: ${selectedRecord.id}`}
          description={`Batch #${selectedRecord.batchNo} • ${selectedRecord.product} • ${selectedRecord.spec}`}
          size="lg"
          footer={
            <Button variant="secondary" onClick={() => setSelectedRecord(null)}>
              Close Monograph
            </Button>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <table className="erp-table">
              <thead>
                <tr>
                  <th>Testing Parameter</th>
                  <th>Standard Specification</th>
                  <th>Lab Result</th>
                  <th>Compliance</th>
                </tr>
              </thead>
              <tbody>
                {selectedRecord.parameters.map((param, i) => (
                  <tr key={i}>
                    <td><strong>{param.parameter}</strong></td>
                    <td>{param.specification}</td>
                    <td><strong>{param.result}</strong></td>
                    <td>
                      <StatusBadge status={param.passed ? 'Quality Passed' : 'Failed'} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* OCAP Section if Failed */}
            {selectedRecord.status === 'failed' && selectedRecord.failedDetails?.ocap && (
              <div
                style={{
                  padding: 'var(--space-3)',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--color-error-bg)',
                  border: '1px solid var(--color-error-border)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-error)', fontWeight: 700, marginBottom: 4 }}>
                  <AlertTriangle size={16} /> Out-of-Control Action Plan (OCAP)
                </div>
                <div style={{ fontSize: 'var(--font-size-xs)', display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <div><strong>Root Cause:</strong> {selectedRecord.failedDetails.ocap.cause}</div>
                  <div><strong>Corrective Action:</strong> {selectedRecord.failedDetails.ocap.action}</div>
                  <div><strong>Responsible Owner:</strong> {selectedRecord.failedDetails.ocap.owner}</div>
                  <div><strong>Target Closure:</strong> {selectedRecord.failedDetails.ocap.closure}</div>
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Record Laboratory Test Modal for selected pending QC Record */}
      {selectedRecordForTest && (
        <Modal
          isOpen={Boolean(selectedRecordForTest)}
          onClose={() => setSelectedRecordForTest(null)}
          title={`Record Laboratory QC Test: ${selectedRecordForTest.id}`}
          description={`Testing Monograph for ${selectedRecordForTest.soNumber} • Batch #${selectedRecordForTest.batchNo} (${(selectedRecordForTest.quantityKg / 1000).toFixed(1)} MT)`}
          size="md"
          footer={
            <>
              <Button variant="secondary" onClick={() => setSelectedRecordForTest(null)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleRecordTest}>
                Save & Pass Monograph
              </Button>
            </>
          }
        >
          <form onSubmit={handleRecordTest} className="erp-form-grid">
            <Input
              label="Product Grade"
              readOnly
              value={testForm.productName}
            />
            <Input
              label="Sales Order Ref"
              readOnly
              value={testForm.soNumber}
            />
            <Input
              label="Reactor Batch #"
              readOnly
              value={testForm.batchNo}
            />
            <Input
              label="Quantity (kg)"
              type="number"
              required
              value={testForm.quantityKg}
              onChange={(e) => setTestForm({ ...testForm, quantityKg: e.target.value })}
            />

            <div className="erp-col-span-2">
              <h4 style={{ fontSize: 'var(--font-size-xs)', textTransform: 'uppercase', color: 'var(--color-text-secondary)', margin: '8px 0 4px' }}>
                Analytical Monograph Testing Parameters
              </h4>
            </div>

            <Input
              label="Assay Purity % (Min 99.7)"
              required
              value={testForm.p1}
              onChange={(e) => setTestForm({ ...testForm, p1: e.target.value })}
            />
            <Input
              label="Color APHA (Max 10)"
              required
              value={testForm.p2}
              onChange={(e) => setTestForm({ ...testForm, p2: e.target.value })}
            />
            <Input
              label="Heavy Metals ppm (Max 5)"
              required
              value={testForm.p3}
              onChange={(e) => setTestForm({ ...testForm, p3: e.target.value })}
            />
            <Input
              label="Specific Gravity (1.2612 - 1.2618)"
              required
              value={testForm.p4}
              onChange={(e) => setTestForm({ ...testForm, p4: e.target.value })}
            />
            <Input
              label="Water Content % (Max 0.3)"
              required
              value={testForm.p5}
              onChange={(e) => setTestForm({ ...testForm, p5: e.target.value })}
            />
          </form>
        </Modal>
      )}

      {/* Universal Approval Modal for Failed QC */}
      <ApprovalModal
        isOpen={approvalModalState.isOpen}
        onClose={() => setApprovalModalState({ isOpen: false, record: null })}
        targetType="qc_failed"
        record={approvalModalState.record}
      />
    </div>
  );
}

export default QcPage;
