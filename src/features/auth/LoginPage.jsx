import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Mail,
  FlaskConical,
  Truck,
  Factory,
  Radio,
  Award,
  Globe2,
  Network,
  UserCheck,
  Shield,
  KeyRound,
  ChevronDown,
  Sparkles,
  Check,
  Activity,
  Cpu,
  Layers,
  Building2,
  Sun,
  Moon,
} from 'lucide-react';
import { useErp } from '../../hooks/useErp';
import { PWAInstallButton } from '../../components/common/PWAInstallModal';
import { ROLE_PERMISSIONS } from '../../services/rolePermissions';
import { INITIAL_USERS } from '../../services/erpStore';
import logoImg from '../../assets/logo.png';
import heroPlantImg from '../../assets/chemical-plant-hero.jpg';

const FEATURE_METRICS = [
  {
    id: 'refining',
    title: 'Refining Excellence',
    icon: Factory,
    spec: '99.8% High-Yield Distillation',
    detail: 'Continuous 4-stage vacuum distillation with automated reflux control at Dahej Unit #2.',
    badge: 'COLUMNS R-101/R-104 ACTIVE',
  },
  {
    id: 'testing',
    title: 'IP/USP 99.7% Tested',
    icon: FlaskConical,
    spec: 'Pharma & Food Grade Assured',
    detail: 'Spectrophotometric & GC purity assay certified. Heavy metals <5ppm, Chlorides <10ppm.',
    badge: 'QC MONOGRAPH PASSED',
  },
  {
    id: 'iot',
    title: 'Live Reactor IoT',
    icon: Radio,
    spec: '14 IoT Sensor Nodes Online',
    detail: 'Sub-second temperature, pressure & vacuum level telemetry fed into DCS supervisory matrix.',
    badge: 'DCS MATRIX ONLINE',
  },
  {
    id: 'dispatch',
    title: 'Tanker Dispatch',
    icon: Truck,
    spec: 'Smart Weighbridge Automated',
    detail: 'Automated gross tare weighment, GPS tanker sealing & instant RFID outward gate clearance.',
    badge: 'FLEET DISPATCH ACTIVE',
  },
];

