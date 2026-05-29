import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bike, Clock3, Headphones, History, MapPin, Navigation, Power, Utensils } from 'lucide-react';
import api from '../../../../Api/api';
import { ActionTile, Badge, LoadingScreen, RolePage } from '../../../../Components/DesignSystem/SRMS';

const HomeLivreur = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [adminContact, setAdminContact] = useState(null);
  const [loading, setLoading] = useState(true);
  const [available, setAvailable] = useState(true);
  const [showSuccessMessage, setShowSuccessMessage] = useState(Boolean(location.state?.successMessage));

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (!token || !storedUser) {
      navigate('/login');
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);
    setLoading(false);
  }, [navigate]);

  useEffect(() => {
    api.get('/admincontact')
      .then(({ data }) => setAdminContact(Array.isArray(data) ? data[0] : data))
      .catch((error) => console.error('Erreur contact admin:', error));
  }, []);

  useEffect(() => {
    if (!showSuccessMessage) return undefined;
    const timer = setTimeout(() => setShowSuccessMessage(false), 3600);
    return () => clearTimeout(timer);
  }, [showSuccessMessage]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (loading) return <LoadingScreen label="Preparation de l espace livreur..." />;

  return (
    <RolePage
      user={user}
      title="Espace Livreur"
      badge="Mobile delivery"
      subtitle="Un tableau de bord mobile-first pour changer votre statut, voir les livraisons assignees et garder l historique sous la main."
      profilePath="/user/livreur/profile"
      onLogout={handleLogout}
      aside={
        <aside className="space-y-4">
          <div className="srms-card p-5">
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-srms-bordeaux">Disponibilite</p>
            <div className="mt-4 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-extrabold text-srms-ink">{available ? 'En ligne' : 'Hors ligne'}</h2>
                <p className="text-sm text-stone-600">Statut visuel rapide</p>
              </div>
              <button
                type="button"
                onClick={() => setAvailable((value) => !value)}
                className={`relative h-9 w-16 rounded-full transition ${available ? 'bg-emerald-500' : 'bg-stone-300'}`}
                title="Changer statut"
              >
                <span className={`absolute top-1 h-7 w-7 rounded-full bg-white shadow transition ${available ? 'left-8' : 'left-1'}`} />
              </button>
            </div>
            <button type="button" onClick={() => navigate('/user/livreur/status')} className="mt-5 srms-button srms-button-primary w-full">
              <Power size={18} /> Mettre a jour mon statut
            </button>
          </div>
          <div className="srms-card p-5">
            <Headphones className="text-srms-gold" />
            <h2 className="mt-3 text-xl font-extrabold text-srms-ink">Support dispatch</h2>
            <p className="mt-2 text-sm text-stone-600">{adminContact?.name || 'Administrateur'}</p>
            <p className="text-sm font-bold text-srms-bordeaux">{adminContact?.num || adminContact?.email || 'Contact indisponible'}</p>
          </div>
        </aside>
      }
    >
      {showSuccessMessage && (
        <div className="mb-5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800">
          {location.state?.successMessage}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <ActionTile icon={Bike} title="Livraisons assignees" description="Voir l adresse, le statut et la prochaine action." tone="green" onClick={() => navigate('/user/livreur/livrisons')} meta="Prioritaire" />
        <ActionTile icon={Power} title="Statut ON/OFF" description="Indiquez au dispatch si vous pouvez recevoir une course." tone="gold" onClick={() => navigate('/user/livreur/status')} />
        <ActionTile icon={History} title="Historique" description="Retrouvez vos livraisons effectuees et leurs statuts." tone="blue" onClick={() => navigate('/user/livreur/historique')} />
        <ActionTile icon={Utensils} title="Menu restaurant" description="Consultez les plats pour verifier les colis." tone="red" onClick={() => navigate('/user/livreur/menu')} />
      </div>

      <div className="mt-6 srms-card p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-srms-bordeaux">Prochaine course</p>
            <h2 className="mt-2 text-xl font-extrabold text-srms-ink">Workflow mobile</h2>
          </div>
          <Badge tone={available ? 'success' : 'warning'}>{available ? 'Disponible' : 'Pause'}</Badge>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {[
            [MapPin, 'Adresse', 'Verifier point de livraison'],
            [Navigation, 'Itineraire', 'Ouvrir la navigation'],
            [Clock3, 'Statut', 'Marquer livre / en route'],
          ].map(([Icon, title, text]) => (
            <div key={title} className="rounded-lg border border-stone-200 bg-white/70 p-4">
              <Icon className="text-srms-gold" size={22} />
              <p className="mt-3 font-extrabold text-srms-ink">{title}</p>
              <p className="mt-1 text-sm text-stone-500">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </RolePage>
  );
};

export default HomeLivreur;
