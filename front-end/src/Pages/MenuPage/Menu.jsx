import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FaUtensils } from 'react-icons/fa';
import api, { storageUrl } from '../../Api/api';

const Menu = () => {
  const [menus, setMenus] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(null);
  const [selectedDish, setSelectedDish] = useState(null);
  const categoryRefs = useRef({});
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  useEffect(() => {
    api.get('/menu')
      .then((response) => {
        setMenus(response.data.menus);
        setCategories(response.data.categories);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  // Scroll to category and highlight if ?category=ID is present
  useEffect(() => {
    const categoryId = searchParams.get('category');
    if (categoryId && categoryRefs.current[categoryId]) {
      setActiveCategory(categoryId);
      setTimeout(() => {
        categoryRefs.current[categoryId].scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }, 100);
    }
  }, [searchParams, categories]);

  useEffect(() => {
    document.body.style.overflow = selectedDish ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedDish]);

  const handleCategoryClick = (categoryId) => {
    setSearchParams({ category: categoryId });
    setActiveCategory(categoryId);
    if (categoryRefs.current[categoryId]) {
      categoryRefs.current[categoryId].scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const openDishModal = (dish) => setSelectedDish(dish);
  const closeDishModal = () => setSelectedDish(null);
  const handleOrder = () => navigate('/user/client/commande');

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl xs:text-3xl font-bold text-center text-blue-700 mb-6 flex items-center justify-center gap-2">
          <FaUtensils className="text-blue-400 text-2xl xs:text-3xl" /> Menu du Restaurant
        </h1>
        <div className="flex gap-2 mb-6 animate-pulse overflow-x-auto w-full px-2">
          {[1,2,3,4].map((i) => (
            <div key={i} className="h-8 xs:h-10 w-24 xs:w-32 bg-blue-100 rounded-full flex-shrink-0" />
          ))}
        </div>
        <div className="space-y-6 w-full max-w-6xl">
          {[1, 2, 3].map((categoryIndex) => (
            <div key={categoryIndex}>
              <div className="h-6 xs:h-8 w-36 xs:w-48 bg-gray-200 rounded-lg animate-pulse opacity-50 mb-3 mx-auto"></div>
              <div className="grid grid-cols-1 gap-4">
                {[1, 2, 3].map((itemIndex) => (
                  <div key={itemIndex} className="bg-white shadow-md rounded-xl overflow-hidden animate-pulse opacity-50">
                    <div className="w-full h-32 xs:h-40 bg-gray-200"></div>
                    <div className="p-3 xs:p-5">
                      <div className="h-5 xs:h-6 w-3/4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 xs:h-5 w-1/4 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 p-3 xs:p-4">
      <h1 className="text-2xl xs:text-3xl sm:text-4xl font-bold text-center text-blue-700 mb-6 xs:mb-8 flex items-center justify-center gap-2 animate-fade-in">
        <FaUtensils className="text-blue-400 text-2xl xs:text-3xl" /> Menu du Restaurant
      </h1>

      {categories.length === 0 ? (
        <div className="flex justify-center items-center h-64 xs:h-96">
          <div className="text-lg xs:text-xl font-semibold text-gray-700 text-center px-4">Aucune catégorie disponible pour le moment.</div>
        </div>
      ) : (
        <div className="flex flex-col gap-6 xs:gap-8">
          {categories.map((category) => (
            <div 
              key={category.id} 
              ref={el => categoryRefs.current[category.id] = el}
              className="transition-all duration-300 animate-fade-in-up"
            >
              <h2
                className={`text-xl xs:text-2xl sm:text-3xl font-bold mt-8 xs:mt-12 mb-4 xs:mb-6 cursor-pointer transition-colors duration-200 flex items-center gap-2 px-3 py-2 rounded-lg w-fit ${
                  activeCategory === category.id.toString() ? 'text-blue-500 bg-blue-100 shadow' : 'text-gray-800 hover:text-blue-600 hover:bg-blue-50'
                }`}
                onClick={() => handleCategoryClick(category.id)}
              >
                <FaUtensils className="text-blue-400 text-lg xs:text-xl" /> {category.title}
              </h2>
              {menus.filter(menu => menu.category_id === category.id).length === 0 ? (
                <div className="flex justify-center items-center mb-4 xs:mb-6">
                  <div className="text-base xs:text-lg text-gray-500">Aucun plat disponible dans cette catégorie.</div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 xs:gap-6">
                  {menus.filter(menu => menu.category_id === category.id).map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => openDishModal(item)}
                      className="group bg-white shadow-lg xs:shadow-xl rounded-xl xs:rounded-2xl overflow-hidden hover:shadow-2xl transition-transform transform hover:scale-[1.02] animate-fade-in-up flex flex-col items-center text-left"
                    >
                      <div className="relative w-full overflow-hidden">
                        <img
                          src={storageUrl(item.image)}
                          alt={item.title}
                          className="w-full h-36 xs:h-40 sm:h-48 object-cover transition duration-500 group-hover:scale-105"
                        />
                      </div>
                      <div className="p-4 xs:p-6 flex flex-col gap-2 w-full items-center">
                        <h3 className="text-lg xs:text-xl font-semibold text-gray-800 text-center">{item.title}</h3>
                        <span className="inline-block bg-green-100 text-green-700 font-bold rounded-full px-3 xs:px-4 py-1 text-base xs:text-lg shadow-sm mt-1 xs:mt-2">{item.price} DH</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      {selectedDish && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 sm:p-6">
          <div
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
            onClick={closeDishModal}
            aria-hidden="true"
          />
          <div className="relative mx-auto w-full max-w-3xl overflow-hidden rounded-[32px] border border-white/10 bg-slate-950 shadow-2xl shadow-black/60 ring-1 ring-white/10">
            <div className="flex min-h-[24rem] max-h-[calc(100vh-3rem)] flex-col overflow-hidden sm:flex-row">
              <div className="relative w-full overflow-hidden sm:w-1/2">
                <img
                  src={storageUrl(selectedDish.image)}
                  alt={selectedDish.title}
                  className="h-48 sm:h-full w-full object-cover brightness-90 transition duration-500"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/95 to-transparent p-6">
                  <p className="text-sm uppercase tracking-[0.24em] text-amber-200/90">Plat du moment</p>
                  <h2 className="mt-2 text-2xl xs:text-3xl font-bold text-white">{selectedDish.title}</h2>
                  <p className="mt-3 inline-flex items-center rounded-full bg-amber-200/10 px-3 py-2 text-sm font-semibold text-amber-100 shadow-sm">{selectedDish.price} DH</p>
                </div>
              </div>
              <div className="flex w-full flex-col justify-between gap-6 overflow-y-auto bg-slate-950 p-6 xs:p-8">
                <div className="space-y-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Détails du plat</p>
                      <h3 className="mt-2 text-xl xs:text-2xl font-semibold text-white">À propos</h3>
                    </div>
                    <button
                      type="button"
                      onClick={closeDishModal}
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-white transition hover:bg-white/10"
                    >
                      Fermer
                    </button>
                  </div>
                  <div className="rounded-3xl border border-white/10 bg-slate-900/90 p-4 shadow-inner shadow-black/20">
                    <p className="text-sm text-slate-400 leading-7">{selectedDish.description || 'Aucune description disponible pour ce plat.'}</p>
                  </div>
                  <div className="rounded-3xl border border-white/10 bg-slate-900/90 p-4 shadow-inner shadow-black/20">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-lg font-semibold text-white">Ingrédients</h4>
                    </div>
                    <p className="mt-3 text-sm text-slate-300 leading-7">
                      {selectedDish.ingredients
                        ? (Array.isArray(selectedDish.ingredients)
                            ? selectedDish.ingredients.join(', ')
                            : selectedDish.ingredients)
                        : selectedDish.description
                          ? selectedDish.description
                          : 'Aucun ingrédient listé.'}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    type="button"
                    onClick={handleOrder}
                    className="inline-flex w-full items-center justify-center rounded-3xl bg-amber-400 px-6 py-3 text-base font-semibold text-slate-950 shadow-lg shadow-amber-400/20 transition hover:bg-amber-300 sm:w-auto"
                  >
                    Commander
                  </button>
                  <button
                    type="button"
                    onClick={closeDishModal}
                    className="inline-flex w-full items-center justify-center rounded-3xl border border-white/10 bg-white/5 px-6 py-3 text-base font-semibold text-white transition hover:bg-white/10 sm:w-auto"
                  >
                    Fermer la fenêtre
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <style>{`
        .animate-fade-in { animation: fadeIn 1s; }
        .animate-fade-in-up { animation: fadeInUp 1s; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default Menu;
