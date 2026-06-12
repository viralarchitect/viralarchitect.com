export const PROFILE = {
  name: "Nicholas King",
  role: "Site Reliability Engineer",
  badge: "VA-2008-NK",
  careerStartYear: 2008,
  summary:
    "Site Reliability Engineer and Systems Administrator blending 15 years of keep-the-lights-on enterprise infrastructure with build-the-future software development. Specialized in large-scale hybrid-cloud Windows environments, massive toil reduction through automation, and modern SaaS products.",
} as const;

export type SpecRow = {
  k: string;
  v: string;
  sub: string;
};

export const SPEC_ROWS: SpecRow[] = [
  {
    k: "UPTIME",
    v: "SYSTEM ACTIVE SINCE 2008",
    sub: "",
  },
  {
    k: "MISSION PROFILE",
    v: "SRE + SYSTEMS ADMIN + AUTOMATION BUILDER + SAAS FOUNDER",
    sub:
      "15 YRS ENTERPRISE OPS :: HYBRID-CLOUD WINDOWS :: TOIL REDUCTION AT SCALE",
  },
  {
    k: "INFRA & CLOUD",
    v: "WINDOWS SERVER · ACTIVE DIRECTORY · AZURE ENTRA · VMWARE",
    sub:
      "FOREST MGMT (80+ DCs) · DNS · DEEP GPO OPTIMIZATION · HYBRID-CLOUD OPS",
  },
  {
    k: "AUTOMATION & OPS",
    v: "POWERSHELL · BIGFIX · ANSIBLE · WSUS · SRE",
    sub:
      "CUSTOM ANALYSES & DEPLOYMENTS · PATCH ORCHESTRATION · HEALTH CHECK AUTOMATION",
  },
  {
    k: "SOFTWARE DEV",
    v: "REACT · NODE · TYPESCRIPT · VITE · SUPABASE · POSTGRESQL",
    sub: "CI/CD VIA GITHUB ACTIONS · MULTI-TENANT SAAS · CSV WORKFLOWS",
  },
  {
    k: "AD FOREST HEALTH",
    v: "POWERSHELL FLEET SCANNER — 80+ DC FOREST",
    sub:
      "REPLICATION · SERVICE HEALTH · TIME DRIFT · SYSVOL INTEGRITY · DAILY REPORT IN 30 MIN",
  },
  {
    k: "SERVER VALIDATION",
    v: "CUSTOM POWERSHELL ENGINE — REPLACED DEPRECATED JAVA TOOL",
    sub: "PER-SERVER VALIDATION: 10+ MIN → SECONDS · CSV TEMPLATE-DRIVEN",
  },
  {
    k: "GPO OPTIMIZATION",
    v: "NATIVE POWERSHELL SUITE — REDUNDANT LINK DETECTION",
    sub:
      "OU TREE ANALYSIS · DAILY GPO BACKUP · CROSS-DOMAIN STRING SEARCH",
  },
  {
    k: "BIGFIX FLEET ANALYSIS",
    v: "CUSTOM ANALYSES — DRIVE METRICS & REGISTRY SCOPING",
    sub:
      "DISK UTILIZATION · PATCH COMPLIANCE · ENVIRONMENT-WIDE WORK ITEM TARGETING",
  },
  {
    k: "EDUCATION",
    v: "B.S. NETWORK TECHNOLOGIES — WESTERN ILLINOIS UNIVERSITY",
    sub: "INFORMATION SYSTEMS MINOR · DEPARTMENT SCHOLAR · DEPARTMENTAL HONORS",
  },
  {
    k: "CERTIFICATIONS",
    v: "SRE PRACTITIONER · AZURE FUNDAMENTALS · DESIGN THINKING",
    sub:
      "KYNDRYL SRE PRACTITIONER (MAY 2026) · MICROSOFT AZ-900 (DEC 2024) · IBM",
  },
  {
    k: "CURRENT DEPLOYMENT",
    v: "KYNDRYL — LEAD SYSTEMS ADMINISTRATOR (PUBLIC SECTOR)",
    sub:
      "1,200 WINDOWS SERVERS · HIPAA HEALTHCARE & FINANCIAL SERVICES · 24/7 DUTY CYCLE",
  },
];

