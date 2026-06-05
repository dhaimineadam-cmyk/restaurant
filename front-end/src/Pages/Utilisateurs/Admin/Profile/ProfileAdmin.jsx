import { useState, useEffect } from "react";
import { Camera, CheckCircle2, XCircle, Key, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api, { storageUrl } from "../../../../Api/api";

export default function ProfileAdmin() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({
    name: "",
    num: "",
    address: "",
    email: "",
    image: null,
    preview: null,
    photo: null,
    password: "",
    password_confirmation: ""
  });
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      navigate('/login');
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);
      if (!parsedUser?.id) {
        navigate('/login');
        return;
      }
      fetchUserProfile(parsedUser.id);
    } catch (error) {
      console.error("Erreur lors du parsing de l'utilisateur :", error);
      navigate('/login');
    }
  }, [navigate]);

  const fetchUserProfile = async (id) => {
    try {
      const response = await api.get(`/users/${id}`);
      const user = response.data;
      setUserData((prev) => ({
        ...prev,
        name: user.name || "",
        num: user.num || "",
        address: user.address || "",
        email: user.email || "",
        image: user.image || null,
        preview: user.image ? storageUrl(user.image) : null,
        password: "",
        password_confirmation: ""
      }));
    } catch (error) {
      console.error("Erreur de chargement du profil admin :", error);
      setMessageType("error");
      setMessage("Impossible de charger le profil. Veuillez réessayer plus tard.");
      setTimeout(() => {
        setMessage("");
        setMessageType("");
      }, 4000);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUserData((prev) => ({
        ...prev,
        photo: file,
        preview: URL.createObjectURL(file)
      }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (userData.password && userData.password !== userData.password_confirmation) {
      setMessageType("error");
      setMessage("Le mot de passe et sa confirmation ne correspondent pas.");
      setTimeout(() => {
        setMessage("");
        setMessageType("");
      }, 4000);
      return;
    }

    try {
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      if (!storedUser?.id) {
        navigate('/login');
        return;
      }

      const formData = new FormData();
      formData.append('name', userData.name);
      formData.append('num', userData.num);
      formData.append('address', userData.address || '');
      formData.append('email', userData.email);

      if (userData.photo) {
        formData.append('image', userData.photo);
      }

      if (userData.password) {
        formData.append('password', userData.password);
        formData.append('password_confirmation', userData.password_confirmation);
      }

      const response = await api.put(`/users/${storedUser.id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setMessageType("success");
      setMessage("Votre profil a été mis à jour avec succès !");
      if (response.data?.user) {
        const updatedUser = {
          ...storedUser,
          name: response.data.user.name || userData.name,
          email: response.data.user.email || userData.email,
          num: response.data.user.num || userData.num,
          address: response.data.user.address || userData.address,
          image: response.data.user.image || userData.image
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));
      } else {
        localStorage.setItem("user", JSON.stringify({
          ...storedUser,
          name: userData.name,
          email: userData.email,
          num: userData.num,
          address: userData.address
        }));
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessageType("error");
      setMessage("Une erreur est survenue lors de la mise à jour du profil.");
    } finally {
      setTimeout(() => {
        setMessage("");
        setMessageType("");
      }, 4000);
    }
  };

  const handleBack = () => {
    navigate('/user/admin');
  };

  const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    userData.name || 'Admin'
  )}&background=0D8ABC&color=fff&size=128`;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12">
        <div className="rounded-2xl border border-stone-200 bg-white px-8 py-10 shadow-lg">
          <p className="text-lg font-semibold text-slate-700">Chargement du profil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-slate-900 mb-6">👤 Profil Admin</h2>

      {message && (
        <div className={`fixed top-4 right-4 p-4 rounded-xl shadow-lg transition ${
          messageType === "success" ? "bg-emerald-100 border border-emerald-300 text-emerald-900" : "bg-rose-100 border border-rose-300 text-rose-900"
        }`}>
          <div className="flex items-center gap-2">
            {messageType === "success" ? (
              <CheckCircle2 className="h-5 w-5" />
            ) : (
              <XCircle className="h-5 w-5" />
            )}
            <span className="text-sm font-semibold">{message}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 rounded-3xl bg-white p-8 shadow-xl">
        <div className="flex flex-col gap-6 md:flex-row md:items-center">
          <div className="relative w-28 h-28 rounded-full overflow-hidden border border-slate-200 bg-slate-100">
            <img
              src={userData.preview || defaultAvatar}
              alt="Avatar admin"
              className="h-full w-full object-cover"
            />
            <label className="absolute bottom-0 right-0 flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-white shadow-lg hover:bg-slate-800 transition-colors">
              <Camera size={18} />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoChange}
              />
            </label>
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Compte connecté</p>
            <h3 className="mt-2 text-2xl font-bold text-slate-900">{userData.name || 'Administrateur'}</h3>
            <p className="mt-1 text-sm text-slate-500">Mettez à jour vos informations personnelles et mot de passe.</p>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-700">Nom</span>
            <input
              name="name"
              type="text"
              value={userData.name}
              onChange={handleInputChange}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
              required
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-700">Email</span>
            <input
              name="email"
              type="email"
              value={userData.email}
              onChange={handleInputChange}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
              required
            />
          </label>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-700">Téléphone</span>
            <input
              name="num"
              type="tel"
              value={userData.num}
              onChange={handleInputChange}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
              required
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-700">Adresse</span>
            <input
              name="address"
              type="text"
              value={userData.address}
              onChange={handleInputChange}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
            />
          </label>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-700">Nouveau mot de passe</span>
            <div className="relative">
              <Key className="pointer-events-none absolute left-4 top-4 text-slate-400" size={18} />
              <input
                name="password"
                type="password"
                value={userData.password}
                onChange={handleInputChange}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-12 py-3 text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                placeholder="Laisser vide pour ne pas changer"
              />
            </div>
          </label>

          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-700">Confirmer le mot de passe</span>
            <input
              name="password_confirmation"
              type="password"
              value={userData.password_confirmation}
              onChange={handleInputChange}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
              placeholder="Confirmation"
            />
          </label>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button type="button" onClick={handleBack} className="inline-flex items-center justify-center rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">
            <ArrowLeft className="mr-2" size={18} /> Retour
          </button>
          <button type="submit" className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
            Enregistrer les modifications
          </button>
        </div>
      </form>
    </div>
  );
}
