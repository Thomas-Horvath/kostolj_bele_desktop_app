export const runtime = "nodejs";
export const dynamic = "force-dynamic"; // ne próbálja SSG-zni

import SideBar from "../../../components/layout/SideBar";
import styles from "../../../styles/recipeLayout.module.scss";

export default function RecipeLayout({ children }) {
  return (
     <section className={styles.layout}>
      <aside className={styles.sidebar}>
        <SideBar />
      </aside>
      <main className={styles.content}>
        {children}
      </main>
    </section>
  )

}
