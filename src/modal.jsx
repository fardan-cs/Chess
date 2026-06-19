import { useState, useEffect, useCallback } from "react";

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  closeOnBackdrop = true,
  showCloseButton = true,
}) {
  const [visible, setVisible] = useState(false);
  const [rendered, setRendered] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setRendered(true);
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
      const timer = setTimeout(() => setRendered(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleClose = useCallback(() => {
    setVisible(false);
    setTimeout(onClose, 300);
  }, [onClose]);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && isOpen && handleClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, handleClose]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!rendered) return null;

  const sizeMap = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    full: "max-w-3xl",
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
      aria-modal="true"
      role="dialog"
      aria-labelledby="modal-title"
    >
      <div
        className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
        onClick={closeOnBackdrop ? handleClose : undefined}
      />

      <div
        className={`relative w-full ${sizeMap[size]} bg-gray-700 border-2 border-gray-500 rounded-md shadow-2xl transition-all duration-300 ${
          visible
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 -translate-y-4"
        }`}
      >
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100">
            {title && (
              <h2 id="modal-title" className="text-lg font-semibold text-white">
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                onClick={handleClose}
                className="ml-auto -mr-1 p-1.5 rounded-lg text-white hover:text-gray-600 hover:bg-gray-100 transition-colors"
                aria-label="Close"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        )}

        <div className="px-6 py-5 text-white">{children}</div>
      </div>
    </div>
  );
}
