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

  // Keep a stable ref so async callbacks always see the latest user
  const userRef = useRef(user);
  useEffect(() => {
    userRef.current = user;
  }, [user]);

  const checkAdRemovalStatus = useCallback(async () => {
    // Fast path: local cache
    try {
      const cached = await AsyncStorage.getItem(AD_REMOVAL_CACHE_KEY);
      if (cached === 'true') {
        setAdsRemoved(true);
        return;
      }
    } catch (err) {
      console.error('[AdRemoval] AsyncStorage read error:', err);
    }

    // Slow path: Firestore (only when logged in)
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
  }, []); // userRef is a stable ref — no deps needed

  useEffect(() => {
    checkAdRemovalStatus();
  }, [user, checkAdRemovalStatus]);

  const persistPurchase = useCallback(async () => {
    await AsyncStorage.setItem(AD_REMOVAL_CACHE_KEY, 'true');

    const currentUser = userRef.current;
    if (currentUser && isFirebaseConfigured()) {
      try {
        const userId = currentUser.username.trim().toLowerCase();
        const userDocRef = doc(db as Firestore, FIRESTORE_COLLECTION, userId);
        await updateDoc(userDocRef, { [FIRESTORE_FIELD]: true });
      } catch (err) {
        // Local cache is already set — Firestore will sync on next launch
        console.error('[AdRemoval] Firestore sync error:', err);
      }
    }
  }, []);

  const initiateRemoveAdsPurchase = async () => {
    Alert.alert('Coming Soon', 'In-app purchases will be available in the next update.');
  };

  const restoreAds = async () => {
    Alert.alert('Coming Soon', 'Restore purchases will be available in the next update.');
  };

  return (
    <AdRemovalContext.Provider
      value={{ adsRemoved, isPurchasing, initiateRemoveAdsPurchase, restoreAds, checkAdRemovalStatus }}
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
