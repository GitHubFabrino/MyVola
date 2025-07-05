import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "~/theme/ThemeContext";

interface DetailsBudgetModalProps {
    selectedBudget: any;
    selectedMonth: number;
    selectedYear: number;
    MONTHS: string[];
    setSelectedBudget: (budget: any) => void;
}

const DetailsBudgetModal = ({ selectedBudget, selectedMonth, selectedYear, MONTHS, setSelectedBudget }: DetailsBudgetModalProps) => {
    const { isDark } = useTheme();

  const renderBudgetModal = () => (
    <Modal
      visible={!!selectedBudget}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setSelectedBudget(null)}
    >
      <View style={styles.modalOverlay}>
        <View className={`p-6 rounded-xl w-5/6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <View className="flex-row justify-between items-center mb-4">
            <Text className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Détails du budget
            </Text>
            <TouchableOpacity onPress={() => setSelectedBudget(null)}>
              <Ionicons name="close" size={24} color={isDark ? '#9CA3AF' : '#6B7280'} />
            </TouchableOpacity>
          </View>
          
          {selectedBudget && (
            <View className="space-y-4">
              <View>
                <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Catégorie</Text>
                <Text className={`text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {selectedBudget.categorie_nom}
                </Text>
              </View>
              
              <View>
                <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Dépensé par</Text>
                <Text className={`text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {selectedBudget.depenseur_nom || 'Non spécifié'}
                </Text>
              </View>
              
              <View>
                <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Budget alloué</Text>
                <Text className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {selectedBudget.montant.toLocaleString()} Ar
                </Text>
              </View>
              
              <View>
                <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Dépense actuelle</Text>
                <Text className={`text-lg ${selectedBudget.depense_actuelle > selectedBudget.montant ? 'text-red-500' : isDark ? 'text-green-400' : 'text-green-600'}`}>
                  {selectedBudget.depense_actuelle.toLocaleString()} Ar
                </Text>
              </View>
              
              <View className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Période</Text>
                <Text className={`${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {MONTHS[selectedMonth - 1]} {selectedYear}
                </Text>
              </View>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );

  return (
    <View>
      {renderBudgetModal()}
    </View>
  );
};

export default DetailsBudgetModal;



const styles = StyleSheet.create({
    modalOverlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
  });