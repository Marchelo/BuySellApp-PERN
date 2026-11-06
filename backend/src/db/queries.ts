import { db } from "./index";           // varijabla iz index.ts koju ces koristiti za pristup bazi
import { eq } from "drizzle-orm";
// eq - testira da li su dve vrednosti ekvivalentne
    // Test that two values are equal.
    // Remember that the SQL standard dictates that two NULL values are not equal, so if you want to test whether a value is null, you may want to use isNull instead.

import { 
    users, products, comments, 
    type NewUser, type NewComment, type NewProduct 
} from "./schema";


// =========================== USER QUERIES ===========================
export const createUser = async (data: NewUser) => {    // CREATE
    const [user] = await  db.insert(users).values(data).returning() // drizzle metode, insert, findFirst, update...
    return user;
};

export const getUserById = async (id:string) => {       // GET_ONE
    // prvo users.id je neki korisnik kog hoces da pronadjes u bazi podataka,   a drugi id je proslednjeni argument id:string
    return db.query.users.findFirst({ where:eq(users.id, id) })
};

export const updateUser = async (id:string, data:Partial<NewUser>) => {  // UPDATE
    // Partial<NewUser> - TS specificno, omogucavanje menjanje samo odredjene vrednosti u objektu ne moras sve da menjas, recimo azuriras samo email
    const existingUser = await getUserById(id);
    if(!existingUser){
        throw new Error(`User with id ${id} not found!`);
    }
    const [user] = await db.update(users).set(data).where(eq(users.id, id)).returning()
    return user
};
// upsert - moze da uradi ili insert ili update
export const upsertUser = async(data:NewUser) => {      // Hibrid UPDATE/INSERT
    // --- ovo je tvoj kod ---
    // const existingUser = await getUserById(data.id)
    // // ako user postoji samo ga update
    // if(existingUser)    return updateUser(data.id, data)
    // // u suprotnom ga napravi
    // createUser(data)

    // --- predlozene ispravke od codeRabbit-a
    const [user] = await db.insert(users).values(data).onConflictDoUpdate({
        target: users.id,
        set: data,
      })
      .returning();
    return user;
};

// =========================== PRODUCT QUERIES ===========================
export const createProduct = async (data:NewProduct) => {
    const [product] = await db.insert(products).values(data).returning()
    return product;
};

export const getAllProducts = async () => {     // GET_ALL - home screen
    return db.query.products.findMany({     // user -> jer si tako nazvao u schema.ts fajlu
        with:{ user:true },  // ovo ti treba da bi dobio user-a koji je napravio product, a ne samo userId, preko usera mozes da pristupis njegovim detaljima
        orderBy: (products,{ desc }) => [desc(products.createdAt)] // sortiraj produkte od najnovijeg ka najstarijem -> desc 
            // [] su obavezne zato sto Drizzle ORM's orderBy ocekuje array kao povratnu vrednost cak i za jednu kolonu
    }) 
}; 

export const getProductById = async (id:string) => { // GET_BY_PRODUCT_ID - product detail screen
    return db.query.products.findFirst({ 
        where:eq(products.id, id),
        with: {             // ovo ti je sve Drizzle sintaksa ne moras je bas znati napamet jer uvek mozes da odes na dokumentaciju
            user:true,
            comments:{
                with:{ user:true },
                orderBy: (comments,{ desc }) => [desc(comments.createdAt)]
            }
        }
    })
};

export const getProductsByUserId = async (userId:string) => {   // GET_BY_USER_ID - profile screen
    return db.query.products.findMany({ 
        where:eq(products.userId, userId),
        with: { user:true },
        orderBy: (products,{ desc }) => [desc(products.createdAt)]
    })
};

export const updateProduct = async (id:string, data:Partial<NewProduct>) => {   // UPDATE
    const existingProduct = await getProductById(id);
    if(!existingProduct){
        throw new Error(`Product with id ${id} not found!`);
    }
    const [product] = await db.update(products).set(data).where(eq(products.id, id)).returning()
    return product
};

export const deleteProduct = async (id:string) => {
    const existingProduct = await getProductById(id);
    if(!existingProduct){
        throw new Error(`Product with id ${id} not found!`);
    }
    const [product] = await db.delete(products).where(eq(products.id, id)).returning()
    return product;
};

// =========================== COMMENT QUERIES ===========================
export const createComment = async (data:NewComment) => {       // CREATE
    const [comment] = await db.insert(comments).values(data).returning();
    return comment; 
};

export const deleteComment = async (id:string) => {
    const existingComment = await getCommentById(id);
    if(!existingComment){
        throw new Error(`Comment with id ${id} not found!`);
    }
    const [comment] = await db.delete(comments).where(eq(comments.id, id)).returning();
    return comment;
};

export const getCommentById = async (id: string) => {
    return db.query.comments.findFirst({
        where:eq(comments.id, id),
        with:{ user: true },
    });
};
// novi kom