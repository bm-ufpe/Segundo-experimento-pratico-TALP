import { v4 as uuid } from 'uuid';
import { readDb, writeDb } from '../data/db';
import { emailService } from './emailService';
import type { Evaluation, UpsertEvaluationRequest, EvaluationGoal, EvaluationValue } from '../types/index';

const DB = 'evaluations';

const VALID_GOALS = new Set<EvaluationGoal>(['Requisitos', 'Testes', 'Implementação', 'Documentação']);
const VALID_VALUES = new Set<EvaluationValue>(['MANA', 'MPA', 'MA']);

class EvaluationService {
    listByClass(classId: string): Evaluation[] {
        return readDb<Evaluation>(DB).filter(e => e.classId === classId);
    }

    upsert(classId: string, req: UpsertEvaluationRequest): Evaluation {
        if (!VALID_GOALS.has(req.goal)) throw new Error(`Objetivo inválido: "${req.goal}"`);
        if (!VALID_VALUES.has(req.value)) throw new Error(`Valor inválido: "${req.value}"`);
        const all = readDb<Evaluation>(DB);
        const idx = all.findIndex(
            e => e.classId === classId && e.studentId === req.studentId && e.goal === req.goal
        );

        let evaluation: Evaluation;
        if (idx === -1) {
            evaluation = {
                id: uuid(),
                classId,
                studentId: req.studentId,
                goal: req.goal,
                value: req.value,
                updatedAt: new Date().toISOString(),
            };
            all.push(evaluation);
        } else {
            evaluation = { ...all[idx], value: req.value, updatedAt: new Date().toISOString() };
            all[idx] = evaluation;
        }

        writeDb(DB, all);

        // Queue email notification (respects 1-per-day rule)
        emailService.queueChange(req.studentId, classId, req.goal, req.value);

        return evaluation;
    }

    deleteByClass(classId: string): void {
        const all = readDb<Evaluation>(DB).filter(e => e.classId !== classId);
        writeDb(DB, all);
    }
}

export const evaluationService = new EvaluationService();
