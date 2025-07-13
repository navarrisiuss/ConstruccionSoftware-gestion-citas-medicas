const request = require("supertest");
const express = require("express");
const bodyParser = require("body-parser");
const reportRoutes = require("../../src/routes/report.routes");
const reportController = require("../../src/controllers/report.controller");

// Mock del controlador de reportes
jest.mock("../../src/controllers/report.controller");

// Configurar app de Express para testing
const app = express();
app.use(bodyParser.json());
app.use("/api/reports", reportRoutes);

describe("Report Routes Integration Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /api/reports/appointments", () => {
    it("debería generar reporte de citas exitosamente", async () => {
      const mockReportData = {
        reportInfo: { type: "appointments", totalRecords: 10 },
        appointments: [],
        statistics: {},
      };

      reportController.generateAppointmentsReport.mockImplementation(
        (req, res) => {
          res.json(mockReportData);
        }
      );

      const requestData = {
        startDate: "2025-01-01",
        endDate: "2025-01-31",
        specialty: "Cardiología",
      };

      const response = await request(app)
        .post("/api/reports/appointments")
        .send(requestData)
        .expect(200);

      expect(response.body).toEqual(mockReportData);
      expect(reportController.generateAppointmentsReport).toHaveBeenCalled();
    });

    it("debería manejar errores en generación de reporte de citas", async () => {
      reportController.generateAppointmentsReport.mockImplementation(
        (req, res) => {
          res.status(500).json({ message: "Error interno del servidor" });
        }
      );

      const response = await request(app)
        .post("/api/reports/appointments")
        .send({ startDate: "2025-01-01", endDate: "2025-01-31" })
        .expect(500);

      expect(response.body.message).toBe("Error interno del servidor");
    });
  });

  describe("POST /api/reports/physicians", () => {
    it("debería generar reporte de médicos exitosamente", async () => {
      const mockReportData = {
        reportInfo: { type: "physicians", totalRecords: 5 },
        physicians: [],
        statistics: {},
      };

      reportController.generatePhysiciansReport.mockImplementation(
        (req, res) => {
          res.json(mockReportData);
        }
      );

      const requestData = { specialty: "Cardiología" };

      const response = await request(app)
        .post("/api/reports/physicians")
        .send(requestData)
        .expect(200);

      expect(response.body).toEqual(mockReportData);
      expect(reportController.generatePhysiciansReport).toHaveBeenCalled();
    });

    it("debería generar reporte sin filtros", async () => {
      const mockReportData = {
        reportInfo: { type: "physicians", totalRecords: 15 },
        physicians: [],
        statistics: {},
      };

      reportController.generatePhysiciansReport.mockImplementation(
        (req, res) => {
          res.json(mockReportData);
        }
      );

      const response = await request(app)
        .post("/api/reports/physicians")
        .send({})
        .expect(200);

      expect(response.body).toEqual(mockReportData);
    });
  });

  describe("POST /api/reports/patients", () => {
    it("debería generar reporte de pacientes exitosamente", async () => {
      const mockReportData = {
        reportInfo: { type: "patients", totalRecords: 8 },
        patients: [],
        statistics: {},
      };

      reportController.generatePatientsReport.mockImplementation((req, res) => {
        res.json(mockReportData);
      });

      const requestData = {
        startDate: "2025-01-01",
        endDate: "2025-01-31",
      };

      const response = await request(app)
        .post("/api/reports/patients")
        .send(requestData)
        .expect(200);

      expect(response.body).toEqual(mockReportData);
      expect(reportController.generatePatientsReport).toHaveBeenCalled();
    });

    it("debería manejar errores en reporte de pacientes", async () => {
      reportController.generatePatientsReport.mockImplementation((req, res) => {
        res.status(500).json({ message: "Error de base de datos" });
      });

      const response = await request(app)
        .post("/api/reports/patients")
        .send({ startDate: "2025-01-01", endDate: "2025-01-31" })
        .expect(500);

      expect(response.body.message).toBe("Error de base de datos");
    });
  });

  describe("POST /api/reports/save", () => {
    it("debería guardar reporte exitosamente", async () => {
      const mockSaveResponse = {
        success: true,
        message: "Reporte guardado exitosamente",
        fileName: "appointments_2025-01-15.json",
        reportId: 123,
      };

      reportController.saveReport.mockImplementation((req, res) => {
        res.json(mockSaveResponse);
      });

      const requestData = {
        reportType: "appointments",
        reportData: { reportInfo: { totalRecords: 10 } },
        fileName: "test_report",
      };

      const response = await request(app)
        .post("/api/reports/save")
        .send(requestData)
        .expect(200);

      expect(response.body).toEqual(mockSaveResponse);
      expect(reportController.saveReport).toHaveBeenCalled();
    });

    it("debería manejar errores al guardar reporte", async () => {
      reportController.saveReport.mockImplementation((req, res) => {
        res.status(500).json({ message: "Error de escritura de archivo" });
      });

      const response = await request(app)
        .post("/api/reports/save")
        .send({ reportType: "appointments", reportData: {} })
        .expect(500);

      expect(response.body.message).toBe("Error de escritura de archivo");
    });
  });

  describe("GET /api/reports/history", () => {
    it("debería obtener historial de reportes exitosamente", async () => {
      const mockHistory = [
        {
          id: 1,
          report_type: "appointments",
          file_name: "appointments_2025-01-15.json",
          generated_by: "admin",
          created_at: "2025-01-15T10:00:00Z",
        },
        {
          id: 2,
          report_type: "physicians",
          file_name: "physicians_2025-01-16.json",
          generated_by: "admin",
          created_at: "2025-01-16T10:00:00Z",
        },
      ];

      reportController.getReportHistory.mockImplementation((req, res) => {
        res.json(mockHistory);
      });

      const response = await request(app)
        .get("/api/reports/history")
        .expect(200);

      expect(response.body).toEqual(mockHistory);
      expect(reportController.getReportHistory).toHaveBeenCalled();
    });

    it("debería devolver array vacío si no hay historial", async () => {
      reportController.getReportHistory.mockImplementation((req, res) => {
        res.json([]);
      });

      const response = await request(app)
        .get("/api/reports/history")
        .expect(200);

      expect(response.body).toEqual([]);
    });

    it("debería manejar errores en historial", async () => {
      reportController.getReportHistory.mockImplementation((req, res) => {
        res.status(500).json({ message: "Error accediendo al historial" });
      });

      const response = await request(app)
        .get("/api/reports/history")
        .expect(500);

      expect(response.body.message).toBe("Error accediendo al historial");
    });
  });

  describe("GET /api/reports/statistics", () => {
    it("debería obtener estadísticas generales exitosamente", async () => {
      const mockStatistics = {
        appointmentStatusDistribution: [
          { status: "completed", count: 15 },
          { status: "pending", count: 8 },
          { status: "cancelled", count: 3 },
        ],
        specialtyDistribution: [
          {
            specialty: "Cardiología",
            appointment_count: 12,
            unique_patients: 8,
          },
          { specialty: "Neurología", appointment_count: 9, unique_patients: 6 },
        ],
        monthlyTrends: [
          { month: "2024-12", count: 20, completed: 18, cancelled: 2 },
          { month: "2025-01", count: 25, completed: 22, cancelled: 3 },
        ],
      };

      reportController.getGeneralStatistics.mockImplementation((req, res) => {
        res.json(mockStatistics);
      });

      const response = await request(app)
        .get("/api/reports/statistics")
        .expect(200);

      expect(response.body).toEqual(mockStatistics);
      expect(reportController.getGeneralStatistics).toHaveBeenCalled();
    });

    it("debería manejar errores en estadísticas", async () => {
      reportController.getGeneralStatistics.mockImplementation((req, res) => {
        res.status(500).json({ message: "Error calculando estadísticas" });
      });

      const response = await request(app)
        .get("/api/reports/statistics")
        .expect(500);

      expect(response.body.message).toBe("Error calculando estadísticas");
    });
  });

  describe("Rutas no válidas", () => {
    it("debería devolver 404 para rutas no existentes", async () => {
      const response = await request(app)
        .get("/api/reports/nonexistent")
        .expect(404);
    });

    it("debería manejar métodos HTTP no permitidos", async () => {
      const response = await request(app)
        .put("/api/reports/appointments")
        .send({})
        .expect(404);
    });
  });
});