export type DeploymentNode = {
  id: string;
  flag: string;
  name: string;
  period: string;
  status: string;
  statusClass: "online" | "rnd" | "legacy" | "archive";
  dotClass: "green" | "amber" | "cyan";
  img: string;
  imgAlt: string;
  desc: string;
  highlights: string[];
  uptimeOffset: number;
  command: "ping" | "purge";
  tele: [number, number, number];
};

export const DEPLOYMENT_NODES: DeploymentNode[] = [
  {
    id: "NODE-01",
    flag: "FLAGSHIP",
    name: "EQUIPQR™",
    period: "COLUMBIA CLOUDWORKS · JUL 2024 – PRESENT",
    status: "[ONLINE — REVENUE]",
    statusClass: "online",
    dotClass: "green",
    img: "https://placehold.co/800x450/050705/00FF41/png?text=EQUIPQR+::+LIVE+FEED",
    imgAlt: "EquipQR fleet equipment and work order management platform",
    desc:
      "Multi-tenant SaaS for fleet equipment and work order management. MVP shipped in 90 days with React, TypeScript, and Supabase. Active pilots generating revenue.",
    highlights: [
      "Secure cross-org data sharing workflows",
      "CSV import/export for client onboarding",
      "GitHub Actions CI/CD with migration branching tests",
    ],
    uptimeOffset: 10166400,
    command: "ping",
    tele: [34, 51, 67],
  },
  {
    id: "NODE-02",
    flag: "ENTERPRISE",
    name: "KYNDRYL",
    period: "PUBLIC SECTOR ACCOUNTS · SEP 2021 – PRESENT",
    status: "[ONLINE — PRODUCTION]",
    statusClass: "online",
    dotClass: "green",
    img: "https://placehold.co/800x450/050705/00E5FF/png?text=KYNDRYL+::+ENTERPRISE+OPS",
    imgAlt: "Kyndryl enterprise hybrid-cloud operations",
    desc:
      "Lead Systems Administrator for hybrid-cloud environments supporting up to 1,200 Windows Servers across healthcare and financial services — HIPAA-compliant.",
    highlights: [
      "Sole Windows SA for major healthcare account",
      "WSUS + Ansible Tower patch automation overhaul",
      "Custom BigFix analyses for fleet metrics at scale",
    ],
    uptimeOffset: 8200000,
    command: "ping",
    tele: [42, 58, 73],
  },
  {
    id: "NODE-03",
    flag: "LEGACY CORE",
    name: "IBM",
    period: "WINDOWS ADMIN & AUTOMATION · JUN 2011 – SEP 2021",
    status: "[ARCHIVED — STABLE]",
    statusClass: "legacy",
    dotClass: "amber",
    img: "https://placehold.co/800x450/050705/FFB000/png?text=IBM+::+AUTOMATION+CORE",
    imgAlt: "IBM Windows Server administration and automation",
    desc:
      "Windows Server Administrator and Automation Specialist for regulated healthcare and aerospace clients. Reduced manual ops by 60%+ through enterprise automation.",
    highlights: [
      "BigFix → Ansible/Ansible Tower migration lead",
      "Daily AD/GPO health check automation",
      "Offshore team training and mentorship",
    ],
    uptimeOffset: 25000000,
    command: "purge",
    tele: [28, 44, 55],
  },
  {
    id: "NODE-04",
    flag: "FOUNDATION",
    name: "WESTERN ILLINOIS UNIVERSITY",
    period: "TECHNICAL ASSISTANT · MAR 2008 – MAY 2011",
    status: "[ARCHIVE — ROOT]",
    statusClass: "archive",
    dotClass: "cyan",
    img: "https://placehold.co/800x450/050705/00E5FF/png?text=WIU+::+FOUNDATION+LAYER",
    imgAlt: "Western Illinois University technical foundation",
    desc:
      "Deskside support, hardware diagnostics, and repair for computer labs and enterprise equipment. Origin node for continuous systems operation.",
    highlights: [
      "Enterprise hardware diagnostics & repair",
      "Computer lab infrastructure support",
      "B.S. Network Technologies — Department Scholar",
    ],
    uptimeOffset: 35000000,
    command: "purge",
    tele: [18, 32, 41],
  },
];
