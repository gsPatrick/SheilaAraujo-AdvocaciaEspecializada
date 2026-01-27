'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Header from '@/components/layout/Header/Header';
import Card from '@/components/Card/Card';
import styles from './page.module.css';
import { Trash2, Plus, ShieldAlert, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { useMobile } from '@/hooks/useMobile';

export default function BlacklistPage() {
    const isMobile = useMobile();
    const [blacklist, setBlacklist] = useState([]);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [contactName, setContactName] = useState('');
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const delaySearch = setTimeout(() => {
            fetchBlacklist();
        }, 300);
        return () => clearTimeout(delaySearch);
    }, [search, page]);

    const fetchBlacklist = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`https://geral-sheila-api.r954jc.easypanel.host/api/blacklist`, {
                params: { search, page, limit: 8 }
            });
            setBlacklist(response.data.data);
            setTotalPages(response.data.pages);
        } catch (error) {
            console.error('Erro ao buscar lista de bloqueio:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!phoneNumber) return;
        try {
            await axios.post('https://geral-sheila-api.r954jc.easypanel.host/api/blacklist', { phoneNumber, contactName });
            setPhoneNumber('');
            setContactName('');
            setPage(1);
            fetchBlacklist();
        } catch (error) {
            console.error('Erro ao adicionar à lista:', error);
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`https://geral-sheila-api.r954jc.easypanel.host/api/blacklist/${id}`);
            fetchBlacklist();
        } catch (error) {
            console.error('Erro ao remover da lista:', error);
        }
    };

    return (
        <div className={styles.container}>
            {!isMobile && <Header title="Lista de Bloqueio" />}

            <div className={styles.content}>
                <div className={styles.grid}>
                    <div className={styles.formCol}>
                        <Card title="Restringir Contato" subtitle="Adicione números à lista de bloqueio automático.">
                            <form onSubmit={handleAdd} className={styles.form}>
                                <div className={styles.inputGroup}>
                                    <label>Identificação Legal (Nome Opcional)</label>
                                    <input
                                        type="text"
                                        placeholder="Ex: Fulano de Tal"
                                        value={contactName}
                                        onChange={(e) => setContactName(e.target.value)}
                                    />
                                </div>
                                <div className={styles.inputGroup}>
                                    <label>Número do Telefone</label>
                                    <input
                                        type="text"
                                        placeholder="Ex: 5571982862912"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                        required
                                    />
                                </div>
                                <button type="submit" className={styles.addButton}>
                                    <Plus size={18} />
                                    Bloquear Contato
                                </button>
                            </form>
                        </Card>
                    </div>

                    <div className={styles.listCol}>
                        <div className={styles.listHeader}>
                            <div className={styles.searchBar}>
                                <Search size={18} className={styles.searchIcon} />
                                <input
                                    type="text"
                                    placeholder="Pesquisar por nome ou número..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                        </div>

                        <Card title="Números Sob Restrição">
                            <div className={styles.list}>
                                {loading ? (
                                    [1, 2, 3, 4].map(i => <div key={i} className="skeleton" style={{ height: '60px', marginBottom: '12px' }} />)
                                ) : blacklist.length > 0 ? (
                                    blacklist.map((item) => (
                                        <div key={item.id} className={styles.listItem}>
                                            <div className={styles.itemInfo}>
                                                <div className={styles.statusBadge}>
                                                    <ShieldAlert size={16} />
                                                </div>
                                                <div className={styles.itemMeta}>
                                                    <span className={styles.itemName}>{item.contactName || 'Contato sem nome'}</span>
                                                    <span className={styles.itemNumber}>{item.phoneNumber}</span>
                                                </div>
                                            </div>
                                            <button onClick={() => handleDelete(item.id)} className={styles.deleteButton} title="Remover restrição">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <p className={styles.empty}>Nenhuma restrição ativa encontrada.</p>
                                )}
                            </div>

                            {totalPages > 1 && (
                                <div className={styles.pagination}>
                                    <button
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                        className={styles.pageBtn}
                                    >
                                        <ChevronLeft size={18} />
                                    </button>
                                    <span className={styles.pageInfo}>Página {page} de {totalPages}</span>
                                    <button
                                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                        disabled={page === totalPages}
                                        className={styles.pageBtn}
                                    >
                                        <ChevronRight size={18} />
                                    </button>
                                </div>
                            )}
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
