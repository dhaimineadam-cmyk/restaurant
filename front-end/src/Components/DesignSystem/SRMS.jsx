import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { ChefHat, Home, LogOut, Menu as MenuIcon, PanelLeftClose, PanelLeftOpen, User } from 'lucide-react';
import { statusTone } from '../../theme/srmsTheme';

export const Badge = ({ children, tone = 'neutral', className = '' }) => (
  <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-bold ${statusTone[tone] || statusTone.neutral} ${className}`}>
    {children}
  </span>
);

export const LoadingScreen = ({ label = 'Chargement...' }) => (
  <div className="srms-page flex min-h-screen items-center justify-center">
    <div className="text-center">
      <div className="mx-auto h-12 w-12 rounded-full border-4 border-srms-gold border-t-srms-bordeaux animate-spin" />
      <p className="mt-4 text-sm font-bold text-srms-bordeaux">{label}</p>
    </div>
  </div>
);

export const StatCard = ({ icon: Icon, label, value, detail, tone = 'gold' }) => {
  const tones = {
    gold: 'bg-amber-100 text-amber-800',
    red: 'bg-red-100 text-red-800',
    green: 'bg-emerald-100 text-emerald-800',
    blue: 'bg-sky-100 text-sky-800',
    dark: 'bg-stone-900 text-srms-cream',
  };

  return (
    <div className="srms-card p-5 transition duration-200 hover:-translate-y-1 hover:shadow-xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-stone-500">{label}</p>
          <p className="mt-2 text-3xl font-extrabold text-srms-ink">{value}</p>
          {detail && <p className="mt-1 text-sm text-stone-500">{detail}</p>}
        </div>
        {Icon && (
          <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${tones[tone] || tones.gold}`}>
            <Icon size={22} />
          </div>
        )}
      </div>
    </div>
  );
};

export const ActionTile = ({ icon: Icon, title, description, onClick, meta, tone = 'gold' }) => {
  const toneClass = {
    gold: 'bg-amber-100 text-amber-800',
    red: 'bg-red-100 text-red-800',
    green: 'bg-emerald-100 text-emerald-800',
    blue: 'bg-sky-100 text-sky-800',
    sage: 'bg-lime-100 text-lime-800',
    dark: 'bg-stone-900 text-srms-cream',
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className="srms-card group min-h-[168px] w-full p-5 text-left transition duration-200 hover:-translate-y-1 hover:border-srms-gold hover:shadow-xl"
    >
      <div className="flex h-full flex-col justify-between gap-5">
        <div className="flex items-start justify-between gap-4">
          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${toneClass[tone] || toneClass.gold}`}>
            {Icon && <Icon size={22} />}
          </div>
          {meta && <Badge tone="warning">{meta}</Badge>}
        </div>
        <div>
          <h3 className="text-lg font-extrabold text-srms-ink">{title}</h3>
          <p className="mt-2 text-sm leading-6 text-stone-600">{description}</p>
        </div>
      </div>
    </button>
  );
};

export const SectionHeader = ({ eyebrow, title, description, action }) => (
  <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
    <div>
      {eyebrow && <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-srms-bordeaux">{eyebrow}</p>}
      <h2 className="srms-display mt-1 text-3xl font-extrabold text-srms-ink md:text-4xl">{title}</h2>
      {description && <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">{description}</p>}
    </div>
    {action}
  </div>
);

export const AvatarMenu = ({ user, profilePath, onLogout, extraActions = [] }) => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const name = user?.name || user?.email || 'Utilisateur';

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border-2 border-srms-gold bg-srms-bordeaux text-sm font-extrabold text-srms-cream shadow-lg"
        title="Compte"
      >
        {name.slice(0, 2).toUpperCase()}
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-3 w-64 rounded-lg border border-stone-200 bg-white p-3 shadow-2xl">
          <div className="border-b border-stone-100 pb-3">
            <p className="font-extrabold text-srms-ink">{name}</p>
            <p className="truncate text-xs text-stone-500">{user?.email}</p>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            <button type="button" onClick={() => navigate('/')} className="rounded-lg p-3 text-stone-600 hover:bg-stone-100" title="Accueil">
              <Home className="mx-auto" size={18} />
            </button>
            <button type="button" onClick={() => navigate(profilePath)} className="rounded-lg p-3 text-stone-600 hover:bg-stone-100" title="Profil">
              <User className="mx-auto" size={18} />
            </button>
            {extraActions}
            <button type="button" onClick={onLogout} className="rounded-lg p-3 text-red-700 hover:bg-red-50" title="Deconnexion">
              <LogOut className="mx-auto" size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export const RolePage = ({ user, title, subtitle, badge, profilePath, onLogout, children, aside }) => (
  <div className="srms-page min-h-screen">
    <header className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-srms-bordeaux text-srms-cream">
          <ChefHat size={22} />
        </div>
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-srms-bordeaux">{badge}</p>
          <h1 className="srms-display text-2xl font-extrabold text-srms-ink">{title}</h1>
        </div>
      </div>
      <AvatarMenu user={user} profilePath={profilePath} onLogout={onLogout} />
    </header>
    <main className="mx-auto grid max-w-7xl gap-6 px-4 pb-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:px-8">
      <section>
        <div className="mb-7">
          <p className="max-w-3xl text-base leading-7 text-stone-600">{subtitle}</p>
        </div>
        {children}
      </section>
      {aside}
    </main>
  </div>
);

export const AdminShell = ({ navItems, children, title = 'SRMS Admin', subtitle }) => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="srms-page min-h-screen lg:grid lg:grid-cols-[auto_1fr]">
      <aside className={`sticky top-0 z-30 hidden h-screen border-r border-stone-200 bg-srms-charcoal text-srms-cream lg:flex lg:flex-col ${collapsed ? 'w-20' : 'w-72'} transition-all duration-200`}>
        <div className="flex items-center justify-between gap-3 p-4">
          {!collapsed && (
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-srms-gold">Smart Restaurant</p>
              <h1 className="srms-display text-2xl font-extrabold">Command Center</h1>
            </div>
          )}
          <button type="button" onClick={() => setCollapsed((value) => !value)} className="rounded-lg p-2 text-srms-cream hover:bg-white/10" title="Reduire">
            {collapsed ? <PanelLeftOpen size={19} /> : <PanelLeftClose size={19} />}
          </button>
        </div>
        <nav className="mt-4 flex-1 space-y-1 px-3">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-bold no-underline transition ${isActive ? 'bg-srms-gold text-srms-ink' : 'text-srms-cream/80 hover:bg-white/10 hover:text-white'}`}
            >
              {Icon && <Icon size={19} />}
              {!collapsed && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>
        <button type="button" onClick={handleLogout} className="m-3 flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-bold text-red-100 hover:bg-red-500/20" title="Deconnexion">
          <LogOut size={19} />
          {!collapsed && <span>Deconnexion</span>}
        </button>
      </aside>

      <div>
        <header className="flex items-center justify-between border-b border-stone-200 bg-srms-ivory/84 px-4 py-4 backdrop-blur sm:px-6 lg:px-8">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-srms-bordeaux">Administration</p>
            <h2 className="srms-display text-2xl font-extrabold text-srms-ink">{title}</h2>
            {subtitle && <p className="text-sm text-stone-500">{subtitle}</p>}
          </div>
          <button type="button" className="rounded-lg border border-stone-200 p-2 text-srms-ink lg:hidden" title="Menu">
            <MenuIcon size={21} />
          </button>
        </header>
        <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
};
