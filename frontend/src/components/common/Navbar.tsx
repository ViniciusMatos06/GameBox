import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Plus, LogOut, Settings } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import GlobalSearch from '../game/GlobalSearch';
import { UserAvatar } from './States';
import './Navbar.css';

const NAV_ITEMS = [
  { num: '01', label: 'Início', to: '/home' },
  { num: '02', label: 'Explorar', to: '/explore' },
  { num: '03', label: 'Listas', to: '/lists' },
  { num: '04', label: 'Amigos', to: '/people' },
];

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  if (['/login', '/register', '/forgot-password'].includes(pathname)) return null;

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <>
      <header className="navbar">
        <Link to={isAuthenticated ? '/home' : '/'} className="navbar-brand">
          <Plus size={20} strokeWidth={3} />
          <span>GAME<span className="navbar-brand-accent">BOX</span></span>
        </Link>

        {isAuthenticated ? (
          <>
            <nav className="navbar-links">
              {NAV_ITEMS.map((item) => (
                <NavLink key={item.to} to={item.to} className="navbar-link">
                  <span className="navbar-link-num">{item.num}</span> {item.label}
                </NavLink>
              ))}
              <NavLink to={`/profile/${user?.username}`} className="navbar-link">
                <span className="navbar-link-num">05</span> Perfil
              </NavLink>
            </nav>
            <div className="navbar-right">
              <GlobalSearch />
              <NavLink to="/settings" className="navbar-icon-btn" title="Configurações"><Settings size={17} /></NavLink>
              <button className="navbar-icon-btn" onClick={handleLogout} title="Sair"><LogOut size={17} /></button>
              {user && (
                <Link to={`/profile/${user.username}`}>
                  <UserAvatar src={user.avatarUrl} alt={user.username} size={34} />
                </Link>
              )}
            </div>
          </>
        ) : (
          <nav className="navbar-right">
            <Link to="/login" className="navbar-link">Entrar</Link>
            <Link to="/register" className="navbar-cta">Criar conta</Link>
          </nav>
        )}
      </header>

      {isAuthenticated && (
        <nav className="mobile-nav">
          <NavLink to="/home" className="mobile-nav-link" end>01</NavLink>
          <NavLink to="/explore" className="mobile-nav-link">02</NavLink>
          <NavLink to="/lists" className="mobile-nav-link">03</NavLink>
          <NavLink to="/people" className="mobile-nav-link">04</NavLink>
          <NavLink to={`/profile/${user?.username}`} className="mobile-nav-link">05</NavLink>
        </nav>
      )}
    </>
  );
}
