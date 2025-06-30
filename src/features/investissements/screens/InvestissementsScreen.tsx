import React, { useState, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, ScrollView, Modal } from 'react-native';
import { useTheme } from '~/theme/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

type TypeInvestissement = 'actions' | 'obligations' | 'crypto' | 'immobilier' | 'autre';

interface Investissement {
  id: number;
  famille_id: number;
  type: TypeInvestissement;
  nom: string;
  montant_investi: number;
  valeur_actuelle: number;
  date_achat: string; // Format: YYYY-MM-DD
  date_vente: string | null; // Format: YYYY-MM-DD ou null si toujours actif
  rendement: number; // En pourcentage
  description?: string;
}

// Données de démonstration
const investissementsDemo: Investissement[] = [
  {
    id: 1,
    famille_id: 1,
    type: 'crypto',
    nom: 'Bitcoin',
    montant_investi: 1000,
    valeur_actuelle: 1500,
    date_achat: '2025-01-15',
    date_vente: null,
    rendement: 50,
    description: 'Investissement à long terme'
  },
  {
    id: 2,
    famille_id: 1,
    type: 'actions',
    nom: 'Apple Inc.',
    montant_investi: 5000,
    valeur_actuelle: 5200,
    date_achat: '2024-06-01',
    date_vente: null,
    rendement: 4,
    description: 'Actions ordinaires'
  }
];

// Composant pour afficher les statistiques du portefeuille
const StatsPortefeuille = ({ investissements, isDark }: { investissements: Investissement[], isDark: boolean }) => {
  const totalInvesti = investissements.reduce((sum, inv) => sum + inv.montant_investi, 0);
  const totalActuel = investissements.reduce((sum, inv) => sum + inv.valeur_actuelle, 0);
  const rendementTotal = totalInvesti > 0 ? ((totalActuel - totalInvesti) / totalInvesti) * 100 : 0;
  
  return (
    <View className={`p-4 rounded-lg mb-4 ${isDark ? 'bg-gray-800' : 'bg-blue-50'}`}>
      <Text className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
        Vue d'ensemble du portefeuille
      </Text>
      <View className="flex-row justify-between mb-2">
        <Text className={isDark ? 'text-gray-300' : 'text-gray-600'}>Total investi:</Text>
        <Text className="font-semibold">{totalInvesti.toLocaleString('fr-FR', { style: 'currency', currency: 'MGA' })}</Text>
      </View>
      <View className="flex-row justify-between mb-2">
        <Text className={isDark ? 'text-gray-300' : 'text-gray-600'}>Valeur actuelle:</Text>
        <Text className="font-semibold">{totalActuel.toLocaleString('fr-FR', { style: 'currency', currency: 'MGA' })}</Text>
      </View>
      <View className="flex-row justify-between">
        <Text className={isDark ? 'text-gray-300' : 'text-gray-600'}>Rendement total:</Text>
        <Text className={`font-semibold ${rendementTotal >= 0 ? 'text-green-500' : 'text-red-500'}`}>
          {rendementTotal.toFixed(2)}%
        </Text>
      </View>
    </View>
  );
};

