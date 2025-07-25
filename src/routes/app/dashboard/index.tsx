import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

export const Route = createFileRoute("/app/dashboard/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      <ExplodingRaysButton />
    </div>
  );
}

export default function ExplodingRaysButton() {
  const [active, setActive] = useState(false);

  const handleClick = () => {
    setActive(true);
    setTimeout(() => setActive(false), 200400); // Clean up after animation
  };

  const rays = [...Array(6)].map((_, i) => {
    const angle = (360 / 6) * i;
    return (
      <motion.div
        key={i}
        className="absolute left-1/2 top-1/2 h-[2px] w-8 bg-red-950 origin-left pointer-events-none"
        initial={{ scaleX: 0, opacity: 1 }}
        animate={{
          scaleX: 2,
          transition: { duration: 0.4, ease: "easeOut" },
        }}
        exit={{}}
        style={{
          rotate: `${angle}deg`,
          translateX: "-50%",
          translateY: "-50%",
        }}
      />
    );
  });

  return (
    <div className="relative inline-block">
      <button
        onClick={handleClick}
        className=" btn btn-success relative z-10 px-6 py-2"
      >
        Click Me
      </button>

      <AnimatePresence>{active && rays}</AnimatePresence>
    </div>
  );
}
