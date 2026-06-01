import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaPaperPlane, FaRegLightbulb, FaTimes } from 'react-icons/fa';
import { GiChefToque } from 'react-icons/gi';
import api from '../../Api/api';
 
const buildSystemContext = (menuCategories = [], restaurants = []) => {
  const menus = (menuCategories || [])
    .flatMap((c) => (c.menu || c.menus || []).slice(0, 10).map((m) => ({
      titre: m.nom || m.name || m.title,
      prix: m.price,
      description: m.description,
      categorie: c.nom || c.name || c.title,
    })))
    .slice(0, 50);
 
  const rests = (restaurants || []).slice(0, 20).map((r) => ({
    nom: r.nom || r.name,
    ville: r.ville,
    cuisine: r.type_cuisine,
    livraison: r.delivery_available,
    halal: r.is_halal,
  }));
 
  return `Tu es un assistant virtuel intelligent pour une application de gestion de restaurants appelée SRMS.
Tu réponds TOUJOURS en français, de façon naturelle, chaleureuse et utile.
Tu es expert en gastronomie, cuisine et restauration.
 
Données du restaurant disponibles:
- Menus: ${JSON.stringify(menus)}
- Restaurants: ${JSON.stringify(rests)}
 
Règles importantes:
1. Si l'utilisateur veut COMMANDER → réponds "SPECIAL_NAV:/user/client/commande"
2. Si l'utilisateur veut RÉSERVER une table → réponds "SPECIAL_NAV:/user/client/reservation"  
3. Si l'utilisateur veut laisser un AVIS → réponds "SPECIAL_NAV:/user/client/avis"
4. Si l'utilisateur veut faire une RÉCLAMATION → réponds "SPECIAL_NAV:/user/client/reclamation"
5. Si l'utilisateur veut voir le MENU → réponds "SPECIAL_NAV:/menu"
6. Pour toutes les autres questions (cuisine, plats, conseils, allergies, recommandations, etc.) → réponds normalement en français
7. Sois toujours helpful, précis et concis (max 3 phrases)
8. Si tu ne sais pas, propose de consulter le menu ou de contacter le restaurant`;
};
 
