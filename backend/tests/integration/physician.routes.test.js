const request = require("supertest");
const express = require("express");
const bodyParser = require("body-parser");
const physicianRoutes = require("../../src/routes/physician.routes");
const Physician = require("../../src/models/physician.model");

// Mock del modelo Physician
jest.mock("../../src/models/physician.model");

// Configurar app de Express para testing
const app = express();
app.use(bodyParser.json());
app.use("/api/physicians", physicianRoutes);

describe("Physician Routes Integration Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/physicians", () => {
    it("debería devolver todos los médicos", async () => {
      const mockPhysicians = [
        { id: 1, name: "Dr. García", specialty: "Cardiología" },
        { id: 2, name: "Dra. López", specialty: "Neurología" },
      ];
      Physician.getAll.mockResolvedValue(mockPhysicians);

      const response = await request(app).get("/api/physicians").expect(200);

      expect(response.body).toEqual(mockPhysicians);
      expect(Physician.getAll).toHaveBeenCalled();
    });

    it("debería manejar errores del servidor", async () => {
      Physician.getAll.mockRejectedValue(new Error("Error de conexión"));

      const response = await request(app).get("/api/physicians").expect(500);

      expect(response.body).toEqual({ message: "Error de conexión" });
    });
  });

  describe("GET /api/physicians/email", () => {
    it("debería buscar médico por email", async () => {
      const mockPhysician = [
        { id: 1, email: "doctor@hospital.com", name: "Dr. García" },
      ];
      Physician.getByEmail.mockResolvedValue(mockPhysician);

      const response = await request(app)
        .get("/api/physicians/email?email=doctor@hospital.com")
        .expect(200);

      expect(response.body).toEqual(mockPhysician);
      expect(Physician.getByEmail).toHaveBeenCalledWith("doctor@hospital.com");
    });

    it("debería devolver array vacío si no encuentra el email", async () => {
      Physician.getByEmail.mockResolvedValue([]);

      const response = await request(app)
        .get("/api/physicians/email?email=noexiste@hospital.com")
        .expect(200);

      expect(response.body).toEqual([]);
    });
  });

  describe("GET /api/physicians/specialty", () => {
    it("debería obtener médicos por especialidad", async () => {
      const mockPhysicians = [
        { id: 1, name: "Dr. García", specialty: "Cardiología" },
        { id: 2, name: "Dr. Ruiz", specialty: "Cardiología" },
      ];
      Physician.getBySpecialty.mockResolvedValue(mockPhysicians);

      const response = await request(app)
        .get("/api/physicians/specialty")
        .query({ specialty: "Cardiología" })
        .expect(200);

      expect(response.body).toEqual(mockPhysicians);
      expect(Physician.getBySpecialty).toHaveBeenCalledWith("Cardiología");
    });

    it("debería devolver error 400 si no se proporciona especialidad", async () => {
      const response = await request(app)
        .get("/api/physicians/specialty")
        .expect(400);

      expect(response.body.message).toBe("Especialidad es requerida");
    });

    it("debería manejar errores del servidor", async () => {
      Physician.getBySpecialty.mockRejectedValue(
        new Error("Error de conexión")
      );

      const response = await request(app)
        .get("/api/physicians/specialty")
        .query({ specialty: "Cardiología" })
        .expect(500);

      expect(response.body.message).toBe("Error de conexión");
    });
  });

  describe("GET /api/physicians/:id", () => {
    it("debería devolver un médico por ID", async () => {
      const mockPhysician = {
        id: 1,
        name: "Dr. García",
        specialty: "Cardiología",
      };
      Physician.getById.mockResolvedValue(mockPhysician);

      const response = await request(app).get("/api/physicians/1").expect(200);

      expect(response.body).toEqual(mockPhysician);
      expect(Physician.getById).toHaveBeenCalledWith("1");
    });

    it("debería devolver 404 si el médico no existe", async () => {
      Physician.getById.mockResolvedValue(null);

      const response = await request(app)
        .get("/api/physicians/999")
        .expect(404);

      expect(response.body.message).toBe("Médico no encontrado");
    });
  });

  describe("POST /api/physicians", () => {
    it("debería crear un nuevo médico exitosamente", async () => {
      const newPhysicianData = {
        name: "Dr. Nuevo",
        paternalLastName: "Apellido",
        maternalLastName: "Materno",
        email: "nuevo@hospital.com",
        password: "password123",
        specialty: "Pediatría",
      };
      Physician.create.mockResolvedValue(1);

      const response = await request(app)
        .post("/api/physicians")
        .send(newPhysicianData)
        .expect(201);

      expect(response.body).toEqual({
        id: 1,
        ...newPhysicianData,
      });
      expect(Physician.create).toHaveBeenCalledWith(newPhysicianData);
    });

    it("debería manejar errores de creación", async () => {
      const physicianData = { name: "Dr. Error" };
      Physician.create.mockRejectedValue(new Error("Email requerido"));

      const response = await request(app)
        .post("/api/physicians")
        .send(physicianData)
        .expect(500);

      expect(response.body.message).toBe("Email requerido");
    });
  });

  describe("PUT /api/physicians/:id", () => {
    it("debería actualizar un médico existente", async () => {
      const updateData = {
        name: "Dr. García Actualizado",
        specialty: "Cardiología Avanzada",
      };
      Physician.update.mockResolvedValue(1);

      const response = await request(app)
        .put("/api/physicians/1")
        .send(updateData)
        .expect(200);

      expect(response.body).toEqual({
        message: "Médico actualizado exitosamente",
        ...updateData,
      });
      expect(Physician.update).toHaveBeenCalledWith("1", updateData);
    });

    it("debería devolver 404 si el médico no existe", async () => {
      Physician.update.mockResolvedValue(0);

      const response = await request(app)
        .put("/api/physicians/999")
        .send({ name: "Test" })
        .expect(404);

      expect(response.body.message).toBe("Médico no encontrado");
    });
  });

  describe("DELETE /api/physicians/:id", () => {
    it("debería eliminar un médico existente", async () => {
      Physician.delete.mockResolvedValue(1);

      const response = await request(app)
        .delete("/api/physicians/1")
        .expect(200);

      expect(response.body).toEqual({
        message: "Médico eliminado correctamente",
      });
      expect(Physician.delete).toHaveBeenCalledWith("1");
    });

    it("debería devolver 404 si el médico no existe", async () => {
      Physician.delete.mockResolvedValue(0);

      const response = await request(app)
        .delete("/api/physicians/999")
        .expect(404);

      expect(response.body.message).toBe("Médico no encontrado");
    });
  });
});
