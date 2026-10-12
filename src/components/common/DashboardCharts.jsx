import { useState } from 'react';
import Card from '../ui/Card';
import {
  PieChart as PieIcon,
  TrendingUp,
  Boxes,
  Truck,
  CheckCircle2,
  Factory,
  Layers,
} from 'lucide-react';

export function DashboardCharts({ salesOrders = [], quotations = [] }) {
  const [hoveredProductIndex, setHoveredProductIndex] = useState(null);
  const [hoveredPhaseIndex, setHoveredPhaseIndex] = useState(null);

  // Chemical Product Sales Distribution Data
  const productDistribution = [
    {
      name: 'Refined Glycerin (USP 99.7%)',
      code: 'GLY-997',
      volumeMT: 1080,
      revenueCr: 3.20,
      share: 38,
      color: '#10B981', // Emerald
    },
    {
      name: 'Distilled Oleic Acid (Grade 90+)',
      code: 'OLEIC-90',
      volumeMT: 795,
      revenueCr: 2.36,
      share: 28,
      color: '#3B82F6', // Blue
    },
    {
      name: 'Triple Pressed Stearic Acid',
      code: 'STEARIC-TP',
      volumeMT: 568,
      revenueCr: 1.68,
      share: 20,
      color: '#F59E0B', // Amber
    },
    {
      name: 'Fractionated Fatty Acids & Misc',
      code: 'FFA-CRUDE',
      volumeMT: 397,
      revenueCr: 1.18,
      share: 14,
      color: '#8B5CF6', // Violet
    },
  ];

  // Order Lifecycle Distribution Data
  const inProdCount = salesOrders.filter((s) => s.status === 'in production').length || 2;
  const inTransitCount = salesOrders.filter((s) => s.status === 'part-delivered' || s.status === 'dispatched' || s.status === 'delivered').length || 1;
  const inPaymentCount = salesOrders.filter((s) => s.status === 'invoiced' || (s.status !== 'completed' && s.status !== 'open' && s.status !== 'in production' && s.status !== 'part-delivered')).length || 1;
  const completedCount = salesOrders.filter((s) => s.status === 'completed').length || 0;
  const totalPhaseOrders = inProdCount + inTransitCount + inPaymentCount + completedCount || 4;

  const phaseDistribution = [
    {
      phase: 'In Production (Batch Synthesis)',
      count: inProdCount,
      percentage: Math.round((inProdCount / totalPhaseOrders) * 100) || 50,
      color: '#EA580C', // Orange
      icon: Factory,
      sub: 'Plant Reactors',
    },
    {
      phase: 'In Transportation (Tankers Dispatched)',
      count: inTransitCount,
      percentage: Math.round((inTransitCount / totalPhaseOrders) * 100) || 25,
      color: '#0284C7', // Sky Blue
      icon: Truck,
      sub: 'On Highway / Transit',
    },
    {
      phase: 'In Payment Phase (Invoicing)',
      count: inPaymentCount,
      percentage: Math.round((inPaymentCount / totalPhaseOrders) * 100) || 25,
      color: '#7C3AED', // Purple
      icon: Layers,
      sub: 'Pending Settlement',
    },
    {
      phase: 'Completed (Settled)',
      count: completedCount,
      percentage: Math.round((completedCount / totalPhaseOrders) * 100) || 0,
      color: '#16A34A', // Green
      icon: CheckCircle2,
      sub: 'Fully Settled',
    },
  ];

  // Helper to calculate SVG donut slices
  const radius = 68;
  const circumference = 2 * Math.PI * radius; // ≈ 427.25

  let accumulatedProductPercent = 0;
  let accumulatedPhasePercent = 0;

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: 'var(--space-4)',
        marginBottom: 'var(--space-4)',
      }}
    >
      {/* Chart 1: Chemical Product Revenue & Volume Share (Donut / Pie Chart) */}
      <Card
        title="Chemical Product Revenue & Volume Distribution"
        subtitle="MTD Sales mix across core oleochemical manufacturing categories"
        actions={
          <span
            style={{
              fontSize: '0.6875rem',
              fontWeight: 700,
              color: '#059669',
              background: '#ECFDF5',
              padding: '2px 8px',
              borderRadius: '999px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <TrendingUp size={12} /> ₹8.42 Cr Total (2,840 MT)
          </span>
        }
        noPadding
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            flexWrap: 'wrap',
            gap: 16,
          }}
        >
          {/* Donut SVG Visual */}
          <div style={{ position: 'relative', width: 170, height: 170, flexShrink: 0, margin: '0 auto' }}>
            <svg width="170" height="170" viewBox="0 0 170 170" style={{ transform: 'rotate(-90deg)' }}>
              {/* Background circle track */}
              <circle
                cx="85"
                cy="85"
                r={radius}
                fill="transparent"
                stroke="#F1F5F9"
                strokeWidth="24"
              />
              {/* Data Slices */}
              {productDistribution.map((prod, index) => {
                const strokeDasharray = `${(prod.share / 100) * circumference} ${circumference}`;
                const strokeDashoffset = -((accumulatedProductPercent / 100) * circumference);
                accumulatedProductPercent += prod.share;
                const isHovered = hoveredProductIndex === index;

                return (
                  <circle
                    key={prod.name}
                    cx="85"
                    cy="85"
                    r={radius}
                    fill="transparent"
                    stroke={prod.color}
                    strokeWidth={isHovered ? 28 : 24}
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    style={{
                      transition: 'all 0.25s ease',
                      cursor: 'pointer',
                      opacity: hoveredProductIndex !== null && !isHovered ? 0.45 : 1,
                    }}
                    onMouseEnter={() => setHoveredProductIndex(index)}
                    onMouseLeave={() => setHoveredProductIndex(null)}
                  />
                );
              })}
            </svg>

            {/* Donut Center Display */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'none',
              }}
            >
              <span style={{ fontSize: '0.625rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>
                {hoveredProductIndex !== null ? productDistribution[hoveredProductIndex].code : 'Total Sales'}
              </span>
              <strong style={{ fontSize: '1.05rem', color: '#0F172A', fontWeight: 800 }}>
                {hoveredProductIndex !== null
                  ? `${productDistribution[hoveredProductIndex].share}%`
                  : '₹8.42 Cr'}
              </strong>
              <span style={{ fontSize: '0.625rem', color: '#059669', fontWeight: 600 }}>
                {hoveredProductIndex !== null
                  ? `₹${productDistribution[hoveredProductIndex].revenueCr} Cr`
                  : '2,840 MT'}
              </span>
            </div>
          </div>

          {/* Detailed Legend & Metrics */}
          <div style={{ flex: '1 1 180px', display: 'flex', flexDirection: 'column', gap: 7 }}>
            {productDistribution.map((prod, i) => {
              const isHovered = hoveredProductIndex === i;
              return (
                <div
                  key={prod.name}
                  onMouseEnter={() => setHoveredProductIndex(i)}
                  onMouseLeave={() => setHoveredProductIndex(null)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    background: isHovered ? '#F8FAFC' : 'transparent',
                    cursor: 'pointer',
                    transition: 'background 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span
                      style={{
                        width: 9,
                        height: 9,
                        borderRadius: '50%',
                        background: prod.color,
                        flexShrink: 0,
                      }}
                    />
                    <div>
                      <div
                        style={{
                          fontSize: '0.71875rem',
                          fontWeight: 600,
                          color: isHovered ? prod.color : '#1E293B',
                        }}
                      >
                        {prod.name}
                      </div>
                      <div style={{ fontSize: '0.625rem', color: '#64748B' }}>
                        {prod.volumeMT} MT • ₹{prod.revenueCr} Cr
                      </div>
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: '0.6875rem',
                      fontWeight: 700,
                      color: prod.color,
                      background: `${prod.color}15`,
                      padding: '1px 6px',
                      borderRadius: '4px',
                    }}
                  >
                    {prod.share}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Chart 2: Order Lifecycle Phase Distribution (Pie / Donut Chart) */}
      <Card
        title="Order Lifecycle Phase Distribution"
        subtitle="Real-time workflow distribution: Production ➔ Transportation ➔ Invoicing"
        actions={
          <span
            style={{
              fontSize: '0.6875rem',
              fontWeight: 700,
              color: '#0284C7',
              background: '#F0F9FF',
              padding: '2px 8px',
              borderRadius: '999px',
            }}
          >
            {totalPhaseOrders} Active Orders
          </span>
        }
        noPadding
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            flexWrap: 'wrap',
            gap: 16,
          }}
        >
          {/* Donut SVG Visual for Lifecycle */}
          <div style={{ position: 'relative', width: 170, height: 170, flexShrink: 0, margin: '0 auto' }}>
            <svg width="170" height="170" viewBox="0 0 170 170" style={{ transform: 'rotate(-90deg)' }}>
              {/* Background circle track */}
              <circle
                cx="85"
                cy="85"
                r={radius}
                fill="transparent"
                stroke="#F1F5F9"
                strokeWidth="24"
              />
              {/* Phase Slices */}
              {phaseDistribution.map((ph, index) => {
                const strokeDasharray = `${(ph.percentage / 100) * circumference} ${circumference}`;
                const strokeDashoffset = -((accumulatedPhasePercent / 100) * circumference);
                accumulatedPhasePercent += ph.percentage;
                const isHovered = hoveredPhaseIndex === index;

                return (
                  <circle
                    key={ph.phase}
                    cx="85"
                    cy="85"
                    r={radius}
                    fill="transparent"
                    stroke={ph.color}
                    strokeWidth={isHovered ? 28 : 24}
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    style={{
                      transition: 'all 0.25s ease',
                      cursor: 'pointer',
                      opacity: hoveredPhaseIndex !== null && !isHovered ? 0.45 : 1,
                    }}
                    onMouseEnter={() => setHoveredPhaseIndex(index)}
                    onMouseLeave={() => setHoveredPhaseIndex(null)}
                  />
                );
              })}
            </svg>

            {/* Donut Center Display */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'none',
              }}
            >
              <span style={{ fontSize: '0.625rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>
                {hoveredPhaseIndex !== null ? 'Phase Share' : 'Workflow'}
              </span>
              <strong style={{ fontSize: '1.05rem', color: '#0F172A', fontWeight: 800 }}>
                {hoveredPhaseIndex !== null
                  ? `${phaseDistribution[hoveredPhaseIndex].percentage}%`
                  : `${totalPhaseOrders} Orders`}
              </strong>
              <span style={{ fontSize: '0.625rem', color: '#0284C7', fontWeight: 600 }}>
                {hoveredPhaseIndex !== null
                  ? `${phaseDistribution[hoveredPhaseIndex].count} Orders`
                  : 'Active Pipeline'}
              </span>
            </div>
          </div>

          {/* Phase Legend */}
          <div style={{ flex: '1 1 180px', display: 'flex', flexDirection: 'column', gap: 7 }}>
            {phaseDistribution.map((ph, i) => {
              const isHovered = hoveredPhaseIndex === i;
              const IconComp = ph.icon;
              return (
                <div
                  key={ph.phase}
                  onMouseEnter={() => setHoveredPhaseIndex(i)}
                  onMouseLeave={() => setHoveredPhaseIndex(null)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    background: isHovered ? '#F8FAFC' : 'transparent',
                    cursor: 'pointer',
                    transition: 'background 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: 4,
                        background: `${ph.color}15`,
                        color: ph.color,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <IconComp size={12} />
                    </span>
                    <div>
                      <div
                        style={{
                          fontSize: '0.71875rem',
                          fontWeight: 600,
                          color: isHovered ? ph.color : '#1E293B',
                        }}
                      >
                        {ph.phase.split('(')[0]}
                      </div>
                      <div style={{ fontSize: '0.625rem', color: '#64748B' }}>
                        {ph.sub} • {ph.count} Orders
                      </div>
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: '0.6875rem',
                      fontWeight: 700,
                      color: ph.color,
                      background: `${ph.color}15`,
                      padding: '1px 6px',
                      borderRadius: '4px',
                    }}
                  >
                    {ph.percentage}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </Card>
    </div>
  );
}

export default DashboardCharts;
