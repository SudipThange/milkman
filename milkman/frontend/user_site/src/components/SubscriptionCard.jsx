import { motion } from "framer-motion";
import Button from "./Button";

export default function SubscriptionCard({ item, onSubscribe, isSubmitting = false, isSubscribed = false, isPending = false }) {
  const isRecommended = Boolean(item.recommended);

  return (
    <motion.article
      whileHover={{ y: -8 }}
      transition={{ duration: 0.22 }}
      className={`pm-card-base relative flex h-full cursor-pointer flex-col ${
        isRecommended
          ? "border-freshCoral/70 bg-pastelCream ring-2 ring-freshCoral/35"
          : "border-softGray bg-paperWhite"
      } ${
        isSubscribed && !isRecommended
          ? "ring-1 ring-milkBlue/30 border-milkBlue/40 bg-milkBlueLight/55"
          : ""
      } ${
        isPending && !isRecommended
          ? "ring-1 ring-amber-300/50 border-amber-200/80 bg-pastelCream"
          : ""
      }`}
    >
      <div className="mb-3 flex min-h-7 items-start justify-between gap-2">
        <div>
          {isSubscribed ? (
            <span className="rounded-full border border-pmDeep/20 bg-pmDeep/10 px-3 py-1 text-xs font-bold text-pmDeep/75">
              Subscribed
            </span>
          ) : isPending ? (
            <span className="rounded-full border border-amber-300/70 bg-amber-100/75 px-3 py-1 text-xs font-bold text-amber-900">
              Pending Payment
            </span>
          ) : null}
        </div>
        <div>
          {isRecommended ? (
            <span className="rounded-full bg-freshCoral px-3 py-1 text-xs font-bold text-white">
              Recommended
            </span>
          ) : null}
        </div>
      </div>

      <h3 className="min-h-[64px] text-2xl font-bold leading-tight text-pmDeep">
        {item.title}
      </h3>
      <p className="mt-2 min-h-[44px] text-sm text-pmDeep/70">{item.description}</p>
      <div className="mt-5 grid grid-cols-2 gap-2 rounded-xl bg-milkBlueLight/65 p-3 text-sm">
        <p className="truncate whitespace-nowrap"><span className="font-semibold">Qty:</span> {item.quantity}</p>
        <p className="truncate whitespace-nowrap"><span className="font-semibold">Duration:</span> {item.duration}</p>
      </div>
      <div className="mt-auto pt-5">
        <p className="text-3xl font-bold text-pmViolet">Rs {item.price}</p>
        <Button
          className={`mt-5 w-full disabled:cursor-not-allowed ${
            isSubscribed
              ? "border-pmDeep/20 bg-pmDeep/25 text-pmDeep/65"
              : isPending
                ? "border-amber-300/70 bg-amber-100/80 text-amber-900"
              : "pm-btn-primary"
          } disabled:opacity-80`}
          onClick={() => onSubscribe?.(item)}
          disabled={isSubmitting || isSubscribed || isPending}
        >
          {isSubscribed ? "Subscribed" : isPending ? "Pending Payment" : isSubmitting ? "Please wait..." : "Subscribe"}
        </Button>
      </div>
    </motion.article>
  );
}
