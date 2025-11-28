### Setup

#### Prerequisitos

Necesitas tener Node.js y npm instalados. Hay varias formas de instalarlos en macOS:

**Opción 1: Usando nvm (Node Version Manager)**

# Cerrar y abrir la terminal, luego instalar Node.js
nvm install --lts
nvm use --lts

**Verificar instalación:**

```sh
node --version  # Debería mostrar v18.x.x o superior
npm --version   # Debería mostrar 9.x.x o superior
```

#### Pasos para correr el proyecto

```sh
# Paso 1: Navegar al directorio del proyecto
cd /Users/rogerpervaz/Documents/IWA/demo

# Paso 2: Instalar las dependencias
npm install --legacy-peer-deps

# Paso 3: Iniciar el servidor de desarrollo
npm run dev
```

El servidor se iniciará en `http://localhost:5173` (o el puerto que Vite asigne automáticamente).

#### Scripts disponibles

```sh
npm run dev      # Inicia el servidor de desarrollo
npm run build    # Compila el proyecto para producción
npm run preview  # Vista previa de la compilación de producción
npm run lint     # Ejecuta el linter para verificar el código
```

#### Estructura del proyecto

```
demo/
├── src/
│   ├── components/    # Componentes de React
│   ├── pages/        # Páginas de la aplicación
│   ├── lib/          # Utilidades y funciones auxiliares
│   ├── hooks/        # Custom hooks de React
│   ├── store/        # Estado global (Zustand)
│   └── types/        # Definiciones de TypeScript
├── public/           # Archivos estáticos
└── package.json      # Dependencias y scripts
```

#### Abrir en Visual Studio Code (opcional)

```sh
# Instalar Visual Studio Code desde Homebrew
brew install --cask visual-studio-code

# Abrir el proyecto en VS Code
code /Users/rogerpervaz/Documents/IWA/demo
```

#### Troubleshooting

**Problema: El puerto está en uso**
```sh
# Si el puerto 5173 está ocupado, Vite automáticamente usará otro puerto
# O puedes matar el proceso que usa ese puerto:
lsof -ti:5173 | xargs kill -9
```

**Problema: Errores de permisos al instalar dependencias**
```sh
# No uses sudo con npm. Si tienes problemas de permisos:
# 1. Verifica que npm esté instalado vía Homebrew o nvm
# 2. Si usaste nvm, asegúrate de estar usando la versión correcta:
nvm use --lts
```

**Problema: Error de módulos no encontrados**
```sh
# Elimina node_modules y reinstala
rm -rf node_modules package-lock.json
npm install
```

### Otras formas de editar el código

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/f71e1720-9357-40e1-bffe-47bb7d64c1a2) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
