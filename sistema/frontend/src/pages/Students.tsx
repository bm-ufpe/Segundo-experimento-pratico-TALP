import { useState, useEffect } from 'react';
import './Students.css';
import { API } from '../lib/api';

interface Student {
    id: string;
    name: string;
    cpf: string;
    email: string;
}

export function Students() {
    const [students, setStudents]   = useState<Student[]>([]);
    const [loading, setLoading]     = useState(true);
    const [error, setError]         = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showForm, setShowForm]   = useState(false);

    // create form
    const [name,  setName]  = useState('');
    const [cpf,   setCpf]   = useState('');
    const [email, setEmail] = useState('');

    // edit state
    const [editingId,    setEditingId]    = useState<string | null>(null);
    const [editName,     setEditName]     = useState('');
    const [editCpf,      setEditCpf]      = useState('');
    const [editEmail,    setEditEmail]    = useState('');

    useEffect(() => { load(); }, []);

    async function load() {
        try {
            setLoading(true);
            setError(null);
            const res = await fetch(`${API}/students`);
            if (!res.ok) throw new Error(`Erro ${res.status}`);
            setStudents(await res.json());
        } catch (e) {
            setError((e as Error).message);
        } finally {
            setLoading(false);
        }
    }

    async function handleCreate() {
        if (!name.trim() || !cpf.trim() || !email.trim()) {
            setError('Preencha todos os campos');
            return;
        }
        try {
            setIsSubmitting(true);
            setError(null);
            const res = await fetch(`${API}/students`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: name.trim(), cpf: cpf.trim(), email: email.trim() }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error ?? 'Erro ao criar aluno');
            setStudents(prev => [...prev, data]);
            setName(''); setCpf(''); setEmail('');
            setShowForm(false);
        } catch (e) {
            setError((e as Error).message);
        } finally {
            setIsSubmitting(false);
        }
    }

    function startEdit(s: Student) {
        setEditingId(s.id);
        setEditName(s.name);
        setEditCpf(s.cpf);
        setEditEmail(s.email);
        setShowForm(false);
    }

    function cancelEdit() {
        setEditingId(null);
        setEditName(''); setEditCpf(''); setEditEmail('');
    }

    async function handleSave(id: string) {
        if (!editName.trim() || !editCpf.trim() || !editEmail.trim()) {
            setError('Preencha todos os campos');
            return;
        }
        try {
            setIsSubmitting(true);
            setError(null);
            const res = await fetch(`${API}/students/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: editName.trim(), cpf: editCpf.trim(), email: editEmail.trim() }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error ?? 'Erro ao salvar');
            setStudents(prev => prev.map(s => s.id === id ? data : s));
            cancelEdit();
        } catch (e) {
            setError((e as Error).message);
        } finally {
            setIsSubmitting(false);
        }
    }

    async function handleDelete(id: string) {
        if (!window.confirm('Excluir este aluno?')) return;
        try {
            setError(null);
            const res = await fetch(`${API}/students/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Erro ao excluir');
            setStudents(prev => prev.filter(s => s.id !== id));
        } catch (e) {
            setError((e as Error).message);
        }
    }

    return (
        <div className="page">
            <div className="page-header">
                <h1>
                    Alunos
                    {!loading && <span className="badge">{students.length}</span>}
                </h1>
                <button
                    className="btn btn-primary"
                    onClick={() => { setShowForm(f => !f); cancelEdit(); }}
                    disabled={loading}
                >
                    {showForm ? 'Cancelar' : '+ Novo Aluno'}
                </button>
            </div>

            {error && (
                <div className="alert alert-error">
                    {error}
                    <button className="close-btn" onClick={() => setError(null)}>✕</button>
                </div>
            )}

            {showForm && (
                <div className="form-card">
                    <h3 className="form-title">Novo Aluno</h3>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Nome *</label>
                            <input value={name} onChange={e => setName(e.target.value)} placeholder="Nome completo" disabled={isSubmitting} />
                        </div>
                        <div className="form-group">
                            <label>CPF *</label>
                            <input value={cpf} onChange={e => setCpf(e.target.value)} placeholder="000.000.000-00" disabled={isSubmitting} />
                        </div>
                        <div className="form-group">
                            <label>Email *</label>
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="aluno@email.com" disabled={isSubmitting} />
                        </div>
                    </div>
                    <button className="btn btn-success" onClick={handleCreate} disabled={isSubmitting}>
                        {isSubmitting ? 'Salvando...' : 'Salvar'}
                    </button>
                </div>
            )}

            {loading ? (
                <p className="loading">Carregando...</p>
            ) : students.length === 0 ? (
                <div className="empty-state">Nenhum aluno cadastrado. Comece adicionando o primeiro!</div>
            ) : (
                <div className="list">
                    {students.map(s => (
                        <div key={s.id} className={`card ${editingId === s.id ? 'card--editing' : ''}`}>
                            {editingId === s.id ? (
                                <>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Nome *</label>
                                            <input value={editName} onChange={e => setEditName(e.target.value)} disabled={isSubmitting} />
                                        </div>
                                        <div className="form-group">
                                            <label>CPF *</label>
                                            <input value={editCpf} onChange={e => setEditCpf(e.target.value)} disabled={isSubmitting} />
                                        </div>
                                        <div className="form-group">
                                            <label>Email *</label>
                                            <input type="email" value={editEmail} onChange={e => setEditEmail(e.target.value)} disabled={isSubmitting} />
                                        </div>
                                    </div>
                                    <div className="card-actions">
                                        <button className="btn btn-success btn-sm" onClick={() => handleSave(s.id)} disabled={isSubmitting}>
                                            {isSubmitting ? 'Salvando...' : 'Salvar'}
                                        </button>
                                        <button className="btn btn-secondary btn-sm" onClick={cancelEdit} disabled={isSubmitting}>
                                            Cancelar
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="card-info">
                                        <p className="student-name">{s.name}</p>
                                        <p className="student-meta">
                                            <span>{s.cpf}</span>
                                            <span className="sep">·</span>
                                            <span>{s.email}</span>
                                        </p>
                                    </div>
                                    <div className="card-actions">
                                        <button className="btn btn-secondary btn-sm" onClick={() => startEdit(s)}>Editar</button>
                                        <button className="btn btn-danger btn-sm"    onClick={() => handleDelete(s.id)}>Excluir</button>
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
