const request = require("supertest");
const express = require("express");
const bodyParser = require("body-parser");
const assistantRoutes = require("../../src/routes/assistant.routes");
const Assistant = require("../../src/models/assistant.model");

// Mock del modelo Assistant
jest.mock("../../src/models/assistant.model");

// Configurar app de Express para testing
const app = express();
app.use(bodyParser.json());
app.use("/api/assistants", assistantRoutes);

describe("Assistant Routes Integration Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/assistants", () => {
    it("debería devolver todos los asistentes", async () => {
      const mockAssistants = [
        { id: 1, name: "Ana López", email: "ana@hospital.com" },
        { id: 2, name: "Carlos Ruiz", email: "carlos@hospital.com" },
      ];
      Assistant.getAll.mockResolvedValue(mockAssistants);

      const response = await request(app).get("/api/assistants").expect(200);

      expect(response.body).toEqual(mockAssistants);
      expect(Assistant.getAll).toHaveBeenCalled();
    });

    it("debería manejar errores del servidor", async () => {
      Assistant.getAll.mockRejectedValue(new Error("Error de conexión"));

      const response = await request(app).get("/api/assistants").expect(500);

      expect(response.body).toEqual({ message: "Error de conexión" });
    });
  });

  describe("GET /api/assistants/email", () => {
    it("debería buscar asistente por email", async () => {
      const mockAssistant = [
        { id: 1, email: "ana@hospital.com", name: "Ana López" },
      ];
      Assistant.getByEmail.mockResolvedValue(mockAssistant);

      const response = await request(app)
        .get("/api/assistants/email?email=ana@hospital.com")
        .expect(200);

      expect(response.body).toEqual(mockAssistant);
      expect(Assistant.getByEmail).toHaveBeenCalledWith("ana@hospital.com");
    });

    it("debería devolver array vacío si no encuentra el email", async () => {
      Assistant.getByEmail.mockResolvedValue([]);

      const response = await request(app)
        .get("/api/assistants/email?email=noexiste@hospital.com")
        .expect(200);

      expect(response.body).toEqual([]);
    });
  });

  describe("POST /api/assistants", () => {
    it("debería crear un nuevo asistente exitosamente", async () => {
      const newAssistantData = {
        name: "Nuevo Asistente",
        email: "nuevo@hospital.com",
        password: "password123",
        department: "Recepción",
      };
      Assistant.create.mockResolvedValue(1);

      const response = await request(app)
        .post("/api/assistants")
        .send(newAssistantData)
        .expect(201);

      expect(response.body).toEqual({
        id: 1,
        ...newAssistantData,
      });
      expect(Assistant.create).toHaveBeenCalledWith(newAssistantData);
    });

    it("debería manejar errores de creación", async () => {
      const assistantData = { name: "Asistente Error" };
      Assistant.create.mockRejectedValue(new Error("Email requerido"));

      const response = await request(app)
        .post("/api/assistants")
        .send(assistantData)
        .expect(500);

      expect(response.body.message).toBe("Email requerido");
    });
  });

  describe("PUT /api/assistants/:id", () => {
    it("debería actualizar un asistente existente", async () => {
      const updateData = {
        name: "Asistente Actualizado",
        email: "actualizado@hospital.com",
      };
      Assistant.update.mockResolvedValue(1);

      const response = await request(app)
        .put("/api/assistants/1")
        .send(updateData)
        .expect(200);

      expect(response.body).toEqual({
        message: "Asistente actualizado exitosamente",
      });
      expect(Assistant.update).toHaveBeenCalledWith("1", updateData);
    });

    it("debería devolver 404 si el asistente no existe", async () => {
      Assistant.update.mockResolvedValue(0);

      const response = await request(app)
        .put("/api/assistants/999")
        .send({ name: "Test" })
        .expect(404);

      expect(response.body.message).toBe("Asistente no encontrado");
    });
  });

  describe("DELETE /api/assistants/:id", () => {
    it("debería eliminar un asistente existente", async () => {
      Assistant.delete.mockResolvedValue(1);

      const response = await request(app)
        .delete("/api/assistants/1")
        .expect(200);

      expect(response.body).toEqual({
        message: "Asistente eliminado exitosamente",
      });
      expect(Assistant.delete).toHaveBeenCalledWith("1");
    });

    it("debería devolver 404 si el asistente no existe", async () => {
      Assistant.delete.mockResolvedValue(0);

      const response = await request(app)
        .delete("/api/assistants/999")
        .expect(404);

      expect(response.body.message).toBe("Asistente no encontrado");
    });
  });
});
