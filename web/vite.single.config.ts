import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteSingleFile } from "vite-plugin-singlefile";

// 单文件版：把 JS/CSS 全内联，双击 index.html 就能用，不需要服务器
export default defineConfig({
  plugins: [react(), viteSingleFile()],
  define: { __BUILD__: JSON.stringify(new Date().toISOString()) },
  build: { outDir: "dist-single", assetsInlineLimit: 100000000 },
});
