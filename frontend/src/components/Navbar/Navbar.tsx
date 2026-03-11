import { Link, useNavigate } from 'react-router-dom';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Search, TrendingUp, Menu } from 'lucide-react';
import { useState } from 'react';
import { useNetwork } from '../../contexts/NetworkContext';
import styles from './Navbar.module.css';

interface NavbarProps {
    onMenuClick?: () => void;
}

const Navbar = ({ onMenuClick }: NavbarProps) => {
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();
    const { isMockMode, toggleMockMode } = useNetwork();

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setSearchQuery(query);
        if (query.trim()) {
            navigate(`/?search=${encodeURIComponent(query.trim())}`);
        } else {
            navigate('/');
        }
    };

    return (
        <nav className={styles.navbar}>
            <div className={styles.left}>
                {onMenuClick && (
                    <button className={styles.mobileMenuBtn} onClick={onMenuClick} aria-label="Toggle menu">
                        <Menu size={24} />
                    </button>
                )}
                <Link to="/" className={styles.logo}>
                    <TrendingUp size={28} />
                    <span>Polymarket</span>
                </Link>
                <div className={styles.navLinks}>
                    <Link to="/" className={styles.navLink}>Markets</Link>
                    <Link to="/portfolio" className={styles.navLink}>Portfolio</Link>
                </div>
            </div>

            <div className={styles.searchContainer}>
                <Search size={18} className={styles.searchIcon} />
                <input
                    type="text"
                    placeholder="Search markets, event, or people"
                    className={styles.searchInput}
                    value={searchQuery}
                    onChange={handleSearch}
                />
            </div>

            <div className={styles.right}>
                <button 
                    onClick={toggleMockMode}
                    className={`${styles.mockToggle} ${isMockMode ? styles.mockActive : ''}`}
                >
                    {isMockMode ? 'Testnet' : 'Mainnet'}
                </button>
                <ConnectButton
                    showBalance={true}
                    chainStatus="icon"
                    accountStatus="address"
                />
            </div>
        </nav>
    );
};

export default Navbar;
