import React from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Home, Grid, ShoppingBag, User } from 'lucide-react-native';
import { Theme } from '../theme/Theme';
import { useAuth } from '../context/AuthContext';

// Screens
import SplashScreen from '../screens/SplashScreen';
import HomeScreen from '../screens/HomeScreen';
import CollectionsScreen from '../screens/CollectionsScreen';
import ProductDetailsScreen from '../screens/ProductDetailsScreen';
import CartScreen from '../screens/CartScreen';
import CheckoutScreen from '../screens/CheckoutScreen';
import PaymentScreen from '../screens/PaymentScreen';
import OrderConfirmationScreen from '../screens/OrderConfirmationScreen';
import TrackOrderScreen from '../screens/TrackOrderScreen';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';

import CustomerProfile from '../screens/Customer/CustomerProfile';
import AdminDashboard from '../screens/Admin/AdminDashboard';
import DeliveryDashboard from '../screens/Delivery/DeliveryDashboard';

// Admin Screens
import ProductListScreen from '../screens/Admin/Products/ProductListScreen';
import AddProductScreen from '../screens/Admin/Products/AddProductScreen';
import OrderListScreen from '../screens/Admin/Orders/OrderListScreen';
import OrderDetailsScreen from '../screens/Admin/Orders/OrderDetailsScreen';
import InventoryScreen from '../screens/Admin/Inventory/InventoryScreen';
import CustomerListScreen from '../screens/Admin/Customers/CustomerListScreen';
import ReportsScreen from '../screens/Admin/Reports/ReportsScreen';


const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function CustomerHomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="ProductDetails" component={ProductDetailsScreen} />
      <Stack.Screen name="Collections" component={CollectionsScreen} />
    </Stack.Navigator>
  );
}

function AdminStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Dashboard" component={AdminDashboard} />
      <Stack.Screen name="ProductList" component={ProductListScreen} />
      <Stack.Screen name="AddProduct" component={AddProductScreen} />
      <Stack.Screen name="OrderList" component={OrderListScreen} />
      <Stack.Screen name="OrderDetails" component={OrderDetailsScreen} />
      <Stack.Screen name="Inventory" component={InventoryScreen} />
      <Stack.Screen name="CustomerList" component={CustomerListScreen} />
      <Stack.Screen name="Reports" component={ReportsScreen} />
    </Stack.Navigator>
  );
}


// Wrapper to require login for Account tab
function AccountTabWrapper({ navigation }: any) {
  const { token } = useAuth();
  
  if (!token) {
    return (
      <View style={styles.guestContainer}>
        <Text style={styles.guestTitle}>Sign in for a better experience</Text>
        <Text style={styles.guestSub}>Manage your orders, addresses, and wishlist</Text>
        <TouchableOpacity style={styles.guestBtn} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.guestBtnText}>Sign In / Register</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  return <CustomerProfile />;
}

function CustomerTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: Theme.colors.primary,
        tabBarInactiveTintColor: Theme.colors.textLight,
        tabBarStyle: {
          borderTopColor: Theme.colors.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarIcon: ({ color, size }) => {
          if (route.name === 'Home') return <Home size={size} color={color} />;
          if (route.name === 'Collections') return <Grid size={size} color={color} />;
          if (route.name === 'Cart') return <ShoppingBag size={size} color={color} />;
          if (route.name === 'Account') return <User size={size} color={color} />;
          return null;
        },
      })}
    >
      <Tab.Screen name="Home" component={CustomerHomeStack} />
      <Tab.Screen name="Collections" component={CollectionsScreen} /> 
      <Tab.Screen name="Cart" component={CartScreen} />
      <Tab.Screen name="Account" component={AccountTabWrapper} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={Theme.colors.primary} />
      </View>
    );
  }

  const role = user?.roles?.[0] || 'Customer';

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Splash">
      <Stack.Screen name="Splash" component={SplashScreen} />
      
      {role === 'Admin' || role === 'SuperAdmin' || role === 'Manager' ? (
        <Stack.Screen name="AdminDashboardRoot" component={AdminStack} />
      ) : role === 'Delivery' ? (
        <Stack.Screen name="DeliveryDashboard" component={DeliveryDashboard} />
      ) : (
        <>
          <Stack.Screen name="Landing" component={CustomerTabs} />
          {/* Checkout Flow accessible to authenticated customers */}
          <Stack.Screen name="Checkout" component={CheckoutScreen} />
          <Stack.Screen name="Payment" component={PaymentScreen} />
          <Stack.Screen name="OrderConfirmation" component={OrderConfirmationScreen} />
          <Stack.Screen name="TrackOrder" component={TrackOrderScreen} />
        </>
      )}

      {/* Auth screens available to anyone */}
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  guestContainer: {
    flex: 1,
    backgroundColor: Theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  guestTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Theme.colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  guestSub: {
    fontSize: 14,
    color: Theme.colors.textLight,
    textAlign: 'center',
    marginBottom: 32,
  },
  guestBtn: {
    backgroundColor: Theme.colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 24,
  },
  guestBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  }
});
