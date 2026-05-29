import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarCheck, ClipboardList, HeartHandshake, MapPin, MessageSquare, Search, ShoppingBag, Star } from 'lucide-react';
import api from '../../../../Api/api';
import { ActionTile, Badge, LoadingScreen, RolePage } from '../../../../Components/DesignSystem/SRMS';

const HomeClient = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [clientLocation, setClientLocation] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (!token || !storedUser) {
      navigate('/login');
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);
    api.get(`/user/client/${parsedUser.id}`)
      .then(({ data }) => {
        setUser(data);
        localStorage.setItem('user', JSON.stringify(data));
      })
      .catch((error) => console.warn('Impossible de synchroniser le profil client', error))
      .finally(() => setLoading(false));

    const storedLocation = localStorage.getItem('clientLocation');
    if (storedLocation) {
      try {
        setClientLocation(JSON.parse(storedLocation));
      } catch (error) {
        console.warn('Impossible de lire la localisation enregistree', error);
      }
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('clientLocation');
    navigate('/login');
  };

  const buildRestaurantSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('q', searchQuery.trim());
    if (clientLocation?.lat && clientLocation?.lng) {
      params.set('lat', clientLocation.lat);
      params.set('lng', clientLocation.lng);
    }
    navigate(`/restaurants?${params.toString()}`);
  };

  const captureLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextLocation = { lat: position.coords.latitude, lng: position.coords.longitude };
        setClientLocation(nextLocation);
        localStorage.setItem('clientLocation', JSON.stringify(nextLocation));
      },
      (error) => console.warn('Localisation non autorisee ou indisponible', error),
      { enableHighAccuracy: true, timeout: 7000, maximumAge: 0 }
    );
  };

  if (loading) return <LoadingScreen label="Preparation de votre espace client..." />;

  return (
    <RolePage
      user={user}
      title="Espace Client"
      badge="Experience invite"
      subtitle="Explorez les restaurants, reservez une table, commandez en ligne et gardez le suivi de vos demandes au meme endroit."
      profilePath="/user/client/profile"
      onLogout={handleLogout}
      aside={
        <aside className="space-y-4">
          <div className="srms-card p-5">
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-srms-bordeaux">Recherche rapide</p>
            <h2 className="mt-2 text-xl font-extrabold text-srms-ink">Trouver un plat ou restaurant</h2>
            <div className="mt-4 flex gap-2">
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                onKeyDown={(event) => { if (event.key === 'Enter') buildRestaurantSearch(); }}
                className="min-w-0 flex-1 rounded-lg border border-stone-200 bg-white px-3 py-3 text-sm outline-none focus:border-srms-gold"
                placeholder="Pizza, sushi, tajine..."
                type="search"
              />
              <button type="button" onClick={buildRestaurantSearch} className="srms-button srms-button-primary px-3" title="Rechercher">
                <Search size={18} />
              </button>
            </div>
            <button type="button" onClick={captureLocation} className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-srms-bordeaux">
              <MapPin size={16} /> Utiliser ma position
            </button>
          </div>
          <div className="srms-card p-5">
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-srms-bordeaux">Statut</p>
            <div className="mt-3 flex items-center justify-between">
              <span className="font-bold text-srms-ink">Localisation</span>
              <Badge tone={clientLocation ? 'success' : 'warning'}>{clientLocation ? 'Active' : 'Optionnelle'}</Badge>
            </div>
            <p className="mt-3 text-sm leading-6 text-stone-600">Activez-la pour classer les restaurants par proximite quand l API le permet.</p>
          </div>
        </aside>
      }
    >
      <div className="grid gap-4 md:grid-cols-2">
        <ActionTile icon={Search} title="Explorer" description="Rechercher un restaurant, un plat ou une cuisine proche de vous." tone="gold" onClick={() => navigate('/restaurants')} />
        <ActionTile icon={CalendarCheck} title="Reservation" description="Choisissez date, heure et nombre de personnes pour votre table." tone="green" onClick={() => navigate('/user/client/reservation')} />
        <ActionTile icon={ShoppingBag} title="Commande en ligne" description="Composez votre panier et suivez votre commande." tone="blue" onClick={() => navigate('/user/client/commande')} />
        <ActionTile icon={ClipboardList} title="Mes commandes" description="Retrouvez l historique et les statuts de vos commandes." tone="sage" onClick={() => navigate('/user/client/commandes')} />
        <ActionTile icon={Star} title="Avis" description="Partagez votre experience avec la communaute." tone="gold" onClick={() => navigate('/user/client/avis')} />
        <ActionTile icon={MessageSquare} title="Reclamation" description="Signalez un probleme et suivez le traitement." tone="red" onClick={() => navigate('/user/client/reclamation')} />
      </div>

      <div className="mt-6 srms-card p-5">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-srms-bordeaux">Conseil service</p>
            <h2 className="mt-2 text-xl font-extrabold text-srms-ink">Votre prochaine experience commence par la carte.</h2>
            <p className="mt-2 text-sm leading-6 text-stone-600">Filtrez par categorie, reperez les plats populaires et passez au panier sans perdre votre selection.</p>
          </div>
          <button type="button" onClick={() => navigate('/menu')} className="srms-button srms-button-primary">
            Voir le menu <HeartHandshake size={18} />
          </button>
        </div>
      </div>
    </RolePage>
  );
};

export default HomeClient;
