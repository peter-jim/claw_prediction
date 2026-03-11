import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Search, ChevronDown, User, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import LoginModal from '../LoginModal/LoginModal';
import styles from './Navbar.module.css';

const Navbar = () => {
    const { user, logout } = useAuth();
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [searchParams] = useSearchParams();
    const [searchValue, setSearchValue] = useState(searchParams.get('search') || '');
    const navigate = useNavigate();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchValue.trim()) {
            navigate(`/?search=${encodeURIComponent(searchValue.trim())}`);
        } else {
            navigate('/');
        }
    };

    return (
        <>
            <nav className={styles.navbar}>
                <div className={styles.left}>
                    <Link to="/" className={styles.logoLink} style={{ textDecoration: 'none' }}>
                        <div className={styles.logo}>
                            <div className={styles.logoIcon}></div>
                            <span className={styles.logoText}>Polymarket</span>
                        </div>
                    </Link>

                    <div className={styles.navLinks}>
                        <Link to="/" className={styles.navItem}>
                            Markets <ChevronDown size={14} />
                        </Link>
                        <Link to="/portfolio" className={styles.navItem}>Portfolio</Link>
                    </div>
                </div>

                <div className={styles.center}>
                    <form className={styles.searchContainer} onSubmit={handleSearch}>
                        <Search size={18} className={styles.searchIcon} />
                        <input
                            type="text"
                            placeholder="Search markets, event, or people"
                            className={styles.searchInput}
                            value={searchValue}
                            onChange={e => setSearchValue(e.target.value)}
                        />
                    </form>
                </div>

                <div className={styles.right}>
                    {user ? (
                        <>
                            <span className={styles.balance}>${user.balance.toFixed(2)}</span>
                            <span className={styles.userEmail}>{user.email}</span>
                            <button className={styles.profileBtn} onClick={logout} title="Log out">
                                <LogOut size={18} />
                            </button>
                        </>
                    ) : (
                        <>
                            <button className={styles.loginBtn} onClick={() => setIsLoginOpen(true)}>
                                Login / Sign Up
                            </button>
                            <button className={styles.profileBtn} onClick={() => setIsLoginOpen(true)}>
                                <User size={18} />
                            </button>
                        </>
                    )}
                </div>
            </nav>

            <LoginModal
                isOpen={isLoginOpen}
                onClose={() => setIsLoginOpen(false)}
            />
        </>
    );
};

export default Navbar;
