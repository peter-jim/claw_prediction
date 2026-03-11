import { Link, useSearchParams } from 'react-router-dom';
import { Home, TrendingUp, DollarSign, Globe2, Cpu, Trophy, Film, BarChart2 } from 'lucide-react';
import styles from './Sidebar.module.css';

interface SidebarProps {
    className?: string;
}

const CATEGORIES = [
    { id: 'all', path: '/', label: 'Home', icon: Home, category: '' },
    { id: 'trending', path: '/?sort=trending', label: 'Trending', icon: TrendingUp, category: 'trending' },
    { id: 'Crypto', path: '/?category=Crypto', label: 'Crypto', icon: DollarSign, category: 'Crypto' },
    { id: 'Politics', path: '/?category=Politics', label: 'Politics', icon: Globe2, category: 'Politics' },
    { id: 'Tech', path: '/?category=Tech', label: 'Tech', icon: Cpu, category: 'Tech' },
    { id: 'Sports', path: '/?category=Sports', label: 'Sports', icon: Trophy, category: 'Sports' },
    { id: 'Pop Culture', path: '/?category=Pop+Culture', label: 'Pop Culture', icon: Film, category: 'Pop Culture' },
    { id: 'Economy', path: '/?category=Economy', label: 'Economy', icon: BarChart2, category: 'Economy' },
];

const Sidebar = ({ className }: SidebarProps) => {
    const [searchParams] = useSearchParams();
    const currentCategory = searchParams.get('category') || '';
    const currentSort = searchParams.get('sort') || '';

    const isActive = (cat: typeof CATEGORIES[0]) => {
        if (cat.id === 'all') return !currentCategory && !currentSort;
        if (cat.id === 'trending') return currentSort === 'trending';
        return currentCategory === cat.category;
    };

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
                                className={`${styles.menuItem} ${isActive(cat) ? styles.active : ''}`}
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
                    <Link to="/?category=Politics" className={styles.menuItem}>Presidential Election</Link>
                    <Link to="/?category=Politics" className={styles.menuItem}>Senate Races</Link>
                    <Link to="/?category=Politics" className={styles.menuItem}>House Races</Link>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;

