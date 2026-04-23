// Az IPC reteget mar most szetbontjuk domainekre, hogy az app atirasa kozben
// ne egyetlen oriasi main-process fajlban kelljen dolgozni. Az elso korben
// tobb csatorna csak stub, de a helyuk es a felelosseguk mar most tiszta.

export function createNotImplementedHandler(featureName) {
  return async () => {
    throw new Error(
      `${featureName} meg nincs bekotve az Electron backendbe. A service reteg kialakitasa utan ide kerul a vegso implementacio.`
    );
  };
}

