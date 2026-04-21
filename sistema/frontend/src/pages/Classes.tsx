import { useState, useEffect } from 'react';
import './Classes.css';
import { API } from '../lib/api';

interface Student {
    id: string;
    name: string;
    cpf: string;
    email: string;
}

interface Class {
    id: string;
    description: string;
    year: number;
    semester: 1 | 2;
    studentIds: string[];
}

export function Classes() {
    const [classes,  setClasses]  = useState<Class[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [loading,  setLoading]  = useState(true);
    const [error,    setError]    = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showForm, setShowForm] = useState(false);

    // create form
    const [desc,     setDesc]     = useState('');
    const [year,     setYear]     = useState(new Date().getFullYear());
    const [semester, setSemester] = useState<1 | 2>(1);

    // edit state
    const [editingId,    setEditingId]    = useState<string | null>(null);
    const [editDesc,     setEditDesc]     = useState('');
    const [editYear,     setEditYear]     = useState(0);
    const [editSemester, setEditSemester] = useState<1 | 2>(1);

    // student association panel
    const [managingId, setManagingId] = useState<string | null>(null);

    useEffect(() => {
        Promise.all([loadClasses(), loadStudents()]);
    }, []);

    async function loadClasses() {
        try {
            setLoading(true);
            const res = await fetch(`${API}/classes`);
            if (!res.ok) throw new Error(`Erro ${res.status}`);
            setClasses(await res.json());
        } catch (e) {
            setError((e as Error).message);
        } finally {
            setLoading(false);
        }
    }

    async function loadStudents() {
        try {
            const res = await fetch(`${API}/students`);
            if (res.ok) setStudents(await res.json());
        } catch { /* silencia — alunos são opcionais neste momento */ }
    }

    async function handleCreate() {
        if (!desc.trim()) { setError('Informe a descrição da turma'); return; }
        try {
            setIsSubmitting(true);
            setError(null);
            const res = await fetch(`${API}/classes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ description: desc.trim(), year, semester }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error ?? 'Erro ao criar turma');
            setClasses(prev => [...prev, data]);
            setDesc(''); setYear(new Date().getFullYear()); setSemester(1);
            setShowForm(false);
        } catch (e) {
            setError((e as Error).message);
        } finally {
            setIsSubmitting(false);
        }
    }

    function startEdit(c: Class) {
        setEditingId(c.id);
        setEditDesc(c.description);
        setEditYear(c.year);
        setEditSemester(c.semester);
        setShowForm(false);
        setManagingId(null);
    }

    function cancelEdit() {
        setEditingId(null);
    }

    async function handleSave(id: string) {
        if (!editDesc.trim()) { setError('Informe a descrição'); return; }
        try {
            setIsSubmitting(true);
            setError(null);
            const res = await fetch(`${API}/classes/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ description: editDesc.trim(), year: editYear, semester: editSemester }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error ?? 'Erro ao salvar');
            setClasses(prev => prev.map(c => c.id === id ? data : c));
            cancelEdit();
        } catch (e) {
            setError((e as Error).message);
        } finally {
            setIsSubmitting(false);
        }
    }

    async function handleDelete(id: string) {
        if (!window.confirm('Excluir esta turma? As avaliações associadas também serão removidas.')) return;
        try {
            setError(null);
            const res = await fetch(`${API}/classes/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Erro ao excluir');
            setClasses(prev => prev.filter(c => c.id !== id));
            if (managingId === id) setManagingId(null);
        } catch (e) {
            setError((e as Error).message);
        }
    }

    async function handleAddStudent(classId: string, studentId: string) {
        try {
            setError(null);
            const res = await fetch(`${API}/classes/${classId}/students`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ studentId }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error ?? 'Erro ao adicionar aluno');
            setClasses(prev => prev.map(c => c.id === classId ? data : c));
        } catch (e) {
            setError((e as Error).message);
        }
    }

    async function handleRemoveStudent(classId: string, studentId: string) {
        try {
            setError(null);
            const res = await fetch(`${API}/classes/${classId}/students/${studentId}`, { method: 'DELETE' });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error ?? 'Erro ao remover aluno');
            setClasses(prev => prev.map(c => c.id === classId ? data : c));
        } catch (e) {
            setError((e as Error).message);
        }
    }

    function studentName(id: string) {
        return students.find(s => s.id === id)?.name ?? id;
    }

    function availableStudents(cls: Class) {
        return students.filter(s => !cls.studentIds.includes(s.id));
    }

    return (
        <div className="page">
            <div className="page-header">
                <h1>
                    Turmas
                    {!loading && <span className="badge">{classes.length}</span>}
                </h1>
                <button
                    className="btn btn-primary"
                    onClick={() => { setShowForm(f => !f); cancelEdit(); setManagingId(null); }}
                    disabled={loading}
                >
                    {showForm ? 'Cancelar' : '+ Nova Turma'}
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
                    <h3 className="form-title">Nova Turma</h3>
                    <div className="form-row">
                        <div className="form-group form-group--wide">
                            <label>Descrição *</label>
                            <input value={desc} onChange={e => setDesc(e.target.value)} placeholder="Ex: Engenharia de Software 2025.1" disabled={isSubmitting} />
                        </div>
                        <div className="form-group">
                            <label>Ano *</label>
                            <input type="number" value={year} onChange={e => setYear(Number(e.target.value))} min={2000} max={2100} disabled={isSubmitting} />
                        </div>
                        <div className="form-group">
                            <label>Semestre *</label>
                            <select value={semester} onChange={e => setSemester(Number(e.target.value) as 1 | 2)} disabled={isSubmitting}>
                                <option value={1}>1º semestre</option>
                                <option value={2}>2º semestre</option>
                            </select>
                        </div>
                    </div>
                    <button className="btn btn-success" onClick={handleCreate} disabled={isSubmitting}>
                        {isSubmitting ? 'Salvando...' : 'Salvar'}
                    </button>
                </div>
            )}

            {loading ? (
                <p className="loading">Carregando...</p>
            ) : classes.length === 0 ? (
                <div className="empty-state">Nenhuma turma cadastrada. Comece criando a primeira!</div>
            ) : (
                <div className="list">
                    {classes.map(cls => (
                        <div key={cls.id} className={`card ${editingId === cls.id ? 'card--editing' : ''}`}>

                            {editingId === cls.id ? (
                                <>
                                    <div className="form-row">
                                        <div className="form-group form-group--wide">
                                            <label>Descrição *</label>
                                            <input value={editDesc} onChange={e => setEditDesc(e.target.value)} disabled={isSubmitting} />
                                        </div>
                                        <div className="form-group">
                                            <label>Ano *</label>
                                            <input type="number" value={editYear} onChange={e => setEditYear(Number(e.target.value))} min={2000} max={2100} disabled={isSubmitting} />
                                        </div>
                                        <div className="form-group">
                                            <label>Semestre *</label>
                                            <select value={editSemester} onChange={e => setEditSemester(Number(e.target.value) as 1 | 2)} disabled={isSubmitting}>
                                                <option value={1}>1º semestre</option>
                                                <option value={2}>2º semestre</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="card-actions">
                                        <button className="btn btn-success btn-sm" onClick={() => handleSave(cls.id)} disabled={isSubmitting}>
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
                                        <p className="class-name">{cls.description}</p>
                                        <p className="class-meta">
                                            {cls.year} · {cls.semester}º semestre
                                            <span className="sep">·</span>
                                            <span className="student-count">
                                                {cls.studentIds.length} aluno{cls.studentIds.length !== 1 ? 's' : ''}
                                            </span>
                                        </p>
                                    </div>
                                    <div className="card-actions">
                                        <button
                                            className={`btn btn-sm ${managingId === cls.id ? 'btn-info-active' : 'btn-info'}`}
                                            onClick={() => setManagingId(managingId === cls.id ? null : cls.id)}
                                        >
                                            {managingId === cls.id ? 'Fechar' : 'Alunos'}
                                        </button>
                                        <button className="btn btn-secondary btn-sm" onClick={() => startEdit(cls)}>Editar</button>
                                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(cls.id)}>Excluir</button>
                                    </div>
                                </>
                            )}

                            {/* Student management panel */}
                            {managingId === cls.id && editingId !== cls.id && (
                                <div className="students-panel">
                                    <div className="students-panel-section">
                                        <h4>Alunos matriculados</h4>
                                        {cls.studentIds.length === 0 ? (
                                            <p className="panel-empty">Nenhum aluno matriculado</p>
                                        ) : (
                                            <ul className="enrolled-list">
                                                {cls.studentIds.map(sid => (
                                                    <li key={sid}>
                                                        <span>{studentName(sid)}</span>
                                                        <button
                                                            className="btn btn-danger btn-xs"
                                                            onClick={() => handleRemoveStudent(cls.id, sid)}
                                                        >
                                                            Remover
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>

                                    {availableStudents(cls).length > 0 && (
                                        <div className="students-panel-section">
                                            <h4>Adicionar aluno</h4>
                                            <div className="add-student-row">
                                                <select
                                                    defaultValue=""
                                                    onChange={e => { if (e.target.value) handleAddStudent(cls.id, e.target.value); e.target.value = ''; }}
                                                >
                                                    <option value="" disabled>Selecione um aluno...</option>
                                                    {availableStudents(cls).map(s => (
                                                        <option key={s.id} value={s.id}>{s.name} — {s.cpf}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    )}

                                    {students.length === 0 && (
                                        <p className="panel-empty">Cadastre alunos na aba <strong>Alunos</strong> primeiro.</p>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
