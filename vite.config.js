import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";


export default defineConfig({
  plugins: [react()],
  base: "/TravelForge-fe_actions/",  // 👈 IMPORTANT
});
