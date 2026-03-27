import React, { useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';

// Guard: only import native ads module on device builds, not in Metro JS evaluation
const isExpoGo = !!(global as any).expo?.modules?.ExpoGo;

let BannerAd: any = null;
let BannerAdSize: any = null;
let TestIds: any = null;

if (!isExpoGo) {
  try {
    const ads = require('react-native-google-mobile-ads');
    BannerAd = ads.BannerAd;
    BannerAdSize = ads.BannerAdSize;
    TestIds = ads.TestIds;
  } catch (e) {
    // Native module not available — silently skip
  }
}

const BANNER_ID = __DEV__
  ? TestIds?.ADAPTIVE_BANNER ?? ''
  : 'ca-app-pub-9942161594730475/1344361748';

export default function AdBanner() {
  const [adFailed, setAdFailed] = useState(false);

  // Don't render if native module unavailable or ad failed
  if (!BannerAd || !BannerAdSize || adFailed) {
    return null;
  }

  return (
    <View style={styles.container}>
      <BannerAd
        unitId={BANNER_ID}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
        }}
        onAdFailedToLoad={() => setAdFailed(true)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: '100%',
    marginVertical: 8,
  },
});