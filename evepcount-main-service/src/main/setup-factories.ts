import { lectureModuleFactory } from "@features/lecture/factories";
import { Db } from "mongodb";

export function setupFactories(database?: Db) {
  lectureModuleFactory(database);
}
