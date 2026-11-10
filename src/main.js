let sliders;
const staging = window.location.href.includes("webflow.io") ? true : false;
const URLParams = new URLSearchParams(location.search);

const utilities = {
  freeDomains: [
    "gmail.com",
    "googlemail.com",
    "yahoo.com",
    "yahoo.co.uk",
    "yahoo.co.in",
    "yahoo.fr",
    "yahoo.de",
    "yahoo.it",
    "yahoo.es",
    "yahoo.ca",
    "hotmail.com",
    "outlook.com",
    "live.com",
    "msn.com",
    "icloud.com",
    "me.com",
    "mac.com",
    "aol.com",
    "protonmail.com",
    "proton.me",
    "zoho.com",
    "yandex.com",
    "yandex.ru",
    "mail.ru",
    "gmx.com",
    "gmx.de",
    "web.de",
    "qq.com",
    "163.com",
    "126.com",
    "naver.com",
    "daum.net",
    "rediffmail.com",
    "pm.me",
  ],
  updateInput(inputArr, data) {
    [...inputArr].forEach((input) => (input.value = data));
  },
  loadScript(src, defer = false) {
    return new Promise((resolve) => {
      const scriptEl = document.createElement("script");
      if (defer) scriptEl.defer = true;
      else scriptEl.async = true;
      scriptEl.src = src;
      scriptEl.type = "text/javascript";

      document.body.appendChild(scriptEl);

      scriptEl.addEventListener("load", () => {
        resolve();
      });
    });
  },
  loadStyle(href) {
    return new Promise((resolve) => {
      const link = document.createElement("link");
      link.href = href;
      link.rel = "stylesheet";
      link.type = "text/css";

      document.head.appendChild(link);

      link.addEventListener("load", () => {
        resolve();
      });
    });
  },
  addClassToEls(arr, className) {
    arr.forEach((el) => el.classList.add(className));
  },
  removeClassFromEls(arr, className) {
    arr.forEach((el) => el.classList.remove(className));
  },
};

const initTracking = {
  async bootAttribution() {
    if (typeof customTrackData === "undefined") {
      window.customTrackData = window.customTrackData || { utm: {}, user: {} };
    }
    const boot = globalThis.__m1BootStaticAttribution;
    if (typeof boot !== "function") {
      if (customTrackData.portalParams == null) customTrackData.portalParams = "";
      console.warn(
        "attribution bundle missing — load dist/main.min.js (not src/main.js)",
      );
      return;
    }
    try {
      await boot();
    } catch (err) {
      console.error("attribution boot failed", err);
    }
  },
};

const initCore = {
  trackVisibility() {
    const elements = document.querySelectorAll("[data-track-visibility]");

    if (!elements.length) return;

    const options = {};
    const observer = new IntersectionObserver(function (entries) {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
        } else {
          entry.target.classList.remove("is-visible");
        }
      });
    }, options);

    elements.forEach((el) => observer.observe(el));
  },
  trackImgsLoad() {
    const images = document.querySelectorAll("[data-track-img-load]");

    images.forEach((img) => {
      const onLoad = () => {
        console.log("loaded");
        img.classList.add("loaded");
        img.parentElement.classList.add("loaded");
      };

      if (img.complete) {
        onLoad();
      } else {
        img.addEventListener("load", onLoad);
      }
    });
  },
  textRotateAnimation() {
    const textWrap = document.querySelectorAll(".rotate-text_wrap");

    textWrap.forEach((wrap) => {
      const target = wrap.querySelector(".rotate-text_target");
      const elements = target.dataset.list.split(",");

      target.dataset.activeEl = 0;

      const showNext = () => {
        const activeEl = +target.dataset.activeEl;
        let nextEl;

        if (elements.length === +target.dataset.activeEl) {
          console.log("reached last");
          nextEl = 1;
        } else nextEl = activeEl + 1;

        const element = document.createElement("span");
        element.innerText = elements[nextEl - 1];
        element.style.opacity = 0;
        element.style.transition = "250ms opacity";

        target.innerHTML = "";

        target.insertAdjacentElement("beforeend", element);

        setTimeout(() => {
          element.style.opacity = 1;
        }, 50);

        target.dataset.activeEl = nextEl;
      };

      setInterval(() => {
        if (wrap.classList.contains("is-visible")) showNext();
      }, 2000);

      showNext();
    });
  },
  hideOverflow() {
    document
      .querySelectorAll(".overflow-hide")
      .forEach((el) =>
        el.addEventListener("click", () =>
          document.querySelector("body").classList.toggle("no-scroll"),
        ),
      );
  },
  async initGsap() {
    await Promise.all([
      utilities.loadScript(
        "https://cdn.jsdelivr.net/npm/gsap@3.12.7/dist/gsap.min.js",
      ),
      utilities.loadScript(
        "https://cdn.jsdelivr.net/npm/gsap@3.12.7/dist/ScrollTrigger.min.js",
      ),
      utilities.loadScript(
        "https://cdn.jsdelivr.net/gh/timothydesign/script/split-type.js",
      ),
    ]);

    gsap.registerPlugin(ScrollTrigger);

    ScrollTrigger.config({
      normalizeScroll: true,
    });

    Object.values(initGsap).forEach((fn) => fn());

    if (window.innerWidth > 991)
      Object.values(initGsapDesk).forEach((fn) => fn());
    else Object.values(initGsapMob).forEach((fn) => fn());
  },
  pageResize() {
    const debounce = (callback, wait) => {
      let timeoutId = null;
      return (...args) => {
        window.clearTimeout(timeoutId);
        timeoutId = window.setTimeout(() => {
          callback.apply(null, args);
        }, wait);
      };
    };

    const initialWidth = window.innerWidth;

    const desktop = initialWidth >= 992;
    const tablet = initialWidth < 992 && initialWidth > 767;
    const mobilePotrait = initialWidth <= 767 && initialWidth > 478;
    const mobile = initialWidth <= 478;

    const handleresize = debounce((ev) => {
      const curWidth = window.innerWidth;

      if (desktop && curWidth < 992) {
        location.reload();
      }
      if (tablet && (curWidth >= 992 || curWidth <= 767)) {
        location.reload();
      }
      if (mobilePotrait && (curWidth > 767 || curWidth <= 478)) {
        location.reload();
      }
      if (mobile && curWidth > 478) {
        location.reload();
      }
    }, 250);

    window.addEventListener("resize", handleresize);
  },
  initializePopovers() {
    const popovers = document.querySelectorAll("[data-popover]");

    popovers.forEach((popover) => {
      const content = popover.querySelector("[data-popover-content]");

      content.style.opacity = "0";
      content.style.visibility = "hidden";
      content.style.transition = "opacity 0.3s, visibility 0.3s";

      const showPopover = () => {
        content.style.opacity = "1";
        content.style.visibility = "visible";
      };

      const hidePopover = () => {
        content.style.opacity = "0";
        content.style.visibility = "hidden";
      };

      const isMobile = window.matchMedia("(max-width: 991px)").matches;

      if (isMobile) {
        let isOpen = false;

        popover.addEventListener("click", (e) => {
          e.preventDefault();
          if (isOpen) {
            hidePopover();
          } else {
            showPopover();
          }
          isOpen = !isOpen;
        });

        document.addEventListener("click", (e) => {
          if (!popover.contains(e.target)) {
            hidePopover();
            isOpen = false;
          }
        });
      } else {
        popover.addEventListener("mouseenter", showPopover);
        popover.addEventListener("mouseleave", hidePopover);
      }
    });
  },
  initFAQMore() {
    const button = document.querySelector(".faq_load-wrap button");
    if (button) {
      button.addEventListener("click", () => {
        window.scrollTo({
          top: window.scrollY + 1,
          behavior: "smooth",
        });
      });
    }
  },
  fixBlogBorder() {
    const blogItems = document.querySelectorAll(
      ".blog_collection_list_wrapper.is-check-border .blog_item",
    );
    const blogCount = blogItems.length;

    if (
      window.matchMedia("(min-width: 992px)").matches &&
      blogCount % 2 === 0
    ) {
      const style = document.createElement("style");
      style.innerHTML = `
        @media screen and (min-width: 992px) {
          .blog_collection_list_wrapper.is-check-border .blog_item:nth-last-child(2) {
            border: none !important;
          }
        }
      `;
      document.head.appendChild(style);
    }
  },
  setTargetBlank() {
    document
      .querySelectorAll(
        '[data-button-target="blank"] a, a[data-button-target="blank"]',
      )
      .forEach((link) => {
        link.setAttribute("target", "_blank");
      });
  },
};

