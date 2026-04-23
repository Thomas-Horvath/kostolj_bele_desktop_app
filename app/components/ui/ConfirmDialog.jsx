"use client";

import { useEffect } from "react";
import styles from "../../styles/confirmDialog.module.scss";

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Megerősítés",
  cancelLabel = "Mégse",
  tone = "danger",
  onConfirm,
  onCancel,
  isSubmitting = false,
}) {
  useEffect(() => {
    if (!open) {
      return;
    }

    function handleKeyDown(event) {
      if (event.key === "Escape" && !isSubmitting) {
        onCancel?.();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isSubmitting, onCancel, open]);

  if (!open) {
    return null;
  }

  return (
    <div
      className={styles.overlay}
      onClick={isSubmitting ? undefined : onCancel}
      role="presentation"
    >
      <div
        className={styles.dialog}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
      >
        <div className={styles.header}>
          <p className={styles.eyebrow}>
            {tone === "danger" ? "Megerősítés" : "Figyelem"}
          </p>
          <h2 id="confirm-dialog-title">{title}</h2>
        </div>

        <p className={styles.message}>{message}</p>

        <div className={styles.actions}>
          <button
            type="button"
            className="btn-green"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className={tone === "danger" ? "btn-orange" : "btn-green"}
            onClick={onConfirm}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Folyamatban..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

