import { Link, useLocation } from 'react-router-dom';
import './Navigation.css';

export function Navigation() {
  const { pathname } = useLocation();
  const link = (to: string, label: string) => (
    <li>
      <Link to={to} className={`nav-link${pathname === to ? ' nav-link--active' : ''}`}>
        {label}
      </Link>
    </li>
  );
  return (
    <nav className="nav">
      <div className="nav-inner">
        <span className="nav-title">Sistema de Avaliações</span>
        <ul className="nav-list">
          {link('/', 'Alunos')}
          {link('/classes', 'Turmas')}
          {link('/evaluations', 'Avaliações')}
        </ul>
      </div>
    </nav>
  );
}
