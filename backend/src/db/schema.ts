import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Drizzle syntax from documentation: https://orm.drizzle.team/docs/relations/
export const users = pgTable("users", {
    id: text("id").primaryKey().notNull(), // ovde text jer koristis clerkId kao string, a ne uuid
    email: text("email").notNull().unique(),
    name: text("name"),
    imageUrl: text("image_url"),    // imageUrl(key) koristis u kodu, a image_url(value) u bazi  
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    // updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" })    // coderabbit predlog 
        .notNull()
        .defaultNow()
        .$onUpdate(() => new Date()),
});

export const products = pgTable("products", {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    imageUrl: text("image_url").notNull(),
    userId: text("user_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),    // svaki product pripada jednom user-u, a jedan user moze imati vise product-a -- cascade brise sve product-e kada se obrise user
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
});

export const comments = pgTable("comments", {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    content: text("content").notNull(),
    userId: text("user_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),    // svaki komentar pripada jednom user-u, a jedan user moze imati vise komentara -- cascade brise sve komentare kada se obrise user
    productId: uuid("product_id")
        .notNull()
        .references(() => products.id, { onDelete: "cascade" }),    // svaki komentar pripada jednom product-u, a jedan product moze imati vise komentara -- cascade brise sve komentare kada se obrise product
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
});

// Relacije izmedju tabela
// Relacije definisu kako su tabele povezane jedna sa drugom. 
// To omogucava Drizzle query API-ju da automatski generise JOIN upite i omogucava lakse dohvatanje povezanih podataka iz vise tabela u jednom upitu.
// to radi kad koristi 'with: { relationName: true }' u query-ju, npr. db.select().from(users).with({ products: true }) -- ovo ce vratiti sve user-e sa njihovim product-ima

// User relacije
    // User moze imati vise producta i vise komentara -> many()
export const userRelations = relations(users, ({ many }) => ({  // ovde mogu biti i druge neke relacije: one 
    products: many(products),   // 1 user -> many products
    comments: many(comments),   // 1 user -> many comments
}));

// Product relacije
    // Product pripada jednom user-u i moze imati vise komentara -> one() i many()
export const productRelations = relations(products, ({ one, many }) => ({
    // fields (FK) -> reference (PK) - UVEK!
    comments: many(comments),   // 1 product -> many comments
    // 'fields' = je spoljni kljuc FK kolona u OVOJ tabeli (products.userId) 
    // 'references' = je primarni kljuc PK kolona u POVEZANOJ tabeli (users.id) - povezujes tabele products i users preko userId i id kolona
    user: one(users, { fields:[products.userId], references:[users.id] }),   // 1 product -> 1 user    
}));

// Comment relacije
    // Comment pripada jednom user-u i jednom product-u -> one() i one()
export const commentRelations = relations(comments, ({ one }) => ({
    // fields (FK) -> reference (PK) - UVEK!
    user: one(users, { fields:[comments.userId], references:[users.id] }),   // 1 comment -> 1 user
    product: one(products, { fields:[comments.productId], references:[products.id] }),   // 1 comment -> 1 product
}));

// Ekstraktovanje tipova iz tabela i relacija
export type User = typeof users.$inferSelect;   // User tip koji sadrzi sve kolone iz users tabele
export type NewUser = typeof users.$inferInsert;   // NewUser tip koji sadrzi sve kolone iz users tabele ali vrednosti name, image, createdAt, updatedAt mogu biti undefined

export type Product = typeof products.$inferSelect;   // Product tip koji sadrzi sve kolone iz products tabele
export type NewProduct = typeof products.$inferInsert; // id, createdAt, updatedAt mogu biti undefined

export type Comment = typeof comments.$inferSelect;   // Comment tip koji sadrzi sve kolone iz comments tabele
export type NewComment = typeof comments.$inferInsert; // id, createdAt mogu biti undefined

// 1:10:00