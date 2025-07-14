// Configuración global para los tests
process.env.NODE_ENV = "test";
process.env.PORT = 3001; // Puerto diferente para tests

// Mock de variables de entorno necesarias
process.env.GEMINI_API_KEY = "test-api-key";

// Mock de console.log para tests más limpios (opcional)
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Configuración de timeout para tests
jest.setTimeout(10000);