const initForm = {
  formLogic() {
    const validatePhone = (phoneObj) => {
      if (phoneObj) {
        return phoneObj.isValidNumber();
      } else return true;
    };

    const validateNumber = (input) => {
      return (
        String(input)
          .toLowerCase()
          .match(/^[0-9-+s()]*$/) && String(input).length < 25
      );
    };
    document.querySelectorAll(".forms-steps-wrapper").forEach((form) => {
      form
        .querySelectorAll(".w-condition-invisible")
        .forEach((el) => el.remove());

      let currentStep = 0;
      const mainForm = form.closest("form");
      // let allSteps = form.querySelectorAll(
      //   ".form-step-wrap:not([data-step-type=zara],[data-step-type=human-data])"
      // );
      let allSteps = form.querySelectorAll(".form-step-wrap");
      const prevButton = mainForm.querySelector("[form-element='prev-btn']");
      const nextButtons = mainForm.querySelectorAll(
        "[form-element='next-btn']",
      );
      const progressBar = mainForm.querySelector(".progress-bar");
      const submitBtn = mainForm.querySelector("[form-element='submit-btn']");
      const realSubmitBtn = mainForm.querySelector(`input[type='submit']`);
      let redirectPath = mainForm.dataset.formRedirectPath;
      const formWrap = form.closest(".popup-form");
      const formType = formWrap.dataset.formBlock;
      const formWorkCTA = formWrap.querySelector(".step-looking-for-job-cta");
      const formWorkPopup = formWrap.querySelector(".form-e-popup");
      const formWorkPopupClose = formWrap.querySelectorAll(
        ".form-e-bg, .form-e-close, .form-e-cta-l",
      );

      const successWrapEl = formWrap.querySelector(".w-form-done");

      // prevent default submit
      mainForm.addEventListener("submit", (e) => {
        console.log("prevent");
        e.preventDefault();
      });

      const validateEmailAPI = async (email) => {
        try {
          const nextButton = allSteps[currentStep].querySelector(
            "[form-element='next-btn']",
          );

          nextButton.classList.add("disabled");

          const response = await fetch(
            `https://api.zerobounce.net/v2/validate?api_key=e23a5efbbbab4b28a4df85ec1e41676d&email=${email}&timeout=3`,
          );

          if (!response.ok) {
            console.error(`HTTP error! status: ${response.status}`);
            nextButton.classList.remove("disabled");
            return true;
          }

          const data = await response.json();

          console.log(data.status);
          nextButton.classList.remove("disabled");

          return !data.status || data.status !== "invalid";
        } catch (error) {
          console.error("Error validating email:", error);
          nextButton.classList.remove("disabled");
          return true;
        }
      };
      const validateEmail = async (email, allowFreeEmails = false) => {
        const isValidFormat = String(email)
          .toLowerCase()
          .match(
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
          );

        if (!isValidFormat) return false;

        if (
          !allowFreeEmails &&
          utilities.freeDomains.includes(email.split("@")[1].toLowerCase())
        ) {
          return false;
        }

        return await validateEmailAPI(email);
      };

      // init progress bar
      progressBar.style.position = "relative";
      progressBar.style.overflow = "hidden";
      const progress = document.createElement("div");
      progress.style.position = "absolute";
      progress.style.width = 0;
      progress.style.height = "100%";
      progress.style.backgroundColor = "#BBC2F7";
      progress.style.transition = "all 300ms";
      progressBar.appendChild(progress);

      const phoneInput = mainForm.querySelector("input[type='tel']");
      let phoneObj;

      if (phoneInput) phoneObj = initNumber(phoneInput);

      const initNumber = function (phoneInput) {
        const iti = window.intlTelInput(phoneInput, {
          initialCountry: "auto",
          geoIpLookup: (callback) => {
            fetch("https://ipapi.co/json")
              .then((res) => res.json())
              .then((data) => {
                callback(data.country_code);
              })
              .catch(() => callback("us"));
          },
          utilsScript:
            "https://cdn.jsdelivr.net/npm/intl-tel-input@23.0.4/build/js/utils.js",
        });

        return iti;
      };

      // pass form type
      utilities.updateInput(
        mainForm.querySelectorAll(".input_form-type"),
        formType,
      );

      if (formWorkPopup && formWorkCTA) {
        // set work popup trigger
        formWorkCTA.addEventListener("click", () => {
          formWorkPopup.style.display = "flex";
          requestAnimationFrame(() => {
            formWorkPopup.style.opacity = 1;
          });
        });

        formWorkPopupClose.forEach((close) => {
          close.addEventListener("click", () => {
            formWorkPopup.style.opacity = 0;
            requestAnimationFrame(() => {
              setTimeout(() => (formWorkPopup.style.display = "none"), 300);
            });
          });
        });
      }

      mainForm
        .querySelectorAll(
          `input[type="text"][required], input[type="number"][required], input[type="email"][required],  input[type="tel"][required], textarea[required], .other-field-wrap input[type="text"], textarea[data-required='true']`,
        )
        .forEach((input) =>
          input.addEventListener("input", () => {
            input.style.borderColor = "";

            const inputs = [
              ...input.parentElement.querySelectorAll(".primary-field"),
            ];

            if (inputs.length > 1) {
              console.log(inputs.every((input) => input.value));
              if (inputs.every((input) => input.value)) {
                const errorView = input
                  .closest(".form-step-wrap")
                  .querySelector(".error-view");
                if (errorView) errorView.style.display = "none";
              }
            } else {
              const errorView = input
                .closest(".form-step-wrap")
                .querySelector(".error-view");
              if (errorView) errorView.style.display = "none";
            }
          }),
        );

      async function verifyStepFields() {
        let result = false;

        const formStep = allSteps[currentStep].querySelector("div");
        if (!formStep) return false;

        const skip = formStep.dataset?.skip;

        const showError = formStep.querySelector(".error-view");
        const errorTextEl = showError?.querySelector(".error-text");
        let errorText =
          showError?.dataset.defaultText || errorTextEl?.innerText;

        const checkboxes = formStep.querySelectorAll(
          `[type="checkbox"], [type="radio"]`,
        );

        if (checkboxes.length > 0) {
          checkboxes.forEach((cb) => {
            if (cb.checked) {
              result = true;
              if (
                cb.parentElement.querySelector("span[data-other-input]") &&
                cb
                  .closest(".step-input-wrapper")
                  .querySelector(".other-field-wrap input").value === "" &&
                !skip
              ) {
                errorText = "This field is required.";
                result = false;
                const extraInput = cb
                  .closest(".step-input-wrapper")
                  .querySelector(".other-field-wrap input");

                extraInput.focus();
                extraInput.style.borderColor = "#f86567";
              }
            }
          });
        }

        const allInputFields = formStep.querySelectorAll(
          `input[type="text"][required], input[type="number"][required], input[type="email"][required],  input[type="tel"][required], textarea[required], input[type="file"][required], textarea[data-required='true']`,
        );
        console.log(allInputFields);
        if (allInputFields.length > 0) {
          for (let i = 0; i < allInputFields.length; i++) {
            if (allInputFields[i].value === "") {
              result = false;
              allInputFields[i].style.borderColor = "#f86567";
              allInputFields[i].focus();

              if (allInputFields[1] && allInputFields[1].value == "") {
                allInputFields[1].style.borderColor = "#f86567";
                if (allInputFields[i].value !== "") {
                  allInputFields[1].focus();
                }
              }

              if (allInputFields[2] && allInputFields[2].value == "") {
                allInputFields[2].style.borderColor = "#f86567";
                if (
                  allInputFields[i].value !== "" &&
                  allInputFields[1].value !== ""
                ) {
                  allInputFields[2].focus();
                }
              }

              break;
            } else if (allInputFields[i].type === "email") {
              const allowFreeEmails = allInputFields[i].hasAttribute(
                "data-allow-free-emails",
              );
              if (
                !(await validateEmail(allInputFields[i].value, allowFreeEmails))
              ) {
                allInputFields[i].style.borderColor = "#f86567";
                allInputFields[i].focus();
                errorText = allowFreeEmails
                  ? "Please enter a valid email address."
                  : "Please enter a valid business email address. This form is for business inquiries only.";
                result = false;
              } else {
                errorText = "Please enter your contact details.";
                result = true;
              }
            } else if (allInputFields[i].type === "number") {
              if (!validateNumber(allInputFields[i].value)) {
                allInputFields[i].style.borderColor = "#f86567";
                allInputFields[i].focus();
                errorText = "Please enter a valid integer value.";
                result = false;
              } else {
                errorText = "Please enter the value in number";
                result = true;
              }
            } else if (allInputFields[i].type === "tel") {
              if (!validatePhone(phoneObj)) {
                allInputFields[i].style.borderColor = "#f86567";
                allInputFields[i].focus();
                errorText = "Please enter a valid phone number.";
                result = false;
              } else {
                errorText = "Please enter your phone number.";
                result = true;
              }
            } else if (allInputFields[i].dataset?.url) {
              const urlValue = allInputFields[i].value;
              try {
                const validURL = new URL(urlValue);
                if (validURL) result = true;
              } catch (error) {
                result = false;
                allInputFields[i].style.borderColor = "#f86567";
                allInputFields[i].focus();
                errorText = "Please enter a valid URL.";
              }
            } else result = true;
          }
        }

        const fileUploading = formStep.querySelector(
          ".w-file-upload-uploading",
        );

        if (
          fileUploading &&
          getComputedStyle(fileUploading)["display"] === "block"
        ) {
          result = false;
        }

        if (skip && skip === "true") result = true;

        if (checkboxes.length && allInputFields.length) {
          if (!checkboxes[0].checked || !allInputFields[0].value)
            result = false;
        }

        if (!result && showError) {
          errorTextEl.innerText = errorText;
          showError.style.display = "block";
        }
        if (result && showError) showError.style.display = "none";

        return result;
      }

      function showStep(number, previous = false) {
        if (!previous) {
          const currStep = allSteps[number - 1];
          const nextStep = allSteps[number];

          currStep?.classList.remove("active");
          currStep?.classList.add("prev");

          nextStep?.classList.remove("next");
          nextStep?.classList.add("active");
        } else {
          const currStep = allSteps[number + 1];
          const prevStep = allSteps[number];

          currStep?.classList.remove("active");
          currStep?.classList.add("next");

          prevStep?.classList.remove("prev");
          prevStep?.classList.add("active");
        }

        if (number === 0) {
          progress.style.width = "10%";
          prevButton.classList.add("hide");
        } else {
          const progressValue = (
            ((number + 1) / allSteps.length) *
            100
          ).toFixed(0);
          progress.style.width = `${progressValue}%`;
          prevButton.classList.remove("hide");
        }
      }

      async function moveToNextStep() {
        const formStep = allSteps[currentStep].querySelector("div");
        const hasOtherOption = formStep.dataset?.hasOtherOption;

        const onlyCheckboxes = formStep.querySelectorAll(`[type="checkbox"]`);
        let checkValues = "";
        if (onlyCheckboxes.length > 0) {
          onlyCheckboxes.forEach((cb) => {
            if (cb.checked) {
              let curValue = jQuery(cb).parent().find(".checkbox-label").text();
              if (checkValues) {
                checkValues = checkValues + ", " + curValue;
              } else {
                checkValues = curValue;
              }
            }
          });

          if (hasOtherOption) {
            const customValue = formStep.querySelector(
              ".other-field-wrap input",
            )?.value;

            if (customValue) {
              checkValues = checkValues
                ? checkValues + ", " + customValue
                : customValue;
            }
          }
        }

        jQuery(formStep).find(".hidden-input").attr("value", checkValues);

        const result = await verifyStepFields();
        if (!result) {
          return;
        }

        if (currentStep + 1 <= allSteps.length - 1) currentStep++;
        showStep(currentStep);

        if (formWorkPopup && currentStep === 1) {
          requestAnimationFrame(() => {
            const emailValue =
              allSteps[currentStep - 1].querySelector("[type='email']")?.value;

            if (!emailValue) return;

            function isNonEduEmail(email) {
              const e = email.toLowerCase();

              const blocked = [
                "student",
                "university",
                "campus",
                "college",
                "alumni",
                ".edu",
                ".ac.",
              ];

              for (const item of blocked) {
                if (e.includes(item)) {
                  return false;
                }
              }

              return true;
            }

            if (isNonEduEmail(emailValue)) return;

            formWorkPopup.style.display = "flex";
            requestAnimationFrame(() => {
              formWorkPopup.style.opacity = 1;
            });
          });
        }

      }

      function handleKeydown(e) {
        if (e.isComposing || e.keyCode === 229) {
          return;
        }
        if (!(e.key === "Enter") && !(e.key === "Tab")) return;

        const compStyles = window.getComputedStyle(form.closest(".popup-form"));

        if (compStyles.getPropertyValue("display") == "none") {
          console.log("form not open");
          return;
        } else {
          console.log("form open");
        }

        if (e.target.classList.contains("text-area") && e.key === "Enter")
          return;

        if (e.key === "Tab") {
        }

        e.preventDefault();

        currentStep === allSteps.length - 1 ? submitForm() : moveToNextStep();
      }

      async function submitForm() {
        const result = await verifyStepFields();

        if (!result) return;

        // cookie consent from DataGrail (banner owns preferences)
        try {
          const api = window.DG_BANNER_API;
          if (api?.categoryEnabled) {
            const marketing = !!api.categoryEnabled("marketing");
            const performance = !!api.categoryEnabled("performance");
            let consentStr;
            if (marketing && performance) consentStr = "All";
            else {
              consentStr = "Essentials";
              if (marketing) consentStr += ", Marketing";
              if (performance) consentStr += ", Performance";
            }
            utilities.updateInput(
              document.querySelectorAll(".input_cookie-consent"),
              consentStr,
            );
          }
        } catch (err) {
          console.error(err);
        }

        console.log("ready to submit");

        submitBtn.querySelector("div").textContent = "Please wait...";
        submitBtn.classList.add("disabled");

        mainForm
          .querySelectorAll(
            ".w-checkbox:not(.checkbox_legal), [data-has-other-option='checkbox'] .other-field-wrap input, .iti__selected-country, .iti__search-input",
          )
          .forEach((el) => el.remove());

        console.log("removed");

        if (phoneInput) {
          phoneInput.value = phoneObj.getNumber();
        }

        const allFormData = new FormData(mainForm);

        // Twitter conversion code
        if (formType === "talent") {
          window.twq && twq("event", "tw-ocr68-ooizv", {});

          console.log("twitter code fired talent");
        }
        if (formType === "human-data" || formType === "int") {
          window.twq && twq("event", "tw-ocr68-opq5o", {});

          window.lintrk && window.lintrk("track", { conversion_id: 23452004 });

          console.log("tracking code fired human-data");
        }
        if (formType === "ai-interviewer") {
          window.twq && twq("event", "tw-ocr68-opq5p", {});

          console.log("twitter code fired ai recruiter");
        }
        if (formType === "general") {
          window.twq && twq("event", "tw-ocr68-opq1t", {});

          console.log("twitter code fired general");
        }

        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
          event: "form_submit_success",
          product: formType,
        });

        if (formType === "data") {
          try {
            const dataPayout = await fetchDataPayout({
              employees: allFormData.get("data-size"),
              years: allFormData.get("data-year-start"),
              entities: allFormData.get("data-entities"),
              englishPct: allFormData.get("data-english"),
              location: allFormData.get("data-location"),
              highRisk: allFormData.get("data-sensitive"),
            });
            console.log(dataPayout);
            const payoutEl = document.querySelector(".data-payout");
            if (payoutEl) payoutEl.textContent = dataPayout;
            utilities.updateInput(
              document.querySelectorAll(".data-payout-input"),
              dataPayout,
            );
          } catch (err) {
            console.error(err);
          }
        }

        await submitFormToMake();
      }

      // submit to make.com
      async function submitFormToMake() {
        console.log("init form submit");
        const hubspot = `https://hook.us1.make.com/iixlkvnhvlvods3gx3l1rnftpkk92std`;
        const dpSheet = `https://hook.us1.make.com/dzgjuhsc8ynum5pdx1nvtqqv8jm93k1v`;

        const final = formType === "dp" ? dpSheet : hubspot;
        try {
          const response = await fetch(final, {
            method: "POST",
            header: {
              Accept: "application/json",
            },
            body: new FormData(mainForm),
          });

          if (!response.ok) {
            console.log(response);

            throw new Error(
              "Form not submitted! Please try again later or contact support@micro1.ai",
            );
          }

          // redirect
          console.log("form submitted successfully, redirecting!");

          console.log(redirectPath);
          if (redirectPath) {
            console.log("1");
            document.location.href = `${redirectPath}`;
          } else {
            console.log("2");
            mainForm.style.display = "none";
            successWrapEl.style.display = "block";
          }
        } catch (error) {
          console.error(error);

          const errorHTML = `<p class="error-text" style="margin-top:1rem">${error.message}</p>`;

          allSteps[currentStep]
            .querySelector("div")
            .insertAdjacentHTML("beforeend", errorHTML);
        }
      }

      submitBtn.addEventListener("click", submitForm);
      realSubmitBtn.addEventListener("click", (e) => {
        e.preventDefault();

        currentStep === allSteps.length - 1 ? submitForm() : moveToNextStep();
      });
      nextButtons.forEach((btn) =>
        btn.addEventListener("click", moveToNextStep),
      );
      document.addEventListener("keydown", handleKeydown);
      prevButton.onclick = () => {
        if (currentStep - 1 >= 0) currentStep--;
        showStep(currentStep, true);
      };
      // init
      console.log(currentStep);
      showStep(currentStep);
    });
  },
  setCheckBoxRadio() {
    const allRadioInputs = document.querySelectorAll(
      ".popup-form [type='radio']",
    );

    const changeRadioInput = (input) => {
      if (input.checked) {
        input
          .closest(".step-input-wrapper")
          .querySelectorAll("[type='radio']")
          .forEach((input) => {
            input.parentElement.classList.remove("is-checked");
          });
        input.parentElement.classList.add("is-checked");
      }
    };

    allRadioInputs.forEach((input) =>
      input.addEventListener("change", () => {
        changeRadioInput(input);
      }),
    );

    const allCheckboxInputs = document.querySelectorAll(
      ".popup-form [type='checkbox']:not([name='Accept-Conditions'])",
    );

    const changeCheckboxInput = (input) => {
      if (input.checked) {
        input.closest(".checkbox-wrapper").classList.add("is-checked");
      } else {
        input.closest(".checkbox-wrapper").classList.remove("is-checked");
      }
    };

    allCheckboxInputs.forEach((input) =>
      input.addEventListener("change", () => {
        changeCheckboxInput(input);
      }),
    );

    const otherRadioInputs = document.querySelectorAll(
      "[data-has-other-option='radio'] [type='radio']",
    );

    otherRadioInputs.forEach((input) => {
      input.addEventListener("change", () => {
        const otherTextInputWrapper = input
          .closest(".step-input-wrapper")
          .querySelector(".other-field-wrap");
        if (
          input.parentElement.querySelector("[data-other-input='true']") !==
          null
        ) {
          const otherInputText = input.parentElement.querySelector(
            "[data-other-input='true']",
          ).dataset.otherInputText;
          otherTextInputWrapper.querySelector("input").placeholder =
            otherInputText || "Please enter here";

          otherTextInputWrapper.classList.remove("hidden");

          otherTextInputWrapper.querySelector("input").value = "";
        } else {
          otherTextInputWrapper.classList.add("hidden");
        }
      });
    });

    const otherRadioActualInputs = document.querySelectorAll(
      "[data-has-other-option='radio'] .other-field-wrap input",
    );

    otherRadioActualInputs.forEach((input) =>
      input.addEventListener("input", (e) => {
        const otherRadio = input
          .closest(".step-input-wrapper")
          .querySelector(".radio-wrapper.is-checked input");

        otherRadio.value = e.target.value;
      }),
    );

    const otherCheckboxLabels = document.querySelectorAll(
      "[data-has-other-option='checkbox'] [data-other-input='true']",
    );
    const otherCheckboxInputs = Array.from(otherCheckboxLabels).map((label) =>
      label.parentElement.querySelector("[type='checkbox']"),
    );

    otherCheckboxInputs.forEach((input) => {
      input.addEventListener("change", () => {
        const otherTextInputWrapper = input
          .closest(".step-input-wrapper")
          .querySelector(".other-field-wrap");
        otherTextInputWrapper.classList.toggle("hidden");
      });
    });

    const allCheckboxes = document.querySelectorAll(
      ".popup-form input[type='checkbox']:not([name='Accept-Conditions']), .popup-form input[type='radio']",
    );

    if (allCheckboxes.length > 0) {
      allCheckboxes.forEach((el) => {
        el.addEventListener("change", () => {
          const errorEl = el
            .closest(".step-input-wrapper")
            .querySelector(".error-view");
          if (errorEl && errorEl.style.display === "block")
            errorEl.style.display = "none";
        });
      });
    }
  },
  setFormTrigger() {
    (() => {
      const openTriggers = document.querySelectorAll("[data-form-cta]");

      openTriggers.forEach((trigger) => {
        const type = trigger.dataset.formCta;

        if (!type) return;

        trigger.addEventListener("click", () => {
          const form = document.querySelector(`[data-form-block='${type}']`);

          console.log(form, type);

          if (form) showForm(form);
          else console.error(`Form:${type} not found!`);
        });
      });

      function showForm(form) {
        document.querySelector("body").classList.add("no-scroll");
        form.style.display = "block";
        setTimeout(() => {
          form.classList.add("is-visible");
        }, 50);
      }

      const closeTriggers = document.querySelectorAll("[data-form-close]");

      closeTriggers.forEach((trigger) => {
        trigger.addEventListener("click", () => {
          const type = trigger.dataset.formClose;

          const form = document.querySelector(`[data-form-block='${type}']`);

          if (form) closeForm(form);
          else console.error(`Form:${type} not found!`);
        });
      });

      function closeForm(form) {
        document.querySelector("body").classList.remove("no-scroll");
        form.classList.remove("is-visible");
        setTimeout(() => {
          form.style.display = "none";
        }, 300);
      }

      // Check for openForm=1 in URL search params
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get("openForm") === "1") {
        // Find and open the first available form
        const firstForm = document.querySelector("[data-form-block]");
        if (firstForm) {
          showForm(firstForm);
        }
      }
    })();
  },
};

