import biomePlugin from "vite-plugin-biome";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		react(),
		biomePlugin({
			mode: "check",
			files: ".",
			applyFixes: true,
		}),
	],
	// build: {
	// 	rollupOptions: {
	// 		// https://rollupjs.org/configuration-options/
	// 		output: {
	// 			manualChunks: {
	// 				"biome-react": ["@biome/react"],
	// 			},
	// 		},
	// 	},
	// },
});
