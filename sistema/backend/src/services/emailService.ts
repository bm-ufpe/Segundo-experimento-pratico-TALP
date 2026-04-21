import nodemailer from 'nodemailer';
import { Resend } from 'resend';
import { readDb, writeDb } from '../data/db';
import { studentService } from './studentService';
import { classService } from './classService';
import type { EmailLogEntry, EvaluationGoal, EvaluationValue } from '../types/index';

const DB = 'emailLog';

function today(): string {
    return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

async function sendEmail(to: string, subject: string, text: string): Promise<void> {
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;
    const from = SMTP_FROM ?? 'sistema@provas.local';

    // Use Resend HTTP API when configured — Railway blocks outbound SMTP ports
    if (SMTP_HOST?.includes('resend.com') && SMTP_PASS) {
        const resend = new Resend(SMTP_PASS);
        await resend.emails.send({ from, to, subject, text });
        return;
    }

    // Nodemailer fallback (local dev or non-blocked SMTP)
    const transporter = (SMTP_HOST && SMTP_USER && SMTP_PASS)
        ? nodemailer.createTransport({ host: SMTP_HOST, port: Number(SMTP_PORT ?? 587), auth: { user: SMTP_USER, pass: SMTP_PASS } })
        : nodemailer.createTransport({ jsonTransport: true });

    await transporter.sendMail({ from, to, subject, text });
}

class EmailService {
    /**
     * Register an evaluation change for a student.
     * Each (classId, goal) pair keeps only the latest value; duplicate entries are replaced.
     * Sending is attempted immediately but skipped if an email was already sent today.
     */
    queueChange(studentId: string, classId: string, goal: EvaluationGoal, value: EvaluationValue): void {
        const log = readDb<EmailLogEntry>(DB);
        const idx = log.findIndex(e => e.studentId === studentId);
        const change = { classId, goal, value, changedAt: new Date().toISOString() };

        if (idx === -1) {
            log.push({ studentId, lastSentDate: '', pendingChanges: [change] });
        } else {
            // Replace existing entry for the same (classId, goal) pair with the newest value
            log[idx].pendingChanges = log[idx].pendingChanges.filter(
                c => !(c.classId === classId && c.goal === goal)
            );
            log[idx].pendingChanges.push(change);
        }

        writeDb(DB, log);
        this.flushIfNeeded(studentId);
    }

    // Send a consolidated email if no email has been sent today yet for this student.
    // State update (lastSentDate + clear pendingChanges) is synchronous so callers
    // see a consistent log immediately. The actual SMTP delivery is fire-and-forget.
    private flushIfNeeded(studentId: string): void {
        const log = readDb<EmailLogEntry>(DB);
        const idx = log.findIndex(e => e.studentId === studentId);
        if (idx === -1 || log[idx].pendingChanges.length === 0) return;
        if (log[idx].lastSentDate === today()) return; // 1-per-day rule

        const student = studentService.get(studentId);
        if (!student) return;

        // Group pending changes by class for a structured email body
        const changes = log[idx].pendingChanges;
        const byClass = new Map<string, typeof changes>();
        for (const c of changes) {
            if (!byClass.has(c.classId)) byClass.set(c.classId, []);
            byClass.get(c.classId)!.push(c);
        }

        const sections = [...byClass.entries()].map(([cid, cls]) => {
            const info   = classService.get(cid);
            const header = info ? `[${info.description} — ${info.year}/${info.semester}º sem.]` : `[Turma ${cid}]`;
            const lines  = cls.map(c => `  • ${c.goal}: ${c.value}`).join('\n');
            return `${header}\n${lines}`;
        }).join('\n\n');

        const body = `Olá, ${student.name}!\n\nSuas avaliações foram atualizadas:\n\n${sections}\n\nAtenciosamente,\nSistema de Avaliações`;

        // Optimistically mark as sent to prevent concurrent duplicate sends
        const pendingSnapshot = [...log[idx].pendingChanges];
        log[idx].lastSentDate = today();
        log[idx].pendingChanges = [];
        writeDb(DB, log);

        sendEmail(student.email, 'Suas avaliações foram atualizadas', body)
        .then(() => {
            console.log(`[email] Enviado para ${student.email}`);
        }).catch((err: Error) => {
            console.error('[email] Falha ao enviar:', err);
            const current = readDb<EmailLogEntry>(DB);
            const i = current.findIndex(e => e.studentId === studentId);
            if (i !== -1) {
                current[i].lastSentDate = '';
                current[i].pendingChanges = [...pendingSnapshot, ...current[i].pendingChanges];
                writeDb(DB, current);
            }
        });
    }
}

export const emailService = new EmailService();
