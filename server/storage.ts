import { 
  users, type User, type InsertUser,
  savedLocations, type SavedLocation, type InsertSavedLocation,
  driverProfiles, type DriverProfile, type InsertDriverProfile,
  rides, type Ride, type InsertRide,
  paymentMethods, type PaymentMethod, type InsertPaymentMethod,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, ne, isNotNull, or, inArray, sql } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;
  
  getSavedLocations(userId: string): Promise<SavedLocation[]>;
  createSavedLocation(location: InsertSavedLocation): Promise<SavedLocation>;
  deleteSavedLocation(id: string): Promise<void>;
  
  getDriverProfile(userId: string): Promise<DriverProfile | undefined>;
  createDriverProfile(profile: InsertDriverProfile): Promise<DriverProfile>;
  updateDriverProfile(userId: string, updates: Partial<DriverProfile>): Promise<DriverProfile | undefined>;
  getOnlineDrivers(): Promise<(DriverProfile & { user: User })[]>;
  getNearbyDrivers(lat: number, lng: number, radiusMiles: number): Promise<(DriverProfile & { user: User })[]>;
  
  getRides(userId: string): Promise<Ride[]>;
  getDriverRides(driverId: string): Promise<Ride[]>;
  getPendingRidesForDriver(driverId: string): Promise<(Ride & { rider: User })[]>;
  getRide(id: string): Promise<Ride | undefined>;
  getRideWithDetails(id: string): Promise<(Ride & { rider: User; driver?: User }) | undefined>;
  createRide(ride: InsertRide): Promise<Ride>;
  updateRide(id: string, updates: Partial<Ride>): Promise<Ride | undefined>;
  getAvailableDrivers(lat: number, lng: number, radiusMiles?: number): Promise<(DriverProfile & { user: User; distance: number })[]>;
  isDriverAvailable(driverId: string): Promise<boolean>;
  findClosestAvailableDriver(lat: number, lng: number, excludeDriverIds?: string[]): Promise<(DriverProfile & { user: User }) | null>;
  
  getPaymentMethods(userId: string): Promise<PaymentMethod[]>;
  createPaymentMethod(method: InsertPaymentMethod): Promise<PaymentMethod>;
  deletePaymentMethod(id: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const [updated] = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return updated || undefined;
  }

  async getSavedLocations(userId: string): Promise<SavedLocation[]> {
    return db.select().from(savedLocations).where(eq(savedLocations.userId, userId));
  }

  async createSavedLocation(location: InsertSavedLocation): Promise<SavedLocation> {
    const [saved] = await db.insert(savedLocations).values(location).returning();
    return saved;
  }

  async deleteSavedLocation(id: string): Promise<void> {
    await db.delete(savedLocations).where(eq(savedLocations.id, id));
  }

  async getDriverProfile(userId: string): Promise<DriverProfile | undefined> {
    const [profile] = await db.select().from(driverProfiles).where(eq(driverProfiles.userId, userId));
    return profile || undefined;
  }

  async createDriverProfile(profile: InsertDriverProfile): Promise<DriverProfile> {
    const [created] = await db.insert(driverProfiles).values(profile).returning();
    return created;
  }

  async updateDriverProfile(userId: string, updates: Partial<DriverProfile>): Promise<DriverProfile | undefined> {
    const [updated] = await db.update(driverProfiles)
      .set(updates)
      .where(eq(driverProfiles.userId, userId))
      .returning();
    return updated || undefined;
  }

  async getOnlineDrivers(): Promise<(DriverProfile & { user: User })[]> {
    const results = await db.select({
      driverProfile: driverProfiles,
      user: users,
    })
      .from(driverProfiles)
      .innerJoin(users, eq(driverProfiles.userId, users.id))
      .where(eq(driverProfiles.isOnline, true));
    
    return results.map(r => ({ ...r.driverProfile, user: r.user }));
  }

  async getNearbyDrivers(lat: number, lng: number, radiusMiles: number): Promise<(DriverProfile & { user: User })[]> {
    const results = await db.select({
      driverProfile: driverProfiles,
      user: users,
    })
      .from(driverProfiles)
      .innerJoin(users, eq(driverProfiles.userId, users.id))
      .where(and(
        eq(driverProfiles.isOnline, true),
        isNotNull(driverProfiles.currentLatitude),
        isNotNull(driverProfiles.currentLongitude)
      ));
    
    return results
      .map(r => ({ ...r.driverProfile, user: r.user }))
      .filter(driver => {
        if (!driver.currentLatitude || !driver.currentLongitude) return false;
        const dLat = Number(driver.currentLatitude) - lat;
        const dLng = Number(driver.currentLongitude) - lng;
        const distance = Math.sqrt(Math.pow(dLat * 69, 2) + Math.pow(dLng * 54.6, 2));
        return distance <= radiusMiles;
      });
  }

  async getRides(userId: string): Promise<Ride[]> {
    return db.select().from(rides).where(eq(rides.riderId, userId)).orderBy(desc(rides.createdAt));
  }

  async getDriverRides(driverId: string): Promise<Ride[]> {
    return db.select().from(rides).where(eq(rides.driverId, driverId)).orderBy(desc(rides.createdAt));
  }

  async getPendingRidesForDriver(driverId: string): Promise<(Ride & { rider: User })[]> {
    const results = await db.select({
      ride: rides,
      rider: users,
    })
      .from(rides)
      .innerJoin(users, eq(rides.riderId, users.id))
      .where(and(
        eq(rides.status, "pending"),
        eq(rides.driverId, driverId)
      ))
      .orderBy(desc(rides.createdAt));
    
    return results.map(r => ({ ...r.ride, rider: r.rider }));
  }

  async isDriverAvailable(driverId: string): Promise<boolean> {
    const activeStatuses = ["pending", "driver_assigned", "driver_arriving", "in_progress"];
    const [activeRide] = await db.select()
      .from(rides)
      .where(and(
        eq(rides.driverId, driverId),
        or(
          eq(rides.status, "pending"),
          eq(rides.status, "driver_assigned"),
          eq(rides.status, "driver_arriving"),
          eq(rides.status, "in_progress")
        )
      ))
      .limit(1);
    
    return !activeRide;
  }

  async getAvailableDrivers(lat: number, lng: number, radiusMiles: number = 10): Promise<(DriverProfile & { user: User; distance: number })[]> {
    const onlineDrivers = await db.select({
      driverProfile: driverProfiles,
      user: users,
    })
      .from(driverProfiles)
      .innerJoin(users, eq(driverProfiles.userId, users.id))
      .where(and(
        eq(driverProfiles.isOnline, true),
        isNotNull(driverProfiles.currentLatitude),
        isNotNull(driverProfiles.currentLongitude)
      ));
    
    const availableDriversWithDistance: (DriverProfile & { user: User; distance: number })[] = [];
    
    for (const driver of onlineDrivers) {
      const isAvailable = await this.isDriverAvailable(driver.user.id);
      if (!isAvailable) continue;
      
      if (!driver.driverProfile.currentLatitude || !driver.driverProfile.currentLongitude) continue;
      
      const dLat = Number(driver.driverProfile.currentLatitude) - lat;
      const dLng = Number(driver.driverProfile.currentLongitude) - lng;
      const distance = Math.sqrt(Math.pow(dLat * 69, 2) + Math.pow(dLng * 54.6, 2));
      
      if (distance <= radiusMiles) {
        availableDriversWithDistance.push({
          ...driver.driverProfile,
          user: driver.user,
          distance,
        });
      }
    }
    
    return availableDriversWithDistance.sort((a, b) => a.distance - b.distance);
  }

  async findClosestAvailableDriver(lat: number, lng: number, excludeDriverIds: string[] = []): Promise<(DriverProfile & { user: User }) | null> {
    const availableDrivers = await this.getAvailableDrivers(lat, lng, 20);
    
    const eligibleDriver = availableDrivers.find(d => !excludeDriverIds.includes(d.user.id));
    
    if (!eligibleDriver) return null;
    
    const { distance, ...driverWithoutDistance } = eligibleDriver;
    return driverWithoutDistance;
  }

  async getRide(id: string): Promise<Ride | undefined> {
    const [ride] = await db.select().from(rides).where(eq(rides.id, id));
    return ride || undefined;
  }

  async getRideWithDetails(id: string): Promise<(Ride & { rider: User; driver?: User }) | undefined> {
    const [result] = await db.select({
      ride: rides,
      rider: users,
    })
      .from(rides)
      .innerJoin(users, eq(rides.riderId, users.id))
      .where(eq(rides.id, id));
    
    if (!result) return undefined;

    let driver: User | undefined;
    if (result.ride.driverId) {
      const [driverResult] = await db.select().from(users).where(eq(users.id, result.ride.driverId));
      driver = driverResult;
    }

    return { ...result.ride, rider: result.rider, driver };
  }

  async createRide(ride: InsertRide): Promise<Ride> {
    const [created] = await db.insert(rides).values(ride).returning();
    return created;
  }

  async updateRide(id: string, updates: Partial<Ride>): Promise<Ride | undefined> {
    const [updated] = await db.update(rides).set(updates).where(eq(rides.id, id)).returning();
    return updated || undefined;
  }

  async getPaymentMethods(userId: string): Promise<PaymentMethod[]> {
    return db.select().from(paymentMethods).where(eq(paymentMethods.userId, userId));
  }

  async createPaymentMethod(method: InsertPaymentMethod): Promise<PaymentMethod> {
    const [created] = await db.insert(paymentMethods).values(method).returning();
    return created;
  }

  async deletePaymentMethod(id: string): Promise<void> {
    await db.delete(paymentMethods).where(eq(paymentMethods.id, id));
  }
}

export const storage = new DatabaseStorage();
