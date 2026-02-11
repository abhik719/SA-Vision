import clsx from 'clsx';

/** Generate a deterministic pastel color from a name string */
function nameToColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 55%, 72%)`;
}

function getInitials(name: string): string {
  const parts = name.split(' ').filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export interface FacepileItem {
  id: string;
  name: string;
  avatarUrl?: string;
}

interface Props {
  items: FacepileItem[];
  max?: number;
  size?: 'sm' | 'md';
}

export default function Facepile({ items, max = 4, size = 'sm' }: Props) {
  const visible = items.slice(0, max);
  const remaining = items.length - max;

  const dim = size === 'sm' ? 28 : 34;
  const overlap = size === 'sm' ? -8 : -10;
  const textSize = size === 'sm' ? 'text-[10px]' : 'text-[12px]';

  return (
    <div className="flex items-center" style={{ paddingLeft: Math.abs(overlap) }}>
      {visible.map((item, i) => (
        <div
          key={item.id}
          className={clsx(
            'relative flex items-center justify-center rounded-full border-2 border-white font-body font-semibold text-white',
            textSize,
          )}
          style={{
            width: dim,
            height: dim,
            marginLeft: i === 0 ? 0 : overlap,
            zIndex: visible.length - i,
            backgroundColor: item.avatarUrl ? undefined : nameToColor(item.name),
          }}
          title={item.name}
        >
          {item.avatarUrl ? (
            <img
              src={item.avatarUrl}
              alt={item.name}
              className="h-full w-full rounded-full object-cover"
            />
          ) : (
            getInitials(item.name)
          )}
        </div>
      ))}
      {remaining > 0 && (
        <div
          className={clsx(
            'relative flex items-center justify-center rounded-full border-2 border-white bg-li-tag-bg font-body font-semibold text-li-text-secondary',
            textSize,
          )}
          style={{ width: dim, height: dim, marginLeft: overlap, zIndex: 0 }}
        >
          +{remaining}
        </div>
      )}
    </div>
  );
}
