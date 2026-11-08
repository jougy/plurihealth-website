// home-interactions.ts - Scripts essenciais para preços e modal de funcionalidades

// Cache formatador de BRL
const brlFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 0,
});

export function setupPricing() {
  const cycleButtons = document.querySelectorAll<HTMLButtonElement>(".cycle-btn");
  const cards = document.querySelectorAll<HTMLElement>(".plan-card");
  const btnProf = document.getElementById("btnAudienceProf") as HTMLButtonElement | null;
  const btnClinic = document.getElementById("btnAudienceClinic") as HTMLButtonElement | null;
  const groupProf = document.getElementById("plansGroupProf");
  const groupClinic = document.getElementById("plansGroupClinic");

  // Seletor de Perfil (Profissional x Clínica)
  if (btnProf && btnClinic && groupProf && groupClinic) {
    btnProf.addEventListener("click", () => {
      btnProf.classList.add("active");
      btnProf.setAttribute("aria-selected", "true");
      btnClinic.classList.remove("active");
      btnClinic.setAttribute("aria-selected", "false");
      groupProf.style.display = "";
      groupClinic.style.display = "none";
    });

    btnClinic.addEventListener("click", () => {
      btnClinic.classList.add("active");
      btnClinic.setAttribute("aria-selected", "true");
      btnProf.classList.remove("active");
      btnProf.setAttribute("aria-selected", "false");
      groupClinic.style.display = "";
      groupProf.style.display = "none";
    });
  }

  if (!cycleButtons.length || !cards.length) return;

  const formatBRL = (val: number) =>
    Number.isInteger(val) ? `R$ ${val}` : `R$ ${val.toFixed(2).replace(".", ",")}`;

  // Pré-computar valores em O(1) lookup para todos os cards
  const cardData = Array.from(cards).map(card => {
    const cardId = card.id;
    const monthlyVal = parseFloat(card.getAttribute("data-monthly") || "0");
    const mainEl = card.querySelector<HTMLElement>("[data-price-main]");
    const subEl = card.querySelector<HTMLElement>("[data-price-sub]");
    const ctaBtn = card.querySelector<HTMLAnchorElement>(".plan-cta-btn");
    const defaultCta = ctaBtn?.getAttribute("data-cta-default") || "Escolher Plano";

    const quarterlyVal = monthlyVal * 0.9;
    const annualVal = monthlyVal * 0.75;

    return {
      cardId,
      mainEl,
      subEl,
      ctaBtn,
      defaultCta,
      priceCache: {
        free: {
          main: "Grátis",
          sub: "7 dias ou até 20 atendimentos",
        },
        mensal: { main: `${formatBRL(monthlyVal)}/mês`, sub: "Cancele quando quiser" },
        trimestral: {
          main: `${formatBRL(quarterlyVal)}/mês`,
          sub: `Total ${formatBRL(quarterlyVal * 3)} por trimestre`,
        },
        anual: {
          main: `${formatBRL(annualVal)}/mês`,
          sub: `Total ${formatBRL(annualVal * 12)} por ano`,
        },
      } as Record<string, { main: string; sub: string }>,
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
        if (cycleId === "free") {
          data.ctaBtn.textContent = "Testar 7 dias grátis";
          data.ctaBtn.href = "https://plurifisio.com.br/planos?cycle=free";
        } else {
          data.ctaBtn.textContent = data.defaultCta;
          data.ctaBtn.href = "https://plurifisio.com.br/planos";
        }
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
  const featureTriggers = document.querySelectorAll<HTMLElement>("[data-open-feature]");
  const tabButtons = document.querySelectorAll<HTMLButtonElement>(".modal-tab-btn");
  const tabContents = document.querySelectorAll<HTMLElement>(".modal-tab-content");

  if (!overlay) return;

  function switchTab(tabId: string) {
    tabButtons.forEach(btn => {
      btn.classList.toggle("active", btn.getAttribute("data-tab-target") === tabId);
    });
    tabContents.forEach(content => {
      content.classList.toggle("active", content.id === tabId);
    });
  }

  tabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const target = btn.getAttribute("data-tab-target");
      if (target) switchTab(target);
    });
  });

  function open(preferredTab?: string) {
    if (preferredTab) {
      switchTab(preferredTab);
    }
    overlay?.classList.add("is-active");
    document.body.style.overflow = "hidden";
  }

  function close() {
    overlay?.classList.remove("is-active");
    document.body.style.overflow = "";
  }

  openBtn?.addEventListener("click", () => open("tab-diferenciais"));
  closeBtn?.addEventListener("click", close);
  ctaBtn?.addEventListener("click", close);

  featureTriggers.forEach(trigger => {
    trigger.addEventListener("click", () => {
      const featureKey = trigger.getAttribute("data-open-feature");
      if (featureKey === "autonomia" || featureKey === "seguranca") {
        open("tab-seguranca");
      } else if (featureKey === "duplicacao" || featureKey === "editor") {
        open("tab-diferenciais");
      } else {
        open("tab-rotina");
      }
    });
  });

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) close();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && overlay.classList.contains("is-active")) {
      close();
    }
  });
}

