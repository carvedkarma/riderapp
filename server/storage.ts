import { 
  users, type User, type InsertUser,
  savedLocations, type SavedLocation, type InsertSavedLocation,
  drivers, type Driver, type InsertDriver,
  rides, type Ride, type InsertRide,
  paymentMethods, type PaymentMethod, type InsertPaymentMethod,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getSavedLocations(userId: string): Promise<SavedLocation[]>;
  createSavedLocation(location: InsertSavedLocation): Promise<SavedLocation>;
  deleteSavedLocation(id: string): Promise<void>;
  
  getDrivers(): Promise<Driver[]>;
  getDriver(id: string): Promise<Driver | undefined>;
  createDriver(driver: InsertDriver): Promise<Driver>;
  
  getRides(userId: string): Promise<Ride[]>;
  getRide(id: string): Promise<Ride | undefined>;
  createRide(ride: InsertRide): Promise<Ride>;
  updateRide(id: string, updates: Partial<Ride>): Promise<Ride | undefined>;
  
  getPaymentMethods(userId: string): Promise<PaymentMethod[]>;
  createPaymentMethod(method: InsertPaymentMethod): Promise<PaymentMethod>;
  deletePaymentMethod(id: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
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

  async getDrivers(): Promise<Driver[]> {
    return db.select().from(drivers);
  }

  async getDriver(id: string): Promise<Driver | undefined> {
    const [driver] = await db.select().from(drivers).where(eq(drivers.id, id));
    return driver || undefined;
  }

  async createDriver(driver: InsertDriver): Promise<Driver> {
    const [created] = await db.insert(drivers).values(driver).returning();
    return created;
  }

  async getRides(userId: string): Promise<Ride[]> {
    return db.select().from(rides).where(eq(rides.userId, userId)).orderBy(desc(rides.createdAt));
  }

  async getRide(id: string): Promise<Ride | undefined> {
    const [ride] = await db.select().from(rides).where(eq(rides.id, id));
    return ride || undefined;
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
