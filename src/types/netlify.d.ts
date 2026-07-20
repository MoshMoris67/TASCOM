declare module "@netlify/vite-plugin-tanstack-start" {
  import type { PluginOption } from "vite";
  const plugin: (opts?: Record<string, unknown>) => PluginOption | PluginOption[];
  export default plugin;
}
