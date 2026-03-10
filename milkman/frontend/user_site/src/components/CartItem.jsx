import Button from "./Button";

export default function CartItem({
  item,
  checked,
  onToggleSelection,
  onIncrease,
  onDecrease,
  onRemove,
}) {
  return (
    <div className="group flex flex-col gap-4 rounded-2xl border border-white/50 bg-white/90 p-4 shadow-md transition duration-200 hover:border-pmGold/40 hover:shadow-lg sm:flex-row sm:items-center">
      <label className="inline-flex select-none items-center gap-2.5 text-sm font-semibold text-pmDeep/85">
        <input
          type="checkbox"
          checked={checked}
          onChange={(event) => onToggleSelection(item.id, event.target.checked)}
          className="peer sr-only"
        />
        <span
          aria-hidden="true"
          className="grid h-5 w-5 place-items-center rounded-md border-2 border-pmDeep/40 bg-white text-sm font-black leading-none text-transparent shadow-sm transition-all duration-200 peer-checked:border-pmViolet peer-checked:bg-pmViolet peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-pmViolet/50 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-white"
        >
          ✓
        </span>
        Select
      </label>

      <img src={item.image} alt={item.name} className="h-20 w-20 rounded-xl border border-pmDeep/10 object-cover shadow-sm" />

      <div className="flex-1">
        <h3 className="text-xl font-bold text-pmDeep">{item.name}</h3>
        <p className="text-sm font-medium text-pmDeep/65">Rs {item.price}</p>
      </div>

      <div className="flex items-center gap-2 rounded-full border border-pmDeep/10 bg-white/85 p-1.5">
        <button
          onClick={onDecrease}
          disabled={item.qty <= 1}
          className="h-8 w-8 rounded-full bg-pmGold/35 text-lg font-bold text-pmDeep transition hover:bg-pmGold/55 disabled:cursor-not-allowed disabled:opacity-45"
          aria-label={`Decrease quantity for ${item.name}`}
        >
          -
        </button>
        <span className="w-7 text-center text-base font-bold text-pmDeep">{item.qty}</span>
        <button
          onClick={onIncrease}
          className="h-8 w-8 rounded-full bg-pmGold/35 text-lg font-bold text-pmDeep transition hover:bg-pmGold/55"
          aria-label={`Increase quantity for ${item.name}`}
        >
          +
        </button>
      </div>

      <Button onClick={onRemove} className="border border-pmAccent/55 bg-pmAccent/30 text-pmDeep hover:bg-pmAccent/45">Remove</Button>
    </div>
  );
}
