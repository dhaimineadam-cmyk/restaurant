import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaPaperPlane, FaRegLightbulb, FaTimes } from 'react-icons/fa';
import { GiChefToque } from 'react-icons/gi';
import api from '../../Api/api';

// Build a concise context string for Gemini using menus and restaurants
const buildSystemContext = (menuCategories = [], restaurants = []) => {
  const menus = (menuCategories || [])
    .flatMap((c) => (c.menu || c.menus || []).slice(0, 6).map((m) => ({
      title: m.nom || m.name || m.title,
      price: m.price,
      category: c.nom || c.name || c.title,
    })))
    .slice(0, 30);

  const rests = (restaurants || []).slice(0, 20).map((r) => ({
    id: r.id,
    name: r.nom || r.name,
    city: r.ville,
    cuisine: r.type_cuisine,
  }));

  return `Contexte: tu es un assistant pour une application de restaurants. Données disponibles (extrait):\nMenus: ${JSON.stringify(
    menus
  )}\nRestaurants: ${JSON.stringify(rests)}\nRéponds en français de façon naturelle, concise et utile. Si la requête nécessite une redirection vers une page, retourne la chaîne SPECIAL_NAV:<route> dans ta réponse (ex: SPECIAL_NAV:/user/client/commande) et n'ajoute pas d'autres explications. Si l'utilisateur demande des informations qui ne figurent pas dans les données, donne une réponse générale utile et propose de rediriger vers la page du menu ou liste des restaurants.`;
};

// Call Gemini API
const callGemini = async (userMessage, context) => {
  const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
  if (!apiKey) return null;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `${context}\n\nQuestion du client: ${userMessage}`
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 500,
        }
      })
    }
  );

  const data = await response.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || null;
};

const normalizeText = (text) =>
  String(text)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const getUserFromStorage = () => {
  try {
    return JSON.parse(localStorage.getItem('user') || 'null');
  } catch {
    return null;
  }
};

const smartRoutes = {
  commande: '/user/client/commande',
  reservation: '/user/client/reservation',
  avis: '/user/client/avis',
  reclamation: '/user/client/reclamation',
  menu: '/menu',
  restaurants: '/restaurants',
};

const defaultSuggestions = [
  'Voir le menu',
  'Commander en ligne',
  'Réserver une table',
  'Laisser un avis',
];

const getUserRoleLabel = (user) => {
  if (!user) return 'Invité';
  const role = (user.role || user.type || 'client').toString().toLowerCase();
  if (role === 'client') return 'Client';
  if (role === 'admin') return 'Administrateur';
  return role.charAt(0).toUpperCase() + role.slice(1);
};

