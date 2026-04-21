import { Given, When, Then, Before } from '@cucumber/cucumber';
import assert from 'assert';
import { studentService } from '../../backend/src/services/studentService';
import type { Student } from '../../backend/src/types/index';

let createdStudent: Student;
let thrownError: Error | null = null;

Before(() => {
    // Reset in-memory state between scenarios
    thrownError = null;
});

Given('que não existe aluno com CPF {string}', (_cpf: string) => {
    // nothing to do — fresh db per test run
});

When('eu criar um aluno com nome {string}, CPF {string} e email {string}', (name: string, cpf: string, email: string) => {
    createdStudent = studentService.create({ name, cpf, email });
});

Then('o aluno deve ser retornado com um id gerado', () => {
    assert.ok(createdStudent.id, 'id deve existir');
});

Then('a lista de alunos deve conter {string}', (name: string) => {
    const found = studentService.list().some(s => s.name === name);
    assert.ok(found, `Aluno "${name}" não encontrado`);
});

Given('que já existe um aluno com CPF {string}', (cpf: string) => {
    studentService.create({ name: 'Existente', cpf, email: 'x@x.com' });
});

When('eu tentar criar outro aluno com CPF {string}', (cpf: string) => {
    try { studentService.create({ name: 'Novo', cpf, email: 'novo@x.com' }); }
    catch (e) { thrownError = e as Error; }
});

Then('deve retornar erro de CPF duplicado', () => {
    assert.ok(thrownError?.message.includes('CPF'), 'Deveria lançar erro de CPF');
});

Given('que existe um aluno cadastrado', () => {
    createdStudent = studentService.create({ name: 'Aluno Teste', cpf: '000.000.000-00', email: 'teste@x.com' });
});

When('eu atualizar o email do aluno', () => {
    createdStudent = studentService.update(createdStudent.id, { email: 'novo@x.com' });
});

Then('o aluno deve ter o novo email', () => {
    assert.strictEqual(createdStudent.email, 'novo@x.com');
});

When('eu excluir o aluno', () => {
    studentService.delete(createdStudent.id);
});

Then('ele não deve aparecer na listagem', () => {
    const found = studentService.list().some(s => s.id === createdStudent.id);
    assert.ok(!found, 'Aluno ainda aparece na listagem');
});
