-- A szerepkör mező kell ahhoz, hogy Tamás admin tudja kezelni a felhasználókat,
-- miközben a többi account normál user marad.
ALTER TABLE "User" ADD COLUMN "role" TEXT NOT NULL DEFAULT 'USER';
