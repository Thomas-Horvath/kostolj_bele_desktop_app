"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import styles from "../../styles/sidebar.module.scss";

function getCurrentTypeFromPath(pathname) {
  if (!pathname?.startsWith("/receptek/kategoria/")) {
    return "";
  }

  const [, , , typeParamName] = pathname.split("/");
  return typeParamName || "";
}

export default function SideBarClient({ orderedTypes }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentType = getCurrentTypeFromPath(pathname);
  const currentSubtype = searchParams.get("subtype") || "";
  const [isMobilePanelOpen, setIsMobilePanelOpen] = useState(false);
  const [openCategory, setOpenCategory] = useState(currentType || "");

  useEffect(() => {
    setOpenCategory(currentType || "");
  }, [currentType]);

  function handleCategoryToggle(categoryParamName) {
    setOpenCategory((prev) => (prev === categoryParamName ? "" : categoryParamName));
  }

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
        <span>Kategóriák és keresés</span>
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
                className={`${styles.links} ${pathname === "/receptek" && !currentSubtype ? styles.active_link : ""}`}
                onClick={closeMobilePanel}
              >
                Összes
              </Link>
            </li>

            {orderedTypes.map((type) => {
              const hasSubtypes = type.subtypes.length > 0;
              const isOpen = openCategory === type.paramName;
              const isActiveType = currentType === type.paramName;

              return (
                <li key={type.id} className={styles.category_item}>
                  <div
                    className={`${styles.category_row} ${hasSubtypes && isOpen ? styles.category_row_open : ""}`}
                  >
                    <Link
                      href={`/receptek/kategoria/${type.paramName}`}
                      className={`${styles.links} ${isActiveType && !currentSubtype ? styles.active_link : ""}`}
                      onClick={closeMobilePanel}
                    >
                      {type.name}
                    </Link>

                    {hasSubtypes ? (
                      <button
                        type="button"
                        className={styles.category_toggle}
                        onClick={() => handleCategoryToggle(type.paramName)}
                        aria-expanded={isOpen}
                        aria-label={`${type.name} alkategóriák ${isOpen ? "elrejtése" : "megjelenítése"}`}
                      >
                        <span
                          className={`${styles.chevron} ${isOpen ? styles.chevron_open : ""}`}
                          aria-hidden="true"
                        />
                      </button>
                    ) : null}
                  </div>

                  {hasSubtypes && isOpen ? (
                    <ul className={styles.subcategory_list}>
                      {type.subtypes.map((subtype) => {
                        const isActiveSubtype =
                          currentType === type.paramName && currentSubtype === subtype.paramName;

                        return (
                          <li key={subtype.paramName} className={styles.subcategory_item}>
                            <Link
                              href={`/receptek/kategoria/${type.paramName}?subtype=${subtype.paramName}`}
                              className={`${styles.subcategory_link} ${isActiveSubtype ? styles.active_sublink : ""}`}
                              onClick={closeMobilePanel}
                            >
                              {subtype.name}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </div>

        <div className={styles.about_container}>
          <h2>Keresés</h2>
          <form action="/receptek" className={styles.form_container}>
            <input
              type="text"
              name="q"
              placeholder="Keresés név, kategória vagy alkategória alapján..."
            />
            <p className={styles.help_text}>
              Példa: húsételek, csirke, desszertek, krémlevesek
            </p>
            <button type="submit" className="btn-orange" onClick={closeMobilePanel}>
              Keresés
            </button>
          </form>
        </div>
      </aside>
    </div>
  );
}

