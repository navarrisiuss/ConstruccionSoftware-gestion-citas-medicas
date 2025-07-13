const request = require("supertest");
const express = require("express");
const bodyParser = require("body-parser");
const patientRoutes = require("../../src/routes/patient.routes");
const Patient = require("../../src/models/patient.model");
const db = require("../../src/config/db.config");

// Mock de modelos y base de datos
jest.mock("../../src/models/patient.model");
jest.mock("../../src/config/db.config");

// Configurar app de Express para testing
const app = express();
app.use(bodyParser.json());
app.use("/api/patients", patientRoutes);

describe("Patient Routes Integration Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    db.query = jest.fn();
  });

  describe("GET /api/patients", () => {
    it("debería devolver lista de pacientes activos", async () => {
      const mockPatients = [
        { id: 1, name: "Juan Pérez", active: 1 },
        { id: 2, name: "Ana García", active: 1 },
      ];
      Patient.getAll.mockResolvedValue(mockPatients);

      const response = await request(app).get("/api/patients").expect(200);

      expect(response.body).toEqual(mockPatients);
      expect(Patient.getAll).toHaveBeenCalledWith(false);
    });

    it("debería incluir pacientes inactivos cuando se especifica", async () => {
      const mockPatients = [
        { id: 1, name: "Juan Pérez", active: 1 },
        { id: 2, name: "Ana García", active: 0 },
      ];
      Patient.getAll.mockResolvedValue(mockPatients);

      const response = await request(app)
        .get("/api/patients?includeInactive=true")
        .expect(200);

      expect(response.body).toEqual(mockPatients);
      expect(Patient.getAll).toHaveBeenCalledWith(true);
    });

    it("debería manejar errores del servidor", async () => {
      Patient.getAll.mockRejectedValue(new Error("Error de conexión"));

      const response = await request(app).get("/api/patients").expect(500);

      expect(response.body).toEqual({ message: "Error de conexión" });
    });
  });

  describe("POST /api/patients", () => {
    it("debería crear un nuevo paciente exitosamente", async () => {
      const newPatient = {
        name: "Juan",
        paternalLastName: "Pérez",
        maternalLastName: "González",
        email: "juan@email.com",
        password: "password123",
        rut: "12345678-9",
        birthDate: "1990-01-01",
        phone: "123456789",
        address: "Calle 123",
        gender: "M",
      };
      Patient.create.mockResolvedValue(1);

      const response = await request(app)
        .post("/api/patients")
        .send(newPatient)
        .expect(201);

      expect(response.body).toEqual({
        id: 1,
        ...newPatient,
      });
      expect(Patient.create).toHaveBeenCalledWith(newPatient);
    });

    it("debería manejar errores de validación", async () => {
      const invalidPatient = { name: "Juan" }; // Datos incompletos
      Patient.create.mockRejectedValue(new Error("RUT es requerido"));

      const response = await request(app)
        .post("/api/patients")
        .send(invalidPatient)
        .expect(500);

      expect(response.body.message).toBe("RUT es requerido");
    });
  });

  describe("GET /api/patients/check-rut", () => {
    it("debería verificar si el RUT existe", async () => {
      const mockPatient = { id: 1, rut: "12345678-9", name: "Juan Pérez" };
      Patient.getByRut.mockResolvedValue([mockPatient]);

      const response = await request(app)
        .get("/api/patients/check-rut?rut=12345678-9")
        .expect(200);

      expect(response.body).toEqual({
        exists: true,
        patient: mockPatient,
      });
    });

    it("debería devolver false cuando el RUT no existe", async () => {
      Patient.getByRut.mockResolvedValue([]);

      const response = await request(app)
        .get("/api/patients/check-rut?rut=99999999-9")
        .expect(200);

      expect(response.body).toEqual({ exists: false });
    });
  });

  describe("PUT /api/patients/:id", () => {
    it("debería actualizar un paciente existente", async () => {
      const updateData = {
        name: "Juan Carlos",
        email: "juancarlos@email.com",
      };
      Patient.update.mockResolvedValue(1);

      const response = await request(app)
        .put("/api/patients/1")
        .send(updateData)
        .expect(200);

      expect(response.body).toEqual({
        message: "Paciente actualizado exitosamente",
        ...updateData,
      });
      expect(Patient.update).toHaveBeenCalledWith("1", updateData);
    });

    it("debería devolver 404 cuando el paciente no existe", async () => {
      Patient.update.mockResolvedValue(0);

      const response = await request(app)
        .put("/api/patients/999")
        .send({ name: "Test" })
        .expect(404);

      expect(response.body.message).toBe("Paciente no encontrado");
    });
  });

  describe("PATCH /api/patients/:id/deactivate", () => {
    it("debería desactivar un paciente activo", async () => {
      const mockPatient = { id: 1, active: 1 };
      Patient.getById.mockResolvedValue([mockPatient]);
      Patient.deactivate.mockResolvedValue(1);

      const response = await request(app)
        .patch("/api/patients/1/deactivate")
        .expect(200);

      expect(response.body).toEqual({
        message: "Paciente desactivado exitosamente",
        patientId: "1",
        deactivated: true,
      });
    });

    it("debería rechazar desactivar un paciente ya inactivo", async () => {
      const mockPatient = { id: 1, active: 0 };
      Patient.getById.mockResolvedValue([mockPatient]);

      const response = await request(app)
        .patch("/api/patients/1/deactivate")
        .expect(400);

      expect(response.body.message).toBe("El paciente ya está desactivado");
    });
  });

  describe("PATCH /api/patients/:id/reactivate", () => {
    it("debería reactivar un paciente inactivo", async () => {
      const mockPatient = { id: 1, active: 0 };
      Patient.getById.mockResolvedValue([mockPatient]);
      Patient.reactivate.mockResolvedValue(1);

      const response = await request(app)
        .patch("/api/patients/1/reactivate")
        .expect(200);

      expect(response.body).toEqual({
        message: "Paciente reactivado exitosamente",
        patientId: "1",
        reactivated: true,
      });
    });
  });

  describe("DELETE /api/patients/:id", () => {
    it("debería eliminar permanentemente un paciente desactivado sin citas", async () => {
      const mockPatient = { id: 1, active: 0 };
      Patient.getById.mockResolvedValue([mockPatient]);
      db.query.mockResolvedValue([[{ count: 0 }]]); // Sin citas
      Patient.delete.mockResolvedValue(1);

      const response = await request(app).delete("/api/patients/1").expect(200);

      expect(response.body).toEqual({
        message: "Paciente eliminado permanentemente",
        deletedId: "1",
      });
    });

    it("debería rechazar eliminar un paciente activo", async () => {
      const mockPatient = { id: 1, active: 1 };
      Patient.getById.mockResolvedValue([mockPatient]);

      const response = await request(app).delete("/api/patients/1").expect(400);

      expect(response.body.message).toBe(
        "Debe desactivar el paciente antes de eliminarlo permanentemente"
      );
    });

    it("debería rechazar eliminar un paciente con citas", async () => {
      const mockPatient = { id: 1, active: 0 };
      Patient.getById.mockResolvedValue([mockPatient]);
      db.query.mockResolvedValue([[{ count: 3 }]]); // Tiene citas

      const response = await request(app).delete("/api/patients/1").expect(409);

      expect(response.body).toEqual({
        message:
          "No se puede eliminar permanentemente el paciente porque tiene citas médicas asociadas",
        appointmentCount: 3,
        suggestion:
          "Mantenga el paciente desactivado para preservar el historial médico",
      });
    });
  });

  describe("GET /api/patients/search", () => {
    it("debería buscar pacientes por email", async () => {
      const mockPatients = [{ id: 1, email: "test@email.com" }];
      Patient.getByEmail.mockResolvedValue(mockPatients);

      const response = await request(app)
        .get("/api/patients/search?email=test@email.com")
        .expect(200);

      expect(response.body).toEqual(mockPatients);
      expect(Patient.getByEmail).toHaveBeenCalledWith("test@email.com");
    });

    it("debería devolver error 400 si no se proporciona email", async () => {
      const response = await request(app)
        .get("/api/patients/search?email=")
        .expect(400);

      expect(response.body.message).toBe('Parámetro "email" es requerido');
    });

    it("debería devolver array vacío si no encuentra resultados", async () => {
      Patient.getByEmail.mockResolvedValue([]);

      const response = await request(app)
        .get("/api/patients/search?email=noexiste@email.com")
        .expect(200);

      expect(response.body).toEqual([]);
    });
  });

  describe("GET /api/patients/:id", () => {
    it("debería devolver un paciente por ID", async () => {
      const mockPatient = { id: 1, name: "Juan Pérez" };
      Patient.getById.mockResolvedValue([mockPatient]);

      const response = await request(app).get("/api/patients/1").expect(200);

      expect(response.body).toEqual(mockPatient);
      expect(Patient.getById).toHaveBeenCalledWith("1");
    });

    it("debería devolver 404 si el paciente no existe", async () => {
      Patient.getById.mockResolvedValue([]);

      const response = await request(app).get("/api/patients/999").expect(404);

      expect(response.body.message).toBe("Paciente no encontrado");
    });
  });
});
