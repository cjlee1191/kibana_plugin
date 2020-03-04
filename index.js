import { resolve } from 'path';
import { existsSync } from 'fs';

import { i18n } from '@kbn/i18n';

import exampleRoute from './server/routes/example';

export default function(kibana) {
  return new kibana.Plugin({
    require: ['elasticsearch'],
    name: 'document_tagging_plugin',
    uiExports: {
      app: {
        title: 'Document Tagging Plugin',
        description: 'An awesome Kibana plugin',
        main: 'plugins/new_test_plugin/app',
      },
      hacks: ['plugins/new_test_plugin/hack'],
      styleSheetPaths: [
        resolve(__dirname, 'public/app.scss'),
        resolve(__dirname, 'public/app.css'),
      ].find(p => existsSync(p)),
    },

    config(Joi) {
      return Joi.object({
        enabled: Joi.boolean().default(true),
      }).default();
    },

    // eslint-disable-next-line no-unused-vars
    init(server, options) {
      const xpackMainPlugin = server.plugins.xpack_main;
      if (xpackMainPlugin) {
        const featureId = 'new_test_plugin';

        xpackMainPlugin.registerFeature({
          id: featureId,
          name: i18n.translate('newTestPlugin.featureRegistry.featureName', {
            defaultMessage: 'newTestPlugin',
          }),
          navLinkId: featureId,
          icon: 'questionInCircle',
          app: [featureId, 'kibana'],
          catalogue: [],
          privileges: {
            all: {
              api: [],
              savedObject: {
                all: [],
                read: [],
              },
              ui: ['show'],
            },
            read: {
              api: [],
              savedObject: {
                all: [],
                read: [],
              },
              ui: ['show'],
            },
          },
        });
      }

      // Add server routes and initialize the plugin here
      exampleRoute(server);
    },
  });
}