// gsap being called in core
const initGsap = {
  loadWidget() {
    const reportWidgets = document.querySelectorAll("#report-widget");

    if (!reportWidgets.length) return;

    gsap.timeline({
      scrollTrigger: {
        once: true,
        start: "top+=10",
        end: "+=1",
        onEnter: () => {
          reportWidgets.forEach((reportWidget) => {
            const url = reportWidget.dataset.src;

            if (!url) {
              console.log("Widget URL missing");
              return;
            }

            reportWidget.src = url;

            console.log("added URL");
          });
        },
      },
    });
  },
  navScroll() {
    const nav = document.querySelector(".nav_component");

    if (!nav) return;

    gsap.timeline({
      scrollTrigger: {
        start: "top+=10",
        end: "+=1",
        onEnter: () => nav.classList.add("is-scrolled"),
        onLeaveBack: () => nav.classList.remove("is-scrolled"),
      },
    });

    gsap.timeline({
      scrollTrigger: {
        start: "top+=500",
        end: "+=1",
        onEnter: () => nav.classList.add("is-scrolled-500"),
        onLeaveBack: () => nav.classList.remove("is-scrolled-500"),
      },
    });
  },
  textScroll() {
    const textEl = document.querySelectorAll("[data-animation='split-text']");

    let mm = gsap.matchMedia();

    textEl.forEach((textEl) => {
      mm.add("(min-width: 992px)", () => {
        new SplitType(textEl, { types: ["words"] });

        const chars = textEl.querySelectorAll(".word");

        gsap
          .timeline({
            scrollTrigger: {
              trigger: textEl,
              start: "top bottom",
              end: "top 35%",
              scrub: 1,
              ease: "power1.inOut",
            },
          })
          .from(
            chars,
            {
              duration: 1,
              opacity: 0.2,
              stagger: 0.1,
            },
            "<",
          );
      });
    });
  },
  autoplayVideosMob() {
    const containers = document.querySelectorAll(".wi_video-wrap");

    containers.forEach((container) => {
      const video = container.querySelector("video");
      const button = container.querySelector(".wi_video-button");
      const playIcon = button.querySelector(".is-play");
      const pauseIcon = button.querySelector(".is-pause");

      let hasUserInteracted = false;

      video.removeAttribute("controls");

      const tryPlay = () => {
        video
          .play()
          .then(() => {
            playIcon.style.opacity = 0;
            pauseIcon.style.opacity = 1;
            container.classList.remove("show-controls");
          })
          .catch(() => container.classList.add("show-controls"));
      };

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              tryPlay();
            }
          });
        },
        { threshold: 0.5 },
      );

      observer.observe(video);

      // Play/pause logic
      button.addEventListener("click", () => {
        if (video.paused) {
          video.play();
          playIcon.style.opacity = 0;
          pauseIcon.style.opacity = 1;
          container.classList.remove("show-controls");
        } else {
          video.pause();
          playIcon.style.opacity = 1;
          pauseIcon.style.opacity = 0;
          container.classList.add("show-controls");
        }
      });

      // Mobile: show controls on tap
      video.addEventListener(
        "touchstart",
        () => {
          if (!hasUserInteracted) {
            hasUserInteracted = true;
            container.classList.add("show-controls");
            setTimeout(() => {
              container.classList.remove("show-controls");
              hasUserInteracted = false;
            }, 3000);
          }
        },
        { passive: true },
      );
    });
  },
  processScrollOld() {
    let mm = gsap.matchMedia();
    const component = document.querySelector(".section_process");

    if (!component) return;

    const wrapper = component.querySelector(".process_wrapper");
    const imgListWrap = component.querySelector(".process_img-list");
    const textList = [...component.querySelectorAll(".process_text")];
    const imgList = gsap.utils.toArray(".process_img-wrapper");

    let activeElement;

    mm.add("(min-width: 992px)", () => {
      textList[0].classList.add("is-active");

      const t1 = gsap.timeline({});

      t1.to(imgListWrap, {
        y: -imgListWrap.offsetHeight + imgList[0].offsetHeight,
        duration: 1,
        ease: "none",
      });

      ScrollTrigger.create({
        animation: t1,
        trigger: component,
        start: "top top",
        end: "bottom bottom",
        scrub: true,
        onUpdate: (self) => {
          const segments = textList.length;
          const progress = self.progress.toFixed(1);

          const segmentSize = 1 / segments;
          const currentSegment = Math.floor(progress / segmentSize);

          const segmentIndex = Math.min(currentSegment, segments - 1);

          if (activeElement === segmentIndex) return;

          updateActiveText(segmentIndex);

          activeElement = segmentIndex;
        },
      });
    });

    function updateActiveText(index) {
      textList.forEach((text) => text.classList.remove("is-active"));

      const textWrap = textList[index];

      textWrap.classList.add("is-active");
    }
  },
  processScrollVid() {
    let mm = gsap.matchMedia();
    const component = document.querySelector(".section_wi.is-vid");

    if (!component) {
      return;
    }

    const wrapper = component.querySelector(".wi_wrapper");
    const imgListWrap = component.querySelector(".wi_img-list");
    const textList = [...component.querySelectorAll(".wi_text")];
    const imgList = gsap.utils.toArray(".wi_img-wrapper");

    let activeElement;

    mm.add("(min-width: 992px)", () => {
      textList[0].classList.add("is-active");

      const t1 = gsap.timeline({});

      t1.to(imgListWrap, {
        y: -imgListWrap.offsetHeight + imgList[0].offsetHeight,
        duration: 1,
        ease: "none",
      }).from(
        ".wi_line_fill, .wi_line_blur",
        {
          height: 0,
          duration: 1,
          ease: "none",
        },
        "<",
      );

      ScrollTrigger.create({
        animation: t1,
        trigger: component,
        start: "top top",
        end: "bottom bottom",
        scrub: true,
        onUpdate: (self) => {
          const segments = textList.length;
          const progress = self.progress.toFixed(1);

          const segmentSize = 1 / segments;
          const currentSegment = Math.floor(progress / segmentSize);

          const segmentIndex = Math.min(currentSegment, segments - 1);

          if (activeElement === segmentIndex) return;

          updateActiveText(segmentIndex);

          activeElement = segmentIndex;
        },
      });
    });

    function updateActiveText(index) {
      textList.forEach((text) => text.classList.remove("is-active"));

      const textWrap = textList[index];

      textWrap.classList.add("is-active");
    }
  },
  processScrollImg() {
    // desktop scroll effect
    if (window.innerWidth < 992) return;

    let mm = gsap.matchMedia();

    const component = document.querySelector(".section_wi.is-img");

    if (!component) {
      return;
    }

    const textList = [...component.querySelectorAll(".wi_text")];
    const imgList = gsap.utils.toArray(".wi_img-wrapper");
    const imgListWrap = component.querySelector(".wi_img-list");
    const imgContainer = component.querySelector(".wi_img-container");

    imgContainer.style.height = imgList[0].offsetHeight + "px";

    let activeElement;

    mm.add("(min-width: 992px)", () => {
      textList[0].classList.add("is-active");

      const t1 = gsap.timeline({});

      t1.to(imgListWrap, {
        y: -imgListWrap.offsetHeight + imgList[0].offsetHeight,
        duration: 1,
        ease: "none",
      }).from(
        ".wi_line_fill, .wi_line_blur",
        {
          height: 0,
          duration: 1,
          ease: "none",
        },
        "<",
      );

      ScrollTrigger.create({
        animation: t1,
        trigger: component,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.5,
        onUpdate: (self) => {
          const segments = textList.length;
          const progress = self.progress.toFixed(1);

          const segmentSize = 1 / segments;
          const currentSegment = Math.floor(progress / segmentSize);

          const segmentIndex = Math.min(currentSegment, segments - 1);

          if (activeElement === segmentIndex) return;

          updateActiveText(segmentIndex);

          activeElement = segmentIndex;
        },
      });
    });

    function updateActiveText(index) {
      textList.forEach((text) => text.classList.remove("is-active"));

      const textWrap = textList[index];

      textWrap.classList.add("is-active");
    }
  },
  initAfterScroll() {
    gsap.timeline({
      scrollTrigger: {
        once: true,
        start: "top+=10",
        end: "+=1",
        onEnter: () => {
          Object.values(initAfterScroll).forEach((fn) => fn());
          document.body.classList.add("page-scrolled");
        },
      },
    });
  },
  stickyTextScroll() {
    const wrappers = document.querySelectorAll(
      "[data-sticky-text-scroll='track']",
    );

    if (wrappers.length === 0) return;

    wrappers.forEach((wrapper) => {
      const list = wrapper.querySelector("[data-sticky-text-scroll='target']");

      const items = wrapper.querySelectorAll(
        "[data-sticky-text-scroll='item']",
      );

      console.log(list);

      const mainTimeline = gsap.timeline({});

      mainTimeline.to(list, {
        y: -list.offsetHeight + items[0].offsetHeight,
        duration: 1,
        ease: "none",
      });

      ScrollTrigger.create({
        animation: mainTimeline,
        trigger: wrapper,
        start: "top 0",
        end: "bottom 100%",
        scrub: 0.5,
      });
    });
  },
  async countUp() {
    const els = document.querySelectorAll("[data-count-el='target']");

    if (!els.length) return;

    await utilities.loadScript(
      "https://cdn.jsdelivr.net/npm/countup@1.8.2/countUp.js",
    );

    els.forEach((el) => {
      const decimal = +el.dataset.countDecimal;
      const endVal = +el.dataset.countEndVal;
      const startVal = +el.textContent;

      let counter = new CountUp(el, startVal, endVal, decimal, 2);

      ScrollTrigger.create({
        trigger: el,
        start: "top bottom",
        end: "bottom top",
        onEnter: () => {
          counter?.start();
        },
      });
    });
  },
};
const initGsapMob = {
  handleBackButton() {
    const backButton = document.querySelectorAll(".nav_back-btn");

    const closeDropdown = (link) => {
      const dropdown = link.closest(".w--nav-dropdown-open");
      const toggle = dropdown.querySelector(".w--nav-dropdown-toggle-open");

      toggle.click();
    };

    backButton.forEach((btn) => {
      btn.addEventListener("click", () => {
        closeDropdown(btn);
      });
    });

    const breadCrumbBack = document.querySelectorAll(
      ".nav_dd_p_title-mob.is-back",
    );

    breadCrumbBack.forEach((link) => {
      link.addEventListener("click", () => {
        closeDropdown(link);
      });
    });
  },
  observeDropdowns() {
    const dropdownToggles = document.querySelectorAll(".w-dropdown-toggle");

    dropdownToggles.forEach((toggle) => {
      const observer = new MutationObserver((mutationsList) => {
        mutationsList.forEach((mutation) => {
          if (
            mutation.type === "attributes" &&
            mutation.attributeName === "class"
          ) {
            const element = mutation.target;

            if (element.classList.contains("w--open")) {
              const parent = element.parentElement;
              if (parent) {
                parent.style.zIndex = 5;
              }
            } else {
              const parent = element.parentElement;
              if (parent) {
                parent.style.zIndex = "";
              }
            }
          }
        });
      });

      observer.observe(toggle, { attributes: true });
    });
  },
};
const initGsapDesk = {
  mapDotsFill() {
    const wrap = document.querySelectorAll(".bg-map_dots-wrap");

    if (!wrap.length) return;

    wrap.forEach((wrap) => {
      ScrollTrigger.create({
        trigger: wrap,
        top: "top bottom",
        onEnter: setDotsTimestamp,
        once: true,
      });

      function setDotsTimestamp() {
        const images = wrap.querySelectorAll(".bg-map_dots-img");

        const showNext = () => {
          const activeIndex = +wrap.dataset.activeIndex;
          let nextIndex;

          if (images.length - 1 === +wrap.dataset.activeIndex) {
            nextIndex = 1;
          } else nextIndex = activeIndex + 1;

          const activeEl = images[activeIndex];
          const nextEl = images[nextIndex];

          activeEl.style.opacity = 0;

          setTimeout(() => {
            nextEl.style.opacity = 0.8;
          }, 1000);

          wrap.dataset.activeIndex = nextIndex;
        };

        wrap.dataset.activeIndex = 0;
        setTimeout(() => {
          images[0].style.opacity = 0.8;

          setInterval(() => {
            if (wrap.classList.contains("is-visible")) showNext();
          }, 4000);
        }, 1000);
      }
    });
  },
  footerLogo() {
    const footerWrap = document.querySelector(".footer_logo-wrap");

    if (!footerWrap) return;

    footerWrap.addEventListener("mousemove", (e) => {
      const wrapRect = footerWrap.getBoundingClientRect();

      const x = e.clientX - wrapRect.left;
      const y = e.clientY - wrapRect.top;

      gsap.to(footerWrap, {
        "--pointer-x": `${x}px`,
        "--pointer-y": `${y}px`,
        duration: 0.6,
      });
    });
  },
  useCaseDropdown() {
    const wrappers = document.querySelectorAll(".nav_dd_list");

    wrappers.forEach((wrapper) => {
      const links = wrapper.querySelectorAll(".nav_dd_p-item");
      const lists = wrapper.querySelectorAll(".nav_dd_c-list");
      const listContainer = wrapper.querySelector(".nav_dd_c-col");

      if (!(window.innerWidth > 991) || !links.length) return;

      links.forEach((link, i) =>
        link.addEventListener("mouseenter", () => {
          utilities.removeClassFromEls(links, "is-selected");
          link.classList.add("is-selected");
          listContainer.innerHTML = "";
          listContainer.insertAdjacentElement("afterbegin", lists[i]);
        }),
      );

      links[0].classList.add("is-selected");
      listContainer.insertAdjacentElement("afterbegin", lists[0]);
    });
  },
};

