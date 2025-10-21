// // babel.config.js
// module.exports = {
//   // REVERTER PARA O PRESET DO EXPO
//   presets: ['babel-preset-expo'], 
//   plugins: [
//     [
//       'module-resolver',
//       {
//         // ... (Seus aliases)
//         root: ['./'], 
//         alias: {
//           '@components': './app/components',
//           '@app': './app',
//           // ...
//         },
//       },
//     ],
//   ],
// };



module.exports = {
  presets: ['babel-preset-expo'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./'],
        alias: {
          '@components': './app/components',
          '@app': './app',
        },
        extensions: [
          '.ios.js',
          '.android.js',
          '.js',
          '.jsx',
          '.ts',
          '.tsx',
          '.json'
        ],
      },
    ],
  ],
  env: {
    production: {
      plugins: ['react-native-paper/babel'],
    },
  },
};