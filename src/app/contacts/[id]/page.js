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
        notes: '',
        area: '',
        hasLawyer: null,
        lawyerResponse: '',
        triageStatus: 'em_andamento'
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
                    notes: response.data.notes || '',
                    area: response.data.area || '',
                    hasLawyer: response.data.hasLawyer,
                    lawyerResponse: response.data.lawyerResponse || '',
                    triageStatus: response.data.triageStatus || 'em_andamento'
                });
                if (response.data.cpf) setSearchCpf(response.data.cpf);
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
                    triageStatus: updatedChat.triageStatus || 'em_andamento'
                });
                if (updatedChat.cpf && !searchCpf) setSearchCpf(updatedChat.cpf);
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
                                <Card title="Interação Direta" subtitle="Conversa ativa em tempo real.">
                                    <MiniChatFragment chatId={id} />
                                </Card>
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
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
