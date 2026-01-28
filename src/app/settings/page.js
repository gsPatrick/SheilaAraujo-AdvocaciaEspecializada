'use client';
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Header from '@/components/layout/Header/Header';
import Card from '@/components/Card/Card';
import { useMobile } from '@/hooks/useMobile';
import styles from './page.module.css';

import {
    Save, Brain, MessageCircle, Gavel, Bell,
    RefreshCcw, Phone, QrCode, LogOut,
    CheckCircle, XCircle, Loader2, X
} from 'lucide-react';

const API_BASE = 'https://geral-sheila-api.r954jc.easypanel.host/api';

export default function SettingsPage() {
    const isMobile = useMobile();
    const [activeTab, setActiveTab] = useState('general'); // 'general' or 'whatsapp'

    // General Settings State
    const [settings, setSettings] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Z-API State
    const [instances, setInstances] = useState([]);
    const [zapiLoading, setZapiLoading] = useState(false);
    const [selectedInstance, setSelectedInstance] = useState(null);
    const [qrCode, setQrCode] = useState(null);
    const [qrLoading, setQrLoading] = useState(false);
    const [statusInterval, setStatusInterval] = useState(null);

    // --- Fetch General Settings ---
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await axios.get(`${API_BASE}/settings`);
                setSettings(response.data || {});
            } catch (error) {
                console.error('Erro ao buscar configurações:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    // --- Fetch Z-API Instances ---
    const fetchInstances = useCallback(async () => {
        try {
            setZapiLoading(true);
            const response = await axios.get(`${API_BASE}/zapi/instances`);
            const instancesData = response.data;
            const dataToMap = Array.isArray(instancesData) ? instancesData : (instancesData?.content || []);

            const enrichedInstances = await Promise.all(dataToMap.map(async (inst) => {
                try {
                    const statusRes = await axios.get(`${API_BASE}/zapi/status`, {
                        params: { instanceId: inst.instanceId, token: inst.token }
                    });
                    return { ...inst, status: statusRes.data };
                } catch (e) {
                    return { ...inst, status: { connected: false, error: true } };
                }
            }));

            setInstances(enrichedInstances);
        } catch (error) {
            console.error('Error fetching instances:', error);
        } finally {
            setZapiLoading(false);
        }
    }, []);

    useEffect(() => {
        if (activeTab === 'whatsapp') {
            fetchInstances();
        }
    }, [activeTab, fetchInstances]);

    // --- General Settings Actions ---
    const handleChange = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const findSetting = (key) => settings[key] || '';

    const handleSaveGeneral = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await axios.put(`${API_BASE}/settings`, settings);
            alert('Configurações salvas com sucesso!');
        } catch (error) {
            console.error('Erro ao salvar configurações:', error);
            alert('Erro ao salvar as configurações.');
        } finally {
            setSaving(false);
        }
    };

    // --- Z-API Actions ---
    const handleConnect = async (instance) => {
        setSelectedInstance(instance);
        setQrCode(null);
        setQrLoading(true);

        try {
            const response = await axios.get(`${API_BASE}/zapi/qr-code`, {
                params: { instanceId: instance.instanceId, token: instance.token }
            });
            setQrCode(response.data.value);

            const interval = setInterval(async () => {
                try {
                    const statusRes = await axios.get(`${API_BASE}/zapi/status`, {
                        params: { instanceId: instance.instanceId, token: instance.token }
                    });
                    if (statusRes.data.connected) {
                        clearInterval(interval);
                        setSelectedInstance(null);
                        setQrCode(null);
                        fetchInstances();
                    }
                } catch (e) { }
            }, 5000);
            setStatusInterval(interval);

        } catch (error) {
            alert(error.response?.data?.error || 'Erro ao gerar QR Code.');
            setSelectedInstance(null);
        } finally {
            setQrLoading(false);
        }
    };

    const handleLogout = async (instance) => {
        if (!confirm(`Deseja realmente desconectar a instância ${instance.name}?`)) return;
        try {
            await axios.post(`${API_BASE}/zapi/logout`, {
                instanceId: instance.instanceId,
                token: instance.token
            });
            fetchInstances();
        } catch (error) {
            alert('Erro ao desconectar instância');
        }
    };

    const closeModal = () => {
        if (statusInterval) clearInterval(statusInterval);
        setSelectedInstance(null);
        setQrCode(null);
        setStatusInterval(null);
    };

    const sections = [
        {
            title: 'Inteligência Artificial',
            icon: <Brain size={20} />,
            description: 'Configure o cérebro do sistema e como a IA deve se comportar.',
            fields: [
                { key: 'openAiKey', label: 'Chave de API OpenAI', type: 'password', desc: 'Sua chave secreta da OpenAI (sk-...)' },
                { key: 'mainPrompt', label: 'Instrução Mestre (Prompt)', type: 'textarea', desc: 'Defina a personalidade e as regras de atendimento da IA.' },
                { key: 'aiReactivationChar', label: 'Caractere de Reativação (WhatsApp)', type: 'text', desc: 'Caractere único (ex: #, !, .) que o cliente envia para ligar o robô novamente.' },
            ]
        },
        {
            title: 'Configurações Z-API (Chaves)',
            icon: <MessageCircle size={20} />,
            description: 'Dados técnicos de API para conexão (necessário para a aba de Conexão).',
            fields: [
                { key: 'zApiInstance', label: 'ID da Instância Padrão', type: 'text', desc: 'ID usado para envios automáticos.' },
                { key: 'zApiToken', label: 'Token da Instância Padrão', type: 'password', desc: 'Token usado para envios automáticos.' },
                { key: 'zApiClientToken', label: 'Client Token', type: 'password', desc: 'Obrigatório para listar instâncias.' },
            ]
        },
        {
            title: 'Tramitação Inteligente',
            icon: <Gavel size={20} />,
            description: 'Integração com o portal jurídico para gestão de clientes e processos.',
            fields: [
                { key: 'tramitacaoApiKey', label: 'Chave de API TI', type: 'password', desc: 'Sua chave de acesso ao Tramitação Inteligente.' },
                { key: 'tramitacaoApiBaseUrl', label: 'URL Base da API', type: 'text', desc: 'Endereço padrão da API do portal.' },
                { key: 'tramitacaoWebhookUrl', label: 'URL do Webhook', type: 'text', desc: 'Endereço que o TI usará para enviar alertas.' },
                { key: 'tramitacaoWebhookSecret', label: 'Segredo do Webhook', type: 'password', desc: 'Opcional: Chave para validar autenticidade dos eventos.' },
            ]
        },
        {
            title: 'Integração Trello',
            icon: <RefreshCcw size={20} />, // Using RefreshCcw as a proxy for sync/trello
            description: 'Gerencie o espelhamento automático de leads e histórico no Trello.',
            fields: [
                { key: 'trelloKey', label: 'Chave de API Trello', type: 'password', desc: 'Sua API Key do Trello.' },
                { key: 'trelloToken', label: 'Token de Acesso', type: 'password', desc: 'Token de servidor (Server Token) para leitura e escrita.' },
                { key: 'trelloBoardId', label: 'ID do Quadro (Board)', type: 'text', desc: 'O ID do quadro de destino.' },
                { key: 'trelloListId', label: 'ID da Lista (Entrada)', type: 'text', desc: 'O ID da lista onde os novos cards serão criados.' },
            ]
        },
        {
            title: 'Alertas Operacionais',
            icon: <Bell size={20} />,
            description: 'Configurações de notificações urgentes do sistema.',
            fields: [
                { key: 'carol_alert_number', label: 'Número de Alerta (WhatsApp)', type: 'text', desc: 'Número que receberá notificações de novas publicações.' },
            ]
        }
    ];

    return (
        <div className={styles.container}>
            {!isMobile && <Header title="Configurações do Sistema" />}

            <div className={styles.content}>
                {/* Custom Tabs */}
                <div className={styles.tabsContainer}>
                    <div
                        className={`${styles.tab} ${activeTab === 'general' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('general')}
                    >
                        Parâmetros Gerais
                    </div>
                    <div
                        className={`${styles.tab} ${activeTab === 'whatsapp' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('whatsapp')}
                    >
                        Conexão WhatsApp
                    </div>
                </div>

                {activeTab === 'general' ? (
                    <form onSubmit={handleSaveGeneral} className={styles.mainForm}>
                        <div className={styles.sectionsGrid}>
                            {sections.map((section, idx) => (
                                <Card key={idx} className={styles.sectionCard}>
                                    <div className={styles.sectionHeader}>
                                        <div className={styles.sectionIcon}>{section.icon}</div>
                                        <div className={styles.sectionTitles}>
                                            <h3>{section.title}</h3>
                                            <p>{section.description}</p>
                                        </div>
                                    </div>

                                    <div className={styles.fieldsList}>
                                        {loading ? (
                                            <div className="skeleton" style={{ height: '100px', width: '100%' }} />
                                        ) : (
                                            section.fields.map((field) => (
                                                <div key={field.key} className={styles.inputGroup}>
                                                    <div className={styles.fieldLabel}>
                                                        <label>{field.label}</label>
                                                        <span>{field.desc}</span>
                                                    </div>
                                                    {field.type === 'textarea' ? (
                                                        <textarea
                                                            value={findSetting(field.key)}
                                                            onChange={(e) => handleChange(field.key, e.target.value)}
                                                            className={styles.textarea}
                                                            rows={4}
                                                        />
                                                    ) : (
                                                        <input
                                                            type={field.type}
                                                            value={findSetting(field.key)}
                                                            onChange={(e) => handleChange(field.key, e.target.value)}
                                                            className={styles.input}
                                                        />
                                                    )}
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </Card>
                            ))}
                        </div>

                        <div className={styles.stickyFooter}>
                            <button type="submit" className={styles.saveButton} disabled={saving}>
                                <Save size={18} />
                                {saving ? 'Sincronizando...' : 'Confirmar e Salvar Alterações'}
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className={styles.whatsappTab}>
                        <div className={styles.headerRow}>
                            <h1 className={styles.title}>Instâncias Z-API</h1>
                            <p className={styles.subtitle}>Gerencie suas conexões de WhatsApp diretamente por aqui.</p>
                        </div>

                        {zapiLoading ? (
                            <div className={styles.loadingState}>
                                <Loader2 className="animate-spin" size={32} />
                                <p>Carregando instâncias...</p>
                            </div>
                        ) : (
                            <div className={styles.grid}>
                                {instances.length > 0 ? instances.map((inst) => (
                                    <div key={inst.instanceId} className={styles.instanceCard}>
                                        <div className={styles.cardHeader}>
                                            <div className={styles.instanceInfo}>
                                                <h3>{inst.name}</h3>
                                                <span className={styles.instanceId}>ID: {inst.instanceId}</span>
                                            </div>
                                            <div className={`${styles.statusBadge} ${inst.status?.connected ? styles.connected : styles.disconnected}`}>
                                                {inst.status?.connected ? 'Conectado' : 'Desconectado'}
                                            </div>
                                        </div>

                                        <div className={styles.cardBody}>
                                            <div className={styles.phoneInfo}>
                                                <Phone size={18} />
                                                <span>{inst.status?.connected ? inst.status.phone : 'Nenhum telefone conectado'}</span>
                                            </div>
                                        </div>

                                        <div className={styles.cardFooter}>
                                            {!inst.status?.connected ? (
                                                <button
                                                    className={styles.connectBtn}
                                                    onClick={() => handleConnect(inst)}
                                                >
                                                    <QrCode size={18} />
                                                    Conectar
                                                </button>
                                            ) : (
                                                <button
                                                    className={styles.logoutBtn}
                                                    onClick={() => handleLogout(inst)}
                                                >
                                                    <LogOut size={18} />
                                                    Desconectar
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )) : (
                                    <p>Nenhuma instância encontrada. Verifique seu Client Token nas configurações gerais.</p>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {selectedInstance && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <button className={styles.closeBtn} onClick={closeModal}>
                            <X size={20} />
                        </button>

                        <h2 className={styles.modalTitle}>Conectar WhatsApp</h2>
                        <p className={styles.modalDesc}>Escaneie o QR Code abaixo com seu WhatsApp para conectar a instância <strong>{selectedInstance.name}</strong>.</p>

                        <div className={styles.qrContainer}>
                            {qrLoading ? (
                                <div className={styles.qrLoading}>
                                    <Loader2 className="animate-spin" size={40} />
                                    <span>Gerando QR Code...</span>
                                </div>
                            ) : qrCode ? (
                                <img src={qrCode} alt="WhatsApp QR Code" className={styles.qrImage} />
                            ) : (
                                <div className={styles.qrLoading}>
                                    <RefreshCcw size={40} />
                                    <span>Tente novamente</span>
                                </div>
                            )}
                        </div>

                        <div className={styles.steps}>
                            <div className={styles.step}>
                                <span className={styles.stepNumber}>1</span>
                                <span>Abra o WhatsApp no seu celular</span>
                            </div>
                            <div className={styles.step}>
                                <span className={styles.stepNumber}>2</span>
                                <span>Selecione Aparelhos Conectados &gt; Conectar um aparelho</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
