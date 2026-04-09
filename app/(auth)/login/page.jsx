"use client";


import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { IoEyeOffOutline, IoEyeOutline } from "react-icons/io5";
import style from "../../styles/login.module.scss";


export default function SignIn() {
  const [userInfo, setUserInfo] = useState({ username: "", password: "" });
  const router = useRouter();
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({ username: "", password: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  function clearFieldError(fieldName) {
    setFieldErrors((prev) => ({ ...prev, [fieldName]: "" }));
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setFieldErrors({ username: "", password: "" });
    setIsSubmitting(true);

    try {
      const validationResponse = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userInfo),
      });

      const validationData = await validationResponse.json();

      if (!validationResponse.ok) {
        if (validationData.field) {
          setFieldErrors((prev) => ({
            ...prev,
            [validationData.field]: validationData.message,
          }));
        } else {
          setError(validationData.message || "Nem sikerült bejelentkezni.");
        }
        return;
      }

      const res = await signIn("credentials", {
        redirect: false,
        username: userInfo.username,
        password: userInfo.password,
      });

      if (res?.ok && !res?.error) {
        // A bejelentkezés után ráfrissítünk a kliens oldali auth állapotra is,
        // így a fejléc és a védett oldalak azonnal ugyanazt a sessiont látják.
        router.refresh();
        router.push("/profil");
        return;
      }

      setError("Nem sikerült bejelentkezni. Kérlek próbáld újra.");
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

        <p className={error ? style.error : style.hidden_error}> {error ? error : ""}</p>
        <button type="submit" className="btn-orange" disabled={isSubmitting}>
          {isSubmitting ? "Belépés..." : "Bejelentkezés"}
        </button>
      </form>
    </div>
  );
}
