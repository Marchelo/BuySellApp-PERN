import { drizzle } from "drizzle-orm/node-postgres";    // Drizzle ORM za Node.js sa PostgreSQL
import { Pool } from "pg";              // PostgreSQL client za Node.js
import * as schema from "./schema";     // import sve iz schema.ts fajla (tabele i relacije)
import { ENV } from "../config/env";    // import ENV iz env.ts fajla (konfiguracija okruzenja)

if (!ENV.DB_URL) {
    throw new Error("DB_URL is not defined in environment variables");
}

// postgress connection pool
const pool = new Pool({ connectionString: ENV.DB_URL });

// log when first connection is made
pool.on("connect", () => {
    console.log("Database connection successfully!");
});

// log when an error occurs on the pool
pool.on("error", (err) => {
    console.error("Database connection error:", err);
});

// varijabla koju ces koristiti u buducnosti za pristup bazi - Drizzle ORM instanca sa povezanim pool-om i schema-om
export const db = drizzle({ client:pool, schema });

// u ovom fajlu se konektujes na bazu koristeci connection string u DB_URL i kreiras Drizzle ORM instancu sa povezanim pool-om i schema-om 
// Sta je Connection Pull
// Connection Pool je skup unapred kreiranih konekcija ka bazi podataka koje se mogu koristiti i ponovo koristiti.
// Zasto ih koristis?
    // Otvaranje/zarvaranje konekcije je sporo. Umesto da kreiras novu konekciju za svaki request ti koristis postojecu konekciju iz pool-a. 
    // Kada zavrsis sa njom, vratis je u pool da je drugi request moze koristiti. To znatno ubrzava rad sa bazom i smanjuje opterecenje na serveru.