// App.tsx
import React, { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { NavigationContainer } from '@react-navigation/native';
import { store, persistor } from './src/store';
import { useSelector } from 'react-redux';
import { RootState } from './src/store';
import MainNavigator from '~/navigation/MainNavigator';
import AuthNavigator from '~/navigation/AuthNavigator';
import './global.css';
import { SafeAreaView, StatusBar } from 'react-native';
import { useTheme } from './src/theme/ThemeContext';

import { ThemeProvider } from './src/theme/ThemeContext'

const AppContent: React.FC = () => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  
  // Ajout de logs pour le débogage
  useEffect(() => {
    console.log('État d\'authentification changé:', { isAuthenticated, userId: user?.id });
  }, [isAuthenticated, user]);

  return (
    <NavigationContainer>
      {isAuthenticated ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};

export default function App() {
    const { isDark, toggleTheme } = useTheme();

    useEffect(() => {
      toggleTheme()
    }, []);
  
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
         <SafeAreaView style={{ flex: 1 , paddingTop: 20 }}>

         <ThemeProvider>
         <StatusBar 
                barStyle={isDark ? 'light-content' : 'dark-content'}
                backgroundColor={isDark ? 'black' : 'rgb(139, 139, 139)'}
                translucent={true}
              />
        <AppContent />
         </ThemeProvider>
        
         </SafeAreaView>
      </PersistGate>
    </Provider>
  );
}