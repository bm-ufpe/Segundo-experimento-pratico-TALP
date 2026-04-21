import { Given, When, Then, Before } from '@cucumber/cucumber';
import assert from 'assert';
import { classService } from '../../backend/src/services/classService';
import { studentService } from '../../backend/src/services/studentService';
import type { Class, Student } from '../../backend/src/types/index';

let currentClass: Class;
let currentStudent: Student;
let thrownError: Error | null = null;

Before(() => { thrownError = null; });

When('eu criar uma turma com descrição {string}, ano {int} e semestre {int}', (description: string, year: number, semester: 1 | 2) => {
    currentClass = classService.create({ description, year, semester });
});

Then('a turma deve ser retornada com id gerado e sem alunos', () => {
    assert.ok(currentClass.id);
    assert.deepStrictEqual(currentClass.studentIds, []);
});

Given('que existe uma turma e um aluno cadastrados', () => {
    currentClass = classService.create({ description: 'Turma Teste', year: 2025, semester: 1 });
    currentStudent = studentService.create({ name: 'Aluno Turma', cpf: '999.999.999-99', email: 'at@x.com' });
});

When('eu adicionar o aluno à turma', () => {
    currentClass = classService.addStudent(currentClass.id, currentStudent.id);
});

Then('a turma deve listar o aluno', () => {
    assert.ok(currentClass.studentIds.includes(currentStudent.id));
});

Given('que um aluno já está em uma turma', () => {
    currentClass = classService.create({ description: 'Turma Dup', year: 2025, semester: 2 });
    currentStudent = studentService.create({ name: 'Aluno Dup', cpf: '888.888.888-88', email: 'dup@x.com' });
    currentClass = classService.addStudent(currentClass.id, currentStudent.id);
});

When('eu tentar adicioná-lo novamente', () => {
    try { classService.addStudent(currentClass.id, currentStudent.id); }
    catch (e) { thrownError = e as Error; }
});

Then('deve retornar erro de aluno já cadastrado', () => {
    assert.ok(thrownError?.message.includes('já está'), thrownError?.message);
});

Given('que um aluno está em uma turma', () => {
    currentClass = classService.create({ description: 'Turma Rem', year: 2025, semester: 1 });
    currentStudent = studentService.create({ name: 'Aluno Rem', cpf: '777.777.777-77', email: 'rem@x.com' });
    currentClass = classService.addStudent(currentClass.id, currentStudent.id);
});

When('eu remover o aluno da turma', () => {
    currentClass = classService.removeStudent(currentClass.id, currentStudent.id);
});

Then('a turma não deve mais listar o aluno', () => {
    assert.ok(!currentClass.studentIds.includes(currentStudent.id));
});
