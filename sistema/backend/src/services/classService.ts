import { v4 as uuid } from 'uuid';
import { readDb, writeDb } from '../data/db';
import { requireFields } from '../utils/validation';
import { NotFoundError } from '../utils/errors';
import type { Class, CreateClassRequest, UpdateClassRequest } from '../types/index';

const DB = 'classes';

function validateClass(req: Partial<CreateClassRequest>): void {
    if (req.year !== undefined && (!Number.isInteger(req.year) || req.year < 2000 || req.year > 2100)) {
        throw new Error('Ano inválido (esperado entre 2000 e 2100)');
    }
    if (req.semester !== undefined && req.semester !== 1 && req.semester !== 2) {
        throw new Error('Semestre inválido (esperado 1 ou 2)');
    }
}

class ClassService {
    list(): Class[] {
        return readDb<Class>(DB);
    }

    get(id: string): Class | undefined {
        return this.list().find(c => c.id === id);
    }

    create(req: CreateClassRequest): Class {
        requireFields(req as unknown as Record<string, unknown>, ['description', 'year', 'semester']);
        validateClass(req);

        const cls: Class = {
            id: uuid(),
            description: req.description.trim(),
            year: req.year,
            semester: req.semester,
            studentIds: [],
            createdAt: new Date().toISOString(),
        };
        writeDb(DB, [...this.list(), cls]);
        return cls;
    }

    update(id: string, req: UpdateClassRequest): Class {
        validateClass(req);

        const classes = this.list();
        const idx = classes.findIndex(c => c.id === id);
        if (idx === -1) throw new NotFoundError(`Turma ${id} não encontrada`);

        const updated: Class = {
            ...classes[idx],
            ...(req.description !== undefined && { description: req.description.trim() }),
            ...(req.year      !== undefined && { year: req.year }),
            ...(req.semester  !== undefined && { semester: req.semester }),
        };
        classes[idx] = updated;
        writeDb(DB, classes);
        return updated;
    }

    delete(id: string): boolean {
        const classes = this.list();
        const next = classes.filter(c => c.id !== id);
        if (next.length === classes.length) return false;
        writeDb(DB, next);
        return true;
    }

    addStudent(classId: string, studentId: string): Class {
        const classes = this.list();
        const idx = classes.findIndex(c => c.id === classId);
        if (idx === -1) throw new NotFoundError(`Turma ${classId} não encontrada`);
        const students = readDb<{ id: string }>('students');
        if (!students.some(s => s.id === studentId)) {
            throw new NotFoundError(`Aluno ${studentId} não encontrado`);
        }
        if (classes[idx].studentIds.includes(studentId)) {
            throw new Error('Aluno já está na turma');
        }
        classes[idx].studentIds.push(studentId);
        writeDb(DB, classes);
        return classes[idx];
    }

    removeStudent(classId: string, studentId: string): Class {
        const classes = this.list();
        const idx = classes.findIndex(c => c.id === classId);
        if (idx === -1) throw new NotFoundError(`Turma ${classId} não encontrada`);
        classes[idx].studentIds = classes[idx].studentIds.filter(id => id !== studentId);
        writeDb(DB, classes);
        return classes[idx];
    }
}

export const classService = new ClassService();
