import { Link, useSearchParams } from 'react-router-dom';
import { Home, TrendingUp, DollarSign, Globe2, Cpu, Trophy, Film } from 'lucide-react';
import styles from './Sidebar.module.css';

interface SidebarProps {
    className?: string;
}

const CATEGORIES = [
    { id: 'home', path: '/', label: 'Home', icon: Home },
    { id: 'trending', path: '/', label: 'Trending', icon: TrendingUp },
    { id: 'crypto', path: '/?category=crypto', label: 'Crypto', icon: DollarSign },
    { id: 'politics', path: '/?category=politics', label: 'Politics', icon: Globe2 },
    { id: 'tech', path: '/?category=tech', label: 'Tech', icon: Cpu },
    { id: 'sports', path: '/?category=sports', label: 'Sports', icon: Trophy },
    { id: 'pop culture', path: '/?category=pop+culture', label: 'Pop Culture', icon: Film },
];

const Sidebar = ({ className }: SidebarProps) => {
    const [searchParams] = useSearchParams();
    const activeCategory = searchParams.get('category')?.toLowerCase() || 'home';

    return (
        <aside className={`${styles.sidebar} ${className || ''}`}>
            <div className={styles.section}>
                <div className={styles.menuList}>
                    {CATEGORIES.map((cat) => {
                        const Icon = cat.icon;
                        const isActive = cat.id === activeCategory ||
                            (cat.id === 'home' && !searchParams.get('category') && !searchParams.get('search'));
                        return (
                            <Link
                                key={cat.id}
                                to={cat.path}
                                className={`${styles.menuItem} ${isActive ? styles.active : ''}`}
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
                    <Link to="/?category=politics" className={styles.menuItem} style={{ textDecoration: 'none' }}>Presidential Election</Link>
                    <Link to="/?category=politics" className={styles.menuItem} style={{ textDecoration: 'none' }}>Senate Races</Link>
                    <Link to="/?category=politics" className={styles.menuItem} style={{ textDecoration: 'none' }}>House Races</Link>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
