import { defineConfig } from 'commandkit/config';
import { cache } from '@commandkit/cache';

export default defineConfig({
  showUnknownPrefixCommandsWarning: true, /* This option is used for debugging purposes */
  plugins: [cache()],
});
