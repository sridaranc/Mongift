import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, StatusBar } from 'react-native';
import { Theme } from '../theme/Theme';
import { useAuth } from '../context/AuthContext';

const { width, height } = Dimensions.get('window');

export default function SplashScreen({ navigation }: any) {
  const { user, loading } = useAuth();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 5, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
    ]).start();

    const timer = setTimeout(() => {
      if (loading) return; // Wait for auth to load

      const role = user?.roles?.[0] || 'Customer';
      
      if (role === 'Admin' || role === 'SuperAdmin' || role === 'Manager') {
        navigation.replace('AdminDashboardRoot');
      } else if (role === 'Delivery') {
        navigation.replace('DeliveryDashboard');
      } else {
        navigation.replace('Landing');
      }
    }, 2800);

    return () => clearTimeout(timer);
  }, [loading, user, navigation]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Theme.colors.primary} />
      <Animated.View style={[styles.logoContainer, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        <Text style={styles.emoji}>🎁</Text>
        <Text style={styles.brand}>MON GIFT</Text>
        <Animated.Text style={[styles.tagline, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          Send gifts with love 🎁
        </Animated.Text>
      </Animated.View>

      <Animated.View style={[styles.bottomTag, { opacity: fadeAnim }]}>
        <Text style={styles.bottomText}>Premium Gift Delivery • Trichy</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  emoji: {
    fontSize: 80,
    marginBottom: 16,
  },
  brand: {
    fontSize: 42,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 6,
    marginBottom: 12,
  },
  tagline: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '300',
    letterSpacing: 1,
  },
  bottomTag: {
    position: 'absolute',
    bottom: 60,
    alignItems: 'center',
  },
  bottomText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});
