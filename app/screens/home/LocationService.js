import * as Location from 'expo-location';

const ADDRESS_FALLBACK = 'Address not available';

export default async function getUserLocation() {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      return ADDRESS_FALLBACK;
    }

    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    const { latitude, longitude } = position.coords;
    if (!latitude || !longitude) {
      return ADDRESS_FALLBACK;
    }

    // Reverse geocode (no API key required)
    const places = await Location.reverseGeocodeAsync({ latitude, longitude });

    if (places.length > 0) {
      const place = places[0];

      // Try to capture barangay name from district or subregion
      const barangay = place.district || place.subregion || '';
      const city = place.city || '';
      const province = place.region || '';
      const country = place.country || '';

      const formatted = [barangay, city, province, country]
        .filter(Boolean)
        .join(', ');

      return formatted || ADDRESS_FALLBACK;
    }

    return ADDRESS_FALLBACK;
  } catch (error) {
    console.error('Location error:', error);
    return ADDRESS_FALLBACK;
  }
}
