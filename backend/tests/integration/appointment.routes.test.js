const request = require("supertest");
const express = require("express");
const bodyParser = require("body-parser");
const appointmentRoutes = require("../../src/routes/appointment.routes");
const Appointment = require("../../src/models/appointment.model");
const db = require("../../src/config/db.config");

// Mock de modelos y base de datos
jest.mock("../../src/models/appointment.model");
jest.mock("../../src/config/db.config");

// Configurar app de Express para testing
const app = express();
app.use(bodyParser.json());
app.use("/api/appointments", appointmentRoutes);

describe("Appointment Routes Integration Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    db.query = jest.fn();
  });

  describe("GET /api/appointments", () => {
    it("debería devolver todas las citas", async () => {
      const mockAppointments = [
        {
          id: 1,
          patient_id: 1,
          physician_id: 1,
          date: "2025-07-15",
          patient_name: "Juan Pérez",
          physician_name: "Dr. García",
        },
      ];
      Appointment.getAll.mockResolvedValue(mockAppointments);

      const response = await request(app).get("/api/appointments").expect(200);

      expect(response.body).toEqual(mockAppointments);
      expect(Appointment.getAll).toHaveBeenCalled();
    });

    it("debería manejar errores del servidor", async () => {
      Appointment.getAll.mockRejectedValue(new Error("Error de conexión"));

      const response = await request(app).get("/api/appointments").expect(500);

      expect(response.body).toEqual({ message: "Error de conexión" });
    });
  });

  describe("GET /api/appointments/patient/:patientId", () => {
    it("debería devolver citas de un paciente específico", async () => {
      const mockAppointments = [
        {
          id: 1,
          patient_id: 1,
          physician_id: 1,
          physician_name: "Dr. García",
          specialty: "Cardiología",
        },
      ];
      Appointment.getByPatientId.mockResolvedValue(mockAppointments);

      const response = await request(app)
        .get("/api/appointments/patient/1")
        .expect(200);

      expect(response.body).toEqual(mockAppointments);
      expect(Appointment.getByPatientId).toHaveBeenCalledWith("1");
    });
  });

  describe("GET /api/appointments/physician/:physicianId", () => {
    it("debería devolver citas de un médico específico", async () => {
      const mockAppointments = [
        {
          id: 1,
          patient_id: 1,
          physician_id: 1,
          patient_name: "Juan Pérez",
        },
      ];
      Appointment.getByPhysicianId.mockResolvedValue(mockAppointments);

      const response = await request(app)
        .get("/api/appointments/physician/1")
        .expect(200);

      expect(response.body).toEqual(mockAppointments);
      expect(Appointment.getByPhysicianId).toHaveBeenCalledWith("1");
    });
  });

  describe("POST /api/appointments", () => {
    it("debería crear una nueva cita exitosamente", async () => {
      const newAppointment = {
        patient_id: 1,
        physician_id: 1,
        date: "2025-07-15",
        time: "10:00",
        reason: "Consulta general",
        specialty: "Medicina General",
      };
      Appointment.create.mockResolvedValue(1);

      const response = await request(app)
        .post("/api/appointments")
        .send(newAppointment)
        .expect(201);

      expect(response.body).toEqual({
        id: 1,
        message: "Cita creada exitosamente",
        preparation_notes: "",
      });
      expect(Appointment.create).toHaveBeenCalledWith({
        patient_id: 1,
        physician_id: 1,
        date: "2025-07-15",
        time: "10:00",
        reason: "Consulta general",
        status: "scheduled",
        priority: "normal",
        notes: "",
        medical_notes: "",
        preparation_notes: "",
        specialty: "Medicina General",
        location: "",
      });
    });

    it("debería manejar errores de creación", async () => {
      const appointmentData = { patient_id: 1 };
      Appointment.create.mockRejectedValue(new Error("Datos incompletos"));

      const response = await request(app)
        .post("/api/appointments")
        .send(appointmentData)
        .expect(500);

      expect(response.body.message).toBe("Datos incompletos");
    });
  });

  describe("PUT /api/appointments/:id", () => {
    it("debería actualizar una cita existente", async () => {
      const updateData = {
        reason: "Consulta de seguimiento",
        status: "confirmed",
      };
      Appointment.update.mockResolvedValue(1);

      const response = await request(app)
        .put("/api/appointments/1")
        .send(updateData)
        .expect(200);

      expect(response.body).toEqual({
        message: "Cita actualizada exitosamente",
        status: "confirmed",
      });
      expect(Appointment.update).toHaveBeenCalledWith("1", updateData);
    });

    it("debería devolver 404 si la cita no existe", async () => {
      Appointment.update.mockResolvedValue(0);

      const response = await request(app)
        .put("/api/appointments/999")
        .send({ reason: "Test" })
        .expect(404);

      expect(response.body.message).toBe("Cita no encontrada");
    });
  });

  describe("PUT /api/appointments/:id/notes", () => {
    it("debería actualizar las notas médicas", async () => {
      const notesData = {
        medical_notes: "Paciente presenta mejoría significativa",
      };
      db.query.mockResolvedValue([{ affectedRows: 1 }]);

      const response = await request(app)
        .put("/api/appointments/1/notes")
        .send(notesData)
        .expect(200);

      expect(response.body).toEqual({
        message: "Notas médicas actualizadas correctamente",
        medical_notes: "Paciente presenta mejoría significativa",
      });
    });
  });

  describe("PUT /api/appointments/:id/status", () => {
    it("debería actualizar el estado de una cita", async () => {
      const statusData = { status: "completed" };
      db.query.mockResolvedValue([{ affectedRows: 1 }]);

      const response = await request(app)
        .put("/api/appointments/1/status")
        .send(statusData)
        .expect(200);

      expect(response.body).toEqual({
        message: "Estado actualizado correctamente",
        status: "completed",
      });
    });

    it("debería rechazar estados inválidos", async () => {
      const response = await request(app)
        .put("/api/appointments/1/status")
        .send({ status: "invalid_status" })
        .expect(400);

      expect(response.body.message).toBe("Estado inválido");
    });
  });

  describe("PUT /api/appointments/:id/cancel", () => {
    it("debería cancelar una cita exitosamente", async () => {
      const cancellationData = {
        status: "cancelled",
        cancellation_reason: "patient_request",
        cancellation_details: "Emergencia familiar",
        cancelled_by: "patient",
      };

      db.query
        .mockResolvedValueOnce([[{ id: 1 }]]) // Cita existe
        .mockResolvedValueOnce([{ affectedRows: 1 }]); // Cancelación exitosa

      const response = await request(app)
        .put("/api/appointments/1/cancel")
        .send(cancellationData)
        .expect(200);

      expect(response.body).toEqual({
        message: "Cita cancelada correctamente",
        appointmentId: "1",
        cancellation_reason: "patient_request",
        cancelled_at: expect.any(String),
      });
    });
  });

  describe("DELETE /api/appointments/:id", () => {
    it("debería eliminar una cita existente", async () => {
      Appointment.delete.mockResolvedValue(1);

      const response = await request(app)
        .delete("/api/appointments/1")
        .expect(200);

      expect(response.body).toEqual({
        message: "Cita eliminada exitosamente",
        deletedId: "1",
      });
      expect(Appointment.delete).toHaveBeenCalledWith("1");
    });

    it("debería devolver 404 si la cita no existe", async () => {
      Appointment.delete.mockResolvedValue(0);

      const response = await request(app)
        .delete("/api/appointments/999")
        .expect(404);

      expect(response.body.message).toBe("Cita no encontrada");
    });
  });
});
