'use client';
import { useState, useEffect, useRef, Suspense } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import Header from '@/components/layout/Header/Header';
import styles from './page.module.css';
import { ArrowLeft, Send, User, Bot, Phone, MessageSquare } from 'lucide-react';
import { useMobile } from '@/hooks/useMobile';
import { useRouter, useSearchParams } from 'next/navigation';

function ChatsContent() {
    const [chats, setChats] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef(null);
    const socketRef = useRef(null);
    const isMobile = useMobile();
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialChatId = searchParams.get('id');
    const [searchTerm, setSearchTerm] = useState('');
    const [syncStatus, setSyncStatus] = useState('');
    const [triageStatus, setTriageStatus] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        const fetchChats = async () => {
            setLoading(true);
            try {
                const params = {
                    page,
                    limit: 15,
                    search: searchTerm,
                    syncStatus,
                    triageStatus
                };
                const response = await axios.get('https://geral-sheila-api.r954jc.easypanel.host/api/chats', { params });
                setChats(response.data.data || []);
                setTotalPages(response.data.pages || 1);
            } catch (error) {
                console.error('Error fetching chats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchChats();
    }, [page, searchTerm, syncStatus, triageStatus]);

    useEffect(() => {
        if (initialChatId) {
            axios.get(`https://geral-sheila-api.r954jc.easypanel.host/api/chats/${initialChatId}`)
                .then(res => {
                    setSelectedChat(res.data);
                })
                .catch(err => console.error('Error auto-selecting chat:', err));
        }

        // Socket initialization
        socketRef.current = io('https://geral-sheila-api.r954jc.easypanel.host');
        socketRef.current.on('new_message', (msg) => {
            if (selectedChat && msg.ChatId === selectedChat.id) {
                setMessages(prev => [...prev, msg]);
            }
            // Update chat list summary
            setChats(prev => prev.map(c => c.id === msg.ChatId ? { ...c, updatedAt: new Date() } : c));
        });

        socketRef.current.on('chat_updated', (updatedChat) => {
            setChats(prev => prev.map(c => c.id === updatedChat.id ? { ...c, ...updatedChat } : c));
            if (selectedChat?.id === updatedChat.id) {
                setSelectedChat(prev => ({ ...prev, ...updatedChat }));
            }
        });

        return () => socketRef.current.disconnect();
    }, [selectedChat, initialChatId]);

    useEffect(() => {
        if (selectedChat) {
            const fetchMessages = async () => {
                try {
                    const response = await axios.get(`https://geral-sheila-api.r954jc.easypanel.host/api/chats/${selectedChat.id}/messages`);
                    setMessages(response.data);
                } catch (error) {
                    console.error('Error fetching messages:', error);
                }
            };
            fetchMessages();
        }
    }, [selectedChat]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim() || !selectedChat) return;

        try {
            const response = await axios.post('https://geral-sheila-api.r954jc.easypanel.host/api/chats/send-message', {
                chatId: selectedChat.id,
                body: input
            });
            // Message will come back via socket or we can add it manually
            setMessages(prev => [...prev, response.data]);
            setInput('');
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    const toggleAi = async (chat) => {
        try {
            await axios.put(`https://geral-sheila-api.r954jc.easypanel.host/api/chats/${chat.id}/toggle-ai`);
            setChats(prev => prev.map(c => c.id === chat.id ? { ...c, isAiActive: !c.isAiActive } : c));
            if (selectedChat?.id === chat.id) {
                setSelectedChat(prev => ({ ...prev, isAiActive: !prev.isAiActive }));
            }
        } catch (error) {
            console.error('Error toggling AI:', error);
        }
    };

    const showList = !isMobile || (isMobile && !selectedChat);
    const showChat = !isMobile || (isMobile && selectedChat);

    return (
        <div className={styles.container}>
            {!isMobile && <Header title="Protocolo de Conversa" />}

            <div className={styles.content}>
                {showList && (
                    <div className={styles.sidebar}>
                        {!isMobile && (
                            <div className={styles.sidebarHeader}>
                                <h3>Conversas Ativas</h3>
                                <div className={styles.sidebarSearch}>
                                    <MessageSquare size={16} />
                                    <input
                                        type="text"
                                        placeholder="Buscar contatos..."
                                        value={searchTerm}
                                        onChange={(e) => {
                                            setSearchTerm(e.target.value);
                                            setPage(1);
                                        }}
                                    />
                                </div>
                            </div>
                        )}

                        <div className={styles.filterRow}>
                            <div className={styles.filterGroup}>
                                <label>Origem</label>
                                <select
                                    className={styles.filterSelect}
                                    value={syncStatus}
                                    onChange={(e) => {
                                        setSyncStatus(e.target.value);
                                        setPage(1);
                                    }}
                                >
                                    <option value="">Tudo</option>
                                    <option value="WhatsApp">Somente WhatsApp</option>
                                    <option value="Sincronizado">Sincronizado TI</option>
                                </select>
                            </div>
                            <div className={styles.filterGroup}>
                                <label>Status</label>
                                <select
                                    className={styles.filterSelect}
                                    value={triageStatus}
                                    onChange={(e) => {
                                        setTriageStatus(e.target.value);
                                        setPage(1);
                                    }}
                                >
                                    <option value="">Tudo</option>
                                    <option value="em_andamento">Em Andamento</option>
                                    <option value="finalizada">Finalizada</option>
                                    <option value="encerrada_etica">Encerrada (Ética)</option>
                                </select>
                            </div>
                        </div>
                        <div className={styles.chatList}>
                            {loading ? (
                                [1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: '70px', margin: '16px', borderRadius: '8px' }} />)
                            ) : chats.length > 0 ? (
                                chats.map(chat => (
                                    <div
                                        key={chat.id}
                                        className={`${styles.chatItem} ${selectedChat?.id === chat.id ? styles.selected : ''}`}
                                        onClick={() => setSelectedChat(chat)}
                                    >
                                        <div className={styles.avatar}>{chat.contactName?.charAt(0) || 'U'}</div>
                                        <div className={styles.chatMeta}>
                                            <span className={styles.chatName}>{chat.contactName || chat.contactNumber}</span>
                                            <span className={styles.chatSub}>{chat.contactNumber}</span>
                                            <div className={styles.chatBadges}>
                                                <span className={`${styles.badge} ${chat.syncStatus === 'Sincronizado' ? styles.synced : styles.pending}`}>
                                                    {chat.syncStatus === 'Sincronizado' ? 'TI' : 'WhatsApp'}
                                                </span>
                                                {chat.triageStatus === 'finalizada' && (
                                                    <span className={`${styles.badge} ${styles.finishedTriage}`}>Finalizada</span>
                                                )}
                                                {chat.triageStatus === 'em_andamento' && (
                                                    <span className={`${styles.badge} ${styles.triageBadge}`}>Em Triagem</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className={styles.emptyList}>
                                    <div className={styles.emptyIcon}><Phone size={24} /></div>
                                    <h3>Nenhum resultado</h3>
                                    <p>Tente ajustar os filtros ou a busca.</p>
                                </div>
                            )}
                        </div>

                        {totalPages > 1 && (
                            <div className={styles.pagination}>
                                <button
                                    disabled={page === 1}
                                    onClick={() => setPage(prev => prev - 1)}
                                    className={styles.pageBtn}
                                >
                                    Anterior
                                </button>
                                <span className={styles.pageInfo}>
                                    {page} de {totalPages}
                                </span>
                                <button
                                    disabled={page === totalPages}
                                    onClick={() => setPage(prev => prev + 1)}
                                    className={styles.pageBtn}
                                >
                                    Próxima
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {showChat && (
                    <div className={styles.chatArea}>
                        {selectedChat ? (
                            <div className={styles.chatWrapper}>
                                <div className={styles.chatHeader}>
                                    <div className={styles.headerLeft}>
                                        {isMobile && (
                                            <button onClick={() => setSelectedChat(null)} className={styles.backBtn}>
                                                <ArrowLeft size={20} />
                                            </button>
                                        )}
                                        <div
                                            className={styles.headerInfo}
                                            onClick={() => router.push(`/contacts/${selectedChat.id}`)}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <h3>{selectedChat.contactName || selectedChat.contactNumber}</h3>
                                            <span>{selectedChat.isAiActive ? 'IA Ativa' : 'Controle Manual'}</span>
                                        </div>
                                    </div>
                                    <button
                                        className={`${styles.aiToggle} ${selectedChat.isAiActive ? styles.aiActive : ''}`}
                                        onClick={() => toggleAi(selectedChat)}
                                    >
                                        {selectedChat.isAiActive ? <Bot size={18} /> : <User size={18} />}
                                        {selectedChat.isAiActive ? 'Parar IA' : 'Iniciar IA'}
                                    </button>
                                </div>

                                <div className={styles.messages}>
                                    {messages.map((msg, i) => (
                                        <div key={msg.id || i} className={`${styles.message} ${msg.isFromMe ? styles.outgoing : styles.incoming}`}>
                                            <div className={styles.messageBubble}>{msg.body}</div>
                                            <span className={styles.timestamp}>
                                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    ))}
                                    <div ref={messagesEndRef} />
                                </div>

                                <form className={styles.inputArea} onSubmit={handleSendMessage}>
                                    <input
                                        type="text"
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        placeholder="Digite uma mensagem..."
                                    />
                                    <button type="submit" className={styles.sendButton}>
                                        <Send size={18} />
                                    </button>
                                </form>
                            </div>
                        ) : (
                            <div className={styles.noChat}>
                                <MessageSquare size={64} style={{ opacity: 0.1, marginBottom: '20px' }} />
                                <h2>Selecione uma conversa</h2>
                                <p>Clique em um contato ao lado para ver o histórico de mensagens.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default function ChatsPage() {
    return (
        <Suspense fallback={<div className="loading">Carregando chats...</div>}>
            <ChatsContent />
        </Suspense>
    );
}
