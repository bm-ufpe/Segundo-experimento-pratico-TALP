import { Router, Request, Response } from 'express';
import { studentService } from '../services/studentService';
import type { CreateStudentRequest, UpdateStudentRequest } from '../types/index';

const router = Router();

const id = (req: Request): string => String(req.params.id);

router.get('/', (_req: Request, res: Response) => {
    res.json(studentService.list());
});

router.get('/:id', (req: Request, res: Response) => {
    const student = studentService.get(id(req));
    if (!student) return res.status(404).json({ error: 'Aluno não encontrado' });
    return res.json(student);
});

router.post('/', (req: Request, res: Response) => {
    try {
        return res.status(201).json(studentService.create(req.body as CreateStudentRequest));
    } catch (err) {
        return res.status(400).json({ error: (err as Error).message });
    }
});

router.put('/:id', (req: Request, res: Response) => {
    try {
        return res.json(studentService.update(id(req), req.body as UpdateStudentRequest));
    } catch (err) {
        const msg = (err as Error).message;
        return res.status(msg.includes('não encontrado') ? 404 : 400).json({ error: msg });
    }
});

router.delete('/:id', (req: Request, res: Response) => {
    const deleted = studentService.delete(id(req));
    if (!deleted) return res.status(404).json({ error: 'Aluno não encontrado' });
    return res.status(204).send();
});

export default router;
