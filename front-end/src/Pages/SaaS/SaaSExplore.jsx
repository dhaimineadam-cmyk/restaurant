import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Search, Loader } from "lucide-react";
import api from "../../Api/api";
import "./SaaSExplore.css";
 
export default function SaaSExplore() {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");
    const [restaurants, setRestaurants] = useState([]);
    const [allRestaurants, setAllRestaurants] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedMenus, setSelectedMenus] = useState([]);
    const [aiMessage, setAiMessage] = useState("👋 Bonjour! Tapez le nom d'un restaurant, une ville ou un type de cuisine...");
    const [showActionMenu, setShowActionMenu] = useState(false);
    const [selectedRestaurant, setSelectedRestaurant] = useState(null);
 
    const routeLocation = useLocation();
 
    // Charger tous les restaurants une seule fois
    useEffect(() => {
        setLoading(true);
        api.get("/restaurants", { params: { per_page: 100 } })
            .then(({ data }) => {
                const all = data?.data || [];
                setAllRestaurants(all);
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);
 
    // Filtrer quand l'utilisateur tape
    useEffect(() => {
        if (searchQuery.trim().length === 0) {
            setRestaurants([]);
            setSelectedRestaurant(null);
            setSelectedMenus([]);
            setShowActionMenu(false);
            setAiMessage("👋 Bonjour! Tapez le nom d'un restaurant, une ville ou un type de cuisine...");
            return;
        }
 
        const query = searchQuery.toLowerCase();
        const filtered = allRestaurants.filter(r =>
            r.nom?.toLowerCase().includes(query) ||
            r.type_cuisine?.toLowerCase().includes(query) ||
            r.ville?.toLowerCase().includes(query) ||
            r.description?.toLowerCase().includes(query)
        );
 
        setRestaurants(filtered.map(r => ({ ...r, matchedMenus: [] })));
        setSelectedRestaurant(null);
        setShowActionMenu(false);
 
        if (filtered.length === 0) {
            setAiMessage(`😕 Aucun restaurant trouvé pour "${searchQuery}". Essayez une autre recherche!`);
        } else {
            setAiMessage(`✨ ${filtered.length} restaurant(s) trouvés pour "${searchQuery}".`);
        }
    }, [searchQuery, allRestaurants]);
 
    const handleAction = (action) => {
        if (selectedRestaurant) {
            localStorage.setItem('selectedRestaurant', JSON.stringify(selectedRestaurant));
        }
        if (selectedMenus && selectedMenus.length > 0) {
            localStorage.setItem('selectedMenus', JSON.stringify(selectedMenus));
        }
 
        if (action === "order") navigate("/user/client/commande");
        else if (action === "reservation") navigate("/user/client/reservation");
        else if (action === "feedback") navigate("/user/client/avis");
        else if (action === "reclamation") navigate("/user/client/reclamation");
    };
 
    return (
        <main className="saas-smart-search">
            {/* Hero / AI Assistant Banner */}
            <section className="saas-ai-hero">
                <div className="saas-ai-greeting">
                    <h1>🍽️ Assistant Culinaire Personnel</h1>
                    <p>Recherchez un restaurant par nom, ville ou type de cuisine</p>
                </div>
 
                {/* Search Input */}
                <div className="saas-ai-search">
                    <Search size={22} />
                    <input
                        type="text"
                        placeholder="Marocain, Casa, Pizza..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="saas-ai-input"
                    />
                    {loading && <Loader size={18} className="animate-spin" />}
                </div>
            </section>
 
            {/* AI Message */}
            <section className="saas-ai-message">
                <div className="saas-ai-bubble">
                    <span>{aiMessage}</span>
                </div>
            </section>
 
            {/* Restaurants Results */}
            {restaurants.length > 0 && (
                <section className="saas-menus-grid">
                    <div className="saas-menus-header">
                        <h2>Restaurants trouvés ({restaurants.length})</h2>
                    </div>
                    <div className="saas-menus-cards">
                        {restaurants.map((r) => (
                            <div
                                key={r.id}
                                className={`saas-restaurant-result-card ${selectedRestaurant && selectedRestaurant.id === r.id ? 'selected' : ''}`}
                                onClick={() => {
                                    setSelectedRestaurant(r);
                                    setSelectedMenus([]);
                                    setShowActionMenu(true);
                                    setAiMessage(`✅ Vous avez sélectionné ${r.nom}. Choisissez une action ci-dessous.`);
                                }}
                            >
                                <div className="saas-menu-image">
                                    <img
                                        src={
                                            r.banner || r.logo ||
                                            `https://source.unsplash.com/400x300/?restaurant,food&sig=${r.id}`
                                        }
                                        alt={r.nom}
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = `https://source.unsplash.com/400x300/?restaurant&sig=${r.id}`;
                                        }}
                                    />
                                </div>
                                <div className="saas-menu-info">
                                    <h3>{r.nom}</h3>
                                    <p className="saas-restaurant-name">
                                        {r.type_cuisine} • {r.ville}
                                    </p>
                                    <div className="saas-category-name">
                                        {r.description || 'Voir le menu'}
                                    </div>
                                    <div className="saas-menu-footer">
                                        <span className="saas-price">
                                            {r.delivery_available ? '🛵 Livraison' : '🍽️ Sur place'}
                                        </span>
                                        <span className={`saas-availability ${r.status === 'active' ? 'available' : 'unavailable'}`}>
                                            {r.status === 'active' ? '✓ Actif' : '✗ Inactif'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}
 
            {/* Action Menu */}
            {showActionMenu && selectedRestaurant && (
                <section className="saas-action-panel">
                    <h3>Vous avez sélectionné {selectedRestaurant.nom}</h3>
                    <div className="saas-action-buttons">
                        <button className="saas-action-btn saas-btn-order" onClick={() => handleAction("order")}>
                            🛒 Commander en ligne
                        </button>
                        <button className="saas-action-btn saas-btn-reservation" onClick={() => handleAction("reservation")}>
                            📅 Réserver une table
                        </button>
                        <button className="saas-action-btn saas-btn-feedback" onClick={() => handleAction("feedback")}>
                            ⭐ Laisser un avis
                        </button>
                        <button className="saas-action-btn saas-btn-reclamation" onClick={() => handleAction("reclamation")}>
                            📝 Faire une réclamation
                        </button>
                    </div>
                </section>
            )}
        </main>
    );
}