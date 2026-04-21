import { v4 as uuid } from 'uuid';
import { readDb, writeDb } from '../data/db';
import type { Student, CreateStudentRequest, UpdateStudentRequest } from '../types/index';

const DB = 'students';

class StudentService {
    list(): Student[] {
        return readDb<Student>(DB);
    }

    get(id: string): Student | undefined {
        return this.list().find(s => s.id === id);
    }

    create(req: CreateStudentRequest): Student {
        const students = this.list();
        if (students.some(s => s.cpf === req.cpf)) {
            throw new Error('CPF já cadastrado');
        }
        const student: Student = { id: uuid(), ...req, createdAt: new Date().toISOString() };
        writeDb(DB, [...students, student]);
        return student;
    }

    update(id: string, req: UpdateStudentRequest): Student {
        const students = this.list();
        const idx = students.findIndex(s => s.id === id);
        if (idx === -1) throw new Error(`Aluno ${id} não encontrado`);
        if (req.cpf && students.some(s => s.cpf === req.cpf && s.id !== id)) {
            throw new Error('CPF já cadastrado');
        }
        const updated = { ...students[idx], ...req };
        students[idx] = updated;
        writeDb(DB, students);
        return updated;
    }

    delete(id: string): boolean {
        const students = this.list();
        const next = students.filter(s => s.id !== id);
        if (next.length === students.length) return false;
        writeDb(DB, next);
        return true;
    }
}

export const studentService = new StudentService();
