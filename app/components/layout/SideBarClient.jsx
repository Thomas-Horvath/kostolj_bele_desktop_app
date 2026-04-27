"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import styles from "../../styles/sidebar.module.scss";
import RecipeSearchPanel from "../recipes/RecipeSearchPanel";

function getCurrentTypeFromPath(pathname) {
  if (!pathname?.startsWith("/receptek/kategoria/")) {
    return "";
  }

  const [, , , typeParamName] = pathname.split("/");
  return typeParamName || "";
}

export default function SideBarClient({ orderedTypes }) {
  const pathname = usePathname();
  const currentType = getCurrentTypeFromPath(pathname);
  const [isMobilePanelOpen, setIsMobilePanelOpen] = useState(false);

  function closeMobilePanel() {
    setIsMobilePanelOpen(false);
  }

  return (
    <div className={styles.sidebar_shell}>
      <button
        type="button"
        className={styles.mobile_toggle}
        onClick={() => setIsMobilePanelOpen((prev) => !prev)}
        aria-expanded={isMobilePanelOpen}
        aria-controls="recipe-sidebar-panel"
      >
        <span>Kategóriák</span>
        <span className={styles.mobile_toggle_icon}>{isMobilePanelOpen ? "−" : "+"}</span>
      </button>

      <aside
        id="recipe-sidebar-panel"
        className={`${styles.aside} ${isMobilePanelOpen ? styles.mobile_panel_open : ""}`}
      >
        <div className={styles.category_container}>
          <div className={styles.section_heading}>
            <h2>Kategóriák</h2>
            <button
              type="button"
              className={styles.mobile_close}
              onClick={closeMobilePanel}
              aria-label="Kategóriák panel bezárása"
            >
              ×
            </button>
          </div>

          <ul className={styles.category_list}>
            <li className={styles.top_level_item}>
              <Link
                href="/receptek"
                className={`${styles.links} ${pathname === "/receptek" ? styles.active_link : ""}`}
                onClick={closeMobilePanel}
              >
                Összes
              </Link>
            </li>

            {orderedTypes.map((type) => {
              const isActiveType = currentType === type.paramName;

              return (
                <li key={type.id} className={styles.category_item}>
                  <Link
                    href={`/receptek/kategoria/${type.paramName}`}
                    className={`${styles.links} ${isActiveType ? styles.active_link : ""}`}
                    onClick={closeMobilePanel}
                  >
                    {type.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        <div className={styles.search_container}>
          <RecipeSearchPanel variant="sidebar" onSubmit={closeMobilePanel} />
        </div>
      </aside>
    </div>
  );
}