function resolveUserFromInput(input) {
  const query = (input || '').trim().toLowerCase();
  if (!query) {
    return INITIAL_USERS[0]; // Default Rajesh Sharma (HOD)
  }

  // 1. Exact match with INITIAL_USERS
  const exact = INITIAL_USERS.find(
    (u) =>
      u.email.toLowerCase() === query ||
      u.email.toLowerCase().split('@')[0] === query ||
      u.name.toLowerCase() === query ||
      u.role.toLowerCase() === query
  );
  if (exact) return exact;

  // 2. Substring match with INITIAL_USERS
  const partial = INITIAL_USERS.find(
    (u) =>
      u.email.toLowerCase().includes(query) ||
      query.includes(u.email.toLowerCase().split('@')[0]) ||
      u.name.toLowerCase().includes(query) ||
      query.includes(u.name.toLowerCase()) ||
      u.role.toLowerCase().includes(query) ||
      query.includes(u.role.toLowerCase())
  );
  if (partial) return partial;

  // 3. Keyword / role-based matching
  if (query.includes('admin') || query.includes('alok') || query.includes('root') || query.includes('sys')) {
    const u = INITIAL_USERS.find((x) => x.role === 'Admin');
    return { ...u, email: input.includes('@') ? input : u.email };
  }
  if (query.includes('sale') || query.includes('vikram') || query.includes('commercial') || query.includes('order')) {
    const u = INITIAL_USERS.find((x) => x.role === 'Sales');
    return { ...u, email: input.includes('@') ? input : u.email };
  }
  if (query.includes('prod') || query.includes('suresh') || query.includes('plant') || query.includes('reactor') || query.includes('manufactur')) {
    const u = INITIAL_USERS.find((x) => x.role === 'Prod');
    return { ...u, email: input.includes('@') ? input : u.email };
  }
  if (query.includes('qc') || query.includes('qa') || query.includes('lab') || query.includes('swami') || query.includes('qualit')) {
    const u = INITIAL_USERS.find((x) => x.role === 'QC/QA');
    return { ...u, email: input.includes('@') ? input : u.email };
  }
  if (query.includes('logist') || query.includes('tanker') || query.includes('rahul') || query.includes('dispatch') || query.includes('fleet')) {
    const u = INITIAL_USERS.find((x) => x.role === 'Logistics');
    return { ...u, email: input.includes('@') ? input : u.email };
  }
  if (query.includes('finan') || query.includes('meera') || query.includes('account') || query.includes('gst') || query.includes('tax') || query.includes('invoice')) {
    const u = INITIAL_USERS.find((x) => x.role === 'Finance');
    return { ...u, email: input.includes('@') ? input : u.email };
  }
  if (query.includes('direct') || query.includes('manage') || query.includes('mehta') || query.includes('board') || query.includes('ceo')) {
    const u = INITIAL_USERS.find((x) => x.role === 'Management');
    return { ...u, email: input.includes('@') ? input : u.email };
  }
  if (query.includes('hod') || query.includes('rajesh') || query.includes('approv') || query.includes('head')) {
    const u = INITIAL_USERS.find((x) => x.role === 'HOD');
    return { ...u, email: input.includes('@') ? input : u.email };
  }

  // 4. Fallback for custom user credentials
  const cleanName = query.includes('@')
    ? query
        .split('@')[0]
        .split('.')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ')
    : query.charAt(0).toUpperCase() + query.slice(1);

  return {
    id: `USR-${Date.now().toString().slice(-4)}`,
    name: cleanName || 'Enterprise User',
    email: query.includes('@') ? query : `${query}@chemzora.com`,
    role: 'HOD',
    dept: 'Operations & Management',
  };
}

