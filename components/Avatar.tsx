import styles from "./Avatar.module.css";

interface AvatarProps {
  username: string;
  avatarUrl?: string | null;
  size?: number;
}

export default function Avatar({ username, avatarUrl, size = 36 }: AvatarProps) {
  const style = { width: size, height: size, fontSize: size * 0.45 };

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={username}
        className={styles.avatar}
        style={style}
      />
    );
  }

  return (
    <div className={styles.fallback} style={style}>
      {username.charAt(0).toUpperCase()}
    </div>
  );
}
