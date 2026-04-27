"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import ConfirmDialog from "../ui/ConfirmDialog";
import styles from "../../styles/profil.module.scss";
import recipesClient from "../../../lib/renderer/api/recipesClient";

export default function DeleteRecipeButton({ recipeId }) {
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const handleDelete = async () => {
    setIsDeleting(true);
    setDeleteError("");

    try {
      await recipesClient.remove(recipeId);
      setIsDialogOpen(false);
      router.refresh();
      router.push("/receptek");
    } catch {
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
