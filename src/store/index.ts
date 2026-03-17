import { Product, User, Order, CartItem, ContactMessage, NewsletterSubscription, Review, MonthlyRevenue } from '@/types';

import herbalJuiceImg from '@/assets/products/herbal-juice.jpg';
import supplementImg from '@/assets/products/supplement.jpg';
import immunityImg from '@/assets/products/immunity.jpg';
import ayurvedicPowderImg from '@/assets/products/ayurvedic-powder.jpg';
import skincareImg from '@/assets/products/skincare.jpg';
import herbalTeaImg from '@/assets/products/herbal-tea.jpg';
import honeyImg from '@/assets/products/honey.jpg';
import ashwagandhaImg from '@/assets/products/ashwagandha.jpg';

const KEYS = {
  PRODUCTS: 'naturo_products',
  USERS: 'naturo_users',
  ORDERS: 'naturo_orders',
  CART: 'naturo_cart',
  CURRENT_USER: 'naturo_current_user',
  AUTH_SESSION: 'naturo_auth_session',
  CONTACTS: 'naturo_contacts',
  NEWSLETTER: 'naturo_newsletter',
  REVIEWS: 'naturo_reviews',
  MONTHLY_REVENUE: 'naturo_monthly_revenue',
};

const defaultProducts: Product[] = [
  {
    id: '1', name: 'Organic Aloe Vera Juice', description: 'Pure aloe vera juice extracted from organically grown plants. Supports digestion and skin health.',
    price: 349, originalPrice: 449, category: 'Herbal Juices', image: herbalJuiceImg.src,
    benefits: ['Improves digestion', 'Boosts immunity', 'Hydrates skin', 'Detoxifies body'],
    ingredients: ['Organic Aloe Vera Extract', 'Filtered Water', 'Citric Acid'],
    usage: 'Take 30ml twice daily before meals, diluted with water.', rating: 4.5, reviews: 128, inStock: true, featured: true, bestSeller: true, createdAt: new Date().toISOString(),
  },
  {
    id: '2', name: 'Ashwagandha Capsules', description: 'Premium ashwagandha root extract capsules for stress relief and vitality.',
    price: 499, originalPrice: 599, category: 'Natural Supplements', image: supplementImg.src,
    benefits: ['Reduces stress & anxiety', 'Boosts energy levels', 'Improves sleep quality', 'Enhances focus'],
    ingredients: ['Ashwagandha Root Extract 500mg', 'Vegetable Cellulose Capsule'],
    usage: 'Take 1 capsule twice daily with warm water after meals.', rating: 4.7, reviews: 256, inStock: true, featured: true, bestSeller: true, createdAt: new Date().toISOString(),
  },
  {
    id: '3', name: 'Turmeric Immunity Booster', description: 'Golden turmeric blend with black pepper for maximum absorption and immunity support.',
    price: 399, originalPrice: 499, category: 'Immunity Boosters', image: immunityImg.src,
    benefits: ['Strengthens immunity', 'Anti-inflammatory', 'Rich in antioxidants', 'Supports joint health'],
    ingredients: ['Organic Turmeric', 'Black Pepper Extract', 'Ginger Root'],
    usage: 'Mix 1 teaspoon in warm milk or water. Take once daily.', rating: 4.6, reviews: 189, inStock: true, featured: true, bestSeller: false, createdAt: new Date().toISOString(),
  },
  {
    id: '4', name: 'Triphala Churna', description: 'Traditional Ayurvedic powder blend of three fruits for digestive wellness.',
    price: 249, originalPrice: 329, category: 'Ayurvedic Powders', image: ayurvedicPowderImg.src,
    benefits: ['Aids digestion', 'Natural detox', 'Improves metabolism', 'Supports eye health'],
    ingredients: ['Amla', 'Haritaki', 'Bibhitaki'],
    usage: 'Mix 1 teaspoon in warm water before bedtime.', rating: 4.4, reviews: 312, inStock: true, featured: false, bestSeller: true, createdAt: new Date().toISOString(),
  },
  {
    id: '5', name: 'Kumkumadi Face Cream', description: 'Luxurious Ayurvedic face cream with saffron and herbs for radiant skin.',
    price: 699, originalPrice: 899, category: 'Natural Skincare', image: skincareImg.src,
    benefits: ['Brightens complexion', 'Reduces dark spots', 'Anti-aging', 'Deep moisturizing'],
    ingredients: ['Saffron Extract', 'Almond Oil', 'Sandalwood', 'Turmeric'],
    usage: 'Apply a small amount on face and neck after cleansing. Use twice daily.', rating: 4.8, reviews: 97, inStock: true, featured: true, bestSeller: true, createdAt: new Date().toISOString(),
  },
  {
    id: '6', name: 'Tulsi Green Tea', description: 'Refreshing blend of holy basil and green tea leaves for daily wellness.',
    price: 299, originalPrice: 379, category: 'Herbal Juices', image: herbalTeaImg.src,
    benefits: ['Boosts metabolism', 'Rich in antioxidants', 'Calms the mind', 'Supports respiratory health'],
    ingredients: ['Green Tea Leaves', 'Tulsi (Holy Basil)', 'Lemongrass'],
    usage: 'Steep 1 tea bag in hot water for 3-5 minutes. Enjoy warm.', rating: 4.3, reviews: 145, inStock: true, featured: false, bestSeller: false, createdAt: new Date().toISOString(),
  },
  {
    id: '7', name: 'Raw Forest Honey', description: 'Unprocessed wild honey sourced from pristine forests. Pure and natural.',
    price: 549, originalPrice: 649, category: 'Natural Supplements', image: honeyImg.src,
    benefits: ['Natural sweetener', 'Antibacterial properties', 'Soothes throat', 'Energy booster'],
    ingredients: ['100% Raw Unprocessed Honey'],
    usage: 'Take 1-2 teaspoons daily or mix with warm water and lemon.', rating: 4.9, reviews: 203, inStock: true, featured: true, bestSeller: true, createdAt: new Date().toISOString(),
  },
  {
    id: '8', name: 'Ashwagandha Root Powder', description: 'Pure ashwagandha root powder for holistic wellness and vitality.',
    price: 349, originalPrice: 449, category: 'Ayurvedic Powders', image: ashwagandhaImg.src,
    benefits: ['Adaptogenic herb', 'Supports muscle strength', 'Improves stamina', 'Balances hormones'],
    ingredients: ['100% Organic Ashwagandha Root Powder'],
    usage: 'Mix 1/2 teaspoon with warm milk. Take before bedtime.', rating: 4.6, reviews: 167, inStock: true, featured: false, bestSeller: true, createdAt: new Date().toISOString(),
  },
];

