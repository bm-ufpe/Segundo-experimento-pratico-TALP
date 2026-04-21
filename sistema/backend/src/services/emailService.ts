import nodemailer from 'nodemailer';
import { readDb, writeDb } from '../data/db';
import { studentService } from './studentService';
import type { EmailLogEntry, EvaluationGoal, EvaluationValue } from '../types/index';

const DB = 'emailLog';

function today(): string {
    return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

function createTransporter() {
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

    if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
        return nodemailer.createTransport({
            host: SMTP_HOST,
            port: Number(SMTP_PORT ?? 587),
            auth: { user: SMTP_USER, pass: SMTP_PASS },
        });
    }

    // Development fallback: logs to console instead of sending
    return nodemailer.createTransport({ jsonTransport: true });
}

class EmailService {
    // Add a pending change for the student. Actual sending is deferred.
    queueChange(studentId: string, goal: EvaluationGoal, value: EvaluationValue): void {
        const log = readDb<EmailLogEntry>(DB);
        const idx = log.findIndex(e => e.studentId === studentId);
        const change = { goal, value, changedAt: new Date().toISOString() };

        if (idx === -1) {
            log.push({ studentId, lastSentDate: '', pendingChanges: [change] });
        } else {
            // Replace duplicate goal entry with newest value
            log[idx].pendingChanges = log[idx].pendingChanges.filter(c => c.goal !== goal);
            log[idx].pendingChanges.push(change);
        }

        writeDb(DB, log);
        this.flushIfNeeded(studentId);
    }

    // Send consolidated email if not yet sent today
    private async flushIfNeeded(studentId: string): Promise<void> {
        const log = readDb<EmailLogEntry>(DB);
        const idx = log.findIndex(e => e.studentId === studentId);
        if (idx === -1 || log[idx].pendingChanges.length === 0) return;
        if (log[idx].lastSentDate === today()) return; // already sent today

        const student = studentService.get(studentId);
        if (!student) return;

        const changes = log[idx].pendingChanges;
        const lines = changes.map(c => `  • ${c.goal}: ${c.value}`).join('\n');
        const body = `Olá, ${student.name}!\n\nSuas avaliações foram atualizadas:\n\n${lines}\n\nAtenciosamente,\nSistema de Avaliações`;

        try {
            const transporter = createTransporter();
            const info = await transporter.sendMail({
                from: process.env.SMTP_FROM ?? 'sistema@provas.local',
                to: student.email,
                subject: 'Suas avaliações foram atualizadas',
                text: body,
            });
            console.log(`[email] Enviado para ${student.email}`, (info as any).message ?? '');
        } catch (err) {
            console.error('[email] Falha ao enviar:', err);
            return; // don't update log — will retry next change
        }

        log[idx].lastSentDate = today();
        log[idx].pendingChanges = [];
        writeDb(DB, log);
    }
}

export const emailService = new EmailService();
