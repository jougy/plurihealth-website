// pricing-plans.ts - Dados tipados dos planos, ciclos de faturamento e enterprise para Pluri Health

export interface Cycle {
  id: string;
  label: string;
  note?: string;
}

export interface PlanFeature {
  text: string;
  bold: boolean;
}

export interface Plan {
  id: string;
  name: string;
  tagline: string;
  monthly: number;
  features: PlanFeature[];
  cta: string;
  featured: boolean;
  audience: "prof" | "clinic";
  badge?: string;
  highlightDifference?: string;
}

// 3 opções de ciclo de faturamento: Mensal, Trimestral (-15%), Anual (-35% OFF)
export const BILLING_CYCLES: Cycle[] = [
  { id: "mensal", label: "Mensal" },
  { id: "trimestral", label: "Trimestral", note: "-15%" },
  { id: "anual", label: "Anual", note: "-35% OFF" },
];

export const PROF_PLANS: Plan[] = [
  {
    id: "prof_basico",
    name: "Básico",
    tagline: "Profissional autônomo iniciando consultório multidisciplinar",
    monthly: 57,
    highlightDifference: "1 acesso individual + 2 formulários clínicos",
    features: [
      { text: "1 acesso simultâneo individual", bold: true },
      { text: "1 formulário universal + 1 ficha complementar", bold: true },
      { text: "Pacientes e atendimentos ilimitados", bold: false },
      { text: "Prontuário eletrônico & evolução rápida", bold: false },
      { text: "Duplicação ágil: repete o atendimento anterior em 1 toque", bold: false },
      { text: "Agenda inteligente integrada ao WhatsApp", bold: false },
      { text: "Consultoria de implantação VIP inclusa", bold: true },
    ],
    cta: "Escolher Básico",
    featured: false,
    audience: "prof",
  },
  {
    id: "prof_medio",
    name: "Médio",
    tagline: "Alta demanda e formulários personalizados para qualquer especialidade",
    monthly: 87,
    highlightDifference: "Formulários e fichas 100% ilimitadas + Portabilidade",
    features: [
      { text: "1 acesso simultâneo individual", bold: false },
      { text: "Formulários e fichas 100% ilimitadas e customizáveis", bold: true },
      { text: "Liberdade total de especialidades sem bloqueios de nicho", bold: true },
      { text: "Seu histórico clínico vai com você para qualquer consultório", bold: true },
      { text: "Controle financeiro de pagamentos e pacotes de sessões", bold: true },
      { text: "Pacientes e atendimentos ilimitados", bold: false },
      { text: "Consultoria de implantação VIP inclusa", bold: true },
    ],
    cta: "Escolher Médio",
    featured: true,
    audience: "prof",
    badge: "Mais Popular",
  },
  {
    id: "prof_top",
    name: "Top",
    tagline: "Máxima autonomia com apoio de secretária e automações",
    monthly: 127,
    highlightDifference: "2 acessos simultâneos (você + secretária) + Lembretes WhatsApp",
    features: [
      { text: "2 acessos simultâneos (você + secretária ou assistente)", bold: true },
      { text: "Lembretes automáticos de agendamento por WhatsApp", bold: true },
      { text: "Recibos e relatórios de receitas automáticos", bold: true },
      { text: "Suporte e atendimento prioritário direto", bold: true },
      { text: "Pacientes e atendimentos ilimitados", bold: false },
      { text: "Todos os recursos do plano Médio inclusos", bold: false },
      { text: "Consultoria de implantação VIP inclusa", bold: true },
    ],
    cta: "Escolher Top",
    featured: false,
    audience: "prof",
  },
];

