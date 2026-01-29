'use client';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import styles from './MiniChat.module.css';
import { MessageSquare, X, Send, Bot, User, ChevronDown, Search } from 'lucide-react';

export default function MiniChat() {
    const [isOpen, setIsOpen] = useState(false);
    const [chats, setChats] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [search, setSearch] = useState('');
    const [loadingChats, setLoadingChats] = useState(false);
    const socketRef = useRef();
    const messagesEndRef = useRef(null);

    useEffect(() => {
        socketRef.current = io('https://geral-sheila-api.r954jc.easypanel.host');

        socketRef.current.on('new_message', (data) => {
            const message = data.message || data;
            if (selectedChat && message.ChatId === selectedChat.id) {
                setMessages(prev => [...prev, message]);
            }
            // Update chats list timestamp or last message
            fetchChats();
        });

        socketRef.current.on('chat_updated', (updatedChat) => {
            if (selectedChat && selectedChat.id === updatedChat.id) {
                setSelectedChat(updatedChat);
            }
            setChats(prev => prev.map(c => c.id === updatedChat.id ? { ...c, ...updatedChat } : c));
        });

        fetchChats();

        return () => socketRef.current.disconnect();
    }, [selectedChat?.id]);

    useEffect(() => {
        if (selectedChat) {
            fetchMessages(selectedChat.id);
        }
    }, [selectedChat]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const fetchChats = async () => {
        try {
            setLoadingChats(true);
            const response = await axios.get('https://geral-sheila-api.r954jc.easypanel.host/api/chats', {
                params: { search, limit: 20 }
            });
            setChats(response.data.data);
        } catch (error) {
            console.error('Error fetching chats:', error);
        } finally {
            setLoadingChats(false);
        }
    };

    const fetchMessages = async (chatId) => {
        try {
            const response = await axios.get(`https://geral-sheila-api.r954jc.easypanel.host/api/chats/${chatId}/messages`);
            // The controller might return rows or data depending on update
            const msgs = response.data.rows || response.data;
            setMessages(Array.isArray(msgs) ? [...msgs].reverse() : []);
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim() || !selectedChat) return;

        try {
            const response = await axios.post('https://geral-sheila-api.r954jc.easypanel.host/api/chats/send-message', {
                chatId: selectedChat.id,
                messageBody: input
            });
            setInput('');
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    const toggleAi = async (e, chat) => {
        e.stopPropagation();
        try {
            await axios.put(`https://geral-sheila-api.r954jc.easypanel.host/api/chats/${chat.id}/toggle-ai`);
        } catch (error) {
            console.error('Error toggling AI:', error);
        }
    };

    return (
        <div className={styles.wrapper}>
            {!isOpen && (
                <button className={styles.launcher} onClick={() => setIsOpen(true)}>
                    <MessageSquare size={24} />
                    <span className={styles.launcherText}>Conversas Internas</span>
                </button>
            )}

            {isOpen && (
                <div className={styles.container}>
                    <div className={styles.header}>
                        {selectedChat ? (
                            <div className={styles.headerContent}>
                                <button onClick={() => setSelectedChat(null)} className={styles.backBtn}>
                                    <ChevronDown size={20} />
                                </button>
                                <div className={styles.chatTitle}>
                                    <h4>{selectedChat.contactName || selectedChat.contactNumber}</h4>
                                    <span className={selectedChat.isAiActive ? styles.aiOn : styles.aiOff}>
                                        {selectedChat.isAiActive ? 'IA Ativa' : 'Manual'}
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <h4>Mensagens Recentes</h4>
                        )}
                        <button onClick={() => setIsOpen(false)} className={styles.closeBtn}>
                            <X size={20} />
                        </button>
                    </div>

                    <div className={styles.body}>
                        {!selectedChat ? (
                            <div className={styles.chatListContainer}>
                                <div className={styles.searchBox}>
                                    <Search size={16} />
                                    <input
                                        placeholder="Buscar contato..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        onKeyUp={(e) => e.key === 'Enter' && fetchChats()}
                                    />
                                </div>
                                <div className={styles.chatList}>
                                    {chats.map(chat => (
                                        <div
                                            key={chat.id}
                                            className={styles.chatItem}
                                            onClick={() => setSelectedChat(chat)}
                                        >
                                            <div className={styles.chatAvatar}>
                                                {(chat.contactName || 'U').charAt(0).toUpperCase()}
                                            </div>
                                            <div className={styles.chatMeta}>
                                                <p className={styles.chatName}>{chat.contactName || chat.contactNumber}</p>
                                                <p className={styles.chatSnippet}>Clique para abrir conversa</p>
                                            </div>
                                            <button
                                                className={`${styles.aiToggleSmall} ${chat.isAiActive ? styles.active : ''}`}
                                                onClick={(e) => toggleAi(e, chat)}
                                                title={chat.isAiActive ? "Desativar IA" : "Ativar IA"}
                                            >
                                                {chat.isAiActive ? <Bot size={14} /> : <User size={14} />}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className={styles.messagesContainer}>
                                <div className={styles.messagesList}>
                                    {messages.map((msg, i) => (
                                        <div
                                            key={msg.id || i}
                                            className={`${styles.message} ${msg.isFromMe ? styles.mine : styles.theirs}`}
                                        >
                                            <div className={styles.messageBubble}>
                                                {msg.audioUrl ? (
                                                    <div className={styles.audioMessage}>
                                                        <div className={styles.audioPlayer}>
                                                            <span className={styles.audioIcon}>🎤</span>
                                                            <span className={styles.audioLabel}>Áudio</span>
                                                        </div>
                                                        {msg.transcription ? (
                                                            <div className={styles.transcription}>
                                                                <p>{msg.transcription}</p>
                                                                <span className={styles.transcriptionBadge}>Transcrição de áudio</span>
                                                            </div>
                                                        ) : (
                                                            <p className={styles.placeHolderAudio}>[Áudio sem transcrição]</p>
                                                        )}
                                                    </div>
                                                ) : (
                                                    msg.body
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    <div ref={messagesEndRef} />
                                </div>
                                <form className={styles.composer} onSubmit={handleSendMessage}>
                                    <input
                                        placeholder="Mensagem rápida..."
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                    />
                                    <button type="submit" className={styles.sendBtn}>
                                        <Send size={18} />
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
