import UserAuditLog, { UserAuditAction } from '../models/userAuditLogModel.js';
import ServiceRequestAuditLog, { ServiceRequestAuditAction } from '../models/serviceRequestAuditLogModel.js';
import WarehouseAuditLog, { WarehouseAuditAction } from '../models/warehouseAuditLogModel.js';
import NoveltyAuditLog, { NoveltyAuditAction } from '../models/noveltyAuditLogModel.js';
import ReportAccessLog, { ReportType } from '../models/reportAccessLogModel.js';

function getIp(req: any): string | null {
    return (req?.headers?.['x-forwarded-for'] as string)?.split(',')[0] ?? req?.ip ?? null;
}

function getAgent(req: any): string | null {
    return req?.headers?.['user-agent'] ?? null;
}

const auditService = {

    logUser(opts: {
        userId?: number | null;
        changedBy?: number | null;
        action: UserAuditAction;
        changes?: object | null;
        reason?: string | null;
        req?: any;
    }) {
        UserAuditLog.create({
            userId: opts.userId ?? null,
            changedBy: opts.changedBy ?? null,
            action: opts.action,
            changes: opts.changes ?? null,
            reason: opts.reason ?? null,
            ipAddress: getIp(opts.req),
            userAgent: getAgent(opts.req),
        }).catch(console.error);
    },

    logServiceRequest(opts: {
        requestId?: number | null;
        changedBy?: number | null;
        action: ServiceRequestAuditAction;
        previousStatus?: string | null;
        newStatus?: string | null;
        reason?: string | null;
        metadata?: object | null;
    }) {
        ServiceRequestAuditLog.create({
            requestId: opts.requestId ?? null,
            changedBy: opts.changedBy ?? null,
            action: opts.action,
            previousStatus: opts.previousStatus ?? null,
            newStatus: opts.newStatus ?? null,
            reason: opts.reason ?? null,
            metadata: opts.metadata ?? null,
        }).catch(console.error);
    },

    logWarehouse(opts: {
        warehouseId?: number | null;
        changedBy?: number | null;
        action: WarehouseAuditAction;
        changes?: object | null;
    }) {
        WarehouseAuditLog.create({
            warehouseId: opts.warehouseId ?? null,
            changedBy: opts.changedBy ?? null,
            action: opts.action,
            changes: opts.changes ?? null,
        }).catch(console.error);
    },

    logNovelty(opts: {
        noveltyId?: number | null;
        changedBy?: number | null;
        action: NoveltyAuditAction;
        previousStatus?: string | null;
        newStatus?: string | null;
        metadata?: object | null;
    }) {
        NoveltyAuditLog.create({
            noveltyId: opts.noveltyId ?? null,
            changedBy: opts.changedBy ?? null,
            action: opts.action,
            previousStatus: opts.previousStatus ?? null,
            newStatus: opts.newStatus ?? null,
            metadata: opts.metadata ?? null,
        }).catch(console.error);
    },

    logReportAccess(opts: {
        userId?: number | null;
        reportType: ReportType;
        params?: object | null;
        req?: any;
    }) {
        ReportAccessLog.create({
            userId: opts.userId ?? null,
            reportType: opts.reportType,
            params: opts.params ?? null,
            ipAddress: getIp(opts.req),
        }).catch(console.error);
    },
};

export default auditService;
