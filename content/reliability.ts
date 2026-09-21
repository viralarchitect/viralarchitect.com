export const RELIABILITY = [
  {
    title: "Own the service level",
    metric: "99.9%",
    label: "monthly availability objective · EquipQR",
    summary:
      "Operate a production SaaS service with public status monitoring, direct SMS outage alerts, and customer communication during significant interruptions.",
    detail:
      "Availability commitments are tied to customer-impacting normal business operations. When the agreed service level is missed because customer operations are affected, the customer receives a 10% service credit for that billing month. During significant interruptions, I update the customer stakeholder at least hourly or when significant new information becomes available.",
  },
  {
    title: "Restore service. Close the loop.",
    metric: "15+ years",
    label: "continuous enterprise on-call · IBM through Kyndryl",
    summary:
      "Responded through nights, weekends, and holidays; personally led critical-service restoration and followed major incidents through to verified corrective actions.",
    detail:
      "I have handled incidents caused by infrastructure failures and by my own changes. Root-cause analysis includes Five Whys, documented contributing factors, and corrective actions with named owners and due dates. RCA / Problem records remain open until actions from all responsible parties are completed and verified. The goal is to prevent recurrence and preserve operational knowledge.",
  },
  {
    title: "Let reliability constrain releases",
    metric: "2 weeks",
    label: "production change freeze after an EquipQR outage",
    summary:
      "After a significant hosting-platform outage, I paused production changes to avoid adding risk while the incident was fully resolved and the next service period began from a stable baseline.",
    detail:
      "Service reliability directly informs release decisions. Change control includes risk assessment and rollback planning: production engineering must protect systems from unnecessary risk, including changes introduced by engineering teams themselves.",
  },
] as const;

export const MONITORING = [
  {
    title: "Application and dependency health",
    text: "EquipQR monitoring covers the application and its managed platform dependencies. Vercel or Supabase outages trigger direct notification; public status is available at status.equipqr.app.",
  },
  {
    title: "Signals that distinguish failure modes",
    text: "Tuned enterprise thresholds to customer operating requirements. Configured monitoring to distinguish individual service failure, monitoring-agent failure, and server or network unreachability; AD replication alerts identify specific replication failures.",
  },
  {
    title: "Diagnosis and capacity",
    text: "Correlate service and system logs; diagnose DNS, ports, firewalls, proxies, load balancers, TLS, and network paths. Apply historical utilization trends and forecasting concepts to anticipate capacity needs before resource exhaustion. Earlier troubleshooting also included packet captures.",
  },
] as const;

export const AUTOMATION = [
  {
    title: "Idempotent remediation with BigFix",
    eyebrow: "DESIRED STATE / IBM BIGFIX",
    outcome: "Remediate only the endpoints that need it.",
    summary:
      "Authored Fixlets that use endpoint state to decide whether a required domain-controller service needs remediation.",
    steps: [
      {
        title: "Detect",
        text: "Relevance checks whether the service exists and is not running. Only endpoints in that incorrect state are applicable.",
      },
      {
        title: "Converge",
        text: "The action verifies startup type, changes it to Automatic only if necessary, then starts the service.",
      },
      {
        title: "Verify",
        text: "Once the service is running, the endpoint becomes non-relevant. Desired state provides a self-validating completion condition.",
      },
    ],
    impact:
      "State-aware remediation supports safe repeated execution, reduces manual intervention, and makes fleet operations consistent. Applicability and post-action state drive the automation.",
  },
  {
    title: "Specification-driven compliance with PowerShell",
    eyebrow: "100+ CONTROLS / ACTIVE DIRECTORY",
    outcome: "10+ minutes per server → seconds",
    summary:
      "Designed an idempotent Active Directory health-check and compliance framework for an environment where security restrictions prevented Ansible use.",
    steps: [
      {
        title: "Specify",
        text: "A formal contractual security specification defined more than 100 configuration items, their required or agreed values, and the criteria for compliance.",
      },
      {
        title: "Evaluate",
        text: "Inspect actual server state and evaluate every control consistently against the specification. Repeated execution produces repeatable results.",
      },
      {
        title: "Evidence",
        text: "Produce consistent compliance evidence for operational review, replacing manual per-server validation with execution measured in seconds.",
      },
    ],
    impact:
      "Built for enterprise AD operations spanning approximately 80 domain controllers and thousands of Windows servers: explicit requirements, repeatable evaluation, and less validation toil.",
  },
] as const;
