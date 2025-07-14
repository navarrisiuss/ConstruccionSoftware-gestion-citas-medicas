const authController = require("../../src/controllers/auth.controller");
const Patient = require("../../src/models/patient.model");
const Physician = require("../../src/models/physician.model");
const Assistant = require("../../src/models/assistant.model");
const Admin = require("../../src/models/admin.model");

// Mock de todos los modelos
jest.mock("../../src/models/patient.model");
jest.mock("../../src/models/physician.model");
jest.mock("../../src/models/assistant.model");
jest.mock("../../src/models/admin.model");

describe("Auth Controller", () => {
  let req, res;

  beforeEach(() => {
    req = {
      query: {},
      body: {},
    };
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  describe("login", () => {
    it("debería encontrar un paciente y devolver con role patient", async () => {
      const mockPatient = [
        { id: 1, email: "paciente@email.com", name: "Juan Pérez" },
      ];
      req.query.email = "paciente@email.com";

      Patient.getByEmail.mockResolvedValue(mockPatient);
      Physician.getByEmail.mockResolvedValue([]);
      Assistant.getByEmail.mockResolvedValue([]);
      Admin.getByEmail.mockResolvedValue([]);

      await authController.login(req, res);

      expect(Patient.getByEmail).toHaveBeenCalledWith("paciente@email.com");
      expect(res.json).toHaveBeenCalledWith([
        {
          id: 1,
          email: "paciente@email.com",
          name: "Juan Pérez",
          role: "patient",
        },
      ]);
    });

    it("debería encontrar un médico y devolver con role physician", async () => {
      const mockPhysician = [
        { id: 1, email: "medico@email.com", name: "Dr. García" },
      ];
      req.query.email = "medico@email.com";

      Patient.getByEmail.mockResolvedValue([]);
      Physician.getByEmail.mockResolvedValue(mockPhysician);
      Assistant.getByEmail.mockResolvedValue([]);
      Admin.getByEmail.mockResolvedValue([]);

      await authController.login(req, res);

      expect(Physician.getByEmail).toHaveBeenCalledWith("medico@email.com");
      expect(res.json).toHaveBeenCalledWith([
        {
          id: 1,
          email: "medico@email.com",
          name: "Dr. García",
          role: "physician",
        },
      ]);
    });

    it("debería encontrar un asistente y devolver con role assistant", async () => {
      const mockAssistant = [
        { id: 1, email: "asistente@email.com", name: "Ana López" },
      ];
      req.query.email = "asistente@email.com";

      Patient.getByEmail.mockResolvedValue([]);
      Physician.getByEmail.mockResolvedValue([]);
      Assistant.getByEmail.mockResolvedValue(mockAssistant);
      Admin.getByEmail.mockResolvedValue([]);

      await authController.login(req, res);

      expect(Assistant.getByEmail).toHaveBeenCalledWith("asistente@email.com");
      expect(res.json).toHaveBeenCalledWith([
        {
          id: 1,
          email: "asistente@email.com",
          name: "Ana López",
          role: "assistant",
        },
      ]);
    });

    it("debería encontrar un administrador y devolver con role admin", async () => {
      const mockAdmin = [
        { id: 1, email: "admin@email.com", name: "Admin Sistema" },
      ];
      req.query.email = "admin@email.com";

      Patient.getByEmail.mockResolvedValue([]);
      Physician.getByEmail.mockResolvedValue([]);
      Assistant.getByEmail.mockResolvedValue([]);
      Admin.getByEmail.mockResolvedValue(mockAdmin);

      await authController.login(req, res);

      expect(Admin.getByEmail).toHaveBeenCalledWith("admin@email.com");
      expect(res.json).toHaveBeenCalledWith([
        {
          id: 1,
          email: "admin@email.com",
          name: "Admin Sistema",
          role: "admin",
        },
      ]);
    });

    it("debería devolver array vacío si no encuentra el usuario en ningún rol", async () => {
      req.query.email = "noexiste@email.com";

      Patient.getByEmail.mockResolvedValue([]);
      Physician.getByEmail.mockResolvedValue([]);
      Assistant.getByEmail.mockResolvedValue([]);
      Admin.getByEmail.mockResolvedValue([]);

      await authController.login(req, res);

      expect(res.json).toHaveBeenCalledWith([]);
    });

    it("debería priorizar pacientes sobre otros roles", async () => {
      const mockPatient = [
        { id: 1, email: "multiple@email.com", name: "Usuario" },
      ];
      const mockPhysician = [
        { id: 2, email: "multiple@email.com", name: "Dr. Usuario" },
      ];
      req.query.email = "multiple@email.com";

      Patient.getByEmail.mockResolvedValue(mockPatient);
      Physician.getByEmail.mockResolvedValue(mockPhysician);
      Assistant.getByEmail.mockResolvedValue([]);
      Admin.getByEmail.mockResolvedValue([]);

      await authController.login(req, res);

      expect(res.json).toHaveBeenCalledWith([
        {
          id: 1,
          email: "multiple@email.com",
          name: "Usuario",
          role: "patient",
        },
      ]);
      // No debería buscar en otros modelos después de encontrar en patient
      expect(Physician.getByEmail).not.toHaveBeenCalled();
    });

    it("debería manejar múltiples usuarios con el mismo email", async () => {
      const mockPatients = [
        { id: 1, email: "duplicado@email.com", name: "Usuario 1" },
        { id: 2, email: "duplicado@email.com", name: "Usuario 2" },
      ];
      req.query.email = "duplicado@email.com";

      Patient.getByEmail.mockResolvedValue(mockPatients);
      Physician.getByEmail.mockResolvedValue([]);
      Assistant.getByEmail.mockResolvedValue([]);
      Admin.getByEmail.mockResolvedValue([]);

      await authController.login(req, res);

      expect(res.json).toHaveBeenCalledWith([
        {
          id: 1,
          email: "duplicado@email.com",
          name: "Usuario 1",
          role: "patient",
        },
        {
          id: 2,
          email: "duplicado@email.com",
          name: "Usuario 2",
          role: "patient",
        },
      ]);
    });

    it("debería manejar errores de base de datos correctamente", async () => {
      req.query.email = "error@email.com";
      const errorMessage = "Error de conexión a la base de datos";

      Patient.getByEmail.mockRejectedValue(new Error(errorMessage));

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: errorMessage });
    });

    it("debería buscar en médicos si no encuentra pacientes", async () => {
      const mockPhysician = [
        { id: 1, email: "medico@email.com", name: "Dr. García" },
      ];
      req.query.email = "medico@email.com";

      Patient.getByEmail.mockResolvedValue([]);
      Physician.getByEmail.mockResolvedValue(mockPhysician);
      Assistant.getByEmail.mockResolvedValue([]);
      Admin.getByEmail.mockResolvedValue([]);

      await authController.login(req, res);

      expect(Patient.getByEmail).toHaveBeenCalledWith("medico@email.com");
      expect(Physician.getByEmail).toHaveBeenCalledWith("medico@email.com");
      expect(res.json).toHaveBeenCalledWith([
        {
          id: 1,
          email: "medico@email.com",
          name: "Dr. García",
          role: "physician",
        },
      ]);
    });

    it("debería buscar en asistentes si no encuentra pacientes ni médicos", async () => {
      const mockAssistant = [
        { id: 1, email: "asistente@email.com", name: "Ana López" },
      ];
      req.query.email = "asistente@email.com";

      Patient.getByEmail.mockResolvedValue([]);
      Physician.getByEmail.mockResolvedValue([]);
      Assistant.getByEmail.mockResolvedValue(mockAssistant);
      Admin.getByEmail.mockResolvedValue([]);

      await authController.login(req, res);

      expect(Patient.getByEmail).toHaveBeenCalledWith("asistente@email.com");
      expect(Physician.getByEmail).toHaveBeenCalledWith("asistente@email.com");
      expect(Assistant.getByEmail).toHaveBeenCalledWith("asistente@email.com");
      expect(res.json).toHaveBeenCalledWith([
        {
          id: 1,
          email: "asistente@email.com",
          name: "Ana López",
          role: "assistant",
        },
      ]);
    });

    it("debería buscar en administradores como último recurso", async () => {
      const mockAdmin = [
        { id: 1, email: "admin@email.com", name: "Admin Sistema" },
      ];
      req.query.email = "admin@email.com";

      Patient.getByEmail.mockResolvedValue([]);
      Physician.getByEmail.mockResolvedValue([]);
      Assistant.getByEmail.mockResolvedValue([]);
      Admin.getByEmail.mockResolvedValue(mockAdmin);

      await authController.login(req, res);

      expect(Patient.getByEmail).toHaveBeenCalledWith("admin@email.com");
      expect(Physician.getByEmail).toHaveBeenCalledWith("admin@email.com");
      expect(Assistant.getByEmail).toHaveBeenCalledWith("admin@email.com");
      expect(Admin.getByEmail).toHaveBeenCalledWith("admin@email.com");
      expect(res.json).toHaveBeenCalledWith([
        {
          id: 1,
          email: "admin@email.com",
          name: "Admin Sistema",
          role: "admin",
        },
      ]);
    });
  });
});
