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
    <div className="flex flex-col gap-4 rounded-2xl bg-white p-4 shadow-md sm:flex-row sm:items-center">
      <label className="inline-flex items-center gap-2 text-sm font-medium text-pmDeep/80">
        <input
          type="checkbox"
          checked={checked}
          onChange={(event) => onToggleSelection(item.id, event.target.checked)}
          className="h-4 w-4 rounded border-pmDeep/30 text-pmViolet focus:ring-pmViolet"
        />
        Select
      </label>
      <img src={item.image} alt={item.name} className="h-20 w-20 rounded-xl object-cover" />
      <div className="flex-1">
        <h3 className="font-semibold">{item.name}</h3>
        <p className="text-sm text-pmDeep/60">INR {item.price}</p>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={onDecrease} className="h-8 w-8 rounded-full bg-pmGold/30 text-pmDeep">-</button>
        <span className="w-6 text-center">{item.qty}</span>
        <button onClick={onIncrease} className="h-8 w-8 rounded-full bg-pmGold/30 text-pmDeep">+</button>
      </div>
      <Button onClick={onRemove} className="bg-pmAccent/25 text-pmDeep">Remove</Button>
    </div>
  );
}
