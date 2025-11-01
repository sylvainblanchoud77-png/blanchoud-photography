
// FICHIER: tina-config.js
// INSTRUCTIONS: 
// 1. Créez ce fichier à la RACINE de votre repo (pas dans un dossier)
// 2. Nommez-le exactement: tina-config.js
// 3. Copiez tout ce contenu

import { defineConfig } from "tinacms";

export default defineConfig({
  branch: "main",
  clientId: "fa34e442-21e4-4daa-b7ca-b2e42e96b6d2", // Votre Client ID
  token: null,
  
  build: {
    outputFolder: "admin",
    publicFolder: "public",
  },
  
  media: {
    tina: {
      mediaRoot: "",
      publicFolder: "",
    },
  },
  
  schema: {
    collections: [
      {
        name: "photos",
        label: "📸 Photos",
        path: "/",
        format: "md",
        fields: [
          {
            type: "string",
            name: "title",
            label: "Titre",
            required: true,
          },
          {
            type: "string",
            name: "gallery",
            label: "Galerie",
            required: true,
            options: ["Neuchâtel", "Vaud", "Naples", "Italie", "Genève", "Bern", "Grisons", "Paris", "France"],
          },
          {
            type: "image",
            name: "image",
            label: "Image",
            required: true,
          },
          {
            type: "string",
            name: "description",
            label: "Description",
            ui: {
              component: "textarea",
            },
          },
          {
            type: "number",
            name: "price",
            label: "Prix CHF",
            required: true,
          },
        ],
      },
    ],
  },
});
