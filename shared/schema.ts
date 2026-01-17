import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, decimal, boolean, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const rideStatusEnum = pgEnum("ride_status", [
  "pending",
  "driver_assigned",
  "driver_arriving",
  "in_progress",
  "completed",
  "cancelled"
]);

export const vehicleTierEnum = pgEnum("vehicle_tier", [
  "economy",
  "comfort", 
  "premium",
  "luxury"
]);

export const users = pgTable("users", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name"),
  email: text("email"),
  phone: text("phone"),
  avatarUrl: text("avatar_url"),
  rating: decimal("rating", { precision: 2, scale: 1 }).default("5.0"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const savedLocations = pgTable("saved_locations", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  address: text("address").notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 7 }).notNull(),
  longitude: decimal("longitude", { precision: 10, scale: 7 }).notNull(),
  icon: text("icon").default("map-pin"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const drivers = pgTable("drivers", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  fullName: text("full_name").notNull(),
  phone: text("phone").notNull(),
  avatarUrl: text("avatar_url"),
  rating: decimal("rating", { precision: 2, scale: 1 }).default("4.8"),
  vehicleMake: text("vehicle_make").notNull(),
  vehicleModel: text("vehicle_model").notNull(),
  vehicleColor: text("vehicle_color").notNull(),
  vehiclePlate: text("vehicle_plate").notNull(),
  vehicleTier: vehicleTierEnum("vehicle_tier").notNull(),
  isVerified: boolean("is_verified").default(true),
  totalRides: integer("total_rides").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const rides = pgTable("rides", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  driverId: varchar("driver_id").references(() => drivers.id),
  status: rideStatusEnum("status").default("pending"),
  vehicleTier: vehicleTierEnum("vehicle_tier").notNull(),
  pickupAddress: text("pickup_address").notNull(),
  pickupLatitude: decimal("pickup_latitude", { precision: 10, scale: 7 }).notNull(),
  pickupLongitude: decimal("pickup_longitude", { precision: 10, scale: 7 }).notNull(),
  destinationAddress: text("destination_address").notNull(),
  destinationLatitude: decimal("destination_latitude", { precision: 10, scale: 7 }).notNull(),
  destinationLongitude: decimal("destination_longitude", { precision: 10, scale: 7 }).notNull(),
  estimatedFare: decimal("estimated_fare", { precision: 10, scale: 2 }).notNull(),
  actualFare: decimal("actual_fare", { precision: 10, scale: 2 }),
  estimatedDuration: integer("estimated_duration"),
  estimatedDistance: decimal("estimated_distance", { precision: 10, scale: 2 }),
  scheduledFor: timestamp("scheduled_for"),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  riderRating: integer("rider_rating"),
  driverRating: integer("driver_rating"),
  tip: decimal("tip", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const paymentMethods = pgTable("payment_methods", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: text("type").notNull(),
  last4: text("last4").notNull(),
  brand: text("brand").notNull(),
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  savedLocations: many(savedLocations),
  rides: many(rides),
  paymentMethods: many(paymentMethods),
}));

export const savedLocationsRelations = relations(savedLocations, ({ one }) => ({
  user: one(users, {
    fields: [savedLocations.userId],
    references: [users.id],
  }),
}));

export const driversRelations = relations(drivers, ({ many }) => ({
  rides: many(rides),
}));

export const ridesRelations = relations(rides, ({ one }) => ({
  user: one(users, {
    fields: [rides.userId],
    references: [users.id],
  }),
  driver: one(drivers, {
    fields: [rides.driverId],
    references: [drivers.id],
  }),
}));

export const paymentMethodsRelations = relations(paymentMethods, ({ one }) => ({
  user: one(users, {
    fields: [paymentMethods.userId],
    references: [users.id],
  }),
}));

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertSavedLocationSchema = createInsertSchema(savedLocations).omit({
  id: true,
  createdAt: true,
});

export const insertRideSchema = createInsertSchema(rides).omit({
  id: true,
  createdAt: true,
});

export const insertDriverSchema = createInsertSchema(drivers).omit({
  id: true,
  createdAt: true,
});

export const insertPaymentMethodSchema = createInsertSchema(paymentMethods).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type SavedLocation = typeof savedLocations.$inferSelect;
export type InsertSavedLocation = z.infer<typeof insertSavedLocationSchema>;
export type Driver = typeof drivers.$inferSelect;
export type InsertDriver = z.infer<typeof insertDriverSchema>;
export type Ride = typeof rides.$inferSelect;
export type InsertRide = z.infer<typeof insertRideSchema>;
export type PaymentMethod = typeof paymentMethods.$inferSelect;
export type InsertPaymentMethod = z.infer<typeof insertPaymentMethodSchema>;
