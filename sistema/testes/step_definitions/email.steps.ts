import { Given, When, Then } from '@cucumber/cucumber';
import assert from 'assert';
import { classService } from '../../backend/src/services/classService';
import { studentService } from '../../backend/src/services/studentService';
import { evaluationService } from '../../backend/src/services/evaluationService';
import { readDb, writeDb } from '../../backend/src/data/db';
import type { Class, Student, EmailLogEntry, EvaluationGoal, EvaluationValue } from '../../backend/src/types/index';

let currentStudent: Student;
let firstClass:  Class;
let secondClass: Class;

function today(): string { return new Date().toISOString().slice(0, 10); }

// ─── Setup ──────────────────────────────────────────────────────────────────

Given('que existe uma turma com um aluno matriculado para email', () => {
    firstClass     = classService.create({ description: 'Turma Email', year: 2025, semester: 1 });
    currentStudent = studentService.create({ name: 'Aluno Email', cpf: '100.100.100-10', email: 'email@x.com' });
    classService.addStudent(firstClass.id, currentStudent.id);
});

Given('que o aluno já recebeu email hoje', () => {
    const log = readDb<EmailLogEntry>('emailLog');
    const idx = log.findIndex(e => e.studentId === currentStudent.id);
    const entry = { studentId: currentStudent.id, lastSentDate: today(), pendingChanges: [] };
    if (idx === -1) log.push(entry);
    else { log[idx].lastSentDate = today(); log[idx].pendingChanges = []; }
    writeDb('emailLog', log);
});

Given('que o aluno está matriculado em duas turmas para email', () => {
    firstClass     = classService.create({ description: 'Turma Multi A', year: 2025, semester: 1 });
    secondClass    = classService.create({ description: 'Turma Multi B', year: 2025, semester: 2 });
    currentStudent = studentService.create({ name: 'Aluno Multi', cpf: '200.200.200-20', email: 'multi@x.com' });
    classService.addStudent(firstClass.id,  currentStudent.id);
    classService.addStudent(secondClass.id, currentStudent.id);
});

// ─── Actions ────────────────────────────────────────────────────────────────

When('eu registrar avaliação {string} com valor {string} nessa turma',
    (goal: string, value: string) => {
        evaluationService.upsert(firstClass.id, {
            studentId: currentStudent.id,
            goal:  goal  as EvaluationGoal,
            value: value as EvaluationValue,
        });
    }
);

When('eu registrar avaliação na primeira turma de email', () => {
    evaluationService.upsert(firstClass.id, {
        studentId: currentStudent.id,
        goal: 'Requisitos',
        value: 'MA',
    });
});

When('eu registrar avaliação na segunda turma de email', () => {
    evaluationService.upsert(secondClass.id, {
        studentId: currentStudent.id,
        goal: 'Testes',
        value: 'MPA',
    });
});

// ─── Assertions ─────────────────────────────────────────────────────────────

Then('o aluno deve ter o email marcado como enviado hoje', () => {
    const entry = readDb<EmailLogEntry>('emailLog').find(e => e.studentId === currentStudent.id);
    assert.ok(entry, 'Entrada não encontrada no emailLog');
    assert.strictEqual(entry!.lastSentDate, today(), 'lastSentDate deve ser hoje');
});

Then('o log deve acumular 1 mudança pendente para o aluno', () => {
    const entry = readDb<EmailLogEntry>('emailLog').find(e => e.studentId === currentStudent.id);
    assert.ok(entry, 'Entrada não encontrada no emailLog');
    assert.strictEqual(entry!.pendingChanges.length, 1, 'Deve ter exatamente 1 mudança pendente');
    assert.strictEqual(entry!.lastSentDate, today(), 'lastSentDate não deve mudar');
});

Then('o aluno deve ter 2 mudanças pendentes de turmas diferentes', () => {
    const entry = readDb<EmailLogEntry>('emailLog').find(e => e.studentId === currentStudent.id);
    assert.ok(entry, 'Entrada não encontrada no emailLog');
    assert.strictEqual(entry!.pendingChanges.length, 2, 'Deve ter 2 mudanças pendentes');
    const classIds = new Set(entry!.pendingChanges.map(c => c.classId));
    assert.strictEqual(classIds.size, 2, 'Cada mudança deve vir de uma turma diferente');
});
