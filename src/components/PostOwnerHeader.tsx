type UserHeaderProps = {
  name: string;
  handle: string;
  followers: number;
};

export default function UserHeader({ name, handle, followers }: UserHeaderProps) {
  return (
    <div style={{ marginBottom: 3 }}>
      <div style={{ fontWeight: 'bold' }}>{name}</div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          fontSize: 0.8 + 'rem',
          color: '#9ca3af',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        <span style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {handle}
        </span>
        <span>•</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="12"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
            <path d="M16 3.128a4 4 0 0 1 0 7.744"></path>
            <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
            <circle cx="9" cy="7" r="4"></circle>
          </svg>
          <span>
            {followers >= 1000000
                ? (followers / 1000000).toFixed(1) + 'M'
                : followers >= 1000
                ? (followers / 1000).toFixed(1) + 'K'
                : followers}
          </span>
        </div>
      </div>
    </div>
  );
}
