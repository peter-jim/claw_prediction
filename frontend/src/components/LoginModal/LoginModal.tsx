import { X, Mail, Github, Twitter } from 'lucide-react';
import styles from './LoginModal.module.css';

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const LoginModal = ({ isOpen, onClose }: LoginModalProps) => {
    if (!isOpen) return null;

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <button className={styles.closeBtn} onClick={onClose}>
                    <X size={20} />
                </button>

                <h2 className={styles.title}>Log in to Polymarket</h2>
                <p className={styles.subtitle}>Welcome back! Please enter your details.</p>

                <div className={styles.socialLogins}>
                    <button className={styles.socialBtn}>
                        <Github size={18} /> Continue with GitHub
                    </button>
                    <button className={styles.socialBtn}>
                        <Twitter size={18} /> Continue with X
                    </button>
                </div>

                <div className={styles.divider}>
                    <span>or</span>
                </div>

                <form className={styles.form} onSubmit={e => { e.preventDefault(); onClose(); }}>
                    <div className={styles.inputGroup}>
                        <label>Email</label>
                        <div className={styles.inputWrapper}>
                            <Mail size={18} className={styles.inputIcon} />
                            <input type="email" placeholder="Enter your email" required />
                        </div>
                    </div>

                    <div className={styles.inputGroup}>
                        <label>Password</label>
                        <div className={styles.inputWrapper}>
                            <input type="password" placeholder="••••••••" required />
                        </div>
                    </div>

                    <button type="submit" className={styles.submitBtn}>
                        Log in
                    </button>
                </form>

                <p className={styles.footer}>
                    Don't have an account? <a href="#">Sign up</a>
                </p>
            </div>
        </div>
    );
};

export default LoginModal;
