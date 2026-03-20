import express from "express";
import { PrismaClient } from "@prisma/client";
import { authenticateToken, requireRole } from "../middleware/auth.js";

const router = express.Router();
const prisma = new PrismaClient();

/**
 * GET /services - Get all services
 */
router.get("/", async (req, res) => {
  try {
    const { active } = req.query;

    const where = {};
    if (active !== undefined) {
      where.active = active === "true";
    }

    const services = await prisma.service.findMany({
      where,
      orderBy: {
        name: 'asc'
      }
    });

    res.json(services);
  } catch (error) {
    console.error("Get services error:", error);
    res.status(500).json({ error: "Failed to get services" });
  }
});

/**
 * GET /services/:id - Get service by ID
 */
router.get("/:id", async (req, res) => {
  try {
    const service = await prisma.service.findUnique({
      where: { id: req.params.id },
      include: {
        therapists: {
          include: {
            therapist: {
              include: {
                user: {
                  select: {
                    name: true,
                    email: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!service) {
      return res.status(404).json({ error: "Service not found" });
    }

    res.json(service);
  } catch (error) {
    console.error("Get service error:", error);
    res.status(500).json({ error: "Failed to get service" });
  }
});

/**
 * POST /services - Create new service (Admin only)
 */
router.post("/", authenticateToken, requireRole("ADMIN"), async (req, res) => {
  try {
    const { name, price, duration, description, active = true } = req.body;

    if (!name || !price || !duration) {
      return res.status(400).json({ 
        error: "Name, price, and duration are required" 
      });
    }

    const service = await prisma.service.create({
      data: {
        name,
        price: parseFloat(price),
        duration: parseInt(duration),
        description,
        active
      }
    });

    res.json(service);
  } catch (error) {
    console.error("Create service error:", error);
    res.status(500).json({ error: "Failed to create service" });
  }
});

/**
 * PATCH /services/:id - Update service (Admin only)
 */
router.patch("/:id", authenticateToken, requireRole("ADMIN"), async (req, res) => {
  try {
    const { name, price, duration, description, active } = req.body;

    const data = {};
    if (name) data.name = name;
    if (price) data.price = parseFloat(price);
    if (duration) data.duration = parseInt(duration);
    if (description !== undefined) data.description = description;
    if (active !== undefined) data.active = active;

    const service = await prisma.service.update({
      where: { id: req.params.id },
      data
    });

    res.json(service);
  } catch (error) {
    console.error("Update service error:", error);
    res.status(500).json({ error: "Failed to update service" });
  }
});

/**
 * DELETE /services/:id - Delete service (Admin only)
 */
router.delete("/:id", authenticateToken, requireRole("ADMIN"), async (req, res) => {
  try {
    await prisma.service.update({
      where: { id: req.params.id },
      data: { active: false }
    });

    res.json({ message: "Service deactivated successfully" });
  } catch (error) {
    console.error("Delete service error:", error);
    res.status(500).json({ error: "Failed to delete service" });
  }
});

export default router;
