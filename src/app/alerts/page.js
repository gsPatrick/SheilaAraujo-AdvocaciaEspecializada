'use client';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import Header from '@/components/layout/Header/Header';
import Card from '@/components/Card/Card';
import styles from './page.module.css';
import {
    Bell, CheckCircle, ExternalLink, User,
    Gavel, Calendar, Archive, Clock
} from 'lucide-react';
import Link from 'next/link';

export default function AlertsPage() {
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const limit = 20;

    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const socketRef = useRef();

    useEffect(() => {
        fetchAlerts(page);

        socketRef.current = io('https://geral-sheila-api.r954jc.easypanel.host');
        socketRef.current.on('ti_publication_alert', (newAlert) => {
            // Only prepend if on first page to avoid confusion
            if (page === 1) {
                setAlerts(prev => [newAlert, ...prev]);
            }
        });

        return () => socketRef.current.disconnect();
    }, [page]);

    const fetchAlerts = async (pageNumber) => {
        try {
            setLoading(true);
            const response = await axios.get('https://geral-sheila-api.r954jc.easypanel.host/api/ti/alerts', {
                params: { page: pageNumber, limit }
            });
            setAlerts(response.data.rows || []);
            setTotalPages(Math.ceil(response.data.count / limit));
        } catch (error) {
            console.error('Erro ao buscar alertas:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleImportHistory = () => {
        alert("🗓️ Como Importar Histórico Antigo:\n\nA API do Tramitação Inteligente envia alertas em tempo real. Para buscar publicações antigas:\n\n1. Acesse o Painel do Tramitação Inteligente.\n2. Vá em 'Configurações' ou 'Webhooks'.\n3. Solicite o 'Reenvio de Webhooks' selecionando o período desejado.\n\nO sistema processará automaticamente assim que receber!");
    };

    const markAsRead = async (id) => {
        try {
            await axios.put(`https://geral-sheila-api.r954jc.easypanel.host/api/ti/alerts/${id}/read`);
            setAlerts(prev => prev.map(a => a.id === id ? { ...a, isRead: true } : a));
        } catch (error) {
            console.error('Erro ao marcar como lido:', error);
        }
    };

    return (
        <div className={styles.container}>
            <Header title="Alertas de Publicações Judiciais" />

            <div className={styles.content}>
                <div className={styles.topActions}>
                    <div className={styles.summary}>
                        <Bell size={20} />
                        <span>{alerts.filter(a => !a.isRead).length} Alertas nesta página</span>
                    </div>
                    <button onClick={handleImportHistory} className={styles.importBtn}>
                        <Archive size={16} />
                        Importar Histórico
                    </button>
                </div>

                <div className={styles.alertList}>
                    {loading ? (
                        <div className={styles.loading}>Carregando alertas...</div>
                    ) : alerts.length > 0 ? (
                        <>
                            {alerts.map((alert) => (
                                <div key={alert.id} className={`${styles.alertItem} ${alert.isRead ? styles.read : ''}`}>
                                    <div className={styles.alertIcon}>
                                        <Gavel size={20} />
                                    </div>

                                    <div className={styles.alertBody}>
                                        <div className={styles.alertHeader}>
                                            <h3>{alert.title}</h3>
                                            <div className={styles.alertMeta}>
                                                <Calendar size={14} />
                                                <span>{new Date(alert.createdAt).toLocaleDateString('pt-BR')}</span>
                                                <Clock size={14} />
                                                <span>{new Date(alert.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                        </div>

                                        <div className={styles.alertProcess}>
                                            <strong>Processo:</strong> {alert.processNumber || 'N/A'}
                                        </div>

                                        <p className={styles.alertSnippet}>
                                            {alert.body?.substring(0, 300)}...
                                        </p>

                                        <div className={styles.alertFooter}>
                                            {alert.Chat && (
                                                <Link href={`/contacts/${alert.ChatId}`} className={styles.associatedUser}>
                                                    <User size={14} />
                                                    <span>Ver Cliente: {alert.Chat.contactName}</span>
                                                </Link>
                                            )}
                                            <div className={styles.actions}>
                                                {!alert.isRead && (
                                                    <button onClick={() => markAsRead(alert.id)} className={styles.readBtn}>
                                                        <CheckCircle size={14} />
                                                        Marcar como Lido
                                                    </button>
                                                )}
                                                {alert.link && (
                                                    <a href={alert.link} target="_blank" className={styles.linkBtn}>
                                                        <ExternalLink size={14} />
                                                        Ver Publicação Completa
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* Pagination Controls */}
                            {totalPages > 1 && (
                                <div className={styles.pagination}>
                                    <button
                                        disabled={page === 1}
                                        onClick={() => setPage(p => p - 1)}
                                    >
                                        Anterior
                                    </button>
                                    <span>Página {page} de {totalPages}</span>
                                    <button
                                        disabled={page === totalPages}
                                        onClick={() => setPage(p => p + 1)}
                                    >
                                        Próxima
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className={styles.emptyState}>
                            <Archive size={48} />
                            <h3>Nenhum alerta recebido</h3>
                            <p>As publicações judiciais aparecerão aqui.</p>
                            <button onClick={handleImportHistory} className={styles.linkBtn}>
                                Como importar antigas?
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