// initiliazing in gsap
const initAfterScroll = {
  async initSlider() {
    const sliderWrapperEls = Array.from(
      document.querySelectorAll(".swiper-component"),
    );

    console.log(sliderWrapperEls);

    if (!sliderWrapperEls.length) return;

    await utilities.loadScript(
      "https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js",
    );

    sliders = setSlider(sliderWrapperEls);

    function setSlider(sliderWrapperEls) {
      const sliders = [];

      sliderWrapperEls.forEach((wrapperEl) => {
        if (wrapperEl.dataset.mobileOnly && window.innerWidth > 991) return;

        const swiper = wrapperEl.querySelector(".swiper");

        const slidesPerView = wrapperEl.dataset.slidesPerView
          ? wrapperEl.dataset.slidesPerView != "auto"
            ? +wrapperEl.dataset.slidesPerView
            : "auto"
          : 1;

        const desktopAutoHeight = wrapperEl.dataset.desktopAutoHeight;

        const spaceBetween = wrapperEl.dataset.spaceBetween
          ? +wrapperEl.dataset.spaceBetween
          : 24;

        const fadeEffect = wrapperEl.dataset.effectFade ? true : false;

        const loop = wrapperEl.dataset.disableLoop ? false : true;

        const arrows = wrapperEl.querySelectorAll(".swiper-arrow");

        const enableClicks = wrapperEl.dataset.preventClicks ? true : false;
        const enableClicksPropagation = wrapperEl.dataset
          .preventClicksPropagation
          ? true
          : false;

        const slider = new Swiper(swiper, {
          ...(enableClicks && { preventClicks: false }),
          ...(enableClicksPropagation && { preventClicksPropagation: false }),
          updateOnWindowResize: true,
          loop: loop,
          loopAdditionalSlides: 1,
          slidesPerView: slidesPerView,
          spaceBetween: spaceBetween,
          speed: 600,
          pagination: {
            el: wrapperEl.querySelector(".swiper-pagination"),
            clickable: true,
            dynamicBullets: true,
          },
          ...(arrows && {
            navigation: {
              prevEl: arrows[0],
              nextEl: arrows[1],
            },
          }),
          breakpoints: {
            0: {
              autoHeight: true,
              slidesPerView: slidesPerView === "auto" ? "auto" : 1,
            },
            992: {
              autoHeight: true,
              slidesPerView: slidesPerView,
            },
          },
          ...(fadeEffect && {
            effect: "fade",
            fadeEffect: {
              crossFade: true,
            },
          }),
        });

        sliders.push(slider);

        sliders.forEach((slider) => {
          slider.on("slideChange", function () {
            if (window.gsap !== undefined) ScrollTrigger.refresh();
          });
        });
      });

      return sliders;
    }

    console.log(sliders);
  },
};

