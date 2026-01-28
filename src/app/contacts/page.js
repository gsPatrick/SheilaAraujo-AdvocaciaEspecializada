'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import Header from '@/components/layout/Header/Header';
import Card from '@/components/Card/Card';
import styles from './page.module.css';
import { Search, User, Phone, Mail, ChevronRight, UserPlus } from 'lucide-react';

export default function ContactsPage() {
    const [contacts, setContacts] = useState([]);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [syncStatus, setSyncStatus] = useState('');
    const [triageStatus, setTriageStatus] = useState('');
    const [syncing, setSyncing] = useState(false);

    useEffect(() => {
        const delaySearch = setTimeout(() => {
            fetchContacts();
        }, 300);
        return () => clearTimeout(delaySearch);
    }, [search, page, syncStatus, triageStatus]);

    const fetchContacts = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`https://geral-sheila-api.r954jc.easypanel.host/api/chats`, {
                params: { search, page, limit: 12, syncStatus, triageStatus }
            });
            setContacts(response.data.data);
            setTotalPages(response.data.pages);
        } catch (error) {
            console.error('Erro ao buscar contatos:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSyncAll = async () => {
        if (!confirm('Deseja importar todos os clientes do Portal TI agora? Isso pode levar alguns segundos.')) return;
        setSyncing(true);
        try {
            await axios.post('https://geral-sheila-api.r954jc.easypanel.host/api/ti/sync-all');
            alert('Sincronização em massa concluída com sucesso!');
            fetchContacts();
        } catch (error) {
            console.error('Erro na sincronização em massa:', error);
            alert('Erro ao sincronizar clientes. Verifique as configurações do TI.');
        } finally {
            setSyncing(false);
        }
    };

    return (
        <div className={styles.container}>
            <Header title="Diretório de Contatos" />

            <div className={styles.content}>
                <div className={styles.topBar}>
                    <div className={styles.searchContainer}>
                        <Search size={20} className={styles.searchIcon} />
                        <input
                            type="text"
                            placeholder="Buscar por nome, número, CPF ou e-mail..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <div className={styles.filters}>
                        <div className={styles.filterGroup}>
                            <label>Sincronia TI</label>
                            <select value={syncStatus} onChange={(e) => { setSyncStatus(e.target.value); setPage(1); }}>
                                <option value="">Tudo</option>
                                <option value="Sincronizado">Sincronizado</option>
                                <option value="Pendente">Pendente</option>
                            </select>
                        </div>
                        <div className={styles.filterGroup}>
                            <label>Status Triagem</label>
                            <select value={triageStatus} onChange={(e) => { setTriageStatus(e.target.value); setPage(1); }}>
                                <option value="">Tudo</option>
                                <option value="em_andamento">Em Andamento</option>
                                <option value="finalizada">Finalizada</option>
                                <option value="encerrada_etica">Encerrada (Ética)</option>
                            </select>
                        </div>
                        <button
                            className={styles.syncBtn}
                            onClick={handleSyncAll}
                            disabled={syncing}
                        >
                            <UserPlus size={18} />
                            {syncing ? 'Sincronizando...' : 'Importar tudo do TI'}
                        </button>
                    </div>
                </div>

                <div className={styles.grid}>
                    {loading ? (
                        [1, 2, 3, 4, 5, 6].map(i => <div key={i} className="skeleton" style={{ height: '180px', borderRadius: '12px' }} />)
                    ) : contacts.length > 0 ? (
                        contacts.map((contact) => (
                            <Link key={contact.id} href={`/contacts/${contact.id}`} className={styles.contactCardLink}>
                                <Card className={styles.contactCard}>
                                    <div className={styles.cardHeader}>
                                        <div className={styles.avatar}>
                                            {(contact.contactName || 'U').charAt(0).toUpperCase()}
                                        </div>
                                    </div>

                                    <div className={styles.cardBody}>
                                        <div className={styles.badges}>
                                            <span className={`${styles.badge} ${contact.syncStatus === 'Sincronizado' ? styles.synced : styles.pending}`}>
                                                {contact.syncStatus === 'Sincronizado' ? 'TI' : 'Local'}
                                            </span>
                                            {contact.triageStatus === 'finalizada' && (
                                                <span className={`${styles.badge} ${styles.finishedTriage}`}>Finalizada</span>
                                            )}
                                            {contact.triageStatus === 'em_andamento' && (
                                                <span className={`${styles.badge} ${styles.triageBadge}`}>Em Triagem</span>
                                            )}
                                        </div>
                                        <h3 className={styles.contactName}>{contact.contactName || 'Usuário Desconhecido'}</h3>
                                        <div className={styles.contactInfo}>
                                            <div className={styles.infoRow}>
                                                <Phone size={14} />
                                                <span>{contact.contactNumber}</span>
                                            </div>
                                            {contact.email && (
                                                <div className={styles.infoRow}>
                                                    <Mail size={14} />
                                                    <span>{contact.email}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className={styles.cardFooter}>
                                        <span>Ver dossiê completo</span>
                                        <ChevronRight size={16} />
                                    </div>
                                </Card>
                            </Link>
                        ))
                    ) : (
                        <div className={styles.empty}>
                            <UserPlus size={48} strokeWidth={1} />
                            <h3>Nenhum contato encontrado</h3>
                            <p>Tente ajustar sua busca para encontrar o que procura.</p>
                        </div>
                    )}
                </div>

                {totalPages > 1 && (
                    <div className={styles.pagination}>
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className={styles.pageBtn}
                        >
                            Voltar
                        </button>
                        <span className={styles.pageInfo}>Página {page} de {totalPages}</span>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className={styles.pageBtn}
                        >
                            Próxima
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
