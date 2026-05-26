import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../../Api/api";
import {
  FaArrowLeft,
  FaShoppingCart,
  FaCreditCard,
  FaWifi,
  FaTimesCircle,
  FaDownload,
  FaCheckCircle,
} from "react-icons/fa";
import html2canvas from "html2canvas";

const safeParseMenu = (menu) => {
  if (!menu) {
    return [];
  }

  if (Array.isArray(menu)) {
    return menu;
  }

  try {
    const parsedMenu = JSON.parse(menu);
    return Array.isArray(parsedMenu) ? parsedMenu : [];
  } catch (error) {
    console.error("Erreur lors du parsing du menu de commande:", error);
    return [];
  }
};

const Commandelist = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancellingOrderId, setCancellingOrderId] = useState(null);
  const [savingOrderId, setSavingOrderId] = useState(null);
  const [saveSuccessNotification, setSaveSuccessNotification] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });
  const [currentPage, setCurrentPage] = useState(1);

  const ordersPerPage = 5;
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.id ?? user?.id_user;

  useEffect(() => {
    if (!userId) {
      navigate("/login");
      return;
    }

    const fetchOrders = async () => {
      try {
        const response = await api.get(`/orders/user/${userId}`);
        const ordersWithParsedMenu = response.data
          .map((order) => ({
            ...order,
            menu: safeParseMenu(order.menu),
            ticketRef: React.createRef(),
          }))
          .reverse();

        setOrders(ordersWithParsedMenu);
      } catch (err) {
        console.error("Erreur lors de la recuperation des commandes:", err);
        setOrders([]);
        setError(null);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [navigate, userId]);

  const totalPages = Math.max(1, Math.ceil(orders.length / ordersPerPage));
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleCancelOrder = (orderId) => {
    setOrderToCancel(orderId);
    setShowCancelConfirm(true);
  };

  const confirmCancellation = async () => {
    if (!orderToCancel) return;

    setShowCancelConfirm(false);
    setCancellingOrderId(orderToCancel);

    try {
      await api.delete(`/orders/${orderToCancel}`);

      setOrders((prevOrders) => {
        const updatedOrders = prevOrders.filter(
          (order) => order.id_order !== orderToCancel
        );
        const updatedTotalPages = Math.max(
          1,
          Math.ceil(updatedOrders.length / ordersPerPage)
        );

        if (currentPage > updatedTotalPages) {
          setCurrentPage(updatedTotalPages);
        }

        return updatedOrders;
      });

      setNotification({
        show: true,
        message: "Commande supprimee avec succes !",
        type: "success",
      });

      setTimeout(() => {
        setNotification({ show: false, message: "", type: "" });
      }, 5000);
    } catch (err) {
      console.error("Erreur lors de la suppression de la commande:", err);
      setNotification({
        show: true,
        message: "Erreur lors de la suppression de la commande.",
        type: "error",
      });

      setTimeout(() => {
        setNotification({ show: false, message: "", type: "" });
      }, 5000);
    } finally {
      setCancellingOrderId(null);
      setOrderToCancel(null);
    }
  };

  const cancelCancellation = () => {
    setShowCancelConfirm(false);
    setOrderToCancel(null);
  };

  const handleSaveAsImage = async (order, ticketElementRef) => {
    if (!ticketElementRef || !ticketElementRef.current) {
      console.error("Reference a l'element du ticket introuvable.");
      return;
    }

    setSavingOrderId(order.id_order);

    try {
      const canvas = await html2canvas(ticketElementRef.current, {
        scale: 2,
        backgroundColor: "#ffffff",
        logging: false,
      });
      const imgData = canvas.toDataURL("image/png", 1.0);
      const link = document.createElement("a");

      link.href = imgData;
      link.download = `commande-${order.id_order || "ticket"}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setSaveSuccessNotification(true);
      setTimeout(() => {
        setSaveSuccessNotification(false);
      }, 5000);
    } catch (saveError) {
      console.error("Erreur lors de la generation de l'image:", saveError);
      alert("Erreur lors de la sauvegarde du ticket.");
    } finally {
      setSavingOrderId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="w-16 h-16 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
        <p className="mt-4 text-blue-500 font-semibold">Chargement des commandes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="text-red-600 text-lg font-semibold">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        {notification.show && (
          <div className="fixed top-4 right-4 z-50 animate-fade-in-down w-[90%] sm:w-auto">
            <div
              className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-white ${
                notification.type === "success" ? "bg-green-500" : "bg-red-500"
              }`}
            >
              {notification.type === "success" ? (
                <FaCheckCircle size={20} />
              ) : (
                <FaTimesCircle size={20} />
              )}
              <span className="text-sm">{notification.message}</span>
            </div>
          </div>
        )}

        {saveSuccessNotification && (
          <div className="fixed top-4 right-4 z-50 animate-fade-in-down w-[90%] sm:w-auto">
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-white bg-green-500">
              <FaCheckCircle size={20} />
              <span className="text-sm">Ticket sauvegarde avec succes !</span>
            </div>
          </div>
        )}

        <button
          onClick={() => navigate("/user/client")}
          className="flex items-center gap-2 px-3 py-2 mb-6 bg-gray-200 text-gray-700 rounded-lg shadow hover:bg-gray-300 transition-all text-sm sm:text-base"
        >
          <FaArrowLeft /> Retour a l'accueil
        </button>

        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3">
          <FaShoppingCart className="text-blue-500" /> Mes Commandes
        </h1>

        {orders.length === 0 ? (
          <div className="text-center py-10 text-gray-600">
            <p className="text-lg">Vous n'avez pas encore passe de commandes.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {currentOrders.map((order) => (
              <div
                key={order.id_order}
                className="bg-white rounded-xl shadow-md p-4 sm:p-6 border border-gray-200"
              >
                <div className="flex justify-between items-center mb-4 border-b pb-3">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
                    Commande #{order.id_order}
                  </h2>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      order.status === "confirmÃ©"
                        ? "bg-green-100 text-green-800"
                        : order.status === "annulÃ©"
                        ? "bg-red-100 text-red-800"
                        : order.status === "livrÃ©"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {order.status}
                  </span>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm text-gray-700">
                    <span>Total:</span>
                    <span className="font-semibold text-blue-600">
                      {parseFloat(order.total_price).toFixed(2)} DH
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-700">
                    <span>Methode de paiement:</span>
                    <span className="font-semibold text-gray-800 flex items-center gap-1">
                      {order.payment_method === "NFC" ? <FaWifi /> : <FaCreditCard />}
                      {order.payment_method}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-700">
                    <span>Date:</span>
                    <span className="font-semibold text-gray-800">
                      {new Date(order.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="text-md font-semibold text-gray-800 mb-3">Articles:</h3>
                  <ul className="space-y-2">
                    {order.menu.map((item, itemIndex) => (
                      <li
                        key={itemIndex}
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

                <div className="mt-4 flex justify-end gap-3">
                  {order.status === "en attente" && (
                    <button
                      onClick={() => handleCancelOrder(order.id_order)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-md text-xs disabled:opacity-50"
                      disabled={cancellingOrderId === order.id_order}
                    >
                      <FaTimesCircle size={14} />{" "}
                      {cancellingOrderId === order.id_order ? "Suppression..." : "Supprimer"}
                    </button>
                  )}
                  <button
                    onClick={() => handleSaveAsImage(order, order.ticketRef)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md text-xs"
                    disabled={savingOrderId === order.id_order}
                  >
                    <FaDownload size={14} />{" "}
                    {savingOrderId === order.id_order ? "Sauvegarde..." : "Sauvegarder Image"}
                  </button>
                </div>

                <div style={{ position: "absolute", left: "-9999px" }}>
                  <div
                    ref={order.ticketRef}
                    className="ticket-printable p-6 bg-white border border-gray-300 rounded-lg shadow-lg w-80"
                  >
                    <div className="header text-center mb-6 pb-4 border-b-2 border-dashed border-gray-300">
                      <div className="restaurant-name text-2xl font-bold text-blue-700 mb-1">
                        Foody
                      </div>
                      <p className="text-sm text-gray-600">
                        Ticket de Commande #{order.id_order}
                      </p>
                      <p className="text-xs text-gray-500">
                        Date: {new Date(order.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="body space-y-4">
                      <div className="info-row flex justify-between text-sm text-gray-700 border-b border-gray-200 pb-2">
                        <span>Methode de paiement:</span>
                        <span className="font-semibold text-gray-800">
                          {order.payment_method}
                        </span>
                      </div>

                      <div className="section-title text-sm font-semibold text-gray-800 mb-2 border-b border-gray-200 pb-1">
                        Articles:
                      </div>
                      <ul className="space-y-2">
                        {order.menu.map((item, itemIndex) => (
                          <li
                            key={itemIndex}
                            className="item flex justify-between text-sm text-gray-700 bg-gray-50 p-2 rounded"
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

                      <div className="total text-lg font-bold text-blue-700 mt-4 pt-4 border-t-2 border-dashed border-gray-300 text-right">
                        Total: {parseFloat(order.total_price).toFixed(2)} DH
                      </div>
                    </div>
                    <div className="footer text-center mt-6 pt-4 border-t border-gray-300 text-xs text-gray-600">
                      <p className="font-semibold text-gray-800 mb-1">
                        Merci de votre commande!
                      </p>
                      <p>Presentez ce ticket pour recuperer votre commande</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {orders.length > ordersPerPage && (
          <div className="flex justify-center mt-8">
            <nav aria-label="Pagination">
              <ul className="inline-flex items-center -space-x-px">
                <li>
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-2 ml-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Precedent
                  </button>
                </li>

                {[...Array(totalPages).keys()].map((number) => (
                  <li key={number + 1}>
                    <button
                      onClick={() => paginate(number + 1)}
                      className={`px-3 py-2 leading-tight ${
                        currentPage === number + 1
                          ? "text-blue-600 bg-blue-50 hover:bg-blue-100 hover:text-blue-700"
                          : "text-gray-500 bg-white hover:bg-gray-100 hover:text-gray-700"
                      } border border-gray-300`}
                    >
                      {number + 1}
                    </button>
                  </li>
                ))}

                <li>
                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Suivant
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        )}

        {showCancelConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 shadow-xl max-w-sm w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Confirmer la suppression
              </h3>
              <p className="text-gray-600 mb-6">
                Etes-vous sur de vouloir supprimer cette commande ? Cette action est
                irreversible.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={cancelCancellation}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                >
                  Non
                </button>
                <button
                  onClick={confirmCancellation}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
                >
                  Oui, supprimer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Commandelist;
