module.exports = function (api) {
  api.cache(true);
  
  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }], 
      'nativewind/babel'
    ],
    plugins: [
      // Ajoutez ceci pour Reanimated (doit être listé en dernier)
      'react-native-reanimated/plugin',
    ],
  };
};
