import { Link, NavLink } from 'react-router-dom'

function Navbar() {
  return (
    <header className="site-header">
      <nav className="navbar">
        <Link to="/" className="brand" aria-label="Creatorverse home">
          <span className="brand-mark">CV</span>
          <span>Creatorverse</span>
        </Link>

        <div className="nav-links">
          <NavLink to="/" className={({ isActive }) => (isActive ? 'active' : '')}>
            Creators
          </NavLink>
          <NavLink to="/new" className="button button-small">
            Add Creator
          </NavLink>
        </div>
      </nav>
    </header>
  )
}

export default Navbar
