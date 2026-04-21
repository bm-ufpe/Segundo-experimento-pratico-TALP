import { useState, useEffect } from 'react';
import './Evaluations.css';
import { API } from '../lib/api';

interface Student { id: string; name: string; cpf: string; email: string; }
interface Class   { id: string; description: string; year: number; semester: 1 | 2; studentIds: string[]; }
interface Evaluation { id: string; classId: string; studentId: string; goal: string; value: string; }

type EvaluationValue = 'MANA' | 'MPA' | 'MA';
type EvaluationGoal  = 'Requisitos' | 'Testes' | 'Implementação' | 'Documentação';

const GOALS: EvaluationGoal[] = ['Requisitos', 'Testes', 'Implementação', 'Documentação'];
const VALUES: EvaluationValue[] = ['MANA', 'MPA', 'MA'];

export function Evaluations() {
    const [classes,     setClasses]     = useState<Class[]>([]);
    const [students,    setStudents]    = useState<Student[]>([]);
    const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
    const [selectedId,  setSelectedId]  = useState<string>('');
    const [loading,     setLoading]     = useState(false);
    const [saving,      setSaving]      = useState<string | null>(null); // "studentId:goal"
    const [error,       setError]       = useState<string | null>(null);

    useEffect(() => {
        Promise.all([
            fetch(`${API}/classes`).then(r => r.json()).then(setClasses).catch(() => {}),
            fetch(`${API}/students`).then(r => r.json()).then(setStudents).catch(() => {}),
        ]);
    }, []);

    useEffect(() => {
        if (!selectedId) { setEvaluations([]); return; }
        setLoading(true);
        setError(null);
        fetch(`${API}/classes/${selectedId}/evaluations`)
            .then(r => r.json())
            .then(setEvaluations)
            .catch(e => setError(e.message))
            .finally(() => setLoading(false));
    }, [selectedId]);

    async function handleChange(studentId: string, goal: EvaluationGoal, value: string) {
        const key = `${studentId}:${goal}`;
        setSaving(key);
        setError(null);
        try {
            const res = await fetch(`${API}/classes/${selectedId}/evaluations`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ studentId, goal, value: value as EvaluationValue }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error ?? 'Erro ao salvar');
            setEvaluations(prev => {
                const idx = prev.findIndex(e => e.studentId === studentId && e.goal === goal);
                return idx === -1 ? [...prev, data] : prev.map((e, i) => i === idx ? data : e);
            });
        } catch (e) {
            setError((e as Error).message);
        } finally {
            setSaving(null);
        }
    }

    function cellValue(studentId: string, goal: EvaluationGoal): string {
        return evaluations.find(e => e.studentId === studentId && e.goal === goal)?.value ?? '';
    }

    const selectedClass = classes.find(c => c.id === selectedId);
    const enrolledStudents = selectedClass
        ? students.filter(s => selectedClass.studentIds.includes(s.id))
        : [];

    return (
        <div className="page">
            <div className="page-header">
                <h1>Avaliações</h1>
            </div>

            {error && (
                <div className="alert alert-error">
                    {error}
                    <button className="close-btn" onClick={() => setError(null)}>✕</button>
                </div>
            )}

            <div className="class-selector">
                <label className="selector-label">Turma</label>
                <select
                    value={selectedId}
                    onChange={e => setSelectedId(e.target.value)}
                    className="selector-select"
                >
                    <option value="">Selecione uma turma...</option>
                    {classes.map(c => (
                        <option key={c.id} value={c.id}>
                            {c.description} — {c.year}/{c.semester}º sem.
                        </option>
                    ))}
                </select>
            </div>

            {!selectedId && (
                <div className="empty-state">Selecione uma turma para gerenciar as avaliações.</div>
            )}

            {selectedId && loading && (
                <p className="loading">Carregando...</p>
            )}

            {selectedId && !loading && enrolledStudents.length === 0 && (
                <div className="empty-state">
                    Nenhum aluno matriculado nesta turma. Adicione alunos na aba <strong>Turmas</strong>.
                </div>
            )}

            {selectedId && !loading && enrolledStudents.length > 0 && (
                <div className="table-wrapper">
                    <table className="eval-table">
                        <thead>
                            <tr>
                                <th className="th-student">Aluno</th>
                                {GOALS.map(g => <th key={g} className="th-goal">{g}</th>)}
                            </tr>
                        </thead>
                        <tbody>
                            {enrolledStudents.map(s => (
                                <tr key={s.id}>
                                    <td className="td-student">
                                        <span className="student-name">{s.name}</span>
                                        <span className="student-cpf">{s.cpf}</span>
                                    </td>
                                    {GOALS.map(goal => {
                                        const key  = `${s.id}:${goal}`;
                                        const val  = cellValue(s.id, goal);
                                        const busy = saving === key;
                                        return (
                                            <td key={goal} className={`td-cell ${val ? `cell-${val}` : 'cell-empty'}`}>
                                                <select
                                                    value={val}
                                                    disabled={busy}
                                                    onChange={e => handleChange(s.id, goal, e.target.value)}
                                                    className="cell-select"
                                                >
                                                    <option value="">—</option>
                                                    {VALUES.map(v => <option key={v} value={v}>{v}</option>)}
                                                </select>
                                                {busy && <span className="cell-spinner">⟳</span>}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
