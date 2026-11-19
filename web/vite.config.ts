import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  define: { __BUILD__: JSON.stringify(new Date().toISOString()) },
  plugins: [react()],
  server: { fs: { allow: [".."] } },   // 内容包在 ../packs
  base: "/budong/",            // GitHub Pages 项目站点路径
  build: { outDir: "dist" },
});
