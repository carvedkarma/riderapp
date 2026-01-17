import type { Express } from "express";
import { createServer, type Server } from "node:http";
import { storage } from "./storage";
import { 
  insertRideSchema, 
  insertSavedLocationSchema, 
  insertPaymentMethodSchema,
  insertDriverProfileSchema,
  loginSchema,
  signupSchema,
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const parsed = signupSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid signup data", details: parsed.error.errors });
      }
      
      const existingUser = await storage.getUserByEmail(parsed.data.email);
      if (existingUser) {
        return res.status(409).json({ error: "Email already registered" });
      }
      
      const user = await storage.createUser({
        email: parsed.data.email,
        password: parsed.data.password,
        fullName: parsed.data.fullName,
        phone: parsed.data.phone,
        avatarUrl: parsed.data.avatarUrl,
        role: parsed.data.role || "rider",
      });
      
      const { password: _, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      console.error("Signup error:", error);
      res.status(500).json({ error: "Failed to create account" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const parsed = loginSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid login data" });
      }
      
      const user = await storage.getUserByEmail(parsed.data.email);
      if (!user || user.password !== parsed.data.password) {
        return res.status(401).json({ error: "Invalid email or password" });
      }
      
      const { password: _, ...userWithoutPassword } = user;
      
      const driverProfile = await storage.getDriverProfile(user.id);
      
      res.json({ user: userWithoutPassword, driverProfile });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Failed to login" });
    }
  });

  // User routes
  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ error: "Failed to get user" });
    }
  });

  app.patch("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.updateUser(req.params.id, req.body);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ error: "Failed to update user" });
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

  // Driver profile routes
  app.get("/api/drivers/:userId/profile", async (req, res) => {
    try {
      const profile = await storage.getDriverProfile(req.params.userId);
      if (!profile) {
        return res.status(404).json({ error: "Driver profile not found" });
      }
      res.json(profile);
    } catch (error) {
      res.status(500).json({ error: "Failed to get driver profile" });
    }
  });

  app.post("/api/drivers/profile", async (req, res) => {
    try {
      const parsed = insertDriverProfileSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid driver profile data", details: parsed.error.errors });
      }
      
      const existingProfile = await storage.getDriverProfile(parsed.data.userId);
      if (existingProfile) {
        return res.status(409).json({ error: "Driver profile already exists" });
      }
      
      const profile = await storage.createDriverProfile(parsed.data);
      
      await storage.updateUser(parsed.data.userId, { role: "driver" });
      
      res.status(201).json(profile);
    } catch (error) {
      console.error("Create driver profile error:", error);
      res.status(500).json({ error: "Failed to create driver profile" });
    }
  });

  app.patch("/api/drivers/:userId/profile", async (req, res) => {
    try {
      const profile = await storage.updateDriverProfile(req.params.userId, req.body);
      if (!profile) {
        return res.status(404).json({ error: "Driver profile not found" });
      }
      res.json(profile);
    } catch (error) {
      res.status(500).json({ error: "Failed to update driver profile" });
    }
  });

  app.post("/api/drivers/:userId/go-online", async (req, res) => {
    try {
      const { latitude, longitude } = req.body;
      const profile = await storage.updateDriverProfile(req.params.userId, {
        isOnline: true,
        currentLatitude: latitude,
        currentLongitude: longitude,
        lastLocationUpdate: new Date(),
      });
      if (!profile) {
        return res.status(404).json({ error: "Driver profile not found" });
      }
      res.json(profile);
    } catch (error) {
      res.status(500).json({ error: "Failed to go online" });
    }
  });

  app.post("/api/drivers/:userId/go-offline", async (req, res) => {
    try {
      const profile = await storage.updateDriverProfile(req.params.userId, {
        isOnline: false,
      });
      if (!profile) {
        return res.status(404).json({ error: "Driver profile not found" });
      }
      res.json(profile);
    } catch (error) {
      res.status(500).json({ error: "Failed to go offline" });
    }
  });

  app.post("/api/drivers/:userId/update-location", async (req, res) => {
    try {
      const { latitude, longitude } = req.body;
      const profile = await storage.updateDriverProfile(req.params.userId, {
        currentLatitude: latitude,
        currentLongitude: longitude,
        lastLocationUpdate: new Date(),
      });
      if (!profile) {
        return res.status(404).json({ error: "Driver profile not found" });
      }
      res.json(profile);
    } catch (error) {
      res.status(500).json({ error: "Failed to update location" });
    }
  });

  app.get("/api/drivers/online", async (req, res) => {
    try {
      const drivers = await storage.getOnlineDrivers();
      res.json(drivers);
    } catch (error) {
      res.status(500).json({ error: "Failed to get online drivers" });
    }
  });

  app.get("/api/drivers/nearby", async (req, res) => {
    try {
      const lat = parseFloat(req.query.lat as string);
      const lng = parseFloat(req.query.lng as string);
      const radius = parseFloat(req.query.radius as string) || 10;
      
      if (isNaN(lat) || isNaN(lng)) {
        return res.status(400).json({ error: "Invalid coordinates" });
      }
      
      const drivers = await storage.getNearbyDrivers(lat, lng, radius);
      res.json(drivers);
    } catch (error) {
      res.status(500).json({ error: "Failed to get nearby drivers" });
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

  app.get("/api/drivers/:userId/rides", async (req, res) => {
    try {
      const rides = await storage.getDriverRides(req.params.userId);
      res.json(rides);
    } catch (error) {
      res.status(500).json({ error: "Failed to get driver rides" });
    }
  });

  app.get("/api/rides/pending", async (req, res) => {
    try {
      const rides = await storage.getPendingRides();
      res.json(rides);
    } catch (error) {
      res.status(500).json({ error: "Failed to get pending rides" });
    }
  });

  app.get("/api/rides/:id", async (req, res) => {
    try {
      const ride = await storage.getRideWithDetails(req.params.id);
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
        return res.status(400).json({ error: "Invalid ride data", details: parsed.error.errors });
      }
      const ride = await storage.createRide(parsed.data);
      res.status(201).json(ride);
    } catch (error) {
      console.error("Create ride error:", error);
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

  app.post("/api/rides/:id/accept", async (req, res) => {
    try {
      const { driverId } = req.body;
      
      const existingRide = await storage.getRide(req.params.id);
      if (!existingRide) {
        return res.status(404).json({ error: "Ride not found" });
      }
      
      if (existingRide.status !== "pending") {
        return res.status(400).json({ error: "Ride is no longer available" });
      }
      
      const ride = await storage.updateRide(req.params.id, {
        driverId,
        status: "driver_assigned",
        acceptedAt: new Date(),
      });
      
      res.json(ride);
    } catch (error) {
      res.status(500).json({ error: "Failed to accept ride" });
    }
  });

  app.post("/api/rides/:id/arrive", async (req, res) => {
    try {
      const ride = await storage.updateRide(req.params.id, {
        status: "driver_arriving",
      });
      if (!ride) {
        return res.status(404).json({ error: "Ride not found" });
      }
      res.json(ride);
    } catch (error) {
      res.status(500).json({ error: "Failed to mark arrival" });
    }
  });

  app.post("/api/rides/:id/start", async (req, res) => {
    try {
      const ride = await storage.updateRide(req.params.id, {
        status: "in_progress",
        startedAt: new Date(),
      });
      if (!ride) {
        return res.status(404).json({ error: "Ride not found" });
      }
      res.json(ride);
    } catch (error) {
      res.status(500).json({ error: "Failed to start ride" });
    }
  });

  app.post("/api/rides/:id/complete", async (req, res) => {
    try {
      const existingRide = await storage.getRide(req.params.id);
      if (!existingRide) {
        return res.status(404).json({ error: "Ride not found" });
      }
      
      const actualFare = Number(existingRide.estimatedFare);
      const platformFee = actualFare * 0.20;
      const driverEarnings = actualFare - platformFee;
      
      const ride = await storage.updateRide(req.params.id, {
        status: "completed",
        completedAt: new Date(),
        actualFare: actualFare.toFixed(2),
        platformFee: platformFee.toFixed(2),
        driverEarnings: driverEarnings.toFixed(2),
      });
      
      if (existingRide.driverId) {
        const driverProfile = await storage.getDriverProfile(existingRide.driverId);
        if (driverProfile) {
          await storage.updateDriverProfile(existingRide.driverId, {
            totalTrips: (driverProfile.totalTrips || 0) + 1,
            totalEarnings: (Number(driverProfile.totalEarnings || 0) + driverEarnings).toFixed(2),
          });
        }
      }
      
      res.json(ride);
    } catch (error) {
      console.error("Complete ride error:", error);
      res.status(500).json({ error: "Failed to complete ride" });
    }
  });

  app.post("/api/rides/:id/cancel", async (req, res) => {
    try {
      const ride = await storage.updateRide(req.params.id, {
        status: "cancelled",
        cancelledAt: new Date(),
      });
      if (!ride) {
        return res.status(404).json({ error: "Ride not found" });
      }
      res.json(ride);
    } catch (error) {
      res.status(500).json({ error: "Failed to cancel ride" });
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
