import { defineConfig } from "vite";
import { resolve } from "path";

// https://vitejs.dev/config/
export default defineConfig(async () => ({
    root: 'src',
    // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
    //
    // 1. prevent vite from obscuring rust errors
    clearScreen: false,
    // 2. tauri expects a fixed port, fail if that port is not available
    server: {
        port: 1420,
        strictPort: true,
    },
    build: {
        outDir: '../dist',
        rollupOptions: {
            input: {
                index: resolve(__dirname, 'src/index.html'),
                editor: resolve(__dirname, 'src/editor.html'),
            },
        },
    }
}));
