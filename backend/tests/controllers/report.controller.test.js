const reportController = require("../../src/controllers/report.controller");
const db = require("../../src/config/db.config");
const fs = require("fs");
const path = require("path");

// Mock de dependencias
jest.mock("../../src/config/db.config");
jest.mock("fs");
jest.mock("path");

describe("Report Controller Tests", () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
    };
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();

    // Mock console.error para evitar spam en tests
    jest.spyOn(console, "error").mockImplementation(() => {});
    jest.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore();
    console.warn.mockRestore();
  });

  describe("generateAppointmentsReport", () => {
    it("debería generar reporte de citas exitosamente", async () => {
      const mockAppointments = [
        {
          id: 1,
          date: "2025-01-15",
          time: "10:00:00",
          status: "completed",
          priority: "normal",
          reason: "Consulta general",
          patient_name: "Juan Pérez",
          physician_name: "Dr. García",
          physician_specialty: "Cardiología",
        },
      ];

      const mockStats = [
        { status: "completed", count: 5, percentage: 50.0 },
        { status: "pending", count: 3, percentage: 30.0 },
      ];

      const mockSpecialtyStats = [
        { specialty: "Cardiología", count: 3, completed: 2, cancelled: 1 },
      ];

      const mockPhysicianStats = [
        {
          physician_name: "Dr. García",
          specialty: "Cardiología",
          total_appointments: 3,
          completed: 2,
          cancelled: 1,
          no_show: 0,
        },
      ];

      db.query
        .mockResolvedValueOnce([mockAppointments]) // appointments query
        .mockResolvedValueOnce([mockStats]) // stats query
        .mockResolvedValueOnce([mockSpecialtyStats]) // specialty stats
        .mockResolvedValueOnce([mockPhysicianStats]); // physician stats

      req.body = {
        startDate: "2025-01-01",
        endDate: "2025-01-31",
        physicianId: "1",
        specialty: "Cardiología",
        status: "completed",
      };

      await reportController.generateAppointmentsReport(req, res);

      expect(db.query).toHaveBeenCalledTimes(4);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          reportInfo: expect.objectContaining({
            type: "appointments",
            totalRecords: 1,
          }),
          appointments: mockAppointments,
          statistics: expect.objectContaining({
            statusDistribution: mockStats,
            specialtyBreakdown: mockSpecialtyStats,
            physicianPerformance: mockPhysicianStats,
          }),
        })
      );
    });

    it("debería generar reporte sin filtros opcionales", async () => {
      const mockAppointments = [];
      const mockStats = [];
      const mockSpecialtyStats = [];
      const mockPhysicianStats = [];

      db.query
        .mockResolvedValueOnce([mockAppointments])
        .mockResolvedValueOnce([mockStats])
        .mockResolvedValueOnce([mockSpecialtyStats])
        .mockResolvedValueOnce([mockPhysicianStats]);

      req.body = {
        startDate: "2025-01-01",
        endDate: "2025-01-31",
      };

      await reportController.generateAppointmentsReport(req, res);

      expect(db.query).toHaveBeenCalledTimes(4);
      expect(res.json).toHaveBeenCalled();
    });

    it("debería manejar errores de base de datos", async () => {
      const error = new Error("Error de conexión a BD");
      db.query.mockRejectedValue(error);

      req.body = {
        startDate: "2025-01-01",
        endDate: "2025-01-31",
      };

      await reportController.generateAppointmentsReport(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Error de conexión a BD",
      });
    });
  });

  describe("generatePhysiciansReport", () => {
    it("debería generar reporte de médicos exitosamente", async () => {
      const mockPhysicians = [
        {
          id: 1,
          name: "Dr. García",
          paternalLastName: "López",
          maternalLastName: "Ruiz",
          email: "garcia@hospital.com",
          specialty: "Cardiología",
          total_appointments: 10,
          completed_appointments: 8,
          cancelled_appointments: 2,
          upcoming_appointments: 3,
        },
      ];

      const mockGeneralStats = [
        { specialty: "Cardiología", physician_count: 3 },
        { specialty: "Neurología", physician_count: 2 },
      ];

      db.query
        .mockResolvedValueOnce([mockPhysicians])
        .mockResolvedValueOnce([mockGeneralStats]);

      req.body = { specialty: "Cardiología" };

      await reportController.generatePhysiciansReport(req, res);

      expect(db.query).toHaveBeenCalledTimes(2);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          reportInfo: expect.objectContaining({
            type: "physicians",
            totalRecords: 1,
          }),
          physicians: mockPhysicians,
          statistics: expect.objectContaining({
            specialtyDistribution: mockGeneralStats,
          }),
        })
      );
    });

    it("debería generar reporte sin filtro de especialidad", async () => {
      const mockPhysicians = [];
      const mockGeneralStats = [];

      db.query
        .mockResolvedValueOnce([mockPhysicians])
        .mockResolvedValueOnce([mockGeneralStats]);

      req.body = {};

      await reportController.generatePhysiciansReport(req, res);

      expect(db.query).toHaveBeenCalledTimes(2);
      expect(res.json).toHaveBeenCalled();
    });

    it("debería manejar errores en reporte de médicos", async () => {
      const error = new Error("Error en query de médicos");
      db.query.mockRejectedValue(error);

      req.body = { specialty: "Cardiología" };

      await reportController.generatePhysiciansReport(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Error en query de médicos",
      });
    });
  });

  describe("generatePatientsReport", () => {
    it("debería generar reporte de pacientes con rango de fechas", async () => {
      const mockPatients = [
        {
          id: 1,
          name: "Juan",
          paternalLastName: "Pérez",
          maternalLastName: "García",
          email: "juan@email.com",
          rut: "12345678-9",
          phone: "123456789",
          gender: "M",
          birthDate: "1990-01-01",
          total_appointments: 5,
          completed_appointments: 4,
          cancelled_appointments: 1,
          no_show_appointments: 0,
          last_appointment_date: "2025-01-15",
          first_appointment_date: "2024-12-01",
        },
      ];

      const mockGenderStats = [
        { gender: "M", count: 3, avg_age: 34.5 },
        { gender: "F", count: 5, avg_age: 28.2 },
      ];

      db.query
        .mockResolvedValueOnce([mockPatients])
        .mockResolvedValueOnce([mockGenderStats]);

      req.body = {
        startDate: "2025-01-01",
        endDate: "2025-01-31",
      };

      await reportController.generatePatientsReport(req, res);

      expect(db.query).toHaveBeenCalledTimes(2);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          reportInfo: expect.objectContaining({
            type: "patients",
            totalRecords: 1,
          }),
          patients: mockPatients,
          statistics: expect.objectContaining({
            genderDistribution: mockGenderStats,
          }),
        })
      );
    });

    it("debería generar reporte sin rango de fechas", async () => {
      const mockPatients = [];
      const mockGenderStats = [];

      db.query
        .mockResolvedValueOnce([mockPatients])
        .mockResolvedValueOnce([mockGenderStats]);

      req.body = {};

      await reportController.generatePatientsReport(req, res);

      expect(db.query).toHaveBeenCalledTimes(2);
      expect(res.json).toHaveBeenCalled();
    });

    it("debería manejar errores en reporte de pacientes", async () => {
      const error = new Error("Error en query de pacientes");
      db.query.mockRejectedValue(error);

      req.body = {
        startDate: "2025-01-01",
        endDate: "2025-01-31",
      };

      await reportController.generatePatientsReport(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Error en query de pacientes",
      });
    });
  });

  describe("saveReport", () => {
    beforeEach(() => {
      path.join.mockReturnValue("/mock/path/to/report.json");
      fs.existsSync.mockReturnValue(false);
      fs.mkdirSync.mockImplementation(() => {});
      fs.writeFileSync.mockImplementation(() => {});
    });

    it("debería guardar reporte exitosamente", async () => {
      const mockResult = { insertId: 123 };
      db.query.mockResolvedValue([mockResult]);

      req.body = {
        reportType: "appointments",
        reportData: {
          reportInfo: { totalRecords: 10 },
          appointments: [],
        },
        fileName: "test_report",
        generatedBy: "admin",
      };

      await reportController.saveReport(req, res);

      expect(fs.mkdirSync).toHaveBeenCalled();
      expect(fs.writeFileSync).toHaveBeenCalled();
      expect(db.query).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: "Reporte guardado exitosamente",
          reportId: 123,
        })
      );
    });

    it("debería crear directorio si no existe", async () => {
      fs.existsSync.mockReturnValue(false);
      const mockResult = { insertId: 456 };
      db.query.mockResolvedValue([mockResult]);

      req.body = {
        reportType: "physicians",
        reportData: { reportInfo: { totalRecords: 5 } },
        fileName: "physicians_report",
      };

      await reportController.saveReport(req, res);

      expect(fs.mkdirSync).toHaveBeenCalledWith(expect.any(String), {
        recursive: true,
      });
    });

    it("debería continuar si la BD falla pero el archivo se guarda", async () => {
      const dbError = new Error("BD no disponible");
      db.query.mockRejectedValue(dbError);

      req.body = {
        reportType: "patients",
        reportData: { reportInfo: { totalRecords: 8 } },
      };

      await reportController.saveReport(req, res);

      expect(fs.writeFileSync).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          reportId: expect.any(Number),
        })
      );
    });

    it("debería manejar errores de sistema de archivos", async () => {
      const fsError = new Error("Error de escritura");
      fs.writeFileSync.mockImplementation(() => {
        throw fsError;
      });

      req.body = {
        reportType: "appointments",
        reportData: { reportInfo: {} },
      };

      await reportController.saveReport(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Error de escritura" });
    });
  });

  describe("getReportHistory", () => {
    it("debería obtener historial desde la base de datos", async () => {
      const mockReports = [
        {
          id: 1,
          report_type: "appointments",
          file_name: "appointments_2025-01-15.json",
          generated_by: "admin",
          report_summary: '{"totalRecords": 10}',
          created_at: "2025-01-15T10:00:00Z",
        },
      ];

      db.query.mockResolvedValue([mockReports]);

      await reportController.getReportHistory(req, res);

      expect(db.query).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(mockReports);
    });

    it("debería usar archivos como respaldo si la BD falla", async () => {
      const dbError = new Error("Tabla no existe");
      db.query.mockRejectedValue(dbError);

      path.join.mockReturnValue("/mock/reports/dir");
      fs.existsSync.mockReturnValue(true);
      fs.readdirSync.mockReturnValue([
        "appointments_2025-01-15.json",
        "physicians_2025-01-16.json",
      ]);

      await reportController.getReportHistory(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            report_type: "appointments",
            file_name: "appointments_2025-01-15.json",
          }),
        ])
      );
    });

    it("debería devolver array vacío si no hay BD ni archivos", async () => {
      const dbError = new Error("BD no disponible");
      db.query.mockRejectedValue(dbError);
      fs.existsSync.mockReturnValue(false);

      await reportController.getReportHistory(req, res);

      expect(res.json).toHaveBeenCalledWith([]);
    });

    it("debería manejar errores generales", async () => {
      const error = new Error("Error crítico");
      path.join.mockImplementation(() => {
        throw error;
      });

      await reportController.getReportHistory(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Error crítico" });
    });
  });

  describe("getGeneralStatistics", () => {
    it("debería obtener estadísticas generales exitosamente", async () => {
      const mockAppointmentStats = [
        { status: "completed", count: 15 },
        { status: "pending", count: 8 },
        { status: "cancelled", count: 3 },
      ];

      const mockSpecialtyStats = [
        { specialty: "Cardiología", appointment_count: 12, unique_patients: 8 },
        { specialty: "Neurología", appointment_count: 9, unique_patients: 6 },
      ];

      const mockMonthlyStats = [
        { month: "2024-12", count: 20, completed: 18, cancelled: 2 },
        { month: "2025-01", count: 25, completed: 22, cancelled: 3 },
      ];

      db.query
        .mockResolvedValueOnce([mockAppointmentStats])
        .mockResolvedValueOnce([mockSpecialtyStats])
        .mockResolvedValueOnce([mockMonthlyStats]);

      await reportController.getGeneralStatistics(req, res);

      expect(db.query).toHaveBeenCalledTimes(3);
      expect(res.json).toHaveBeenCalledWith({
        appointmentStatusDistribution: mockAppointmentStats,
        specialtyDistribution: mockSpecialtyStats,
        monthlyTrends: mockMonthlyStats,
      });
    });

    it("debería manejar errores en estadísticas generales", async () => {
      const error = new Error("Error en estadísticas");
      db.query.mockRejectedValue(error);

      await reportController.getGeneralStatistics(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Error en estadísticas",
      });
    });
  });
});
