import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiTrash2, FiMapPin, FiCoffee } from "react-icons/fi";
import api from "../../../../Api/api";
import "./AdminMenuGestion.css";

const AdminMenuGestion = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState("restaurants"); // "restaurants" or "menus"
  const [restaurants, setRestaurants] = useState([]);
  const [menus, setMenus] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Restaurant form state
  const [restaurantForm, setRestaurantForm] = useState({
    nom: "",
    slug: "",
    description: "",
    type_cuisine: "",
    adresse: "",
    ville: "",
    telephone: "",
    email: "",
    latitude: "",
    longitude: "",
    logo: null,
    banner: null,
    delivery_available: false,
    is_halal: false,
    is_vegetarian_friendly: false,
    minimum_order_price: "",
  });

  // Menu form state
  const [menuForm, setMenuForm] = useState({
    title: "",
    slug: "",
    description: "",
    price: "",
    image: null,
    category_id: "",
    restaurant_id: "",
    is_available: true,
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    if (!token || !user) {
      navigate("/login");
    } else {
      loadRestaurants();
      loadMenusAndCategories();
    }
  }, [navigate]);

  const loadRestaurants = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/restaurants?per_page=100");
      setRestaurants(data.data || []);
    } catch (err) {
      setError("Erreur lors du chargement des restaurants");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadMenusAndCategories = async () => {
    try {
      const { data } = await api.get("/menus?per_page=100");
      setMenus(data.menus?.data || []);
      setCategories(data.categories || []);
    } catch (err) {
      console.error("Erreur lors du chargement des menus", err);
    }
  };

  const handleAddRestaurant = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const formData = new FormData();

      // Champs texte
      if (restaurantForm.nom) formData.append("nom", restaurantForm.nom);
      if (restaurantForm.slug) formData.append("slug", restaurantForm.slug);
      if (restaurantForm.description) formData.append("description", restaurantForm.description);
      if (restaurantForm.type_cuisine) formData.append("type_cuisine", restaurantForm.type_cuisine);
      if (restaurantForm.adresse) formData.append("adresse", restaurantForm.adresse);
      if (restaurantForm.ville) formData.append("ville", restaurantForm.ville);
      if (restaurantForm.telephone) formData.append("telephone", restaurantForm.telephone);
      if (restaurantForm.email) formData.append("email", restaurantForm.email);
      if (restaurantForm.latitude) formData.append("latitude", parseFloat(restaurantForm.latitude));
      if (restaurantForm.longitude) formData.append("longitude", parseFloat(restaurantForm.longitude));
      if (restaurantForm.minimum_order_price) formData.append("minimum_order_price", parseFloat(restaurantForm.minimum_order_price));

      // Booléens → 1 ou 0
      formData.append("delivery_available", restaurantForm.delivery_available ? 1 : 0);
      formData.append("is_halal", restaurantForm.is_halal ? 1 : 0);
      formData.append("is_vegetarian_friendly", restaurantForm.is_vegetarian_friendly ? 1 : 0);
      formData.append("status", "active");
      formData.append("abonnement_plan", "basic");

      // Fichiers — seulement si sélectionnés
      if (restaurantForm.logo instanceof File) formData.append("logo", restaurantForm.logo);
      if (restaurantForm.banner instanceof File) formData.append("banner", restaurantForm.banner);

      const token = localStorage.getItem("token");
      await api.post("/restaurants", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setSuccess("Restaurant ajouté avec succès!");
      setRestaurantForm({
        nom: "",
        slug: "",
        description: "",
        type_cuisine: "",
        adresse: "",
        ville: "",
        telephone: "",
        email: "",
        latitude: "",
        longitude: "",
        logo: null,
        banner: null,
        delivery_available: false,
        is_halal: false,
        is_vegetarian_friendly: false,
        minimum_order_price: "",
      });
      setTimeout(() => {
        setSuccess(null);
        loadRestaurants();
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'ajout du restaurant");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMenu = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const formData = new FormData();
      Object.keys(menuForm).forEach((key) => {
        if (menuForm[key] !== null && menuForm[key] !== "") {
          formData.append(key, menuForm[key]);
        }
      });

      const token = localStorage.getItem("token");
      await api.post("/menus", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setSuccess("Menu ajouté avec succès!");
      setMenuForm({
        title: "",
        slug: "",
        description: "",
        price: "",
        image: null,
        category_id: "",
        restaurant_id: "",
        is_available: true,
      });
      setTimeout(() => {
        setSuccess(null);
        loadMenusAndCategories();
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'ajout du menu");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteRestaurant = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce restaurant?")) {
      try {
        const token = localStorage.getItem("token");
        await api.delete(`/restaurants/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSuccess("Restaurant supprimé!");
        setTimeout(() => {
          setSuccess(null);
          loadRestaurants();
        }, 1500);
      } catch (err) {
        setError("Erreur lors de la suppression");
        console.error(err);
      }
    }
  };

  const deleteMenu = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce menu?")) {
      try {
        const token = localStorage.getItem("token");
        await api.delete(`/menus/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSuccess("Menu supprimé!");
        setTimeout(() => {
          setSuccess(null);
          loadMenusAndCategories();
        }, 1500);
      } catch (err) {
        setError("Erreur lors de la suppression");
        console.error(err);
      }
    }
  };

  return (
    <div className="admin-menu-gestion">
      {/* Messages */}
      {success && <div className="alert alert-success">{success}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {/* Tabs */}
      <div className="tabs-header">
        <button
          className={`tab-btn ${tab === "restaurants" ? "active" : ""}`}
          onClick={() => setTab("restaurants")}
        >
          <FiMapPin /> Restaurants
        </button>
        <button
          className={`tab-btn ${tab === "menus" ? "active" : ""}`}
          onClick={() => setTab("menus")}
        >
          <FiCoffee /> Menus & Plats
        </button>
      </div>

      {/* RESTAURANTS TAB */}
      {tab === "restaurants" && (
        <div className="tab-content">
          <h2>Ajouter un Restaurant</h2>
          <form onSubmit={handleAddRestaurant} className="form-grid">
            <input
              type="text"
              placeholder="Nom du restaurant"
              value={restaurantForm.nom}
              onChange={(e) =>
                setRestaurantForm({ ...restaurantForm, nom: e.target.value })
              }
              required
            />
            <input
              type="text"
              placeholder="Slug (ex: mon-restaurant)"
              value={restaurantForm.slug}
              onChange={(e) =>
                setRestaurantForm({ ...restaurantForm, slug: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="Type de cuisine (ex: Italienne, Asiatique)"
              value={restaurantForm.type_cuisine}
              onChange={(e) =>
                setRestaurantForm({
                  ...restaurantForm,
                  type_cuisine: e.target.value,
                })
              }
              required
            />
            <input
              type="text"
              placeholder="Adresse"
              value={restaurantForm.adresse}
              onChange={(e) =>
                setRestaurantForm({ ...restaurantForm, adresse: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="Ville"
              value={restaurantForm.ville}
              onChange={(e) =>
                setRestaurantForm({ ...restaurantForm, ville: e.target.value })
              }
              required
            />
            <input
              type="number"
              placeholder="Latitude (ex: 36.8065)"
              step="any"
              value={restaurantForm.latitude}
              onChange={(e) =>
                setRestaurantForm({
                  ...restaurantForm,
                  latitude: e.target.value,
                })
              }
            />
            <input
              type="number"
              placeholder="Longitude (ex: 10.1956)"
              step="any"
              value={restaurantForm.longitude}
              onChange={(e) =>
                setRestaurantForm({
                  ...restaurantForm,
                  longitude: e.target.value,
                })
              }
            />
            <input
              type="tel"
              placeholder="Téléphone"
              value={restaurantForm.telephone}
              onChange={(e) =>
                setRestaurantForm({
                  ...restaurantForm,
                  telephone: e.target.value,
                })
              }
            />
            <input
              type="email"
              placeholder="Email"
              value={restaurantForm.email}
              onChange={(e) =>
                setRestaurantForm({ ...restaurantForm, email: e.target.value })
              }
            />
            <input
              type="number"
              placeholder="Commande minimale"
              step="0.01"
              value={restaurantForm.minimum_order_price}
              onChange={(e) =>
                setRestaurantForm({
                  ...restaurantForm,
                  minimum_order_price: e.target.value,
                })
              }
            />
            <textarea
              placeholder="Description du restaurant"
              value={restaurantForm.description}
              onChange={(e) =>
                setRestaurantForm({
                  ...restaurantForm,
                  description: e.target.value,
                })
              }
              rows="3"
            />
            <label>
              <input
                type="checkbox"
                checked={restaurantForm.delivery_available}
                onChange={(e) =>
                  setRestaurantForm({
                    ...restaurantForm,
                    delivery_available: e.target.checked,
                  })
                }
              />
              Livraison disponible
            </label>
            <label>
              <input
                type="checkbox"
                checked={restaurantForm.is_halal}
                onChange={(e) =>
                  setRestaurantForm({
                    ...restaurantForm,
                    is_halal: e.target.checked,
                  })
                }
              />
              Halal
            </label>
            <label>
              <input
                type="checkbox"
                checked={restaurantForm.is_vegetarian_friendly}
                onChange={(e) =>
                  setRestaurantForm({
                    ...restaurantForm,
                    is_vegetarian_friendly: e.target.checked,
                  })
                }
              />
              Végétarien friendly
            </label>
            <input
              type="file"
              placeholder="Logo"
              onChange={(e) =>
                setRestaurantForm({
                  ...restaurantForm,
                  logo: e.target.files?.[0] || null,
                })
              }
              accept="image/*"
            />
            <input
              type="file"
              placeholder="Bannière"
              onChange={(e) =>
                setRestaurantForm({
                  ...restaurantForm,
                  banner: e.target.files?.[0] || null,
                })
              }
              accept="image/*"
            />
            <button type="submit" disabled={loading}>
              {loading ? "Ajout en cours..." : "Ajouter le Restaurant"}
            </button>
          </form>

          <h3>Liste des Restaurants</h3>
          <div className="list-container">
            {restaurants.map((r) => (
              <div key={r.id} className="list-item">
                <div>
                  <strong>{r.nom}</strong> - {r.type_cuisine} ({r.ville})
                  {r.latitude && r.longitude && (
                    <p className="text-sm text-gray-600">
                      📍 {r.latitude.toFixed(4)}, {r.longitude.toFixed(4)}
                    </p>
                  )}
                </div>
                <button onClick={() => deleteRestaurant(r.id)} className="btn-delete">
                  <FiTrash2 /> Supprimer
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MENUS TAB */}
      {tab === "menus" && (
        <div className="tab-content">
          <h2>Ajouter un Menu / Plat</h2>
          <form onSubmit={handleAddMenu} className="form-grid">
            <select
              value={menuForm.restaurant_id}
              onChange={(e) =>
                setMenuForm({ ...menuForm, restaurant_id: e.target.value })
              }
              required
            >
              <option value="">-- Sélectionner un restaurant --</option>
              {restaurants.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.nom} ({r.ville})
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Titre du plat"
              value={menuForm.title}
              onChange={(e) =>
                setMenuForm({ ...menuForm, title: e.target.value })
              }
              required
            />
            <input
              type="text"
              placeholder="Slug du plat"
              value={menuForm.slug}
              onChange={(e) =>
                setMenuForm({ ...menuForm, slug: e.target.value })
              }
            />
            <textarea
              placeholder="Description du plat"
              value={menuForm.description}
              onChange={(e) =>
                setMenuForm({ ...menuForm, description: e.target.value })
              }
              rows="2"
            />
            <input
              type="number"
              placeholder="Prix"
              step="0.01"
              value={menuForm.price}
              onChange={(e) =>
                setMenuForm({ ...menuForm, price: e.target.value })
              }
              required
            />
            <select
              value={menuForm.category_id}
              onChange={(e) =>
                setMenuForm({ ...menuForm, category_id: e.target.value })
              }
              required
            >
              <option value="">-- Sélectionner une catégorie --</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
            <input
              type="file"
              placeholder="Image du plat"
              onChange={(e) =>
                setMenuForm({
                  ...menuForm,
                  image: e.target.files?.[0] || null,
                })
              }
              accept="image/*"
              required
            />
            <label>
              <input
                type="checkbox"
                checked={menuForm.is_available}
                onChange={(e) =>
                  setMenuForm({
                    ...menuForm,
                    is_available: e.target.checked,
                  })
                }
              />
              Disponible
            </label>
            <button type="submit" disabled={loading} className="btn-submit">
              {loading ? "Ajout en cours..." : "Ajouter le Menu"}
            </button>
          </form>

          <h3>Liste des Menus</h3>
          <div className="list-container">
            {menus.map((m) => (
              <div key={m.id} className="list-item">
                <div>
                  <strong>{m.title}</strong> - {m.price}dt
                  <p className="text-sm text-gray-600">
                    Resto: {m.restaurant?.nom || "N/A"} | Cat: {m.category?.title || "N/A"}
                  </p>
                </div>
                <button onClick={() => deleteMenu(m.id)} className="btn-delete">
                  <FiTrash2 /> Supprimer
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMenuGestion;
