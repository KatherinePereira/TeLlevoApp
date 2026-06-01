# 🚗 TeLlevoApp

> Aplicación móvil de viajes compartidos (ride-sharing) diseñada para la comunidad estudiantil.

## 📖 Sobre el Proyecto
TeLlevoApp es una solución de movilidad desarrollada como proyecto para la asignatura de **Programación Mobile**, durante el **4to semestre de mi carrera de Ingeniería en Informática**. Funciona bajo un modelo similar a Uber, permitiendo a los usuarios ofrecer o solicitar viajes, optimizando rutas y garantizando la seguridad en cada trayecto mediante la validación cruzada de credenciales.

## ✨ Características Principales
* **Mapas y Rutas:** Integración con **Mapbox** y **Leaflet** para la visualización fluida de mapas y el cálculo de rutas óptimas.
* **Ubicación en Tiempo Real:** Seguimiento dinámico de la posición utilizando la API de geolocalización nativa del dispositivo (`@capacitor/geolocation`).
* **Validación de Seguridad por QR:** Sistema integrado de generación y escaneo de códigos QR (potenciado por ML Kit) para asegurar que conductor y pasajeros aborden el vehículo correcto antes de iniciar el viaje.
* **Autenticación Biométrica:** Soporte para inicio de sesión seguro aprovechando la biometría nativa del teléfono.
* **UI/UX:** Interfaz limpia, responsiva y amigable construida con los componentes de Ionic, Bootstrap y alertas interactivas con SweetAlert2.

## 🛠️ Stack Tecnológico
* **Frontend:** Angular 18, Ionic 8, TypeScript
* **Core Nativo:** Capacitor 6 (Android)
* **Backend & Servicios:** Firebase
* **Geolocalización:** Mapbox GL, Leaflet, Leaflet Routing Machine
* **Utilidades:** Zod (validación de esquemas), Capacitor ML Kit (escáner QR)

## 🚀 Instalación y Ejecución local

### Requisitos Previos
* Node.js
* Angular CLI
* Ionic CLI 

### Pasos para iniciar el entorno de desarrollo
1. Clonar el repositorio:
   git clone https://github.com/KatherinePereira/TeLlevoApp.git
   
2. Instalar las dependencias del proyecto:
   - cd TeLlevoApp
   - npm install
   
5. Ejecutar la aplicación en el navegador:
   - ionic serve

## 👨‍💻 Autor
**Katherine Pereira**
* [GitHub](https://github.com/KatherinePereira)
