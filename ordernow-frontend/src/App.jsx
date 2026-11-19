import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Search,
  Plus,
  Minus,
  X,
  CheckCircle2,
  Clock,
  ChefHat,
  Upload,
  UtensilsCrossed,
  Lock,
  KeyRound,
  ArrowLeft,
  Info,
  RefreshCw,
  Receipt,
  Coffee,
  MapPin,
  Phone,
  Truck,
  Store
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const CATEGORIES = [
  'All',
  'Tibs & Sizzlers',
  'Traditional Platter (Beyaynetu)',
  'Fastin (Vegetable / Lenten)',
  'Raw Meats (Kurt / Special)',
  'Beverages & Drinks'
];

const ORDER_STATUS_OPTIONS = [
  'Awaiting Payment',
  'Pending Kitchen',
  'Preparing',
  'Ready',
  'Completed',
  'Cancelled'
];

const TABLE_NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

// Your official restaurant dispatch contact numbers
const RESTAURANT_DISPATCH_CONTACT = {
  name: 'OrderNow Restaurant Dispatch & Delivery Desk',
  phone: '+251 973 476 418',
  altPhone: '+251 910 412 358'
};

// Permanent Beverages & Drinks
const PERMANENT_BEVERAGES = [
  {
    _id: 'bev-ambo-water',
    DishName: 'Chilled Ambo Sparkling Mineral Water',
    Price: 65,
    Category: 'Beverages & Drinks',
    ImageUrl: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?auto=format&fit=crop&w=900&q=85',
    prep_time_minutes: 2,
    Ingredients: ['Natural Ethiopian Sparkling Mineral Water', 'Fresh Lime Slice'],
    IsAvailable: true,
    isPermanentBeverage: true
  },
  {
    _id: 'bev-fresh-espris',
    DishName: 'Fresh Avocado & Mango Espris Juice',
    Price: 160,
    Category: 'Beverages & Drinks',
    ImageUrl: 'https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=900&q=85',
    prep_time_minutes: 5,
    Ingredients: ['Fresh Ripened Avocado', 'Sweet Mango Puree', 'Papaya Layer', 'Fresh Lime'],
    IsAvailable: true,
    isPermanentBeverage: true
  },
  {
    _id: 'bev-coca-cola',
    DishName: 'Ice-Cold Glass Bottle Coca-Cola',
    Price: 70,
    Category: 'Beverages & Drinks',
    ImageUrl: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?auto=format&fit=crop&w=900&q=85',
    prep_time_minutes: 1,
    Ingredients: ['Chilled Glass Bottle 300ml', 'Ice & Lemon'],
    IsAvailable: true,
    isPermanentBeverage: true
  },
  {
    _id: 'bev-spiced-tej',
    DishName: 'Spiced Honey Tej & Ginger Spritz (Non-Alcoholic)',
    Price: 140,
    Category: 'Beverages & Drinks',
    ImageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=900&q=85',
    prep_time_minutes: 3,
    Ingredients: ['Wildflower Ethiopian Honey', 'Cold-Pressed Ginger', 'Sparkling Water', 'Mint'],
    IsAvailable: true,
    isPermanentBeverage: true
  },
  {
    _id: 'bev-hibiscus-tea',
    DishName: 'Karkadeh Hibiscus & Clove Iced Tea',
    Price: 110,
    Category: 'Beverages & Drinks',
    ImageUrl: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=900&q=85',
    prep_time_minutes: 3,
    Ingredients: ['Steeped Hibiscus Petals', 'Ethiopian Cloves', 'Cinnamon Bark', 'Agave'],
    IsAvailable: true,
    isPermanentBeverage: true
  },
  {
    _id: 'bev-addis-macchiato',
    DishName: 'Roasted Yirgacheffe Double Macchiato',
    Price: 95,
    Category: 'Beverages & Drinks',
    ImageUrl: 'https://images.unsplash.com/photo-1485808191679-5f86510681a2?auto=format&fit=crop&w=900&q=85',
    prep_time_minutes: 4,
    Ingredients: ['100% Yirgacheffe Arabica Espresso', 'Velvet Steamed Whole Milk'],
    IsAvailable: true,
    isPermanentBeverage: true
  }
];

const INITIAL_FOOD_MENUS = [
  {
    _id: '673a1001a1b2c3d4e5f60001',
    DishName: 'Awaze Rosemary Derek Tibs',
    Price: 480,
    Category: 'Tibs & Sizzlers',
    ImageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=85',
    prep_time_minutes: 20,
    Ingredients: ['Cubed Tender Beef', 'Awaze Spice Blend', 'Fresh Rosemary', 'Onions', 'Jalapeno', 'Niter Kibbeh'],
    IsAvailable: true
  },
  {
    _id: '673a1001a1b2c3d4e5f60002',
    DishName: 'Royal Addis Beyaynetu Platter',
    Price: 650,
    Category: 'Traditional Platter (Beyaynetu)',
    ImageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=900&q=85',
    prep_time_minutes: 25,
    Ingredients: ['100% Teff Injera', 'Misir Wot', 'Kik Alicha', 'Shiro Tegamino', 'Gomen', 'Atakilt Wot'],
    IsAvailable: true
  },
  {
    _id: '673a1001a1b2c3d4e5f60003',
    DishName: 'Shiro Tegamino with Spiced Butter',
    Price: 280,
    Category: 'Fastin (Vegetable / Lenten)',
    ImageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=900&q=85',
    prep_time_minutes: 15,
    Ingredients: ['Ground Chickpea Flour', 'Berbere', 'Garlic', 'Traditional Clay Pot Sizzler', 'Injera'],
    IsAvailable: true
  },
  {
    _id: '673a1001a1b2c3d4e5f60004',
    DishName: 'Special Kurt Raw Meat Platter',
    Price: 850,
    Category: 'Raw Meats (Kurt / Special)',
    ImageUrl: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=900&q=85',
    prep_time_minutes: 10,
    Ingredients: ['Fresh Prime Beef Cut', 'Mitmita', 'Awaze', 'Kocho', 'Fresh Mustard (Senafich)'],
    IsAvailable: true
  }
];

function mergeMenusWithBeverages(foodList = []) {
  const map = new Map();
  [...foodList, ...PERMANENT_BEVERAGES].forEach((item) => {
    if (item && item._id) {
      map.set(String(item._id), item);
    }
  });
  return Array.from(map.values());
}

function extractServiceDetails(rawOrder) {
  let serviceType = rawOrder.ServiceType || 'Dine-In';
  let tableNumber = rawOrder.TableNumber || '';
  let deliveryAddress = rawOrder.DeliveryAddress || '';

  if (!rawOrder.ServiceType && typeof rawOrder.DeliveryAddress === 'string') {
    if (rawOrder.DeliveryAddress.startsWith('Dine-In • Table')) {
      serviceType = 'Dine-In';
      tableNumber = rawOrder.DeliveryAddress.replace('Dine-In • Table ', '').trim();
    } else if (rawOrder.DeliveryAddress.toLowerCase().includes('takeaway')) {
      serviceType = 'Takeaway';
    } else if (rawOrder.DeliveryAddress.trim() !== '') {
      serviceType = 'Delivery';
    }
  }

  return { serviceType, tableNumber, deliveryAddress };
}

function normalizeOrder(rawOrder, menusList = []) {
  if (!rawOrder) return null;

  let normalizedItems = Array.isArray(rawOrder.items) ? [...rawOrder.items] : [];

  if (normalizedItems.length === 0 && (rawOrder.menuId || rawOrder.Quantity)) {
    const matchedDish =
      typeof rawOrder.menuId === 'object' && rawOrder.menuId !== null
        ? rawOrder.menuId
        : menusList.find((m) => String(m._id) === String(rawOrder.menuId));

    const unitPrice = Number(matchedDish?.Price || rawOrder.Price || 0);
    const qty = Number(rawOrder.Quantity || 1);

    normalizedItems = [
      {
        menuId: matchedDish?._id || rawOrder.menuId || 'custom-dish',
        DishName: matchedDish?.DishName || rawOrder.DishName || 'Ordered Dish',
        UnitPrice: unitPrice,
        Quantity: qty,
        Subtotal: unitPrice * qty
      }
    ];
  }

  const computedTotal =
    rawOrder.TotalAmount !== undefined
      ? Number(rawOrder.TotalAmount)
      : normalizedItems.reduce(
          (sum, item) => sum + Number(item.UnitPrice || 0) * Number(item.Quantity || 1),
          0
        );

  const { serviceType, tableNumber, deliveryAddress } = extractServiceDetails(rawOrder);

  return {
    ...rawOrder,
    _id: rawOrder._id || rawOrder.tx_ref || `ord-${Date.now()}`,
    tx_ref: rawOrder.tx_ref || `TX-${String(rawOrder._id || Date.now()).slice(-6).toUpperCase()}`,
    CustomerName: rawOrder.CustomerName || 'Restaurant Guest',
    CustomerPhone: rawOrder.CustomerPhone || '+251 973 476 418',
    ServiceType: serviceType,
    TableNumber: tableNumber,
    DeliveryAddress: deliveryAddress,
    Message: rawOrder.Message || '',
    items: normalizedItems,
    TotalAmount: computedTotal,
    PaymentStatus: rawOrder.PaymentStatus || 'Paid',
    OrderStatus: rawOrder.OrderStatus || 'Pending Kitchen',
    statusUpdatedAt: Number(rawOrder.statusUpdatedAt || 0),
    orderedAt: rawOrder.orderedAt || new Date().toISOString()
  };
}

