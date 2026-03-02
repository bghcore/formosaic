import { Dictionary } from "lodash";

export type OrderDependencies = string[] | Dictionary<OrderDependencies>;
