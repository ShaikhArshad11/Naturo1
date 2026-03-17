export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  image: string;
  image2?: string;
  benefits: string[];
  ingredients: string[];
  usage: string;
  rating: number;
  reviews: number;
  inStock: boolean;
  featured: boolean;
  bestSeller: boolean;
  createdAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  role: 'customer' | 'admin';
  createdAt: string;
  address?: Address;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: Address;
  billingAddress: Address;
  paymentMethod: 'upi' | 'card' | 'cod' | 'razorpay';
  createdAt: string;
  updatedAt: string;
  trackingId?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface NewsletterSubscription {
  id: string;
  email: string;
  createdAt: string;
}

export interface Review {
  id: string;
  name: string;
  email: string;
  text: string;
  rating: number;
  approved: boolean;
  createdAt: string;
}

export interface MonthlyRevenue {
  month: string; // e.g. "Jan", "Feb"
  year: number;
  revenue: number;
  orders: number;
}

export type Category = 'Herbal Juices' | 'Natural Supplements' | 'Immunity Boosters' | 'Ayurvedic Powders' | 'Natural Skincare';
