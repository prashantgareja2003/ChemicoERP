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
  Droplets,
  Layers,
  Award,
  Globe2,
} from 'lucide-react';
import { useErp } from '../../hooks/useErp';
import { ROLE_PERMISSIONS } from '../../services/rolePermissions';
import { INITIAL_USERS } from '../../services/erpStore';
import logoImg from '../../assets/logo.png';
import heroPlantImg from '../../assets/chemical-plant-hero.jpg';
import smokePlantImg from '../../assets/industrial_plant_smoke.jpg';

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
    email: query.includes('@') ? query : `${query}@sdfoilchems.com`,
    role: 'HOD',
    dept: 'Operations & Management',
  };
}

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useErp();

  // Inputs accept ANY username and ANY password per client requirement
  const [username, setUsername] = useState('rajesh.sharma@sdfoilchems.com');
  const [password, setPassword] = useState('sdf@2026');
  const [showPassword, setShowPassword] = useState(false);
  const [authMode, setAuthMode] = useState('password'); // 'password' or 'otp'
  const [otpCode, setOtpCode] = useState('449120');
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (!username.trim()) return;

    setIsLoading(true);

    const resolvedUser = resolveUserFromInput(username);

    setTimeout(() => {
      login({
        id: resolvedUser.id,
        name: resolvedUser.name,
        email: resolvedUser.email,
        role: resolvedUser.role,
        dept: resolvedUser.dept,
        plant: 'Dahej Oleo Complex #1',
      });
      setIsLoading(false);
      navigate('/', { replace: true });
    }, 450);
  };

  const resolvedUser = resolveUserFromInput(username);
  const activeRoleMeta = ROLE_PERMISSIONS[resolvedUser.role] || ROLE_PERMISSIONS.HOD;

  return (
    <div className="sdf-fluid-login-wrapper">
      {/* Realistic Industrial Chemical Plant Smoke & Steam Animation Background */}
      <div className="sdf-fluid-bg">
        {/* Real Industrial Chemical Complex Backdrop */}
        <div
          className="sdf-smoke-plant-backdrop"
          style={{ backgroundImage: `url(${smokePlantImg})` }}
        />

        {/* Dynamic Billowing Smoke & Steam Plumes (Matching User Reference Image) */}
        <div className="sdf-steam-smoke-system">
          {/* Main Chimney Steam Cloud Plumes */}
          <div className="steam-cloud cloud-1" />
          <div className="steam-cloud cloud-2" />
          <div className="steam-cloud cloud-3" />
          <div className="steam-cloud cloud-4" />
          <div className="steam-cloud cloud-5" />
          <div className="steam-cloud cloud-6" />

          {/* Micro Steam Puffs drifting across distillation columns */}
          <div className="steam-puff puff-1" />
          <div className="steam-puff puff-2" />
          <div className="steam-puff puff-3" />
          <div className="steam-puff puff-4" />
        </div>

        {/* Soft Industrial Overlay without grid lines */}
        <div className="sdf-smoke-clean-overlay" />
      </div>

      {/* Main Glassmorphic Enterprise Container matching user reference */}
      <div className="sdf-login-card-container">
        
        {/* LEFT COLUMN: Clean, Modern, Elegant Login Form */}
        <div className="sdf-login-form-column">
          <div className="sdf-login-form-inner">
            
            {/* Top Brand Block */}
            <div className="sdf-login-brand-header">
              <div className="sdf-brand-badge-pill">
                <img src={logoImg} alt="SDF Logo" className="sdf-brand-badge-logo" />
                <div className="sdf-brand-badge-text">
                  <span className="sdf-brand-badge-company">SDF OILCHEMS</span>
                  <span className="sdf-brand-badge-tagline">Trusted Oleochemical Partner</span>
                </div>
              </div>

              <div className="sdf-login-suite-title">
                <span className="sdf-suite-prefix">SOL</span>
                <span className="sdf-suite-name">Enterprise</span>
              </div>
              <p className="sdf-suite-caption">Industrial Oleochemicals & Refining ERP Gateway</p>
            </div>

            {/* Form */}
            <form onSubmit={handleLoginSubmit} className="sdf-auth-form">
              {/* Username / Email field */}
              <div className="sdf-form-group">
                <label className="sdf-input-label">Mobile / Registered Email</label>
                <div className="sdf-input-box">
                  <Mail size={16} className="sdf-input-icon" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your registered mobile or email"
                    className="sdf-text-input"
                  />
                </div>
              </div>

              {/* Password or OTP field based on active mode */}
              {authMode === 'password' ? (
                <div className="sdf-form-group">
                  <div className="sdf-label-row">
                    <label className="sdf-input-label">Password</label>
                    <button
                      type="button"
                      onClick={() => alert('Static Open Access: Any password is accepted!')}
                      className="sdf-forgot-link"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="sdf-input-box">
                    <Lock size={16} className="sdf-input-icon" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password (any password accepted)"
                      className="sdf-text-input"
                    />
                    <button
                      type="button"
                      className="sdf-eye-btn"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="sdf-form-group">
                  <div className="sdf-label-row">
                    <label className="sdf-input-label">6-Digit SMS / OTP</label>
                    <span className="sdf-otp-sent-hint">OTP sent to registered mobile</span>
                  </div>
                  <div className="sdf-input-box">
                    <ShieldCheck size={16} className="sdf-input-icon" />
                    <input
                      type="text"
                      maxLength={6}
                      required
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      placeholder="Enter 6-digit OTP code"
                      className="sdf-text-input"
                    />
                  </div>
                </div>
              )}

              {/* Remember Session */}
              <div className="sdf-session-row">
                <label className="sdf-checkbox-label">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="sdf-checkbox"
                  />
                  <span>Remember my session</span>
                </label>
              </div>

              {/* Primary Action Button matching reference */}
              <button
                type="submit"
                disabled={isLoading}
                className="sdf-submit-primary-btn"
              >
                {isLoading ? (
                  <span className="sdf-btn-loading">
                    <span className="sdf-spinner" />
                    <span>Verifying Access...</span>
                  </span>
                ) : (
                  <>
                    <span>Sign in with {authMode === 'password' ? 'password' : 'OTP'}</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>

              {/* Divider 'or' */}
              <div className="sdf-divider-wrap">
                <div className="sdf-divider-line" />
                <span className="sdf-divider-text">or</span>
                <div className="sdf-divider-line" />
              </div>

              {/* Secondary Alternate Mode Button matching reference */}
              <button
                type="button"
                onClick={() => setAuthMode(authMode === 'password' ? 'otp' : 'password')}
                className="sdf-alternate-auth-btn"
              >
                Sign in with {authMode === 'password' ? 'OTP' : 'password'}
              </button>
            </form>

            {/* Bottom Powered By Footer matching reference screenshot */}
            <div className="sdf-login-bottom-credits">
              <span>Powered by <strong>SDF Digital Systems • Enterprise Core</strong></span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Fluid Chemicals Industry Hero Visual & Capabilities Showcase */}
        <div className="sdf-login-hero-column">
          {/* Background Industrial Image with fluid gradient overlay */}
          <div
            className="sdf-hero-bg-image"
            style={{ backgroundImage: `url(${heroPlantImg})` }}
          />
          <div className="sdf-hero-fluid-overlay" />
          <div className="sdf-hero-glow-particles" />

          {/* Foreground Visual Content */}
          <div className="sdf-hero-content">
            {/* Top Slogan matching reference style */}
            <div className="sdf-hero-header-block">
              <h1 className="sdf-hero-headline">
                END-TO-END OLEOCHEMICALS
                <span className="sdf-hero-headline-accent">ONE TRUSTED PARTNER</span>
              </h1>
              <p className="sdf-hero-subtext">
                Advanced Glycerin Refining. Pure Fatty Acids. Smart Tanker Logistics.
                Real-Time Batch Traceability.
              </p>
            </div>

            {/* 4 Feature Icons Row matching reference screenshot layout */}
            <div className="sdf-hero-features-row">
              <div className="sdf-hero-feature-item">
                <div className="sdf-feature-icon-circle">
                  <Droplets size={17} />
                </div>
                <span className="sdf-feature-label">Refining Excellence</span>
              </div>

              <div className="sdf-hero-feature-item">
                <div className="sdf-feature-icon-circle">
                  <FlaskConical size={17} />
                </div>
                <span className="sdf-feature-label">IP/USP 99.7% Tested</span>
              </div>

              <div className="sdf-hero-feature-item">
                <div className="sdf-feature-icon-circle">
                  <Layers size={17} />
                </div>
                <span className="sdf-feature-label">Live Reactor IoT</span>
              </div>

              <div className="sdf-hero-feature-item">
                <div className="sdf-feature-icon-circle">
                  <Truck size={17} />
                </div>
                <span className="sdf-feature-label">Tanker Dispatch</span>
              </div>
            </div>

            {/* Active Role Permissions Card */}
            <div className="sdf-hero-role-preview-card">
              <div className="sdf-preview-card-header">
                <span className="sdf-preview-pulse-dot" />
                <span className="sdf-preview-role-name">
                  Profile Clearance: {resolvedUser.role} — {activeRoleMeta.label}
                </span>
                <span className="sdf-preview-access-pill">Full Clearance</span>
              </div>
              <p className="sdf-preview-description">{activeRoleMeta.description}</p>
            </div>

            {/* Bottom 4 Pillars matching reference screenshot */}
            <div className="sdf-hero-pillars-row">
              <div className="sdf-pillar-item">
                <Award size={14} className="sdf-pillar-icon" />
                <span>Empowering Global Buyers</span>
              </div>
              <div className="sdf-pillar-item">
                <CheckCircle2 size={14} className="sdf-pillar-icon" />
                <span>Zero Contamination</span>
              </div>
              <div className="sdf-pillar-item">
                <Globe2 size={14} className="sdf-pillar-icon" />
                <span>Global Export Chain</span>
              </div>
              <div className="sdf-pillar-item">
                <ShieldCheck size={14} className="sdf-pillar-icon" />
                <span>Audit-Ready ISO 9001</span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

export default LoginPage;
