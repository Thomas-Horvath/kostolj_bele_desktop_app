// Ezek a tartalomblokkok hajtják meg a footerben szereplő információs oldalakat.
// Közös adatforrásból dolgozunk, így a szövegek és metaadatok egy helyen karbantarthatók.
export const siteContent = {
  faq: {
    title: "GYIK",
    eyebrow: "Segítség",
    intro:
      "Összegyűjtöttük a leggyakoribb kérdéseket, hogy gyorsan eligazodj a receptfeltöltés, a keresés és a felhasználói működés körül.",
    sections: [
      {
        title: "Hogyan találok gyorsan receptet?",
        paragraphs: [
          "A Receptek oldalon név vagy kategória alapján tudsz keresni. Ha biztosan tudod, mit főznél, a név a leggyorsabb út. Ha még csak ötletet keresel, a kategóriák segítenek szűkíteni.",
          "A receptkártyákon rögtön látod az értékelést is, így könnyebb kiválasztani a legnépszerűbb fogásokat."
        ]
      },
      {
        title: "Ki tölthet fel új receptet?",
        paragraphs: [
          "Receptet csak bejelentkezett felhasználó hozhat létre. A szerkesztés és törlés a saját recepteknél érhető el, admin jogosultsággal pedig ellenőrzési és kezelési feladatok is elláthatók."
        ]
      },
      {
        title: "Hogyan jönnek létre az új felhasználók?",
        paragraphs: [
          "A publikus regisztráció ki lett vezetve. Új felhasználót a fő admin, Tamás tud létrehozni a profiloldal admin szekciójából."
        ]
      }
    ]
  },
  support: {
    title: "Támogatás",
    eyebrow: "Segítség",
    intro:
      "Ha elakadsz a használat közben, itt találod, milyen problémákkal tudunk segíteni, és hogyan érdemes jelezni egy hibát vagy kérést.",
    sections: [
      {
        title: "Miben tudunk segíteni?",
        paragraphs: [
          "Támogatást nyújtunk bejelentkezési problémák, receptkezelési hibák, jogosultsági kérdések és adatfrissítési eltérések esetén.",
          "Ha például egy recept nem mentődik, nem jelenik meg a képe, vagy hibásan látszanak a kedvencek, ez már jó ok arra, hogy szólj."
        ]
      },
      {
        title: "Milyen adatot érdemes elküldeni?",
        paragraphs: [
          "A hibabejelentés akkor a leghasznosabb, ha tartalmazza az érintett oldal nevét, a műveletet, amit végeztél, és azt, hogy pontosan mi történt. Egy képernyőkép vagy pontos szöveg sokat segít."
        ]
      }
    ]
  },
  contact: {
    title: "Kapcsolatfelvétel",
    eyebrow: "Segítség",
    intro:
      "Örülünk minden visszajelzésnek, ötletnek és együttműködési megkeresésnek. Az oldal a közös receptélményről szól, ezért fontos számunkra a közvetlen kapcsolat.",
    sections: [
      {
        title: "Elérhetőségek",
        paragraphs: [
          "Email: hello@kostoljbele.hu",
          "Közösségi média: a footerben található csatornákon is követheted a projektet."
        ]
      },
      {
        title: "Mikor érdemes írni?",
        paragraphs: [
          "Ha új funkcióötleted van, hibát találtál, tartalmi együttműködésben gondolkodsz, vagy csak szeretnél visszajelzést adni a receptek használhatóságáról."
        ]
      }
    ]
  },
  terms: {
    title: "Felhasználási Feltételek",
    eyebrow: "Linkek",
    intro:
      "Az oldal használatával elfogadod az alapvető működési és tartalomkezelési szabályokat. Ezek a feltételek azt szolgálják, hogy a recepttár átlátható és biztonságos maradjon.",
    sections: [
      {
        title: "Felhasználói magatartás",
        paragraphs: [
          "Csak olyan tartalmat tölts fel, amelynek közzétételére jogosult vagy. Kerüld a sértő, félrevezető vagy másokat megtévesztő tartalmakat.",
          "A receptoldal célja az inspiráció és a megosztás, ezért a közösségi hangvétel és az átlátható leírás kiemelten fontos."
        ]
      },
      {
        title: "Tartalomkezelés",
        paragraphs: [
          "A recept létrehozója felel a feltöltött tartalom pontosságáért. Admin jogosultsággal a rendszerüzemeltető módosíthat vagy eltávolíthat problémás bejegyzéseket."
        ]
      }
    ]
  },
  privacy: {
    title: "Adatvédelmi Irányelvek",
    eyebrow: "Linkek",
    intro:
      "Fontos, hogy világosan lásd, milyen adatokat kezel a rendszer, és miért van rájuk szükség a működéshez.",
    sections: [
      {
        title: "Milyen adatokat kezelünk?",
        paragraphs: [
          "A rendszer a bejelentkezéshez és felhasználókezeléshez szükséges alapadatokat tárolja, például felhasználónevet, email címet és biztonságosan hash-elt jelszót.",
          "A receptekhez kapcsolódó tartalmak, kedvencek és értékelések szintén az alkalmazás működéséhez kapcsolódó adatok."
        ]
      },
      {
        title: "Miért kezeljük ezeket?",
        paragraphs: [
          "Az adatok a fiókazonosítást, a receptkezelést, a jogosultságok elkülönítését és a személyre szabott funkciókat, például a kedvencek kezelését szolgálják."
        ]
      }
    ]
  },
  blog: {
    title: "Blog",
    eyebrow: "Linkek",
    intro:
      "A blog a receptoldal szerkesztői hátterét mutatja meg: főzési ötletek, rendszerezési szempontok, konyhai tippek és kulisszatitkok jelenhetnek meg itt.",
    sections: [
      {
        title: "Milyen tartalmak várhatók?",
        paragraphs: [
          "Szezonális válogatások, gyors vacsoraötletek, alapanyag-fókuszú cikkek és olyan anyagok, amelyek segítenek eligazodni a receptgyűjteményben."
        ]
      },
      {
        title: "Mi a célja?",
        paragraphs: [
          "Nem csak recepteket szeretnénk listázni, hanem kontextust is adni hozzájuk: mikor érdemes elkészíteni őket, hogyan lehet variálni, és mire figyelj az elkészítés közben."
        ]
      }
    ]
  },
  company: {
    title: "Cégünkről",
    eyebrow: "Rólunk",
    intro:
      "A Kóstolj Bele! egy olyan receptgyűjtő felületként készült, ahol a használhatóság, a vizuális élmény és a könnyű szerkeszthetőség egyszerre fontos.",
    sections: [
      {
        title: "Küldetésünk",
        paragraphs: [
          "Olyan főzős élményt szeretnénk adni, ahol a jó receptek nem vesznek el, hanem szépen rendszerezve, gyorsan kereshetően és inspiráló környezetben jelennek meg."
        ]
      },
      {
        title: "Mire figyelünk?",
        paragraphs: [
          "Átlátható szerkezetre, könnyen olvasható receptoldalakra, gyors böngészésre és olyan admin működésre, amely kis csapattal is fenntartható."
        ]
      }
    ]
  },
  team: {
    title: "Csapatunk",
    eyebrow: "Rólunk",
    intro:
      "A projekt mögött kis, fókuszált alkotói szemlélet áll: egyszerre fontos a jó tartalom, a működő technikai háttér és az igényes megjelenés.",
    sections: [
      {
        title: "Kik dolgoznak rajta?",
        paragraphs: [
          "A platform szerkesztése és adminisztrációja jelenleg szűk csapatban történik. A fő admin, Tamás gondoskodik a felhasználók kezeléséről és a rendszer összefogásáról."
        ]
      },
      {
        title: "Hogyan működünk együtt?",
        paragraphs: [
          "A receptek, a felhasználói élmény és a technikai működés folyamatosan egymásra épülnek. Ezért a fejlesztés során a tartalom és a felület egyszerre kap hangsúlyt."
        ]
      }
    ]
  },
  career: {
    title: "Karrier",
    eyebrow: "Rólunk",
    intro:
      "Bár a projekt jelenleg kompakt felállásban működik, hosszabb távon nyitott a bővülésre és együttműködésekre.",
    sections: [
      {
        title: "Milyen területeken lehet kapcsolódni?",
        paragraphs: [
          "Tartalomkészítés, receptszerkesztés, UX/UI finomhangolás, frontend fejlesztés és technikai üzemeltetés mind olyan terület, ahol értéket lehet hozzáadni."
        ]
      },
      {
        title: "Kinek szól?",
        paragraphs: [
          "Azoknak, akik szeretik az átlátható digitális termékeket, a gasztronómiai témákat és szívesen dolgoznának egy kisebb, igényes platform fejlődésén."
        ]
      }
    ]
  },
  press: {
    title: "Sajtó",
    eyebrow: "Rólunk",
    intro:
      "A sajtóoldal röviden összefoglalja, miről szól a projekt, és milyen témák mentén érdemes bemutatni vagy hivatkozni rá.",
    sections: [
      {
        title: "Miről érdemes beszélni a projektről?",
        paragraphs: [
          "A Kóstolj Bele! egy vizuálisan rendezett receptplatform, amely a klasszikus receptgyűjtés és a modern böngészési élmény között teremt kapcsolatot."
        ]
      },
      {
        title: "Sajtókapcsolat",
        paragraphs: [
          "Megkeresésekhez és bemutatkozó anyagokhoz a kapcsolatfelvételi oldalon szereplő email cím használható."
        ]
      }
    ]
  }
};
