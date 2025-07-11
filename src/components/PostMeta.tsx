import { useEffect, useState } from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { Clock } from 'lucide-react';

type PostMetaProps = {
  timestamp: Date;
};

export default function PostMeta({ timestamp }: PostMetaProps) {
  
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 30000);

    return () => clearInterval(interval);
  }, []);
  
  const formattedDate = format(new Date(timestamp), 'MMM d, h:mm a');
  const relativeTime = formatDistanceToNow(new Date(timestamp), {
    addSuffix: true,
    locale: enUS,
  });

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '12px',
        color: '#aaa',
        marginTop: '0.6rem',
        padding: '0.5rem 0',
        borderTop: '1px solid rgba(75, 85, 99, 0.5)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Clock size={14} style={{ marginRight: '6px', color: '#666' }} />
        <span>{formattedDate}</span>
        <span style={{ margin: '0 8px', color: '#666' }}>•</span>
        <span>{relativeTime}</span>
      </div>

      <button
        type="button"
        style={{
          display: 'flex',
          alignItems: 'center',
          fontSize: '12px',
          color: '#aaa',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
        }}
      >
      </button>
    </div>
  );
}
