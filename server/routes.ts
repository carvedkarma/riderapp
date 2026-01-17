import type { Express } from "express";
import { createServer, type Server } from "node:http";
import { storage } from "./storage";
import { insertRideSchema, insertSavedLocationSchema, insertPaymentMethodSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // User routes
  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to get user" });
    }
  });

  // Saved locations routes
  app.get("/api/users/:userId/saved-locations", async (req, res) => {
    try {
      const locations = await storage.getSavedLocations(req.params.userId);
      res.json(locations);
    } catch (error) {
      res.status(500).json({ error: "Failed to get saved locations" });
    }
  });

  app.post("/api/saved-locations", async (req, res) => {
    try {
      const parsed = insertSavedLocationSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid location data" });
      }
      const location = await storage.createSavedLocation(parsed.data);
      res.status(201).json(location);
    } catch (error) {
      res.status(500).json({ error: "Failed to create saved location" });
    }
  });

  app.delete("/api/saved-locations/:id", async (req, res) => {
    try {
      await storage.deleteSavedLocation(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete saved location" });
    }
  });

  // Drivers routes
  app.get("/api/drivers", async (req, res) => {
    try {
      const drivers = await storage.getDrivers();
      res.json(drivers);
    } catch (error) {
      res.status(500).json({ error: "Failed to get drivers" });
    }
  });

  app.get("/api/drivers/:id", async (req, res) => {
    try {
      const driver = await storage.getDriver(req.params.id);
      if (!driver) {
        return res.status(404).json({ error: "Driver not found" });
      }
      res.json(driver);
    } catch (error) {
      res.status(500).json({ error: "Failed to get driver" });
    }
  });

  // Rides routes
  app.get("/api/users/:userId/rides", async (req, res) => {
    try {
      const rides = await storage.getRides(req.params.userId);
      res.json(rides);
    } catch (error) {
      res.status(500).json({ error: "Failed to get rides" });
    }
  });

  app.get("/api/rides/:id", async (req, res) => {
    try {
      const ride = await storage.getRide(req.params.id);
      if (!ride) {
        return res.status(404).json({ error: "Ride not found" });
      }
      res.json(ride);
    } catch (error) {
      res.status(500).json({ error: "Failed to get ride" });
    }
  });

  app.post("/api/rides", async (req, res) => {
    try {
      const parsed = insertRideSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid ride data" });
      }
      const ride = await storage.createRide(parsed.data);
      res.status(201).json(ride);
    } catch (error) {
      res.status(500).json({ error: "Failed to create ride" });
    }
  });

  app.patch("/api/rides/:id", async (req, res) => {
    try {
      const ride = await storage.updateRide(req.params.id, req.body);
      if (!ride) {
        return res.status(404).json({ error: "Ride not found" });
      }
      res.json(ride);
    } catch (error) {
      res.status(500).json({ error: "Failed to update ride" });
    }
  });

  // Payment methods routes
  app.get("/api/users/:userId/payment-methods", async (req, res) => {
    try {
      const methods = await storage.getPaymentMethods(req.params.userId);
      res.json(methods);
    } catch (error) {
      res.status(500).json({ error: "Failed to get payment methods" });
    }
  });

  app.post("/api/payment-methods", async (req, res) => {
    try {
      const parsed = insertPaymentMethodSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid payment method data" });
      }
      const method = await storage.createPaymentMethod(parsed.data);
      res.status(201).json(method);
    } catch (error) {
      res.status(500).json({ error: "Failed to create payment method" });
    }
  });

  app.delete("/api/payment-methods/:id", async (req, res) => {
    try {
      await storage.deletePaymentMethod(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete payment method" });
    }
  });

  // Fare estimation endpoint
  app.post("/api/estimate-fare", async (req, res) => {
    try {
      const { pickupLatitude, pickupLongitude, destinationLatitude, destinationLongitude, vehicleTier } = req.body;
      
      const distance = Math.sqrt(
        Math.pow((destinationLatitude - pickupLatitude) * 69, 2) +
        Math.pow((destinationLongitude - pickupLongitude) * 54.6, 2)
      );
      
      const baseFares: Record<string, number> = {
        economy: 2.50,
        comfort: 4.00,
        premium: 6.00,
        luxury: 10.00,
      };
      
      const perMileRates: Record<string, number> = {
        economy: 1.50,
        comfort: 2.00,
        premium: 3.00,
        luxury: 5.00,
      };
      
      const tier = vehicleTier || "economy";
      const baseFare = baseFares[tier] || baseFares.economy;
      const perMileRate = perMileRates[tier] || perMileRates.economy;
      
      const estimatedFare = baseFare + (distance * perMileRate);
      const estimatedDuration = Math.round(distance * 3);
      
      res.json({
        estimatedFare: Math.round(estimatedFare * 100) / 100,
        estimatedDistance: Math.round(distance * 100) / 100,
        estimatedDuration,
        currency: "USD",
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to estimate fare" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