function mergeOrdersList(primaryOrders = [], secondaryOrders = [], menusList = []) {
  const map = new Map();

  [...secondaryOrders, ...primaryOrders].forEach((ord) => {
    const norm = normalizeOrder(ord, menusList);
    if (!norm) return;
    const key = norm.tx_ref || String(norm._id);

    if (!map.has(key)) {
      map.set(key, norm);
    } else {
      const existing = map.get(key);
      const existingTime = Number(existing.statusUpdatedAt || 0);
      const incomingTime = Number(norm.statusUpdatedAt || 0);

      const winningStatus =
        incomingTime >= existingTime
          ? norm.OrderStatus || existing.OrderStatus
          : existing.OrderStatus;

      const winningTimestamp = Math.max(existingTime, incomingTime);

      map.set(key, {
        ...existing,
        ...norm,
        OrderStatus: winningStatus,
        statusUpdatedAt: winningTimestamp,
        ServiceType: norm.ServiceType || existing.ServiceType,
        TableNumber: norm.TableNumber || existing.TableNumber,
        DeliveryAddress: norm.DeliveryAddress || existing.DeliveryAddress,
        CustomerName:
          norm.CustomerName && norm.CustomerName !== 'Restaurant Guest'
            ? norm.CustomerName
            : existing.CustomerName,
        CustomerPhone:
          norm.CustomerPhone && norm.CustomerPhone !== '+251 973 476 418'
            ? norm.CustomerPhone
            : existing.CustomerPhone,
        items:
          (norm.items?.length || 0) >= (existing.items?.length || 0)
            ? norm.items
            : existing.items
      });
    }
  });

  return Array.from(map.values()).sort(
    (a, b) => new Date(b.orderedAt || 0) - new Date(a.orderedAt || 0)
  );
}

