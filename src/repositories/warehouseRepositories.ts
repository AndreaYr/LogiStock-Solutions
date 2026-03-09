import { BaseRepository } from "./baseRepositories.js";
import Warehouse from "../models/warehouseModel.js";
import { IWarehouseAttributes, IWarehouseCreationAttributes } from "../models/warehouseModel.js";

export class WarehouseRepository extends BaseRepository<Warehouse> {
    constructor() {
        super(Warehouse);
    }
}
