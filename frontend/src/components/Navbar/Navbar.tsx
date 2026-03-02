import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ChevronDown, User } from 'lucide-react';
import LoginModal from '../LoginModal/LoginModal';
import styles from './Navbar.module.css';

const Navbar = () => {
    const [isLoginOpen, setIsLoginOpen] = useState(false);

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
                        <a href="#" className={styles.navItem}>Activity</a>
                    </div>
                </div>

                <div className={styles.center}>
                    <div className={styles.searchContainer}>
                        <Search size={18} className={styles.searchIcon} />
                        <input
                            type="text"
                            placeholder="Search markets, event, or people"
                            className={styles.searchInput}
                        />
                    </div>
                </div>

                <div className={styles.right}>
                    <button className={styles.loginBtn} onClick={() => setIsLoginOpen(true)}>
                        Login / Sign Up
                    </button>
                    <button className={styles.profileBtn} onClick={() => setIsLoginOpen(true)}>
                        <User size={18} />
                    </button>
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
