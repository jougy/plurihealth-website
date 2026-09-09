// home-interactions.ts - Scripts com complexidade O(1) para alternador de plataforma, preços e modal

// Cache formatador de BRL
const brlFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 0,
});

export function setupPricing() {
  const cycleButtons = document.querySelectorAll<HTMLButtonElement>(".cycle-btn");
  const cards = document.querySelectorAll<HTMLElement>(".plan-card");
  if (!cycleButtons.length || !cards.length) return;

  // Pré-computar valores em O(1) lookup
  const cardData = Array.from(cards).map(card => {
    const monthly = parseFloat(card.getAttribute("data-monthly") || "0");
    const mainEl = card.querySelector<HTMLElement>("[data-price-main]");
    const subEl = card.querySelector<HTMLElement>("[data-price-sub]");
    const ctaBtn = card.querySelector<HTMLElement>(".plan-cta-btn");
    const defaultCta = ctaBtn?.getAttribute("data-cta-default") || "Contratar";

    return {
      monthly,
      mainEl,
      subEl,
      ctaBtn,
      defaultCta,
      priceCache: {
        free: { main: "Grátis", sub: "7 dias ou até 20 atendimentos" },
        mensal: { main: `${brlFormatter.format(monthly)}/mês`, sub: "Cancele quando quiser" },
        trimestral: {
          main: `${brlFormatter.format(monthly * 0.9)}/mês`,
          sub: `Total ${brlFormatter.format(monthly * 0.9 * 3)} por trimestre`,
        },
        anual: {
          main: `${brlFormatter.format(monthly * 0.75)}/mês`,
          sub: `Total ${brlFormatter.format(monthly * 0.75 * 12)} por ano`,
        },
      } as Record<string, { main: string; sub: string }>
    };
  });

  function setCycle(cycleId: string) {
    cycleButtons.forEach(btn => {
      btn.classList.toggle("active", btn.getAttribute("data-cycle") === cycleId);
    });

    for (let i = 0; i < cardData.length; i++) {
      const data = cardData[i];
      const price = data.priceCache[cycleId] || data.priceCache.mensal;
      if (data.mainEl) data.mainEl.textContent = price.main;
      if (data.subEl) data.subEl.textContent = price.sub;
      if (data.ctaBtn) {
        data.ctaBtn.textContent = cycleId === "free" ? "Ativar degustação" : data.defaultCta;
      }
    }
  }

  cycleButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const c = btn.getAttribute("data-cycle");
      if (c) setCycle(c);
    });
  });
}

export function setupModal() {
  const overlay = document.getElementById("featuresModalOverlay");
  const openBtn = document.getElementById("btnOpenFeaturesModal");
  const closeBtn = document.getElementById("btnCloseFeaturesModal");
  const ctaBtn = document.getElementById("modalCtaPlanos");

  if (!overlay || !openBtn) return;

  function open() {
    overlay?.classList.add("is-active");
    document.body.style.overflow = "hidden";
  }

  function close() {
    overlay?.classList.remove("is-active");
    document.body.style.overflow = "";
  }

  openBtn.addEventListener("click", open);
  closeBtn?.addEventListener("click", close);
  ctaBtn?.addEventListener("click", close);

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) close();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && overlay.classList.contains("is-active")) {
      close();
    }
  });
}

export function setupPlatformToggle() {
  const btnPrev = document.getElementById("btnPrevPlatformMode");
  const btnNext = document.getElementById("btnNextPlatformMode");
  const modeCounter = document.getElementById("platformModeCounter");
  const modeLabel = document.getElementById("platformModeLabel");
  const sectionEl = document.getElementById("plataforma");

  const v1 = document.getElementById("platformViewV1");
  const v2 = document.getElementById("platformViewV2");
  const v3 = document.getElementById("platformViewV3");

  const imgV1 = document.getElementById("platformImgV1");
  const imgV3 = document.getElementById("platformImgV3");

  if (!btnPrev || !btnNext || !v1 || !v2 || !v3) return;

  const versions = [
    { id: 1, title: "Opção 1: Pesquisas + Foto Vertical", view: v1, showImgV1: true },
    { id: 2, title: "Opção 2: Imagem Dedicada por Pesquisa", view: v2, showImgV1: false },
    { id: 3, title: "Opção 3: Minimalista Original", view: v3, showImgV1: false },
  ];

  let currentIndex = 0;

  function applyVersion(index: number) {
    currentIndex = (index + versions.length) % versions.length;
    const current = versions[currentIndex];

    if (modeCounter) modeCounter.textContent = `${current.id}/3`;
    if (modeLabel) modeLabel.textContent = current.title;

    for (let i = 0; i < versions.length; i++) {
      versions[i].view.classList.toggle("active", i === currentIndex);
    }

    if (sectionEl) {
      sectionEl.classList.toggle("mode-v2-active", current.id === 2);
    }

    if (imgV1 && imgV3) {
      imgV1.classList.toggle("active", current.showImgV1);
      imgV3.classList.toggle("active", !current.showImgV1);
    }
  }

  btnNext.addEventListener("click", () => applyVersion(currentIndex + 1));
  btnPrev.addEventListener("click", () => applyVersion(currentIndex - 1));

  // Suporte a gestos touch swipe lateral em O(1)
  if (sectionEl) {
    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartTime = 0;

    sectionEl.addEventListener("touchstart", (e) => {
      if (e.touches.length === 1) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        touchStartTime = Date.now();
      }
    }, { passive: true });

    sectionEl.addEventListener("touchend", (e) => {
      if (e.changedTouches.length === 1) {
        const deltaX = e.changedTouches[0].clientX - touchStartX;
        const deltaY = e.changedTouches[0].clientY - touchStartY;
        const elapsedTime = Date.now() - touchStartTime;

        if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY) * 1.2 && elapsedTime < 800) {
          if (deltaX < 0) {
            applyVersion(currentIndex + 1);
          } else {
            applyVersion(currentIndex - 1);
          }
        }
      }
    }, { passive: true });
  }
}
