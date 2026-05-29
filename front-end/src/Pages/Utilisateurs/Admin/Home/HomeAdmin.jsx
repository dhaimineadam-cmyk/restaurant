import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  BarChart3,
  BookOpen,
  CalendarDays,
  CookingPot,
  LayoutDashboard,
  MessageSquareWarning,
  Package,
  Receipt,
  Star,
  Store,
  Table2,
  Truck,
  Users,
  WalletCards,
} from 'lucide-react';
import api from '../../../../Api/api';
import { ActionTile, AdminShell, Badge, StatCard } from '../../../../Components/DesignSystem/SRMS';

const navItems = [
  { to: '/user/admin', label: 'Accueil', icon: LayoutDashboard },
  { to: '/user/admin/dashboard', label: 'Dashboard', icon: BarChart3 },
  { to: '/user/admin/orders', label: 'Commandes', icon: Receipt },
  { to: '/user/admin/tables', label: 'Tables', icon: Table2 },
  { to: '/user/admin/categories', label: 'Categories', icon: BookOpen },
  { to: '/user/admin/menus', label: 'Menus', icon: CookingPot },
  { to: '/user/admin/stock', label: 'Stocks', icon: Package },
  { to: '/user/admin/livreurs', label: 'Livreurs', icon: Truck },
  { to: '/user/admin/servants', label: 'Servants', icon: Users },
];

export default function HomeAdmin() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ reservation: 0, orders: 0, livreur: 0, livrison: 0 });
  const [showSuccess, setShowSuccess] = useState(Boolean(location.state?.successMessage));

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (!token || !storedUser) {
      navigate('/login');
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    if (parsedUser.role !== 'admin') {
      navigate(`/user/${parsedUser.role === 'livreur' ? 'livreur' : parsedUser.role === 'client' ? 'client' : 'servant'}`);
      return;
    }

    setUser(parsedUser);
  }, [navigate]);

  useEffect(() => {
    api.get('/nombrestatic')
      .then(({ data }) => setStats(data || {}))
      .catch((error) => console.error('Erreur lors de la recuperation des statistiques:', error));
  }, []);

  useEffect(() => {
    if (!showSuccess) return undefined;
    const timer = setTimeout(() => setShowSuccess(false), 3600);
    return () => clearTimeout(timer);
  }, [showSuccess]);

  const quickActions = useMemo(() => [
    { icon: BarChart3, title: 'Pilotage financier', description: 'Consultez chiffre d affaires, commandes et activite recente.', to: '/user/admin/dashboard', tone: 'red' },
    { icon: CookingPot, title: 'Carte et menus', description: 'Organisez categories, plats, disponibilite et images.', to: '/user/admin/menus', tone: 'gold' },
    { icon: Table2, title: 'Plan de salle', description: 'Suivez les tables et gardez le service lisible.', to: '/user/admin/tables', tone: 'sage' },
    { icon: Package, title: 'Stocks', description: 'Controlez fournisseurs, seuils et inventaires.', to: '/user/admin/stock', tone: 'blue' },
    { icon: Truck, title: 'Livraisons', description: 'Assignez les commandes et suivez les livreurs.', to: '/user/admin/livrisons', tone: 'green' },
    { icon: MessageSquareWarning, title: 'Relation client', description: 'Reclamations, feedbacks et avis a traiter.', to: '/user/admin/reclamations', tone: 'red' },
  ], []);

  return (
    <AdminShell navItems={navItems} title="Centre de controle" subtitle={`Bienvenue ${user?.name || 'administrateur'}, service en temps reel.`}>
      {showSuccess && (
        <div className="mb-5 flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800">
          <span>Connexion reussie{user?.name ? `, ${user.name}` : ''}</span>
          <button type="button" onClick={() => setShowSuccess(false)} className="text-emerald-900">Fermer</button>
        </div>
      )}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Truck} label="Livreurs actifs" value={stats.livreur || 0} detail="Disponibles pour livraison" tone="blue" />
        <StatCard icon={Receipt} label="Commandes en ligne" value={stats.orders || 0} detail="A traiter ou livrer" tone="green" />
        <StatCard icon={WalletCards} label="Livraisons effectuees" value={stats.livrison || 0} detail="Historique operationnel" tone="gold" />
        <StatCard icon={CalendarDays} label="Reservations" value={stats.reservation || 0} detail="Tables planifiees" tone="red" />
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-srms-bordeaux">Operations</p>
              <h2 className="srms-display text-3xl font-extrabold text-srms-ink">Actions rapides</h2>
            </div>
            <Badge tone="warning">Service premium</Badge>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {quickActions.map((action) => (
              <ActionTile
                key={action.title}
                icon={action.icon}
                title={action.title}
                description={action.description}
                tone={action.tone}
                onClick={() => navigate(action.to)}
              />
            ))}
          </div>
        </div>

        <aside className="space-y-4">
          <div className="srms-card p-5">
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-srms-bordeaux">Priorites</p>
            <h3 className="mt-2 text-xl font-extrabold text-srms-ink">Routine du shift</h3>
            <div className="mt-5 space-y-4">
              {[
                ['Verifier les tables reservees', '15 min avant ouverture'],
                ['Controler ruptures de stock', 'Avant le rush'],
                ['Affecter livreurs disponibles', 'Des nouvelle commande'],
                ['Lire les reclamations', 'Fin de service'],
              ].map(([title, detail]) => (
                <div key={title} className="flex gap-3 border-b border-stone-200 pb-4 last:border-b-0 last:pb-0">
                  <Star className="mt-1 text-srms-gold" size={17} />
                  <div>
                    <p className="font-bold text-srms-ink">{title}</p>
                    <p className="text-sm text-stone-500">{detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate('/user/admin/menus-gestion')}
            className="srms-card flex w-full items-center justify-between p-5 text-left transition hover:-translate-y-1 hover:border-srms-gold"
          >
            <div>
              <p className="text-sm font-extrabold text-srms-bordeaux">Multi-restaurant</p>
              <p className="mt-1 text-lg font-extrabold text-srms-ink">Gestion restaurants & menus</p>
            </div>
            <Store className="text-srms-gold" />
          </button>
        </aside>
      </section>
    </AdminShell>
  );
}
