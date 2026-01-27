import styles from './EmptyState.module.css';
import { PackageOpen } from 'lucide-react';

export default function EmptyState({ message, submessage, icon: Icon = PackageOpen }) {
    return (
        <div className={styles.container}>
            <div className={styles.iconWrapper}>
                <Icon size={40} strokeWidth={1} />
            </div>
            <h3 className={styles.message}>{message || 'Nada encontrado'}</h3>
            <p className={styles.submessage}>{submessage || 'Tente ajustar os filtros ou aguarde novos dados.'}</p>
        </div>
    );
}
