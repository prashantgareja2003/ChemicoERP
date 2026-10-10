/**
 * Role-Based Access Control (RBAC) Matrix for SDF Oilchems Limited ERP
 * Defines authorized routes, module accessibility, and descriptive permissions per role.
 */

export const ROLE_PERMISSIONS = {
  Admin: {
    label: 'System Administrator',
    description: 'Unrestricted master access across all ERP departments, users, settings, and audits.',
    routes: ['/', '/production', '/qc', '/sales', '/dispatch', '/approvals', '/purchase', '/inventory', '/finance', '/masters', '/reports'],
    badgeColor: 'emerald',
  },
  HOD: {
    label: 'Head of Department / Approver',
    description: 'Executive clearance for quotations, purchase orders, production releases, and failed QC decisions.',
    routes: ['/', '/production', '/qc', '/sales', '/dispatch', '/approvals', '/purchase', '/inventory', '/finance', '/masters', '/reports'],
    badgeColor: 'indigo',
  },
  Prod: {
    label: 'Plant Manufacturing',
    description: 'Reactor batches, yield records, daily output log, live tank stocks, and QC dispatch requests.',
    routes: ['/', '/production', '/qc', '/inventory', '/approvals'],
    badgeColor: 'amber',
  },
  'QC/QA': {
    label: 'Quality Assurance & Laboratory',
    description: 'Batch monograph testing, CoA issuance, release clearances, and failed batch OCAP escalations.',
    routes: ['/', '/qc', '/production', '/approvals'],
    badgeColor: 'blue',
  },
  Logistics: {
    label: 'Supply Chain & Tanker Logistics',
    description: 'Road tanker fleets, inward raw material receipts, outward dispatches, and proof of deliveries (POD).',
    routes: ['/', '/dispatch', '/inventory', '/approvals'],
    badgeColor: 'cyan',
  },
  Sales: {
    label: 'Commercial & Export Sales',
    description: 'Customer quotations (SOL/Q/), sales orders (SOL/SO/), multi-part delivery planning, and customer master.',
    routes: ['/', '/sales', '/purchase', '/approvals', '/reports'],
    badgeColor: 'violet',
  },
  Finance: {
    label: 'Finance, Accounts & Taxation',
    description: 'Commercial GST tax invoices (SOL/EXP/), AR aging, 6-document banking uploads, and 95% settlement rules.',
    routes: ['/', '/finance', '/sales', '/purchase', '/reports', '/approvals'],
    badgeColor: 'rose',
  },
  Management: {
    label: 'Executive Leadership & Board',
    description: 'Plant yield deck, gross margins, pending approval alerts, and corporate performance dashboards.',
    routes: ['/', '/reports', '/approvals', '/sales', '/finance', '/production', '/qc', '/dispatch', '/inventory', '/purchase', '/masters'],
    badgeColor: 'slate',
  },
};

/**
 * Check if a role is authorized for a given pathname
 */
export function isRouteAllowedForRole(role, pathname) {
  if (!role) return false;
  const permissions = ROLE_PERMISSIONS[role];
  if (!permissions) return false;

  // Clean pathname
  const cleanPath = pathname === '' ? '/' : pathname;

  // Exact match or prefix match for subpaths
  return permissions.routes.some((allowed) => {
    if (allowed === '/') return cleanPath === '/';
    return cleanPath === allowed || cleanPath.startsWith(`${allowed}/`);
  });
}

/**
 * Get default landing route for role
 */
export function getDefaultRouteForRole(role) {
  const permissions = ROLE_PERMISSIONS[role];
  if (!permissions || !permissions.routes.length) return '/';
  return permissions.routes[0];
}
