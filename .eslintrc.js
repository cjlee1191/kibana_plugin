module.exports = {
  root: true,
  extends: ['@elastic/eslint-config-kibana', 'plugin:@elastic/eui/recommended'],
  settings: {
    'import/resolver': {
      '@kbn/eslint-import-resolver-kibana': {
        rootPackageName: 'new_test_plugin',
      },
    },
  },
  overrides: [
    {
      files: ['**/public/**/*'],
      settings: {
        'import/resolver': {
          '@kbn/eslint-import-resolver-kibana': {
            forceNode: false,
            rootPackageName: 'new_test_plugin',
          },
        },
      },
    },
  ]
};
