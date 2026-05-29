import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, CookingPot, Grid3X3, Headphones, PackageCheck, ReceiptText, Table2, Truck } from 'lucide-react';
import api from '../../../../Api/api';
import { ActionTile, Badge, LoadingScreen, RolePage } from '../../../../Components/DesignSystem/SRMS';

const HomeServants = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [adminContact, setAdminContact] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (!token || !storedUser) {
      navigate('/login');
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    if (parsedUser.role === 'admin' || parsedUser.role === 'client') {
      navigate(`/user/${parsedUser.role}`);
      return;
    }

    setUser(parsedUser);
    setLoading(false);
  }, [navigate]);

  useEffect(() => {
    api.get('/admincontact')
      .then(({ data }) => setAdminContact(Array.isArray(data) ? data[0] : data))
      .catch((error) => console.error('Erreur contact admin:', error));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (loading) return <LoadingScreen label="Preparation de l espace servant..." />;

  return (
    <RolePage
      user={user}
      title="Espace Servant"
      badge="Service en salle"
      subtitle="Une interface compacte pour tablette : tables, commandes locales, commandes en ligne, livraisons et reservations restent accessibles en un geste."
      profilePath="/user/servant/profil"
      onLogout={handleLogout}
      aside={
        <aside className="space-y-4">
          <div className="srms-card p-5">
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-srms-bordeaux">Mode service</p>
            <h2 className="mt-2 text-xl font-extrabold text-srms-ink">Plan de salle rapide</h2>
            <div className="mt-5 grid grid-cols-4 gap-2">
              {Array.from({ length: 12 }, (_, index) => (
                <div key={index} className={`aspect-square rounded-lg border ${index % 4 === 0 ? 'border-amber-300 bg-amber-100' : index % 5 === 0 ? 'border-red-300 bg-red-100' : 'border-emerald-300 bg-emerald-100'}`} />
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge tone="success">Libre</Badge>
              <Badge tone="warning">Reservee</Badge>
              <Badge tone="danger">Occupee</Badge>
            </div>
          </div>
          <div className="srms-card p-5">
            <Headphones className="text-srms-gold" />
            <h2 className="mt-3 text-xl font-extrabold text-srms-ink">Support</h2>
            <p className="mt-2 text-sm text-stone-600">{adminContact?.name || 'Administrateur'}</p>
            <p className="text-sm font-bold text-srms-bordeaux">{adminContact?.num || adminContact?.email || 'Contact indisponible'}</p>
          </div>
        </aside>
      }
    >
      <div className="grid gap-4 md:grid-cols-2">
        <ActionTile icon={ReceiptText} title="Commandes en ligne" description="Suivre les commandes entrantes et les transmettre en cuisine." tone="blue" onClick={() => navigate('/user/servant/commandes-en-ligne')} meta="Live" />
        <ActionTile icon={CookingPot} title="Commande locale" description="Prendre une commande sur place, table par table." tone="green" onClick={() => navigate('/user/servant/commandes-locales')} />
        <ActionTile icon={Truck} title="Livraisons" description="Verifier les livraisons et l etat de preparation." tone="gold" onClick={() => navigate('/user/servant/livraisons')} />
        <ActionTile icon={ClipboardList} title="Reservations" description="Voir les arrivees prevues et preparer la salle." tone="red" onClick={() => navigate('/user/servant/reservations')} />
        <ActionTile icon={Table2} title="Tables" description="Changer statut, disponibilite et suivi de salle." tone="sage" onClick={() => navigate('/user/servant/tables')} />
        <ActionTile icon={PackageCheck} title="Menu" description="Consulter la carte disponible pendant le service." tone="gold" onClick={() => navigate('/user/servant/menu')} />
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {['En attente', 'En preparation', 'Pret'].map((column, index) => (
          <div key={column} className="srms-card p-4">
            <div className="flex items-center justify-between">
              <h2 className="font-extrabold text-srms-ink">{column}</h2>
              <Grid3X3 size={18} className="text-srms-gold" />
            </div>
            <div className="mt-4 space-y-3">
              {[1, 2].map((item) => (
                <div key={item} className="rounded-lg border border-stone-200 bg-white/70 p-3">
                  <p className="font-bold text-srms-ink">Table {index * 2 + item}</p>
                  <p className="text-sm text-stone-500">Commande exemple</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </RolePage>
  );
};

export default HomeServants;
