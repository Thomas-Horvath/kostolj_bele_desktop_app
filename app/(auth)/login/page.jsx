"use client";


import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { IoEyeOffOutline, IoEyeOutline } from "react-icons/io5";
import style from "../../styles/login.module.scss";
import { useDesktopAuth } from "../../context/DesktopAuthContext";


export default function SignIn() {
  const [userInfo, setUserInfo] = useState({ username: "", password: "" });
  const router = useRouter();
  const { login, isAuthenticated, status, runtimeError } = useDesktopAuth();
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({ username: "", password: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  function clearFieldError(fieldName) {
    setFieldErrors((prev) => ({ ...prev, [fieldName]: "" }));
  }

  useEffect(() => {
    if (status === "authenticated" && isAuthenticated) {
      router.replace("/profil");
    }
  }, [isAuthenticated, router, status]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setFieldErrors({ username: "", password: "" });
    setIsSubmitting(true);

    try {
      // A login mar nem ketlepcsos /api/login + next-auth folyamat,
      // hanem egyetlen desktop auth hivas az Electron main process fele.
      const result = await login(userInfo);

      if (!result?.ok) {
        if (result?.field) {
          setFieldErrors((prev) => ({
            ...prev,
            [result.field]: result.message,
          }));
        } else {
          setError(result?.message || "Nem sikerült bejelentkezni.");
        }
        return;
      }

      router.refresh();
      router.push("/profil");
    } catch {
      setError("Váratlan hiba történt a bejelentkezés során.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={style.container}>
      <form onSubmit={handleSubmit} className={style.form}>
        <h1>Bejelentkezés</h1>
        <input
          type="text"
          placeholder="Felhasználónév"
          value={userInfo.username}
          className={fieldErrors.username ? style.field_error : ""}
          onChange={(e) => {
            setUserInfo({ ...userInfo, username: e.target.value });
            if (e.target.value.trim()) {
              clearFieldError("username");
            }
          }}
        />
        <p className={fieldErrors.username ? style.field_error_text : style.hidden_field_error}>
          {fieldErrors.username || ""}
        </p>

        <div className={style.password_field}>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Jelszó"
            value={userInfo.password}
            className={fieldErrors.password ? style.field_error : ""}
            onChange={(e) => {
              setUserInfo({ ...userInfo, password: e.target.value });
              if (e.target.value.trim()) {
                clearFieldError("password");
              }
            }}
          />
          <button
            type="button"
            className={style.password_toggle}
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? "Jelszó elrejtése" : "Jelszó megjelenítése"}
          >
            {showPassword ? <IoEyeOffOutline /> : <IoEyeOutline />}
          </button>
        </div>
        <p className={fieldErrors.password ? style.field_error_text : style.hidden_field_error}>
          {fieldErrors.password || ""}
        </p>

        <p className={error ? style.error : style.hidden_error}>
          {error || runtimeError || ""}
        </p>
        <button type="submit" className="btn-orange" disabled={isSubmitting}>
          {isSubmitting ? "Belépés..." : "Bejelentkezés"}
        </button>
      </form>
    </div>
  );
}
