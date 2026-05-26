import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Clock, MapPin, Star, Truck, Utensils } from "lucide-react";
import api from "../../Api/api";
import "./SaaSExplore.css";

export default function RestaurantPublicPage() {
    const { slug } = useParams();
    const [restaurant, setRestaurant] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get(`/restaurants/${slug}`)
            .then(({ data }) => setRestaurant(data.data || data))
            .finally(() => setLoading(false));
    }, [slug]);

    if (loading) return <main className="saas-market"><div className="saas-loading">Chargement du restaurant...</div></main>;
    if (!restaurant) return <main className="saas-market"><div className="saas-loading">Restaurant introuvable</div></main>;

    const menus = restaurant.menus || [];
    const categories = restaurant.categories || [];

    return (
        <main className="saas-market">
            <section className="restaurant-hero" style={{ backgroundImage: `url(${restaurant.banner || restaurant.logo || "/rapport img.jpg"})` }}>
                <div className="restaurant-hero-content">
                    <img src={restaurant.logo || "/logo192.png"} alt={restaurant.nom} />
                    <div>
                        <h1>{restaurant.nom}</h1>
                        <p>{restaurant.description || `${restaurant.type_cuisine} a ${restaurant.ville}`}</p>
                        <div className="saas-meta-row">
                            <span><Star size={16} /> {restaurant.rating_average || "New"} ({restaurant.reviews_count} avis)</span>
                            <span><MapPin size={16} /> {restaurant.ville}</span>
                            <span><Truck size={16} /> {restaurant.delivery_available ? "Livraison disponible" : "Sur place"}</span>
                        </div>
                    </div>
                </div>
            </section>

            <section className="restaurant-public-grid">
                <aside className="restaurant-info">
                    <h2>Informations</h2>
                    <p><MapPin size={16} /> {restaurant.adresse || restaurant.ville}</p>
                    <p><Utensils size={16} /> {restaurant.type_cuisine}</p>
                    <p><Clock size={16} /> Horaires disponibles sur le dashboard restaurant</p>
                    <div className="saas-category-strip">
                        {categories.map((category) => <span key={category.id}>{category.title}</span>)}
                    </div>
                </aside>

                <div className="restaurant-menu-area">
                    <div className="saas-section-head">
                        <h2>Menu</h2>
                        <span>{menus.length} plats</span>
                    </div>
                    <div className="saas-menu-list">
                        {menus.map((menu) => (
                            <article className="saas-menu-card" key={menu.id}>
                                <img src={menu.image ? `http://localhost:8000/storage/${menu.image}` : "/carte.jpg"} alt={menu.title} />
                                <div>
                                    <h3>{menu.title}</h3>
                                    <p>{menu.description}</p>
                                    <strong>{menu.price} MAD</strong>
                                </div>
                                <span className={menu.is_available ? "is-open" : "is-closed"}>{menu.is_available ? "Disponible" : "Indisponible"}</span>
                            </article>
                        ))}
                    </div>

                    <div className="saas-section-head">
                        <h2>Avis</h2>
                        <span>{restaurant.reviews_count} avis</span>
                    </div>
                    <div className="review-list">
                        {(restaurant.reviews || []).map((review) => (
                            <article key={review.id}>
                                <strong>{review.user?.name || "Client"}</strong>
                                <span><Star size={14} /> {review.rating}/5</span>
                                <p>{review.comment}</p>
                            </article>
                        ))}
                    </div>
                </div>
            </section>
        </main>
    );
}
