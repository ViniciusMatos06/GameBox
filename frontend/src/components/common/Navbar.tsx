import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Gamepad2, Compass, ListChecks, User, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import GlobalSearch from '../game/GlobalSearch';
import { UserAvatar } from './States';
import './Navbar.css';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <>
      <header className="navbar">
        <Link to={isAuthenticated ? '/home' : '/'} className="navbar-brand">
          <Gamepad2 size={22} />
          <span>GameBox</span>
        </Link>

        {isAuthenticated && <GlobalSearch />}

        <nav className="navbar-links">
          {isAuthenticated ? (
            <>
              <NavLink to="/explore" className="navbar-link">
                <Compass size={17} /> Explorar
              </NavLink>
              <NavLink to="/lists" className="navbar-link">
                <ListChecks size={17} /> Listas
              </NavLink>
              <NavLink to={`/profile/${user?.username}`} className="navbar-link">
                <User size={17} /> Perfil
              </NavLink>
              <NavLink to="/settings" className="navbar-link" title="Configurações">
                <Settings size={17} />
              </NavLink>
              <button className="navbar-link navbar-logout" onClick={handleLogout} title="Sair">
                <LogOut size={17} />
              </button>
              {user && (
                <Link to={`/profile/${user.username}`}>
                  <UserAvatar src={user.avatarUrl} alt={user.username} size={32} />
                </Link>
              )}
            </>
          ) : (
            <>
              <Link to="/login" className="navbar-link">
                Entrar
              </Link>
              <Link to="/register" className="navbar-cta">
                Criar conta
              </Link>
            </>
          )}
        </nav>
      </header>

      {isAuthenticated && (
        <nav className="mobile-nav">
          <NavLink to="/home" className="mobile-nav-link" end>
            <Gamepad2 size={20} />
          </NavLink>
          <NavLink to="/explore" className="mobile-nav-link">
            <Compass size={20} />
          </NavLink>
          <NavLink to="/lists" className="mobile-nav-link">
            <ListChecks size={20} />
          </NavLink>
          <NavLink to={`/profile/${user?.username}`} className="mobile-nav-link">
            <User size={20} />
          </NavLink>
          <NavLink to="/settings" className="mobile-nav-link">
            <Settings size={20} />
          </NavLink>
        </nav>
      )}
    </>
  );
}
