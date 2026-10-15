(async function loadConsentStyles() {
  const sheets = await Promise.all(
    ["./consent.css", "./consent-light.css"].map((url) =>
      fetch(url).then((r) => {
        if (!r.ok) throw new Error("Failed to load " + url);
        return r.text();
      })
    )
  );
  document.getElementById("dg-consent-custom-style").textContent = sheets.join("\n");
  const script = document.createElement("script");
  script.src =
    "https://api.consentjs.datagrail.io/a48e8743-7d84-41e8-a072-095c984aad86/34343c6f-6150-41ed-944b-b481e71f1e75/consent-loader.js";
  script.async = true;
  document.head.appendChild(script);
})();
