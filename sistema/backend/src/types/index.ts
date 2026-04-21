export interface Student {
    id: string;
    name: string;
    cpf: string;
    email: string;
    createdAt: string;
}

export interface CreateStudentRequest {
    name: string;
    cpf: string;
    email: string;
}

export interface UpdateStudentRequest {
    name?: string;
    cpf?: string;
    email?: string;
}

// ----------------------------------------------------------------

export interface Class {
    id: string;
    description: string;
    year: number;
    semester: 1 | 2;
    studentIds: string[];
    createdAt: string;
}

export interface CreateClassRequest {
    description: string;
    year: number;
    semester: 1 | 2;
}

export interface UpdateClassRequest {
    description?: string;
    year?: number;
    semester?: 1 | 2;
}

// ----------------------------------------------------------------

export type EvaluationValue = 'MANA' | 'MPA' | 'MA';
export type EvaluationGoal = 'Requisitos' | 'Testes' | 'Implementação' | 'Documentação';

export interface Evaluation {
    id: string;
    classId: string;
    studentId: string;
    goal: EvaluationGoal;
    value: EvaluationValue;
    updatedAt: string;
}

export interface UpsertEvaluationRequest {
    studentId: string;
    goal: EvaluationGoal;
    value: EvaluationValue;
}

// ----------------------------------------------------------------

export interface EmailLogEntry {
    studentId: string;
    lastSentDate: string;        // YYYY-MM-DD — controls 1-email-per-day rule
    pendingChanges: Array<{
        classId: string;
        goal: EvaluationGoal;
        value: EvaluationValue;
        changedAt: string;
    }>;
}
