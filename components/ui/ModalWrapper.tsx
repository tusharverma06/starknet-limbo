"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface ModalWrapperProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  preventClose?: boolean; // Prevent closing when clicking outside or during loading
  variant?: "bottom" | "center"; // bottom for drawers, center for modals
  className?: string;
}

export function ModalWrapper({
  isOpen,
  onClose,
  children,
  preventClose = false,
  variant = "center",
  className = "",
}: ModalWrapperProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const getMotionProps = () => {
    if (variant === "bottom") {
      return {
        initial: { y: "100%" },
        animate: { y: 0 },
        exit: { y: "100%" },
        transition: { type: "spring", damping: 25, stiffness: 200 },
      };
    }
    return {
      initial: { opacity: 0, scale: 0.95 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.95 },
      transition: { duration: 0.2 },
    };
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    // Only close if clicking directly on the backdrop (not on modal content)
    if (!preventClose && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop with blur effect using modal-bg.svg */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40"
          >
            {/* Background image with blur */}
            <div className="absolute inset-0 bg-black/50">
              <Image
                src="/modal-bg.svg"
                alt=""
                fill
                className="object-cover"
                priority
              />
            </div>
          </motion.div>

          {/* Modal Content Container - handles click outside */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50"
            onClick={handleBackdropClick}
          >
            <motion.div
              ref={modalRef}
              {...getMotionProps()}
              className={`${
                variant === "bottom"
                  ? "absolute bottom-0 left-0 right-0 max-w-md mx-auto"
                  : "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md px-4"
              } ${className}`}
              onClick={(e) => e.stopPropagation()}
            >
              {children}
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
