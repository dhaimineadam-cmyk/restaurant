import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Search, Loader } from "lucide-react";
import api from "../../Api/api";
import "./SaaSExplore.css";

export default function SaaSExplore() {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedMenus, setSelectedMenus] = useState([]);
    const [aiMessage, setAiMessage] = useState("👋 Bonjour! Bienvenue chez nous. Tapez le nom d'un plat pour commencer...");
    const [showActionMenu, setShowActionMenu] = useState(false);
    const [selectedRestaurant, setSelectedRestaurant] = useState(null);
    const [location, setLocation] = useState(null);

    const routeLocation = useLocation();

    // Initialize from URL params if present (q, lat, lng)
    useEffect(() => {
        const params = new URLSearchParams(routeLocation.search);
        const q = params.get('q') || '';
        const lat = params.get('lat');
        const lng = params.get('lng');
        if (q && q.trim().length > 0) setSearchQuery(q);
        if (lat && lng) {
            const parsedLat = parseFloat(lat);
            const parsedLng = parseFloat(lng);
            if (!isNaN(parsedLat) && !isNaN(parsedLng)) {
                setLocation({ lat: parsedLat, lng: parsedLng });
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [routeLocation.search]);

    useEffect(() => {
        if (!navigator.geolocation) return;

        navigator.geolocation.getCurrentPosition(
            (position) => setLocation({ lat: position.coords.latitude, lng: position.coords.longitude }),
            () => setLocation(null),
            { timeout: 4000 }
        );
    }, []);

    // Charger tous les restaurants au démarrage
    useEffect(() => {
        api.get("/restaurants", { params: { per_page: 50 } })
            .then(({ data }) => {
                const all = data?.data || [];
                setRestaurants(all.map(r => ({ ...r, matchedMenus: [] })));
                setAiMessage(`✨ ${all.length} restaurant(s) disponibles. Tapez pour filtrer.`);
            })
            .catch(err => console.error(err));
    }, []);

    // Recherche les plats quand l'utilisateur tape
    useEffect(() => {
        if (searchQuery.trim().length === 0) {
            api.get("/restaurants", { params: { per_page: 50 } })
                .then(({ data }) => {
                    const all = data?.data || [];
                    setRestaurants(all.map(r => ({ ...r, matchedMenus: [] })));
                    setAiMessage(`✨ ${all.length} restaurant(s) disponibles.`);
                })
                .catch(err => console.error(err));
            setSelectedRestaurant(null);
            setSelectedMenus([]);
            setShowActionMenu(false);
            return;
        }

        setSelectedRestaurant(null);
        setSelectedMenus([]);
        setShowActionMenu(false);
        setLoading(true);
        const timer = setTimeout(async () => {
            try {
                // 1) Run text search to get matching menus and restaurants
                const params = {
                    q: searchQuery,
                    per_page: 20,
                    ...(location ? { lat: location.lat, lng: location.lng, radius: 50 } : {}),
                };

                const { data: searchData } = await api.get("/search", { params });
                const foundMenus = searchData?.menus?.data || [];
                const foundRestaurants = searchData?.restaurants?.data || [];

                const restaurantMap = {};
                
                // Si aucun résultat, cherche directement les restaurants
                if (foundMenus.length === 0 && foundRestaurants.length === 0) {
                    const { data: restData } = await api.get("/restaurants", { 
                        params: { per_page: 20 } 
                    });
                    const allRestaurants = restData?.data || [];
                    const filtered = allRestaurants.filter(r => 
                        r.nom?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        r.type_cuisine?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        r.ville?.toLowerCase().includes(searchQuery.toLowerCase())
                    );
                    filtered.forEach(r => {
                        restaurantMap[r.id] = { ...r, matchedMenus: [] };
                    });
                }

                foundRestaurants.forEach((r) => {
                    restaurantMap[r.id] = { ...r, matchedMenus: [] };
                });

                foundMenus.forEach((m) => {
                    const restaurantId = m.restaurant?.id;
                    if (!restaurantId) return;

                    if (!restaurantMap[restaurantId]) {
                        restaurantMap[restaurantId] = { ...m.restaurant, matchedMenus: [] };
                    }
                    restaurantMap[restaurantId].matchedMenus.push(m);
                });

                const resultList = Object.values(restaurantMap).sort((a, b) => {
                    if (a.distance != null && b.distance != null) return a.distance - b.distance;
                    if (a.distance != null) return -1;
                    if (b.distance != null) return 1;
                    return (a.nom || '').localeCompare(b.nom || '');
                });

                setRestaurants(resultList);

                if (resultList.length === 0) {
                    setAiMessage(`😕 Aucun plat ou restaurant trouvé pour "${searchQuery}". Essayez une autre recherche!`);
                } else if (location) {
                    setAiMessage(`✨ ${resultList.length} restaurant(s) proches trouvés pour "${searchQuery}".`);
                } else {
                    setAiMessage(`✨ ${resultList.length} restaurant(s) trouvés pour "${searchQuery}".`);
                }
            } catch (err) {
                console.error("Search error:", err);
                setAiMessage("❌ Une erreur s'est produite. Veuillez réessayer.");
            } finally {
                setLoading(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery, location]);

    const handleAction = (action) => {
        // persist selection so order/reservation pages can pick it up
        if (selectedRestaurant) {
            localStorage.setItem('selectedRestaurant', JSON.stringify(selectedRestaurant));
        }
        if (selectedMenus && selectedMenus.length > 0) {
            localStorage.setItem('selectedMenus', JSON.stringify(selectedMenus));
        }

        if (action === "order") {
            navigate("/user/client/commande");
        } else if (action === "reservation") {
            navigate("/user/client/reservation");
        } else if (action === "feedback") {
            navigate("/user/client/avis");
        } else if (action === "reclamation") {
            navigate("/user/client/reclamation");
        }
    };

    return (
        <main className="saas-smart-search">
            {/* Hero / AI Assistant Banner */}
            <section className="saas-ai-hero">
                <div className="saas-ai-greeting">
                    <h1>🍽️ Assistant Culinaire Personnel</h1>
                    <p>Dites-moi quel plat vous avez envie et je vous guiderai</p>
                </div>

                {/* Search Input */}
                <div className="saas-ai-search">
                    <Search size={22} />
                    <input
                        type="text"
                        placeholder="Tapez un plat... (pizza, sushi, burger, etc.)"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="saas-ai-input"
                    />
                    {loading && <Loader size={18} className="animate-spin" />}
                </div>
            </section>

            {/* AI Message / Guide */}
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
                                    // preselect top 1-3 matched menus for this restaurant
                                    const picks = (r.matchedMenus || []).slice(0, 3);
                                    setSelectedMenus(picks);
                                    setShowActionMenu(true);
                                    setAiMessage(`✅ Vous avez sélectionné ${r.nom}. Choisissez une action ci-dessous.`);
                                }}
                            >
                                <div className="saas-menu-image">
                                    <img src={r.banner || r.logo || "/gere.jpg"} alt={r.nom} />
                                </div>
                                <div className="saas-menu-info">
                                    <h3>{r.nom}</h3>
                                    <p className="saas-restaurant-name">{r.type_cuisine} • {r.ville} {r.distance ? `• ${r.distance} km` : ''}</p>
                                    <div className="saas-category-name">
                                        {r.matchedMenus && r.matchedMenus.length > 0 ? (
                                            <>
                                                <strong>Plats correspondants: </strong>
                                                {(r.matchedMenus || []).slice(0,3).map((m) => m.title).join(', ')}
                                            </>
                                        ) : (
                                            <span>Voir le menu</span>
                                        )}
                                    </div>
                                    <div className="saas-menu-footer">
                                        <span className="saas-price">{r.delivery_available ? 'Livraison' : 'Sur place'}</span>
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

            {/* Action Menu - Appears when a restaurant is selected */}
            {showActionMenu && selectedRestaurant && (
                <section className="saas-action-panel">
                    <h3>Vous avez sélectionné {selectedRestaurant.nom}</h3>
                    {selectedRestaurant.matchedMenus && selectedRestaurant.matchedMenus.length > 0 && (
                        <p className="saas-action-note">Plats suggérés : {selectedRestaurant.matchedMenus.slice(0, 3).map((m) => m.title).join(', ')}</p>
                    )}
                    <div className="saas-action-buttons">
                        <button
                            className="saas-action-btn saas-btn-order"
                            onClick={() => handleAction("order")}
                        >
                            🛒 Commander en ligne
                        </button>
                        <button
                            className="saas-action-btn saas-btn-reservation"
                            onClick={() => handleAction("reservation")}
                        >
                            📅 Réserver une table
                        </button>
                        <button
                            className="saas-action-btn saas-btn-feedback"
                            onClick={() => handleAction("feedback")}
                        >
                            ⭐ Laisser un avis
                        </button>
                        <button
                            className="saas-action-btn saas-btn-reclamation"
                            onClick={() => handleAction("reclamation")}
                        >
                            📝 Faire une réclamation
                        </button>
                    </div>
                </section>
            )}
        </main>
    );
}
