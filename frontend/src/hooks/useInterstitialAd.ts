import { useEffect, useState, useRef } from 'react';
import {
  InterstitialAd,
  AdEventType,
  TestIds,
} from 'react-native-google-mobile-ads';

const INTERSTITIAL_ID = __DEV__
  ? TestIds.INTERSTITIAL
  : 'ca-app-pub-9942161594730475/1152790059';

export function useInterstitialAd() {
  const [loaded, setLoaded] = useState(false);
  const adRef = useRef<InterstitialAd | null>(null);

  const loadAd = () => {
    const ad = InterstitialAd.createForAdRequest(INTERSTITIAL_ID, {
      requestNonPersonalizedAdsOnly: true,
    });

    ad.addAdEventListener(AdEventType.LOADED, () => setLoaded(true));
    ad.addAdEventListener(AdEventType.CLOSED, () => {
      setLoaded(false);
      loadAd();
    });
    ad.addAdEventListener(AdEventType.ERROR, () => setLoaded(false));

    ad.load();
    adRef.current = ad;
  };

  useEffect(() => {
    loadAd();
    return () => {
      adRef.current = null;
    };
  }, []);

  const showAd = () => {
    if (loaded && adRef.current) {
      adRef.current.show();
    }
  };

  return { showAd, loaded };
}