const callGemini = async (userMessage, systemContext) => {
  const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('REACT_APP_GEMINI_API_KEY not set');
    return null;
  }
 
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: systemContext }]
        },
        contents: [{
          parts: [{ text: userMessage }]
        }],
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 300,
        }
      })
    }
  );
 
  const data = await response.json();
  if (data?.error) {
    console.error('Gemini API error:', data.error);
    return null;
  }
  return data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null;
};
 
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
  restaurants: '/restaurants/search',
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
      text: 'Bonjour ! 👨‍🍳 Je suis votre assistant restaurant intelligent. Posez-moi n\'importe quelle question sur nos plats, notre cuisine, les réservations ou les commandes !',
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
        const restData = restaurantResponse.data;
        setRestaurants(Array.isArray(restData) ? restData : (restData?.data || []));
      } catch (error) {
        setFetchError("Je n'ai pas pu charger toutes les données du menu, mais je peux quand même vous aider !");
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
    const requiresAuth = [
      '/user/client/commande',
      '/user/client/reservation',
      '/user/client/avis',
      '/user/client/reclamation'
    ].includes(route);
 
    if (requiresAuth && !user) {
      addMessage({
        role: 'bot',
        text: "Pour accéder à cette page, vous devez être connecté. Je vous redirige vers la connexion... 🔐",
      });
      setTimeout(() => navigate('/login'), 800);
      return;
    }
 
    navigate(route);
  };
 
  const handleBotResponse = async (text) => {
    setIsTyping(true);
 
    try {
      const systemContext = buildSystemContext(menuCategories, restaurants);
      const geminiResp = await callGemini(text, systemContext);
 
      if (geminiResp && geminiResp.startsWith('SPECIAL_NAV:')) {
        const route = geminiResp.replace('SPECIAL_NAV:', '').trim();
        addMessage({
          role: 'bot',
          text: `Bien sûr ! Je vous redirige... 🚀`,
        });
        setTimeout(() => handleNavigation(route), 500);
        setSuggestions(defaultSuggestions);
      } else if (geminiResp) {
        addMessage({ role: 'bot', text: geminiResp });
        setSuggestions(defaultSuggestions);
      } else {
        // Fallback si Gemini ne répond pas
        addMessage({
          role: 'bot',
          text: "Je suis là pour vous aider ! Vous pouvez me demander des informations sur nos plats, faire une réservation ou passer une commande. 🍽️",
        });
        setSuggestions(defaultSuggestions);
      }
    } catch (err) {
      console.error('Gemini error:', err);
      addMessage({
        role: 'bot',
        text: "Désolé, je rencontre un problème technique. Utilisez les boutons ci-dessous pour naviguer. 🙏",
      });
      setSuggestions(defaultSuggestions);
    } finally {
      setIsTyping(false);
    }
  };
 
  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isTyping) return;
    addMessage({ role: 'user', text: trimmed });
    setInput('');
    await handleBotResponse(trimmed);
  };
 
  const handleQuickAction = async (action) => {
    addMessage({ role: 'user', text: action });
    const routeMap = {
      'Voir le menu': smartRoutes.menu,
      'Commander en ligne': smartRoutes.commande,
      'Réserver une table': smartRoutes.reservation,
      'Laisser un avis': smartRoutes.avis,
      'Voir les restaurants': smartRoutes.restaurants,
    };
    if (routeMap[action]) {
      addMessage({ role: 'bot', text: 'Je vous redirige... 🚀' });
      setTimeout(() => handleNavigation(routeMap[action]), 400);
    } else {
      await handleBotResponse(action);
    }
  };
 
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {open && (
        <div className="mb-3 w-[320px] max-w-[90vw] rounded-2xl border border-amber-200/30 bg-[#2a0a07]/95 shadow-lg shadow-black/20 backdrop-blur-xl text-slate-100 ring-1 ring-amber-200/20">
          {/* Header */}
          <div className="flex items-center justify-between rounded-t-2xl bg-gradient-to-r from-[#5c0f10] via-[#8b1b22] to-[#b74934] px-4 py-3 text-white">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 text-xl text-amber-200">
                <GiChefToque />
              </div>
              <div>
                <div className="text-xs font-semibold">Assistant Restaurant AI</div>
                <div className="text-[10px] text-amber-100/80">{user ? getUserRoleLabel(user) : 'Invité'} • {currentPageLabel}</div>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="rounded-full bg-white/10 p-1.5 text-slate-100 transition hover:bg-white/20"
            >
              <FaTimes size={12} />
            </button>
          </div>
 
          {/* Messages */}
          <div
            ref={viewportRef}
            className="flex flex-col gap-2 overflow-y-auto px-3 py-3"
            style={{ height: '280px' }}
          >
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'bot' ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-5 shadow ${
                    message.role === 'bot'
                      ? 'bg-slate-800/95 text-slate-100'
                      : 'bg-amber-300/95 text-slate-900'
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="inline-flex items-center gap-1.5 rounded-2xl bg-slate-800/95 px-3 py-2 text-xs text-slate-100">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-amber-300" style={{ animationDelay: '0ms' }} />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-amber-300" style={{ animationDelay: '150ms' }} />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-amber-300" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
          </div>
 
          {/* Footer */}
          <div className="border-t border-white/10 bg-[#210606]/90 px-3 py-3">
            {fetchError && (
              <div className="mb-2 rounded-xl bg-rose-500/10 px-2 py-1 text-[10px] text-rose-200">
                {fetchError}
              </div>
            )}
            <div className="mb-2 flex flex-wrap gap-1">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => handleQuickAction(suggestion)}
                  disabled={isTyping}
                  className="rounded-full border border-amber-200/30 bg-amber-300/10 px-2 py-1 text-[10px] text-amber-100 transition hover:border-amber-300 hover:bg-amber-300/20 disabled:opacity-50"
                >
                  {suggestion}
                </button>
              ))}
            </div>
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isTyping}
                className="h-9 flex-1 rounded-xl border border-white/10 bg-slate-950/80 px-3 text-xs text-slate-100 outline-none transition focus:border-amber-300 disabled:opacity-50"
                placeholder="Posez votre question..."
              />
              <button
                type="submit"
                disabled={isTyping || !input.trim()}
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-amber-300 text-slate-950 transition hover:bg-amber-400 disabled:opacity-50"
              >
                <FaPaperPlane size={12} />
              </button>
            </form>
          </div>
        </div>
      )}
 
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#8b1b22] via-[#b14933] to-[#f5a962] px-4 py-2 text-xs font-semibold text-white shadow-xl transition hover:-translate-y-0.5"
      >
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/15 text-sm text-amber-100">
          <FaRegLightbulb />
        </span>
        <span>Assistant</span>
      </button>
    </div>
  );
};
 
export default ChatBot;
