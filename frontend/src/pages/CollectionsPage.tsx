import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Gift, ChevronRight, SlidersHorizontal, X } from 'lucide-react';
import api from '../api';
import type { Category, Product, ProductsResponse } from '../api';
import ProductCard from '../components/ProductCard';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function CollectionsPage() {
  const [params, setParams] = useSearchParams();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingCats, setLoadingCats] = useState(true);
  const [loadingProds, setLoadingProds] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const categoryId = params.get('categoryId') || '';
  const search = params.get('search') || '';
  const type = params.get('type') || '';
  const page = parseInt(params.get('page') || '1');

  // Fetch categories once
  useEffect(() => {
    api.get('/categories').then(r => {
      setCategories(r.data);
      setLoadingCats(false);
    }).catch(() => setLoadingCats(false));
  }, []);

  // Fetch products whenever filters change
  const fetchProducts = useCallback(() => {
    setLoadingProds(true);
    const qp = new URLSearchParams();
    qp.set('page', page.toString());
    qp.set('pageSize', '12');
    if (categoryId) qp.set('categoryId', categoryId);
    if (search) qp.set('search', search);
    if (type) qp.set('search', type); // map type param to search for keyword matching

    api.get<ProductsResponse>(`/products?${qp.toString()}`).then(r => {
      setProducts(r.data.data);
      setTotalItems(r.data.totalItems);
      setTotalPages(r.data.totalPages);
      setLoadingProds(false);
    }).catch(() => setLoadingProds(false));
  }, [categoryId, search, type, page]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const activeCategoryName = categories.find(c => c.id === categoryId)?.name;

  const setFilter = (key: string, val: string) => {
    const next = new URLSearchParams(params);
    if (val) next.set(key, val); else next.delete(key);
    next.delete('page');
    setParams(next);
  };

  const clearFilters = () => setParams(new URLSearchParams());

  const pageTitle = search ? `Results for "${search}"` : type ? type.charAt(0).toUpperCase() + type.slice(1) : activeCategoryName || 'All Collections';

  return (
    <div className="min-h-screen bg-white font-sans">
      <Navbar />

      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b border-gray-100 px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center gap-2 text-xs text-gray-500">
          <Link to="/" className="hover:text-[#e21b5a]">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-900 font-medium">{pageTitle}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10 flex gap-10">
        {/* Sidebar — Category Filters (dynamic from API) */}
        <aside className={`
          fixed md:relative inset-y-0 left-0 z-30 w-72 md:w-56 bg-white md:bg-transparent 
          transform transition-transform md:transform-none shadow-xl md:shadow-none
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          flex-shrink-0 md:block
        `}>
          <div className="p-6 md:p-0">
            <div className="flex justify-between items-center mb-6 md:mb-4">
              <h3 className="font-bold uppercase tracking-widest text-xs text-gray-700">Categories</h3>
              <button className="md:hidden text-gray-400" onClick={() => setSidebarOpen(false)}><X className="w-5 h-5" /></button>
            </div>

            <ul className="space-y-1 text-sm">
              <li>
                <button
                  onClick={() => clearFilters()}
                  className={`w-full text-left py-2 px-3 rounded transition-colors ${!categoryId && !type && !search ? 'bg-[#e21b5a] text-white font-bold' : 'text-gray-600 hover:text-[#e21b5a] hover:bg-gray-50'}`}
                >
                  All Products {!categoryId && !type && !search && <span className="text-xs opacity-70 ml-1">({totalItems})</span>}
                </button>
              </li>
              {loadingCats ? (
                [...Array(5)].map((_, i) => <li key={i}><div className="h-8 bg-gray-100 rounded animate-pulse mb-1"></div></li>)
              ) : (
                categories.map(cat => (
                  <li key={cat.id}>
                    <button
                      onClick={() => { setFilter('categoryId', cat.id); setSidebarOpen(false); }}
                      className={`w-full text-left py-2 px-3 rounded transition-colors ${categoryId === cat.id ? 'bg-[#e21b5a] text-white font-bold' : 'text-gray-600 hover:text-[#e21b5a] hover:bg-gray-50'}`}
                    >
                      {cat.name}
                    </button>
                  </li>
                ))
              )}
            </ul>
          </div>
        </aside>

        {/* Backdrop for mobile sidebar */}
        {sidebarOpen && <div className="fixed inset-0 bg-black/40 z-20 md:hidden" onClick={() => setSidebarOpen(false)} />}

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {/* Page Header */}
          <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-100">
            <div>
              <h1 className="text-2xl md:text-3xl font-serif text-gray-900">{pageTitle}</h1>
              {!loadingProds && <p className="text-sm text-gray-500 mt-1">{totalItems} item{totalItems !== 1 ? 's' : ''}</p>}
            </div>
            <button onClick={() => setSidebarOpen(true)} className="md:hidden flex items-center gap-2 text-sm font-bold text-gray-700 border border-gray-200 px-4 py-2">
              <SlidersHorizontal className="w-4 h-4" /> Filter
            </button>
          </div>

          {/* Active Filters */}
          {(categoryId || search || type) && (
            <div className="flex gap-2 mb-6 flex-wrap">
              {activeCategoryName && (
                <span className="flex items-center gap-1 bg-[#e21b5a]/10 text-[#e21b5a] text-xs font-bold px-3 py-1.5">
                  {activeCategoryName}
                  <button onClick={() => setFilter('categoryId', '')}><X className="w-3 h-3" /></button>
                </span>
              )}
              {search && (
                <span className="flex items-center gap-1 bg-[#e21b5a]/10 text-[#e21b5a] text-xs font-bold px-3 py-1.5">
                  "{search}"
                  <button onClick={() => setFilter('search', '')}><X className="w-3 h-3" /></button>
                </span>
              )}
              {type && (
                <span className="flex items-center gap-1 bg-[#e21b5a]/10 text-[#e21b5a] text-xs font-bold px-3 py-1.5">
                  {type}
                  <button onClick={() => setFilter('type', '')}><X className="w-3 h-3" /></button>
                </span>
              )}
              <button onClick={clearFilters} className="text-xs text-gray-500 underline">Clear All</button>
            </div>
          )}

          {/* Product Grid */}
          {loadingProds ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="space-y-3">
                  <div className="aspect-[4/5] bg-gray-100 animate-pulse"></div>
                  <div className="h-4 bg-gray-100 animate-pulse rounded"></div>
                  <div className="h-3 bg-gray-100 animate-pulse rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-24 bg-gray-50 border border-gray-100">
              <Gift className="w-12 h-12 text-gray-200 mx-auto mb-4" />
              <h3 className="text-xl font-serif text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-500 mb-6">Try a different category or search term.</p>
              <button onClick={clearFilters} className="text-[#e21b5a] font-bold underline text-sm">Clear filters</button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                {products.map((product, i) => (
                  <motion.div key={product.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-16">
                  <button
                    disabled={page === 1}
                    onClick={() => setFilter('page', String(page - 1))}
                    className="px-4 py-2 border border-gray-200 text-sm font-medium disabled:opacity-40 hover:border-gray-400 transition-colors"
                  >
                    Previous
                  </button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setFilter('page', String(i + 1))}
                      className={`w-9 h-9 text-sm font-medium border transition-colors ${page === i + 1 ? 'bg-[#e21b5a] text-white border-[#e21b5a]' : 'border-gray-200 hover:border-gray-400'}`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    disabled={page === totalPages}
                    onClick={() => setFilter('page', String(page + 1))}
                    className="px-4 py-2 border border-gray-200 text-sm font-medium disabled:opacity-40 hover:border-gray-400 transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
}
