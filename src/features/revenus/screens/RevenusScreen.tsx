import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, Modal, ScrollView, Alert, Dimensions } from 'react-native';
import { MaterialIcons, Ionicons, FontAwesome } from '@expo/vector-icons';
// Composant de graphique à barres personnalisé avec des vues React Native
import { Picker } from '@react-native-picker/picker';
import { useTheme } from '~/theme/ThemeContext';
import DateTimePicker from '@react-native-community/datetimepicker';

// Types
interface Famille {
  id: number;
  nom: string;
  couleur: string;
}

interface Revenu {
  id: number;
  montant: number;
  date: string;
  source: string;
  description?: string;
  categorie_id: number;
  compte_id: number;
  famille_id: number;
  famille?: Famille;
  statut: 'valide' | 'en_attente' | 'annule';
}

interface Categorie {
  id: number;
  nom: string;
  couleur: string;
  icone: string;
}

interface Compte {
  id: number;
  nom: string;
  solde: number;
}

// Données statiques (à remplacer par des appels API)
const STATIC_CATEGORIES: Categorie[] = [
  { id: 1, nom: 'Salaire', couleur: '#10B981', icone: 'attach-money' },
  { id: 2, nom: 'Freelance', couleur: '#3B82F6', icone: 'laptop' },
  { id: 3, nom: 'Investissements', couleur: '#8B5CF6', icone: 'trending-up' },
  { id: 4, nom: 'Cadeau', couleur: '#EC4899', icone: 'card-giftcard' },
  { id: 5, nom: 'Autre', couleur: '#6B7280', icone: 'more-horiz' },
];

const STATIC_COMPTES: Compte[] = [
  { id: 1, nom: 'Compte Courant', solde: 0 },
  { id: 2, nom: 'Épargne', solde: 0 },
  { id: 3, nom: 'Espèces', solde: 0 },
];

