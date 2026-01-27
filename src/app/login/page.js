'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import styles from './page.module.css';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const router = useRouter();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await axios.post('https://geral-sheila-api.r954jc.easypanel.host/api/auth/login', {
                email,
                password
            });

            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));

            setIsTransitioning(true);
            setTimeout(() => {
                router.push('/dashboard');
            }, 800);
        } catch (err) {
            setError(err.response?.data?.error || 'Falha na autenticação');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`${styles.container} ${isTransitioning ? styles.fadeOut : ''}`}>
            {/* Left Panel - Visual/Brand */}
            <div className={styles.visualPanel}>
                <div className={styles.brandOverlay}>
                    <h1 className={styles.largeLogo}>CAROL<span>IA</span></h1>
                    <div className={styles.divider} />
                    <p className={styles.brandSlogan}>Assistência de Inteligência Jurídica Especializada</p>
                </div>
            </div>

            {/* Right Panel - Form */}
            <div className={styles.formPanel}>
                <div className={styles.formWrapper}>
                    <div className={styles.header}>
                        <h2 className={styles.title}>Bem-vinda, Carol</h2>
                        <p className={styles.subtitle}>Acesse o painel operacional para gerenciar seus protocolos.</p>
                    </div>

                    <form className={styles.form} onSubmit={handleLogin}>
                        <div className={styles.inputGroup}>
                            <label>Identificação de Operador</label>
                            <input
                                type="email"
                                placeholder="identificacao@carol.ia"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label>Chave de Acesso</label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        {error && <p className={styles.error}>{error}</p>}

                        <button type="submit" className={styles.submit} disabled={loading || isTransitioning}>
                            {loading ? 'Validando Biometria Digital...' : 'Iniciar Sessão'}
                        </button>
                    </form>

                    <footer className={styles.footer}>
                        <p>© 2026 ASSISTENTE CAROL IA. Todos os direitos reservados.</p>
                    </footer>
                </div>
            </div>
        </div>
    );
}
