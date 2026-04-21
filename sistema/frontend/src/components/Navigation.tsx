import { Link, useLocation } from 'react-router-dom';

export function Navigation() {
  const { pathname } = useLocation();
  const link = (to: string, label: string) => (
    <li>
      <Link to={to} style={{ color: pathname === to ? '#3498db' : '#ecf0f1', borderBottom: pathname === to ? '2px solid #3498db' : 'none', paddingBottom: 6, textDecoration: 'none', fontWeight: 500 }}>
        {label}
      </Link>
    </li>
  );
  return (
    <nav style={{ background: '#2c3e50', padding: '0 24px', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 2px 4px rgba(0,0,0,.15)' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 56 }}>
        <span style={{ color: '#fff', fontWeight: 700, fontSize: 18 }}>Sistema de Avaliações</span>
        <ul style={{ display: 'flex', listStyle: 'none', gap: 32 }}>
          {link('/', 'Alunos')}
          {link('/classes', 'Turmas')}
          {link('/evaluations', 'Avaliações')}
        </ul>
      </div>
    </nav>
  );
}
