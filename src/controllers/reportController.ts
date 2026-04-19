import { Request, Response } from 'express';
import reportService from '../services/reportService.js';
import auditService from '../services/auditService.js';

export class ReportController {
    /**
     * GET /api/reports/movements-period?warehouseId={id}&startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
     * Obtener movimientos en un período
     */
    static async getMovementsByPeriod(req: Request, res: Response): Promise<void> {
        try {
            const warehouseId = Number(req.query.warehouseId);
            const startDate = req.query.startDate as string;
            const endDate = req.query.endDate as string;

            if (!warehouseId || !startDate || !endDate) {
                res.status(400).json({ message: 'warehouseId, startDate y endDate son requeridos' });
                return;
            }

            const report = await reportService.getMovementsByPeriod(warehouseId, startDate, endDate);
            auditService.logReportAccess({ userId: req.user?.userId, reportType: 'MOVEMENTS_PERIOD', params: { warehouseId, startDate, endDate }, req });
            res.status(200).json(report);
        } catch (err: any) {
            res.status(500).json({ message: err.message });
        }
    }

    /**
     * GET /api/reports/warehouse-occupancy?warehouseId={id}
     * Obtener ocupación actual de una bodega
     */
    static async getWarehouseOccupancy(req: Request, res: Response): Promise<void> {
        try {
            const warehouseId = Number(req.query.warehouseId);

            if (!warehouseId) {
                res.status(400).json({ message: 'warehouseId es requerido' });
                return;
            }

            const occupancy = await reportService.getWarehouseOccupancy(warehouseId);
            auditService.logReportAccess({ userId: req.user?.userId, reportType: 'WAREHOUSE_OCCUPANCY', params: { warehouseId }, req });
            res.status(200).json(occupancy);
        } catch (err: any) {
            res.status(500).json({ message: err.message });
        }
    }

    /**
     * GET /api/reports/service-request-tracking/:requestId
     * Obtener tracking de una solicitud (estado, movimientos asociados, novedades)
     */
    static async getServiceRequestTracking(req: Request, res: Response): Promise<void> {
        try {
            const { requestId } = req.params;

            if (!requestId) {
                res.status(400).json({ message: 'requestId es requerido' });
                return;
            }

            const tracking = await reportService.getServiceRequestTracking(Number(requestId));
            auditService.logReportAccess({ userId: req.user?.userId, reportType: 'SERVICE_REQUEST_TRACKING', params: { requestId }, req });
            res.status(200).json(tracking);
        } catch (err: any) {
            const status = err.message.includes('no encontrada') ? 404 : 500;
            res.status(status).json({ message: err.message });
        }
    }

    /**
     * GET /api/reports/warehouse-kpis?warehouseId={id}&days={days}
     * Obtener KPIs de una bodega
     */
    static async getWarehouseKPIs(req: Request, res: Response): Promise<void> {
        try {
            const warehouseId = Number(req.query.warehouseId);
            const days = req.query.days ? Number(req.query.days) : 30;

            if (!warehouseId) {
                res.status(400).json({ message: 'warehouseId es requerido' });
                return;
            }

            const kpis = await reportService.getWarehouseKPIs(warehouseId, days);
            auditService.logReportAccess({ userId: req.user?.userId, reportType: 'WAREHOUSE_KPIS', params: { warehouseId, days }, req });
            res.status(200).json(kpis);
        } catch (err: any) {
            res.status(500).json({ message: err.message });
        }
    }

    /**
     * GET /api/reports/manager-actions?warehouseId={id}&days={days}
     * Obtener historial de acciones del jefe de bodega
     */
    static async getManagerActionHistory(req: Request, res: Response): Promise<void> {
        try {
            const warehouseId = Number(req.query.warehouseId);
            const days = req.query.days ? Number(req.query.days) : 30;

            if (!warehouseId) {
                res.status(400).json({ message: 'warehouseId es requerido' });
                return;
            }

            const history = await reportService.getManagerActionHistory(warehouseId, days);
            auditService.logReportAccess({ userId: req.user?.userId, reportType: 'MANAGER_ACTIONS', params: { warehouseId, days }, req });
            res.status(200).json(history);
        } catch (err: any) {
            res.status(500).json({ message: err.message });
        }
    }
}
