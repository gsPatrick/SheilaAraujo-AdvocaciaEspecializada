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
    CheckCircle2, AlertCircle, ArrowLeft,
    Save, RefreshCw, Gavel, Bot, ExternalLink, ClipboardList
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
        notes: ''
    });
    const [activeTab, setActiveTab] = useState('dossier');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const [searchCpf, setSearchCpf] = useState('');
    const [searchResults, setSearchResults] = useState(null);

    useEffect(() => {
        const fetchContact = async () => {
            try {
                const response = await axios.get(`https://geral-sheila-api.r954jc.easypanel.host/api/chats/${id}`);
                setContact(response.data);
                setFormData({
                    contactName: response.data.contactName || '',
                    email: response.data.email || '',
                    cpf: response.data.cpf || '',
                    notes: response.data.notes || ''
                });
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
                    notes: updatedChat.notes || ''
                });
            }
        });

        return () => socket.disconnect();
    }, [id]);

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

    const handleSearchTI = async () => {
        if (!searchCpf) return;
        setSyncing(true);
        try {
            const response = await axios.get(`https://geral-sheila-api.r954jc.easypanel.host/api/ti/customer/search?cpfCnpj=${searchCpf}`);
            setSearchResults(response.data.customers || []);
        } catch (error) {
            console.error('Error searching TI:', error);
            alert('Erro ao buscar no Portal TI.');
        } finally {
            setSyncing(false);
        }
    };

    const handleSyncToTI = async () => {
        setSyncing(true);
        try {
            await axios.post(`https://geral-sheila-api.r954jc.easypanel.host/api/ti/customer`, { chatId: id });
            alert('Cliente cadastrado e monitorado no TI com sucesso!');
            // Page will auto-refresh via socket chat_updated
        } catch (error) {
            console.error('Error syncing to TI:', error);
            alert('Erro ao cadastrar no TI. Verifique os dados (Nome e CPF são obrigatórios).');
        } finally {
            setSyncing(false);
        }
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
        const content = prompt('Digite a nota para salvar no TI:');
        if (!content) return;

        try {
            await axios.post(`https://geral-sheila-api.r954jc.easypanel.host/api/ti/note`, { chatId: id, content });
            alert('Nota salva no Portal TI!');
        } catch (error) {
            console.error('Error saving note:', error);
            alert('Erro ao salvar nota.');
        }
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
        </div>
    );

    const DossierContent = () => (
        <>
            <div className={styles.leftCol}>
                <Card className={styles.profileCard}>
                    {/* ... Profile Card Content ... */}
                    <div className={styles.profileHeader}>
                        <div className={styles.largeAvatar}>
                            {(formData.contactName || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div className={styles.profileTitles}>
                            <h1>{formData.contactName || 'Usuário Sem Nome'}</h1>
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
                            <label>Observações e Contexto</label>
                            <textarea
                                rows={4}
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

                {/* Triagem Summary Card - Auto-generated by Carol */}
                <Card title="📋 Resumo da Triagem" subtitle="Dados extraídos automaticamente pela Carol." className={styles.mt}>
                    <div className={styles.triageSummary}>
                        <div className={styles.triageGrid}>
                            <div className={styles.triageItem}>
                                <label>Nome:</label>
                                <span>{contact.contactName || '—'}</span>
                            </div>
                            <div className={styles.triageItem}>
                                <label>{contact.cpf?.length > 11 ? 'CNPJ:' : 'CPF:'}</label>
                                <span>{contact.cpf || '—'}</span>
                            </div>
                            <div className={styles.triageItem}>
                                <label>Email:</label>
                                <span>{contact.email || '—'}</span>
                            </div>
                            <div className={styles.triageItem}>
                                <label>Advogado:</label>
                                <span className={contact.hasLawyer === false ? styles.good : contact.hasLawyer === true ? styles.warning : ''}>
                                    {contact.hasLawyer === false ? '✅ Não possui' : contact.hasLawyer === true ? '⚠️ Já possui advogado' : '—'}
                                </span>
                            </div>
                            {contact.lawyerResponse && (
                                <div className={styles.triageItemFull}>
                                    <label>Resposta sobre advogado:</label>
                                    <span className={styles.quote}>"{contact.lawyerResponse}"</span>
                                </div>
                            )}
                            <div className={styles.triageItem}>
                                <label>Área Jurídica:</label>
                                <span className={styles.areaBadge}>
                                    {contact.area === 'previdenciario' ? '🏛️ Previdenciário' :
                                        contact.area === 'trabalhista' ? '⚖️ Trabalhista' :
                                            contact.area === 'outro' ? '📁 Outro' : '—'}
                                </span>
                            </div>
                            <div className={styles.triageItem}>
                                <label>Status da Triagem:</label>
                                <span className={`${styles.statusBadge} ${contact.triageStatus === 'finalizada' ? styles.success :
                                        contact.triageStatus === 'encerrada_etica' ? styles.error :
                                            styles.inProgress
                                    }`}>
                                    {contact.triageStatus === 'em_andamento' ? '🔄 Em Andamento' :
                                        contact.triageStatus === 'finalizada' ? '✅ Finalizada' :
                                            contact.triageStatus === 'encerrada_etica' ? '🚫 Encerrada (Ética)' : '—'}
                                </span>
                            </div>
                        </div>
                        {contact.notes && (
                            <div className={styles.notesSection}>
                                <label>📝 Resumo da Conversa:</label>
                                <div className={styles.notesBox}>
                                    {contact.notes}
                                </div>
                            </div>
                        )}
                    </div>
                </Card>

                {/* Actions moved here for mobile flow if dossier tab active, but in desktop it is right col. 
                    Actually, let's keep Actions in rightCol for desktop, but for mobile we might need duplicate or shared components.
                    For simplicity in this refactor, I will just render rightCol's logical Actions here if useMobile */}

                {isMobile && <ActionsContent />}
            </div>
        </>
    );

    const ActionsContent = () => (
        <>
            <Card title="Ações da Integração" subtitle="Comandos jurídicos especializados." className={styles.mt}>
                <div className={styles.actionsGrid}>
                    {!contact.tramitacaoCustomerId ? (
                        <>
                            <div className={styles.searchBox}>
                                <input
                                    type="text"
                                    placeholder="Buscar CPF/CNPJ no TI..."
                                    value={searchCpf}
                                    onChange={(e) => setSearchCpf(e.target.value)}
                                />
                                <button onClick={handleSearchTI} disabled={syncing}>
                                    <RefreshCw size={14} className={syncing ? styles.spin : ''} />
                                </button>
                            </div>

                            {searchResults && (
                                <div className={styles.searchResults}>
                                    {searchResults.length > 0 ? (
                                        searchResults.map(res => (
                                            <div key={res.id} className={styles.searchResultItem}>
                                                <div className={styles.resInfo}>
                                                    <strong>{res.name}</strong>
                                                    <span>{res.cpf_cnpj}</span>
                                                </div>
                                                <button onClick={() => handleVincular(res.uuid)}>Vincular</button>
                                            </div>
                                        ))
                                    ) : <p className={styles.noResults}>Nenhum cliente encontrado com este documento.</p>}
                                </div>
                            )}

                            <button onClick={handleSyncToTI} className={styles.actionBtnLarge} disabled={syncing}>
                                <Gavel size={20} />
                                <div>
                                    <strong>Finalizar Triagem e Cadastrar no TI</strong>
                                    <span>Inicia o monitoramento oficial deste cliente.</span>
                                </div>
                            </button>
                        </>
                    ) : (
                        <div className={styles.tiStatusCard}>
                            <div className={styles.tiBadge}>VINCULADO AO TI</div>
                            <p>ID: {contact.tramitacaoCustomerId}</p>
                            <div className={styles.btnList}>
                                <button onClick={handleSaveNote} className={styles.subActionBtn}>
                                    <ClipboardList size={16} />
                                    Salvar Resumo como Nota
                                </button>
                                <a
                                    href={`https://app.tramitacaointeligente.com.br/clientes/${contact.tramitacaoCustomerId}`}
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
        </>
    );

    const ChatContent = () => (
        <Card title="Interação Direta" subtitle="Conversa ativa em tempo real.">
            <MiniChatFragment chatId={id} />
        </Card>
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
                            {activeTab === 'dossier' && <DossierContent />}
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
                            <DossierContent />
                            {/* Note: DossierContent needs slight refactor to NOT include ActionsContent if Desktop, 
                               or we just render ActionsContent in the right col for desktop. 
                               The previous structure had leftCol and rightCol. 
                               My DossierContent component above includes leftCol div. 
                               I should strip the wrapping divs from components and let the parent grid handle it.
                            */}
                            <div className={styles.rightCol}>
                                <ChatContent />
                                <ActionsContent />
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