const ChatBot = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      text: 'Bonjour ! Je suis votre assistant restaurant. Je peux vous aider à trouver un plat, réserver une table, passer une commande ou signaler un souci.',
    },
  ]);
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState(defaultSuggestions);
  const [menuCategories, setMenuCategories] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [fetchError, setFetchError] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [user, setUser] = useState(getUserFromStorage());
  const viewportRef = useRef(null);

  useEffect(() => {
    setUser(getUserFromStorage());
  }, []);

  useEffect(() => {
    if (!open) return;

    const loadData = async () => {
      setFetchError(null);
      try {
        const [categoryResponse, restaurantResponse] = await Promise.all([
          api.get('/menu/category'),
          api.get('/restaurants?per_page=100'),
        ]);

        setMenuCategories(Array.isArray(categoryResponse.data) ? categoryResponse.data : []);
        setRestaurants(Array.isArray(restaurantResponse.data) ? restaurantResponse.data : []);
      } catch (error) {
        setFetchError("Désolé, je n'ai pas pu charger le menu complet pour l'instant. Je peux quand même répondre à vos questions.");
      }
    };

    loadData();
  }, [open]);

  useEffect(() => {
    if (!viewportRef.current) return;
    viewportRef.current.scrollTop = viewportRef.current.scrollHeight;
  }, [messages, isTyping]);

  const currentPageLabel = useMemo(() => {
    const path = location.pathname;
    if (path.includes('/user/client/commande')) return 'Commande';
    if (path.includes('/user/client/reservation')) return 'Réservation';
    if (path.includes('/user/client/avis')) return 'Avis';
    if (path.includes('/user/client/reclamation')) return 'Réclamation';
    if (path.includes('/restaurants')) return 'Restaurants';
    if (path.includes('/menu')) return 'Menu';
    return 'Accueil';
  }, [location.pathname]);

  const addMessage = (message) => setMessages((prev) => [...prev, message]);

  const handleNavigation = (route) => {
    const requiresAuth = ['/user/client/commande', '/user/client/reservation', '/user/client/avis', '/user/client/reclamation'].includes(route);

    if (requiresAuth && !user) {
      addMessage({
        role: 'bot',
        text: "Pour accéder à cette page, connectez-vous d'abord. Je vous redirige vers la page de connexion.",
      });
      setTimeout(() => navigate('/login'), 400);
      return;
    }

    navigate(route);
    addMessage({
      role: 'bot',
      text: `Très bien, je vous redirige vers ${route === '/menu' ? 'le menu' : 'la page demandée'}.`,
    });
  };

  const findRestaurantMatches = (query) => {
    const normalizedQuery = normalizeText(query);
    if (!restaurants.length) return [];

    return restaurants
      .filter((restaurant) => {
        const combined = [restaurant.nom, restaurant.type_cuisine, restaurant.ville, restaurant.description]
          .filter(Boolean)
          .join(' ');
        return normalizeText(combined).includes(normalizedQuery);
      })
      .slice(0, 5);
  };

  const findMenuMatches = (query) => {
    const normalizedQuery = normalizeText(query);
    if (!menuCategories.length) return [];

    return menuCategories
      .flatMap((category) =>
        (category.menu || category.menus || [])
          .filter((item) => normalizeText(item.nom || item.name || '').includes(normalizedQuery))
          .map((item) => ({ ...item, category: category.nom || category.name }))
      )
      .slice(0, 5);
  };

  const handleBotResponse = async (text) => {
    const normalized = normalizeText(text);
    const isGreeting = /(bonjour|salut|coucou|hello|bonsoir)/.test(normalized);
    const wantsMenu = /(menu|carte|plats|dessert|entrée|boisson)/.test(normalized);
    const wantsOrder = /(commande|commander|livraison|livrer|prendre une commande)/.test(normalized);
    const wantsReservation = /(réserv|reservation|table|réserver)/.test(normalized);
    const wantsReview = /(avis|commentaire|note|notation|évaluer)/.test(normalized);
    const wantsClaim = /(réclamation|plainte|problème|signal)/.test(normalized);
    const wantsRestaurants = /(restaurant|ville|cuisine|gastronomie)/.test(normalized);
    const hasCuisine = /(italien|pizza|sushi|japonais|indien|burger|francais|mexicain|mediterraneen|vegan|vegetarien)/.test(normalized);

    setIsTyping(true);
    await new Promise((resolve) => setTimeout(resolve, 450));

    if (isGreeting) {
      addMessage({
        role: 'bot',
        text: `Bonjour ${user?.nom || user?.name || ''}. Je peux vous aider avec le menu, les restaurants, les réservations et les commandes.`,
      });
      setSuggestions(defaultSuggestions);
      setIsTyping(false);
      return;
    }

    if (wantsOrder) {
      handleNavigation(smartRoutes.commande);
      setIsTyping(false);
      return;
    }

    if (wantsReservation) {
      handleNavigation(smartRoutes.reservation);
      setIsTyping(false);
      return;
    }

    if (wantsReview) {
      handleNavigation(smartRoutes.avis);
      setIsTyping(false);
      return;
    }

    if (wantsClaim) {
      handleNavigation(smartRoutes.reclamation);
      setIsTyping(false);
      return;
    }

    if (wantsMenu) {
      const categories = menuCategories.map((category) => category.nom || category.name).filter(Boolean);
      addMessage({
        role: 'bot',
        text: categories.length
          ? `Je connais ${categories.length} catégories. Par exemple : ${categories.slice(0, 4).join(', ')}. Je peux vous montrer le menu complet.`
          : 'Je peux vous rediriger vers le menu pour voir nos plats.',
      });
      setSuggestions(['Voir le menu', 'Commander en ligne', 'Réserver une table']);
      setIsTyping(false);
      return;
    }

    if (wantsRestaurants || hasCuisine) {
      const matches = findRestaurantMatches(text);
      if (matches.length > 0) {
        addMessage({
          role: 'bot',
          text: `J'ai trouvé ${matches.length} restaurant(s) correspondant à votre recherche : ${matches
            .map((rest) => rest.nom || rest.name)
            .join(', ')}. Voulez-vous voir les restaurants ou consulter le menu ?`,
        });
        setSuggestions(['Voir les restaurants', 'Réserver une table', 'Voir le menu']);
        setIsTyping(false);
        return;
      }
      addMessage({
        role: 'bot',
        text: 'Je n’ai pas trouvé de restaurant précis avec ces termes. Je peux vous rediriger vers la liste complète des restaurants.',
      });
      handleNavigation(smartRoutes.restaurants);
      setIsTyping(false);
      return;
    }

    const menuMatches = findMenuMatches(text);
    if (menuMatches.length > 0) {
      addMessage({
        role: 'bot',
        text: `Voici des plats qui correspondent à votre recherche : ${menuMatches
          .map((item) => `${item.nom || item.name} (${item.category})`)
          .join(' ; ')}. Souhaitez-vous consulter le menu ?`,
      });
      setSuggestions(['Voir le menu', 'Commander en ligne']);
      setIsTyping(false);
      return;
    }

    try {
      const geminiResp = await callGemini(text, buildSystemContext(menuCategories, restaurants));
      if (typeof geminiResp === 'string' && geminiResp.startsWith('SPECIAL_NAV:')) {
        const route = geminiResp.replace('SPECIAL_NAV:', '').trim();
        addMessage({ role: 'bot', text: `Je vous redirige vers ${route}` });
        handleNavigation(route);
      } else {
        addMessage({ role: 'bot', text: geminiResp || "Désolé, je n'ai pas de réponse pour le moment." });
        setSuggestions(defaultSuggestions);
      }
    } catch (err) {
      console.error('Gemini error:', err);
      addMessage({
        role: 'bot',
        text: "Je n’ai pas compris votre demande. Essayez : \"Je veux commander\", \"Réserver une table\" ou \"Montre-moi le menu\".",
      });
      setSuggestions(defaultSuggestions);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;

    addMessage({ role: 'user', text: trimmed });
    setInput('');
    await handleBotResponse(trimmed);
  };

  const handleQuickAction = async (action) => {
    if (action === 'Voir les restaurants') {
      addMessage({ role: 'user', text: action });
      handleNavigation(smartRoutes.restaurants);
      return;
    }

    const route = smartRoutes[action.toLowerCase()] || smartRoutes.menu;
    addMessage({ role: 'user', text: action });
    handleNavigation(route);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {open && (
        <div className="mb-4 w-[320px] max-w-[90vw] rounded-3xl border border-amber-200/30 bg-[#2a0a07]/95 shadow-lg shadow-black/20 backdrop-blur-xl text-slate-100 ring-1 ring-amber-200/20">
          <div className="flex items-center justify-between rounded-t-3xl bg-gradient-to-r from-[#5c0f10] via-[#8b1b22] to-[#b74934] px-4 py-4 text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-2xl text-amber-200">
                <GiChefToque />
              </div>
              <div>
                <div className="text-sm font-semibold">Assistante Restaurant</div>
                <div className="text-xs text-amber-100/80">{user ? getUserRoleLabel(user) : 'Invité'} • {currentPageLabel}</div>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="rounded-full bg-white/10 p-2 text-slate-100 transition hover:bg-white/20"
              aria-label="Fermer le chatbot"
            >
              <FaTimes />
            </button>
          </div>

          <div className="min-h-[320px] max-h-[520px] overflow-hidden border-t border-white/10">
            <div
              ref={viewportRef}
              className="h-[360px] max-h-[420px] flex flex-col gap-3 overflow-y-auto px-3 py-3 scrollbar-thin scrollbar-thumb-amber-400/40 scrollbar-track-transparent"
            >
              {messages.map((message, index) => (
                <div
                  key={`${message.role}-${index}`}
                  className={`flex ${message.role === 'bot' ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-3xl px-4 py-3 text-sm leading-6 shadow-lg ${
                      message.role === 'bot'
                        ? 'bg-slate-900/95 text-slate-100'
                        : 'bg-amber-200/95 text-slate-900'
                    }`}
                  >
                    {message.text}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="inline-flex items-center gap-2 rounded-3xl bg-slate-900/95 px-4 py-3 text-sm text-slate-100 shadow-lg">
                    <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-amber-300" />
                    <span>Je réfléchis…</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-white/10 bg-[#210606]/90 px-4 py-4">
            {fetchError && (
              <div className="rounded-2xl bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
                {fetchError}
              </div>
            )}
            <div className="mb-3 flex flex-wrap gap-2">
              {(suggestions.length ? suggestions : defaultSuggestions).map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => handleQuickAction(suggestion)}
                  className="rounded-full border border-amber-200/30 bg-amber-300/10 px-3 py-2 text-xs text-amber-100 transition hover:border-amber-300 hover:bg-amber-300/20"
                >
                  {suggestion}
                </button>
              ))}
            </div>
            <form onSubmit={handleSubmit} className="flex items-center gap-3">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="h-11 flex-1 rounded-2xl border border-white/10 bg-slate-950/80 px-4 text-sm text-slate-100 outline-none ring-1 ring-transparent transition focus:border-amber-300 focus:ring-amber-300/20"
                placeholder="Écrivez votre question ici..."
                aria-label="Message au chatbot"
              />
              <button
                type="submit"
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-300 text-slate-950 transition hover:bg-amber-400"
                aria-label="Envoyer le message"
              >
                <FaPaperPlane />
              </button>
            </form>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#8b1b22] via-[#b14933] to-[#f5a962] px-4 py-2 text-xs font-semibold text-white shadow-xl transition hover:-translate-y-0.5"
      >
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-lg text-amber-100">
          <FaRegLightbulb />
        </span>
        <span>Assistant</span>
      </button>
    </div>
  );
};

export default ChatBot;
