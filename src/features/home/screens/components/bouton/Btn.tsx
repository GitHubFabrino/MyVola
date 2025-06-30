import { TouchableOpacity, Text } from "react-native";

type BtnVariant = "primary" | "secondary" | "danger";

type BtnProps = {
  onPress: () => void;
  title: string;
  variant?: BtnVariant;
  isDark: boolean;
  className?: string;
  textClassName?: string;
};

const Btn = ({
  onPress,
  title,
  variant = "primary",
  isDark,
  className = "",
  textClassName = "",
}: BtnProps) => {
  // Définition des classes de base
  const baseClasses = "px-4 py-2 rounded-lg items-center justify-center mx-2";
  
  // Définition des classes en fonction de la variante et du thème
  const getVariantClasses = () => {
    if (variant === "secondary") {
      return isDark 
        ? "bg-gray-700 border border-gray-500" 
        : "bg-gray-200 border border-gray-300";
    }
    
    if (variant === "danger") {
      return isDark 
        ? "bg-red-700/90" 
        : "bg-red-500";
    }
    
    // primary (default)
    return isDark 
      ? "bg-blue-600" 
      : "bg-blue-500";
  };
  
  // Classes de texte par défaut
  const defaultTextClasses = "font-medium";
  
  // Couleur du texte en fonction du thème et de la variante
  const getTextColor = () => {
    if (variant === "secondary") {
      return isDark ? "text-gray-100" : "text-gray-800";
    }
    return "text-white";
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      className={`${baseClasses} ${getVariantClasses()} ${className}`}
      activeOpacity={0.8}
    >
      <Text className={`${defaultTextClasses} ${getTextColor()} ${textClassName}`}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

export default Btn;