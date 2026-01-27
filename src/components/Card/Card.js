import styles from './Card.module.css';

export default function Card({ children, title, subtitle, loading, className = '' }) {
    if (loading) {
        return (
            <div className={`${styles.card} ${styles.loading} ${className}`}>
                <div className={styles.skeletonTitle} />
                <div className={styles.skeletonBody} />
            </div>
        );
    }

    return (
        <div className={`${styles.card} ${className}`}>
            {(title || subtitle) && (
                <div className={styles.header}>
                    {title && <h3 className={styles.title}>{title}</h3>}
                    {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
                </div>
            )}
            <div className={styles.content}>
                {children}
            </div>
        </div>
    );
}
