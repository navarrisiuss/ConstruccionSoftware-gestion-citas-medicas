const Physician = require("../../src/models/physician.model");
const db = require("../../src/config/db.config");

// Mock de la base de datos
jest.mock("../../src/config/db.config");

describe("Physician Model", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getBySpecialty", () => {
    it("debería obtener médicos por especialidad", async () => {
      const mockPhysicians = [
        { id: 1, name: "Dr. García", specialty: "Cardiología" },
        { id: 2, name: "Dr. Ruiz", specialty: "Cardiología" },
      ];
      db.query.mockResolvedValue([mockPhysicians]);

      const result = await Physician.getBySpecialty("Cardiología");

      expect(db.query).toHaveBeenCalledWith(
        "SELECT * FROM physicians WHERE specialty = ?",
        ["Cardiología"]
      );
      expect(result).toEqual(mockPhysicians);
    });

    it("debería devolver array vacío si no encuentra médicos de la especialidad", async () => {
      db.query.mockResolvedValue([[]]);

      const result = await Physician.getBySpecialty("Especialidad Inexistente");

      expect(result).toEqual([]);
    });

    it("debería propagar errores de base de datos", async () => {
      const dbError = new Error("Error de conexión");
      db.query.mockRejectedValue(dbError);

      await expect(Physician.getBySpecialty("Cardiología")).rejects.toThrow(
        "Error de conexión"
      );
    });
  });

  describe("getAll", () => {
    it("debería obtener todos los médicos", async () => {
      const mockPhysicians = [
        { id: 1, name: "Dr. García", specialty: "Cardiología" },
        { id: 2, name: "Dra. López", specialty: "Neurología" },
        { id: 3, name: "Dr. Martínez", specialty: "Pediatría" },
      ];
      db.query.mockResolvedValue([mockPhysicians]);

      const result = await Physician.getAll();

      expect(db.query).toHaveBeenCalledWith("SELECT * FROM physicians");
      expect(result).toEqual(mockPhysicians);
    });

    it("debería devolver array vacío si no hay médicos", async () => {
      db.query.mockResolvedValue([[]]);

      const result = await Physician.getAll();

      expect(result).toEqual([]);
    });

    it("debería manejar errores de base de datos", async () => {
      const dbError = new Error("Error de consulta");
      db.query.mockRejectedValue(dbError);

      await expect(Physician.getAll()).rejects.toThrow("Error de consulta");
    });
  });

  describe("getByEmail", () => {
    it("debería buscar médico por email", async () => {
      const mockPhysician = [
        { id: 1, email: "doctor@email.com", name: "Dr. García" },
      ];
      db.query.mockResolvedValue([mockPhysician]);

      const result = await Physician.getByEmail("doctor@email.com");

      expect(db.query).toHaveBeenCalledWith(
        "SELECT * FROM physicians WHERE email = ?",
        ["doctor@email.com"]
      );
      expect(result).toEqual(mockPhysician);
    });

    it("debería devolver array vacío si no encuentra el email", async () => {
      db.query.mockResolvedValue([[]]);

      const result = await Physician.getByEmail("noexiste@email.com");

      expect(result).toEqual([]);
    });

    it("debería manejar errores de búsqueda por email", async () => {
      const dbError = new Error("Error de búsqueda");
      db.query.mockRejectedValue(dbError);

      await expect(Physician.getByEmail("test@email.com")).rejects.toThrow(
        "Error de búsqueda"
      );
    });
  });

  describe("getById", () => {
    it("debería obtener un médico por ID", async () => {
      const mockPhysician = {
        id: 1,
        name: "Dr. García",
        specialty: "Cardiología",
      };
      db.execute.mockResolvedValue([[mockPhysician]]);

      const result = await Physician.getById(1);

      expect(db.execute).toHaveBeenCalledWith(
        "SELECT * FROM physicians WHERE id = ?",
        [1]
      );
      expect(result).toEqual(mockPhysician);
    });

    it("debería devolver undefined si el médico no existe", async () => {
      db.execute.mockResolvedValue([[]]);

      const result = await Physician.getById(999);

      expect(result).toBeUndefined();
    });

    it("debería manejar errores de búsqueda por ID", async () => {
      const dbError = new Error("Error de consulta por ID");
      db.execute.mockRejectedValue(dbError);

      await expect(Physician.getById(1)).rejects.toThrow(
        "Error de consulta por ID"
      );
    });
  });

  describe("create", () => {
    it("debería crear un nuevo médico exitosamente", async () => {
      const physicianData = {
        name: "Dr. Nuevo",
        paternalLastName: "Apellido",
        maternalLastName: "Materno",
        email: "nuevo@email.com",
        password: "password123",
        specialty: "Pediatría",
      };
      const mockResult = { insertId: 1 };
      db.query.mockResolvedValue([mockResult]);

      const result = await Physician.create(physicianData);

      expect(db.query).toHaveBeenCalledWith(
        "INSERT INTO physicians (name, paternalLastName, maternalLastName, email, password, specialty) VALUES (?, ?, ?, ?, ?, ?)",
        [
          "Dr. Nuevo",
          "Apellido",
          "Materno",
          "nuevo@email.com",
          "password123",
          "Pediatría",
        ]
      );
      expect(result).toBe(1);
    });

    it("debería propagar errores de creación", async () => {
      const physicianData = { name: "Dr. Error" };
      const dbError = new Error("Email duplicado");
      db.query.mockRejectedValue(dbError);

      await expect(Physician.create(physicianData)).rejects.toThrow(
        "Email duplicado"
      );
    });
  });

  describe("update", () => {
    it("debería actualizar un médico sin cambiar contraseña", async () => {
      const updateData = {
        name: "Dr. García Actualizado",
        paternalLastName: "Apellido",
        maternalLastName: "Materno",
        email: "actualizado@email.com",
        specialty: "Cardiología Avanzada",
      };
      const mockResult = { affectedRows: 1 };
      db.query.mockResolvedValue([mockResult]);

      const result = await Physician.update(1, updateData);

      expect(db.query).toHaveBeenCalledWith(
        "UPDATE physicians SET name = ?, paternalLastName = ?, maternalLastName = ?, email = ?, specialty = ? WHERE id = ?",
        [
          "Dr. García Actualizado",
          "Apellido",
          "Materno",
          "actualizado@email.com",
          "Cardiología Avanzada",
          1,
        ]
      );
      expect(result).toBe(1);
    });

    it("debería actualizar un médico incluyendo contraseña", async () => {
      const updateData = {
        name: "Dr. García",
        paternalLastName: "Apellido",
        maternalLastName: "Materno",
        email: "garcia@email.com",
        specialty: "Cardiología",
        password: "nuevaPassword123",
      };
      const mockResult = { affectedRows: 1 };
      db.query.mockResolvedValue([mockResult]);

      const result = await Physician.update(1, updateData);

      expect(db.query).toHaveBeenCalledWith(
        "UPDATE physicians SET name = ?, paternalLastName = ?, maternalLastName = ?, email = ?, specialty = ?, password = ? WHERE id = ?",
        [
          "Dr. García",
          "Apellido",
          "Materno",
          "garcia@email.com",
          "Cardiología",
          "nuevaPassword123",
          1,
        ]
      );
      expect(result).toBe(1);
    });

    it("debería devolver 0 si el médico no existe", async () => {
      const updateData = { name: "Dr. Test" };
      const mockResult = { affectedRows: 0 };
      db.query.mockResolvedValue([mockResult]);

      const result = await Physician.update(999, updateData);

      expect(result).toBe(0);
    });

    it("debería propagar errores de actualización", async () => {
      const updateData = { name: "Dr. Error" };
      const dbError = new Error("Error de actualización");
      db.query.mockRejectedValue(dbError);

      await expect(Physician.update(1, updateData)).rejects.toThrow(
        "Error de actualización"
      );
    });
  });

  describe("delete", () => {
    it("debería eliminar un médico existente", async () => {
      const mockResult = { affectedRows: 1 };
      db.query.mockResolvedValue([mockResult]);

      const result = await Physician.delete(1);

      expect(db.query).toHaveBeenCalledWith(
        "DELETE FROM physicians WHERE id = ?",
        [1]
      );
      expect(result).toBe(1);
    });

    it("debería devolver 0 si el médico no existe", async () => {
      const mockResult = { affectedRows: 0 };
      db.query.mockResolvedValue([mockResult]);

      const result = await Physician.delete(999);

      expect(result).toBe(0);
    });

    it("debería propagar errores de eliminación", async () => {
      const dbError = new Error("Error de eliminación");
      db.query.mockRejectedValue(dbError);

      await expect(Physician.delete(1)).rejects.toThrow("Error de eliminación");
    });
  });
});
