const request = require("supertest");
const express = require("express");
const bodyParser = require("body-parser");
const adminRoutes = require("../../src/routes/admin.routes");
const Admin = require("../../src/models/admin.model");

// Mock del modelo Admin
jest.mock("../../src/models/admin.model");

// Configurar app de Express para testing
const app = express();
app.use(bodyParser.json());
app.use("/api/admins", adminRoutes);

describe("Admin Routes Integration Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/admins", () => {
    it("debería devolver todos los administradores", async () => {
      const mockAdmins = [
        { id: 1, name: "Admin Principal", email: "admin@hospital.com" },
        { id: 2, name: "Admin Secundario", email: "admin2@hospital.com" },
      ];
      Admin.getAll.mockResolvedValue(mockAdmins);

      const response = await request(app).get("/api/admins").expect(200);

      expect(response.body).toEqual(mockAdmins);
      expect(Admin.getAll).toHaveBeenCalled();
    });

    it("debería manejar errores del servidor", async () => {
      Admin.getAll.mockRejectedValue(new Error("Error de conexión"));

      const response = await request(app).get("/api/admins").expect(500);

      expect(response.body).toEqual({ message: "Error de conexión" });
    });
  });

  describe("GET /api/admins/email", () => {
    it("debería buscar administrador por email", async () => {
      const mockAdmin = [
        { id: 1, email: "admin@hospital.com", name: "Admin Principal" },
      ];
      Admin.getByEmail.mockResolvedValue(mockAdmin);

      const response = await request(app)
        .get("/api/admins/email?email=admin@hospital.com")
        .expect(200);

      expect(response.body).toEqual(mockAdmin);
      expect(Admin.getByEmail).toHaveBeenCalledWith("admin@hospital.com");
    });

    it("debería devolver array vacío si no encuentra el email", async () => {
      Admin.getByEmail.mockResolvedValue([]);

      const response = await request(app)
        .get("/api/admins/email?email=noexiste@hospital.com")
        .expect(200);

      expect(response.body).toEqual([]);
    });
  });

  describe("POST /api/admins", () => {
    it("debería crear un nuevo administrador exitosamente", async () => {
      const newAdminData = {
        name: "Nuevo Admin",
        email: "nuevo@hospital.com",
        password: "password123",
      };
      Admin.create.mockResolvedValue(1);

      const response = await request(app)
        .post("/api/admins")
        .send(newAdminData)
        .expect(201);

      expect(response.body).toEqual({
        id: 1,
        ...newAdminData,
      });
      expect(Admin.create).toHaveBeenCalledWith(newAdminData);
    });

    it("debería manejar errores de creación", async () => {
      const adminData = { name: "Admin Error" };
      Admin.create.mockRejectedValue(new Error("Email requerido"));

      const response = await request(app)
        .post("/api/admins")
        .send(adminData)
        .expect(500);

      expect(response.body.message).toBe("Email requerido");
    });
  });

  describe("PUT /api/admins/:id", () => {
    it("debería actualizar un administrador existente", async () => {
      const updateData = {
        name: "Admin Actualizado",
        email: "actualizado@hospital.com",
      };
      Admin.update.mockResolvedValue(1);

      const response = await request(app)
        .put("/api/admins/1")
        .send(updateData)
        .expect(200);

      expect(response.body).toEqual({
        message: "Admin actualizado exitosamente",
      });
      expect(Admin.update).toHaveBeenCalledWith("1", updateData);
    });

    it("debería devolver 404 si el administrador no existe", async () => {
      Admin.update.mockResolvedValue(0);

      const response = await request(app)
        .put("/api/admins/999")
        .send({ name: "Test" })
        .expect(404);

      expect(response.body.message).toBe("Admin no encontrado");
    });
  });

  describe("DELETE /api/admins/:id", () => {
    it("debería eliminar un administrador existente", async () => {
      Admin.delete.mockResolvedValue(1);

      const response = await request(app).delete("/api/admins/1").expect(200);

      expect(response.body).toEqual({
        message: "Admin eliminado exitosamente",
      });
      expect(Admin.delete).toHaveBeenCalledWith("1");
    });

    it("debería devolver 404 si el administrador no existe", async () => {
      Admin.delete.mockResolvedValue(0);

      const response = await request(app).delete("/api/admins/999").expect(404);

      expect(response.body.message).toBe("Admin no encontrado");
    });
  });
});
