// pricing-bento.ts - Motor reativo da seção de Planos (Bento interativo) para Pluri Health
import { PROF_PLANS, CLINIC_PLANS, PRICES } from "../data/pricing-plans";
import type { CycleId, Plan } from "../data/pricing-plans";
import { decorateUrl, collectTrackingParams } from "./traffic-attribution";

type Audience = "prof" | "clinic" | "enterprise";

const STEP_HINTS: Record<"prof" | "clinic", string[]> = {
  prof: ["Iniciando", "Alta demanda", "Com secretária"],
  clinic: ["Salas compartilhadas", "Equipe consolidada", "Grande clínica"],
};

const CHECK_SVG =
  '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"></polyline></svg>';

export function setupPricing() {
  const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T | null;

  const root = $("planosBento");
  if (!root) return;

  const card = $("bentoCard");
  const enterprise = $("bentoEnterprise");
  const trial = $("bentoTrial");
  const stepper = $("bentoStepper");
  const cyclesGroup = $("cyclesSwitcherGroup");
  const slider = $<HTMLInputElement>("bentoSlider");
  const stepLabels = Array.from(document.querySelectorAll<HTMLButtonElement>(".bento-step"));
  const audienceBtns = Array.from(document.querySelectorAll<HTMLButtonElement>(".audience-toggle-btn"));
  const cycleBtns = Array.from(document.querySelectorAll<HTMLButtonElement>(".cycle-btn"));

  const el = {
    badge: $("bentoBadge"),
    name: $("bentoName"),
    tagline: $("bentoTagline"),
    price: $("bentoPrice"),
    sub: $("bentoSub"),
    save: $("bentoSave"),
    features: $("bentoFeatures"),
    cta: $<HTMLAnchorElement>("bentoCta"),
    ctaLabel: $("bentoCtaLabel"),
    body: $("bentoCardBody"),
  };

  let audience: Audience = "prof";
  let cycle: CycleId = "mensal";
  let step = 1;
  let trialOpen = false;

  const plansOf = (a: "prof" | "clinic"): Plan[] => (a === "prof" ? PROF_PLANS : CLINIC_PLANS);

  function replay(target: HTMLElement | null) {
    if (!target) return;
    target.classList.remove("swap");
    void target.offsetWidth;
    target.classList.add("swap");
  }

  function renderPlan(animate: boolean) {
    if (audience === "enterprise") return;
    const plan = plansOf(audience)[step];
    const price = PRICES[plan.id][cycle];
    const monthly = PRICES[plan.id].mensal.val;
    const cycleParam = cycle === "anual" ? "annual" : cycle === "trimestral" ? "quarterly" : "monthly";

    if (el.badge) {
      el.badge.textContent = plan.badge ?? (audience === "prof" ? "Profissional" : "Clínica");
      el.badge.classList.toggle("is-popular", Boolean(plan.badge));
    }
    if (el.name) el.name.textContent = plan.name;
    if (el.tagline) el.tagline.textContent = plan.tagline;
    if (el.price) el.price.textContent = price.main;
    if (el.sub) el.sub.textContent = price.sub;

    if (el.save) {
      const pct = Math.round((1 - price.val / monthly) * 100);
      el.save.textContent = `Economize ${pct}%`;
      el.save.hidden = cycle === "mensal";
    }

    if (el.features) {
      el.features.innerHTML = plan.features
        .filter((f) => !f.text.startsWith("Consultoria"))
        .map(
          (f) =>
            `<li>${CHECK_SVG}<span>${f.bold ? `<strong>${f.text}</strong>` : f.text}</span></li>`
        )
        .join("");
    }

    if (el.cta) {
      const baseTarget = `https://app.plurihealth.com.br/cadastro?plan=${plan.id}&cycle=${cycleParam}&origin=plurihealth`;
      el.cta.href = decorateUrl(baseTarget, collectTrackingParams());
      el.cta.dataset.planId = plan.id;
      el.cta.dataset.planName = plan.name;
      el.cta.dataset.audience = plan.audience;
      el.cta.dataset.cycle = cycle;
    }
    if (el.ctaLabel) el.ctaLabel.textContent = `Assinar ${plan.name}`;

    if (card) card.classList.toggle("is-featured", Boolean(plan.featured));
    if (animate) replay(el.body);
  }

  function renderSteps() {
    if (audience === "enterprise") return;
    const hints = STEP_HINTS[audience];
    const plans = plansOf(audience);
    stepLabels.forEach((btn, i) => {
      const nameEl = btn.querySelector(".bento-step-name");
      const hintEl = btn.querySelector(".bento-step-hint");
      if (nameEl) nameEl.textContent = plans[i].name;
      if (hintEl) hintEl.textContent = hints[i];
      btn.classList.toggle("active", i === step);
      btn.setAttribute("aria-pressed", String(i === step));
    });
    if (slider) {
      slider.value = String(step);
      slider.setAttribute("aria-valuetext", plans[step].name);
      slider.style.setProperty("--fill", `${(step / 2) * 100}%`);
    }
  }

  function showPanes() {
    const isEnt = audience === "enterprise";
    if (card) card.hidden = isEnt || trialOpen;
    if (enterprise) enterprise.hidden = !isEnt || trialOpen;
    if (trial) trial.hidden = !trialOpen;
    if (stepper) stepper.hidden = isEnt;
    if (cyclesGroup) cyclesGroup.hidden = isEnt;
    root!.classList.toggle("is-trial", trialOpen);
  }

  function setAudience(next: Audience) {
    audience = next;
    trialOpen = false;
    audienceBtns.forEach((b) => {
      const on = b.dataset.audience === next;
      b.classList.toggle("active", on);
      b.setAttribute("aria-selected", String(on));
    });
    showPanes();
    if (next !== "enterprise") {
      renderSteps();
      renderPlan(true);
    } else {
      replay(enterprise);
    }
  }

  function setCycle(next: CycleId) {
    cycle = next;
    cycleBtns.forEach((b) => b.classList.toggle("active", b.dataset.cycle === next));
    if (trialOpen) {
      trialOpen = false;
      showPanes();
    }
    renderPlan(true);
  }

  function setStep(next: number) {
    step = Math.min(2, Math.max(0, next));
    if (trialOpen) {
      trialOpen = false;
      showPanes();
    }
    renderSteps();
    renderPlan(true);
  }

  function toggleTrial(open: boolean) {
    trialOpen = open;
    showPanes();
    if (open) replay(trial);
    else replay(audience === "enterprise" ? enterprise : el.body);
  }

  audienceBtns.forEach((b) => b.addEventListener("click", () => setAudience(b.dataset.audience as Audience)));
  cycleBtns.forEach((b) => b.addEventListener("click", () => setCycle((b.dataset.cycle as CycleId) || "mensal")));
  stepLabels.forEach((b, i) => b.addEventListener("click", () => setStep(i)));
  slider?.addEventListener("input", () => setStep(Number(slider.value)));

  $("btnOpenFreePlan")?.addEventListener("click", () => toggleTrial(true));
  document.querySelectorAll<HTMLElement>("[data-close-trial]").forEach((b) =>
    b.addEventListener("click", () => toggleTrial(false))
  );

  renderSteps();
  renderPlan(false);
  showPanes();
}
