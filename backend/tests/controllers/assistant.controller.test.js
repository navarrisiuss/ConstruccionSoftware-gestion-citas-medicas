const assistantController = require("../../src/controllers/assistant.controller");
const Assistant = require("../../src/models/assistant.model");

// Mock del modelo Assistant
jest.mock("../../src/models/assistant.model");

describe("Assistant Controller", () => {
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
  });

  describe("getAllAssistants", () => {
    it("debería devolver todos los asistentes", async () => {
      const mockAssistants = [
        { id: 1, name: "Ana López", email: "ana@hospital.com" },
        { id: 2, name: "Carlos Ruiz", email: "carlos@hospital.com" },
      ];
      Assistant.getAll.mockResolvedValue(mockAssistants);

      await assistantController.getAllAssistants(req, res);

      expect(Assistant.getAll).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(mockAssistants);
    });

    it("debería manejar errores correctamente", async () => {
      const errorMessage = "Error de base de datos";
      Assistant.getAll.mockRejectedValue(new Error(errorMessage));

      await assistantController.getAllAssistants(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: errorMessage });
    });
  });

  describe("getAssistantByEmail", () => {
    it("debería buscar asistente por email exitosamente", async () => {
      const mockAssistant = [
        { id: 1, email: "ana@hospital.com", name: "Ana López" },
      ];
      req.query.email = "ana@hospital.com";

      Assistant.getByEmail.mockResolvedValue(mockAssistant);

      await assistantController.getAssistantByEmail(req, res);

      expect(Assistant.getByEmail).toHaveBeenCalledWith("ana@hospital.com");
      expect(res.json).toHaveBeenCalledWith(mockAssistant);
    });

    it("debería devolver array vacío si no encuentra el email", async () => {
      req.query.email = "noexiste@hospital.com";

      Assistant.getByEmail.mockResolvedValue([]);

      await assistantController.getAssistantByEmail(req, res);

      expect(res.json).toHaveBeenCalledWith([]);
    });

    it("debería manejar errores de búsqueda por email", async () => {
      req.query.email = "error@hospital.com";
      const errorMessage = "Error de conexión";

      Assistant.getByEmail.mockRejectedValue(new Error(errorMessage));

      await assistantController.getAssistantByEmail(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: errorMessage });
    });
  });

  describe("createAssistant", () => {
    it("debería crear un nuevo asistente exitosamente", async () => {
      const newAssistantData = {
        name: "Nuevo Asistente",
        email: "nuevo@hospital.com",
        password: "password123",
        department: "Recepción",
      };
      const newAssistantId = 1;

      req.body = newAssistantData;
      Assistant.create.mockResolvedValue(newAssistantId);

      await assistantController.createAssistant(req, res);

      expect(Assistant.create).toHaveBeenCalledWith(newAssistantData);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        id: newAssistantId,
        ...newAssistantData,
      });
    });

    it("debería manejar errores de creación", async () => {
      const assistantData = { name: "Asistente Error" };
      const errorMessage = "Email duplicado";

      req.body = assistantData;
      Assistant.create.mockRejectedValue(new Error(errorMessage));

      await assistantController.createAssistant(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: errorMessage,
        stack: expect.any(String),
      });
    });

    it("debería logear los datos recibidos", async () => {
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();
      const assistantData = { name: "Test Asistente" };

      req.body = assistantData;
      Assistant.create.mockResolvedValue(1);

      await assistantController.createAssistant(req, res);

      expect(consoleSpy).toHaveBeenCalledWith(
        "Datos recibidos:",
        assistantData
      );
      consoleSpy.mockRestore();
    });

    it("debería logear errores en la consola", async () => {
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
      const assistantData = { name: "Error Asistente" };
      const error = new Error("Test error");

      req.body = assistantData;
      Assistant.create.mockRejectedValue(error);

      await assistantController.createAssistant(req, res);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "ERROR AL CREAR ASISTENTE:",
        error
      );
      consoleErrorSpy.mockRestore();
    });
  });

  describe("updateAssistant", () => {
    it("debería actualizar un asistente existente", async () => {
      const updateData = {
        name: "Asistente Actualizado",
        email: "actualizado@hospital.com",
      };
      req.params.id = "1";
      req.body = updateData;

      Assistant.update.mockResolvedValue(1);

      await assistantController.updateAssistant(req, res);

      expect(Assistant.update).toHaveBeenCalledWith("1", updateData);
      expect(res.json).toHaveBeenCalledWith({
        message: "Asistente actualizado exitosamente",
      });
    });

    it("debería devolver 404 cuando el asistente no existe", async () => {
      req.params.id = "999";
      req.body = { name: "Test" };

      Assistant.update.mockResolvedValue(0);

      await assistantController.updateAssistant(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Asistente no encontrado",
      });
    });

    it("debería manejar errores de actualización", async () => {
      req.params.id = "1";
      req.body = { name: "Test" };
      const errorMessage = "Error de actualización";

      Assistant.update.mockRejectedValue(new Error(errorMessage));

      await assistantController.updateAssistant(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: errorMessage });
    });
  });

  describe("deleteAssistant", () => {
    it("debería eliminar un asistente existente", async () => {
      req.params.id = "1";

      Assistant.delete.mockResolvedValue(1);

      await assistantController.deleteAssistant(req, res);

      expect(Assistant.delete).toHaveBeenCalledWith("1");
      expect(res.json).toHaveBeenCalledWith({
        message: "Asistente eliminado exitosamente",
      });
    });

    it("debería devolver 404 si el asistente no existe", async () => {
      req.params.id = "999";

      Assistant.delete.mockResolvedValue(0);

      await assistantController.deleteAssistant(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Asistente no encontrado",
      });
    });

    it("debería manejar errores de eliminación", async () => {
      req.params.id = "1";
      const errorMessage = "Error de eliminación";

      Assistant.delete.mockRejectedValue(new Error(errorMessage));

      await assistantController.deleteAssistant(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: errorMessage });
    });
  });
});
