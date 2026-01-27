import styles from './Skeleton.module.css';

export default function Skeleton({ width, height, borderRadius, className = '' }) {
    return (
        <div
            className={`skeleton ${styles.skeleton} ${className}`}
            style={{
                width: width || '100%',
                height: height || '20px',
                borderRadius: borderRadius || '4px'
            }}
        />
    );
}
