'use client';
import Header from '@/components/layout/Header/Header';
import Card from '@/components/Card/Card';
import { useMobile } from '@/hooks/useMobile';
import styles from './page.module.css';

import { Gavel, Globe, ShieldCheck, Zap, Server, Code } from 'lucide-react';

export default function IntegrationPage() {
    const isMobile = useMobile();

    const integrations = [
        {
            name: 'Z-API (WhatsApp)',
            status: 'Operacional',
            desc: 'Gerencia o recebimento de mensagens, download de áudios e sincronia de contatos em tempo real.',
            icon: <Zap size={24} />,
            details: 'Taxa de latência: < 200ms | Conexão: WebSocket + Webhook'
        },
        {
            name: 'OpenAI (Cérebro AI)',
            status: 'Operacional',
            desc: 'Responsável pela transcrição de áudios (Whisper) e geração de respostas contextuais (GPT-4).',
            icon: <Globe size={24} />,
            details: 'Modelos ativos: gpt-4-turbo, whisper-1 | Tokens/Dia: Sincronizado'
        },
        {
            name: 'Tramitação Inteligente',
            status: 'Operacional',
            desc: 'Integração oficial para monitoramento de processos judiciais e sincronização de dpssiês de clientes.',
            icon: <Gavel size={24} />,
            details: 'Monitoramento: Nacional | Alertas: Ativos via Webhook'
        },
        {
            name: 'PostgreSQL Externo',
            status: 'Conectado',
            desc: 'Banco de dados persistente para armazenamento de chats, mensagens e configurações do ecossistema.',
            icon: <Server size={24} />,
            details: 'Status: Latência estável | Pool de conexões: Otmizado'
        }
    ];

    return (
        <div className={styles.container}>
            {!isMobile && <Header title="Ecossistema de Integrações" />}


            <div className={styles.content}>
                <div className={styles.intro}>
                    <h1>Centro de Sincronização</h1>
                    <p>Monitore o status e entenda como as ferramentas externas se conectam para criar a inteligência da Carol.</p>
                </div>

                <div className={styles.grid}>
                    {integrations.map((item, i) => (
                        <Card key={i} className={styles.intCard}>
                            <div className={styles.cardHeader}>
                                <div className={styles.iconWrapper}>{item.icon}</div>
                                <div className={styles.statusBadge}>
                                    <div className={styles.dot} />
                                    {item.status}
                                </div>
                            </div>
                            <div className={styles.cardBody}>
                                <h3>{item.name}</h3>
                                <p>{item.desc}</p>
                            </div>
                            <div className={styles.cardFooter}>
                                <Code size={14} />
                                <span>{item.details}</span>
                            </div>
                        </Card>
                    ))}
                </div>

                <Card title="Guia Didático de Integração" className={styles.mt}>
                    <div className={styles.guideGrid}>
                        <div className={styles.guideItem}>
                            <div className={styles.number}>01</div>
                            <h4>Como os dados fluem?</h4>
                            <p>Quando um cliente envia uma mensagem no WhatsApp, ela passa pelo **Z-API**, é processada pela **OpenAI** para entender o contexto, e se necessário, consulta o **Tramitação Inteligente** para verificar dados jurídicos.</p>
                        </div>
                        <div className={styles.guideItem}>
                            <div className={styles.number}>02</div>
                            <h4>A segurança é garantida?</h4>
                            <p>Sim. Todas as conexões utilizam chaves de segurança (Bearer Tokens) e são criptografadas, garantindo que o dossiê dos seus clientes nunca vaze para o ambiente público.</p>
                        </div>
                        <div className={styles.guideItem}>
                            <div className={styles.number}>03</div>
                            <h4>O que é a Assistente Carol?</h4>
                            <p>Ela é a sua persona de IA operacional. Ela utiliza todas essas integrações simultaneamente para agir como uma advogada assistente de alto nível.</p>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
