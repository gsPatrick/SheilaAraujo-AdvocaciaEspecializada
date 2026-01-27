'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Header from '@/components/layout/Header/Header';
import Card from '@/components/Card/Card';
import { useMobile } from '@/hooks/useMobile';
import styles from './page.module.css';

import { Save, Brain, MessageCircle, Gavel, Bell } from 'lucide-react';

export default function SettingsPage() {
    const isMobile = useMobile();
    const [settings, setSettings] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await axios.get('https://geral-sheila-api.r954jc.easypanel.host/api/settings');
                setSettings(response.data || {});
            } catch (error) {
                console.error('Erro ao buscar configurações:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleChange = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const findSetting = (key) => settings[key] || '';

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await axios.put('https://geral-sheila-api.r954jc.easypanel.host/api/settings', settings);
            alert('Configurações salvas com sucesso!');
        } catch (error) {
            console.error('Erro ao salvar configurações:', error);
            alert('Erro ao salvar as configurações.');
        } finally {
            setSaving(false);
        }
    };

    const sections = [
        {
            title: 'Inteligência Artificial',
            icon: <Brain size={20} />,
            description: 'Configure o cérebro do sistema e como a IA deve se comportar.',
            fields: [
                { key: 'openAiKey', label: 'Chave de API OpenAI', type: 'password', desc: 'Sua chave secreta da OpenAI (sk-...)' },
                { key: 'mainPrompt', label: 'Instrução Mestre (Prompt)', type: 'textarea', desc: 'Defina a personalidade e as regras de atendimento da IA.' },
            ]
        },
        {
            title: 'Conexão WhatsApp (Z-API)',
            icon: <MessageCircle size={20} />,
            description: 'Dados de integração para envio e recebimento de mensagens.',
            fields: [
                { key: 'zApiInstance', label: 'ID da Instância', type: 'text', desc: 'ID único da sua instância no Z-API.' },
                { key: 'zApiToken', label: 'Token da Instância', type: 'password', desc: 'Token de segurança para autenticação.' },
                { key: 'zApiClientToken', label: 'Client Token', type: 'password', desc: 'Token de cliente fornecido pelo Z-API.' },
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
            {!isMobile && <Header title="Parâmetros do Sistema" />}


            <div className={styles.content}>
                <div className={styles.intro}>
                    <h2>Configurações Globais</h2>
                    <p>Gerencie as integrações e comportamentos fundamentais de todo o ecossistema CAROL IA.</p>
                </div>

                <form onSubmit={handleSave} className={styles.mainForm}>
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
            </div>
        </div>
    );
}