// Composant pour afficher les détails d'un investissement
const DetailInvestissement = ({ visible, investissement, onClose, isDark }: { 
  visible: boolean, 
  investissement: Investissement | null, 
  onClose: () => void,
  isDark: boolean
}) => {
  if (!investissement) return null;
  
  const plusValue = investissement.valeur_actuelle - investissement.montant_investi;
  const dureeInvestissement = Math.floor((new Date().getTime() - new Date(investissement.date_achat).getTime()) / (1000 * 60 * 60 * 24));
  
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center items-center bg-black/50 p-4">
        <View className={`w-full rounded-lg p-5 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <View className="flex-row justify-between items-center mb-4">
            <Text className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {investissement.nom}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={isDark ? '#9CA3AF' : '#6B7280'} />
            </TouchableOpacity>
          </View>
          
          <View className="mb-4">
            <Text className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Détails de l'investissement
            </Text>
            <DetailLigne label="Type" value={investissement.type} isDark={isDark} />
            <DetailLigne 
              label="Montant investi" 
              value={investissement.montant_investi.toLocaleString('fr-FR', { style: 'currency', currency: 'MGA' })} 
              isDark={isDark} 
            />
            <DetailLigne 
              label="Valeur actuelle" 
              value={investissement.valeur_actuelle.toLocaleString('fr-FR', { style: 'currency', currency: 'MGA' })} 
              isDark={isDark} 
            />
            <DetailLigne 
              label="Plus-value" 
              value={`${plusValue.toLocaleString('fr-FR', { style: 'currency', currency: 'MGA' })} (${investissement.rendement}%)`} 
              isDark={isDark}
              valueColor={plusValue >= 0 ? 'text-green-500' : 'text-red-500'}
            />
            <DetailLigne 
              label="Date d'achat" 
              value={new Date(investissement.date_achat).toLocaleDateString('fr-FR')} 
              isDark={isDark} 
            />
            <DetailLigne 
              label="Durée" 
              value={`${dureeInvestissement} jours`} 
              isDark={isDark} 
            />
          </View>
          
          {investissement.description && (
            <View className="mb-4">
              <Text className={`font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>Description</Text>
              <Text className={isDark ? 'text-gray-300' : 'text-gray-600'}>{investissement.description}</Text>
            </View>
          )}
          
          <TouchableOpacity 
            className={`py-3 rounded-lg items-center mt-2 ${isDark ? 'bg-red-600' : 'bg-red-500'}`}
            onPress={onClose}
          >
            <Text className="text-white font-semibold">Fermer</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// Composant pour afficher une ligne de détail
const DetailLigne = ({ label, value, isDark, valueColor = '' }: { 
  label: string, 
  value: string, 
  isDark: boolean,
  valueColor?: string
}) => (
  <View className="flex-row justify-between py-1">
    <Text className={isDark ? 'text-gray-400' : 'text-gray-600'}>{label}:</Text>
    <Text className={`${valueColor || (isDark ? 'text-white' : 'text-gray-900')} font-medium`}>
      {value}
    </Text>
  </View>
);

