"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { IoEyeOffOutline, IoEyeOutline } from "react-icons/io5";
import DeleteRecipeButton from "../../components/recipes/DeleteRecepiButton";
import styles from "../../styles/profil.module.scss";
import Spinner from "../../components/ui/Spinner";
import { useDesktopAuth } from "../../context/DesktopAuthContext";
import backupClient from "../../../lib/renderer/api/backupClient";
import profileClient from "../../../lib/renderer/api/profileClient";

const initialUserForm = {
  name: "",
  username: "",
  email: "",
  password: "",
};

export default function ProfilPage() {
  const { user, status } = useDesktopAuth();
  const router = useRouter();

  const [recipes, setRecipes] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [canManageUsers, setCanManageUsers] = useState(false);
  const [userForm, setUserForm] = useState(initialUserForm);
  const [pageError, setPageError] = useState("");
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [backupError, setBackupError] = useState("");
  const [backupSuccess, setBackupSuccess] = useState("");
  const [isExportingBackup, setIsExportingBackup] = useState(false);
  const [isImportingBackup, setIsImportingBackup] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [userFormErrors, setUserFormErrors] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
  });

  function clearUserFormError(fieldName) {
    setUserFormErrors((prev) => ({ ...prev, [fieldName]: "" }));
  }

  function validateUserForm() {
    const nextErrors = {
      name: "",
      username: "",
      email: "",
      password: "",
    };

    if (!userForm.name.trim()) {
      nextErrors.name = "A név megadása kötelező.";
    }

    if (!userForm.username.trim()) {
      nextErrors.username = "A felhasználónév megadása kötelező.";
    }

    if (!userForm.email.trim()) {
      nextErrors.email = "Az email cím megadása kötelező.";
    }

    if (!userForm.password.trim()) {
      nextErrors.password = "A jelszó megadása kötelező.";
    }

    setUserFormErrors(nextErrors);
    return !Object.values(nextErrors).some(Boolean);
  }

  // A védett oldalaknál kliensoldalon is visszairányítjuk a vendéget,
  // hogy ne maradjon a félkész UI-ban unauthenticated állapotban.
  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/");
    }
  }, [status, router]);

  // A profil minden tartalmát egyetlen desktop klienshívással kérjük le.
  // A React oldal nem ismeri az IPC vagy Prisma részleteit, csak a profileClientet.
  async function fetchProfileData() {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setPageError("");

    try {
      const data = await profileClient.get();

      setRecipes(data.ownRecipes || []);
      setFavorites(data.favoriteRecipes || []);
      setUsers(data.users || []);
      setCurrentUser(data.currentUser || null);
      setCanManageUsers(Boolean(data.canManageUsers));
    } catch (err) {
      setPageError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProfileData();
    // Itt tudatosan a session változására reagálunk, nem a lokális függvényreferenciára.
    // Ha a függvényt dependencyként figyelnénk, minden renderrel újrafutna a lekérés.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  async function handleCreateUser(e) {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");
    setUserFormErrors({
      name: "",
      username: "",
      email: "",
      password: "",
    });

    if (!validateUserForm()) {
      setFormError("Kérlek javítsd a pirossal jelölt mezőket.");
      return;
    }

    setIsSubmitting(true);

    try {
      const data = await profileClient.createUser(userForm);

      // Siker után kiürítjük a formot és újrahúzzuk az admin listát,
      // hogy a friss user azonnal látszódjon is a profilban.
      setUserForm(initialUserForm);
      setUserFormErrors({
        name: "",
        username: "",
        email: "",
        password: "",
      });
      setShowAdminPassword(false);
      setFormSuccess(`A(z) ${data.user.username} felhasználó létrejött.`);
      await fetchProfileData();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleExportBackup() {
    setBackupError("");
    setBackupSuccess("");
    setIsExportingBackup(true);

    try {
      const result = await backupClient.exportData();

      if (result?.canceled) {
        return;
      }

      setBackupSuccess(
        `A biztonsági mentés elkészült ezen a helyen: ${result.backupDirectoryPath}`
      );
    } catch (err) {
      setBackupError(
        err instanceof Error
          ? err.message
          : "A backup exportálása közben váratlan hiba történt."
      );
    } finally {
      setIsExportingBackup(false);
    }
  }

  async function handleImportBackup() {
    setBackupError("");
    setBackupSuccess("");
    setIsImportingBackup(true);

    try {
      const result = await backupClient.importData();

      if (result?.canceled) {
        return;
      }

      setBackupSuccess(
        "A backup visszaállítása elkészült. Az alkalmazás újraindul."
      );
    } catch (err) {
      setBackupError(
        err instanceof Error
          ? err.message
          : "A backup visszaállítása közben váratlan hiba történt."
      );
    } finally {
      setIsImportingBackup(false);
    }
  }

  if (loading || status === "loading") {
    return <Spinner />;
  }

  if (pageError) {
    return (
      <section className={styles.page}>
        <div className={styles.hero}>
          <div>
            <p className={styles.eyebrow}>Profil központ</p>
            <h1>Nem sikerült betölteni a profilt</h1>
            <p className={styles.lead}>{pageError}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.page}>
      <div className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>Profil központ</p>
          <h1>Szia, {user?.username}!</h1>
          <p className={styles.lead}>
            Itt éred el a saját receptjeidet, a kedvenceidet, és adminként az
            új felhasználók létrehozását is.
          </p>
        </div>

        <div className={styles.summaryCard}>
          <p>
            <span>Szerepkör</span>
            <strong>{currentUser?.role === "ADMIN" ? "Admin" : "Felhasználó"}</strong>
          </p>
          <p>
            <span>Saját receptek</span>
            <strong>{recipes.length}</strong>
          </p>
          <p>
            <span>Kedvencek</span>
            <strong>{favorites.length}</strong>
          </p>
        </div>
      </div>

      <div className={styles.grid}>
        <section className={`${styles.panel} ${styles.createRecipeBanner}`}>
          <div className={styles.createRecipeBannerInner}>
            <div>
              <p className={styles.sectionLabel}>Gyors indítás</p>
              <h2>Új recept felvétele</h2>
              <p className={styles.bannerText}>
                Ha most szeretnél elmenteni egy új ételt, innen egy kattintással
                elindíthatod a recept létrehozását.
              </p>
            </div>
            <Link className="btn-orange" href="/receptek/ujrecept">
              Új recept létrehozása
            </Link>
          </div>
        </section>

        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <p className={styles.sectionLabel}>Receptek</p>
              <h2>Saját receptjeid</h2>
            </div>
          </div>

          {recipes.length === 0 ? (
            <p className={styles.emptyState}>
              Még nincs saját recepted. Innen tudsz új receptet indítani.
            </p>
          ) : (
            <ul className={styles.recipeList}>
              {recipes.map((recipe) => (
                <li key={`own-${recipe.id}`} className={styles.recipeItem}>
                  <div>
                    <p className={styles.recipeTitle}>{recipe.name}</p>
                    <Link href={`/receptek/${recipe.slug}`} className={styles.inlineLink}>
                      Recept megnyitása
                    </Link>
                  </div>

                  <div className={styles.actions}>
                    <Link className="btn-green" href={`/receptek/szerkesztes/${recipe.slug}`}>
                      Szerkesztés
                    </Link>
                    <DeleteRecipeButton recipeId={recipe.id} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <p className={styles.sectionLabel}>Kedvencek</p>
              <h2>Mentett receptek</h2>
            </div>
          </div>

          {favorites.length === 0 ? (
            <p className={styles.emptyState}>
              Még nincs kedvenc recepted. A szív ikonra kattintva tudsz menteni.
            </p>
          ) : (
            <ul className={styles.favoriteList}>
              {favorites.map((favorite) => (
                <li key={`fav-${favorite.recipe.id}`} className={styles.favoriteItem}>
                  <Link href={`/receptek/${favorite.recipe.slug}`} className={styles.inlineLink}>
                    {favorite.recipe.name}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {canManageUsers && (
        <section className={`${styles.panel} ${styles.adminPanel}`}>
          <div className={styles.panelHeader}>
            <div>
              <p className={styles.sectionLabel}>Admin</p>
              <h2>Felhasználók kezelése</h2>
            </div>
          </div>

          <div className={styles.adminGrid}>
            <form className={styles.userForm} onSubmit={handleCreateUser} noValidate>
              <label>
                Név
                <input
                  type="text"
                  value={userForm.name}
                  className={userFormErrors.name ? styles.fieldError : ""}
                  onChange={(e) => {
                    setUserForm((prev) => ({ ...prev, name: e.target.value }));
                    if (e.target.value.trim()) {
                      clearUserFormError("name");
                    }
                  }}
                  placeholder="Például: Katinka"
                />
                <span className={userFormErrors.name ? styles.fieldErrorText : styles.hiddenFieldError}>
                  {userFormErrors.name || ""}
                </span>
              </label>

              <label>
                Felhasználónév
                <input
                  type="text"
                  value={userForm.username}
                  className={userFormErrors.username ? styles.fieldError : ""}
                  onChange={(e) => {
                    setUserForm((prev) => ({ ...prev, username: e.target.value }));
                    if (e.target.value.trim()) {
                      clearUserFormError("username");
                    }
                  }}
                  placeholder="Egyedi belépési név"
                />
                <span className={userFormErrors.username ? styles.fieldErrorText : styles.hiddenFieldError}>
                  {userFormErrors.username || ""}
                </span>
              </label>

              <label>
                Email
                <input
                  type="email"
                  value={userForm.email}
                  className={userFormErrors.email ? styles.fieldError : ""}
                  onChange={(e) => {
                    setUserForm((prev) => ({ ...prev, email: e.target.value }));
                    if (e.target.value.trim()) {
                      clearUserFormError("email");
                    }
                  }}
                  placeholder="pelda@email.hu"
                />
                <span className={userFormErrors.email ? styles.fieldErrorText : styles.hiddenFieldError}>
                  {userFormErrors.email || ""}
                </span>
              </label>

              <label>
                Jelszó
                <div className={styles.passwordField}>
                  <input
                    type={showAdminPassword ? "text" : "password"}
                    value={userForm.password}
                    className={userFormErrors.password ? styles.fieldError : ""}
                    onChange={(e) => {
                      setUserForm((prev) => ({ ...prev, password: e.target.value }));
                      if (e.target.value.trim()) {
                        clearUserFormError("password");
                      }
                    }}
                    placeholder="Jelszó"
                  />
                  <button
                    type="button"
                    className={styles.passwordToggle}
                    onClick={() => setShowAdminPassword((prev) => !prev)}
                    aria-label={showAdminPassword ? "Jelszó elrejtése" : "Jelszó megjelenítése"}
                  >
                    {showAdminPassword ? <IoEyeOffOutline /> : <IoEyeOutline />}
                  </button>
                </div>
                <span className={userFormErrors.password ? styles.fieldErrorText : styles.hiddenFieldError}>
                  {userFormErrors.password || ""}
                </span>
              </label>

              {formError ? <p className={styles.errorBox}>{formError}</p> : null}
              {formSuccess ? <p className={styles.successBox}>{formSuccess}</p> : null}

              <button className="btn-orange" type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Létrehozás..." : "Felhasználó hozzáadása"}
              </button>
            </form>

            <div className={styles.userListBox}>
              <h3>Aktív felhasználók</h3>
              <ul className={styles.userList}>
                {users.map((user) => (
                  <li key={user.id} className={styles.userItem}>
                    <div>
                      <strong>{user.name}</strong>
                      <p>{user.username}</p>
                    </div>
                    <div className={styles.userMeta}>
                      <span>{user.email}</span>
                      <span>{user.role === "ADMIN" ? "Admin" : "User"}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      <section className={`${styles.panel} ${styles.backupPanel}`}>
        <div className={styles.panelHeader}>
          <div>
            <p className={styles.backupLabel}>Adatvédelem</p>
            <h2>Biztonsági mentés és visszaállítás</h2>
          </div>
        </div>

        <div className={styles.backupIntro}>
          <p>
            Itt tudod lementeni az alkalmazás összes fontos adatát, hogy később
            ugyanazokat a recepteket és képeket tudd használni.
          </p>
          <p>
            Ez akkor hasznos, ha új gépre költözöl, újratelepíted az appot,
            vagy szeretnél egy saját biztonsági másolatot megőrizni.
          </p>
        </div>

        <div className={styles.backupInfoGrid}>
          <article className={styles.backupInfoCard}>
            <h3>Mit ment el?</h3>
            <p>
              A recepteket, a profilhoz tartozó adatokat és a receptképeket egy
              közös mentésbe teszi.
            </p>
          </article>

          <article className={styles.backupInfoCard}>
            <h3>Mikor érdemes használni?</h3>
            <p>
              Mielőtt gépet váltasz, Windows újratelepítés előtt, vagy ha csak
              szeretnél egy biztos másolatot félretenni.
            </p>
          </article>
        </div>

        <div className={styles.backupWarningBox}>
          <strong>Figyelem:</strong> a visszaállítás a jelenlegi adatokat
          lecseréli a kiválasztott mentés tartalmára.
        </div>

        <div className={styles.backupActions}>
          <button
            type="button"
            className="btn-green"
            onClick={handleExportBackup}
            disabled={isExportingBackup || isImportingBackup}
          >
            {isExportingBackup ? "Backup készül..." : "Backup exportálása"}
          </button>
          <button
            type="button"
            className={`${styles.restoreButton} btn-orange`}
            onClick={handleImportBackup}
            disabled={isExportingBackup || isImportingBackup}
          >
            {isImportingBackup ? "Visszaállítás..." : "Backup visszaállítása"}
          </button>
        </div>

        {backupError ? <p className={styles.errorBox}>{backupError}</p> : null}
        {backupSuccess ? <p className={styles.successBox}>{backupSuccess}</p> : null}

        <p className={styles.backupHint}>
          A mentés exportálásával egy külön másolat készül. A visszaállításnál
          pedig egy korábban elmentett állapotot tudsz visszahozni.
        </p>
      </section>
    </section>
  );
}
