import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, BookOpen, CalendarDays, ChefHat, CookingPot, Package, Receipt, Table2, Truck, Users, WalletCards } from 'lucide-react';
import api from '../../../../Api/api';
import { AdminShell, Badge, StatCard } from '../../../../Components/DesignSystem/SRMS';

const navItems = [
  { to: '/user/admin', label: 'Accueil', icon: BarChart3 },
  { to: '/user/admin/dashboard', label: 'Dashboard', icon: BarChart3 },
  { to: '/user/admin/orders', label: 'Commandes', icon: Receipt },
  { to: '/user/admin/tables', label: 'Tables', icon: Table2 },
  { to: '/user/admin/categories', label: 'Categories', icon: BookOpen },
  { to: '/user/admin/menus', label: 'Menus', icon: CookingPot },
  { to: '/user/admin/stock', label: 'Stocks', icon: Package },
  { to: '/user/admin/livreurs', label: 'Livreurs', icon: Truck },
  { to: '/user/admin/servants', label: 'Servants', icon: Users },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ totalUsers: 0, totalWorkers: 0, totalRevenue: 0, totalOrders: 0 });
  const [deliveryStats, setDeliveryStats] = useState({ reservation: 0, orders: 0, livreur: 0, livrison: 0 });
  const [payments, setPayments] = useState([]);
  const [servants, setServants] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [workersRes, servantsRes, salesRes, deliveryRes] = await Promise.allSettled([
        api.get('/total-workers'),
        api.get('/servants'),
        api.get('/sales'),
        api.get('/nombrestatic'),
      ]);

      const workers = workersRes.status === 'fulfilled' ? workersRes.value.data?.total_workers || 0 : 0;
      const servantList = servantsRes.status === 'fulfilled' && Array.isArray(servantsRes.value.data) ? servantsRes.value.data : [];
      const sales = salesRes.status === 'fulfilled' ? salesRes.value.data?.data || [] : [];
      const sortedSales = [...sales].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      const revenue = sortedSales.reduce((sum, sale) => sum + (parseFloat(sale.total_price) || 0), 0);

      setServants(servantList);
      setPayments(sortedSales);
      setDeliveryStats(deliveryRes.status === 'fulfilled' ? deliveryRes.value.data || {} : {});
      setStats({
        totalUsers: workers,
        totalWorkers: servantList.length,
        totalRevenue: revenue,
        totalOrders: sortedSales.length,
      });
    } catch (error) {
      console.error('Erreur lors du chargement des donnees:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (!token || !user) {
      navigate('/login');
      return;
    }
    if (user.role !== 'admin') {
      navigate(`/user/${user.role === 'livreur' ? 'livreur' : user.role === 'client' ? 'client' : 'servant'}`);
      return;
    }

    fetchAllData();
    const refreshInterval = setInterval(fetchAllData, 5 * 60 * 1000);
    return () => clearInterval(refreshInterval);
  }, [navigate]);

  const bars = useMemo(() => {
    const max = Math.max(...payments.slice(0, 7).map((sale) => parseFloat(sale.total_price) || 0), 1);
    return payments.slice(0, 7).map((sale) => ({
      id: sale.id,
      value: parseFloat(sale.total_price) || 0,
      height: `${Math.max(12, ((parseFloat(sale.total_price) || 0) / max) * 100)}%`,
    }));
  }, [payments]);

  return (
    <AdminShell navItems={navItems} title="Dashboard analytique" subtitle="Chiffre d'affaires, equipe, reservations et commandes recentes.">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={WalletCards} label="Revenus totaux" value={`${stats.totalRevenue.toLocaleString('fr-FR')} EUR`} detail="Ventes locales recentes" tone="green" />
        <StatCard icon={Receipt} label="Commandes" value={stats.totalOrders} detail="Commandes enregistrees" tone="blue" />
        <StatCard icon={ChefHat} label="Employes" value={stats.totalWorkers} detail="Servants en base" tone="red" />
        <StatCard icon={Users} label="Clients" value={stats.totalUsers} detail="Comptes utilisateurs" tone="gold" />
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="srms-card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-srms-bordeaux">Ventes</p>
              <h2 className="srms-display text-3xl font-extrabold text-srms-ink">Dernieres commandes</h2>
            </div>
            <Badge tone={loading ? 'warning' : 'success'}>{loading ? 'Chargement' : 'A jour'}</Badge>
          </div>
          <div className="mt-8 flex h-56 items-end gap-3 border-b border-stone-200 pb-4">
            {bars.length ? bars.map((bar) => (
              <div key={bar.id} className="flex flex-1 flex-col items-center gap-2">
                <div className="w-full rounded-t-lg bg-gradient-to-t from-srms-bordeaux to-srms-gold transition-all" style={{ height: bar.height }} />
                <span className="text-xs font-bold text-stone-500">#{bar.id}</span>
              </div>
            )) : (
              <div className="flex h-full w-full items-center justify-center text-sm font-bold text-stone-500">Aucune vente recente</div>
            )}
          </div>
        </div>

        <div className="grid gap-4">
          <StatCard icon={CalendarDays} label="Reservations" value={deliveryStats.reservation || 0} tone="red" />
          <StatCard icon={Truck} label="Livreurs actifs" value={deliveryStats.livreur || 0} tone="blue" />
          <StatCard icon={Package} label="Livraisons effectuees" value={deliveryStats.livrison || 0} tone="gold" />
        </div>
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-2">
        <div className="srms-card p-5">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-extrabold text-srms-ink">Employes recents</h2>
            <button type="button" onClick={() => navigate('/user/admin/servants')} className="text-sm font-bold text-srms-bordeaux">Voir tout</button>
          </div>
          <div className="space-y-3">
            {servants.slice(0, 4).map((servant) => (
              <div key={servant.id} className="flex items-center justify-between rounded-lg bg-white/70 p-3">
                <div>
                  <p className="font-bold text-srms-ink">{servant.name}</p>
                  <p className="text-sm text-stone-500">{servant.email}</p>
                </div>
                <Badge tone="info">{servant.role || 'Servant'}</Badge>
              </div>
            ))}
          </div>
        </div>

        <div className="srms-card p-5">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-extrabold text-srms-ink">Commandes recentes</h2>
            <button type="button" onClick={() => navigate('/user/admin/ventes')} className="text-sm font-bold text-srms-bordeaux">Voir tout</button>
          </div>
          <div className="space-y-3">
            {payments.slice(0, 4).map((sale) => (
              <div key={sale.id} className="flex items-center justify-between rounded-lg bg-white/70 p-3">
                <div>
                  <p className="font-bold text-srms-ink">Commande #{sale.id}</p>
                  <p className="text-sm text-stone-500">Table {sale.table?.name || sale.table_id || '-'}</p>
                </div>
                <p className="font-extrabold text-emerald-700">{Number(sale.total_price || 0).toLocaleString('fr-FR')} EUR</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </AdminShell>
  );
}
