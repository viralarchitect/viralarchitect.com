export const RELIABILITY = [
  {
    title: "Own the service level",
    metric: "98%",
    label: "availability SLO · EquipQR core workflows · rolling 28 days",
    summary:
      "Operate EquipQR, a production SaaS product, end to end: design, delivery, monitoring, recovery, and customer communication.",
    detail: [
      "EquipQR's SLO covers five core service indicators: authentication, scan-to-record, form submission and read-back, record writes, and equipment images. Platform outages count against the SLO because customers experience them as downtime. Managed-platform availability sets the ceiling, so the target is sized to what the dependency chain can support.",
      "Optional integrations — QuickBooks, Google Maps, Google Workspace, and transactional email — are isolated from the core, so their failure degrades features without taking the app down.",
      "Support runs outside business hours. Issues within my control are restored within four hours of 5 PM, and customers keep a documented paper workflow as a fallback during any outage.",
    ],
  },
  {
    title: "Restore service. Close the loop.",
    metric: "15+ years",
    label: "continuous enterprise on-call · IBM through Kyndryl",
    summary:
      "Responded through nights, weekends, and holidays; personally led critical-service restoration and followed major incidents through to verified corrective actions.",
    detail: [
      "I have handled incidents caused by infrastructure failures and by my own changes. Postmortems are blameless and focus on contributing factors, using techniques such as Five Whys, with corrective actions assigned to named owners with due dates. Problem records stay open until every responsible party has completed and verified their actions, so fixes stick and lessons stay with the team.",
    ],
  },
  {
    title: "Let reliability constrain releases",
    metric: "2 weeks",
    label: "production change freeze after a hosting-platform outage",
    summary:
      "After a significant outage at EquipQR's hosting provider, I held all production changes until the platform had stabilized, so the next service period started from a known-good baseline.",
    detail: [
      "Reliability sets the pace of releases. Changes are deployed only in the customer's lowest-usage window, verified the following morning, and shipped with a rollback plan. When reliability is at risk, feature work waits.",
    ],
  },
] as const;

export const MONITORING = [
  {
    title: "Application and dependency health",
    text: "Better Stack uptime monitoring covers EquipQR, with a public status page at status.equipqr.app. Alerts are reviewed after business hours, matching the published support window.",
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

export const DATA_PROTECTION = [
  {
    title: "Backups and tested restore",
    text: "Daily database backups provide a 24-hour recovery point. The restore procedure has been carried out in production: scripts rebuild the full stack locally from backup data and re-import it once the platform is stable.",
  },
  {
    title: "Recovery data handling",
    text: "During a declared recovery, backup data may be restored to a local environment on a BitLocker-encrypted, TPM-backed device solely to rebuild and re-import it into production. The local copy is permanently deleted as soon as production is verified, and both the restore and the deletion are recorded in the incident notes.",
  },
  {
    title: "Accepted risks",
    text: "Hosting is single-provider, and equipment images are not independently backed up. Off-platform backups would require either paid replicated storage, which the current scale does not justify, or copies on personal devices, which I do not allow, because customer data must stay in audited, access-controlled systems. Both risks will be revisited as the customer base grows or a customer requires it.",
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
