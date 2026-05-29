import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarCheck, ChefHat, MapPin, Search, ShoppingBag, Star, Utensils } from 'lucide-react';
import logo from '../Images/logo2.jpg';

const Home = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState({ connected: false, role: '' });

  useEffect(() => {
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (user && token) {
      const userData = JSON.parse(user);
      setSession({ connected: true, role: userData.role });
    }
  }, []);

  const spacePath = useMemo(() => {
    if (session.role === 'admin') return '/user/admin';
    if (session.role === 'client') return '/user/client';
    if (session.role === 'livreur') return '/user/livreur';
    if (session.role === 'servant') return '/user/servant';
    return '/login';
  }, [session.role]);

  return (
    <div className="srms-dark-page overflow-hidden">
      <section className="relative min-h-[calc(100vh-72px)]">
        <img src={logo} alt="Salle de restaurant" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-srms-ink via-srms-ink/78 to-srms-bordeaux/58" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-srms-ink to-transparent" />

        <div className="relative mx-auto grid min-h-[calc(100vh-72px)] max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
          <div className="max-w-3xl">
            <span className="srms-chip border-srms-gold/40 bg-srms-gold/15 text-srms-cream">
              <ChefHat size={16} /> Smart Restaurant Management System
            </span>
            <h1 className="srms-display mt-7 text-5xl font-extrabold leading-[1.02] text-srms-cream md:text-7xl">
              Une experience restaurant plus rapide, plus belle, plus fluide.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-srms-cream/82">
              Reservations, menus, commandes, tables et livraisons reunis dans une interface premium pensee pour les equipes et les clients.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => navigate(session.connected ? spacePath : '/restaurants')}
                className="srms-button srms-button-primary"
              >
                {session.connected ? 'Acceder a mon espace' : 'Explorer les restaurants'}
                <Search size={18} />
              </button>
              <button type="button" onClick={() => navigate('/menu')} className="srms-button srms-button-secondary">
                Voir la carte
                <Utensils size={18} />
              </button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            {[
              { icon: CalendarCheck, title: 'Reservations', text: 'Creneaux, tables et confirmations en un parcours.' },
              { icon: ShoppingBag, title: 'Commandes', text: 'Panier fluide, suivi et historique client.' },
              { icon: MapPin, title: 'Livraisons', text: 'Livreurs, adresses et statuts lisibles sur mobile.' },
              { icon: Star, title: 'Experience', text: 'Avis, reclamations et pages restaurant publiques.' },
            ].map((item) => (
              <div key={item.title} className="srms-card-dark p-5 transition duration-200 hover:-translate-y-1">
                <item.icon className="text-srms-gold" size={26} />
                <h2 className="mt-4 text-xl font-extrabold text-srms-cream">{item.title}</h2>
                <p className="mt-2 text-sm leading-6 text-srms-cream/68">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-srms-ink px-4 pb-14 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-3">
          {[
            ['4', 'espaces metier', 'Admin, client, servant et livreur gardent chacun leurs priorites.'],
            ['24/7', 'pilotage operationnel', 'Les donnees critiques restent visibles et actionnables.'],
            ['100%', 'responsive', 'Concu pour desktop, tablette de service et mobile livraison.'],
          ].map(([value, label, text]) => (
            <div key={label} className="border-t border-srms-gold/30 pt-5">
              <p className="text-4xl font-extrabold text-srms-gold">{value}</p>
              <p className="mt-1 font-bold text-srms-cream">{label}</p>
              <p className="mt-2 text-sm leading-6 text-srms-cream/62">{text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
