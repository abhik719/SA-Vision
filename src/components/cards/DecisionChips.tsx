interface Props {
  chips: string[];
}

export default function DecisionChips({ chips }: Props) {
  return (
    <div className="flex flex-wrap gap-[4px]">
      <span className="font-body text-ds-small font-semibold text-li-text-tertiary">
        Decisions:
      </span>
      {chips.map((chip, i) => (
        <span
          key={i}
          className="rounded-ds-spotlight bg-[#DDE7F1] px-[8px] py-[2px] font-body text-ds-small font-medium text-li-blue"
        >
          {chip}
        </span>
      ))}
    </div>
  );
}
