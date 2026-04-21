import { Given, When, Then } from '@cucumber/cucumber';
import assert from 'assert';
import { classService } from '../../backend/src/services/classService';
import { studentService } from '../../backend/src/services/studentService';
import { evaluationService } from '../../backend/src/services/evaluationService';
import type { Class, Student, Evaluation, EvaluationGoal, EvaluationValue } from '../../backend/src/types/index';

let currentClass: Class;
let currentStudent: Student;
let currentEvaluation: Evaluation;

Given('que existe uma turma com um aluno', () => {
    currentClass = classService.create({ description: 'Turma Eval', year: 2025, semester: 1 });
    currentStudent = studentService.create({ name: 'Aluno Eval', cpf: '111.111.111-11', email: 'eval@x.com' });
    currentClass = classService.addStudent(currentClass.id, currentStudent.id);
});

When('eu registrar avaliação {string} com valor {string} para o aluno', (goal: EvaluationGoal, value: EvaluationValue) => {
    currentEvaluation = evaluationService.upsert(currentClass.id, { studentId: currentStudent.id, goal, value });
});

Then('a avaliação deve aparecer na listagem da turma', () => {
    const evals = evaluationService.listByClass(currentClass.id);
    assert.ok(evals.some(e => e.id === currentEvaluation.id));
});

Given('que o aluno tem avaliação {string} com valor {string}', (goal: EvaluationGoal, value: EvaluationValue) => {
    currentClass = classService.create({ description: 'Turma Upd', year: 2025, semester: 1 });
    currentStudent = studentService.create({ name: 'Aluno Upd', cpf: '222.222.222-22', email: 'upd@x.com' });
    classService.addStudent(currentClass.id, currentStudent.id);
    currentEvaluation = evaluationService.upsert(currentClass.id, { studentId: currentStudent.id, goal, value });
});

When('eu atualizar a avaliação {string} para {string}', (goal: EvaluationGoal, value: EvaluationValue) => {
    currentEvaluation = evaluationService.upsert(currentClass.id, { studentId: currentStudent.id, goal, value });
});

Then('a avaliação deve ter o novo valor {string}', (value: EvaluationValue) => {
    assert.strictEqual(currentEvaluation.value, value);
});

When('eu registrar {string} como {string} e {string} como {string}', (g1: EvaluationGoal, v1: EvaluationValue, g2: EvaluationGoal, v2: EvaluationValue) => {
    evaluationService.upsert(currentClass.id, { studentId: currentStudent.id, goal: g1, value: v1 });
    evaluationService.upsert(currentClass.id, { studentId: currentStudent.id, goal: g2, value: v2 });
});

Then('a turma deve ter {int} avaliações para o aluno', (count: number) => {
    const evals = evaluationService.listByClass(currentClass.id).filter(e => e.studentId === currentStudent.id);
    assert.strictEqual(evals.length, count);
});
