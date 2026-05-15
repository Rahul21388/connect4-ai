import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  ReactNode,
} from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, getDoc, updateDoc, Firestore } from 'firebase/firestore';

import { db, isFirebaseConfigured } from '../firebase/config';
import { useUser } from './UserContext';

// Play Console / App Store managed-product ID for the one-time Remove-Ads IAP.
const REMOVE_ADS_SKU = 'remove_ads';

const AD_REMOVAL_CACHE_KEY = '@connect4_ad_removal';
const FIRESTORE_COLLECTION = 'users';
const FIRESTORE_FIELD = 'adRemovalPurchase';

interface AdRemovalContextType {
  adsRemoved: boolean;
  isPurchasing: boolean;
  initiateRemoveAdsPurchase: () => Promise<void>;
  restoreAds: () => Promise<void>;
  checkAdRemovalStatus: () => Promise<void>;
}

const AdRemovalContext = createContext<AdRemovalContextType | undefined>(undefined);

// react-native-iap is a native module; guard so Expo Go (which can't bundle it) still loads.
const isExpoGo = !!(global as any).expo?.modules?.ExpoGo;

let iapModule: typeof import('react-native-iap') | null = null;
if (!isExpoGo) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    iapModule = require('react-native-iap');
  } catch {
    iapModule = null;
  }
}

function purchaseMatchesRemoveAds(purchase: { productId?: string; ids?: string[] | null }) {
  if (!purchase) return false;
  if (purchase.productId === REMOVE_ADS_SKU) return true;
  return !!purchase.ids?.includes(REMOVE_ADS_SKU);
}

// Shared local-cache + Firestore mirror logic, used by both native and stub providers.
function useAdRemovalCore() {
  const [adsRemoved, setAdsRemoved] = useState(false);
  const { user } = useUser();

  const userRef = useRef(user);
  useEffect(() => {
    userRef.current = user;
  }, [user]);

  const persistPurchase = useCallback(async () => {
    setAdsRemoved(true);
    try {
      await AsyncStorage.setItem(AD_REMOVAL_CACHE_KEY, 'true');
    } catch (err) {
      console.error('[AdRemoval] AsyncStorage write error:', err);
    }

    const currentUser = userRef.current;
    if (currentUser && isFirebaseConfigured()) {
      try {
        const userId = currentUser.username.trim().toLowerCase();
        const userDocRef = doc(db as Firestore, FIRESTORE_COLLECTION, userId);
        await updateDoc(userDocRef, { [FIRESTORE_FIELD]: true });
      } catch (err) {
        // Local cache is already set — Firestore will sync on next launch.
        console.error('[AdRemoval] Firestore sync error:', err);
      }
    }
  }, []);

  const checkAdRemovalStatus = useCallback(async () => {
    try {
      const cached = await AsyncStorage.getItem(AD_REMOVAL_CACHE_KEY);
      if (cached === 'true') {
        setAdsRemoved(true);
        return;
      }
    } catch (err) {
      console.error('[AdRemoval] AsyncStorage read error:', err);
    }

    const currentUser = userRef.current;
    if (currentUser && isFirebaseConfigured()) {
      try {
        const userId = currentUser.username.trim().toLowerCase();
        const userDocRef = doc(db as Firestore, FIRESTORE_COLLECTION, userId);
        const snap = await getDoc(userDocRef);
        if (snap.exists() && snap.data()?.[FIRESTORE_FIELD] === true) {
          setAdsRemoved(true);
          await AsyncStorage.setItem(AD_REMOVAL_CACHE_KEY, 'true');
        }
      } catch (err) {
        console.error('[AdRemoval] Firestore check error:', err);
      }
    }
  }, []);

  useEffect(() => {
    checkAdRemovalStatus();
  }, [user, checkAdRemovalStatus]);

  return { adsRemoved, persistPurchase, checkAdRemovalStatus };
}

const NativeAdRemovalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { adsRemoved, persistPurchase, checkAdRemovalStatus } = useAdRemovalCore();
  const [isPurchasing, setIsPurchasing] = useState(false);
  const hasAutoRestoredRef = useRef(false);

  const { useIAP, ErrorCode } = iapModule!;

  const {
    connected,
    availablePurchases,
    requestPurchase,
    finishTransaction,
    getAvailablePurchases,
  } = useIAP({
    onPurchaseSuccess: async (purchase) => {
      try {
        if (!purchaseMatchesRemoveAds(purchase)) return;
        await persistPurchase();
        // isConsumable:false → acknowledges (does not consume) on Android, marks finished on iOS.
        await finishTransaction({ purchase, isConsumable: false });
      } catch (err) {
        console.error('[AdRemoval] onPurchaseSuccess error:', err);
      } finally {
        setIsPurchasing(false);
      }
    },
    onPurchaseError: (error) => {
      setIsPurchasing(false);
      if (error?.code === ErrorCode.UserCancelled) return;
      console.error('[AdRemoval] Purchase error:', error);
      Alert.alert('Purchase failed', error?.message ?? 'Something went wrong.');
    },
  });

  // Auto-restore on app launch: as soon as the store connects, pull existing entitlements.
  useEffect(() => {
    if (!connected || hasAutoRestoredRef.current) return;
    hasAutoRestoredRef.current = true;
    getAvailablePurchases().catch((err) => {
      console.error('[AdRemoval] Auto-restore error:', err);
    });
  }, [connected, getAvailablePurchases]);

  // Whenever the store updates availablePurchases, re-check for our SKU.
  useEffect(() => {
    if (!availablePurchases?.length) return;
    if (availablePurchases.some(purchaseMatchesRemoveAds)) {
      persistPurchase();
    }
  }, [availablePurchases, persistPurchase]);

  const initiateRemoveAdsPurchase = useCallback(async () => {
    if (!connected) {
      Alert.alert('Store unavailable', 'Could not connect to the store. Please try again later.');
      return;
    }
    setIsPurchasing(true);
    try {
      await requestPurchase({
        request: {
          google: { skus: [REMOVE_ADS_SKU] },
          apple: { sku: REMOVE_ADS_SKU },
        },
        type: 'in-app',
      });
      // Resolution arrives through onPurchaseSuccess / onPurchaseError, which clears isPurchasing.
    } catch (err) {
      setIsPurchasing(false);
      console.error('[AdRemoval] requestPurchase error:', err);
      Alert.alert('Purchase failed', 'Could not initiate purchase.');
    }
  }, [connected, requestPurchase]);

  const restoreAds = useCallback(async () => {
    if (!connected) {
      Alert.alert('Store unavailable', 'Could not connect to the store. Please try again later.');
      return;
    }
    setIsPurchasing(true);
    try {
      // Use the module-level call (not the hook variant) so we can read the result directly.
      const purchases = await iapModule!.getAvailablePurchases();
      const found = (purchases ?? []).some(purchaseMatchesRemoveAds);
      if (found) {
        await persistPurchase();
        Alert.alert('Restored', 'Your purchase has been restored.');
      } else {
        Alert.alert('Nothing to restore', 'No previous purchase was found on this account.');
      }
    } catch (err) {
      console.error('[AdRemoval] Restore error:', err);
      Alert.alert('Restore failed', 'Could not restore purchases. Please try again later.');
    } finally {
      setIsPurchasing(false);
    }
  }, [connected, persistPurchase]);

  return (
    <AdRemovalContext.Provider
      value={{
        adsRemoved,
        isPurchasing,
        initiateRemoveAdsPurchase,
        restoreAds,
        checkAdRemovalStatus,
      }}
    >
      {children}
    </AdRemovalContext.Provider>
  );
};

const StubAdRemovalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { adsRemoved, checkAdRemovalStatus } = useAdRemovalCore();
  const notAvailable = async () => {
    Alert.alert('Unavailable', 'In-app purchases are only available in the production build.');
  };

  return (
    <AdRemovalContext.Provider
      value={{
        adsRemoved,
        isPurchasing: false,
        initiateRemoveAdsPurchase: notAvailable,
        restoreAds: notAvailable,
        checkAdRemovalStatus,
      }}
    >
      {children}
    </AdRemovalContext.Provider>
  );
};

export const AdRemovalProvider: React.FC<{ children: ReactNode }> = ({ children }) =>
  iapModule
    ? <NativeAdRemovalProvider>{children}</NativeAdRemovalProvider>
    : <StubAdRemovalProvider>{children}</StubAdRemovalProvider>;

export const useAdRemoval = (): AdRemovalContextType => {
  const context = useContext(AdRemovalContext);
  if (context === undefined) {
    throw new Error('useAdRemoval must be used within an AdRemovalProvider');
  }
  return context;
};
