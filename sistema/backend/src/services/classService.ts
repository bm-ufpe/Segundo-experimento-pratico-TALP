import { v4 as uuid } from 'uuid';
import { readDb, writeDb } from '../data/db';
import type { Class, CreateClassRequest, UpdateClassRequest } from '../types/index';

const DB = 'classes';

class ClassService {
    list(): Class[] {
        return readDb<Class>(DB);
    }

    get(id: string): Class | undefined {
        return this.list().find(c => c.id === id);
    }

    create(req: CreateClassRequest): Class {
        const cls: Class = {
            id: uuid(),
            ...req,
            studentIds: [],
            createdAt: new Date().toISOString(),
        };
        writeDb(DB, [...this.list(), cls]);
        return cls;
    }

    update(id: string, req: UpdateClassRequest): Class {
        const classes = this.list();
        const idx = classes.findIndex(c => c.id === id);
        if (idx === -1) throw new Error(`Turma ${id} não encontrada`);
        const updated = { ...classes[idx], ...req };
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
        if (idx === -1) throw new Error(`Turma ${classId} não encontrada`);
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
        if (idx === -1) throw new Error(`Turma ${classId} não encontrada`);
        classes[idx].studentIds = classes[idx].studentIds.filter(id => id !== studentId);
        writeDb(DB, classes);
        return classes[idx];
    }
}

export const classService = new ClassService();
