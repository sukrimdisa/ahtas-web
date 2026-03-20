import { Router } from "express";
import { prisma } from "../config/db.js";

const router = Router();

// Get all services
router.get("/", async (req, res) => {
  try {
    const services = await prisma.service.findMany({
      include: {
        therapists: {
          include: {
            therapist: {
              include: { user: true }
            }
          }
        }
      }
    });
    res.json(services);
  } catch (error) {
    console.error("Get services error:", error);
    res.status(500).json({ error: "Failed to fetch services" });
  }
});

// Get service by ID
router.get("/:id", async (req, res) => {
  try {
    const service = await prisma.service.findUnique({
      where: { id: req.params.id },
      include: {
        therapists: {
          include: {
            therapist: {
              include: { user: true }
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
    res.status(500).json({ error: "Failed to fetch service" });
  }
});

export default router;
