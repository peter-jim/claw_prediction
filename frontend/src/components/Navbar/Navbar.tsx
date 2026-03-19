import { Link, useNavigate } from 'react-router-dom';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Search, TrendingUp, Menu, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useNetwork } from '../../contexts/NetworkContext';
import styles from './Navbar.module.css';

interface NavbarProps {
    onMenuClick?: () => void;
}

const NETWORKS = [
    { id: 'hardhat', label: 'Hardhat Testnet', icon: '🔨', enabled: true },
    { id: 'sepolia', label: 'Sepolia Testnet', icon: '🧪', enabled: true },
    { id: 'mainnet', label: 'Ethereum Mainnet', icon: '💎', enabled: false, tag: 'Coming Soon' },
];

const Navbar = ({ onMenuClick }: NavbarProps) => {
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();
    const { currentNetwork, setNetwork } = useNetwork();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setSearchQuery(query);
        if (query.trim()) {
            navigate(`/?search=${encodeURIComponent(query.trim())}`);
        } else {
            navigate('/');
        }
    };

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const activeNetwork = NETWORKS.find(n => n.id === currentNetwork) || NETWORKS[0];

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
                    <span>Claw Prediction</span>
                </Link>
                <div className={styles.navLinks}>
                    <Link to="/" className={styles.navItem}>Markets</Link>
                    <Link to="/portfolio" className={styles.navItem}>Portfolio</Link>
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
                <div className={styles.networkDropdown} ref={dropdownRef}>
                    <button 
                        className={styles.networkBtn}
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    >
                        <span className={styles.networkIcon}>{activeNetwork.icon}</span>
                        <span className={styles.networkLabel}>{activeNetwork.label}</span>
                        <ChevronDown size={14} className={`${styles.chevron} ${isDropdownOpen ? styles.chevronOpen : ''}`} />
                    </button>
                    {isDropdownOpen && (
                        <div className={styles.dropdownMenu}>
                            <div className={styles.dropdownHeader}>Select Network</div>
                            {NETWORKS.map((net) => (
                                <button
                                    key={net.id}
                                    className={`${styles.dropdownItem} ${net.id === currentNetwork ? styles.dropdownActive : ''} ${!net.enabled ? styles.dropdownDisabled : ''}`}
                                    onClick={() => {
                                        if (net.enabled) {
                                            setNetwork(net.id);
                                            setIsDropdownOpen(false);
                                        }
                                    }}
                                    disabled={!net.enabled}
                                >
                                    <span className={styles.dropdownItemIcon}>{net.icon}</span>
                                    <span className={styles.dropdownItemLabel}>{net.label}</span>
                                    {net.tag && <span className={styles.dropdownTag}>{net.tag}</span>}
                                    {net.id === currentNetwork && <span className={styles.activeDot} />}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
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
