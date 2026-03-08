import { Request, Response, NextFunction } from 'express';
import { ZodTypeAny, ZodError } from 'zod';

export const validateInput = (schema: ZodTypeAny) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            await schema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params,
            });
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                res.status(400).json({
                    message: 'Error de validación',
                    errors: error.issues.map((e: any) => ({
                        path: e.path.join('.'),
                        message: e.message
                    }))
                });
                return;
            }
            res.status(500).json({ message: 'Error interno de validación' });
        }
    };
};
