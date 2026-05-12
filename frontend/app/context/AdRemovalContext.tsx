import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  ReactNode,
} from 'react';
import { Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, getDoc, updateDoc, Firestore } from 'firebase/firestore';

import { db, isFirebaseConfigured } from '../../src/firebase/config';
import { useUser } from '../../src/context/UserContext';

// Guard: only load native IAP module on real device builds
const isExpoGo = !!(global as any).expo?.modules?.ExpoGo;

let RNIap: any = null;
if (!isExpoGo) {
  try {
    RNIap = require('react-native-iap');
  } catch {
    // Native module not available in this environment
  }
}

const PRODUCT_ID = 'remove_ads';
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

export const AdRemovalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [adsRemoved, setAdsRemoved] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const { user } = useUser();

  // Ref keeps the latest user available inside stale IAP listener closures
  const userRef = useRef(user);
  useEffect(() => {
    userRef.current = user;
  }, [user]);

  // Check status whenever the logged-in user changes
  useEffect(() => {
    checkAdRemovalStatus();
  }, [user]);

  // Initialize IAP connection and attach purchase listeners once on mount
  useEffect(() => {
    if (!RNIap) return;

    let purchaseUpdateSub: any;
    let purchaseErrorSub: any;

    const initIAP = async () => {
      try {
        await RNIap.initConnection();

        purchaseUpdateSub = RNIap.purchaseUpdatedListener(
          async (purchase: any) => {
            const receipt = purchase.transactionReceipt;
            if (receipt) {
              try {
                await RNIap.finishTransaction({ purchase, isConsumable: false });
                await handleSuccessfulPurchase();
              } catch (err) {
                console.error('[IAP] Error finishing transaction:', err);
              }
            }
          }
        );

        purchaseErrorSub = RNIap.purchaseErrorListener((error: any) => {
          if (error.code !== 'E_USER_CANCELLED') {
            Alert.alert(
              'Purchase Error',
              error.message ?? 'Unable to complete purchase. Please try again.'
            );
          }
          setIsPurchasing(false);
        });
      } catch (err) {
        console.error('[IAP] initConnection error:', err);
      }
    };

    initIAP();

    return () => {
      purchaseUpdateSub?.remove();
      purchaseErrorSub?.remove();
      RNIap.endConnection().catch(() => {});
    };
  }, []);

  const persistPurchase = async () => {
    await AsyncStorage.setItem(AD_REMOVAL_CACHE_KEY, 'true');

    const currentUser = userRef.current;
    if (currentUser && isFirebaseConfigured()) {
      try {
        const userId = currentUser.username.trim().toLowerCase();
        const userRef_ = doc(db as Firestore, FIRESTORE_COLLECTION, userId);
        await updateDoc(userRef_, { [FIRESTORE_FIELD]: true });
      } catch (err) {
        // Local cache already saved — Firestore sync can retry on next launch
        console.error('[IAP] Firestore sync error:', err);
      }
    }
  };

  const handleSuccessfulPurchase = async () => {
    setAdsRemoved(true);
    setIsPurchasing(false);
    await persistPurchase();
  };

  const checkAdRemovalStatus = async () => {
    // Fast path: check local cache
    try {
      const cached = await AsyncStorage.getItem(AD_REMOVAL_CACHE_KEY);
      if (cached === 'true') {
        setAdsRemoved(true);
        return;
      }
    } catch (err) {
      console.error('[IAP] AsyncStorage read error:', err);
    }

    // Slow path: verify against Firestore when user is logged in
    const currentUser = userRef.current;
    if (currentUser && isFirebaseConfigured()) {
      try {
        const userId = currentUser.username.trim().toLowerCase();
        const userRef_ = doc(db as Firestore, FIRESTORE_COLLECTION, userId);
        const snap = await getDoc(userRef_);
        if (snap.exists() && snap.data()?.[FIRESTORE_FIELD] === true) {
          setAdsRemoved(true);
          await AsyncStorage.setItem(AD_REMOVAL_CACHE_KEY, 'true');
        }
      } catch (err) {
        console.error('[IAP] Firestore check error:', err);
      }
    }
  };

  const initiateRemoveAdsPurchase = async () => {
    if (!RNIap) {
      Alert.alert('Not Available', 'Purchases are not available in this build.');
      return;
    }

    if (adsRemoved) {
      Alert.alert('Already Purchased', 'You have already removed ads.');
      return;
    }

    setIsPurchasing(true);

    try {
      await RNIap.getProducts({ skus: [PRODUCT_ID] });
      await RNIap.requestPurchase({
        sku: PRODUCT_ID,
        ...(Platform.OS === 'ios' && {
          andDangerouslyFinishTransactionAutomaticallyIOS: false,
        }),
      });
      // Purchase result is handled by purchaseUpdatedListener
    } catch (err: any) {
      if (err.code !== 'E_USER_CANCELLED') {
        Alert.alert(
          'Purchase Failed',
          err.message ?? 'Unable to start purchase. Please try again.'
        );
      }
      setIsPurchasing(false);
    }
  };

  const restoreAds = async () => {
    if (!RNIap) {
      Alert.alert('Not Available', 'Restore is not available in this build.');
      return;
    }

    setIsPurchasing(true);

    try {
      const purchases = await RNIap.getAvailablePurchases();
      const hasPurchase = purchases.some(
        (p: any) => p.productId === PRODUCT_ID
      );

      if (hasPurchase) {
        await handleSuccessfulPurchase();
        Alert.alert('Restored', 'Your purchase has been restored. Ads are now removed.');
      } else {
        Alert.alert(
          'No Purchase Found',
          'No previous "Remove Ads" purchase was found on this account.'
        );
        setIsPurchasing(false);
      }
    } catch (err: any) {
      Alert.alert(
        'Restore Failed',
        err.message ?? 'Unable to restore purchases. Please try again.'
      );
      setIsPurchasing(false);
    }
  };

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

export const useAdRemoval = (): AdRemovalContextType => {
  const context = useContext(AdRemovalContext);
  if (context === undefined) {
    throw new Error('useAdRemoval must be used within an AdRemovalProvider');
  }
  return context;
};
