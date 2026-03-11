import { useState } from 'react';
import type { ReactNode } from 'react';
import Navbar from '../Navbar/Navbar';
import Sidebar from '../Sidebar/Sidebar';
import styles from './Layout.module.css';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className={styles.layout}>
      <Navbar onMenuClick={() => setIsMobileMenuOpen(true)} />
      <div className={styles.mainContainer}>
        <Sidebar 
            className={`${styles.sidebar} ${isMobileMenuOpen ? styles.sidebarOpen : ''}`} 
            onClose={() => setIsMobileMenuOpen(false)} 
        />
        {isMobileMenuOpen && (
            <div className={styles.overlay} onClick={() => setIsMobileMenuOpen(false)}></div>
        )}
        <main className={styles.content}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
