(() => {
  const itemWrapEls = Array.from(document.querySelectorAll(".rb_item-wrap"));
  const dropdown = document.querySelector(".fs-selectcustom_dropdown");
  const dropdownList = dropdown?.querySelector(".w-dropdown-list");
  const toggle = dropdown?.querySelector(".w-dropdown-toggle");
  const toggleText =
    toggle?.querySelector(".fs-selectcustom_text") ||
    document.querySelector(".fs-selectcustom_text");
  const links = Array.from(dropdownList?.querySelectorAll(".fs-selectcustom_link") || []);

  if (links[0]) {
    links[0].classList.add("w--current");
  }

  function filterDomain(domain) {
    itemWrapEls.forEach((el) => {
      el.classList.remove("hide-domain");
    });

    if (domain === "All domains") return;

    itemWrapEls
      .filter((el) => {
        const item = el.querySelector(".rb_item");
        const itemDomain = (
          item?.getAttribute("domain") ||
          item?.getAttribute("data-domain") ||
          ""
        ).trim();
        return itemDomain.toLowerCase() !== domain.toLowerCase();
      })
      .forEach((el) => el.classList.add("hide-domain"));
  }

  links.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();

      const domain = link.textContent.trim();

      links.forEach((el) => el.classList.toggle("w--current", el === link));
      if (toggleText) toggleText.textContent = domain;

      filterDomain(domain);
    });
  });
})();
