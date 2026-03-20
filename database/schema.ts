// Define database tables here using drizzle-orm
// See: https://orm.drizzle.team/docs/sql-schema-declaration

import {
  pgTable,
  pgEnum,
  text,
  varchar,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const changeTypeEnum = pgEnum("change_type", [
  "created",
  "completed",
  "deleted",
]);

export const objectives = pgTable("objectives", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 255 }).notNull(),
  // TEXT type — no length limit; supports arbitrarily long voice-dictated content
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
});

export const objectiveChanges = pgTable("objective_changes", {
  id: uuid("id").primaryKey().defaultRandom(),
  objectiveId: uuid("objective_id")
    .notNull()
    .references(() => objectives.id, { onDelete: "cascade" }),
  changeType: changeTypeEnum("change_type").notNull(),
  timestamp: timestamp("timestamp", { withTimezone: true })
    .notNull()
    .defaultNow(),
  userId: text("user_id"),
});