const defaultAdmin: User = {
  id: 'admin-1',
  name: 'Admin',
  email: 'admin@naturo.com',
  phone: '9607555963',
  password: 'admin123',
  role: 'admin',
  createdAt: new Date().toISOString(),
};

function getItem<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}

function setItem<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function initStore() {
  if (!localStorage.getItem(KEYS.PRODUCTS)) setItem(KEYS.PRODUCTS, defaultProducts);
  const users = getItem<User[]>(KEYS.USERS, []);
  if (!users.find(u => u.role === 'admin')) {
    setItem(KEYS.USERS, [...users, defaultAdmin]);
  }
}

// Products
export const getProducts = (): Product[] => getItem(KEYS.PRODUCTS, defaultProducts);
export const getProduct = (id: string): Product | undefined => getProducts().find(p => p.id === id);
export const saveProducts = (products: Product[]) => setItem(KEYS.PRODUCTS, products);
export const addProduct = (product: Product) => { const ps = getProducts(); ps.push(product); saveProducts(ps); };
export const updateProduct = (product: Product) => { const ps = getProducts().map(p => p.id === product.id ? product : p); saveProducts(ps); };
export const deleteProduct = (id: string) => saveProducts(getProducts().filter(p => p.id !== id));

// Users
export const getUsers = (): User[] => getItem(KEYS.USERS, [defaultAdmin]);
export const getUser = (id: string): User | undefined => getUsers().find(u => u.id === id);
export const saveUsers = (users: User[]) => setItem(KEYS.USERS, users);
export const registerUser = (user: User): boolean => {
  const users = getUsers();
  if (users.find(u => u.email === user.email)) return false;
  users.push(user);
  saveUsers(users);
  return true;
};
export const loginUser = (email: string, password: string): User | null => {
  const user = getUsers().find(u => u.email === email && u.password === password);
  if (user) setItem(KEYS.CURRENT_USER, user);
  return user || null;
};
type AuthSession = { user: User; expiresAt: number };

export const setAuthSession = (user: User, ttlMs: number) => {
  const expiresAt = Date.now() + ttlMs;
  setItem<AuthSession>(KEYS.AUTH_SESSION, { user, expiresAt });
  setItem(KEYS.CURRENT_USER, user);
};

export const getAuthSession = (): AuthSession | null => getItem<AuthSession | null>(KEYS.AUTH_SESSION, null);

export const clearAuthSession = () => {
  localStorage.removeItem(KEYS.AUTH_SESSION);
};

export const getCurrentUser = (): User | null => {
  const session = getAuthSession();
  if (session?.user && typeof session.expiresAt === 'number') {
    if (Date.now() < session.expiresAt) return session.user;
    clearAuthSession();
    localStorage.removeItem(KEYS.CURRENT_USER);
    return null;
  }
  return getItem<User | null>(KEYS.CURRENT_USER, null);
};
export const setCurrentUser = (user: User | null) => {
  if (user) setItem(KEYS.CURRENT_USER, user);
  else localStorage.removeItem(KEYS.CURRENT_USER);
};
export const logoutUser = () => {
  clearAuthSession();
  localStorage.removeItem(KEYS.CURRENT_USER);
};
export const updateUser = (user: User) => {
  const users = getUsers().map(u => u.id === user.id ? user : u);
  saveUsers(users);
  const current = getCurrentUser();
  if (current?.id === user.id) setItem(KEYS.CURRENT_USER, user);
};

