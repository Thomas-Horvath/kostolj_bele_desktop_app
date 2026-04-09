"use client";
import { useRouter } from "next/navigation";
import { useRate } from "../context/RateContext";

export default function DeleteRecipeButton({ recipeId }) {
  const { refreshRecipes } = useRate();
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm("Biztosan törlöd a receptet?")) return;

    const res = await fetch(`/api/recipes/${recipeId}`, {
      method: "DELETE",
    });

    if (res.ok) {
      router.refresh();
      refreshRecipes();
      router.push("/receptek"); // visszanavigál a lista oldalra
    } else {
      alert("Hiba történt a törlés közben.");
    }
  };

  return (
    <button type="button" className="btn-orange" onClick={handleDelete}>
      Törlés
    </button>
  );
}
