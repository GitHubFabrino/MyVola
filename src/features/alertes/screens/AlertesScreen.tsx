import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, TouchableOpacity, FlatList, TextInput, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { useTheme } from '~/theme/ThemeContext';


type TypeAlerte = 'alerte_budget' | 'rappel_facture' | 'depense_inhabituelle' | 'objectif_atteint' | 'revenu' | 'autre';

interface Alerte {
  id: number;
  utilisateur_id: number;
  type: TypeAlerte;
  titre: string;
  message: string;
  lue: boolean;
  date_creation: string;
}

// Données de démonstration
const donneesAlerte: Alerte[] = [
  {
    id: 1,
    utilisateur_id: 1,
    type: 'rappel_facture',
    titre: 'Facture à échéance',
    message: 'Votre facture EAU est due demain (5 000 Ar)',
    lue: false,
    date_creation: '2025-06-30T10:30:00.000Z'
  },
  {
    id: 2,
    utilisateur_id: 1,
    type: 'alerte_budget',
    titre: 'Dépassement de budget',
    message: 'Vous avez dépassé votre budget Alimentation de 25% ce mois-ci',
    lue: true,
    date_creation: '2025-06-29T14:15:00.000Z'
  },
  {
    id: 3,
    utilisateur_id: 1,
    type: 'objectif_atteint',
    titre: 'Objectif atteint !',
    message: 'Félicitations ! Vous avez atteint votre objectif d\'épargne de 100 000 Ar',
    lue: false,
    date_creation: '2025-06-28T09:45:00.000Z'
  },
  {
    id: 4,
    utilisateur_id: 1,
    type: 'depense_inhabituelle',
    titre: 'Dépense inhabituelle',
    message: 'Une dépense importante de 75 000 Ar a été détectée dans la catégorie Shopping',
    lue: false,
    date_creation: '2025-06-27T16:20:00.000Z'
  },
  {
    id: 5,
    utilisateur_id: 1,
    type: 'revenu',
    titre: 'Revenu enregistré',
    message: 'Votre salaire de 500 000 Ar a été crédité',
    lue: true,
    date_creation: '2025-06-25T08:00:00.000Z'
  }
];

const getIconForType = (type: TypeAlerte) => {
  switch (type) {
    case 'rappel_facture':
      return 'document-text';
    case 'alerte_budget':
      return 'alert-circle';
    case 'depense_inhabituelle':
      return 'warning';
    case 'objectif_atteint':
      return 'trophy';
    case 'revenu':
      return 'cash';
    default:
      return 'notifications';
  }
};

const getColorForType = (type: TypeAlerte, isDark: boolean) => {
  const colors = {
    rappel_facture: isDark ? 'bg-blue-900/30 border-l-4 border-blue-500' : 'bg-blue-50 border-l-4 border-blue-400',
    alerte_budget: isDark ? 'bg-yellow-900/30 border-l-4 border-yellow-500' : 'bg-yellow-50 border-l-4 border-yellow-400',
    depense_inhabituelle: isDark ? 'bg-red-900/30 border-l-4 border-red-500' : 'bg-red-50 border-l-4 border-red-400',
    objectif_atteint: isDark ? 'bg-green-900/30 border-l-4 border-green-500' : 'bg-green-50 border-l-4 border-green-400',
    revenu: isDark ? 'bg-purple-900/30 border-l-4 border-purple-500' : 'bg-purple-50 border-l-4 border-purple-400',
    autre: isDark ? 'bg-gray-800/30 border-l-4 border-gray-500' : 'bg-gray-50 border-l-4 border-gray-400',
  };
  return colors[type] || colors.autre;
};

