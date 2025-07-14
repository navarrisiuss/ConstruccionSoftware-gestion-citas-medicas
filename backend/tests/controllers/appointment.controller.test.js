const appointmentController = require("../../src/controllers/appointment.controller");
const Appointment = require("../../src/models/appointment.model");
const db = require("../../src/config/db.config");

// Mock de modelos y base de datos
jest.mock("../../src/models/appointment.model");
jest.mock("../../src/config/db.config");

describe("Appointment Controller", () => {
  let req, res;

  beforeEach(() => {
    req = {
      params: {},
      query: {},
      body: {},
    };
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
    db.query = jest.fn();
  });

  describe("getAllAppointments", () => {
    it("debería devolver todas las citas", async () => {
      const mockAppointments = [
        { id: 1, patient_id: 1, physician_id: 1, date: "2025-07-15" },
        { id: 2, patient_id: 2, physician_id: 1, date: "2025-07-16" },
      ];
      Appointment.getAll.mockResolvedValue(mockAppointments);

      await appointmentController.getAllAppointments(req, res);

      expect(Appointment.getAll).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(mockAppointments);
    });

    it("debería manejar errores correctamente", async () => {
      const errorMessage = "Error de conexión";
      Appointment.getAll.mockRejectedValue(new Error(errorMessage));

      await appointmentController.getAllAppointments(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: errorMessage });
    });
  });

  describe("getAppointmentsByPatient", () => {
    it("debería devolver citas de un paciente específico", async () => {
      const patientId = "1";
      const mockAppointments = [
        { id: 1, patient_id: 1, physician_id: 1, date: "2025-07-15" },
      ];
      req.params.patientId = patientId;
      Appointment.getByPatientId.mockResolvedValue(mockAppointments);

      await appointmentController.getAppointmentsByPatient(req, res);

      expect(Appointment.getByPatientId).toHaveBeenCalledWith(patientId);
      expect(res.json).toHaveBeenCalledWith(mockAppointments);
    });
  });

  describe("getAppointmentsByPhysician", () => {
    it("debería devolver citas de un médico específico", async () => {
      const physicianId = "1";
      const mockAppointments = [
        { id: 1, patient_id: 1, physician_id: 1, date: "2025-07-15" },
      ];
      req.params.physicianId = physicianId;
      Appointment.getByPhysicianId.mockResolvedValue(mockAppointments);

      await appointmentController.getAppointmentsByPhysician(req, res);

      expect(Appointment.getByPhysicianId).toHaveBeenCalledWith(physicianId);
      expect(res.json).toHaveBeenCalledWith(mockAppointments);
    });
  });

  describe("createAppointment", () => {
    it("debería crear una nueva cita exitosamente", async () => {
      const appointmentData = {
        patient_id: 1,
        physician_id: 1,
        date: "2025-07-15",
        time: "10:00",
        reason: "Consulta general",
        specialty: "Medicina General",
      };
      const appointmentId = 1;

      req.body = appointmentData;
      Appointment.create.mockResolvedValue(appointmentId);

      await appointmentController.createAppointment(req, res);

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
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        id: appointmentId,
        message: "Cita creada exitosamente",
        preparation_notes: "",
      });
    });

    it("debería usar valores por defecto para campos opcionales", async () => {
      const basicAppointmentData = {
        patient_id: 1,
        physician_id: 1,
        date: "2025-07-15",
        time: "10:00",
      };

      req.body = basicAppointmentData;
      Appointment.create.mockResolvedValue(1);

      await appointmentController.createAppointment(req, res);

      expect(Appointment.create).toHaveBeenCalledWith({
        patient_id: 1,
        physician_id: 1,
        date: "2025-07-15",
        time: "10:00",
        reason: undefined,
        status: "scheduled",
        priority: "normal",
        notes: "",
        medical_notes: "",
        preparation_notes: "",
        specialty: "",
        location: "",
      });
    });
  });

  describe("updateAppointment", () => {
    it("debería actualizar una cita existente", async () => {
      const updateData = {
        reason: "Consulta de seguimiento",
        status: "confirmed",
      };
      req.params.id = "1";
      req.body = updateData;

      Appointment.update.mockResolvedValue(1);

      await appointmentController.updateAppointment(req, res);

      expect(Appointment.update).toHaveBeenCalledWith("1", updateData);
      expect(res.json).toHaveBeenCalledWith({
        message: "Cita actualizada exitosamente",
        status: "confirmed",
      });
    });

    it("debería asignar status por defecto si no se proporciona", async () => {
      const updateData = { reason: "Nueva razón" };
      req.params.id = "1";
      req.body = updateData;

      Appointment.update.mockResolvedValue(1);

      await appointmentController.updateAppointment(req, res);

      expect(Appointment.update).toHaveBeenCalledWith("1", {
        reason: "Nueva razón",
        status: "scheduled",
      });
    });

    it("debería devolver 404 si la cita no existe", async () => {
      req.params.id = "999";
      req.body = { reason: "Test" };

      Appointment.update.mockResolvedValue(0);

      await appointmentController.updateAppointment(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Cita no encontrada" });
    });
  });

  describe("updateAppointmentNotes", () => {
    it("debería actualizar las notas médicas exitosamente", async () => {
      const notesData = {
        medical_notes: "Paciente presenta mejoría",
      };
      req.params.id = "1";
      req.body = notesData;

      db.query.mockResolvedValue([{ affectedRows: 1 }]);

      await appointmentController.updateAppointmentNotes(req, res);

      expect(db.query).toHaveBeenCalledWith(
        "UPDATE appointments SET medical_notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        ["Paciente presenta mejoría", "1"]
      );
      expect(res.json).toHaveBeenCalledWith({
        message: "Notas médicas actualizadas correctamente",
        medical_notes: "Paciente presenta mejoría",
      });
    });

    it("debería devolver 404 si la cita no existe", async () => {
      req.params.id = "999";
      req.body = { medical_notes: "Test" };

      db.query.mockResolvedValue([{ affectedRows: 0 }]);

      await appointmentController.updateAppointmentNotes(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Cita no encontrada" });
    });
  });

  describe("updateAppointmentStatus", () => {
    it("debería actualizar el status correctamente", async () => {
      req.params.id = "1";
      req.body = { status: "completed" };

      db.query.mockResolvedValue([{ affectedRows: 1 }]);

      await appointmentController.updateAppointmentStatus(req, res);

      expect(db.query).toHaveBeenCalledWith(
        "UPDATE appointments SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        ["completed", "1"]
      );
      expect(res.json).toHaveBeenCalledWith({
        message: "Estado actualizado correctamente",
        status: "completed",
      });
    });

    it("debería rechazar status inválidos", async () => {
      req.params.id = "1";
      req.body = { status: "invalid_status" };

      await appointmentController.updateAppointmentStatus(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Estado inválido" });
    });

    it("debería devolver 404 si la cita no existe", async () => {
      req.params.id = "999";
      req.body = { status: "completed" };

      db.query.mockResolvedValue([{ affectedRows: 0 }]);

      await appointmentController.updateAppointmentStatus(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Cita no encontrada" });
    });
  });

  describe("cancelAppointment", () => {
    it("debería cancelar una cita exitosamente", async () => {
      const cancellationData = {
        status: "cancelled",
        cancellation_reason: "patient_request",
        cancellation_details: "Emergencia familiar",
        cancelled_by: "patient",
      };
      req.params.id = "1";
      req.body = cancellationData;

      db.query
        .mockResolvedValueOnce([[{ id: 1 }]]) // Cita existe
        .mockResolvedValueOnce([{ affectedRows: 1 }]); // Actualización exitosa

      await appointmentController.cancelAppointment(req, res);

      expect(db.query).toHaveBeenCalledWith(
        "SELECT id FROM appointments WHERE id = ?",
        ["1"]
      );
      expect(res.json).toHaveBeenCalledWith({
        message: "Cita cancelada correctamente",
        appointmentId: "1",
        cancellation_reason: "patient_request",
        cancelled_at: expect.any(Date),
      });
    });

    it("debería devolver 404 si la cita no existe", async () => {
      req.params.id = "999";
      req.body = { status: "cancelled" };

      db.query.mockResolvedValue([[]]);

      await appointmentController.cancelAppointment(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Cita no encontrada" });
    });
  });

  describe("deleteAppointment", () => {
    it("debería eliminar una cita exitosamente", async () => {
      req.params.id = "1";

      Appointment.delete.mockResolvedValue(1);

      await appointmentController.deleteAppointment(req, res);

      expect(Appointment.delete).toHaveBeenCalledWith("1");
      expect(res.json).toHaveBeenCalledWith({
        message: "Cita eliminada exitosamente",
        deletedId: "1",
      });
    });

    it("debería devolver 404 si la cita no existe", async () => {
      req.params.id = "999";

      Appointment.delete.mockResolvedValue(0);

      await appointmentController.deleteAppointment(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Cita no encontrada" });
    });
  });
});
