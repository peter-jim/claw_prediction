import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ChevronDown, User, LogOut, Wallet } from 'lucide-react';
import LoginModal from '../LoginModal/LoginModal';
import { useAuth } from '../../context/AuthContext';
import styles from './Navbar.module.css';

const Navbar = () => {
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const { isAuthenticated, user, logout } = useAuth();
    const navigate = useNavigate();

    const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            const q = (e.target as HTMLInputElement).value.trim();
            if (q) navigate(`/?q=${encodeURIComponent(q)}`);
            else navigate('/');
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
                        <Link to="/activity" className={styles.navItem}>Activity</Link>
                    </div>
                </div>

                <div className={styles.center}>
                    <div className={styles.searchContainer}>
                        <Search size={18} className={styles.searchIcon} />
                        <input
                            type="text"
                            placeholder="Search markets, event, or people"
                            className={styles.searchInput}
                            onKeyDown={handleSearchKeyDown}
                        />
                    </div>
                </div>

                <div className={styles.right}>
                    {isAuthenticated && user ? (
                        <div className={styles.userSection}>
                            <div className={styles.balanceBadge}>
                                <Wallet size={14} />
                                <span>${user.balance.toFixed(2)}</span>
                            </div>
                            <div className={styles.userMenuWrapper}>
                                <button
                                    className={styles.profileBtn}
                                    onClick={() => setShowUserMenu(v => !v)}
                                >
                                    <User size={18} />
                                    <span className={styles.userName}>{user.name}</span>
                                    <ChevronDown size={14} />
                                </button>
                                {showUserMenu && (
                                    <div className={styles.userMenu} onClick={() => setShowUserMenu(false)}>
                                        <div className={styles.userMenuEmail}>{user.email}</div>
                                        <Link to="/portfolio" className={styles.userMenuItem}>
                                            <Wallet size={16} /> Portfolio
                                        </Link>
                                        <button
                                            className={`${styles.userMenuItem} ${styles.logoutBtn}`}
                                            onClick={logout}
                                        >
                                            <LogOut size={16} /> Log out
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
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