export function LoginPage() {
  const navigate = useNavigate();
  const { login, theme, toggleTheme } = useErp();

  const [username, setUsername] = useState('rajesh.s@chemzora.com');
  const [password, setPassword] = useState('chemzora@2026');
  const [showPassword, setShowPassword] = useState(false);
  const [authMode, setAuthMode] = useState('password'); // 'password' or 'otp'
  const [otpDigits, setOtpDigits] = useState(['4', '4', '9', '1', '2', '0']);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [activeFeatureIndex, setActiveFeatureIndex] = useState(0);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [mobileTab, setMobileTab] = useState('auth'); // 'auth' or 'capabilities' on mobile/tablet

  const resolvedUser = resolveUserFromInput(username);
  const activeRoleMeta = ROLE_PERMISSIONS[resolvedUser.role] || ROLE_PERMISSIONS.HOD;

  const handleSelectRoleUser = (user) => {
    setUsername(user.email);
    setPassword('chemzora@2026');
    setShowRoleDropdown(false);
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (!username.trim()) return;

    setIsLoading(true);

    const user = resolveUserFromInput(username);

    setTimeout(() => {
      login({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        dept: user.dept,
        plant: 'Dahej Oleo Complex #1',
      });
      setIsLoading(false);
      navigate('/', { replace: true });
    }, 450);
  };

  const handleOtpDigitChange = (index, val) => {
    const clean = val.slice(-1);
    const updated = [...otpDigits];
    updated[index] = clean;
    setOtpDigits(updated);
    if (clean && index < 5) {
      const nextInput = document.getElementById(`cz-otp-input-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      const prevInput = document.getElementById(`cz-otp-input-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const activeFeature = FEATURE_METRICS[activeFeatureIndex] || FEATURE_METRICS[0];

  return (
    <div className="cz-portal-viewport">
      {/* Background Ambient Glow & Decorative Grid */}
      <div className="cz-portal-ambient-layer" aria-hidden="true">
        <div className="cz-ambient-glow cz-glow-top-left" />
        <div className="cz-ambient-glow cz-glow-bottom-right" />
        <div className="cz-ambient-mesh-grid" />
      </div>

      {/* Modern High-End Top Navigation Header */}
      <header className="cz-portal-header">
        <div className="cz-header-container">
          <div className="cz-header-brand-block">
            {/* Jewel Mandala Logo */}
            <div className="cz-brand-emblem-frame">
              <img src={logoImg} alt="Chemzora Logo" className="cz-brand-emblem-img" />
            </div>

            <div className="cz-brand-meta">
              <div className="cz-brand-primary-name">
                <span className="cz-brand-title-bold">CHEMZORA OILCHEMS</span>
                <span className="cz-brand-subscript">Trusted Oleochemical Partner</span>
              </div>
              <div className="cz-brand-sanskrit">|| रसायनं परिवर्तनाय ||</div>
            </div>

            <div className="cz-brand-vertical-divider" aria-hidden="true" />

            <div className="cz-suite-indicator">
              <span className="cz-suite-accent">Chemzora</span>
              <span className="cz-suite-core">Enterprise</span>
              <span className="cz-suite-version-tag">v2.6 Core</span>
            </div>
          </div>

          <div className="cz-header-right-meta">
            <PWAInstallButton variant="login" />

            <button
              type="button"
              onClick={toggleTheme}
              className="cz-theme-toggle-pill"
              title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
              aria-label="Toggle Dark / Light Theme"
            >
              {theme === 'dark' ? <Sun size={15} color="#FBBF24" /> : <Moon size={15} color="#2563EB" />}
              <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
            </button>

            <div className="cz-security-indicator">
              <ShieldCheck size={16} className="cz-sec-icon" />
              <span>Secure Enterprise Access</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Two-Column Centered Application Container */}
      <main className="cz-portal-main">
        {/* Mobile / Tablet Segmented Mode Switcher (Visible only on screens < 1024px) */}
        <div className="cz-mobile-mode-switcher">
          <button
            type="button"
            className={`cz-mode-switch-btn ${mobileTab === 'auth' ? 'active' : ''}`}
            onClick={() => setMobileTab('auth')}
            aria-label="Enterprise Sign In Form"
          >
            <Lock size={14} />
            <span>Enterprise Sign In</span>
          </button>
          <button
            type="button"
            className={`cz-mode-switch-btn ${mobileTab === 'capabilities' ? 'active' : ''}`}
            onClick={() => setMobileTab('capabilities')}
            aria-label="Dahej Plant Capabilities"
          >
            <Factory size={14} />
            <span>Plant Tech & Specs</span>
          </button>
        </div>

        <div className="cz-portal-content-wrapper">
          
          {/* ========================================================= */}
          {/* LEFT COLUMN: Ultra-Clean Executive Login Workspace Card */}
          {/* ========================================================= */}
          <div className={`cz-auth-card ${mobileTab === 'auth' ? 'cz-mobile-visible' : ''}`}>
            
            {/* Card Header - Neat & Clean */}
            <div className="cz-auth-card-top">
              <h1 className="cz-auth-heading">Welcome back</h1>
              <p className="cz-auth-tagline">
                Sign in to access your enterprise workspace.
              </p>
            </div>

            {/* Authentication Form */}
            <form onSubmit={handleLoginSubmit} className="cz-login-form">
              {/* Username / Mobile / Email Field */}
              <div className="cz-input-group">
                <label className="cz-label-row">
                  <span className="cz-label-text">Mobile / Registered Email</span>
                </label>
                <div className="cz-input-shell">
                  <Mail size={17} className="cz-input-leading-icon" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="rajesh.s@chemzora.com"
                    className="cz-text-field"
                  />
                </div>
              </div>

              {/* Password or OTP Mode */}
              {authMode === 'password' ? (
                <div className="cz-input-group">
                  <div className="cz-label-row">
                    <span className="cz-label-text">Enterprise Password</span>
                    <button
                      type="button"
                      onClick={() => alert('Static Access: Any password is accepted for testing!')}
                      className="cz-link-forgot"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="cz-input-shell">
                    <Lock size={17} className="cz-input-leading-icon" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="cz-text-field cz-field-pr"
                    />
                    <button
                      type="button"
                      className="cz-eye-toggle-btn"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="cz-input-group">
                  <div className="cz-label-row">
                    <span className="cz-label-text">6-Digit Verification OTP</span>
                    <span className="cz-otp-sms-badge">Code sent to mobile</span>
                  </div>
                  <div className="cz-otp-digits-grid">
                    {otpDigits.map((d, i) => (
                      <input
                        key={i}
                        id={`cz-otp-input-${i}`}
                        type="text"
                        maxLength={1}
                        value={d}
                        onChange={(e) => handleOtpDigitChange(i, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                        className="cz-otp-box"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Session Retention Row */}
              <div className="cz-remember-bar">
                <label className="cz-checkbox-container">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="cz-custom-checkbox"
                  />
                  <span className="cz-checkbox-label-text">Remember my session for 30 days</span>
                </label>
              </div>

              {/* Primary Action Button (Rich Chemzora Forest/Emerald Gradient) */}
              <button
                type="submit"
                disabled={isLoading}
                className="cz-action-btn-primary"
              >
                {isLoading ? (
                  <span className="cz-btn-loader">
                    <span className="cz-btn-spinner" />
                    <span>Verifying Credentials...</span>
                  </span>
                ) : (
                  <>
                    <span>Sign in with {authMode === 'password' ? 'password' : 'OTP'}</span>
                    <ArrowRight size={17} className="cz-btn-arrow-icon" />
                  </>
                )}
              </button>

              {/* Divider 'OR' */}
              <div className="cz-auth-divider">
                <span className="cz-divider-bar" />
                <span className="cz-divider-tag">OR</span>
                <span className="cz-divider-bar" />
              </div>

              {/* Secondary Alternate Mode Button (White with Forest Green border) */}
              <button
                type="button"
                onClick={() => setAuthMode(authMode === 'password' ? 'otp' : 'password')}
                className="cz-action-btn-secondary"
              >
                {authMode === 'password' ? (
                  <>
                    <Shield size={16} className="cz-sec-btn-icon" />
                    <span>Sign in with OTP</span>
                  </>
                ) : (
                  <>
                    <Lock size={16} className="cz-sec-btn-icon" />
                    <span>Sign in with password</span>
                  </>
                )}
              </button>

              {/* Minimal Demo Profile Fast-Switch Tags */}
              <div className="cz-test-roles-bar">
                <span className="cz-test-roles-label">Test Profiles:</span>
                <div className="cz-test-roles-chips">
                  {INITIAL_USERS.map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => {
                        setUsername(u.email);
                        setPassword('chemzora@2026');
                      }}
                      className={`cz-test-role-btn ${u.email === username ? 'active' : ''}`}
                      title={`${u.name} — ${u.dept}`}
                    >
                      {u.role}
                    </button>
                  ))}
                </div>
              </div>
            </form>

            {/* Bottom Enterprise Footnote */}
            <div className="cz-card-bottom-footnote">
              <span>Powered by <strong>Chemzora Digital Systems</strong> • Enterprise Core</span>
            </div>
          </div>

          {/* ========================================================= */}
          {/* RIGHT COLUMN: Cinematic Industrial Hero & Capabilities   */}
          {/* ========================================================= */}
          <div className={`cz-hero-panel ${mobileTab === 'capabilities' ? 'cz-mobile-visible' : ''}`}>
            {/* Background Chemical Plant Hero Image Layer */}
            <div
              className="cz-hero-backdrop-img"
              style={{ backgroundImage: `url(${heroPlantImg})` }}
            />
            
            {/* Deep Emerald Industrial Gradient Overlay */}
            <div className="cz-hero-gradient-overlay" />
            
            {/* Ambient Lighting Rays */}
            <div className="cz-hero-ambient-lighting" />

            {/* Hero Foreground Content */}
            <div className="cz-hero-foreground">
              
              {/* Top Industrial Headline Block */}
              <div className="cz-hero-top-block">
                <div className="cz-industrial-tag-pill">
                  <Sparkles size={12} className="cz-tag-sparkle" />
                  <span>BUILT FOR INDUSTRIAL EXCELLENCE</span>
                </div>

                <h2 className="cz-industrial-headline">
                  END-TO-END OLEOCHEMICALS
                  <span className="cz-headline-highlight">ONE TRUSTED PARTNER</span>
                </h2>

                <p className="cz-industrial-subtext">
                  Advanced Glycerin Refining. Pure Fatty Acids. Smart Tanker Logistics. Real-Time Batch Traceability.
                </p>
              </div>

              {/* 4 Interactive Feature Circles with Live Telemetry Specs */}
              <div className="cz-features-interactive-deck">
                <div className="cz-feature-circles-grid">
                  {FEATURE_METRICS.map((item, idx) => {
                    const IconComponent = item.icon;
                    const isActive = activeFeatureIndex === idx;
                    return (
                      <div
                        key={item.id}
                        onClick={() => setActiveFeatureIndex(idx)}
                        onMouseEnter={() => setActiveFeatureIndex(idx)}
                        className={`cz-feature-interactive-card ${isActive ? 'active' : ''}`}
                      >
                        <div className="cz-circle-button-frame">
                          <IconComponent size={21} className="cz-circle-icon" />
                          {isActive && <span className="cz-circle-active-ring" />}
                        </div>
                        <span className="cz-circle-card-label">{item.title}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Live Telemetry Drawer Popover for Active Feature */}
                <div className="cz-feature-live-pill">
                  <div className="cz-live-pill-header">
                    <span className="cz-live-pill-badge">{activeFeature.badge}</span>
                    <span className="cz-live-pill-spec">{activeFeature.spec}</span>
                  </div>
                  <p className="cz-live-pill-detail">{activeFeature.detail}</p>
                </div>
              </div>

              {/* Dynamic Profile Clearance Card (Linked to the Active User in Form) */}
              <div className="cz-clearance-glass-card">
                <div className="cz-clearance-avatar-box">
                  <UserCheck size={22} className="cz-clearance-user-icon" />
                  <span className="cz-clearance-pulse-indicator" />
                </div>

                <div className="cz-clearance-info-col">
                  <div className="cz-clearance-row-top">
                    <span className="cz-clearance-role-heading">
                      Profile Clearance: <strong>{resolvedUser.role}</strong> — {activeRoleMeta.label}
                    </span>
                    <span className="cz-clearance-badge-pill">
                      FULL CLEARANCE
                    </span>
                  </div>
                  <p className="cz-clearance-description">
                    {activeRoleMeta.description}
                  </p>
                </div>
              </div>

              {/* Bottom 4 Certified Trust Pillars */}
              <div className="cz-trust-pillars-grid">
                <div className="cz-trust-pillar-item">
                  <Globe2 size={17} className="cz-trust-icon" />
                  <span className="cz-trust-label">Empowering Global Buyers</span>
                </div>

                <div className="cz-trust-pillar-item">
                  <ShieldCheck size={17} className="cz-trust-icon" />
                  <span className="cz-trust-label">Zero Contamination</span>
                </div>

                <div className="cz-trust-pillar-item">
                  <Network size={17} className="cz-trust-icon" />
                  <span className="cz-trust-label">Global Export Chain</span>
                </div>

                <div className="cz-trust-pillar-item">
                  <Award size={17} className="cz-trust-icon" />
                  <span className="cz-trust-label">Audit-Ready ISO 9001</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

export default LoginPage;
