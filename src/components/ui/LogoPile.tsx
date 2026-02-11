import clsx from 'clsx';

/** Generate a deterministic brand color from company name */
function companyToColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 40%, 55%)`;
}

function getInitial(name: string): string {
  return name.charAt(0).toUpperCase();
}

export interface LogoPileItem {
  id: string;
  name: string;
  logoUrl?: string;
}

interface Props {
  items: LogoPileItem[];
  max?: number;
  size?: 'sm' | 'md';
}

export default function LogoPile({ items, max = 4, size = 'sm' }: Props) {
  const visible = items.slice(0, max);
  const remaining = items.length - max;

  const dim = size === 'sm' ? 28 : 34;
  const overlap = size === 'sm' ? -6 : -8;
  const textSize = size === 'sm' ? 'text-[11px]' : 'text-[13px]';
  return (
    <div className="flex items-center" style={{ paddingLeft: Math.abs(overlap) }}>
      {visible.map((item, i) => (
        <div
          key={item.id}
          className={clsx(
            'relative flex items-center justify-center rounded-full border-2 border-white font-body font-bold text-white',
            textSize,
          )}
          style={{
            width: dim,
            height: dim,
            marginLeft: i === 0 ? 0 : overlap,
            zIndex: visible.length - i,
            backgroundColor: item.logoUrl ? '#fff' : companyToColor(item.name),
          }}
          title={item.name}
        >
          {item.logoUrl ? (
            <img
              src={item.logoUrl}
              alt={item.name}
              className="h-full w-full rounded-full object-cover"
            />
          ) : (
            getInitial(item.name)
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
