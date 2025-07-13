const request = require("supertest");
const express = require("express");
const bodyParser = require("body-parser");
const authRoutes = require("../../src/routes/auth.routes");
const Patient = require("../../src/models/patient.model");
const Physician = require("../../src/models/physician.model");
const Admin = require("../../src/models/admin.model");
const Assistant = require("../../src/models/assistant.model");

// Mock de los modelos
jest.mock("../../src/models/patient.model");
jest.mock("../../src/models/physician.model");
jest.mock("../../src/models/admin.model");
jest.mock("../../src/models/assistant.model");

// Configurar app de Express para testing
const app = express();
app.use(bodyParser.json());
app.use("/api/auth", authRoutes);

describe("Auth Routes Integration Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/auth", () => {
    it("debería autenticar un paciente exitosamente", async () => {
      const mockPatient = [
        {
          id: 1,
          email: "paciente@test.com",
          password: "hashedPassword",
          name: "Juan Pérez",
        },
      ];

      Patient.getByEmail.mockResolvedValue(mockPatient);
      Physician.getByEmail.mockResolvedValue([]);
      Admin.getByEmail.mockResolvedValue([]);
      Assistant.getByEmail.mockResolvedValue([]);

      const response = await request(app)
        .get("/api/auth?email=paciente@test.com")
        .expect(200);

      expect(response.body).toEqual([
        {
          id: 1,
          name: "Juan Pérez",
          email: "paciente@test.com",
          password: "hashedPassword",
          role: "patient",
        },
      ]);
    });

    it("debería autenticar un médico exitosamente", async () => {
      const mockPhysician = [
        {
          id: 1,
          email: "doctor@test.com",
          password: "hashedPassword",
          name: "Dr. García",
          specialty: "Cardiología",
        },
      ];

      Patient.getByEmail.mockResolvedValue([]);
      Physician.getByEmail.mockResolvedValue(mockPhysician);
      Admin.getByEmail.mockResolvedValue([]);
      Assistant.getByEmail.mockResolvedValue([]);

      const response = await request(app)
        .get("/api/auth?email=doctor@test.com")
        .expect(200);

      expect(response.body).toEqual([
        {
          id: 1,
          name: "Dr. García",
          email: "doctor@test.com",
          password: "hashedPassword",
          role: "physician",
          specialty: "Cardiología",
        },
      ]);
    });

    it("debería autenticar un administrador exitosamente", async () => {
      const mockAdmin = [
        {
          id: 1,
          email: "admin@test.com",
          password: "hashedPassword",
          name: "Admin Principal",
        },
      ];

      Patient.getByEmail.mockResolvedValue([]);
      Physician.getByEmail.mockResolvedValue([]);
      Admin.getByEmail.mockResolvedValue(mockAdmin);
      Assistant.getByEmail.mockResolvedValue([]);

      const response = await request(app)
        .get("/api/auth?email=admin@test.com")
        .expect(200);

      expect(response.body).toEqual([
        {
          id: 1,
          name: "Admin Principal",
          email: "admin@test.com",
          password: "hashedPassword",
          role: "admin",
        },
      ]);
    });

    it("debería autenticar un asistente exitosamente", async () => {
      const mockAssistant = [
        {
          id: 1,
          email: "asistente@test.com",
          password: "hashedPassword",
          name: "Ana López",
        },
      ];

      Patient.getByEmail.mockResolvedValue([]);
      Physician.getByEmail.mockResolvedValue([]);
      Admin.getByEmail.mockResolvedValue([]);
      Assistant.getByEmail.mockResolvedValue(mockAssistant);

      const response = await request(app)
        .get("/api/auth?email=asistente@test.com")
        .expect(200);

      expect(response.body).toEqual([
        {
          id: 1,
          name: "Ana López",
          email: "asistente@test.com",
          password: "hashedPassword",
          role: "assistant",
        },
      ]);
    });

    it("debería devolver array vacío si el usuario no existe", async () => {
      Patient.getByEmail.mockResolvedValue([]);
      Physician.getByEmail.mockResolvedValue([]);
      Admin.getByEmail.mockResolvedValue([]);
      Assistant.getByEmail.mockResolvedValue([]);

      const response = await request(app)
        .get("/api/auth?email=noexiste@test.com")
        .expect(200);

      expect(response.body).toEqual([]);
    });

    it("debería manejar errores del servidor", async () => {
      Patient.getByEmail.mockRejectedValue(new Error("Error de base de datos"));

      const response = await request(app)
        .get("/api/auth?email=test@test.com")
        .expect(500);

      expect(response.body.message).toBe("Error de base de datos");
    });
  });
});
