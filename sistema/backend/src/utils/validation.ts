const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(email: string): void {
    if (!EMAIL_REGEX.test(email)) {
        throw new Error(`Email inválido: "${email}"`);
    }
}

export function requireFields(obj: Record<string, unknown>, fields: string[]): void {
    const missing = fields.filter(f => {
        const v = obj[f];
        return v === undefined || v === null || String(v).trim() === '';
    });
    if (missing.length > 0) {
        throw new Error(`Campos obrigatórios ausentes: ${missing.join(', ')}`);
    }
}
