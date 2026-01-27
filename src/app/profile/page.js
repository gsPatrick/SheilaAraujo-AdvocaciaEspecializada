'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Header from '@/components/layout/Header/Header';
import Card from '@/components/Card/Card';
import styles from './page.module.css';
import { Save, User, Mail, Lock, ShieldCheck } from 'lucide-react';

export default function ProfilePage() {
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        email: 'admin@admin.com',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const handleSave = async (e) => {
        e.preventDefault();
        if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
            alert('As senhas não coincidem!');
            return;
        }

        setSaving(true);
        try {
            // In a real scenario, we would have a specific endpoint for profile update
            // For now, let's pretend we're updating
            await new Promise(resolve => setTimeout(resolve, 1000));
            alert('Perfil atualizado com sucesso! (Simulado)');
            setFormData({ ...formData, currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            console.error('Erro ao salvar perfil:', error);
            alert('Erro ao atualizar perfil.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className={styles.container}>
            <Header title="Gerenciamento de Conta" />

            <div className={styles.content}>
                <div className={styles.profileHeader}>
                    <div className={styles.avatarLarge}>
                        <User size={48} />
                    </div>
                    <div className={styles.headerInfo}>
                        <h1>Perfil de Operador</h1>
                        <p>Gerencie suas credenciais de acesso e segurança.</p>
                    </div>
                </div>

                <div className={styles.grid}>
                    <Card title="Dados de Acesso" subtitle="E-mail e identificação no sistema.">
                        <form onSubmit={handleSave} className={styles.form}>
                            <div className={styles.inputGroup}>
                                <label><Mail size={16} /> E-mail de Identificação</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                />
                            </div>
                            <button type="submit" className={styles.saveBtn} disabled={saving}>
                                <Save size={18} />
                                {saving ? 'Salvando...' : 'Salvar Alterações'}
                            </button>
                        </form>
                    </Card>

                    <Card title="Segurança e Senha" subtitle="Atualize sua chave de acesso para manter a conta segura.">
                        <form onSubmit={handleSave} className={styles.form}>
                            <div className={styles.inputGroup}>
                                <label><Lock size={16} /> Senha Atual</label>
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    value={formData.currentPassword}
                                    onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                                />
                            </div>
                            <div className={styles.inputGroup}>
                                <label><ShieldCheck size={16} /> Nova Senha</label>
                                <input
                                    type="password"
                                    placeholder="Deixe em branco para não alterar"
                                    value={formData.newPassword}
                                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                                />
                            </div>
                            <div className={styles.inputGroup}>
                                <label><ShieldCheck size={16} /> Confirmar Nova Senha</label>
                                <input
                                    type="password"
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                />
                            </div>
                            <button type="submit" className={styles.saveBtn} disabled={saving}>
                                <Save size={18} />
                                {saving ? 'Sincronizando...' : 'Atualizar Credenciais'}
                            </button>
                        </form>
                    </Card>
                </div>
            </div>
        </div>
    );
}
