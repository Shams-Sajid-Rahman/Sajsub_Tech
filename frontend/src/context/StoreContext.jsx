import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { useToast } from '../hooks/useToast.js';
import { apiDelete, apiGet, apiPatch, apiPost } from '../services/api.js';

export const StoreContext = createContext(null);

// Site content, plus the signed-in customer's cart and wishlist shown in the header.
export function StoreProvider({ children }) {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [site, setSite] = useState({ settings: {}, banners: [] });
  const [siteLoaded, setSiteLoaded] = useState(false);
  const [cart, setCart] = useState(null);
  const [wishlist, setWishlist] = useState([]);
  const isCustomer = user?.role === 'CUSTOMER';

  useEffect(() => {
    apiGet('/site')
      .then(({ data }) => setSite(data))
      .catch(() => {})
      .finally(() => setSiteLoaded(true));
  }, []);

  useEffect(() => {
    if (!isCustomer) {
      setCart(null);
      setWishlist([]);
      return;
    }
    apiGet('/cart').then(({ data }) => setCart(data)).catch(() => {});
    apiGet('/wishlist').then(({ data }) => setWishlist(data)).catch(() => {});
  }, [isCustomer]);

  const requireCustomer = useCallback(() => {
    if (isCustomer) return true;
    if (user) toast.error('Shopping features are for customer accounts.');
    else navigate('/login', { state: { from: location.pathname } });
    return false;
  }, [isCustomer, user, toast, navigate, location.pathname]);

  const addToCart = useCallback(
    async (productId, quantity = 1) => {
      if (!requireCustomer()) return;
      try {
        const { data } = await apiPost('/cart/items', { productId, quantity });
        setCart(data);
        toast.success('Added to cart');
      } catch (error) {
        toast.error(error.message);
      }
    },
    [requireCustomer, toast],
  );

  const toggleWishlist = useCallback(
    async (productId) => {
      if (!requireCustomer()) return;
      const saved = wishlist.some(({ id }) => id === productId);
      try {
        const { data } = saved
          ? await apiDelete(`/wishlist/items/${productId}`)
          : await apiPost('/wishlist/items', { productId });
        setWishlist(data);
        toast.success(saved ? 'Removed from wishlist' : 'Added to wishlist');
      } catch (error) {
        toast.error(error.message);
      }
    },
    [requireCustomer, wishlist, toast],
  );

  const updateCartItem = useCallback(async (productId, quantity) => {
    const { data } = await apiPatch(`/cart/items/${productId}`, { quantity });
    setCart(data);
  }, []);

  const removeCartItem = useCallback(async (productId) => {
    const { data } = await apiDelete(`/cart/items/${productId}`);
    setCart(data);
  }, []);

  const refreshCart = useCallback(async () => {
    const { data } = await apiGet('/cart');
    setCart(data);
  }, []);

  const value = useMemo(
    () => ({
      site,
      siteLoaded,
      cart,
      wishlist,
      isInWishlist: (productId) => wishlist.some(({ id }) => id === productId),
      addToCart,
      toggleWishlist,
      updateCartItem,
      removeCartItem,
      refreshCart,
    }),
    [site, siteLoaded, cart, wishlist, addToCart, toggleWishlist, updateCartItem, removeCartItem, refreshCart],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}
