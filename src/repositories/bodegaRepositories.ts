import Bodega, { IBodegaCreationAttributes } from '../models/bodegaModel.js';

export class BodegaRepository {
    async findAll(): Promise<Bodega[]> {
        return Bodega.findAll();
    }

    async findById(id: number): Promise<Bodega | null> {
        return Bodega.findByPk(id);
    }

    async create(data: IBodegaCreationAttributes): Promise<Bodega> {
        return Bodega.create(data);
    }

    async update(id: number, data: Partial<IBodegaCreationAttributes>): Promise<Bodega | null> {
        const bodega = await this.findById(id);
        if (!bodega) return null;
        return bodega.update(data);
    }

    async delete(id: number): Promise<boolean> {
        const deleted = await Bodega.destroy({ where: { id } });
        return deleted > 0;
    }
}

export default new BodegaRepository();
