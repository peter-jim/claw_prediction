import { Link } from 'react-router-dom';
import { Home, TrendingUp, DollarSign, Globe2, Cpu, Trophy, Film } from 'lucide-react';
import styles from './Sidebar.module.css';

interface SidebarProps {
    className?: string;
}

const CATEGORIES = [
    { id: 'home', path: '/', label: 'Home', icon: Home, active: true },
    { id: 'trending', path: '/', label: 'Trending', icon: TrendingUp },
    { id: 'crypto', path: '/', label: 'Crypto', icon: DollarSign },
    { id: 'politics', path: '/', label: 'Politics', icon: Globe2 },
    { id: 'tech', path: '/', label: 'Tech', icon: Cpu },
    { id: 'sports', path: '/', label: 'Sports', icon: Trophy },
    { id: 'pop', path: '/', label: 'Pop Culture', icon: Film },
];

const Sidebar = ({ className }: SidebarProps) => {
    return (
        <aside className={`${styles.sidebar} ${className || ''}`}>
            <div className={styles.section}>
                <div className={styles.menuList}>
                    {CATEGORIES.map((cat) => {
                        const Icon = cat.icon;
                        return (
                            <Link
                                key={cat.id}
                                to={cat.path}
                                className={`${styles.menuItem} ${cat.active ? styles.active : ''}`}
                                style={{ textDecoration: 'none' }}
                            >
                                <Icon size={18} className={styles.icon} />
                                <span>{cat.label}</span>
                            </Link>
                        );
                    })}
                </div>
            </div>

            <div className={styles.divider}></div>

            <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Elections</h3>
                <div className={styles.menuList}>
                    <a href="#president" className={styles.menuItem}>Presidential Election</a>
                    <a href="#senate" className={styles.menuItem}>Senate Races</a>
                    <a href="#house" className={styles.menuItem}>House Races</a>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
