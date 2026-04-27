import { Suspense } from "react";
import SideBar from "../../../components/layout/SideBar";
import RecipesClient from "./RecipesClient";
import styles from "../../../styles/recipeLayout.module.scss";
import Spinner from "../../../components/ui/Spinner";

export default function RecipeLayout() {
  return (
     <section className={styles.layout}>
      <aside className={styles.sidebar}>
        <SideBar />
      </aside>
      <main className={styles.content}>
        <div className={styles.contentScroll}>
          {/* A receptek jobb oldali paneljet szandekosan itt, a kozos layoutban
              tartjuk eletben. Igy fo- es alkategoriavaltasnal nem mountol ujra
              az egesz tartalomterulet, hanem csak az adatai frissulnek. */}
          <Suspense fallback={<Spinner />}>
            <RecipesClient />
          </Suspense>
        </div>
      </main>
    </section>
  )

}
