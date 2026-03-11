import { useState } from 'react';
import { X, Mail, Github, Twitter } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import styles from './LoginModal.module.css';

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const LoginModal = ({ isOpen, onClose }: LoginModalProps) => {
    const { login, register } = useAuth();
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            if (isSignUp) {
                await register(email, password);
            } else {
                await login(email, password);
            }
            setEmail('');
            setPassword('');
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <button className={styles.closeBtn} onClick={onClose}>
                    <X size={20} />
                </button>

                <h2 className={styles.title}>
                    {isSignUp ? 'Create your account' : 'Log in to Polymarket'}
                </h2>
                <p className={styles.subtitle}>
                    {isSignUp ? 'Start trading on predictions.' : 'Welcome back! Please enter your details.'}
                </p>

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

                {error && <div className={styles.error}>{error}</div>}

                <form className={styles.form} onSubmit={handleSubmit}>
                    <div className={styles.inputGroup}>
                        <label>Email</label>
                        <div className={styles.inputWrapper}>
                            <Mail size={18} className={styles.inputIcon} />
                            <input
                                type="email"
                                placeholder="Enter your email"
                                required
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className={styles.inputGroup}>
                        <label>Password</label>
                        <div className={styles.inputWrapper}>
                            <input
                                type="password"
                                placeholder="••••••••"
                                required
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <button type="submit" className={styles.submitBtn} disabled={loading}>
                        {loading ? 'Please wait...' : isSignUp ? 'Sign up' : 'Log in'}
                    </button>
                </form>

                <p className={styles.footer}>
                    {isSignUp ? (
                        <>Already have an account? <a href="#" onClick={e => { e.preventDefault(); setIsSignUp(false); setError(''); }}>Log in</a></>
                    ) : (
                        <>Don't have an account? <a href="#" onClick={e => { e.preventDefault(); setIsSignUp(true); setError(''); }}>Sign up</a></>
                    )}
                </p>
            </div>
        </div>
    );
};

export default LoginModal;
