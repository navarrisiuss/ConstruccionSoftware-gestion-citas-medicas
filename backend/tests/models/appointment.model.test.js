const Appointment = require("../../src/models/appointment.model");
const db = require("../../src/config/db.config");

// Mock de la base de datos
jest.mock("../../src/config/db.config");

describe("Appointment Model", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getAll", () => {
    it("debería obtener todas las citas con información de paciente y médico", async () => {
      const mockAppointments = [
        {
          id: 1,
          patient_id: 1,
          physician_id: 1,
          date: "2025-07-15",
          time: "10:00",
          patient_name: "Juan Pérez",
          physician_name: "Dr. García",
          specialty: "Cardiología",
        },
      ];
      db.query.mockResolvedValue([mockAppointments]);

      const result = await Appointment.getAll();

      expect(db.query).toHaveBeenCalledWith(`
            SELECT a.*, p.name as patient_name, ph.name as physician_name, ph.specialty 
            FROM appointments a 
            JOIN patients p ON a.patient_id = p.id 
            JOIN physicians ph ON a.physician_id = ph.id
        `);
      expect(result).toEqual(mockAppointments);
    });

    it("debería manejar errores de base de datos", async () => {
      const dbError = new Error("Error de conexión");
      db.query.mockRejectedValue(dbError);

      await expect(Appointment.getAll()).rejects.toThrow("Error de conexión");
    });
  });

  describe("getByPatientId", () => {
    it("debería obtener citas de un paciente específico", async () => {
      const patientId = 1;
      const mockAppointments = [
        {
          id: 1,
          patient_id: 1,
          physician_id: 1,
          physician_name: "Dr. García",
          specialty: "Cardiología",
        },
      ];
      db.query.mockResolvedValue([mockAppointments]);

      const result = await Appointment.getByPatientId(patientId);

      expect(db.query).toHaveBeenCalledWith(
        `
            SELECT a.*, ph.name as physician_name, ph.specialty 
            FROM appointments a 
            JOIN physicians ph ON a.physician_id = ph.id 
            WHERE a.patient_id = ?
        `,
        [patientId]
      );
      expect(result).toEqual(mockAppointments);
    });
  });

  describe("getByPhysicianId", () => {
    it("debería obtener citas de un médico específico", async () => {
      const physicianId = 1;
      const mockAppointments = [
        {
          id: 1,
          patient_id: 1,
          physician_id: 1,
          patient_name: "Juan Pérez",
        },
      ];
      db.query.mockResolvedValue([mockAppointments]);

      const result = await Appointment.getByPhysicianId(physicianId);

      expect(db.query).toHaveBeenCalledWith(
        `
            SELECT a.*, p.name as patient_name 
            FROM appointments a 
            JOIN patients p ON a.patient_id = p.id 
            WHERE a.physician_id = ?
        `,
        [physicianId]
      );
      expect(result).toEqual(mockAppointments);
    });
  });

  describe("create", () => {
    it("debería crear una nueva cita con todos los campos", async () => {
      const appointmentData = {
        patient_id: 1,
        physician_id: 1,
        date: "2025-07-15",
        time: "10:00",
        reason: "Consulta general",
        status: "scheduled",
        priority: "normal",
        notes: "Paciente nuevo",
        medical_notes: "Sin antecedentes",
        preparation_notes: "Traer exámenes previos",
      };
      const mockResult = { insertId: 1 };
      db.query.mockResolvedValue([mockResult]);

      const result = await Appointment.create(appointmentData);

      expect(db.query).toHaveBeenCalledWith(
        `INSERT INTO appointments 
                 (patient_id, physician_id, date, time, reason, status, priority, notes, medical_notes, preparation_notes, created_at) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          1,
          1,
          "2025-07-15",
          "10:00",
          "Consulta general",
          "scheduled",
          "normal",
          "Paciente nuevo",
          "Sin antecedentes",
          "Traer exámenes previos",
        ]
      );
      expect(result).toBe(1);
    });

    it("debería crear una cita con valores por defecto", async () => {
      const appointmentData = {
        patient_id: 1,
        physician_id: 1,
        date: "2025-07-15",
        time: "10:00",
      };
      const mockResult = { insertId: 2 };
      db.query.mockResolvedValue([mockResult]);

      const result = await Appointment.create(appointmentData);

      expect(db.query).toHaveBeenCalledWith(expect.any(String), [
        1,
        1,
        "2025-07-15",
        "10:00",
        "",
        "scheduled",
        "normal",
        "",
        "",
        "",
      ]);
      expect(result).toBe(2);
    });

    it("debería propagar errores de base de datos", async () => {
      const appointmentData = { patient_id: 1 };
      const dbError = new Error("Error de inserción");
      db.query.mockRejectedValue(dbError);

      await expect(Appointment.create(appointmentData)).rejects.toThrow(
        "Error de inserción"
      );
    });
  });

  describe("checkConflict", () => {
    it("debería detectar conflicto de horario", async () => {
      const conflictingAppointment = [{ id: 5 }];
      db.query.mockResolvedValue([conflictingAppointment]);

      const result = await Appointment.checkConflict(1, "2025-07-15", "10:00");

      expect(db.query).toHaveBeenCalledWith(
        `
                SELECT id FROM appointments 
                WHERE physician_id = ? 
                AND date = ? 
                AND time = ? 
                AND status != 'cancelled'
            `,
        [1, "2025-07-15", "10:00"]
      );
      expect(result).toEqual({ id: 5 });
    });

    it("debería devolver null si no hay conflictos", async () => {
      db.query.mockResolvedValue([[]]);

      const result = await Appointment.checkConflict(1, "2025-07-15", "11:00");

      expect(result).toBeNull();
    });

    it("debería propagar errores de verificación de conflicto", async () => {
      const dbError = new Error("Error de consulta");
      db.query.mockRejectedValue(dbError);

      await expect(
        Appointment.checkConflict(1, "2025-07-15", "10:00")
      ).rejects.toThrow("Error de consulta");
    });
  });

  describe("update", () => {
    it("debería actualizar una cita existente", async () => {
      const updateData = {
        patient_id: 1,
        physician_id: 1,
        date: "2025-07-16",
        time: "11:00",
        reason: "Consulta de seguimiento",
        status: "confirmed",
        priority: "high",
        notes: "Paciente mejorado",
        medical_notes: "Continuar tratamiento",
        preparation_notes: "Traer resultados",
      };
      const mockResult = { affectedRows: 1 };
      db.query.mockResolvedValue([mockResult]);

      const result = await Appointment.update(1, updateData);

      expect(db.query).toHaveBeenCalledWith(
        `UPDATE appointments 
                 SET patient_id = ?, 
                     physician_id = ?, 
                     date = ?, 
                     time = ?, 
                     reason = ?, 
                     status = ?, 
                     priority = ?, 
                     notes = ?,
                     medical_notes = ?,
                     preparation_notes = ?, -- ✅ AGREGADO
                     updated_at = NOW() 
                 WHERE id = ?`,
        [
          1,
          1,
          "2025-07-16",
          "11:00",
          "Consulta de seguimiento",
          "confirmed",
          "high",
          "Paciente mejorado",
          "Continuar tratamiento",
          "Traer resultados",
          1,
        ]
      );
      expect(result).toBe(1);
    });

    it("debería actualizar con valores por defecto", async () => {
      const updateData = {
        patient_id: 1,
        physician_id: 1,
        date: "2025-07-16",
        time: "11:00",
      };
      const mockResult = { affectedRows: 1 };
      db.query.mockResolvedValue([mockResult]);

      const result = await Appointment.update(1, updateData);

      expect(db.query).toHaveBeenCalledWith(expect.any(String), [
        1,
        1,
        "2025-07-16",
        "11:00",
        "",
        "scheduled",
        "normal",
        "",
        "",
        "",
        1,
      ]);
      expect(result).toBe(1);
    });

    it("debería devolver 0 si la cita no existe", async () => {
      const updateData = { patient_id: 1 };
      const mockResult = { affectedRows: 0 };
      db.query.mockResolvedValue([mockResult]);

      const result = await Appointment.update(999, updateData);

      expect(result).toBe(0);
    });

    it("debería propagar errores de actualización", async () => {
      const updateData = { patient_id: 1 };
      const dbError = new Error("Error de actualización");
      db.query.mockRejectedValue(dbError);

      await expect(Appointment.update(1, updateData)).rejects.toThrow(
        "Error de actualización"
      );
    });
  });

  describe("delete", () => {
    it("debería eliminar una cita existente", async () => {
      const mockResult = { affectedRows: 1 };
      db.query.mockResolvedValue([mockResult]);

      const result = await Appointment.delete(1);

      expect(db.query).toHaveBeenCalledWith(
        "DELETE FROM appointments WHERE id = ?",
        [1]
      );
      expect(result).toBe(1);
    });

    it("debería devolver 0 si la cita no existe", async () => {
      const mockResult = { affectedRows: 0 };
      db.query.mockResolvedValue([mockResult]);

      const result = await Appointment.delete(999);

      expect(result).toBe(0);
    });

    it("debería propagar errores de eliminación", async () => {
      const dbError = new Error("Error de eliminación");
      db.query.mockRejectedValue(dbError);

      await expect(Appointment.delete(1)).rejects.toThrow(
        "Error de eliminación"
      );
    });
  });
});
