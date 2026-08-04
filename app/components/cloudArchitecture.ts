export const CLOUD_PRINCIPLES = [
  {
    id: "execution",
    title: "Local-first execution",
    body: "Termi coordinates the cloud CLIs and SDKs installed on your Mac. Work stays within your customer-managed workstation and cloud accounts.",
  },
  {
    id: "identity",
    title: "Short-lived workload identity",
    body: "Use scoped roles and federated identity instead of placing long-lived cloud credentials in Termi.",
  },
  {
    id: "network",
    title: "Existing network controls",
    body: "Use the VPN, proxy, egress, and private service routes already applied to your workstation. Termi does not create a parallel network path.",
  },
  {
    id: "audit",
    title: "Native audit trail",
    body: "Keep cloud API activity attributable through CloudTrail or Cloud Audit Logs, then route it through your existing logging operations.",
  },
] as const;

export const CLOUD_PROVIDERS = [
  {
    name: "AWS",
    scope: "Customer-managed AWS accounts",
    tooling: "AWS CLI and AWS SDKs",
    identity: "IAM Identity Center or IAM roles with temporary credentials from AWS STS",
    secrets: "AWS Secrets Manager",
    keys: "AWS KMS",
    audit: "AWS CloudTrail",
    logs: "Amazon CloudWatch",
  },
  {
    name: "Google Cloud",
    scope: "Customer-managed Google Cloud projects",
    tooling: "Google Cloud CLI and client libraries",
    identity: "Workload Identity Federation or service account impersonation",
    secrets: "Secret Manager",
    keys: "Cloud KMS",
    audit: "Cloud Audit Logs",
    logs: "Cloud Logging",
  },
] as const;
