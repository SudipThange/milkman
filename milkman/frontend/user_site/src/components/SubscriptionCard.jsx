import { motion } from "framer-motion";
import Button from "./Button";

export default function SubscriptionCard({ item, onSubscribe, isSubmitting = false, isSubscribed = false, isPending = false }) {
  const isRecommended = Boolean(item.recommended);

  return (
    <motion.article
      whileHover={{ y: -8 }}
      transition={{ duration: 0.22 }}
      className={`relative h-full cursor-pointer rounded-3xl border p-6 shadow-md backdrop-blur-md transition duration-300 ${
        isRecommended
          ? "border-pmGold bg-gradient-to-br from-white/78 to-pmGold/20 ring-2 ring-pmGold/70"
          : "border-white/45 bg-white/58"
      } ${
        isSubscribed && !isRecommended
          ? "ring-1 ring-pmDeep/25 border-pmDeep/35 bg-white/66"
          : ""
      } ${
        isPending && !isRecommended
          ? "ring-1 ring-amber-300/50 border-amber-200/80 bg-white/64"
          : ""
      }`}
    >
      {isSubscribed || isPending || isRecommended ? (
        <div className="mb-3 flex items-start justify-between gap-2">
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
              <span className="rounded-full bg-pmAccent px-3 py-1 text-xs font-bold text-pmDeep">
                Recommended
              </span>
            ) : null}
          </div>
        </div>
      ) : null}

      <h3 className="text-2xl font-bold">{item.title}</h3>
      <p className="mt-2 text-sm text-pmDeep/70">{item.description}</p>
      <div className="mt-5 grid grid-cols-2 gap-2 rounded-xl bg-white/65 p-3 text-sm">
        <p><span className="font-semibold">Qty:</span> {item.quantity}</p>
        <p><span className="font-semibold">Duration:</span> {item.duration}</p>
      </div>
      <p className="mt-5 text-3xl font-bold text-pmViolet">INR {item.price}</p>
      <Button
        className={`mt-5 w-full border shadow-md disabled:cursor-not-allowed ${
          isSubscribed
            ? "border-pmDeep/20 bg-pmDeep/25 text-pmDeep/65"
            : isPending
              ? "border-amber-300/70 bg-amber-100/80 text-amber-900"
            : "border-pmDeep bg-pmDeep text-white hover:bg-pmViolet"
        } disabled:opacity-80`}
        onClick={() => onSubscribe?.(item)}
        disabled={isSubmitting || isSubscribed || isPending}
      >
        {isSubscribed ? "Subscribed" : isPending ? "Pending Payment" : isSubmitting ? "Please wait..." : "Subscribe"}
      </Button>
    </motion.article>
  );
}
