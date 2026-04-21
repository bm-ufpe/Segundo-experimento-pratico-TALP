import { Router, Request, Response } from 'express';
import { classService } from '../services/classService';
import { evaluationService } from '../services/evaluationService';
import type { CreateClassRequest, UpdateClassRequest, UpsertEvaluationRequest } from '../types/index';

const router = Router();

const id  = (req: Request): string => String(req.params.id);
const sid = (req: Request): string => String(req.params.studentId);

router.get('/', (_req: Request, res: Response) => {
    res.json(classService.list());
});

router.get('/:id', (req: Request, res: Response) => {
    const cls = classService.get(id(req));
    if (!cls) return res.status(404).json({ error: 'Turma não encontrada' });
    return res.json(cls);
});

router.post('/', (req: Request, res: Response) => {
    try {
        return res.status(201).json(classService.create(req.body as CreateClassRequest));
    } catch (err) {
        return res.status(400).json({ error: (err as Error).message });
    }
});

router.put('/:id', (req: Request, res: Response) => {
    try {
        return res.json(classService.update(id(req), req.body as UpdateClassRequest));
    } catch (err) {
        const msg = (err as Error).message;
        return res.status(msg.includes('não encontrada') ? 404 : 400).json({ error: msg });
    }
});

router.delete('/:id', (req: Request, res: Response) => {
    evaluationService.deleteByClass(id(req));
    const deleted = classService.delete(id(req));
    if (!deleted) return res.status(404).json({ error: 'Turma não encontrada' });
    return res.status(204).send();
});

// Manage students in class
router.post('/:id/students', (req: Request, res: Response) => {
    try {
        return res.json(classService.addStudent(id(req), req.body.studentId));
    } catch (err) {
        return res.status(400).json({ error: (err as Error).message });
    }
});

router.delete('/:id/students/:studentId', (req: Request, res: Response) => {
    try {
        return res.json(classService.removeStudent(id(req), sid(req)));
    } catch (err) {
        return res.status(400).json({ error: (err as Error).message });
    }
});

// Evaluations for a class
router.get('/:id/evaluations', (req: Request, res: Response) => {
    res.json(evaluationService.listByClass(id(req)));
});

router.put('/:id/evaluations', (req: Request, res: Response) => {
    try {
        return res.json(evaluationService.upsert(id(req), req.body as UpsertEvaluationRequest));
    } catch (err) {
        return res.status(400).json({ error: (err as Error).message });
    }
});

export default router;