const InvestissementsScreen = () => {
  const { isDark } = useTheme();
  const [filtreType, setFiltreType] = useState<TypeInvestissement | 'tous'>('tous');
  const [recherche, setRecherche] = useState('');
  const [tri, setTri] = useState<'nom' | 'rendement' | 'valeur'>('nom');
  const [ordre, setOrdre] = useState<'asc' | 'desc'>('asc');
  const [investissementSelectionne, setInvestissementSelectionne] = useState<Investissement | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Filtrer et trier les investissements
  const investissementsFiltres = useMemo(() => {
    let resultats = [...investissementsDemo];
    
    // Filtrage par type
    if (filtreType !== 'tous') {
      resultats = resultats.filter(inv => inv.type === filtreType);
    }
    
    // Filtrage par recherche
    if (recherche) {
      const rechercheMin = recherche.toLowerCase();
      resultats = resultats.filter(inv => 
        inv.nom.toLowerCase().includes(rechercheMin) || 
        inv.description?.toLowerCase().includes(rechercheMin)
      );
    }
    
    // Tri
    resultats.sort((a, b) => {
      let comparaison = 0;
      
      switch (tri) {
        case 'nom':
          comparaison = a.nom.localeCompare(b.nom);
          break;
        case 'rendement':
          comparaison = a.rendement - b.rendement;
          break;
        case 'valeur':
          comparaison = a.valeur_actuelle - b.valeur_actuelle;
          break;
      }
      
      return ordre === 'asc' ? comparaison : -comparaison;
    });
    
    return resultats;
  }, [filtreType, recherche, tri, ordre]);
  
  const ouvrirDetails = (investissement: Investissement) => {
    setInvestissementSelectionne(investissement);
    setModalVisible(true);
  };
  
  const changerTri = (nouveauTri: typeof tri) => {
    if (tri === nouveauTri) {
      setOrdre(ordre === 'asc' ? 'desc' : 'asc');
    } else {
      setTri(nouveauTri);
      setOrdre('asc');
    }
  };

  return (
    <View className={`flex-1 p-4 ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
      <Text className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
        Investissements
      </Text>
      
      {/* Barre de recherche */}
      <View className={`mb-4 p-2 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
        <View className="flex-row items-center px-3 py-2 rounded-lg bg-white dark:bg-gray-700">
          <Ionicons name="search" size={18} color={isDark ? '#9CA3AF' : '#6B7280'} />
          <TextInput
            placeholder="Rechercher un investissement..."
            placeholderTextColor={isDark ? '#9CA3AF' : '#9CA3AF'}
            className="flex-1 ml-2 text-base text-gray-900 dark:text-white"
            value={recherche}
            onChangeText={setRecherche}
          />
          {recherche.length > 0 && (
            <TouchableOpacity onPress={() => setRecherche('')}>
              <Ionicons name="close-circle" size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      {/* Statistiques du portefeuille */}
      <StatsPortefeuille investissements={investissementsFiltres} isDark={isDark} />
      
      {/* Filtres par type */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        className="mb-4 -mx-1"
      >
        <TouchableOpacity 
          className={`px-3 py-1 rounded-full mr-2 ${filtreType === 'tous' ? 'bg-blue-500' : isDark ? 'bg-gray-800' : 'bg-white'}`}
          onPress={() => setFiltreType('tous')}
        >
          <Text className={filtreType === 'tous' ? 'text-white' : isDark ? 'text-gray-300' : 'text-gray-700'}>
            Tous
          </Text>
        </TouchableOpacity>
        
        {['actions', 'crypto', 'obligations', 'immobilier', 'autre'].map(type => (
          <TouchableOpacity
            key={type}
            className={`px-3 py-1 rounded-full mr-2 ${filtreType === type ? 'bg-blue-500' : isDark ? 'bg-gray-800' : 'bg-white'}`}
            onPress={() => setFiltreType(type as TypeInvestissement)}
          >
            <Text className={filtreType === type ? 'text-white' : isDark ? 'text-gray-300' : 'text-gray-700'}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      
      {/* En-tête de tri */}
      <View className={`flex-row justify-between items-center mb-2 px-2 ${isDark ? 'bg-gray-800' : 'bg-gray-100'} py-2 rounded-lg`}>
        <TouchableOpacity 
          className="flex-1"
          onPress={() => changerTri('nom')}
        >
          <Text className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Nom {tri === 'nom' && (ordre === 'asc' ? '↑' : '↓')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          className="flex-1 items-end"
          onPress={() => changerTri('valeur')}
        >
          <Text className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Valeur {tri === 'valeur' && (ordre === 'asc' ? '↑' : '↓')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          className="flex-1 items-end mr-2"
          onPress={() => changerTri('rendement')}
        >
          <Text className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Rendement {tri === 'rendement' && (ordre === 'asc' ? '↑' : '↓')}
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Liste des investissements */}
      <FlatList
        data={investissementsFiltres}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity 
            onPress={() => ouvrirDetails(item)}
            activeOpacity={0.8}
          >
            <View className={`p-4 mb-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <View className="flex-row justify-between items-start">
                <View>
                  <Text className={`font-semibold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {item.nom}
                  </Text>
                  <Text className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                  </Text>
                </View>
                <View className="items-end">
                  <Text className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {item.valeur_actuelle.toLocaleString('fr-FR', { style: 'currency', currency: 'MGA' })}
                  </Text>
                  <Text className={`text-sm ${item.rendement >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {item.rendement >= 0 ? '+' : ''}{item.rendement}%
                  </Text>
                </View>
              </View>
              {item.description && (
                <Text className={`mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {item.description}
                </Text>
              )}
              <View className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                <Text className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Investi: {item.montant_investi.toLocaleString('fr-FR', { style: 'currency', currency: 'MGA' })}
                  {' • '}
                  Achat: {new Date(item.date_achat).toLocaleDateString('fr-FR')}
                  {item.date_vente && ` • Vente: ${new Date(item.date_vente).toLocaleDateString('fr-FR')}`}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View className="items-center justify-center py-10">
            <Text className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Aucun investissement enregistré
            </Text>
          </View>
        }
      />
      
      {/* Modal de détail */}
      <DetailInvestissement 
        visible={modalVisible}
        investissement={investissementSelectionne}
        onClose={() => setModalVisible(false)}
        isDark={isDark}
      />
    </View>
  );
};

export default InvestissementsScreen;
