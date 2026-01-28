'use client';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import styles from './page.module.css';
import { Bot, User, Send, Maximize2 } from 'lucide-react';
import Link from 'next/link';

export default function MiniChatFragment({ chatId }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isAiActive, setIsAiActive] = useState(false);
    const socketRef = useRef();
    const messagesEndRef = useRef(null);
    const scrollContainerRef = useRef(null);

    useEffect(() => {
        socketRef.current = io('https://geral-sheila-api.r954jc.easypanel.host');

        socketRef.current.on('new_message', (message) => {
            if (message.ChatId === chatId) {
                setMessages(prev => [...prev, message]);
            }
        });

        socketRef.current.on('chat_updated', (updatedChat) => {
            if (updatedChat.id === chatId) {
                setIsAiActive(updatedChat.isAiActive);
            }
        });

        fetchInitialData();

        return () => socketRef.current.disconnect();
    }, [chatId]);

    useEffect(() => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
        }
    }, [messages]);

    const fetchInitialData = async () => {
        try {
            const chatRes = await axios.get(`https://geral-sheila-api.r954jc.easypanel.host/api/chats/${chatId}`);
            setIsAiActive(chatRes.data.isAiActive);

            const msgRes = await axios.get(`https://geral-sheila-api.r954jc.easypanel.host/api/chats/${chatId}/messages`);
            const msgs = msgRes.data.rows || msgRes.data;
            setMessages(Array.isArray(msgs) ? [...msgs].reverse() : []);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        try {
            await axios.post('https://geral-sheila-api.r954jc.easypanel.host/api/chats/send-message', {
                chatId,
                messageBody: input
            });
            setInput('');
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    const toggleAi = async () => {
        try {
            await axios.put(`https://geral-sheila-api.r954jc.easypanel.host/api/chats/${chatId}/toggle-ai`);
        } catch (error) {
            console.error('Error toggling AI:', error);
        }
    };

    return (
        <div className={styles.miniChat}>
            <div className={styles.mcHeader}>
                <div className={styles.mcTitle}>
                    <div className={`${styles.statusDot} ${isAiActive ? styles.active : ''}`} />
                    <span>Monitoramento em Tempo Real</span>
                </div>
                <div className={styles.mcActions}>
                    <button
                        onClick={toggleAi}
                        className={`${styles.aiToggle} ${isAiActive ? styles.aiActive : ''}`}
                    >
                        {isAiActive ? <Bot size={16} /> : <User size={16} />}
                        {isAiActive ? 'IA Ativa' : 'Modo Manual'}
                    </button>
                    <Link href={`/chats?id=${chatId}`} className={styles.expandChatBtn} title="Expandir Conversa">
                        <Maximize2 size={16} />
                    </Link>
                </div>
            </div>

            <div className={styles.mcMessages} ref={scrollContainerRef}>
                {messages.map((msg, i) => (
                    <div key={msg.id || i} className={`${styles.mcMsg} ${msg.isFromMe ? styles.mcMine : styles.mcTheirs}`}>
                        <div className={styles.mcBubble}>
                            {msg.body}
                        </div>
                    </div>
                ))}
            </div>

            <form className={styles.mcComposer} onSubmit={handleSendMessage}>
                <input
                    placeholder="Responder agora..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                />
                <button type="submit" className={styles.mcSendBtn}>
                    <Send size={16} />
                </button>
            </form>
        </div>
    );
}