const RevenusScreen = () => {
  const { isDark } = useTheme();
  const [revenus, setRevenus] = useState<Revenu[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showChart, setShowChart] = useState(true);
  
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<Omit<Revenu, 'id'>>({
    montant: 0,
    date: new Date().toISOString().split('T')[0],
    source: '',
    description: '',
    categorie_id: 1,
    compte_id: 1,
    famille_id: 1, // Valeur par défaut
    statut: 'valide',
  });
  
  // États pour le filtrage
  const [filtreMois, setFiltreMois] = useState<string>('tous'); // 'tous', 'mois_courant' ou 'plage_dates'
  const [showDateRangePicker, setShowDateRangePicker] = useState(false);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    endDate: new Date(),
  });

  // Type pour les données du graphique
  interface ChartDataPoint {
    month: string;
    total: number;
    fullDate: string;
  }

  // Type pour les données du graphique à barres
  interface BarChartProps {
    data: { month: string; total: number; fullDate: string }[];
    width: number;
    height: number;
    color: string;
    highlightColor: string;
  }
  
  // Composant de graphique à barres personnalisé avec des vues React Native
  const CustomBarChart: React.FC<BarChartProps> = ({ 
    data, 
    width, 
    height, 
    color, 
    highlightColor 
  }) => {
    if (!data.length) return null;
    
    const margin = 20;
    const chartHeight = height - margin * 2 - 40; // Réduire pour la légende
    
    // Trouver la valeur maximale pour l'échelle Y
    const maxValue = Math.max(...data.map(item => item.total), 0);
    const scaleY = (value: number) => 
      (value / (maxValue || 1)) * chartHeight * 0.9;
    
    const barWidth = 30;
    const barMargin = 10;
    
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    
    // Fonction pour formater les valeurs
    const formatValue = (value: number) => {
      if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
      if (value >= 1000) return `${Math.round(value / 1000)}K`;
      return value.toString();
    };
    
    return (
      <View style={{
        width,
        height,
        padding: 10,
      }}>
        {/* Conteneur du graphique */}
        <View style={{
          flex: 1,
          flexDirection: 'row',
          alignItems: 'flex-end',
          justifyContent: 'center',
          height: chartHeight,
          borderBottomWidth: 1,
          borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.2)',
        }}>
          {data.map((item, index) => {
            const barHeight = Math.max(5, scaleY(item.total));
            const isCurrentMonth = item.fullDate === currentMonth;
            
            return (
              <View 
                key={index} 
                style={{
                  alignItems: 'center',
                  marginHorizontal: barMargin / 2,
                  width: barWidth,
                }}
              >
                {/* Barre */}
                <View
                  style={{
                    width: barWidth - 5,
                    height: barHeight,
                    backgroundColor: isCurrentMonth ? highlightColor : color,
                    borderTopLeftRadius: 4,
                    borderTopRightRadius: 4,
                    justifyContent: 'flex-end',
                  }}
                >
                  {item.total > 0 && (
                    <Text 
                      style={{
                        color: 'white',
                        fontSize: 10,
                        textAlign: 'center',
                        marginBottom: 2,
                        fontWeight: 'bold',
                      }}
                      numberOfLines={1}
                    >
                      {formatValue(item.total)}
                    </Text>
                  )}
                </View>
                
                {/* Étiquette du mois */}
                <Text 
                  style={{
                    fontSize: 10,
                    marginTop: 4,
                    color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
                  }}
                  numberOfLines={1}
                >
                  {item.month}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  // Fonction pour obtenir les données du graphique des revenus mensuels
  const getMonthlyRevenueData = (): ChartDataPoint[] => {
    const monthlyData: { [key: string]: number } = {};
    
    // Initialiser les 6 derniers mois avec 0
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyData[monthKey] = 0;
      months.push(monthKey);
    }
    
    // Calculer le total des revenus pour chaque mois
    revenus.forEach(revenu => {
      const date = new Date(revenu.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (monthlyData.hasOwnProperty(monthKey)) {
        monthlyData[monthKey] += revenu.montant;
      } else if (months.length < 12) {
        // Si nous avons moins de 12 mois et que le mois n'existe pas encore, l'ajouter
        monthlyData[monthKey] = revenu.montant;
        months.push(monthKey);
      }
    });
    
    // Trier les mois par ordre chronologique
    const sortedMonths = [...months].sort();
    
    return sortedMonths.map(month => {
      const [year, monthNum] = month.split('-');
      const monthName = new Date(parseInt(year), parseInt(monthNum) - 1, 1).toLocaleString('fr-FR', { month: 'short' });
      
      return {
        month: monthName.charAt(0).toUpperCase() + monthName.slice(1, 3),
        total: monthlyData[month],
        fullDate: month
      };
    });
  };
  
  const monthlyRevenueData = getMonthlyRevenueData();
  const screenWidth = Dimensions.get('window').width - 48; // 48 = 24 padding de chaque côté
  const chartHeight = 220;
  
  // Fonction pour formater la monnaie
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-MG', {
      style: 'currency',
      currency: 'MGA',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Ajouter un nouveau revenu
  const handleAddRevenu = () => {
    if (!formData.montant || !formData.source) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    const newRevenu: Revenu = {
      id: Date.now(),
      ...formData,
    };

    setRevenus([...revenus, newRevenu]);
    setShowAddModal(false);
    resetForm();
  };

  // Supprimer un revenu
  const handleDeleteRevenu = (id: number) => {
    Alert.alert(
      'Supprimer le revenu',
      'Êtes-vous sûr de vouloir supprimer ce revenu ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            setRevenus(revenus.filter(rev => rev.id !== id));
          },
        },
      ]
    );
  };

  // Réinitialiser le formulaire
  const resetForm = () => {
    setFormData({
      montant: 0,
      date: new Date().toISOString().split('T')[0],
      source: '',
      description: '',
      categorie_id: 1,
      compte_id: 1,
      famille_id: 1,
      statut: 'valide',
    });
    setEditingId(null);
  };

  // Fonction pour formater la date au format YYYY-MM-DD
  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  // Filtrer les revenus par recherche, par mois et par plage de dates
  const filteredRevenus = revenus.filter(revenu => {
    const matchesSearch = 
      revenu.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (revenu.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    
    // Vérifier le filtre par mois
    let matchesDateFilter = true;
    if (filtreMois === 'mois_courant') {
      const revenuDate = new Date(revenu.date);
      const now = new Date();
      matchesDateFilter = 
        revenuDate.getMonth() === now.getMonth() && 
        revenuDate.getFullYear() === now.getFullYear();
    } else if (filtreMois === 'plage_dates') {
      const revenuDate = new Date(revenu.date);
      matchesDateFilter = 
        revenuDate >= new Date(dateRange.startDate.setHours(0, 0, 0, 0)) && 
        revenuDate <= new Date(dateRange.endDate.setHours(23, 59, 59, 999));
    }
    
    return matchesSearch && matchesDateFilter;
  });

  // Rendu d'un élément de la liste
  const renderRevenuItem = ({ item }: { item: Revenu }) => {
    const categorie = STATIC_CATEGORIES.find(cat => cat.id === item.categorie_id) || STATIC_CATEGORIES[STATIC_CATEGORIES.length - 1];
    const compte = STATIC_COMPTES.find(c => c.id === item.compte_id) || STATIC_COMPTES[0];
    
    return (
      <View className={`p-4 mb-3 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow`}>
        <View className="flex-row justify-between items-start">
          <View className="flex-row items-start flex-1">
            <View 
              className="w-12 h-12 rounded-xl items-center justify-center mr-3"
              style={{ backgroundColor: `${categorie.couleur}15` }}
            >
              <MaterialIcons name={categorie.icone as any} size={24} color={categorie.couleur} />
            </View>
            <View className="flex-1 ml-4">
              <View className="flex-row justify-between items-start">
                <Text className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {item.source}
                </Text>
                {item.famille && (
                  <View 
                    className="px-2 py-1 rounded-full" 
                    style={{ backgroundColor: `${item.famille.couleur}20` }}
                  >
                    <Text 
                      className="text-xs font-medium" 
                      style={{ color: item.famille.couleur }}
                    >
                      {item.famille.nom}
                    </Text>
                  </View>
                )}
              </View>
              <View className="flex-row items-center mt-1">
                <Text className="text-gray-500 text-sm">
                  {new Date(item.date).toLocaleDateString('fr-FR', { 
                    day: '2-digit', 
                    month: 'short',
                    year: 'numeric' 
                  })}
                </Text>
                {item.description && (
                  <Text className="text-gray-500 text-sm ml-2">
                    • {item.description}
                  </Text>
                )}
              </View>
              {STATIC_CATEGORIES.find(cat => cat.id === item.categorie_id) && (
                <View 
                  className="self-start mt-1 px-2 py-1 rounded-full" 
                  style={{ 
                    backgroundColor: `${STATIC_CATEGORIES.find(cat => cat.id === item.categorie_id)?.couleur}20` 
                  }}
                >
                  <Text 
                    className="text-xs font-medium" 
                    style={{ 
                      color: STATIC_CATEGORIES.find(cat => cat.id === item.categorie_id)?.couleur 
                    }}
                  >
                    {STATIC_CATEGORIES.find(cat => cat.id === item.categorie_id)?.nom}
                  </Text>
                </View>
              )}
            </View>
          </View>
          <View className="items-end">
            <Text className={`font-bold text-lg ${isDark ? 'text-green-400' : 'text-green-600'}`}>
              +{formatCurrency(item.montant)}
            </Text>
            <View 
              className={`px-2 py-1 rounded-full mt-1 ${
                item.statut === 'valide' 
                  ? 'bg-green-100 dark:bg-green-900/30' 
                  : item.statut === 'en_attente'
                    ? 'bg-yellow-100 dark:bg-yellow-900/30'
                    : 'bg-red-100 dark:bg-red-900/30'
              }`}
            >
              <Text className={`text-xs font-medium ${
                item.statut === 'valide' 
                  ? 'text-green-800 dark:text-green-300' 
                  : item.statut === 'en_attente'
                    ? 'text-yellow-800 dark:text-yellow-300'
                    : 'text-red-800 dark:text-red-300'
              }`}>
                {item.statut === 'valide' ? 'Validé' : 
                 item.statut === 'en_attente' ? 'En attente' : 'Annulé'}
              </Text>
            </View>
          </View>
        </View>
        
        <View className="flex-row justify-end space-x-2 pt-3 border-t border-gray-200 dark:border-gray-700 mt-3">
          <TouchableOpacity 
            className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg"
            onPress={() => {
              setFormData({
                ...item,
                date: new Date(item.date).toISOString().split('T')[0],
              });
              setSelectedDate(new Date(item.date));
              setShowAddModal(true);
            }}
          >
            <Ionicons name="pencil" size={16} color={isDark ? '#93C5FD' : '#3B82F6'} />
          </TouchableOpacity>
          <TouchableOpacity 
            className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg"
            onPress={() => handleDeleteRevenu(item.id)}
          >
            <Ionicons name="trash" size={16} color={isDark ? '#FCA5A5' : '#EF4444'} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* En-tête */}
      <View className="p-4">
        {/* En-tête avec titre et bouton d'ajout */}
        <View className="flex-row justify-between items-center mb-4">
          <Text className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Revenus
          </Text>
          <View className="flex-row space-x-2">
            <TouchableOpacity
              onPress={() => setShowChart(!showChart)}
              className="bg-blue-500 p-2 rounded-lg"
            >
              <MaterialIcons 
                name={showChart ? "bar-chart" : "insert-chart"} 
                size={24} 
                color="white" 
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setShowAddModal(true)}
              className="bg-blue-500 p-2 rounded-lg"
            >
              <Ionicons name="add" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Filtres */}
        <View className="mb-4">
          <View className="flex-row justify-between items-center mb-2">
            <Text className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Filtrer par :</Text>
            {filtreMois === 'plage_dates' && (
              <TouchableOpacity 
                onPress={() => setShowDateRangePicker(true)}
                className="flex-row items-center"
              >
                <Text className="text-blue-500 text-sm mr-1">
                  {dateRange.startDate.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })} - {dateRange.endDate.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                </Text>
                <MaterialIcons name="edit" size={16} color={isDark ? '#60A5FA' : '#3B82F6'} />
              </TouchableOpacity>
            )}
          </View>
          <View className="flex-row space-x-2">
            <TouchableOpacity
              onPress={() => setFiltreMois('tous')}
              className={`px-4 py-2 rounded-full ${
                filtreMois === 'tous' 
                  ? 'bg-blue-500' 
                  : isDark ? 'bg-gray-700' : 'bg-gray-200'
              }`}
            >
              <Text className={filtreMois === 'tous' ? 'text-white' : isDark ? 'text-gray-300' : 'text-gray-700'}>
                Tous
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setFiltreMois('mois_courant')}
              className={`px-4 py-2 rounded-full ${
                filtreMois === 'mois_courant' 
                  ? 'bg-blue-500' 
                  : isDark ? 'bg-gray-700' : 'bg-gray-200'
              }`}
            >
              <Text className={filtreMois === 'mois_courant' ? 'text-white' : isDark ? 'text-gray-300' : 'text-gray-700'}>
                Ce mois-ci
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setFiltreMois('plage_dates');
                setShowDateRangePicker(true);
              }}
              className={`px-4 py-2 rounded-full ${
                filtreMois === 'plage_dates' 
                  ? 'bg-blue-500' 
                  : isDark ? 'bg-gray-700' : 'bg-gray-200'
              }`}
            >
              <Text className={filtreMois === 'plage_dates' ? 'text-white' : isDark ? 'text-gray-300' : 'text-gray-700'}>
                Plage de dates
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Barre de recherche */}
        <View className="flex-row items-center bg-white dark:bg-gray-700 rounded-lg px-3 py-2">
          <Ionicons name="search" size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
          <TextInput
            className="flex-1 ml-2 text-base dark:text-white"
            placeholder="Rechercher un revenu..."
            placeholderTextColor={isDark ? '#9CA3AF' : '#9CA3AF'}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Graphique des revenus mensuels */}
      {showChart && (
        <View className="px-4 mb-4">
          <View className="flex-row justify-between items-center mb-2">
            <Text className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Revenus mensuels
            </Text>
            <TouchableOpacity 
              onPress={() => {
                // Actualiser les données du graphique
                setRevenus([...revenus]);
              }}
              className="p-1"
            >
              <Ionicons name="refresh" size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
            </TouchableOpacity>
          </View>
            
          {monthlyRevenueData.length > 0 ? (
            <View className="bg-white dark:bg-gray-800 rounded-xl p-4">
              <View className="items-center">
                <CustomBarChart
                  data={monthlyRevenueData}
                  width={screenWidth}
                  height={chartHeight}
                  color={isDark ? '#3B82F6' : '#2563EB'}
                  highlightColor="#10B981"
                />
              </View>
              <View className="flex-row justify-center items-center mt-2">
                <View className="flex-row items-center mr-4">
                  <View className="w-3 h-3 rounded-full bg-blue-500 mr-1" />
                  <Text className="text-xs text-gray-600 dark:text-gray-300">Mois précédents</Text>
                </View>
                <View className="flex-row items-center">
                  <View className="w-3 h-3 rounded-full bg-green-500 mr-1" />
                  <Text className="text-xs text-gray-600 dark:text-gray-300">Mois en cours</Text>
                </View>
              </View>
            </View>
          ) : (
            <View className="bg-white dark:bg-gray-800 rounded-xl p-6 items-center justify-center h-40">
              <FontAwesome name="bar-chart" size={32} color={isDark ? '#4B5563' : '#D1D5DB'} />
              <Text className="mt-2 text-gray-500 dark:text-gray-400 text-center">
                Pas encore de données à afficher
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Liste des revenus */}
      <FlatList
        data={filteredRevenus}
        renderItem={renderRevenuItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={
          <View className="items-center justify-center py-10">
            <Ionicons 
              name="wallet-outline" 
              size={48} 
              color={isDark ? '#4B5563' : '#9CA3AF'} 
              style={{ marginBottom: 16 }}
            />
            <Text className={`text-lg font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Aucun revenu enregistré
            </Text>
            <Text className={`text-center mt-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              Appuyez sur le bouton + pour ajouter un nouveau revenu
            </Text>
          </View>
        }
      />

      {/* Modal d'ajout/édition */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setShowAddModal(false);
          resetForm();
        }}
      >
        <View className={`flex-1 justify-end ${isDark ? 'bg-black/50' : 'bg-black/30'}`}>
          <View className={`rounded-t-3xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <View className="flex-row justify-between items-center mb-6">
              <Text className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {editingId ? 'Modifier le revenu' : 'Nouveau revenu'}
              </Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={24} color={isDark ? '#9CA3AF' : '#6B7280'} />
              </TouchableOpacity>
            </View>

            <ScrollView className="max-h-96">
              {/* Montant */}
              <View className="mb-4">
                <Text className={`text-sm mb-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  Montant (MGA)
                </Text>
                <View className={`flex-row items-center border-b ${isDark ? 'border-gray-600' : 'border-gray-300'} pb-2`}>
                  <Text className={`text-xl ${isDark ? 'text-white' : 'text-gray-900'}`}>MGA</Text>
                  <TextInput
                    className={`flex-1 ml-2 text-xl ${isDark ? 'text-white' : 'text-gray-900'}`}
                    placeholder="0"
                    placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                    keyboardType="numeric"
                    value={formData.montant ? formData.montant.toString() : ''}
                    onChangeText={(text) => {
                      const value = parseFloat(text) || 0;
                      setFormData({ ...formData, montant: value });
                    }}
                  />
                </View>
              </View>

              {/* Source */}
              <View className="mb-4">
                <Text className={`text-sm mb-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  Source
                </Text>
                <TextInput
                  className={`p-3 rounded-lg ${isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'}`}
                  placeholder="Ex: Entreprise X, Client Y..."
                  placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                  value={formData.source}
                  onChangeText={(text) => setFormData({ ...formData, source: text })}
                />
              </View>

              {/* Date */}
              <View className="mb-4">
                <Text className={`text-sm mb-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  Date
                </Text>
                <TouchableOpacity 
                  className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text className={isDark ? 'text-white' : 'text-gray-900'}>
                    {new Date(formData.date).toLocaleDateString('fr-FR')}
                  </Text>
                </TouchableOpacity>
                {showDatePicker && (
                  <DateTimePicker
                    value={selectedDate}
                    mode="date"
                    display="default"
                    onChange={(event, date) => {
                      setShowDatePicker(false);
                      if (date) {
                        setSelectedDate(date);
                        setFormData({ ...formData, date: date.toISOString().split('T')[0] });
                      }
                    }}
                  />
                )}
              </View>

              {/* Catégorie */}
              <View className="mb-4">
                <Text className={`text-sm mb-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  Catégorie
                </Text>
                <View className={`rounded-lg overflow-hidden ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <Picker
                    selectedValue={formData.categorie_id}
                    onValueChange={(itemValue) => setFormData({ ...formData, categorie_id: itemValue })}
                    dropdownIconColor={isDark ? 'white' : 'black'}
                    style={{ color: isDark ? 'white' : 'black' }}
                  >
                    {STATIC_CATEGORIES.map((category) => (
                      <Picker.Item 
                        key={category.id}
                        label={category.nom}
                        value={category.id}
                      />
                    ))}
                  </Picker>
                </View>
              </View>

              {/* Compte */}
              <View className="mb-4">
                <Text className={`text-sm mb-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  Compte de destination
                </Text>
                <View className={`rounded-lg overflow-hidden ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <Picker
                    selectedValue={formData.compte_id}
                    onValueChange={(itemValue) => setFormData({ ...formData, compte_id: itemValue })}
                    dropdownIconColor={isDark ? 'white' : 'black'}
                    style={{ color: isDark ? 'white' : 'black' }}
                  >
                    {STATIC_COMPTES.map((compte) => (
                      <Picker.Item 
                        key={compte.id}
                        label={compte.nom}
                        value={compte.id}
                      />
                    ))}
                  </Picker>
                </View>
              </View>

              {/* Description */}
              <View className="mb-6">
                <Text className={`text-sm mb-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  Description (optionnel)
                </Text>
                <TextInput
                  className={`p-3 rounded-lg ${isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'} h-24`}
                  placeholder="Ajoutez une description..."
                  placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                  multiline
                  value={formData.description}
                  onChangeText={(text) => setFormData({ ...formData, description: text })}
                />
              </View>

              {/* Bouton d'action */}
              <TouchableOpacity
                className={`py-3 rounded-lg items-center ${formData.montant > 0 && formData.source ? 'bg-green-500' : 'bg-gray-400'}`}
                disabled={!formData.montant || !formData.source}
                onPress={handleAddRevenu}
              >
                <Text className="text-white font-medium">
                  {editingId ? 'Mettre à jour' : 'Ajouter le revenu'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal pour la sélection de la plage de dates */}
      <Modal
        visible={showDateRangePicker}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDateRangePicker(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className={`w-11/12 p-6 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <Text className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Sélectionner la plage de dates
            </Text>
            
            <View className="mb-4">
              <Text className={`mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Date de début :</Text>
              <TouchableOpacity 
                onPress={() => setShowStartDatePicker(true)}
                className="p-3 border rounded-lg border-gray-300 dark:border-gray-600"
              >
                <Text className={isDark ? 'text-white' : 'text-gray-900'}>
                  {dateRange.startDate.toLocaleDateString('fr-FR')}
                </Text>
              </TouchableOpacity>
              {showStartDatePicker && (
                <DateTimePicker
                  value={dateRange.startDate}
                  mode="date"
                  display="default"
                  onChange={(event, date) => {
                    setShowStartDatePicker(false);
                    if (date) {
                      setDateRange(prev => ({
                        ...prev,
                        startDate: date
                      }));
                    }
                  }}
                  themeVariant={isDark ? 'dark' : 'light'}
                />
              )}
            </View>
            
            <View className="mb-6">
              <Text className={`mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Date de fin :</Text>
              <TouchableOpacity 
                onPress={() => setShowEndDatePicker(true)}
                className="p-3 border rounded-lg border-gray-300 dark:border-gray-600"
              >
                <Text className={isDark ? 'text-white' : 'text-gray-900'}>
                  {dateRange.endDate.toLocaleDateString('fr-FR')}
                </Text>
              </TouchableOpacity>
              {showEndDatePicker && (
                <DateTimePicker
                  value={dateRange.endDate}
                  mode="date"
                  display="default"
                  minimumDate={dateRange.startDate}
                  onChange={(event, date) => {
                    setShowEndDatePicker(false);
                    if (date) {
                      setDateRange(prev => ({
                        ...prev,
                        endDate: date
                      }));
                    }
                  }}
                  themeVariant={isDark ? 'dark' : 'light'}
                />
              )}
            </View>
            
            <View className="flex-row justify-between space-x-4">
              <TouchableOpacity
                onPress={() => {
                  setShowDateRangePicker(false);
                  setShowStartDatePicker(false);
                  setShowEndDatePicker(false);
                }}
                className="flex-1 bg-gray-200 dark:bg-gray-700 py-3 rounded-lg items-center"
              >
                <Text className="text-gray-800 dark:text-gray-200 font-medium">Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setFiltreMois('plage_dates');
                  setShowDateRangePicker(false);
                  setShowStartDatePicker(false);
                  setShowEndDatePicker(false);
                }}
                className="flex-1 bg-blue-500 py-3 rounded-lg items-center"
              >
                <Text className="text-white font-medium">Appliquer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default RevenusScreen;
