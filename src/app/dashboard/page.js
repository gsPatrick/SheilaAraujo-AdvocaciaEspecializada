'use client';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header/Header';
import Card from '@/components/Card/Card';
import styles from './page.module.css';
import {
  Users, Bot, UserX, ChevronRight,
  MessageSquare, AlertCircle, Play, Pause
} from 'lucide-react';

export default function Dashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 });
  const [activeChats, setActiveChats] = useState([]);
  const [inactiveChats, setInactiveChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const socketRef = useRef();

  useEffect(() => {
    socketRef.current = io('https://geral-sheila-api.r954jc.easypanel.host');

    socketRef.current.on('chat_updated', () => {
      fetchData();
    });

    socketRef.current.on('new_message', () => {
      fetchData();
    });

    fetchData();

    return () => socketRef.current.disconnect();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, activeRes, inactiveRes] = await Promise.all([
        axios.get('https://geral-sheila-api.r954jc.easypanel.host/api/chats/stats'),
        axios.get('https://geral-sheila-api.r954jc.easypanel.host/api/chats', { params: { isAiActive: true, limit: 10 } }),
        axios.get('https://geral-sheila-api.r954jc.easypanel.host/api/chats', { params: { isAiActive: false, limit: 10 } })
      ]);

      setStats(statsRes.data);
      setActiveChats(activeRes.data.data);
      setInactiveChats(inactiveRes.data.data);
    } catch (error) {
      console.error('Erro ao buscar dados do dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleAi = async (e, chatId) => {
    e.stopPropagation();
    try {
      await axios.put(`https://geral-sheila-api.r954jc.easypanel.host/api/chats/${chatId}/toggle-ai`);
      fetchData();
    } catch (error) {
      console.error('Erro ao alternar IA:', error);
    }
  };

  const statCards = [
    { label: 'Total de Contatos', value: stats.total, icon: Users, color: '#000' },
    { label: 'IA Operacional', value: stats.active, icon: Bot, color: '#15803d' },
    { label: 'Atendimento Manual', value: stats.inactive, icon: UserX, color: '#ef4444' },
  ];

  return (
    <div className={styles.container}>
      <Header title="Painel de Controle Operacional" />

      <div className={styles.content}>
        <div className={styles.topSection}>
          <h2 className={styles.heroTitle}>Visão Geral</h2>
          <p className={styles.heroText}>Monitore a Carol e intervenha em atendimentos manuais em tempo real.</p>
        </div>

        <section className={styles.statsGrid}>
          {statCards.map((stat, i) => (
            <Card key={i} className={styles.statCard} onClick={() => router.push('/contacts')}>
              <div className={styles.statContent}>
                <div className={styles.statInfo}>
                  <p className={styles.statLabel}>{stat.label}</p>
                  <h3 className={styles.statValue}>{stat.value}</h3>
                </div>
                <div className={styles.statIcon} style={{ color: stat.color }}>
                  <stat.icon size={24} />
                </div>
              </div>
            </Card>
          ))}
        </section>

        <section className={styles.mainGrid}>
          <Card title="Assistência Ativa (IA)" subtitle="Contatos sendo atendidos pela Carol.">
            <div className={styles.chatList}>
              {activeChats.length > 0 ? activeChats.map(chat => (
                <div key={chat.id} className={styles.chatItem} onClick={() => router.push(`/contacts/${chat.id}`)}>
                  <div className={styles.avatar}>{(chat.contactName || 'U').charAt(0).toUpperCase()}</div>
                  <div className={styles.chatInfo}>
                    <p className={styles.chatName}>{chat.contactName || chat.contactNumber}</p>
                    <p className={styles.chatSnippet}>IA respondendo autonomamente</p>
                  </div>
                  <div className={styles.actions}>
                    <button className={`${styles.aiToggle} ${styles.aiActive}`} onClick={(e) => toggleAi(e, chat.id)}>
                      <Pause size={12} fill="currentColor" />
                      Pausar IA
                    </button>
                    <ChevronRight size={16} className={styles.arrow} />
                  </div>
                </div>
              )) : (
                <div className={styles.emptyState}>Nenhum contato com IA ativa.</div>
              )}
            </div>
          </Card>

          <Card title="Intervenção Necessária" subtitle="Atendimentos em modo manual ou pausados.">
            <div className={styles.chatList}>
              {inactiveChats.length > 0 ? inactiveChats.map(chat => (
                <div key={chat.id} className={styles.chatItem} onClick={() => router.push(`/contacts/${chat.id}`)}>
                  <div className={styles.avatar} style={{ background: '#ef4444' }}>{(chat.contactName || 'U').charAt(0).toUpperCase()}</div>
                  <div className={styles.chatInfo}>
                    <p className={styles.chatName}>{chat.contactName || chat.contactNumber}</p>
                    <p className={styles.chatSnippet}>Aguardando resposta humana</p>
                  </div>
                  <div className={styles.actions}>
                    <button className={`${styles.aiToggle} ${styles.aiInactive}`} onClick={(e) => toggleAi(e, chat.id)}>
                      <Play size={12} fill="currentColor" />
                      Ligar IA
                    </button>
                    <ChevronRight size={16} className={styles.arrow} />
                  </div>
                </div>
              )) : (
                <div className={styles.emptyState}>Tudo sob controle da Carol.</div>
              )}
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
}
