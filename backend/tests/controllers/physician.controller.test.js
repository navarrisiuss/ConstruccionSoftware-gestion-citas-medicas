const physicianController = require("../../src/controllers/physician.controller");
const Physician = require("../../src/models/physician.model");

// Mock del modelo Physician
jest.mock("../../src/models/physician.model");

describe("Physician Controller", () => {
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

  describe("getAllPhysicians", () => {
    it("debería devolver todos los médicos", async () => {
      const mockPhysicians = [
        { id: 1, name: "Dr. García", specialty: "Cardiología" },
        { id: 2, name: "Dra. López", specialty: "Neurología" },
      ];
      Physician.getAll.mockResolvedValue(mockPhysicians);

      await physicianController.getAllPhysicians(req, res);

      expect(Physician.getAll).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(mockPhysicians);
    });

    it("debería manejar errores correctamente", async () => {
      const errorMessage = "Error de base de datos";
      Physician.getAll.mockRejectedValue(new Error(errorMessage));

      await physicianController.getAllPhysicians(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: errorMessage });
    });
  });

  describe("getPhysicianByEmail", () => {
    it("debería buscar médico por email exitosamente", async () => {
      const mockPhysicians = [
        { id: 1, email: "doctor@email.com", name: "Dr. García" },
      ];
      req.query.email = "doctor@email.com";

      Physician.getByEmail.mockResolvedValue(mockPhysicians);

      await physicianController.getPhysicianByEmail(req, res);

      expect(Physician.getByEmail).toHaveBeenCalledWith("doctor@email.com");
      expect(res.json).toHaveBeenCalledWith(mockPhysicians);
    });

    it("debería manejar errores de búsqueda por email", async () => {
      req.query.email = "error@email.com";
      const errorMessage = "Error de conexión";

      Physician.getByEmail.mockRejectedValue(new Error(errorMessage));

      await physicianController.getPhysicianByEmail(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: errorMessage });
    });
  });

  describe("getPhysicianById", () => {
    it("debería devolver un médico por ID", async () => {
      const mockPhysician = {
        id: 1,
        name: "Dr. García",
        specialty: "Cardiología",
      };
      req.params.id = "1";

      Physician.getById.mockResolvedValue(mockPhysician);

      await physicianController.getPhysicianById(req, res);

      expect(Physician.getById).toHaveBeenCalledWith("1");
      expect(res.json).toHaveBeenCalledWith(mockPhysician);
    });

    it("debería devolver 404 si el médico no existe", async () => {
      req.params.id = "999";

      Physician.getById.mockResolvedValue(null);

      await physicianController.getPhysicianById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Médico no encontrado",
      });
    });

    it("debería manejar errores de búsqueda por ID", async () => {
      req.params.id = "1";
      const errorMessage = "Error de base de datos";

      Physician.getById.mockRejectedValue(new Error(errorMessage));

      await physicianController.getPhysicianById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: errorMessage });
    });
  });

  describe("createPhysician", () => {
    it("debería crear un nuevo médico exitosamente", async () => {
      const newPhysicianData = {
        name: "Dr. Nuevo",
        email: "nuevo@email.com",
        specialty: "Pediatría",
        license: "LIC123",
      };
      const newPhysicianId = 1;

      req.body = newPhysicianData;
      Physician.create.mockResolvedValue(newPhysicianId);

      await physicianController.createPhysician(req, res);

      expect(Physician.create).toHaveBeenCalledWith(newPhysicianData);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        id: newPhysicianId,
        ...newPhysicianData,
      });
    });

    it("debería manejar errores de creación", async () => {
      const physicianData = { name: "Dr. Error" };
      const errorMessage = "Email duplicado";

      req.body = physicianData;
      Physician.create.mockRejectedValue(new Error(errorMessage));

      await physicianController.createPhysician(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: errorMessage });
    });
  });

  describe("updatePhysician", () => {
    it("debería actualizar un médico existente", async () => {
      const updateData = {
        name: "Dr. García Actualizado",
        specialty: "Cardiología Avanzada",
      };
      req.params.id = "1";
      req.body = updateData;

      Physician.update.mockResolvedValue(1);

      await physicianController.updatePhysician(req, res);

      expect(Physician.update).toHaveBeenCalledWith("1", updateData);
      expect(res.json).toHaveBeenCalledWith({
        message: "Médico actualizado exitosamente",
        ...updateData,
      });
    });

    it("debería devolver 404 cuando el médico no existe", async () => {
      req.params.id = "999";
      req.body = { name: "Test" };

      Physician.update.mockResolvedValue(0);

      await physicianController.updatePhysician(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Médico no encontrado",
      });
    });

    it("debería manejar errores de actualización", async () => {
      req.params.id = "1";
      req.body = { name: "Test" };
      const errorMessage = "Error de actualización";

      Physician.update.mockRejectedValue(new Error(errorMessage));

      await physicianController.updatePhysician(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: errorMessage,
        stack: expect.any(String),
      });
    });
  });

  describe("deletePhysician", () => {
    it("debería eliminar un médico existente", async () => {
      req.params.id = "1";

      Physician.delete.mockResolvedValue(1);

      await physicianController.deletePhysician(req, res);

      expect(Physician.delete).toHaveBeenCalledWith("1");
      expect(res.json).toHaveBeenCalledWith({
        message: "Médico eliminado correctamente",
      });
    });

    it("debería devolver 404 si el médico no existe", async () => {
      req.params.id = "999";

      Physician.delete.mockResolvedValue(0);

      await physicianController.deletePhysician(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Médico no encontrado",
      });
    });

    it("debería manejar errores de eliminación", async () => {
      req.params.id = "1";
      const errorMessage = "Error de eliminación";

      Physician.delete.mockRejectedValue(new Error(errorMessage));

      await physicianController.deletePhysician(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: errorMessage });
    });
  });

  describe("getPhysiciansBySpecialty", () => {
    it("debería obtener médicos por especialidad", async () => {
      const mockPhysicians = [
        { id: 1, name: "Dr. García", specialty: "Cardiología" },
        { id: 2, name: "Dr. Ruiz", specialty: "Cardiología" },
      ];
      req.query.specialty = "Cardiología";

      Physician.getBySpecialty.mockResolvedValue(mockPhysicians);

      await physicianController.getPhysiciansBySpecialty(req, res);

      expect(Physician.getBySpecialty).toHaveBeenCalledWith("Cardiología");
      expect(res.json).toHaveBeenCalledWith(mockPhysicians);
    });

    it("debería devolver error 400 si no se proporciona especialidad", async () => {
      req.query.specialty = "";

      await physicianController.getPhysiciansBySpecialty(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Especialidad es requerida",
      });
    });

    it("debería devolver error 400 si specialty es undefined", async () => {
      // req.query.specialty es undefined por defecto

      await physicianController.getPhysiciansBySpecialty(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Especialidad es requerida",
      });
    });

    it("debería manejar errores de búsqueda por especialidad", async () => {
      req.query.specialty = "Cardiología";
      const errorMessage = "Error de base de datos";

      Physician.getBySpecialty.mockRejectedValue(new Error(errorMessage));

      await physicianController.getPhysiciansBySpecialty(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: errorMessage });
    });

    it("debería devolver array vacío si no encuentra médicos de la especialidad", async () => {
      req.query.specialty = "Especialidad Inexistente";

      Physician.getBySpecialty.mockResolvedValue([]);

      await physicianController.getPhysiciansBySpecialty(req, res);

      expect(res.json).toHaveBeenCalledWith([]);
    });
  });
});
