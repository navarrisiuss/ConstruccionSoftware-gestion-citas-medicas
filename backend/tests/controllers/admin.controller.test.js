const adminController = require("../../src/controllers/admin.controller");
const Admin = require("../../src/models/admin.model");

// Mock del modelo Admin
jest.mock("../../src/models/admin.model");

describe("Admin Controller", () => {
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

  describe("getAllAdmins", () => {
    it("debería devolver todos los administradores", async () => {
      const mockAdmins = [
        { id: 1, name: "Admin Principal", email: "admin@hospital.com" },
        { id: 2, name: "Admin Secundario", email: "admin2@hospital.com" },
      ];
      Admin.getAll.mockResolvedValue(mockAdmins);

      await adminController.getAllAdmins(req, res);

      expect(Admin.getAll).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(mockAdmins);
    });

    it("debería manejar errores correctamente", async () => {
      const errorMessage = "Error de base de datos";
      Admin.getAll.mockRejectedValue(new Error(errorMessage));

      await adminController.getAllAdmins(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: errorMessage });
    });
  });

  describe("getAdminByEmail", () => {
    it("debería buscar administrador por email exitosamente", async () => {
      const mockAdmin = [
        { id: 1, email: "admin@hospital.com", name: "Admin Principal" },
      ];
      req.query.email = "admin@hospital.com";

      Admin.getByEmail.mockResolvedValue(mockAdmin);

      await adminController.getAdminByEmail(req, res);

      expect(Admin.getByEmail).toHaveBeenCalledWith("admin@hospital.com");
      expect(res.json).toHaveBeenCalledWith(mockAdmin);
    });

    it("debería devolver array vacío si no encuentra el email", async () => {
      req.query.email = "noexiste@hospital.com";

      Admin.getByEmail.mockResolvedValue([]);

      await adminController.getAdminByEmail(req, res);

      expect(res.json).toHaveBeenCalledWith([]);
    });

    it("debería manejar errores de búsqueda por email", async () => {
      req.query.email = "error@hospital.com";
      const errorMessage = "Error de conexión";

      Admin.getByEmail.mockRejectedValue(new Error(errorMessage));

      await adminController.getAdminByEmail(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: errorMessage });
    });
  });

  describe("createAdmin", () => {
    it("debería crear un nuevo administrador exitosamente", async () => {
      const newAdminData = {
        name: "Nuevo Admin",
        email: "nuevo@hospital.com",
        password: "password123",
        role: "administrator",
      };
      const newAdminId = 1;

      req.body = newAdminData;
      Admin.create.mockResolvedValue(newAdminId);

      await adminController.createAdmin(req, res);

      expect(Admin.create).toHaveBeenCalledWith(newAdminData);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        id: newAdminId,
        ...newAdminData,
      });
    });

    it("debería manejar errores de creación", async () => {
      const adminData = { name: "Admin Error" };
      const errorMessage = "Email duplicado";

      req.body = adminData;
      Admin.create.mockRejectedValue(new Error(errorMessage));

      await adminController.createAdmin(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: errorMessage,
        stack: expect.any(String),
      });
    });

    it("debería logear los datos recibidos", async () => {
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();
      const adminData = { name: "Test Admin" };

      req.body = adminData;
      Admin.create.mockResolvedValue(1);

      await adminController.createAdmin(req, res);

      expect(consoleSpy).toHaveBeenCalledWith("Datos recibidos:", adminData);
      consoleSpy.mockRestore();
    });

    it("debería logear errores en la consola", async () => {
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
      const adminData = { name: "Error Admin" };
      const error = new Error("Test error");

      req.body = adminData;
      Admin.create.mockRejectedValue(error);

      await adminController.createAdmin(req, res);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "ERROR AL CREAR ADMIN:",
        error
      );
      consoleErrorSpy.mockRestore();
    });
  });

  describe("updateAdmin", () => {
    it("debería actualizar un administrador existente", async () => {
      const updateData = {
        name: "Admin Actualizado",
        email: "actualizado@hospital.com",
      };
      req.params.id = "1";
      req.body = updateData;

      Admin.update.mockResolvedValue(1);

      await adminController.updateAdmin(req, res);

      expect(Admin.update).toHaveBeenCalledWith("1", updateData);
      expect(res.json).toHaveBeenCalledWith({
        message: "Admin actualizado exitosamente",
      });
    });

    it("debería devolver 404 cuando el administrador no existe", async () => {
      req.params.id = "999";
      req.body = { name: "Test" };

      Admin.update.mockResolvedValue(0);

      await adminController.updateAdmin(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Admin no encontrado" });
    });

    it("debería manejar errores de actualización", async () => {
      req.params.id = "1";
      req.body = { name: "Test" };
      const errorMessage = "Error de actualización";

      Admin.update.mockRejectedValue(new Error(errorMessage));

      await adminController.updateAdmin(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: errorMessage });
    });
  });

  describe("deleteAdmin", () => {
    it("debería eliminar un administrador existente", async () => {
      req.params.id = "1";

      Admin.delete.mockResolvedValue(1);

      await adminController.deleteAdmin(req, res);

      expect(Admin.delete).toHaveBeenCalledWith("1");
      expect(res.json).toHaveBeenCalledWith({
        message: "Admin eliminado exitosamente",
      });
    });

    it("debería devolver 404 si el administrador no existe", async () => {
      req.params.id = "999";

      Admin.delete.mockResolvedValue(0);

      await adminController.deleteAdmin(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Admin no encontrado" });
    });

    it("debería manejar errores de eliminación", async () => {
      req.params.id = "1";
      const errorMessage = "Error de eliminación";

      Admin.delete.mockRejectedValue(new Error(errorMessage));

      await adminController.deleteAdmin(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: errorMessage });
    });
  });
});