const AlertesScreen = () => {
  const { isDark } = useTheme();
  const [alertes, setAlertes] = useState<Alerte[]>(donneesAlerte);
  const [filtreType, setFiltreType] = useState<TypeAlerte | 'tous'>('tous');
  const [filtreLu, setFiltreLu] = useState<boolean | 'tous'>('tous');
  const [recherche, setRecherche] = useState('');
  const [selection, setSelection] = useState<number[]>([]);
  const [modeSelection, setModeSelection] = useState(false);

  const alertesFiltrees = useMemo(() => {
    return alertes.filter(alerte => {
      const correspondType = filtreType === 'tous' || alerte.type === filtreType;
      const correspondLu = filtreLu === 'tous' || alerte.lue === filtreLu;
      const correspondRecherche = !recherche || alerte.titre.toLowerCase().includes(recherche.toLowerCase()) || alerte.message.toLowerCase().includes(recherche.toLowerCase());

      return correspondType && correspondLu && correspondRecherche;
    });
  }, [alertes, filtreType, filtreLu, recherche]);

  const toggleLu = useCallback((id: number, estLu: boolean) => {
    setAlertes(prevAlertes =>
      prevAlertes.map(alerte =>
        alerte.id === id ? { ...alerte, lue: estLu } : alerte
      )
    );
  }, []);

  const toggleSelection = useCallback((id: number) => {
    setSelection(prev =>
      prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
    );
  }, []);

  const marquerSelectionCommeLue = useCallback(() => {
    setAlertes(prevAlertes =>
      prevAlertes.map(alerte =>
        selection.includes(alerte.id) ? { ...alerte, lue: true } : alerte
      )
    );
    setSelection([]);
    setModeSelection(false);
  }, [selection]);

  const supprimerAlerte = useCallback((id: number) => {
    Alert.alert(
      'Confirmer la suppression',
      'Voulez-vous vraiment supprimer cette alerte ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            setAlertes(prevAlertes => prevAlertes.filter(a => a.id !== id));
          },
        }
      ]
    );
  }, []);

  const supprimerSelection = useCallback(() => {
    Alert.alert(
      'Confirmer la suppression',
      `Voulez-vous vraiment supprimer ${selection.length} alerte(s) ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            setAlertes(prevAlertes =>
              prevAlertes.filter(alerte => !selection.includes(alerte.id))
            );
            setSelection([]);
            setModeSelection(false);
          }
        }
      ]
    );
  }, [selection]);

  const annulerSelection = useCallback(() => {
    setSelection([]);
    setModeSelection(false);
  }, []);

  const renderSwipeActions = useCallback((id: number, estLue: boolean) => (
    <View className="flex-row my-2">
      <TouchableOpacity
        className={`justify-center px-6 ${estLue ? 'bg-yellow-500' : 'bg-green-500'} rounded-l-lg`}
        onPress={() => toggleLu(id, !estLue)}
      >
        <Ionicons
          name={estLue ? 'eye-off' : 'eye'}
          size={24}
          color="white"
        />
      </TouchableOpacity>
      <TouchableOpacity
        className="justify-center px-6 bg-red-500 rounded-r-lg"
        onPress={() => supprimerAlerte(id)}
      >
        <Ionicons name="trash" size={24} color="white" />
      </TouchableOpacity>
    </View>
  ), [toggleLu, supprimerAlerte]);

  const handleLongPress = useCallback((itemId: number) => {
    if (!modeSelection) {
      setModeSelection(true);
      toggleSelection(itemId);
    }
  }, [modeSelection, toggleSelection]);

  const renderAlerte = ({ item }: { item: Alerte }) => {
    return (
      <Swipeable
        key={item.id}
        renderRightActions={() => renderSwipeActions(item.id, item.lue)}
        containerStyle={{ marginVertical: 4 }}
      >
        <TouchableOpacity
          className={`p-4 mb-3 rounded-r-lg ${getColorForType(item.type, isDark)} ${item.lue ? 'opacity-70' : ''} ${selection.includes(item.id) ? 'border-2 border-blue-500' : ''}`}
          onLongPress={() => handleLongPress(item.id)}
          activeOpacity={0.8}
          onPress={() => {
            if (modeSelection) {
              toggleSelection(item.id);
            }
          }}
        >
          {modeSelection && (
            <TouchableOpacity
              className="absolute top-2 right-2 z-10 p-2"
              onPress={() => toggleSelection(item.id)}
            >
              <View className={`w-5 h-5 rounded-full border-2 ${selection.includes(item.id) ? 'bg-blue-500 border-blue-500' : 'border-gray-400'}`}>
                {selection.includes(item.id) && (
                  <Ionicons name="checkmark" size={14} color="white" className="self-center" />
                )}
              </View>
            </TouchableOpacity>
          )}
          <View className="flex-row items-start">
            <View className={`p-2 rounded-full ${isDark ? 'bg-black/20' : 'bg-white/70'} mr-3`}>
              <Ionicons
                name={getIconForType(item.type) as any}
                size={20}
                color={isDark ? '#fff' : '#4B5563'}
              />
            </View>
            <View className="flex-1">
              <View className="flex-row justify-between items-start">
                <Text className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {item.titre}
                </Text>
                <Text className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {new Date(item.date_creation).toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </Text>
              </View>
              <Text className={`mt-1 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                {item.message}
              </Text>
              {!item.lue && !modeSelection && (
                <TouchableOpacity
                  onPress={() => toggleLu(item.id, true)}
                  className="mt-2 self-start"
                >
                  <Text className={`text-xs ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                    Marquer comme lue
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </TouchableOpacity>
      </Swipeable>
    );
  };

  const renderSelectionBar = () => (
    <View className={`flex-row justify-between items-center p-3 ${isDark ? 'bg-gray-800' : 'bg-blue-50'} border-b border-gray-200 dark:border-gray-700`}>
      <View className="flex-row items-center">
        <Text className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {selection.length} sélectionné(s)
        </Text>
      </View>
      <View className="flex-row space-x-3">
        <TouchableOpacity onPress={marquerSelectionCommeLue}>
          <Ionicons
            name="checkmark-done"
            size={24}
            color={isDark ? '#60A5FA' : '#2563EB'}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={supprimerSelection}>
          <Ionicons
            name="trash"
            size={24}
            color={isDark ? '#F87171' : '#DC2626'}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={annulerSelection}>
          <Ionicons
            name="close"
            size={24}
            color={isDark ? '#9CA3AF' : '#6B7280'}
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <View className="p-5">
        <View className="flex-row justify-between items-center mb-2">
          <Text className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Alertes
          </Text>
          {!modeSelection && (
            <TouchableOpacity
              onPress={() => setModeSelection(true)}
              className="p-2"
            >
              <Ionicons
                name="checkbox-outline"
                size={24}
                color={isDark ? '#9CA3AF' : '#6B7280'}
              />
            </TouchableOpacity>
          )}
        </View>

        <Text className={`text-base mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Consultez vos alertes et notifications.
        </Text>

        {/* Barre de recherche */}
        <View className={`mb-4 p-2 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <View className="flex-row items-center px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700">
            <Ionicons name="search" size={18} color={isDark ? '#9CA3AF' : '#6B7280'} />
            <TextInput
              placeholder="Rechercher une alerte..."
              placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
              className={`flex-1 ml-2 ${isDark ? 'text-white' : 'text-gray-900'}`}
              value={recherche}
              onChangeText={setRecherche}
            />
            {recherche.length > 0 && (
              <TouchableOpacity onPress={() => setRecherche('')}>
                <Ionicons name="close-circle" size={18} color={isDark ? '#9CA3AF' : '#6B7280'} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Filtres */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-4 -mx-1"
        >
          <View className="flex-row space-x-2 px-1">
            <TouchableOpacity
              className={`px-3 py-1 rounded-full ${filtreType === 'tous' ? 'bg-blue-500' : isDark ? 'bg-gray-800' : 'bg-white'}`}
              onPress={() => setFiltreType('tous')}
            >
              <Text className={`text-sm ${filtreType === 'tous' ? 'text-white' : isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Tous
              </Text>
            </TouchableOpacity>

            {['alerte_budget', 'rappel_facture', 'depense_inhabituelle', 'objectif_atteint', 'revenu'].map(type => (
              <TouchableOpacity
                key={type}
                className={`px-3 py-1 rounded-full ${filtreType === type ? 'bg-blue-500' : isDark ? 'bg-gray-800' : 'bg-white'}`}
                onPress={() => setFiltreType(type as TypeAlerte)}
              >
                <Text className={`text-sm ${filtreType === type ? 'text-white' : isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Filtre lu/non lu */}
        <View className="flex-row space-x-2 mb-4">
          <TouchableOpacity
            className={`flex-1 py-2 rounded-lg ${filtreLu === 'tous' ? 'bg-blue-500' : isDark ? 'bg-gray-800' : 'bg-white'}`}
            onPress={() => setFiltreLu('tous')}
          >
            <Text className={`text-center ${filtreLu === 'tous' ? 'text-white' : isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Toutes
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 py-2 rounded-lg ${filtreLu === false ? 'bg-blue-500' : isDark ? 'bg-gray-800' : 'bg-white'}`}
            onPress={() => setFiltreLu(false)}
          >
            <Text className={`text-center ${filtreLu === false ? 'text-white' : isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Non lues
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 py-2 rounded-lg ${filtreLu === true ? 'bg-blue-500' : isDark ? 'bg-gray-800' : 'bg-white'}`}
            onPress={() => setFiltreLu(true)}
          >
            <Text className={`text-center ${filtreLu === true ? 'text-white' : isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Lues
            </Text>
          </TouchableOpacity>
        </View>

        {modeSelection && selection.length > 0 && renderSelectionBar()}

        <FlatList
          data={alertesFiltrees}
          renderItem={renderAlerte}
          keyExtractor={item => item.id.toString()}
          contentContainerClassName="px-5 pb-5"
          ListEmptyComponent={
            <View className="items-center justify-center py-10">
              <Ionicons
                name="notifications-off-outline"
                size={48}
                color={isDark ? '#4B5563' : '#9CA3AF'}
              />
              <Text className={`mt-4 text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Aucune alerte trouvée
              </Text>
            </View>
          }
        />
      </View>
    </View>
  );
};

export default AlertesScreen;
