"use client";

import { useEffect, useState } from "react";
import SideBarClient from "./SideBarClient";
import Spinner from "../ui/Spinner";
import recipesClient from "../../../lib/renderer/api/recipesClient";

const SideBar = () => {
  const [orderedTypes, setOrderedTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadTypes() {
      try {
        const data = await recipesClient.listTypes();

        if (isMounted) {
          setOrderedTypes(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error("Nem sikerült lekérdezni a kategóriákat.", error);

        if (isMounted) {
          setOrderedTypes([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    // A sidebar mar nem szerverkomponensbol olvassa a Prisma-t.
    // Ezzel egy ujabb lepesben kiszedjuk a renderer kozeleben levo
    // kozvetlen adatbazis-fuggoseget.
    loadTypes();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return <Spinner />;
  }

  return <SideBarClient orderedTypes={orderedTypes} />;
};

export default SideBar;
