import { useState } from 'react';
import { X, Mail, Github, Twitter, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import styles from './LoginModal.module.css';

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const LoginModal = ({ isOpen, onClose }: LoginModalProps) => {
    const { login, register } = useAuth();
    const [mode, setMode] = useState<'login' | 'register'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleClose = () => {
        setEmail('');
        setPassword('');
        setName('');
        setError('');
        setMode('login');
        onClose();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            if (mode === 'login') {
                await login(email, password);
            } else {
                await register(email, password, name);
            }
            handleClose();
        } catch {
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSocialLogin = async (provider: string) => {
        setLoading(true);
        try {
            await login(`demo@${provider}.com`, 'demo');
            handleClose();
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.overlay} onClick={handleClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <button className={styles.closeBtn} onClick={handleClose}>
                    <X size={20} />
                </button>

                <h2 className={styles.title}>
                    {mode === 'login' ? 'Log in to Polymarket' : 'Create an account'}
                </h2>
                <p className={styles.subtitle}>
                    {mode === 'login' ? 'Welcome back! Please enter your details.' : 'Start predicting today.'}
                </p>

                <div className={styles.socialLogins}>
                    <button className={styles.socialBtn} onClick={() => handleSocialLogin('github')} disabled={loading}>
                        <Github size={18} /> Continue with GitHub
                    </button>
                    <button className={styles.socialBtn} onClick={() => handleSocialLogin('twitter')} disabled={loading}>
                        <Twitter size={18} /> Continue with X
                    </button>
                </div>

                <div className={styles.divider}>
                    <span>or</span>
                </div>

                {error && <p className={styles.errorMsg}>{error}</p>}

                <form className={styles.form} onSubmit={handleSubmit}>
                    {mode === 'register' && (
                        <div className={styles.inputGroup}>
                            <label>Name</label>
                            <div className={styles.inputWrapper}>
                                <User size={18} className={styles.inputIcon} />
                                <input
                                    type="text"
                                    placeholder="Your name"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                    )}

                    <div className={styles.inputGroup}>
                        <label>Email</label>
                        <div className={styles.inputWrapper}>
                            <Mail size={18} className={styles.inputIcon} />
                            <input
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className={styles.inputGroup}>
                        <label>Password</label>
                        <div className={styles.inputWrapper}>
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                                minLength={6}
                            />
                        </div>
                    </div>

                    <button type="submit" className={styles.submitBtn} disabled={loading}>
                        {loading ? 'Please wait...' : mode === 'login' ? 'Log in' : 'Create account'}
                    </button>
                </form>

                <p className={styles.footer}>
                    {mode === 'login' ? (
                        <>Don&apos;t have an account? <a href="#" onClick={e => { e.preventDefault(); setMode('register'); }}>Sign up</a></>
                    ) : (
                        <>Already have an account? <a href="#" onClick={e => { e.preventDefault(); setMode('login'); }}>Log in</a></>
                    )}
                </p>
            </div>
        </div>
    );
};

export default LoginModal;

