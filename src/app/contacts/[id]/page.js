'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/layout/Header/Header';
import Card from '@/components/Card/Card';
import styles from './page.module.css';
import {
    User, Phone, Mail, FileText, Calendar,
    CheckCircle2, AlertCircle, ArrowLeft, X, Search, UserPlus,
    Save, RefreshCw, Gavel, Bot, ExternalLink, ClipboardList, Bell, Lock
} from 'lucide-react';
import MiniChatFragment from './MiniChatFragment';

import { useMobile } from '@/hooks/useMobile';

export default function ContactDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const isMobile = useMobile();
    const [contact, setContact] = useState({});
    const [formData, setFormData] = useState({
        contactName: '',
        email: '',
        cpf: '',
        notes: '',
        area: '',
        hasLawyer: null,
        lawyerResponse: '',
        triageStatus: 'em_andamento',
        meu_inss_pass: '',
        mother_name: '',
        father_name: '',
        profession: '',
        marital_status: '',
        rg_numero: '',
        state: '',
        city: '',
        neighborhood: '',
        zipcode: '',
        street: '',
        street_number: '',
        sexo: '',
        birthdate: ''
    });
    const [activeTab, setActiveTab] = useState('chat');
    const [tiNotes, setTiNotes] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [tiTags, setTiTags] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const [searchCpf, setSearchCpf] = useState('');
    const [searchResults, setSearchResults] = useState(null);

    // Modal States
    const [noteModalOpen, setNoteModalOpen] = useState(false);
    const [editingNote, setEditingNote] = useState(null);
    const [noteContent, setNoteContent] = useState('');
    const [validationModalOpen, setValidationModalOpen] = useState(false);

    useEffect(() => {
        const fetchContact = async () => {
            try {
                const response = await axios.get(`https://geral-sheila-api.r954jc.easypanel.host/api/chats/${id}`);
                setContact(response.data);
                setFormData({
                    contactName: response.data.contactName || '',
                    email: response.data.email || '',
                    cpf: response.data.cpf || '',
                    notes: response.data.notes || '',
                    area: response.data.area || '',
                    hasLawyer: response.data.hasLawyer,
                    lawyerResponse: response.data.lawyerResponse || '',
                    triageStatus: response.data.triageStatus || 'em_andamento',
                    meu_inss_pass: response.data.meu_inss_pass || '',
                    mother_name: response.data.mother_name || '',
                    father_name: response.data.father_name || '',
                    profession: response.data.profession || '',
                    marital_status: response.data.marital_status || '',
                    rg_numero: response.data.rg_numero || '',
                    state: response.data.state || '',
                    city: response.data.city || '',
                    neighborhood: response.data.neighborhood || '',
                    zipcode: response.data.zipcode || '',
                    street: response.data.street || '',
                    street_number: response.data.street_number || '',
                    sexo: response.data.sexo || '',
                    birthdate: response.data.birthdate || '',
                    deathdate: response.data.deathdate || '',
                    rg_data_emissao: response.data.rg_data_emissao || '',
                    phone_1: response.data.phone_1 || '',
                    phone_2: response.data.phone_2 || '',
                    country: response.data.country || 'Brasil'
                });
                if (response.data.cpf) setSearchCpf(response.data.cpf);
                if (response.data.tramitacaoCustomerId) {
                    fetchNotes();
                    fetchAlerts();
                    fetchTiCustomer();
                }
            } catch (error) {
                console.error('Error fetching contact:', error);
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchContact();

        // Socket for real-time updates
        const socket = io('https://geral-sheila-api.r954jc.easypanel.host');
        socket.on('chat_updated', (updatedChat) => {
            if (updatedChat.id === id) {
                setContact(updatedChat);
                setFormData({
                    contactName: updatedChat.contactName || '',
                    email: updatedChat.email || '',
                    cpf: updatedChat.cpf || '',
                    notes: updatedChat.notes || '',
                    area: updatedChat.area || '',
                    hasLawyer: updatedChat.hasLawyer,
                    lawyerResponse: updatedChat.lawyerResponse || '',
                    triageStatus: updatedChat.triageStatus || 'em_andamento',
                    meu_inss_pass: updatedChat.meu_inss_pass || '',
                    mother_name: updatedChat.mother_name || '',
                    father_name: updatedChat.father_name || '',
                    profession: updatedChat.profession || '',
                    marital_status: updatedChat.marital_status || '',
                    rg_numero: updatedChat.rg_numero || '',
                    state: updatedChat.state || '',
                    city: updatedChat.city || '',
                    neighborhood: updatedChat.neighborhood || '',
                    zipcode: updatedChat.zipcode || '',
                    street: updatedChat.street || '',
                    street_number: updatedChat.street_number || '',
                    sexo: updatedChat.sexo || '',
                    birthdate: updatedChat.birthdate || ''
                });
                if (updatedChat.cpf && !searchCpf) setSearchCpf(updatedChat.cpf);
            }
        });

        return () => socket.disconnect();
    }, [id]);

    const fetchTiCustomer = async () => {
        try {
            const response = await axios.get(`https://geral-sheila-api.r954jc.easypanel.host/api/ti/customer/${id}/full`);
            if (response.data && response.data.customer && response.data.customer.tags) {
                setTiTags(response.data.customer.tags);
            } else if (response.data && response.data.tags) {
                setTiTags(response.data.tags);
            }
        } catch (error) {
            console.error('Error fetching TI customer:', error);
        }
    };

    const fetchNotes = async () => {
        try {
            const response = await axios.get(`https://geral-sheila-api.r954jc.easypanel.host/api/ti/notes/${id}`);
            setTiNotes(response.data.notes || []);
        } catch (error) {
            console.error('Error fetching TI notes:', error);
        }
    };

    const fetchAlerts = async () => {
        try {
            const response = await axios.get(`https://geral-sheila-api.r954jc.easypanel.host/api/ti/alerts`);
            // Simplificação: Filtramos localmente os alertas que mencionam nomor do processo ou nome do cliente se necessário
            // ou assumimos que no backend já trataremos alertas por cliente no futuro. 
            // Por enquanto pegamos os globais e mostramos os mais recentes.
            setAlerts(response.data.rows || []);
        } catch (error) {
            console.error('Error fetching alerts:', error);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await axios.put(`https://geral-sheila-api.r954jc.easypanel.host/api/chats/${id}`, formData);
            alert('Dados atualizados com sucesso!');
        } catch (error) {
            console.error('Error saving:', error);
            alert('Erro ao salvar dados.');
        } finally {
            setSaving(false);
        }
    };

    const checkSyncPrerequisites = (callback) => {
        if (!formData.contactName || !formData.cpf) {
            setValidationModalOpen(true);
            return false;
        }
        callback();
        return true;
    };

    const handleAutoSync = async () => {
        checkSyncPrerequisites(async () => {
            setSyncing(true);
            try {
                // First search
                const searchRes = await axios.get(`https://geral-sheila-api.r954jc.easypanel.host/api/ti/customer/search?q=${encodeURIComponent(formData.cpf || formData.contactName)}`);
                const results = searchRes.data.customers || [];

                if (results.length > 0) {
                    // If found, link the first one
                    await axios.patch(`https://geral-sheila-api.r954jc.easypanel.host/api/ti/customer/${id}`, { tramitacaoCustomerUuid: results[0].uuid });
                    alert('Perfil localizado e vinculado automaticamente!');
                } else {
                    // If not found, create new
                    await axios.post(`https://geral-sheila-api.r954jc.easypanel.host/api/ti/customer`, { chatId: id });
                    alert('Cliente não encontrado no TI. Criado novo perfil e iniciado monitoramento!');
                }

                // Refresh contact
                const updated = await axios.get(`https://geral-sheila-api.r954jc.easypanel.host/api/chats/${id}`);
                setContact(updated.data);
                fetchNotes();
                fetchAlerts();
                fetchTiCustomer();
            } catch (error) {
                console.error('Error auto-syncing:', error);
                alert('Falha na sincronização automática. Verifique se o CPF e Nome estão preenchidos.');
            } finally {
                setSyncing(false);
            }
        });
    };

    const handleSearchTI = async () => {
        if (!searchCpf) return;
        setSyncing(true);
        try {
            const response = await axios.get(`https://geral-sheila-api.r954jc.easypanel.host/api/ti/customer/search?q=${encodeURIComponent(searchCpf)}`);
            setSearchResults(response.data.customers || []);
        } catch (error) {
            console.error('Error searching TI:', error);
            alert('Erro ao buscar no Portal TI. Verifique se o nome ou CPF é válido.');
        } finally {
            setSyncing(false);
        }
    };

    const handleSearchManual = () => {
        setSearchCpf(formData.cpf || '');
        setSearchResults([]);
    };
    const handleSyncToTI = async () => {
        checkSyncPrerequisites(async () => {
            setSyncing(true);
            try {
                const response = await axios.post(`https://geral-sheila-api.r954jc.easypanel.host/api/ti/customer`, { chatId: id });
                setContact(response.data);
                alert('Cliente cadastrado e monitorado no TI com sucesso!');
                setSearchResults(null);
            } catch (error) {
                console.error('Error syncing to TI:', error);
                alert('Erro ao cadastrar no TI. Verifique os dados (Nome e CPF são obrigatórios).');
            } finally {
                setSyncing(false);
            }
        });
    };

    const handleUpdateTI = async () => {
        setSyncing(true);
        try {
            await axios.patch(`https://geral-sheila-api.r954jc.easypanel.host/api/ti/customer/${id}`, formData);
            alert('Dados atualizados no Portal TI!');
        } catch (error) {
            console.error('Error updating TI:', error);
            alert('Erro ao atualizar no TI.');
        } finally {
            setSyncing(false);
        }
    };

    const handleSaveNote = async () => {
        if (!noteContent.trim()) return;

        try {
            if (editingNote) {
                await axios.patch(`https://geral-sheila-api.r954jc.easypanel.host/api/ti/note/${editingNote.id}`, { content: noteContent });
                alert('Nota atualizada!');
            } else {
                await axios.post(`https://geral-sheila-api.r954jc.easypanel.host/api/ti/note`, { chatId: id, content: noteContent });
                alert('Nota salva no Portal TI!');
            }
            setNoteModalOpen(false);
            setEditingNote(null);
            setNoteContent('');
            fetchNotes();
        } catch (error) {
            console.error('Error saving note:', error);
            alert('Erro ao salvar nota.');
        }
    };

    const handleOpenNoteModal = (note = null) => {
        if (note) {
            setEditingNote(note);
            setNoteContent(note.content);
        } else {
            setEditingNote(null);
            setNoteContent('');
        }
        setNoteModalOpen(true);
    };

    const handleDeleteNote = async (noteId) => {
        if (!confirm('Tem certeza que deseja excluir esta nota do TI?')) return;

        try {
            await axios.delete(`https://geral-sheila-api.r954jc.easypanel.host/api/ti/note/${noteId}`);
            alert('Nota excluída!');
            fetchNotes();
        } catch (error) {
            console.error('Error deleting note:', error);
            alert('Erro ao excluir nota.');
        }
    };

    const HistoryContent = () => {
        if (!contact.tramitacaoCustomerId) {
            return (
                <div className={styles.syncRequired}>
                    <Lock size={48} />
                    <h3>Sincronização Necessária</h3>
                    <p>Para visualizar o histórico de notas, você precisa vincular este contato ao Portal Tramitação Inteligente.</p>
                    <button onClick={handleAutoSync} className={styles.autoSyncBtnLarge}>
                        <RefreshCw size={18} />
                        Sincronizar Agora
                    </button>
                </div>
            );
        }

        return (
            <div className={styles.historyContainer}>
                <div className={styles.historyHeader}>
                    <h3>Histórico de Notas (TI)</h3>
                    <button onClick={() => handleOpenNoteModal()} className={styles.addNoteBtn}>
                        <ClipboardList size={16} />
                        Nova Nota
                    </button>
                </div>
                <div className={styles.notesList}>
                    {tiNotes.length === 0 ? (
                        <p className={styles.emptyMsg}>Nenhuma nota encontrada no Portal TI.</p>
                    ) : (
                        tiNotes.map(note => (
                            <div key={note.id} className={styles.noteItem}>
                                <div className={styles.noteMeta}>
                                    <strong>{note.user?.name || 'Sistema'}</strong>
                                    <span>{new Date(note.created_at).toLocaleString()}</span>
                                </div>
                                <p className={styles.noteText}>{note.content}</p>
                                <div className={styles.noteActions}>
                                    <button onClick={() => handleOpenNoteModal(note)}>Editar</button>
                                    <button onClick={() => handleDeleteNote(note.id)} className={styles.deleteBtn}>Excluir</button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        );
    };

    const AlertsContent = () => {
        if (!contact.tramitacaoCustomerId) {
            return (
                <div className={styles.syncRequired}>
                    <Lock size={48} />
                    <h3>Sincronização Necessária</h3>
                    <p>Alertas judiciais e publicações só estão disponíveis para contatos sincronizados.</p>
                    <button onClick={handleAutoSync} className={styles.autoSyncBtnLarge}>
                        <RefreshCw size={18} />
                        Sincronizar Agora
                    </button>
                </div>
            );
        }

        return (
            <div className={styles.alertsContainer}>
                <h3>Alertas Judiciais (Publicações)</h3>
                <div className={styles.alertsList}>
                    {alerts.length === 0 ? (
                        <p className={styles.emptyMsg}>Nenhum alerta judicial recebido recentemente.</p>
                    ) : (
                        alerts.map(alert => (
                            <div key={alert.id} className={`${styles.alertItem} ${alert.isRead ? '' : styles.unread}`}>
                                <div className={styles.alertHeader}>
                                    <h4>{alert.title}</h4>
                                    <span>{new Date(alert.createdAt).toLocaleDateString()}</span>
                                </div>
                                <p className={styles.alertProcess}>Processo: {alert.processNumber}</p>
                                <p className={styles.alertBody}>{alert.body.substring(0, 300)}...</p>
                                <div className={styles.alertFooter}>
                                    <a href={alert.link} target="_blank" className={styles.linkBtn}>
                                        Ver no Tramitação <ExternalLink size={14} />
                                    </a>
                                    {!alert.isRead && (
                                        <button onClick={async () => {
                                            await axios.put(`https://geral-sheila-api.r954jc.easypanel.host/api/ti/alerts/${alert.id}/read`);
                                            fetchAlerts();
                                        }} className={styles.markReadBtn}>
                                            Marcar como lido
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        );
    };

    const handleVincular = async (customerUuid) => {
        setSyncing(true);
        try {
            await axios.patch(`https://geral-sheila-api.r954jc.easypanel.host/api/ti/customer/${id}`, { tramitacaoCustomerUuid: customerUuid });
            alert('Perfil vinculado com sucesso!');
            setSearchResults(null);
        } catch (error) {
            console.error('Error linking:', error);
            alert('Erro ao vincular perfil.');
        } finally {
            setSyncing(false);
        }
    };

    const renderMobileTabs = () => (
        <div className={styles.mobileTabs}>
            <button
                className={`${styles.tabBtn} ${activeTab === 'dossier' ? styles.activeTab : ''}`}
                onClick={() => setActiveTab('dossier')}
            >
                <ClipboardList size={18} />
                Dossiê
            </button>
            <button
                className={`${styles.tabBtn} ${activeTab === 'chat' ? styles.activeTab : ''}`}
                onClick={() => setActiveTab('chat')}
            >
                <Bot size={18} />
                Chat
            </button>
            <button
                className={`${styles.tabBtn} ${activeTab === 'history' ? styles.activeTab : ''}`}
                onClick={() => setActiveTab('history')}
            >
                <RefreshCw size={18} />
                Histórico
            </button>
            <button
                className={`${styles.tabBtn} ${activeTab === 'alerts' ? styles.activeTab : ''}`}
                onClick={() => setActiveTab('alerts')}
            >
                <Bell size={18} />
                Alertas
            </button>
        </div>
    );

    return (
        <div className={styles.container}>
            <Header title="Dossiê de Contato" />

            <div className={styles.content}>
                <button onClick={() => router.back()} className={styles.backBtn}>
                    <ArrowLeft size={18} />
                    Voltar ao Diretório
                </button>

                {isMobile && renderMobileTabs()}

                <div className={styles.grid}>
                    {/* Mobile Logic */}
                    {isMobile ? (
                        <>
                            {activeTab === 'dossier' && (
                                <div className={styles.leftCol}>
                                    <Card className={styles.profileCard}>
                                        <div className={styles.profileHeader}>
                                            <div className={styles.largeAvatar}>
                                                {(formData.contactName || 'U').charAt(0).toUpperCase()}
                                            </div>
                                            <div className={styles.profileTitles}>
                                                <h1>{formData.contactName || 'Usuário Sem Nome'}</h1>
                                                <div className={styles.tagList}>
                                                    {tiTags.map((tag, idx) => (
                                                        <span key={idx} className={styles.tiTagBadge}>{tag}</span>
                                                    ))}
                                                </div>
                                                <span>Cadastrado em {new Date(contact.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>

                                        <div className={styles.statusSection}>
                                            <div className={styles.statusItem}>
                                                <div className={`${styles.statusIcon} ${contact.tramitacaoCustomerId ? styles.success : styles.warning}`}>
                                                    {contact.tramitacaoCustomerId ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                                                </div>
                                                <div className={styles.statusMeta}>
                                                    <p>Vínculo Jurídico</p>
                                                    <h3>{contact.tramitacaoCustomerId ? 'Sincronizado' : 'Aguardando Sincronia'}</h3>
                                                </div>
                                            </div>
                                            <div className={styles.statusItem}>
                                                <div className={styles.statusIcon}>
                                                    <RefreshCw size={16} />
                                                </div>
                                                <div className={styles.statusMeta}>
                                                    <p>Última Sincronia</p>
                                                    <h3>{contact.lastSyncAt ? new Date(contact.lastSyncAt).toLocaleString() : 'Nunca sincronizado'}</h3>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>

                                    <Card title="Informações Coletadas" subtitle="Dados extraídos das interações e preenchidos manualmente." className={styles.mt}>
                                        <div className={styles.form}>
                                            <div className={styles.formGrid}>
                                                <div className={styles.inputGroup}>
                                                    <label>Nome Completo</label>
                                                    <input
                                                        type="text"
                                                        value={formData.contactName}
                                                        onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                                                    />
                                                </div>
                                                <div className={styles.inputGroup}>
                                                    <label>E-mail Principal</label>
                                                    <input
                                                        type="email"
                                                        value={formData.email}
                                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                    />
                                                </div>
                                                <div className={styles.inputGroup}>
                                                    <label>CPF / Documento</label>
                                                    <input
                                                        type="text"
                                                        value={formData.cpf}
                                                        onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                                                    />
                                                </div>
                                                <div className={styles.inputGroup}>
                                                    <label>Área Jurídica</label>
                                                    <select
                                                        value={formData.area}
                                                        onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                                                    >
                                                        <option value="">Não definido</option>
                                                        <option value="previdenciario">Previdenciário</option>
                                                        <option value="trabalhista">Trabalhista</option>
                                                        <option value="outro">Outro</option>
                                                    </select>
                                                </div>
                                                <div className={styles.inputGroup}>
                                                    <label>Possui Advogado?</label>
                                                    <select
                                                        value={formData.hasLawyer === null ? "" : formData.hasLawyer}
                                                        onChange={(e) => setFormData({ ...formData, hasLawyer: e.target.value === "" ? null : e.target.value === "true" })}
                                                    >
                                                        <option value="">Não definido</option>
                                                        <option value="true">Sim</option>
                                                        <option value="false">Não</option>
                                                    </select>
                                                </div>
                                                <div className={styles.inputGroup}>
                                                    <label>Resposta sobre Advogado</label>
                                                    <input
                                                        type="text"
                                                        value={formData.lawyerResponse}
                                                        onChange={(e) => setFormData({ ...formData, lawyerResponse: e.target.value })}
                                                        placeholder="Frase dita pelo cliente..."
                                                    />
                                                </div>
                                                <div className={styles.inputGroup}>
                                                    <label>Status da Triagem</label>
                                                    <select
                                                        value={formData.triageStatus}
                                                        onChange={(e) => setFormData({ ...formData, triageStatus: e.target.value })}
                                                    >
                                                        <option value="encerrada_etica">Encerrada (Ética)</option>
                                                    </select>
                                                </div>
                                                <div className={styles.inputGroup}>
                                                    <label>Senha Meu INSS</label>
                                                    <input
                                                        type="text"
                                                        value={formData.meu_inss_pass}
                                                        onChange={(e) => setFormData({ ...formData, meu_inss_pass: e.target.value })}
                                                    />
                                                </div>
                                                <div className={styles.inputGroup}>
                                                    <label>Nome da Mãe</label>
                                                    <input
                                                        type="text"
                                                        value={formData.mother_name}
                                                        onChange={(e) => setFormData({ ...formData, mother_name: e.target.value })}
                                                    />
                                                </div>
                                                <div className={styles.inputGroup}>
                                                    <label>Nome do Pai</label>
                                                    <input
                                                        type="text"
                                                        value={formData.father_name}
                                                        onChange={(e) => setFormData({ ...formData, father_name: e.target.value })}
                                                    />
                                                </div>
                                                <div className={styles.inputGroup}>
                                                    <label>Profissão</label>
                                                    <input
                                                        type="text"
                                                        value={formData.profession}
                                                        onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                                                    />
                                                </div>
                                                <div className={styles.inputGroup}>
                                                    <label>Gênero</label>
                                                    <select
                                                        value={formData.sexo}
                                                        onChange={(e) => setFormData({ ...formData, sexo: e.target.value })}
                                                    >
                                                        <option value="">Não definido</option>
                                                        <option value="m">Masculino</option>
                                                        <option value="f">Feminino</option>
                                                    </select>
                                                </div>
                                                <div className={styles.inputGroup}>
                                                    <label>Data de Nascimento</label>
                                                    <input
                                                        type="date"
                                                        value={formData.birthdate}
                                                        onChange={(e) => setFormData({ ...formData, birthdate: e.target.value })}
                                                    />
                                                </div>
                                                <div className={styles.inputGroup}>
                                                    <label>Estado Civil</label>
                                                    <select
                                                        value={formData.marital_status}
                                                        onChange={(e) => setFormData({ ...formData, marital_status: e.target.value })}
                                                    >
                                                        <option value="">Não definido</option>
                                                        <option value="solteiro">Solteiro</option>
                                                        <option value="casado">Casado</option>
                                                        <option value="divorciado">Divorciado</option>
                                                        <option value="viuvo">Viúvo</option>
                                                    </select>
                                                </div>
                                                <div className={styles.inputGroup}>
                                                    <label>RG</label>
                                                    <input
                                                        type="text"
                                                        value={formData.rg_numero}
                                                        onChange={(e) => setFormData({ ...formData, rg_numero: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                            <div className={styles.inputGroupFull}>
                                                <label>Observações e Contexto (Resumo da Carol)</label>
                                                <textarea
                                                    rows={6}
                                                    value={formData.notes}
                                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                                />
                                            </div>
                                            <div className={styles.btnRow}>
                                                <button onClick={handleSave} className={styles.saveBtn} disabled={saving}>
                                                    <Save size={18} />
                                                    {saving ? 'Gravando...' : 'Salvar Alterações Locais'}
                                                </button>
                                                {contact.tramitacaoCustomerId && (
                                                    <button onClick={handleUpdateTI} className={styles.tiBtn} disabled={syncing}>
                                                        <RefreshCw size={18} />
                                                        {syncing ? 'Sincronizando...' : 'Atualizar no TI'}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </Card>

                                    <Card title="Ações da Integração" subtitle="Comandos jurídicos especializados." className={styles.mt}>
                                        <div className={styles.actionsGrid}>
                                            {!contact.tramitacaoCustomerId ? (
                                                <div className={styles.syncCard}>
                                                    <div className={styles.syncInfo}>
                                                        <Lock size={24} />
                                                        <div>
                                                            <strong>Perfil não vinculado</strong>
                                                            <p>Conecte este cliente ao Tramitação Inteligente para liberar o histórico e alertas.</p>
                                                        </div>
                                                    </div>
                                                    <button onClick={handleAutoSync} className={styles.autoSyncBtn} disabled={syncing}>
                                                        <RefreshCw size={18} className={syncing ? styles.spin : ''} />
                                                        {syncing ? 'Sincronizando...' : 'Sincronizar Automaticamente'}
                                                    </button>
                                                    <button onClick={() => checkSyncPrerequisites(handleSearchManual)} className={styles.manualSyncBtn}>
                                                        Busca Manual
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className={styles.tiStatusCard}>
                                                    <div className={styles.tiBadge}>VINCULADO AO TI</div>
                                                    <p>ID: {contact.tramitacaoCustomerId}</p>
                                                    <div className={styles.btnList}>
                                                        <button onClick={() => handleOpenNoteModal()} className={styles.subActionBtn}>
                                                            <ClipboardList size={16} />
                                                            Adicionar Nota Jurídica
                                                        </button>
                                                        <a
                                                            href={`https://v3.tramitacaointeligente.com.br/clientes/${contact.tramitacaoCustomerId}`}
                                                            target="_blank"
                                                            className={styles.subActionBtn}
                                                        >
                                                            <ExternalLink size={16} />
                                                            Abrir no Portal TI
                                                        </a>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </Card>

                                    <Card title="Guia Didático" className={styles.mt}>
                                        <div className={styles.didactic}>
                                            <div className={styles.guideItem}>
                                                <h4>O que é a Sincronização?</h4>
                                                <p>É o processo de enviar os dados coletados (CPF, E-mail) para o portal judiciário, permitindo o acompanhamento automático de processos.</p>
                                            </div>
                                            <div className={styles.guideItem}>
                                                <h4>Por que cadastrar no TI?</h4>
                                                <p>Ao finalizar a triagem, Carol envia as informações filtradas para o TI, onde os prazos processuais serão monitorados legalmente.</p>
                                            </div>
                                        </div>
                                    </Card>
                                </div>
                            )}
                            {activeTab === 'chat' && (
                                <div className={styles.mobileChatWrapper}>
                                    <div className={styles.mobileChatHeader}>
                                        <button onClick={() => setActiveTab('dossier')}>
                                            <ArrowLeft size={24} />
                                        </button>
                                        <h3>Bate-papo: {formData.contactName}</h3>
                                    </div>
                                    <MiniChatFragment chatId={id} />
                                </div>
                            )}
                        </>
                    ) : (
                        /* Desktop Logic (Existing) */
                        <>
                            <div className={styles.leftCol}>
                                <Card className={styles.profileCard}>
                                    <div className={styles.profileHeader}>
                                        <div className={styles.largeAvatar}>
                                            {(formData.contactName || 'U').charAt(0).toUpperCase()}
                                        </div>
                                        <div className={styles.profileTitles}>
                                            <h1>{formData.contactName || 'Usuário Sem Nome'}</h1>
                                            <div className={styles.tagList}>
                                                {tiTags.map((tag, idx) => (
                                                    <span key={idx} className={styles.tiTagBadge}>{tag}</span>
                                                ))}
                                            </div>
                                            <span>Cadastrado em {new Date(contact.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>

                                    <div className={styles.statusSection}>
                                        <div className={styles.statusItem}>
                                            <div className={`${styles.statusIcon} ${contact.tramitacaoCustomerId ? styles.success : styles.warning}`}>
                                                {contact.tramitacaoCustomerId ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                                            </div>
                                            <div className={styles.statusMeta}>
                                                <p>Vínculo Jurídico</p>
                                                <h3>{contact.tramitacaoCustomerId ? 'Sincronizado' : 'Aguardando Sincronia'}</h3>
                                            </div>
                                        </div>
                                        <div className={styles.statusItem}>
                                            <div className={styles.statusIcon}>
                                                <RefreshCw size={16} />
                                            </div>
                                            <div className={styles.statusMeta}>
                                                <p>Última Sincronia</p>
                                                <h3>{contact.lastSyncAt ? new Date(contact.lastSyncAt).toLocaleString() : 'Nunca sincronizado'}</h3>
                                            </div>
                                        </div>
                                    </div>
                                </Card>

                                <Card title="Informações Coletadas" subtitle="Dados extraídos das interações e preenchidos manualmente." className={styles.mt}>
                                    <div className={styles.form}>
                                        <div className={styles.formGrid}>
                                            <div className={styles.inputGroup}>
                                                <label>Nome Completo</label>
                                                <input
                                                    type="text"
                                                    value={formData.contactName}
                                                    onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                                                />
                                            </div>
                                            <div className={styles.inputGroup}>
                                                <label>E-mail Principal</label>
                                                <input
                                                    type="email"
                                                    value={formData.email}
                                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                />
                                            </div>
                                            <div className={styles.inputGroup}>
                                                <label>CPF / Documento</label>
                                                <input
                                                    type="text"
                                                    value={formData.cpf}
                                                    onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                                                />
                                            </div>
                                            <div className={styles.inputGroup}>
                                                <label>Área Jurídica</label>
                                                <select
                                                    value={formData.area}
                                                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                                                >
                                                    <option value="">Não definido</option>
                                                    <option value="previdenciario">Previdenciário</option>
                                                    <option value="trabalhista">Trabalhista</option>
                                                    <option value="outro">Outro</option>
                                                </select>
                                            </div>
                                            <div className={styles.inputGroup}>
                                                <label>Possui Advogado?</label>
                                                <select
                                                    value={formData.hasLawyer === null ? "" : formData.hasLawyer}
                                                    onChange={(e) => setFormData({ ...formData, hasLawyer: e.target.value === "" ? null : e.target.value === "true" })}
                                                >
                                                    <option value="">Não definido</option>
                                                    <option value="true">Sim</option>
                                                    <option value="false">Não</option>
                                                </select>
                                            </div>
                                            <div className={styles.inputGroup}>
                                                <label>Resposta sobre Advogado</label>
                                                <input
                                                    type="text"
                                                    value={formData.lawyerResponse}
                                                    onChange={(e) => setFormData({ ...formData, lawyerResponse: e.target.value })}
                                                    placeholder="Frase dita pelo cliente..."
                                                />
                                            </div>
                                            <div className={styles.inputGroup}>
                                                <label>Status da Triagem</label>
                                                <select
                                                    value={formData.triageStatus}
                                                    onChange={(e) => setFormData({ ...formData, triageStatus: e.target.value })}
                                                >
                                                    <option value="em_andamento">Em Andamento</option>
                                                    <option value="finalizada">Finalizada</option>
                                                    <option value="encerrada_etica">Encerrada (Ética)</option>
                                                </select>
                                            </div>
                                        </div>

                                        <h4 className={styles.sectionTitle}>Endereço Completo</h4>
                                        <div className={styles.formGrid}>
                                            <div className={styles.inputGroup}>
                                                <label>Rua / Logradouro</label>
                                                <input
                                                    type="text"
                                                    value={formData.street}
                                                    onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                                                />
                                            </div>
                                            <div className={styles.inputGroup}>
                                                <label>Número</label>
                                                <input
                                                    type="text"
                                                    value={formData.street_number}
                                                    onChange={(e) => setFormData({ ...formData, street_number: e.target.value })}
                                                />
                                            </div>
                                            <div className={styles.inputGroup}>
                                                <label>Bairro</label>
                                                <input
                                                    type="text"
                                                    value={formData.neighborhood}
                                                    onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                                                />
                                            </div>
                                            <div className={styles.inputGroup}>
                                                <label>Cidade</label>
                                                <input
                                                    type="text"
                                                    value={formData.city}
                                                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                                />
                                            </div>
                                            <div className={styles.inputGroup}>
                                                <label>Estado (UF)</label>
                                                <input
                                                    type="text"
                                                    value={formData.state}
                                                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                                />
                                            </div>
                                            <div className={styles.inputGroup}>
                                                <label>CEP</label>
                                                <input
                                                    type="text"
                                                    value={formData.zipcode}
                                                    onChange={(e) => setFormData({ ...formData, zipcode: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        <h4 className={styles.sectionTitle}>Dados Pessoais & Filiação</h4>
                                        <div className={styles.formGrid}>
                                            <div className={styles.inputGroup}>
                                                <label>Sexo</label>
                                                <select
                                                    value={formData.sexo}
                                                    onChange={(e) => setFormData({ ...formData, sexo: e.target.value })}
                                                >
                                                    <option value="">Não definido</option>
                                                    <option value="M">Masculino</option>
                                                    <option value="F">Feminino</option>
                                                </select>
                                            </div>
                                            <div className={styles.inputGroup}>
                                                <label>Data de Nascimento</label>
                                                <input
                                                    type="date"
                                                    value={formData.birthdate}
                                                    onChange={(e) => setFormData({ ...formData, birthdate: e.target.value })}
                                                />
                                            </div>
                                            <div className={styles.inputGroup}>
                                                <label>Estado Civil</label>
                                                <input
                                                    type="text"
                                                    value={formData.marital_status}
                                                    onChange={(e) => setFormData({ ...formData, marital_status: e.target.value })}
                                                />
                                            </div>
                                            <div className={styles.inputGroup}>
                                                <label>Profissão</label>
                                                <input
                                                    type="text"
                                                    value={formData.profession || ''}
                                                    onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                                                />
                                            </div>
                                            <div className={styles.inputGroup}>
                                                <label>RG (Número)</label>
                                                <input
                                                    type="text"
                                                    value={formData.rg_numero || ''}
                                                    onChange={(e) => setFormData({ ...formData, rg_numero: e.target.value })}
                                                />
                                            </div>
                                            <div className={styles.inputGroup}>
                                                <label>RG (Emissão)</label>
                                                <input
                                                    type="date"
                                                    value={formData.rg_data_emissao || ''}
                                                    onChange={(e) => setFormData({ ...formData, rg_data_emissao: e.target.value })}
                                                />
                                            </div>
                                            <div className={styles.inputGroup}>
                                                <label>Nome da Mãe</label>
                                                <input
                                                    type="text"
                                                    value={formData.mother_name || ''}
                                                    onChange={(e) => setFormData({ ...formData, mother_name: e.target.value })}
                                                />
                                            </div>
                                            <div className={styles.inputGroup}>
                                                <label>Nome do Pai</label>
                                                <input
                                                    type="text"
                                                    value={formData.father_name}
                                                    onChange={(e) => setFormData({ ...formData, father_name: e.target.value })}
                                                />
                                            </div>
                                            <div className={styles.inputGroup}>
                                                <label>Senha Meu INSS</label>
                                                <input
                                                    type="text"
                                                    value={formData.meu_inss_pass}
                                                    onChange={(e) => setFormData({ ...formData, meu_inss_pass: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div className={styles.inputGroupFull}>
                                            <label>Observações e Contexto (Resumo da Carol)</label>
                                            <textarea
                                                rows={6}
                                                value={formData.notes}
                                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                            />
                                        </div>
                                        <div className={styles.btnRow}>
                                            <button onClick={handleSave} className={styles.saveBtn} disabled={saving}>
                                                <Save size={18} />
                                                {saving ? 'Gravando...' : 'Salvar Alterações Locais'}
                                            </button>
                                            {contact.tramitacaoCustomerId && (
                                                <button onClick={handleUpdateTI} className={styles.tiBtn} disabled={syncing}>
                                                    <RefreshCw size={18} />
                                                    {syncing ? 'Sincronizando...' : 'Atualizar no TI'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </Card>
                            </div>
                            <div className={styles.rightCol}>
                                <div className={styles.desktopTabs}>
                                    <button className={`${styles.dtTab} ${activeTab === 'chat' ? styles.active : ''}`} onClick={() => setActiveTab('chat')}>Chat</button>
                                    <button className={`${styles.dtTab} ${activeTab === 'history' ? styles.active : ''}`} onClick={() => setActiveTab('history')}>Histórico</button>
                                    <button className={`${styles.dtTab} ${activeTab === 'alerts' ? styles.active : ''}`} onClick={() => setActiveTab('alerts')}>Alertas</button>
                                </div>

                                {activeTab === 'chat' && (
                                    <Card title="Interação Direta" subtitle="Conversa ativa em tempo real.">
                                        <MiniChatFragment chatId={id} />
                                    </Card>
                                )}
                                {activeTab === 'history' && (
                                    <Card>
                                        <HistoryContent />
                                    </Card>
                                )}
                                {activeTab === 'alerts' && (
                                    <Card>
                                        <AlertsContent />
                                    </Card>
                                )}

                                <Card title="Ações da Integração" subtitle="Comandos jurídicos especializados." className={styles.mt}>
                                    <div className={styles.actionsGrid}>
                                        {!contact.tramitacaoCustomerId ? (
                                            <div className={styles.syncCard}>
                                                <div className={styles.syncInfo}>
                                                    <Lock size={24} />
                                                    <div>
                                                        <strong>Perfil não vinculado</strong>
                                                        <p>Conecte este cliente ao Tramitação Inteligente para liberar o histórico e alertas.</p>
                                                    </div>
                                                </div>
                                                <button onClick={handleAutoSync} className={styles.autoSyncBtn} disabled={syncing}>
                                                    <RefreshCw size={18} className={syncing ? styles.spin : ''} />
                                                    {syncing ? 'Sincronizando...' : 'Sincronizar Automaticamente'}
                                                </button>
                                                <button onClick={() => checkSyncPrerequisites(handleSearchManual)} className={styles.manualSyncBtn}>
                                                    Busca Manual
                                                </button>
                                            </div>
                                        ) : (
                                            <div className={styles.tiStatusCard}>
                                                <div className={styles.tiBadge}>VINCULADO AO TI</div>
                                                <p>ID: {contact.tramitacaoCustomerId}</p>
                                                <div className={styles.btnList}>
                                                    <button onClick={() => handleOpenNoteModal()} className={styles.subActionBtn}>
                                                        <ClipboardList size={16} />
                                                        Adicionar Nota Jurídica
                                                    </button>
                                                    <a
                                                        href={`https://v3.tramitacaointeligente.com.br/clientes/${contact.tramitacaoCustomerId}`}
                                                        target="_blank"
                                                        className={styles.subActionBtn}
                                                    >
                                                        <ExternalLink size={16} />
                                                        Abrir no Portal TI
                                                    </a>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </Card>

                                <Card title="Guia Didático" className={styles.mt}>
                                    <div className={styles.didactic}>
                                        <div className={styles.guideItem}>
                                            <h4>O que é a Sincronização?</h4>
                                            <p>É o processo de enviar os dados coletados (CPF, E-mail) para o portal judiciário, permitindo o acompanhamento automático de processos.</p>
                                        </div>
                                        <div className={styles.guideItem}>
                                            <h4>Por que cadastrar no TI?</h4>
                                            <p>Ao finalizar a triagem, Carol envia as informações filtradas para o TI, onde os prazos processuais serão monitorados legalmente.</p>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        </>
                    )}
                </div>
                {
                    searchResults && (
                        <div className={styles.modalOverlay}>
                            <div className={styles.modalContent}>
                                <div className={styles.modalHeader}>
                                    <h3>Resultados no Portal TI</h3>
                                    <button onClick={() => setSearchResults(null)} className={styles.closeBtn}>
                                        <X size={18} />
                                    </button>
                                </div>

                                <div className={styles.modalSearch}>
                                    <input
                                        type="text"
                                        placeholder="Nova busca por Nome ou CPF..."
                                        value={searchCpf}
                                        onChange={(e) => setSearchCpf(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSearchTI()}
                                    />
                                    <button onClick={handleSearchTI} disabled={syncing}>
                                        <Search size={18} className={syncing ? styles.spin : ''} />
                                    </button>
                                </div>

                                <div className={styles.modalBody}>
                                    {searchResults.length > 0 ? (
                                        searchResults.map(res => (
                                            <div key={res.id} className={styles.searchResultItem}>
                                                <div className={styles.resInfo}>
                                                    <strong>{res.name}</strong>
                                                    <span>{res.cpf_cnpj}</span>
                                                </div>
                                                <div className={styles.resultActions}>
                                                    <button
                                                        className={styles.linkBtn}
                                                        onClick={() => handleVincular(res.uuid)}
                                                    >
                                                        Vincular
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className={styles.noResults}>
                                            <AlertCircle size={40} color="#cbd5e1" />
                                            <p>Nenhum cliente encontrado.</p>
                                            <div className={styles.noResultsActions}>
                                                <button
                                                    onClick={() => handleSyncToTI()}
                                                    className={styles.createNewBtn}
                                                >
                                                    <UserPlus size={16} />
                                                    Cadastrar "{formData.contactName}" no TI
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )
                }

                {/* Validation/Pending Data Modal */}
                {
                    validationModalOpen && (
                        <div className={styles.modalOverlay}>
                            <div className={styles.modalContent}>
                                <div className={styles.modalHeader}>
                                    <h3>Dados Pendentes</h3>
                                    <button onClick={() => setValidationModalOpen(false)} className={styles.closeBtn}>
                                        <X size={18} />
                                    </button>
                                </div>
                                <div className={styles.modalBody} style={{ padding: '24px' }}>
                                    <p className={styles.validationNotice}>
                                        O Tramitação Inteligente requer <strong>Nome Completo</strong> e <strong>CPF</strong> para sincronizar este contato.
                                    </p>
                                    <div className={styles.form}>
                                        <div className={styles.inputGroupFull}>
                                            <label>Nome Completo</label>
                                            <input
                                                type="text"
                                                value={formData.contactName}
                                                onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                                                placeholder="Ex: João da Silva"
                                            />
                                        </div>
                                        <div className={styles.inputGroupFull}>
                                            <label>CPF / Documento</label>
                                            <input
                                                type="text"
                                                value={formData.cpf}
                                                onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                                                placeholder="000.000.000-00"
                                            />
                                        </div>
                                        <div className={styles.inputGroupFull}>
                                            <label>E-mail (Opcional)</label>
                                            <input
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                placeholder="exemplo@email.com"
                                            />
                                        </div>
                                    </div>
                                    <div className={styles.modalFooter} style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
                                        <button onClick={() => setValidationModalOpen(false)} className={styles.cancelBtn}>
                                            Cancelar
                                        </button>
                                        <button
                                            onClick={async () => {
                                                if (!formData.contactName || !formData.cpf) {
                                                    alert('Por favor, preencha o Nome e o CPF.');
                                                    return;
                                                }
                                                // Save locally first
                                                setSaving(true);
                                                try {
                                                    await axios.put(`https://geral-sheila-api.r954jc.easypanel.host/api/chats/${id}`, {
                                                        contactName: formData.contactName,
                                                        cpf: formData.cpf,
                                                        email: formData.email
                                                    });
                                                    setContact({
                                                        ...contact,
                                                        contactName: formData.contactName,
                                                        cpf: formData.cpf,
                                                        email: formData.email
                                                    });
                                                    setValidationModalOpen(false);
                                                    // Trigger auto-sync after saving
                                                    handleAutoSync();
                                                } catch (e) {
                                                    alert('Erro ao salvar dados locais.');
                                                } finally {
                                                    setSaving(false);
                                                }
                                            }}
                                            className={styles.saveBtn}
                                        >
                                            SALVAR E SINCRONIZAR
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                }
                {
                    noteModalOpen === true && (
                        <div className={styles.modalOverlay}>
                            <div className={styles.modalContent}>
                                <div className={styles.modalHeader}>
                                    <h3>{editingNote ? 'Editar Nota' : 'Nova Nota'}</h3>
                                    <button onClick={() => setNoteModalOpen(false)} className={styles.closeBtn}>
                                        <X size={18} />
                                    </button>
                                </div>
                                <div className={styles.modalBody} style={{ padding: '24px' }}>
                                    <div className={styles.inputGroupFull}>
                                        <label>Conteúdo da Nota (Portal TI)</label>
                                        <textarea
                                            rows={8}
                                            value={noteContent}
                                            onChange={(e) => setNoteContent(e.target.value)}
                                            placeholder="Digite as informações jurídicas aqui..."
                                            autoFocus
                                        />
                                    </div>
                                    <div className={styles.modalFooter} style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
                                        <button onClick={() => setNoteModalOpen(false)} className={styles.cancelBtn}>
                                            Cancelar
                                        </button>
                                        <button onClick={handleSaveNote} className={styles.saveBtn}>
                                            <Save size={18} />
                                            {editingNote ? 'Salvar Edição' : 'Gravar Nota no TI'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                }
            </div >
        </div >
    );
}