export default function App() {
  const [activeView, setActiveView] = useState('storefront');
  const [selectedDish, setSelectedDish] = useState(null);

  const [menus, setMenus] = useState(() => {
    try {
      const saved = localStorage.getItem('orderNow_menus');
      const parsed = saved ? JSON.parse(saved) : INITIAL_FOOD_MENUS;
      return mergeMenusWithBeverages(parsed);
    } catch (_) {
      return mergeMenusWithBeverages(INITIAL_FOOD_MENUS);
    }
  });

  // STRICT PRIVACY: Stores ONLY this device's order tx_refs
  const [myReceiptRefs, setMyReceiptRefs] = useState(() => {
    try {
      const savedRefs = JSON.parse(localStorage.getItem('orderNow_myReceiptRefs') || '[]');
      const savedActive = JSON.parse(localStorage.getItem('orderNow_activeOrder') || 'null');
      if (savedActive?.tx_ref && !savedRefs.includes(savedActive.tx_ref)) {
        return [savedActive.tx_ref, ...savedRefs];
      }
      return Array.isArray(savedRefs) ? savedRefs : [];
    } catch (_) {
      return [];
    }
  });

  const [orders, setOrders] = useState(() => {
    try {
      const savedOrders = JSON.parse(localStorage.getItem('orderNow_orders') || '[]');
      const savedActive = JSON.parse(localStorage.getItem('orderNow_activeOrder') || 'null');
      const combined = savedActive ? [savedActive, ...savedOrders] : savedOrders;
      return mergeOrdersList(combined, [], mergeMenusWithBeverages(INITIAL_FOOD_MENUS));
    } catch (_) {
      return [];
    }
  });

  const [selectedReceiptRef, setSelectedReceiptRef] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('orderNow_activeOrder') || 'null');
      return saved?.tx_ref || null;
    } catch (_) {
      return null;
    }
  });

  const [cart, setCart] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Service Mode State ('Dine-In', 'Takeaway', 'Delivery')
  const [serviceType, setServiceType] = useState('Dine-In');
  const [tableNumber, setTableNumber] = useState('7');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [orderMessage, setOrderMessage] = useState('');
  const [checkoutError, setCheckoutError] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingChapaOrder, setPendingChapaOrder] = useState(null);

  const [isStaff, setIsStaff] = useState(() => {
    return sessionStorage.getItem('orderNow_isStaff') === 'true';
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [authError, setAuthError] = useState('');

  const [staffTab, setStaffTab] = useState('queue');
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState('');
  const [formData, setFormData] = useState({
    DishName: '',
    Price: '',
    Category: 'Tibs & Sizzlers',
    prep_time_minutes: 15,
    Ingredients: '',
    ImageUrl: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [statusMsg, setStatusMsg] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem('orderNow_orders', JSON.stringify(orders));
    } catch (_) {}
  }, [orders]);

  useEffect(() => {
    try {
      localStorage.setItem('orderNow_myReceiptRefs', JSON.stringify(myReceiptRefs));
    } catch (_) {}
  }, [myReceiptRefs]);

  useEffect(() => {
    try {
      localStorage.setItem('orderNow_menus', JSON.stringify(menus));
    } catch (_) {}
  }, [menus]);

  const persistAndBroadcastOrders = (updatedOrdersList) => {
    try {
      localStorage.setItem('orderNow_orders', JSON.stringify(updatedOrdersList));
      if (typeof BroadcastChannel !== 'undefined') {
        const bc = new BroadcastChannel('ordernow_live_sync');
        bc.postMessage({ type: 'ORDERS_UPDATED', orders: updatedOrdersList });
        bc.close();
      }
    } catch (_) {}
  };

  // Live Cross-Tab Sync
  useEffect(() => {
    const handleStorageEvent = (e) => {
      if (e.key === 'orderNow_orders' && e.newValue) {
        try {
          const freshFromOtherTab = JSON.parse(e.newValue);
          setOrders((prev) => mergeOrdersList(freshFromOtherTab, prev, menus));
        } catch (_) {}
      }
      if (e.key === 'orderNow_myReceiptRefs' && e.newValue) {
        try {
          setMyReceiptRefs(JSON.parse(e.newValue));
        } catch (_) {}
      }
    };

    window.addEventListener('storage', handleStorageEvent);

    let bc;
    if (typeof BroadcastChannel !== 'undefined') {
      bc = new BroadcastChannel('ordernow_live_sync');
      bc.onmessage = (event) => {
        if (event.data?.type === 'ORDERS_UPDATED' && Array.isArray(event.data.orders)) {
          setOrders((prev) => mergeOrdersList(event.data.orders, prev, menus));
        }
      };
    }

    return () => {
      window.removeEventListener('storage', handleStorageEvent);
      if (bc) bc.close();
    };
  }, [menus]);

  const fetchBackendData = async (showSpinner = false) => {
    if (showSpinner) setIsSyncing(true);
    try {
      const localStoredOrders = JSON.parse(localStorage.getItem('orderNow_orders') || '[]');

      const [menuRes, orderRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/menu`).catch(() => null),
        fetch(`${API_BASE_URL}/api/orders`).catch(() => null)
      ]);

      let latestMenus = menus;
      if (menuRes && menuRes.ok) {
        const m = await menuRes.json();
        if (Array.isArray(m.data) && m.data.length > 0) {
          const formattedDbMenus = m.data.map((dish, idx) => ({
            ...dish,
            Category: dish.Category || 'Tibs & Sizzlers',
            ImageUrl:
              dish.ImageUrl ||
              INITIAL_FOOD_MENUS[idx % INITIAL_FOOD_MENUS.length].ImageUrl,
            Ingredients: Array.isArray(dish.Ingredients)
              ? dish.Ingredients
              : ['Freshly Prepared']
          }));
          latestMenus = mergeMenusWithBeverages(formattedDbMenus);
          setMenus(latestMenus);
        }
      }

      let dbOrders = [];
      if (orderRes && orderRes.ok) {
        const o = await orderRes.json();
        if (Array.isArray(o.data)) {
          dbOrders = o.data;
        }
      }

      setOrders((prevInMemory) => {
        const latestLocal = mergeOrdersList(localStoredOrders, prevInMemory, latestMenus);
        const finalMerged = mergeOrdersList(latestLocal, dbOrders, latestMenus);
        return finalMerged;
      });

      const nowStr = new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      setLastSyncedAt(nowStr);
    } catch (e) {
      console.warn('Sync completed using local queue.');
    } finally {
      if (showSpinner) {
        setTimeout(() => setIsSyncing(false), 300);
      }
    }
  };

  useEffect(() => {
    fetchBackendData(false);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchBackendData(false);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleStaffLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setIsStaff(true);
          sessionStorage.setItem('orderNow_isStaff', 'true');
          setIsAuthModalOpen(false);
          setPasscode('');
          setActiveView('staff');
          return;
        }
      }
    } catch (_) {}

    if (passcode === '1234') {
      setIsStaff(true);
      sessionStorage.setItem('orderNow_isStaff', 'true');
      setIsAuthModalOpen(false);
      setPasscode('');
      setActiveView('staff');
    } else {
      setAuthError('Invalid staff passcode. (Default PIN: 1234)');
    }
  };

  const handleAddToCart = (dish, qty = 1) => {
    setCart((prev) => {
      const exists = prev.find((item) => item._id === dish._id);
      if (exists) {
        return prev.map((item) =>
          item._id === dish._id
            ? { ...item, Quantity: item.Quantity + qty }
            : item
        );
      }
      return [...prev, { ...dish, Quantity: qty }];
    });
  };

  const updateCartQty = (id, newQty) => {
    if (newQty < 1) {
      setCart((prev) => prev.filter((item) => item._id !== id));
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item._id === id ? { ...item, Quantity: newQty } : item))
    );
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.Price * item.Quantity, 0);

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    setCheckoutError('');

    if (!customerName.trim()) {
      setCheckoutError('Please enter your name.');
      return;
    }

    if (serviceType === 'Dine-In' && !tableNumber) {
      setCheckoutError('Please select your Table Number.');
      return;
    }

    if ((serviceType === 'Takeaway' || serviceType === 'Delivery') && !customerPhone.trim()) {
      setCheckoutError(`Please provide your phone number for ${serviceType}.`);
      return;
    }

    if (serviceType === 'Delivery' && !deliveryAddress.trim()) {
      setCheckoutError('Please enter your delivery address.');
      return;
    }

    setIsSubmitting(true);

    const itemsPayload = cart.map((item) => ({
      menuId: item._id,
      DishName: item.DishName,
      UnitPrice: Number(item.Price),
      Quantity: Number(item.Quantity),
      Subtotal: Number(item.Price) * Number(item.Quantity),
      ImageUrl: item.ImageUrl,
      Category: item.Category
    }));

    const generatedTxRef = `ORD-${Date.now().toString().slice(-6)}`;
    const formattedDeliveryLocation =
      serviceType === 'Dine-In'
        ? `Dine-In • Table ${tableNumber}`
        : serviceType === 'Takeaway'
        ? 'Takeaway / Counter Pickup'
        : deliveryAddress.trim();

    const validMongoItem =
      itemsPayload.find((i) => /^[0-9a-fA-F]{24}$/.test(String(i.menuId))) ||
      itemsPayload[0];

    const payload = {
      CustomerName: customerName.trim(),
      CustomerPhone: customerPhone.trim() || '+251 973 476 418',
      ServiceType: serviceType,
      TableNumber: serviceType === 'Dine-In' ? String(tableNumber) : '',
      DeliveryAddress: formattedDeliveryLocation,
      Message: orderMessage.trim(),
      items: itemsPayload,
      menuId: validMongoItem?.menuId,
      Quantity: itemsPayload.reduce((sum, i) => sum + i.Quantity, 0),
      TotalAmount: cartTotal,
      tx_ref: generatedTxRef,
      statusUpdatedAt: Date.now()
    };

    try {
      const res = await fetch(`${API_BASE_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const data = await res.json();
        const serverOrder = normalizeOrder(
          {
            ...payload,
            ...(data.data || {}),
            tx_ref: data.tx_ref || data.data?.tx_ref || generatedTxRef,
            items: data.data?.items?.length ? data.data.items : itemsPayload,
            ServiceType: serviceType,
            TableNumber: serviceType === 'Dine-In' ? String(tableNumber) : '',
            DeliveryAddress: formattedDeliveryLocation,
            CustomerName: payload.CustomerName,
            CustomerPhone: payload.CustomerPhone,
            Message: payload.Message,
            TotalAmount: cartTotal,
            statusUpdatedAt: Date.now()
          },
          menus
        );
        setPendingChapaOrder(serverOrder);
        setIsCartOpen(false);
        setIsSubmitting(false);
        return;
      }
    } catch (_) {}

    const fallbackOrder = normalizeOrder(
      {
        _id: `ord-${Date.now()}`,
        ...payload,
        PaymentStatus: 'Pending',
        OrderStatus: 'Awaiting Payment',
        orderedAt: new Date().toISOString(),
        statusUpdatedAt: Date.now()
      },
      menus
    );

    setPendingChapaOrder(fallbackOrder);
    setIsCartOpen(false);
    setIsSubmitting(false);
  };

  const verifyPayment = async (tx_ref) => {
    const nowTs = Date.now();
    let finalPaidOrder = normalizeOrder(
      {
        ...pendingChapaOrder,
        PaymentStatus: 'Paid',
        OrderStatus: 'Pending Kitchen',
        statusUpdatedAt: nowTs,
        orderedAt: new Date().toISOString()
      },
      menus
    );

    try {
      const res = await fetch(`${API_BASE_URL}/api/orders/verify/${tx_ref}`);
      if (res.ok) {
        const data = await res.json();
        if (data.data) {
          finalPaidOrder = normalizeOrder(
            {
              ...finalPaidOrder,
              ...data.data,
              ServiceType: finalPaidOrder.ServiceType,
              TableNumber: finalPaidOrder.TableNumber,
              DeliveryAddress: finalPaidOrder.DeliveryAddress,
              items: data.data.items?.length ? data.data.items : finalPaidOrder.items,
              PaymentStatus: 'Paid',
              OrderStatus:
                data.data.OrderStatus === 'Awaiting Payment'
                  ? 'Pending Kitchen'
                  : data.data.OrderStatus || 'Pending Kitchen',
              statusUpdatedAt: nowTs
            },
            menus
          );
        }
      }
    } catch (_) {}

    setMyReceiptRefs((prevRefs) => {
      const nextRefs = [
        finalPaidOrder.tx_ref,
        String(finalPaidOrder._id),
        ...prevRefs
      ];
      return Array.from(new Set(nextRefs.filter(Boolean)));
    });

    setOrders((prev) => {
      const merged = mergeOrdersList([finalPaidOrder], prev, menus);
      persistAndBroadcastOrders(merged);
      return merged;
    });

    localStorage.setItem('orderNow_activeOrder', JSON.stringify(finalPaidOrder));
    setSelectedReceiptRef(finalPaidOrder.tx_ref);
    setPendingChapaOrder(null);
    setCart([]);
    setOrderMessage('');
    setActiveView('tracker');
  };

  const handleUpdateOrderStatus = async (orderId, txRef, newStatus) => {
    const updateTimestamp = Date.now();

    setOrders((prev) => {
      const updated = prev.map((o) => {
        const isMatch =
          (orderId && String(o._id) === String(orderId)) ||
          (txRef && o.tx_ref === txRef);
        return isMatch
          ? { ...o, OrderStatus: newStatus, statusUpdatedAt: updateTimestamp }
          : o;
      });
      persistAndBroadcastOrders(updated);
      return updated;
    });

    try {
      await fetch(`${API_BASE_URL}/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ OrderStatus: newStatus })
      });
    } catch (_) {}
  };

  const handleCreateMenu = async (e) => {
    e.preventDefault();
    let createdDish = null;

    try {
      const fd = new FormData();
      fd.append('DishName', formData.DishName);
      fd.append('Price', formData.Price);
      fd.append('Category', formData.Category);
      fd.append('prep_time_minutes', formData.prep_time_minutes);
      fd.append('Ingredients', formData.Ingredients);
      if (imageFile) fd.append('image', imageFile);
      else if (formData.ImageUrl) fd.append('ImageUrl', formData.ImageUrl);

      const res = await fetch(`${API_BASE_URL}/api/menu`, {
        method: 'POST',
        body: fd
      });
      if (res.ok) {
        const created = await res.json();
        createdDish = created.data;
      }
    } catch (_) {}

    const newDishObj = createdDish || {
      _id: `dish-${Date.now()}`,
      DishName: formData.DishName,
      Price: Number(formData.Price),
      Category: formData.Category,
      prep_time_minutes: Number(formData.prep_time_minutes),
      Ingredients: formData.Ingredients.split(',').map((i) => i.trim()).filter(Boolean),
      ImageUrl:
        imagePreview ||
        formData.ImageUrl ||
        'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=900&q=80'
    };

    setMenus((prev) => mergeMenusWithBeverages([newDishObj, ...prev]));
    setFormData({
      DishName: '',
      Price: '',
      Category: 'Tibs & Sizzlers',
      prep_time_minutes: 15,
      Ingredients: '',
      ImageUrl: ''
    });
    setImageFile(null);
    setImagePreview('');
    setStatusMsg('New dish successfully published to the menu!');
    setTimeout(() => setStatusMsg(''), 4000);
  };

  const openDishDetail = (dish) => {
    setSelectedDish(dish);
    setActiveView('detail');
  };

  const filteredMenus = menus.filter((dish) => {
    const matchCat =
      selectedCategory === 'All' || dish.Category === selectedCategory;
    const matchSearch = (dish.DishName || '')
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const myCustomerOrders = orders.filter(
    (ord) =>
      myReceiptRefs.includes(ord.tx_ref) ||
      myReceiptRefs.includes(String(ord._id))
  );

  const displayedReceipt =
    myCustomerOrders.find(
      (o) =>
        o.tx_ref === selectedReceiptRef ||
        String(o._id) === String(selectedReceiptRef)
    ) ||
    myCustomerOrders[0] ||
    null;

  const hasCustomerReceipt = myCustomerOrders.length > 0;

  return (
    <div className="min-h-screen bg-[#F9F6F0] text-[#2C241B] font-sans selection:bg-[#D84C27] selection:text-white">
      {/* --- HEADER NAVIGATION --- */}
      <header className="sticky top-0 z-40 bg-[#F9F6F0]/95 backdrop-blur-md border-b border-[#E8E3DA]">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div
            onClick={() => setActiveView('storefront')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <UtensilsCrossed className="w-6 h-6 text-[#D84C27] group-hover:rotate-12 transition-transform duration-300" />
            <span className="font-serif text-2xl font-bold tracking-tight text-[#2C241B]">
              OrderNow
            </span>
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={() => {
                setActiveView('storefront');
                setSelectedDish(null);
              }}
              className={`text-sm font-medium transition-colors ${
                activeView === 'storefront'
                  ? 'text-[#D84C27]'
                  : 'text-[#6B635A] hover:text-[#2C241B]'
              }`}
            >
              Menu
            </button>

            {hasCustomerReceipt && (
              <button
                onClick={() => setActiveView('tracker')}
                className={`text-sm font-medium flex items-center gap-1.5 transition-colors ${
                  activeView === 'tracker'
                    ? 'text-[#D84C27]'
                    : 'text-[#6B635A] hover:text-[#2C241B]'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-[#10A352] animate-pulse" />
                <span>
                  My Receipt ({displayedReceipt?.OrderStatus || 'Active'})
                </span>
              </button>
            )}

            {!isStaff ? (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="text-sm font-medium text-[#6B635A] hover:text-[#2C241B] flex items-center gap-1.5 transition-colors"
              >
                <Lock className="w-4 h-4" />
                <span className="hidden sm:inline">Staff Login</span>
              </button>
            ) : (
              <button
                onClick={() => setActiveView('staff')}
                className={`text-sm font-semibold flex items-center gap-1.5 transition-colors ${
                  activeView === 'staff'
                    ? 'text-[#10A352]'
                    : 'text-[#10A352]/80 hover:text-[#10A352]'
                }`}
              >
                <ChefHat className="w-4 h-4" />
                <span className="hidden sm:inline">
                  Staff Dashboard ({orders.length})
                </span>
              </button>
            )}

            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#2C241B] text-[#F9F6F0] hover:bg-[#D84C27] transition-all active:scale-[0.98] shadow-[0_4px_14px_0_rgba(44,36,27,0.1)]"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="text-sm font-medium font-mono tabular-nums">
                {cart.reduce((a, b) => a + b.Quantity, 0)}
              </span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* --- STOREFRONT VIEW --- */}
        {activeView === 'storefront' && (
          <div className="space-y-12">
            <div className="text-center max-w-3xl mx-auto space-y-6 py-8">
              <h1 className="font-serif text-5xl md:text-6xl font-bold text-[#2C241B] leading-tight">
                Authentic Ethiopian flavors, <br />
                <span className="text-[#D84C27] italic">prepared with passion.</span>
              </h1>
              <p className="text-lg text-[#6B635A]">
                Enjoy traditional platters, sizzling tibs, and fresh drinks right at your table, packaged for takeaway, or delivered to your door.
              </p>
            </div>

            {/* Ethiopian Menu Categories */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-y border-[#E8E3DA] py-4">
              <div className="flex items-center gap-6 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`whitespace-nowrap text-sm font-medium transition-colors pb-1 border-b-2 flex items-center gap-1.5 ${
                      selectedCategory === cat
                        ? 'border-[#2C241B] text-[#2C241B] font-bold'
                        : 'border-transparent text-[#6B635A] hover:text-[#2C241B]'
                    }`}
                  >
                    {cat === 'Beverages & Drinks' && (
                      <Coffee className="w-3.5 h-3.5 text-[#D84C27]" />
                    )}
                    <span>{cat}</span>
                  </button>
                ))}
              </div>
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B635A]" />
                <input
                  type="text"
                  placeholder="Search traditional dishes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-transparent border-b border-[#E8E3DA] focus:border-[#D84C27] focus:outline-none text-sm transition-colors"
                />
              </div>
            </div>

            {/* Menu Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
              {filteredMenus.map((dish) => (
                <MenuCard
                  key={dish._id}
                  dish={dish}
                  onAdd={handleAddToCart}
                  cartItem={cart.find((c) => c._id === dish._id)}
                  updateQty={updateCartQty}
                  onViewDetail={() => openDishDetail(dish)}
                />
              ))}
            </div>

            {/* Permanent Beverages Bar */}
            {selectedCategory !== 'Beverages & Drinks' && (
              <section className="pt-8 border-t border-[#E8E3DA] space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#D84C27] flex items-center gap-1.5">
                      <Coffee className="w-4 h-4" /> Traditional & Chilled Drinks
                    </span>
                    <h2 className="font-serif text-3xl font-bold text-[#2C241B] mt-1">
                      Pair a Beverage with Your Meal
                    </h2>
                  </div>
                  <p className="text-sm text-[#6B635A]">
                    Select any chilled drink or fresh juice to include with your order.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {PERMANENT_BEVERAGES.map((bev) => {
                    const inCart = cart.find((c) => c._id === bev._id);
                    return (
                      <div
                        key={bev._id}
                        className="bg-[#FFFEFC] rounded-2xl border border-[#E8E3DA] p-4 flex items-center gap-4 shadow-xs"
                      >
                        <img
                          src={bev.ImageUrl}
                          alt={bev.DishName}
                          onClick={() => openDishDetail(bev)}
                          className="w-20 h-20 rounded-xl object-cover shrink-0 cursor-pointer"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-serif font-bold text-base text-[#2C241B] truncate">
                            {bev.DishName}
                          </h4>
                          <div className="font-mono text-sm font-bold text-[#D84C27] mt-0.5">
                            ETB {bev.Price}
                          </div>

                          <div className="mt-2.5">
                            {inCart ? (
                              <div className="inline-flex items-center gap-3 bg-[#F9F6F0] px-2.5 py-1 rounded-lg border border-[#E8E3DA]">
                                <button
                                  onClick={() => updateCartQty(bev._id, inCart.Quantity - 1)}
                                  className="text-[#6B635A] hover:text-[#2C241B]"
                                >
                                  <Minus className="w-3.5 h-3.5" />
                                </button>
                                <span className="font-mono text-xs font-bold">
                                  {inCart.Quantity}
                                </span>
                                <button
                                  onClick={() => updateCartQty(bev._id, inCart.Quantity + 1)}
                                  className="text-[#6B635A] hover:text-[#2C241B]"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => handleAddToCart(bev, 1)}
                                className="px-3.5 py-1.5 rounded-lg bg-[#2C241B] hover:bg-[#D84C27] text-white text-xs font-bold transition-colors"
                              >
                                + Add Drink
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}
          </div>
        )}

        {/* --- DISH DETAIL VIEW --- */}
        {activeView === 'detail' && selectedDish && (
          <div className="max-w-5xl mx-auto pt-4">
            <button
              onClick={() => setActiveView('storefront')}
              className="inline-flex items-center gap-2 text-[#6B635A] hover:text-[#2C241B] font-medium text-sm mb-8 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Menu
            </button>

            <div className="bg-[#FFFEFC] rounded-[2rem] border border-[#E8E3DA] shadow-sm overflow-hidden flex flex-col md:flex-row">
              <div className="md:w-1/2 bg-[#E8E3DA] relative">
                <img
                  src={selectedDish.ImageUrl}
                  alt={selectedDish.DishName}
                  className="w-full h-full object-cover min-h-[300px] md:min-h-[500px]"
                />
              </div>
              <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#F9F6F0] text-[#6B635A] w-fit mb-4">
                  {selectedDish.Category || 'Traditional Specialty'}
                </div>

                <h1 className="font-serif text-3xl md:text-4xl font-bold text-[#2C241B] leading-tight mb-4">
                  {selectedDish.DishName}
                </h1>

                <div className="flex items-center gap-6 mb-8">
                  <span className="font-mono text-2xl font-bold text-[#D84C27] tabular-nums">
                    ETB {selectedDish.Price}
                  </span>
                  <span className="flex items-center gap-1.5 text-sm text-[#6B635A] font-medium">
                    <Clock className="w-4 h-4" /> {selectedDish.prep_time_minutes || 15} min prep
                  </span>
                </div>

                <div className="mb-10">
                  <h3 className="text-sm font-bold text-[#2C241B] uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Info className="w-4 h-4" /> Ingredients & Spices
                  </h3>
                  <ul className="flex flex-wrap gap-2">
                    {(selectedDish.Ingredients || []).map((ingredient, i) => (
                      <li
                        key={i}
                        className="px-4 py-2 bg-[#F9F6F0] border border-[#E8E3DA] text-[#2C241B] text-sm font-medium rounded-lg"
                      >
                        {ingredient}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-8 border-t border-[#E8E3DA]">
                  <DishDetailActions
                    dish={selectedDish}
                    cartItem={cart.find((c) => c._id === selectedDish._id)}
                    onAdd={handleAddToCart}
                    updateQty={updateCartQty}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- PRIVATE CUSTOMER RECEIPT VIEW --- */}
        {activeView === 'tracker' && (
          <div className="max-w-3xl mx-auto space-y-8">
            {!displayedReceipt ? (
              <div className="bg-[#FFFEFC] rounded-[2rem] p-12 text-center border border-[#E8E3DA]">
                <p className="text-[#6B635A]">You have no active receipts on this device yet.</p>
              </div>
            ) : (
              <div className="bg-[#FFFEFC] rounded-[2rem] p-8 md:p-12 shadow-[0_20px_40px_-15px_rgba(44,36,27,0.05)] border border-[#E8E3DA]">
                <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#10A352] bg-[#10A352]/10 px-3 py-1 rounded-full">
                    <Lock className="w-3.5 h-3.5" /> Private Customer Receipt
                  </span>

                  <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-[#2C241B] text-[#F9F6F0] px-3.5 py-1.5 rounded-full">
                    {displayedReceipt.ServiceType === 'Dine-In' && (
                      <>
                        <UtensilsCrossed className="w-3.5 h-3.5 text-[#D84C27]" />
                        <span>Dine-In • Table #{displayedReceipt.TableNumber || '1'}</span>
                      </>
                    )}
                    {displayedReceipt.ServiceType === 'Takeaway' && (
                      <>
                        <Store className="w-3.5 h-3.5 text-[#D84C27]" />
                        <span>Takeaway / Counter Pickup</span>
                      </>
                    )}
                    {displayedReceipt.ServiceType === 'Delivery' && (
                      <>
                        <Truck className="w-3.5 h-3.5 text-[#D84C27]" />
                        <span>Delivery Order</span>
                      </>
                    )}
                  </span>

                  <button
                    onClick={() => fetchBackendData(true)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6B635A] hover:text-[#2C241B] px-3 py-1.5 rounded-lg border border-[#E8E3DA]"
                  >
                    <RefreshCw
                      className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-[#D84C27]' : ''}`}
                    />
                    <span>{isSyncing ? 'Syncing...' : 'Refresh Status'}</span>
                  </button>
                </div>

                <div className="text-center mb-10">
                  <div className="w-16 h-16 bg-[#10A352]/10 text-[#10A352] rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h2 className="font-serif text-3xl font-bold text-[#2C241B]">
                    Order Confirmed
                  </h2>
                  <p className="font-mono text-sm text-[#6B635A] mt-2">
                    Receipt #{displayedReceipt.tx_ref} • {displayedReceipt.CustomerName}
                  </p>
                  <div className="inline-flex items-center gap-2 mt-4 px-5 py-2 bg-[#FAF7F2] rounded-full border border-[#D84C27]/40">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#10A352] animate-ping" />
                    <span className="text-xs font-bold text-[#2C241B] uppercase tracking-wider">
                      Live Kitchen Status:{' '}
                      <span className="text-[#D84C27]">{displayedReceipt.OrderStatus}</span>
                    </span>
                  </div>
                </div>

                {/* 4-Step Kitchen Progress Bar */}
                <div className="mb-10">
                  <div className="flex justify-between mb-2">
                    {[
                      { label: 'Pending Kitchen', short: 'Pending Kitchen' },
                      { label: 'Preparing', short: 'Preparing' },
                      { label: 'Ready', short: 'Ready' },
                      { label: 'Completed', short: 'Completed' }
                    ].map((step, i) => {
                      const stages = ['Pending Kitchen', 'Preparing', 'Ready', 'Completed'];
                      const currentIdx = Math.max(
                        0,
                        stages.indexOf(displayedReceipt.OrderStatus || 'Pending Kitchen')
                      );
                      const isActive = i <= currentIdx;
                      return (
                        <div
                          key={step.label}
                          className={`text-xs font-bold ${
                            isActive ? 'text-[#D84C27]' : 'text-[#6B635A]/40'
                          }`}
                        >
                          {step.short}
                        </div>
                      );
                    })}
                  </div>
                  <div className="h-2.5 w-full bg-[#E8E3DA] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#D84C27] transition-all duration-500 ease-out"
                      style={{
                        width: `${
                          (Math.max(
                            0,
                            ['Pending Kitchen', 'Preparing', 'Ready', 'Completed'].indexOf(
                              displayedReceipt.OrderStatus || 'Pending Kitchen'
                            )
                          ) +
                            1) *
                          25
                        }%`
                      }}
                    />
                  </div>
                </div>

                {/* Service Details Box */}
                <div className="mb-8 p-4 rounded-2xl bg-[#F9F6F0] border border-[#E8E3DA] space-y-2 text-sm">
                  {displayedReceipt.ServiceType === 'Dine-In' && (
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#2C241B]">Dine-In Table Assignment:</span>
                      <span className="font-mono font-bold text-base text-[#D84C27]">
                        Table #{displayedReceipt.TableNumber || '1'}
                      </span>
                    </div>
                  )}

                  {displayedReceipt.ServiceType === 'Takeaway' && (
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#2C241B]">Takeaway Pickup For:</span>
                      <span className="font-mono font-semibold text-[#2C241B]">
                        {displayedReceipt.CustomerName} ({displayedReceipt.CustomerPhone})
                      </span>
                    </div>
                  )}

                  {displayedReceipt.ServiceType === 'Delivery' && (
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-4">
                        <span className="font-bold text-[#2C241B]">Delivery Destination:</span>
                        <span className="text-right font-medium text-[#2C241B]">
                          {displayedReceipt.DeliveryAddress} ({displayedReceipt.CustomerPhone})
                        </span>
                      </div>
                      <div className="pt-2 border-t border-[#E8E3DA] flex flex-wrap items-center justify-between gap-2 text-xs text-[#6B635A]">
                        <span className="font-bold text-[#10A352]">
                          {RESTAURANT_DISPATCH_CONTACT.name}:
                        </span>
                        <span className="font-mono font-bold text-[#2C241B]">
                          {RESTAURANT_DISPATCH_CONTACT.phone} / {RESTAURANT_DISPATCH_CONTACT.altPhone}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Ordered Items List */}
                <div className="space-y-4 border-t border-[#E8E3DA] pt-8 mb-8">
                  {(displayedReceipt.items || []).map((item, i) => (
                    <div key={i} className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-sm font-bold text-[#D84C27]">
                          {item.Quantity}x
                        </span>
                        <span className="text-[#2C241B] font-medium">{item.DishName}</span>
                      </div>
                      <span className="font-mono text-sm text-[#2C241B] tabular-nums">
                        ETB {(Number(item.UnitPrice) * Number(item.Quantity)).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                {displayedReceipt.Message && (
                  <div className="mb-6 p-4 bg-[#F9F6F0] rounded-xl border border-[#E8E3DA] text-sm">
                    <span className="font-bold text-[#D84C27] block text-xs uppercase mb-1">
                      Allergy / Kitchen Note:
                    </span>
                    {displayedReceipt.Message}
                  </div>
                )}

                <div className="flex justify-between items-center border-t border-[#E8E3DA] pt-6">
                  <span className="font-serif text-lg font-bold text-[#2C241B]">Total Paid</span>
                  <span className="font-mono text-xl font-bold text-[#10A352] tabular-nums">
                    ETB {Number(displayedReceipt.TotalAmount || 0).toLocaleString()}
                  </span>
                </div>
              </div>
            )}

            {/* Strictly Private Previous Orders (This Device Only) */}
            {myCustomerOrders.length > 1 && (
              <div className="bg-[#FFFEFC] rounded-2xl p-6 border border-[#E8E3DA]">
                <h3 className="font-serif text-lg font-bold text-[#2C241B] mb-4 flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-[#D84C27]" /> My Previous Orders (This Device Only)
                </h3>
                <div className="space-y-2">
                  {myCustomerOrders.map((ord) => (
                    <button
                      key={ord.tx_ref || ord._id}
                      onClick={() => setSelectedReceiptRef(ord.tx_ref)}
                      className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-colors ${
                        displayedReceipt?.tx_ref === ord.tx_ref
                          ? 'bg-[#F9F6F0] border-[#D84C27]'
                          : 'border-[#E8E3DA] hover:bg-[#F9F6F0]'
                      }`}
                    >
                      <div>
                        <span className="font-mono text-xs font-bold text-[#2C241B]">
                          #{ord.tx_ref}
                        </span>
                        <span className="text-xs font-bold text-[#D84C27] ml-2">
                          [
                          {ord.ServiceType === 'Dine-In'
                            ? `Table #${ord.TableNumber || 1}`
                            : ord.ServiceType}
                          ]
                        </span>
                        <span className="text-xs text-[#6B635A] ml-2">
                          {(ord.items || []).map((i) => `${i.Quantity}x ${i.DishName}`).join(', ')}
                        </span>
                      </div>
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#D84C27]/10 text-[#D84C27]">
                        {ord.OrderStatus}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- STAFF DASHBOARD VIEW --- */}
        {activeView === 'staff' && isStaff && (
          <div>
            <div className="flex flex-wrap items-end justify-between border-b border-[#2C241B] pb-6 mb-10 gap-4">
              <div>
                <h1 className="font-serif text-3xl font-bold text-[#2C241B]">Kitchen Portal</h1>
                <p className="text-[#6B635A] mt-2">
                  Manage Dine-In table orders, Takeaway pickups, Delivery dispatches, and menu inventory.
                </p>
              </div>
              <div className="flex items-center gap-4 sm:gap-6">
                {lastSyncedAt && (
                  <span className="hidden md:inline text-xs font-mono text-[#10A352]">
                    Synced {lastSyncedAt}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => fetchBackendData(true)}
                  disabled={isSyncing}
                  className="text-xs font-bold text-[#2C241B] hover:border-[#D84C27] flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#E8E3DA] bg-[#FFFEFC] shadow-2xs active:scale-95 transition-all cursor-pointer"
                >
                  <RefreshCw
                    className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-[#D84C27]' : ''}`}
                  />
                  <span>{isSyncing ? 'Syncing...' : 'Sync Orders'}</span>
                </button>
                <button
                  onClick={() => setStaffTab('queue')}
                  className={`text-sm font-bold pb-2 border-b-2 transition-colors ${
                    staffTab === 'queue'
                      ? 'border-[#D84C27] text-[#D84C27]'
                      : 'border-transparent text-[#6B635A]'
                  }`}
                >
                  Order Queue ({orders.length})
                </button>
                <button
                  onClick={() => setStaffTab('menu')}
                  className={`text-sm font-bold pb-2 border-b-2 transition-colors ${
                    staffTab === 'menu'
                      ? 'border-[#D84C27] text-[#D84C27]'
                      : 'border-transparent text-[#6B635A]'
                  }`}
                >
                  Menu Manager
                </button>
              </div>
            </div>

            {staffTab === 'queue' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {orders.length === 0 ? (
                  <div className="col-span-full bg-[#FFFEFC] border border-[#E8E3DA] rounded-2xl p-12 text-center">
                    <ChefHat className="w-10 h-10 text-[#6B635A] mx-auto mb-3" />
                    <h3 className="font-serif text-xl font-bold text-[#2C241B]">
                      Order Queue is Empty
                    </h3>
                    <p className="text-sm text-[#6B635A] mt-1">
                      Place a Dine-In, Takeaway, or Delivery order from the Menu tab to see it appear here.
                    </p>
                  </div>
                ) : (
                  orders.map((order) => (
                    <div
                      key={order._id || order.tx_ref}
                      className="bg-[#FFFEFC] border border-[#E8E3DA] p-6 shadow-sm rounded-2xl flex flex-col justify-between"
                    >
                      <div>
                        {/* SERVICE MODE BADGE ON STAFF TICKET */}
                        <div className="mb-4 flex items-center justify-between gap-2">
                          {order.ServiceType === 'Dine-In' && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#2C241B] text-[#F9F6F0] text-xs font-mono font-bold uppercase tracking-wider">
                              <UtensilsCrossed className="w-3.5 h-3.5 text-[#D84C27]" />
                              DINE-IN • TABLE #{order.TableNumber || '1'}
                            </span>
                          )}
                          {order.ServiceType === 'Takeaway' && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#D84C27] text-white text-xs font-mono font-bold uppercase tracking-wider">
                              <Store className="w-3.5 h-3.5" />
                              TAKEAWAY PICKUP
                            </span>
                          )}
                          {order.ServiceType === 'Delivery' && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#10A352] text-white text-xs font-mono font-bold uppercase tracking-wider">
                              <Truck className="w-3.5 h-3.5" />
                              DELIVERY DISPATCH
                            </span>
                          )}

                          <span className="bg-[#10A352]/10 text-[#10A352] px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded-full">
                            {order.PaymentStatus || 'Paid'}
                          </span>
                        </div>

                        {/* Customer Contact Details */}
                        <div className="mb-4 pb-4 border-b border-[#E8E3DA] space-y-1">
                          <div className="font-serif font-bold text-lg text-[#2C241B] flex items-center justify-between">
                            <span>{order.CustomerName}</span>
                            <span className="font-mono text-xs text-[#6B635A]">#{order.tx_ref}</span>
                          </div>

                          {order.CustomerPhone && (
                            <div className="font-mono text-xs text-[#2C241B] flex items-center gap-1.5">
                              <Phone className="w-3.5 h-3.5 text-[#D84C27]" />
                              <span>{order.CustomerPhone}</span>
                            </div>
                          )}

                          {order.ServiceType === 'Delivery' && order.DeliveryAddress && (
                            <div className="text-xs bg-[#F9F6F0] p-2.5 rounded-xl border border-[#E8E3DA] text-[#2C241B] flex items-start gap-1.5 mt-2">
                              <MapPin className="w-4 h-4 text-[#D84C27] shrink-0 mt-0.5" />
                              <span>
                                <strong>Deliver To:</strong> {order.DeliveryAddress}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Itemized Meals & Beverages */}
                        <div className="space-y-2.5 mb-5">
                          {(order.items || []).map((item, i) => (
                            <div
                              key={i}
                              className="flex justify-between items-center text-sm bg-[#F9F6F0] px-3.5 py-2.5 rounded-xl border border-[#E8E3DA]"
                            >
                              <span className="font-medium text-[#2C241B]">
                                <span className="font-mono font-bold mr-2 text-[#D84C27]">
                                  {item.Quantity}x
                                </span>
                                {item.DishName}
                              </span>
                              <span className="font-mono text-xs text-[#6B635A]">
                                ETB {(Number(item.UnitPrice) * Number(item.Quantity)).toLocaleString()}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Allergy / Kitchen Note */}
                        {order.Message && (
                          <div className="mb-5 p-3.5 bg-[#D84C27]/10 rounded-xl border border-[#D84C27]/30">
                            <span className="block text-[10px] font-bold uppercase text-[#D84C27] mb-1">
                              Allergy / Kitchen Note
                            </span>
                            <p className="text-sm font-medium text-[#2C241B]">{order.Message}</p>
                          </div>
                        )}
                      </div>

                      {/* STAFF STATUS DROPDOWN */}
                      <div className="pt-4 border-t border-[#E8E3DA]">
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-[11px] font-bold uppercase tracking-wider text-[#6B635A]">
                            Update Kitchen Status
                          </label>
                          <span className="font-mono text-xs font-bold text-[#2C241B]">
                            ETB {Number(order.TotalAmount || 0).toLocaleString()}
                          </span>
                        </div>
                        <select
                          value={order.OrderStatus || 'Pending Kitchen'}
                          onChange={(e) =>
                            handleUpdateOrderStatus(order._id, order.tx_ref, e.target.value)
                          }
                          className="w-full py-3 px-3.5 bg-[#F9F6F0] border border-[#E8E3DA] text-[#2C241B] text-sm font-bold rounded-xl outline-none focus:border-[#D84C27] cursor-pointer transition-colors"
                        >
                          {ORDER_STATUS_OPTIONS.map((statusOption) => (
                            <option key={statusOption} value={statusOption}>
                              {statusOption}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {staffTab === 'menu' && (
              <div className="max-w-2xl bg-[#FFFEFC] p-8 rounded-2xl border border-[#E8E3DA] shadow-sm">
                <h2 className="font-serif text-xl font-bold mb-2">Post New Ethiopian Dish</h2>
                <p className="text-xs text-[#6B635A] mb-6">
                  Note: Standard Beverages & Drinks are permanently available on the customer menu and cart drawer.
                </p>
                {statusMsg && (
                  <div className="mb-4 p-3 bg-[#10A352]/10 text-[#10A352] text-sm font-bold rounded-xl">
                    {statusMsg}
                  </div>
                )}

                <form onSubmit={handleCreateMenu} className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-[#6B635A] uppercase tracking-wider mb-1.5">
                      Dish Name *
                    </label>
                    <input
                      required
                      placeholder="e.g. Awaze Rosemary Derek Tibs"
                      value={formData.DishName}
                      onChange={(e) => setFormData({ ...formData, DishName: e.target.value })}
                      className="w-full p-3 bg-[#F9F6F0] border border-[#E8E3DA] rounded-xl text-sm outline-none focus:border-[#D84C27]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#6B635A] uppercase tracking-wider mb-1.5">
                        Price (ETB) *
                      </label>
                      <input
                        required
                        type="number"
                        placeholder="480"
                        value={formData.Price}
                        onChange={(e) => setFormData({ ...formData, Price: e.target.value })}
                        className="w-full p-3 bg-[#F9F6F0] border border-[#E8E3DA] rounded-xl text-sm outline-none font-mono focus:border-[#D84C27]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#6B635A] uppercase tracking-wider mb-1.5">
                        Preparation Time of the Meal (Minutes) *
                      </label>
                      <input
                        required
                        type="number"
                        placeholder="20"
                        value={formData.prep_time_minutes}
                        onChange={(e) =>
                          setFormData({ ...formData, prep_time_minutes: e.target.value })
                        }
                        className="w-full p-3 bg-[#F9F6F0] border border-[#E8E3DA] rounded-xl text-sm outline-none font-mono focus:border-[#D84C27]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#6B635A] uppercase tracking-wider mb-1.5">
                      Category *
                    </label>
                    <select
                      value={formData.Category}
                      onChange={(e) => setFormData({ ...formData, Category: e.target.value })}
                      className="w-full p-3 bg-[#F9F6F0] border border-[#E8E3DA] rounded-xl text-sm outline-none focus:border-[#D84C27]"
                    >
                      {CATEGORIES.filter((c) => c !== 'All' && c !== 'Beverages & Drinks').map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#6B635A] uppercase tracking-wider mb-1.5">
                      Ingredients / Spices (Comma Separated) *
                    </label>
                    <input
                      required
                      placeholder="e.g. Beef, Awaze, Rosemary, Niter Kibbeh"
                      value={formData.Ingredients}
                      onChange={(e) => setFormData({ ...formData, Ingredients: e.target.value })}
                      className="w-full p-3 bg-[#F9F6F0] border border-[#E8E3DA] rounded-xl text-sm outline-none focus:border-[#D84C27]"
                    />
                  </div>

                  <div className="p-4 border border-dashed border-[#E8E3DA] rounded-xl bg-[#F9F6F0]">
                    <label className="block text-xs font-bold text-[#6B635A] uppercase tracking-wider mb-2 flex items-center gap-2">
                      <Upload className="w-4 h-4" /> Food Image Upload *
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setImageFile(file);
                          setImagePreview(URL.createObjectURL(file));
                        }
                      }}
                      className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#2C241B] file:text-white hover:file:bg-[#D84C27]"
                    />
                    {imagePreview && (
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="mt-4 w-full h-40 object-cover rounded-xl"
                      />
                    )}
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 bg-[#D84C27] hover:bg-[#B73D1E] text-white font-bold rounded-xl transition-transform active:scale-[0.98]"
                  >
                    Publish Traditional Dish
                  </button>
                </form>
              </div>
            )}
          </div>
        )}
      </main>

      {/* --- STAFF LOGIN MODAL --- */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-[70] bg-[#2C241B]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FFFEFC] w-full max-w-sm rounded-[2rem] p-8 shadow-2xl">
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 bg-[#F9F6F0] rounded-full flex items-center justify-center text-[#2C241B]">
                <KeyRound className="w-6 h-6" />
              </div>
              <button
                onClick={() => {
                  setIsAuthModalOpen(false);
                  setAuthError('');
                }}
                className="text-[#6B635A] hover:text-[#2C241B]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <h3 className="font-serif text-2xl font-bold text-[#2C241B] mb-2">
              Staff Authorization
            </h3>
            <p className="text-sm text-[#6B635A] mb-6">
              Enter your 4-digit PIN to access the kitchen order queue and menu manager.
            </p>

            <form onSubmit={handleStaffLogin} className="space-y-4">
              <div>
                <input
                  type="password"
                  maxLength={4}
                  placeholder="••••"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  className={`w-full p-4 bg-[#F9F6F0] border rounded-xl text-center text-2xl tracking-[1em] font-mono outline-none transition-colors ${
                    authError
                      ? 'border-red-500 focus:border-red-500'
                      : 'border-[#E8E3DA] focus:border-[#2C241B]'
                  }`}
                  autoFocus
                />
                {authError && (
                  <p className="text-red-500 text-xs font-bold mt-2 text-center">{authError}</p>
                )}
              </div>
              <button
                type="submit"
                className="w-full py-4 bg-[#2C241B] hover:bg-[#D84C27] text-white font-bold rounded-xl transition-transform active:scale-[0.98]"
              >
                Authenticate
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- CART DRAWER (With Service Option Selector & Table Picker) --- */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="absolute inset-0 bg-[#2C241B]/20 backdrop-blur-sm"
            onClick={() => setIsCartOpen(false)}
          />
          <div className="relative w-full max-w-md bg-[#FFFEFC] h-full shadow-2xl flex flex-col">
            <div className="p-6 border-b border-[#E8E3DA] flex justify-between items-center">
              <h2 className="font-serif text-2xl font-bold text-[#2C241B]">Your Order Tray</h2>
              <button
                onClick={() => setIsCartOpen(false)}
                className="text-[#6B635A] hover:text-[#2C241B]"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {cart.length === 0 ? (
                <p className="text-center text-[#6B635A] mt-10">Your tray is empty.</p>
              ) : (
                cart.map((item) => (
                  <div key={item._id} className="flex gap-4">
                    <img
                      src={item.ImageUrl}
                      alt={item.DishName}
                      className="w-20 h-20 object-cover rounded-xl"
                    />
                    <div className="flex-1">
                      <h4 className="font-serif font-bold text-[#2C241B] leading-tight">
                        {item.DishName}
                      </h4>
                      <div className="font-mono text-sm text-[#6B635A] mt-1 tabular-nums">
                        ETB {item.Price}
                      </div>
                      <div className="flex items-center gap-3 mt-3">
                        <button
                          type="button"
                          onClick={() => updateCartQty(item._id, item.Quantity - 1)}
                          className="p-1 border border-[#E8E3DA] rounded hover:bg-[#F9F6F0]"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-mono text-sm">{item.Quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateCartQty(item._id, item.Quantity + 1)}
                          className="p-1 border border-[#E8E3DA] rounded hover:bg-[#F9F6F0]"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <div className="font-mono font-bold text-[#2C241B] tabular-nums">
                      ETB {item.Price * item.Quantity}
                    </div>
                  </div>
                ))
              )}

              {/* PERMANENT BEVERAGE PAIRING INSIDE CART */}
              <div className="border-t border-[#E8E3DA] pt-5">
                <span className="text-xs font-bold uppercase tracking-wider text-[#D84C27] flex items-center gap-1.5 mb-3">
                  <Coffee className="w-3.5 h-3.5" /> Add a Chilled Drink or Juice
                </span>
                <div className="grid grid-cols-2 gap-2.5">
                  {PERMANENT_BEVERAGES.slice(0, 4).map((bev) => {
                    const inCart = cart.find((c) => c._id === bev._id);
                    return (
                      <button
                        key={bev._id}
                        type="button"
                        onClick={() => handleAddToCart(bev, 1)}
                        className={`p-2.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                          inCart
                            ? 'bg-[#D84C27]/10 border-[#D84C27]'
                            : 'bg-[#F9F6F0] border-[#E8E3DA] hover:border-[#2C241B]'
                        }`}
                      >
                        <div className="min-w-0 pr-2">
                          <div className="text-xs font-bold text-[#2C241B] truncate">
                            {bev.DishName.replace('Chilled ', '').replace(
                              'Ice-Cold Glass Bottle ',
                              ''
                            )}
                          </div>
                          <div className="font-mono text-[11px] text-[#6B635A]">
                            ETB {bev.Price}
                          </div>
                        </div>
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#2C241B] text-white shrink-0">
                          {inCart ? `${inCart.Quantity}x` : '+'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {cart.length > 0 && (
                <div className="border-t border-[#E8E3DA] pt-6 mt-6 space-y-5">
                  <h3 className="font-serif text-lg font-bold text-[#2C241B]">
                    1. Select Service Option
                  </h3>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'Dine-In', label: 'Dine-In', sub: 'At Table', icon: UtensilsCrossed },
                      { id: 'Takeaway', label: 'Takeaway', sub: 'Counter Pickup', icon: Store },
                      { id: 'Delivery', label: 'Delivery', sub: 'To Office/Home', icon: Truck }
                    ].map((option) => {
                      const IconComponent = option.icon;
                      const active = serviceType === option.id;
                      return (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => setServiceType(option.id)}
                          className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                            active
                              ? 'bg-[#2C241B] text-[#F9F6F0] border-[#2C241B] shadow-xs'
                              : 'bg-[#F9F6F0] text-[#2C241B] border-[#E8E3DA] hover:border-[#2C241B]'
                          }`}
                        >
                          <IconComponent
                            className={`w-4 h-4 ${active ? 'text-[#D84C27]' : 'text-[#6B635A]'}`}
                          />
                          <span className="text-xs font-bold">{option.label}</span>
                          <span className="text-[10px] opacity-75">{option.sub}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* DINE-IN TABLE SELECTOR */}
                  {serviceType === 'Dine-In' && (
                    <div className="p-4 rounded-2xl bg-[#F9F6F0] border border-[#E8E3DA]">
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#2C241B] mb-2.5">
                        Select Your Table Number *
                      </label>
                      <div className="grid grid-cols-6 gap-2">
                        {TABLE_NUMBERS.map((num) => {
                          const isSelected = String(tableNumber) === String(num);
                          return (
                            <button
                              key={num}
                              type="button"
                              onClick={() => setTableNumber(String(num))}
                              className={`py-2.5 rounded-xl font-mono text-sm font-bold border transition-all ${
                                isSelected
                                  ? 'bg-[#D84C27] text-white border-[#D84C27] scale-105'
                                  : 'bg-[#FFFEFC] text-[#2C241B] border-[#E8E3DA] hover:border-[#2C241B]'
                              }`}
                            >
                              {num}
                            </button>
                          );
                        })}
                      </div>
                      <p className="text-[11px] text-[#6B635A] mt-2">
                        Your food will be served directly to{' '}
                        <strong className="text-[#2C241B]">Table #{tableNumber}</strong>.
                      </p>
                    </div>
                  )}

                  <h3 className="font-serif text-lg font-bold text-[#2C241B]">
                    2. Contact Information
                  </h3>

                  {checkoutError && (
                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs font-bold text-red-600">
                      {checkoutError}
                    </div>
                  )}

                  <input
                    type="text"
                    required
                    placeholder="Your Name *"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full p-3 bg-[#F9F6F0] border border-[#E8E3DA] rounded-xl focus:border-[#2C241B] outline-none text-sm"
                  />

                  <input
                    type="tel"
                    required={serviceType !== 'Dine-In'}
                    placeholder={
                      serviceType === 'Dine-In'
                        ? 'Phone Number (Optional for Dine-In)'
                        : 'Phone Number (Required) *'
                    }
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full p-3 bg-[#F9F6F0] border border-[#E8E3DA] rounded-xl focus:border-[#2C241B] outline-none text-sm font-mono"
                  />

                  {serviceType === 'Delivery' && (
                    <div className="space-y-2">
                      <input
                        type="text"
                        required
                        placeholder="Delivery Address / Office Location *"
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        className="w-full p-3 bg-[#F9F6F0] border border-[#E8E3DA] rounded-xl focus:border-[#2C241B] outline-none text-sm"
                      />
                      <div className="p-3 rounded-xl bg-[#10A352]/10 border border-[#10A352]/30 text-xs text-[#2C241B]">
                        <strong className="block text-[#10A352] uppercase text-[10px] mb-0.5">
                          Restaurant Dispatch Contact:
                        </strong>
                        <span className="font-mono font-bold">
                          {RESTAURANT_DISPATCH_CONTACT.phone}
                        </span>
                      </div>
                    </div>
                  )}

                  <textarea
                    placeholder="Allergy notes or ingredients to exclude (e.g., No onions)..."
                    rows="2"
                    value={orderMessage}
                    onChange={(e) => setOrderMessage(e.target.value)}
                    className="w-full p-3 bg-[#F9F6F0] border border-[#E8E3DA] rounded-xl focus:border-[#2C241B] outline-none text-sm resize-none"
                  />
                </div>
              )}
            </div>

            <div className="p-6 bg-[#F9F6F0] border-t border-[#E8E3DA]">
              <div className="flex justify-between items-center mb-6">
                <span className="font-bold text-[#6B635A]">Total</span>
                <span className="font-serif text-2xl font-bold text-[#2C241B] tabular-nums">
                  ETB {cartTotal.toLocaleString()}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCheckoutSubmit}
                disabled={isSubmitting || cart.length === 0}
                className="w-full py-4 bg-[#10A352] hover:bg-[#0D8A45] text-white font-bold rounded-xl text-sm tracking-wide transition-transform active:scale-[0.98] cursor-pointer"
              >
                Pay with Chapa (
                {serviceType === 'Dine-In' ? `Table #${tableNumber}` : serviceType})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CHAPA MODAL SIMULATION */}
      {pendingChapaOrder && (
        <div className="fixed inset-0 z-[60] bg-[#2C241B]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FFFEFC] w-full max-w-sm rounded-[2rem] p-8 shadow-2xl text-center">
            <div className="w-16 h-16 bg-[#10A352] text-white rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="font-serif text-2xl font-bold mb-1">Chapa Checkout</h3>
            <p className="text-xs font-bold uppercase tracking-wider text-[#6B635A] mb-4">
              {pendingChapaOrder.ServiceType === 'Dine-In'
                ? `Dine-In • Table #${pendingChapaOrder.TableNumber}`
                : pendingChapaOrder.ServiceType}
            </p>
            <p className="font-mono text-3xl font-bold text-[#10A352] mb-8">
              ETB {pendingChapaOrder.TotalAmount}
            </p>
            <button
              onClick={() => verifyPayment(pendingChapaOrder.tx_ref)}
              className="w-full py-4 bg-[#10A352] text-white font-bold rounded-full hover:bg-[#0D8A45] transition-transform active:scale-[0.98]"
            >
              Complete Chapa Payment
            </button>
            <button
              onClick={() => setPendingChapaOrder(null)}
              className="mt-4 text-sm font-medium text-[#6B635A] hover:text-[#2C241B]"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function MenuCard({ dish, onAdd, cartItem, updateQty, onViewDetail }) {
  const [qty, setQty] = useState(1);
  return (
    <article className="group flex flex-col bg-[#FFFEFC] rounded-2xl overflow-hidden border border-[#E8E3DA] shadow-sm hover:shadow-md transition-shadow">
      <div
        className="relative aspect-[4/3] w-full overflow-hidden bg-[#E8E3DA] cursor-pointer"
        onClick={onViewDetail}
      >
        <img
          src={dish.ImageUrl}
          alt={dish.DishName}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      </div>
      <div className="p-5 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-serif text-xl font-bold text-[#2C241B] leading-tight pr-4">
            {dish.DishName}
          </h3>
          <span className="font-mono text-lg font-bold text-[#D84C27] tabular-nums shrink-0">
            ETB {dish.Price}
          </span>
        </div>

        <button
          onClick={onViewDetail}
          className="text-left text-sm font-semibold text-[#6B635A] hover:text-[#D84C27] underline decoration-[#E8E3DA] hover:decoration-[#D84C27] underline-offset-4 mb-6 transition-colors w-fit"
        >
          View Ingredients & Details
        </button>

        <div className="mt-auto">
          {cartItem ? (
            <div className="flex items-center justify-between border-t border-[#E8E3DA] pt-4">
              <span className="text-sm font-bold text-[#D84C27]">In Cart</span>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => updateQty(dish._id, cartItem.Quantity - 1)}
                  className="text-[#6B635A] hover:text-[#2C241B] bg-[#F9F6F0] p-1.5 rounded"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="font-mono font-bold tabular-nums">{cartItem.Quantity}</span>
                <button
                  onClick={() => updateQty(dish._id, cartItem.Quantity + 1)}
                  className="text-[#6B635A] hover:text-[#2C241B] bg-[#F9F6F0] p-1.5 rounded"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 border-t border-[#E8E3DA] pt-4">
              <div className="flex items-center gap-3 px-3 py-2 bg-[#F9F6F0] rounded-xl border border-[#E8E3DA]">
                <button
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="text-[#6B635A] hover:text-[#2C241B]"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="font-mono text-sm font-bold tabular-nums w-4 text-center">
                  {qty}
                </span>
                <button
                  onClick={() => setQty(qty + 1)}
                  className="text-[#6B635A] hover:text-[#2C241B]"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <button
                onClick={() => {
                  onAdd(dish, qty);
                  setQty(1);
                }}
                className="flex-1 py-2.5 rounded-xl bg-[#2C241B] hover:bg-[#D84C27] text-white text-sm font-bold transition-colors active:scale-[0.98]"
              >
                Add to Order
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

function DishDetailActions({ dish, cartItem, onAdd, updateQty }) {
  const [qty, setQty] = useState(1);

  if (cartItem) {
    return (
      <div className="flex items-center gap-6">
        <span className="text-sm font-bold text-[#D84C27]">Item is in your Cart</span>
        <div className="flex items-center gap-4 bg-[#F9F6F0] border border-[#E8E3DA] rounded-xl px-4 py-2">
          <button
            onClick={() => updateQty(dish._id, cartItem.Quantity - 1)}
            className="text-[#6B635A] hover:text-[#2C241B] p-2"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="font-mono font-bold tabular-nums text-lg">{cartItem.Quantity}</span>
          <button
            onClick={() => updateQty(dish._id, cartItem.Quantity + 1)}
            className="text-[#6B635A] hover:text-[#2C241B] p-2"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-4 px-4 py-3 bg-[#F9F6F0] rounded-xl border border-[#E8E3DA]">
        <button
          onClick={() => setQty(Math.max(1, qty - 1))}
          className="text-[#6B635A] hover:text-[#2C241B] p-1"
        >
          <Minus className="w-5 h-5" />
        </button>
        <span className="font-mono text-lg font-bold tabular-nums w-6 text-center">{qty}</span>
        <button
          onClick={() => setQty(qty + 1)}
          className="text-[#6B635A] hover:text-[#2C241B] p-1"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>
      <button
        onClick={() => {
          onAdd(dish, qty);
          setQty(1);
        }}
        className="flex-1 py-4 rounded-xl bg-[#2C241B] hover:bg-[#D84C27] text-white text-base font-bold transition-colors active:scale-[0.98]"
      >
        Add to Order — ETB {dish.Price * qty}
      </button>
    </div>
  );
}