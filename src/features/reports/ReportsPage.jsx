import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { useErp } from '../../hooks/useErp';
import { FileSpreadsheet, Download } from 'lucide-react';

export function ReportsPage() {
  const { salesOrders, purchaseOrders, stock, products, notify } = useErp();

  const handleExport = (reportName) => {
    let rows;
    if (reportName.includes('Sales')) {
      rows = salesOrders.map((s) => ({
        SO_Number: s.id,
        Customer: s.customerName,
        Product: s.items[0]?.productName,
        Qty_MT: s.items[0]?.qty,
        Value_INR: s.totalValue,
        Status: s.status,
      }));
    } else if (reportName.includes('Stock')) {
      rows = stock.map((st) => {
        const prod = products.find((p) => p.id === st.productId);
        return {
          Product: prod?.productName,
          Code: prod?.productCode,
          Stock_MT: (st.stockKg / 1000).toFixed(1),
          Safety_MT: (st.minStockKg / 1000).toFixed(1),
        };
      });
    } else {
      rows = purchaseOrders.map((p) => ({
        PO_Number: p.id,
        Supplier: p.supplierName,
        Material: p.material,
        Qty: p.qty,
        Total_INR: p.totalWithTax,
        Status: p.status,
      }));
    }

    const headers = Object.keys(rows[0]).join(',');
    const csvContent = rows.map((r) => Object.values(r).join(',')).join('\n');
    const blob = new Blob([`${headers}\n${csvContent}`], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportName.toLowerCase().replace(/\s+/g, '_')}.csv`;
    a.click();
    notify(`Exported ${reportName} to Excel/CSV`);
  };

  const reports = [
    {
      title: 'Daily Oleochemical Plant Production & Mass Balance Yield',
      desc: 'Raw CPO feedstock input vs. finished Stearic / Oleic / Glycerin yield percentages across all active reactors.',
      frequency: 'Daily (08:00 AM)',
      format: 'XLSX / PDF',
    },
    {
      title: 'Monthly Sales Fulfillment & Dispatch Registry',
      desc: 'Consignee deliveries, road tanker freight costs, weighbridge reconciliations, and outstanding pending dispatches.',
      frequency: 'Monthly / Real-time',
      format: 'CSV / Excel',
    },
    {
      title: 'Raw Material Consumption & Chemical Stock Valuation',
      desc: 'Bulk Silo inventory balances, reorder trigger alerts, weighted average purchase price valuation.',
      frequency: 'Weekly',
      format: 'XLSX',
    },
    {
      title: 'Quality Control Monograph & Certificate of Analysis (COA) Log',
      desc: 'Laboratory test outcomes, GC purity curves, color APHA ratings, moisture and acid value compliance.',
      frequency: 'Per Batch Run',
      format: 'PDF',
    },
  ];

  return (
    <div>
      <PageHeader
        title="Reports & Statutory Registers"
        description="Daily plant mass-balance reconciliations, GST dispatch registers, material consumption valuation, and COA monograph audits."
      />

      <div className="erp-grid-equal-2col">
        {reports.map((rpt, idx) => (
          <Card key={idx} title={rpt.title} subtitle={`Frequency: ${rpt.frequency}`}>
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-4)' }}>
              {rpt.desc}
            </p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <Button
                size="sm"
                variant="secondary"
                icon={<FileSpreadsheet size={13} />}
                onClick={() => notify(`Preview generated for ${rpt.title}`)}
              >
                Preview
              </Button>
              <Button
                size="sm"
                variant="primary"
                icon={<Download size={13} />}
                onClick={() => handleExport(rpt.title)}
              >
                Download {rpt.format}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default ReportsPage;
