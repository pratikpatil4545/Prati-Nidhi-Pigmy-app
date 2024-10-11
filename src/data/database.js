import SQLiteAdapter from "@nozbe/watermelondb/adapters/sqlite";
import { mySchema } from "./schema";
import { Database } from "@nozbe/watermelondb";
import master_table from "./Master";
import header_table from "./Header"; 
import mapping_table from "./Mapping";

mySchema;
const adapter = new SQLiteAdapter({
    schema : mySchema,
});

export const database = new Database({
    adapter,
    modelClasses:[master_table, header_table, mapping_table],
    actionEnabled:true
})