// Cart
export const getCart = (): CartItem[] => getItem(KEYS.CART, []);
export const saveCart = (cart: CartItem[]) => setItem(KEYS.CART, cart);
export const addToCart = (product: Product, qty = 1) => {
  const cart = getCart();
  const existing = cart.find(c => c.product.id === product.id);
  if (existing) existing.quantity += qty;
  else cart.push({ product, quantity: qty });
  saveCart(cart);
};
export const removeFromCart = (productId: string) => saveCart(getCart().filter(c => c.product.id !== productId));
export const updateCartQty = (productId: string, qty: number) => {
  if (qty <= 0) return removeFromCart(productId);
  const cart = getCart().map(c => c.product.id === productId ? { ...c, quantity: qty } : c);
  saveCart(cart);
};
export const clearCart = () => saveCart([]);
export const getCartTotal = (): number => getCart().reduce((sum, c) => sum + c.product.price * c.quantity, 0);

// Orders
export const getOrders = (): Order[] => getItem(KEYS.ORDERS, []);
export const getUserOrders = (userId: string): Order[] => getOrders().filter(o => o.userId === userId);
export const getOrder = (id: string): Order | undefined => getOrders().find(o => o.id === id);
export const saveOrders = (orders: Order[]) => setItem(KEYS.ORDERS, orders);
export const createOrder = (order: Order) => {
  const os = getOrders();
  os.push(order);
  saveOrders(os);
  clearCart();
  // Track monthly revenue
  recordRevenue(order.total, order.createdAt);
};
export const updateOrder = (order: Order) => { const os = getOrders().map(o => o.id === order.id ? order : o); saveOrders(os); };

// Contacts
export const getContacts = (): ContactMessage[] => getItem(KEYS.CONTACTS, []);
export const saveContact = (msg: ContactMessage) => { const cs = getContacts(); cs.push(msg); setItem(KEYS.CONTACTS, cs); };
export const markContactRead = (id: string) => {
  const cs = getContacts().map(c => c.id === id ? { ...c, read: true } : c);
  setItem(KEYS.CONTACTS, cs);
};

// Newsletter
export const getNewsletterSubs = (): NewsletterSubscription[] => getItem(KEYS.NEWSLETTER, []);
export const subscribeNewsletter = (email: string) => {
  const subs = getNewsletterSubs();
  if (!subs.find(s => s.email === email)) {
    subs.push({ id: crypto.randomUUID(), email, createdAt: new Date().toISOString() });
    setItem(KEYS.NEWSLETTER, subs);
    return true;
  }
  return false;
};

// Reviews
export const getReviews = (): Review[] => getItem(KEYS.REVIEWS, []);
export const getApprovedReviews = (): Review[] => getReviews().filter(r => r.approved);
export const getPendingReviews = (): Review[] => getReviews().filter(r => !r.approved);
export const addReview = (review: Review) => {
  const rs = getReviews();
  rs.push(review);
  setItem(KEYS.REVIEWS, rs);
};
export const approveReview = (id: string) => {
  const rs = getReviews().map(r => r.id === id ? { ...r, approved: true } : r);
  setItem(KEYS.REVIEWS, rs);
};
export const deleteReview = (id: string) => {
  const rs = getReviews().filter(r => r.id !== id);
  setItem(KEYS.REVIEWS, rs);
};

// Monthly Revenue
export const getMonthlyRevenue = (): MonthlyRevenue[] => getItem(KEYS.MONTHLY_REVENUE, []);
export const recordRevenue = (amount: number, dateStr: string) => {
  const date = new Date(dateStr);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  const data = getMonthlyRevenue();
  const existing = data.find(d => d.month === month && d.year === year);
  if (existing) {
    existing.revenue += amount;
    existing.orders += 1;
  } else {
    data.push({ month, year, revenue: amount, orders: 1 });
  }
  setItem(KEYS.MONTHLY_REVENUE, data);
};

// Seed demo revenue data
export const seedRevenueData = () => {
  const existing = getMonthlyRevenue();
  if (existing.length > 0) return;
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentYear = new Date().getFullYear();
  const data: MonthlyRevenue[] = [];
  // Last year
  months.forEach(m => {
    data.push({ month: m, year: currentYear - 1, revenue: Math.floor(Math.random() * 50000) + 10000, orders: Math.floor(Math.random() * 30) + 5 });
  });
  // This year up to current month
  const currentMonth = new Date().getMonth();
  for (let i = 0; i <= currentMonth; i++) {
    data.push({ month: months[i], year: currentYear, revenue: Math.floor(Math.random() * 60000) + 15000, orders: Math.floor(Math.random() * 40) + 8 });
  }
  setItem(KEYS.MONTHLY_REVENUE, data);
};
