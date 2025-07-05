import React from 'react';
import { TouchableOpacity, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type BtnVariant = "primary" | "secondary" | "danger";

type BtnProps = {
  onPress: () => void;
  title: string;
  variant?: BtnVariant;
  isDark: boolean;
  className?: string;
  textClassName?: string;
  disabled?: boolean;
  icon?: React.ReactNode;
};

const Btn: React.FC<BtnProps> = ({
  onPress,
  title,
  variant = "primary",
  isDark,
  className = "",
  textClassName = "",
  disabled = false,
  icon,
}) => {
  // Définition des classes de base
  const baseClasses = "px-4 py-2 rounded-lg items-center justify-center mx-2";
  
  // Définition des classes en fonction de la variante, du thème et du titre
  const getVariantClasses = () => {
    if (disabled) {
      return isDark 
        ? 'bg-gray-700 opacity-60' 
        : 'bg-gray-300 opacity-60';
    }
    
    if (title.toLowerCase() === 'annuler') {
      return isDark
        ? 'bg-gray-600 border border-gray-500'
        : 'bg-gray-300 border border-gray-400';
    }
    
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
  
  // Couleur du texte en fonction du thème, de la variante et du titre
  const getTextColor = () => {
    if (title.toLowerCase() === 'annuler') {
      return isDark ? 'text-white' : 'text-gray-800';
    }
    
    if (variant === "secondary") {
      return isDark ? "text-gray-100" : "text-gray-800";
    }
    return "text-white";
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      className={`${baseClasses} ${getVariantClasses()} ${className} flex-row items-center justify-center`}
      activeOpacity={0.8}
      disabled={disabled}
    >
      {icon && <View className="mr-2">{icon}</View>}
      <Text className={`${defaultTextClasses} ${getTextColor()} ${textClassName}`}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

export default Btn;