export function setupWorkflowResponsiveCarousel() {
  const section = document.getElementById("como-funciona");
  const viewport = document.getElementById("workflowCarouselViewport");
  const track = document.getElementById("workflowCardsTrack");
  const btnPrev = document.getElementById("btnWorkflowPrev");
  const btnNext = document.getElementById("btnWorkflowNext");
  const dots = document.querySelectorAll<HTMLButtonElement>("#workflowDotsList .carousel-dot");

  if (!section || !viewport || !track) return;

  const slides = track.querySelectorAll<HTMLElement>(".workflow-carousel-slide");
  if (!slides.length) return;

  function updateLayout() {
    const isMobile = window.innerWidth <= 768;
    const windowHeight = window.innerHeight;
    const isShortHeight = windowHeight < 680 && window.innerWidth < 1100;

    if (isMobile || isShortHeight) {
      viewport?.classList.add("is-carousel");
    } else {
      viewport?.classList.remove("is-carousel");
    }

    updateArrowsAndDots();
  }

  function updateArrowsAndDots() {
    if (!viewport?.classList.contains("is-carousel")) return;

    const scrollLeft = track.scrollLeft;
    const maxScroll = track.scrollWidth - track.clientWidth;

    if (btnPrev) {
      (btnPrev as HTMLButtonElement).style.opacity = scrollLeft > 10 ? "1" : "0.3";
      (btnPrev as HTMLButtonElement).style.pointerEvents = scrollLeft > 10 ? "auto" : "none";
    }

    if (btnNext) {
      (btnNext as HTMLButtonElement).style.opacity = scrollLeft < maxScroll - 10 ? "1" : "0.3";
      (btnNext as HTMLButtonElement).style.pointerEvents = scrollLeft < maxScroll - 10 ? "auto" : "none";
    }

    // Identificar slide atual visível baseado na largura de cada slide
    const slideWidth = slides[0]?.offsetWidth || track.clientWidth || 1;
    const currentIndex = Math.min(
      Math.max(0, Math.round(scrollLeft / slideWidth)),
      slides.length - 1
    );

    dots.forEach((dot, idx) => {
      dot.classList.toggle("active", idx === currentIndex);
    });
  }

  btnNext?.addEventListener("click", () => {
    const slideWidth = slides[0]?.offsetWidth || track.clientWidth || 320;
    track.scrollBy({ left: slideWidth + 12, behavior: "smooth" });
  });

  btnPrev?.addEventListener("click", () => {
    const slideWidth = slides[0]?.offsetWidth || track.clientWidth || 320;
    track.scrollBy({ left: -(slideWidth + 12), behavior: "smooth" });
  });

  dots.forEach((dot, idx) => {
    dot.addEventListener("click", () => {
      const slide = slides[idx];
      if (slide) {
        track.scrollTo({ left: slide.offsetLeft - track.offsetLeft, behavior: "smooth" });
      }
    });
  });

  track.addEventListener("scroll", updateArrowsAndDots, { passive: true });
  window.addEventListener("resize", updateLayout, { passive: true });

  // Rodar de imediato
  updateLayout();
}

