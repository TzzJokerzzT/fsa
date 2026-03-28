# 🧠 Simulador de Arquitectura Frontend

## 📌 Descripción

Este proyecto es un **Simulador de Arquitectura Frontend** que permite visualizar, construir y entender cómo se estructuran aplicaciones modernas utilizando diferentes patrones arquitectónicos.

El objetivo es ofrecer una herramienta interactiva donde se puedan modelar componentes, estados, flujos de datos y comunicación entre módulos.

---

## 🎯 Objetivos

- Visualizar arquitecturas frontend en tiempo real
- Simular flujo de datos entre componentes
- Comparar patrones arquitectónicos
- Entender el manejo de estado global vs local
- Explorar microfrontends y desacoplamiento

---

## 🧱 Arquitecturas soportadas

- Monolítica (SPA tradicional)
- Modular
- Feature-based
- Atomic Design
- Microfrontends
- Clean Architecture (adaptada a frontend)

---

## ⚙️ Stack Tecnológico

### Core

- React
- TypeScript

### Routing

- React Router

### Estado

- Zustand
- React Query (para manejo de server state)

### Animaciones

- Framer Motion

### UI / Estilos

- TailwindCSS
- Radix UI o Shadcn/UI

### Visualización

- D3.js o React Flow (para diagramas interactivos)

### Testing

- Vitest
- React Testing Library

### Linting y calidad

- ESLint
- Prettier
- Husky (pre-commit hooks)

### Build & Dev

- RsPack

### Opcionales (Avanzado)

- Webpack Module Federation (para microfrontends)
- Storybook (documentación de componentes)

---

## 🧩 Funcionalidades

### 1. Constructor de Arquitectura

- Drag & Drop de componentes
- Creación de módulos y capas
- Conexión entre componentes

### 2. Simulación de Flujo de Datos

- Visualización de props
- Simulación de eventos
- Flujo de estado global

### 3. Comparador de Arquitecturas

- Comparar 2 arquitecturas lado a lado
- Métricas de complejidad
- Performance estimado

### 4. Modo Aprendizaje

- Explicación interactiva de patrones
- Ejemplos prácticos

### 5. Inspector de Estado

- Visualización de Zustand store
- Timeline de cambios

### 6. Animaciones

- Transiciones entre estados
- Visualización de eventos

---

## 🧪 Requisitos Funcionales

- Crear, editar y eliminar nodos (componentes)
- Conectar nodos para representar flujo de datos
- Persistir arquitecturas en local storage o backend
- Simular eventos entre componentes
- Visualizar cambios de estado en tiempo real

---

## 🔒 Requisitos No Funcionales

- Alta performance en renderizado
- Código escalable y modular
- Tipado fuerte con TypeScript
- Accesibilidad (A11y)
- SEO básico (para landing del proyecto)

---

## 🏗️ Estructura del Proyecto

```
src/
 ├── app/
 │   ├── router/
 │   ├── store/
 │   └── providers/
 │
 ├── features/
 │   ├── architecture-builder/
 │   ├── simulation/
 │   └── inspector/
 │
 ├── entities/
 │   ├── component/
 │   ├── module/
 │   └── connection/
 │
 ├── shared/
 │   ├── ui/
 │   ├── hooks/
 │   ├── utils/
 │   └── types/
 │
 └── pages/
```

---

## 🔄 Gestión de Estado

- Zustand para estado global
- React Query para datos asincrónicos
- Separación entre UI state y domain state

---

## 🎨 UX/UI

- Interfaz tipo canvas
- Drag & Drop intuitivo
- Feedback visual en tiempo real
- Dark/Light mode

---

## 🚀 Scripts

```bash
bun install
bun run dev
bun run build
bun run test
```

---

## 📈 Futuras Mejoras

- Exportar arquitecturas como JSON
- Exportar como imagen o PDF
- Integración con IA para sugerencias
- Colaboración en tiempo real

---

## 🤝 Contribución

1. Fork del proyecto
2. Crear una rama
3. Hacer commit
4. Abrir Pull Request

---

## 📜 Licencia

Alexis Buelvas
