"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useRate } from "../context/RateContext";
import ConfirmDialog from "./ConfirmDialog";
import styles from "../styles/profil.module.scss";

export default function DeleteRecipeButton({ recipeId }) {
  const { refreshRecipes } = useRate();
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const handleDelete = async () => {
    setIsDeleting(true);
    setDeleteError("");

    try {
      const res = await fetch(`/api/recipes/${recipeId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setIsDialogOpen(false);
        router.refresh();
        refreshRecipes();
        router.push("/receptek");
        return;
      }

      const data = await res.json().catch(() => null);
      setDeleteError(data?.error || "Hiba történt a törlés közben.");
    } catch (error) {
      setDeleteError("Hiba történt a törlés közben.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div>
        <button
          type="button"
          className="btn-orange"
          onClick={() => {
            setDeleteError("");
            setIsDialogOpen(true);
          }}
        >
          Törlés
        </button>
        {deleteError ? <p className={styles.errorBox}>{deleteError}</p> : null}
      </div>

      <ConfirmDialog
        open={isDialogOpen}
        title="Biztosan törlöd ezt a receptet?"
        message="A törlés végleges. A recepthez tartozó feltöltött kép is törlődni fog a rendszerből."
        confirmLabel="Igen, törlöm"
        cancelLabel="Mégsem"
        tone="danger"
        isSubmitting={isDeleting}
        onCancel={() => {
          if (!isDeleting) {
            setIsDialogOpen(false);
          }
        }}
        onConfirm={handleDelete}
      />
    </>
  );
}