document.addEventListener("DOMContentLoaded", () => {
  document.body.classList.add("dom-loaded");

  Object.values(initCore).forEach((fn) => fn());
  Object.values(initForm).forEach((fn) => fn());

  Promise.resolve(initTracking.bootAttribution()).catch((err) =>
    console.error(err),
  );

  setTimeout(() => document.body.classList.add("delay-complete"), 3000);
});

window.addEventListener("load", () => {
  document.body.classList.add("page-loaded");

  setTimeout(() => {
    const video = document.getElementById("researchVideo");

    if (video) {
      const sourceWebm = document.createElement("source");
      sourceWebm.src =
        "https://micro1-portal-data.s3.us-east-1.amazonaws.com/assets/videos/low.webm";
      sourceWebm.type = "video/webm";
      const sourceMp4 = document.createElement("source");
      sourceMp4.src =
        "https://micro1-portal-data.s3.us-east-1.amazonaws.com/assets/1757558823030-b09456b0-0ca4-4174-b8fa-daff38dd9341-micro1-video-11sept.mp4";
      sourceMp4.type = "video/mp4";
      video.appendChild(sourceMp4);
      video.appendChild(sourceWebm);
      video.setAttribute("autoplay", ""); // Add autoplay dynamically
      video.load(); // Start loading immediately
      video.play(); // Start playback if needed
    }
  }, 1000);
});

/**
 * Fetch the original-wizard payout range from the Cloudflare Worker.
 * @returns {Promise<string>} Formatted range, e.g. "$100,000-$200,000"
 */
async function fetchDataPayout(input) {
  const res = await fetch(
    "https://data-payout-calculator.sahil-773.workers.dev/payout/original",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        employees: input.employees,
        years: input.years,
        entities: input.entities,
        englishPct: input.englishPct,
        location: input.location || "US",
        highRisk: String(input.highRisk || "").toLowerCase() === "yes",
      }),
    },
  );

  if (!res.ok) throw new Error("Payout request failed");

  const data = await res.json();
  const formatUSD = (n) => "$" + Math.round(Number(n)).toLocaleString("en-US");
  return `${formatUSD(data.low)}-${formatUSD(data.high)}`;
}


