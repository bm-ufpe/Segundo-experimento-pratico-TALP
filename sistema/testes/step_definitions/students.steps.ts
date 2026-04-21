import { Given, When, Then, DataTable } from '@cucumber/cucumber';
import assert from 'assert';
import { studentService } from '../../backend/src/services/studentService';
import type { Student } from '../../backend/src/types/index';

let currentStudent: Student;
let allStudents: Student[] | null = null;
let thrownError: Error | null = null;

// ─── Background ────────────────────────────────────────────────────────────

Given('que o sistema não possui alunos cadastrados', () => {
    allStudents = null;
    thrownError = null;
});

// ─── Listagem ───────────────────────────────────────────────────────────────

Given('que existem os seguintes alunos cadastrados:', (table: DataTable) => {
    for (const row of table.hashes()) {
        studentService.create({ name: row.nome, cpf: row.cpf, email: row.email });
    }
});

When('eu consultar a lista de alunos', () => {
    allStudents = studentService.list();
});

Then('devo ver {int} alunos na listagem', (count: number) => {
    assert.strictEqual((allStudents ?? studentService.list()).length, count);
});

Then('a listagem deve conter {string}', (name: string) => {
    const list = allStudents !== null ? allStudents : studentService.list();
    assert.ok(list.some(s => s.name === name), `"${name}" não encontrado na listagem`);
});

// ─── Cadastro ───────────────────────────────────────────────────────────────

When('eu cadastrar um aluno com nome {string}, CPF {string} e email {string}',
    (name: string, cpf: string, email: string) => {
        currentStudent = studentService.create({ name, cpf, email });
    }
);

Then('o aluno deve ser salvo com um id gerado', () => {
    assert.ok(currentStudent?.id, 'id deve existir');
});

// ─── Validações ─────────────────────────────────────────────────────────────

Given('que existe um aluno com CPF {string}', (cpf: string) => {
    studentService.create({ name: 'Existente', cpf, email: 'existente@x.com' });
});

When('eu tentar cadastrar outro aluno com o CPF {string}', (cpf: string) => {
    thrownError = null;
    try { studentService.create({ name: 'Novo', cpf, email: 'novo@x.com' }); }
    catch (e) { thrownError = e as Error; }
});

When('eu tentar cadastrar um aluno com email {string}', (email: string) => {
    thrownError = null;
    try { studentService.create({ name: 'Aluno', cpf: '555.555.555-55', email }); }
    catch (e) { thrownError = e as Error; }
});

When('eu tentar cadastrar um aluno sem informar o nome', () => {
    thrownError = null;
    try { studentService.create({ name: '', cpf: '666.666.666-66', email: 'ok@x.com' }); }
    catch (e) { thrownError = e as Error; }
});

Then('o sistema deve recusar com erro de {string}', (expectedMsg: string) => {
    assert.ok(thrownError, 'Deveria ter lançado um erro');
    assert.ok(
        thrownError!.message.includes(expectedMsg),
        `Esperado: "${expectedMsg}" | Recebido: "${thrownError!.message}"`
    );
});

// ─── Edição ─────────────────────────────────────────────────────────────────

Given('que existe um aluno cadastrado com email {string}', (email: string) => {
    currentStudent = studentService.create({ name: 'Aluno Edit', cpf: '777.777.777-77', email });
});

When('eu atualizar o email do aluno para {string}', (newEmail: string) => {
    currentStudent = studentService.update(currentStudent.id, { email: newEmail });
});

Then('o aluno deve ter o email {string}', (email: string) => {
    assert.strictEqual(currentStudent.email, email);
});

Then('o aluno deve permanecer na listagem', () => {
    const found = studentService.list().some(s => s.id === currentStudent.id);
    assert.ok(found, 'Aluno não encontrado na listagem após edição');
});

// ─── Exclusão ───────────────────────────────────────────────────────────────

Given('que existe um aluno cadastrado com nome {string}', (name: string) => {
    currentStudent = studentService.create({ name, cpf: '888.888.888-88', email: `${name.split(' ')[0].toLowerCase()}@x.com` });
});

When('eu excluir o aluno {string}', (_name: string) => {
    studentService.delete(currentStudent.id);
});

Then('ele não deve mais aparecer na listagem', () => {
    const found = studentService.list().some(s => s.id === currentStudent.id);
    assert.ok(!found, 'Aluno ainda aparece na listagem após exclusão');
});
