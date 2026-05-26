import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../../Api/api";
import {
  FaArrowLeft,
  FaCheckCircle,
  FaClock,
  FaShoppingCart,
  FaTimesCircle,
  FaTruck,
  FaUtensils,
} from "react-icons/fa";

const safeParseMenu = (menu) => {
  if (!menu) return [];
  if (Array.isArray(menu)) return menu;

  try {
    const parsed = JSON.parse(menu);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Erreur lors du parsing du menu:", error);
    return [];
  }
};

const statusStyles = {
  "en attente": "bg-yellow-100 text-yellow-800",
  "confirmé": "bg-green-100 text-green-800",
  "confirmée": "bg-green-100 text-green-800",
  "en préparation": "bg-orange-100 text-orange-800",
  "en livraison": "bg-blue-100 text-blue-800",
  "livré": "bg-indigo-100 text-indigo-800",
  "annulé": "bg-red-100 text-red-800",
};

export default function CommandesEnLigne() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/orders?page=1");
      const ordersData = Array.isArray(response.data?.data) ? response.data.data : [];

      setOrders(
        ordersData.map((order) => ({
          ...order,
          menu: safeParseMenu(order.menu),
        }))
      );
    } catch (err) {
      console.error("Erreur lors du chargement des commandes en ligne:", err);
      setError("Erreur lors du chargement des commandes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (!notification.show) return;
    const timer = setTimeout(() => {
      setNotification({ show: false, message: "", type: "" });
    }, 3000);
    return () => clearTimeout(timer);
  }, [notification]);

  const updateOrderStatus = async (orderId, status) => {
    try {
      setUpdatingOrderId(orderId);
      await api.put(`/orderstatus/${orderId}`, { status });

      setOrders((prev) =>
        prev.map((order) =>
          order.id_order === orderId ? { ...order, status } : order
        )
      );

      setNotification({
        show: true,
        message: `Commande #${orderId} mise à jour.`,
        type: "success",
      });
    } catch (err) {
      console.error("Erreur lors de la mise à jour du statut:", err);
      setNotification({
        show: true,
        message: "Erreur lors de la mise à jour du statut.",
        type: "error",
      });
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const renderActions = (order) => {
    if (updatingOrderId === order.id_order) {
      return <span className="text-sm text-gray-500">Mise à jour...</span>;
    }

    if (order.status === "en attente") {
      return (
        <>
          <button
            onClick={() => updateOrderStatus(order.id_order, "confirmé")}
            className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <FaCheckCircle /> Accepter
          </button>
          <button
            onClick={() => updateOrderStatus(order.id_order, "annulé")}
            className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <FaTimesCircle /> Annuler
          </button>
        </>
      );
    }

    if (order.status === "confirmé" || order.status === "confirmée") {
      return (
        <button
          onClick={() => updateOrderStatus(order.id_order, "en préparation")}
          className="flex items-center gap-2 px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
        >
          <FaUtensils /> En préparation
        </button>
      );
    }

    if (order.status === "en préparation") {
      return (
        <button
          onClick={() => updateOrderStatus(order.id_order, "en livraison")}
          className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FaTruck /> En livraison
        </button>
      );
    }

    return <span className="text-sm text-gray-500">Aucune action disponible</span>;
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100">
        <div className="w-16 h-16 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
        <p className="mt-4 text-blue-500 font-semibold">Chargement des commandes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <p className="text-red-500 text-lg font-semibold">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-8">
      <div className="max-w-5xl mx-auto">
        {notification.show && (
          <div className="fixed top-4 right-4 z-50">
            <div
              className={`px-4 py-3 rounded-xl shadow-lg text-white ${
                notification.type === "success" ? "bg-green-500" : "bg-red-500"
              }`}
            >
              {notification.message}
            </div>
          </div>
        )}

        <button
          onClick={() => navigate("/user/servant")}
          className="flex items-center gap-2 px-3 py-2 mb-6 bg-gray-200 text-gray-700 rounded-lg shadow hover:bg-gray-300 transition-all"
        >
          <FaArrowLeft /> Retour
        </button>

        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3">
          <FaShoppingCart className="text-blue-500" /> Commandes en ligne
        </h1>

        {orders.length === 0 ? (
          <div className="text-center py-10 text-gray-600 bg-white rounded-xl shadow">
            <p className="text-lg">Aucune commande en ligne trouvée.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order.id_order}
                className="bg-white rounded-xl shadow-md p-4 sm:p-6 border border-gray-200"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 border-b pb-3">
                  <div>
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
                      Commande #{order.id_order}
                    </h2>
                    <p className="text-sm text-gray-500">
                      Client: {order.user?.name || "Inconnu"}
                    </p>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium w-fit ${
                      statusStyles[order.status] || "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {order.status || "en attente"}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4 text-sm text-gray-700">
                  <div>
                    <span className="font-semibold">Total:</span>{" "}
                    {parseFloat(order.total_price).toFixed(2)} DH
                  </div>
                  <div>
                    <span className="font-semibold">Paiement:</span>{" "}
                    {order.payment_method}
                  </div>
                  <div>
                    <span className="font-semibold">Date:</span>{" "}
                    {new Date(order.created_at).toLocaleString()}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="text-md font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <FaClock className="text-gray-500" /> Articles
                  </h3>
                  <ul className="space-y-2">
                    {order.menu.map((item, index) => (
                      <li
                        key={index}
                        className="flex justify-between text-sm text-gray-700 bg-gray-50 p-2 rounded"
                      >
                        <span>
                          {item.title} x {item.quantity}
                        </span>
                        <span className="font-semibold">
                          {parseFloat(item.total).toFixed(2)} DH
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-4 flex flex-wrap gap-3">
                  {renderActions(order)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