export const CLINIC_PLANS: Plan[] = [
  {
    id: "clinica_basico",
    name: "Básico",
    tagline: "Consultórios e salas compartilhadas com múltiplos profissionais",
    monthly: 147,
    highlightDifference: "2 acessos simultâneos ao mesmo tempo",
    features: [
      { text: "2 acessos simultâneos ao mesmo tempo", bold: true },
      { text: "Profissionais e colaboradores ilimitados para cadastrar", bold: true },
      { text: "Dono da clínica como administrador principal absoluto", bold: false },
      { text: "Permissões de acesso seguras para cada função clínica", bold: false },
      { text: "Agendas compartilhadas por salas e recursos", bold: false },
      { text: "Digitalização das suas fichas físicas sem custo", bold: true },
      { text: "Consultoria de implantação VIP inclusa", bold: true },
    ],
    cta: "Escolher Básico",
    featured: false,
    audience: "clinic",
  },
  {
    id: "clinica_medio",
    name: "Médio",
    tagline: "Clínicas consolidadas, equipes multidisciplinares e repasses",
    monthly: 267,
    highlightDifference: "4 acessos simultâneos + Divisão de repasses",
    features: [
      { text: "4 acessos simultâneos ao mesmo tempo", bold: true },
      { text: "Controle automático de repasses e divisão de atendimentos", bold: true },
      { text: "Permissões 100% editáveis por função e membro da equipe", bold: true },
      { text: "Profissionais e colaboradores ilimitados para cadastrar", bold: false },
      { text: "Formulários e prontuários customizados para toda a clínica", bold: false },
      { text: "Controle irrestrito para todas as especialidades de saúde", bold: true },
      { text: "Consultoria de implantação VIP inclusa", bold: true },
    ],
    cta: "Escolher Médio",
    featured: true,
    audience: "clinic",
    badge: "Recomendado",
  },
  {
    id: "clinica_top",
    name: "Top",
    tagline: "Grandes centros médicos, policlínicas e alta rotatividade",
    monthly: 447,
    highlightDifference: "8 acessos simultâneos + Trilha de auditoria",
    features: [
      { text: "8 acessos simultâneos ao mesmo tempo", bold: true },
      { text: "Histórico completo e trilha de quem acessou cada prontuário", bold: true },
      { text: "Gestão integrada de várias salas, macas e especialidades", bold: true },
      { text: "Personalização total de níveis de hierarquia da equipe", bold: true },
      { text: "Profissionais e colaboradores ilimitados para cadastrar", bold: false },
      { text: "Controle total sobre toda a estrutura clínica", bold: false },
      { text: "Consultoria de implantação VIP inclusa", bold: true },
    ],
    cta: "Escolher Top",
    featured: false,
    audience: "clinic",
  },
];

export type CycleId = "mensal" | "trimestral" | "anual";

export interface PriceEntry {
  main: string;
  sub: string;
  val: number;
}

// Tabela oficial de preços equivalentes por plano e ciclo (terminando em 7, sem centavos)
export const PRICES: Record<string, Record<CycleId, PriceEntry>> = {
  prof_basico: {
    mensal: { main: "R$ 57/mês", sub: "Cobrado mensalmente", val: 57 },
    trimestral: { main: "R$ 47/mês", sub: "Total R$ 141 por trimestre", val: 47 },
    anual: { main: "R$ 37/mês", sub: "Total R$ 444 por ano", val: 37 },
  },
  prof_medio: {
    mensal: { main: "R$ 87/mês", sub: "Cobrado mensalmente", val: 87 },
    trimestral: { main: "R$ 67/mês", sub: "Total R$ 201 por trimestre", val: 67 },
    anual: { main: "R$ 57/mês", sub: "Total R$ 684 por ano", val: 57 },
  },
  prof_top: {
    mensal: { main: "R$ 127/mês", sub: "Cobrado mensalmente", val: 127 },
    trimestral: { main: "R$ 107/mês", sub: "Total R$ 321 por trimestre", val: 107 },
    anual: { main: "R$ 87/mês", sub: "Total R$ 1.044 por ano", val: 87 },
  },
  clinica_basico: {
    mensal: { main: "R$ 147/mês", sub: "Cobrado mensalmente", val: 147 },
    trimestral: { main: "R$ 127/mês", sub: "Total R$ 381 por trimestre", val: 127 },
    anual: { main: "R$ 97/mês", sub: "Total R$ 1.164 por ano", val: 97 },
  },
  clinica_medio: {
    mensal: { main: "R$ 267/mês", sub: "Cobrado mensalmente", val: 267 },
    trimestral: { main: "R$ 227/mês", sub: "Total R$ 681 por trimestre", val: 227 },
    anual: { main: "R$ 177/mês", sub: "Total R$ 2.124 por ano", val: 177 },
  },
  clinica_top: {
    mensal: { main: "R$ 447/mês", sub: "Cobrado mensalmente", val: 447 },
    trimestral: { main: "R$ 387/mês", sub: "Total R$ 1.161 por trimestre", val: 387 },
    anual: { main: "R$ 297/mês", sub: "Total R$ 3.564 por ano", val: 297 },
  },
};
