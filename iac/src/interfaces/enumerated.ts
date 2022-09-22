export const PREFIX = {
  PROJECT: `${process.env.PROJECT_WORKFLOW}-${process.env.PROJECT_NAME}-${process.env.PROJECT_SERVICE_NAME}`,
  SERVICE: `${process.env.PROJECT_WORKFLOW}-${process.env.PROJECT_NAME}`,
  DNS_RECORD_NAME: `${process.env.PROJECT_WORKFLOW}-${process.env.PROJECT_SERVICE_NAME}`,
  PULUMI_STACK: `${process.env.PROJECT_WORKFLOW}-${process.env.PROJECT_SERVICE_NAME}`,
} as const;
export type PREFIX = typeof PREFIX[keyof typeof PREFIX];

export const TAGS = {
  AWS: {
    "Product": `${process.env.PROJECT_NAME}-${process.env.PROJECT_SERVICE_NAME}`,
    "Workflow": process.env.PROJECT_WORKFLOW ?? "workflow",
  },
} as const;
export type TAGS = typeof TAGS[keyof typeof TAGS];

export const ARGUMENTS = {
  API: "api",
  WEB: "web",
  DESTROY: "destroy",
  UP: "up"
} as const;
export type ARGUMENTS = typeof ARGUMENTS[keyof typeof ARGUMENTS];

export const PULUMI_STACK_CONFIG = {
  AWS_REGION: "aws:region",
  MONGODB_ATLAS_PUBLIC_KEY: "mongodbatlas:publicKey",
  MONGODB_ATLAS_PRIVATE_KEY: "mongodbatlas:privateKey",
  CLOUDFLARE_API_TOKEN: "cloudflare:apiToken"
} as const;
export type PULUMI_STACK_CONFIG = typeof PULUMI_STACK_CONFIG[keyof typeof PULUMI_STACK_CONFIG];

export const PROJECT_WORKFLOW = {
  PRODUCTION: "production",
  DEVELOPMENT: "dev",
  STAGING: "staging"
} as const;
export type PROJECT_WORKFLOW = typeof PROJECT_WORKFLOW[keyof typeof PROJECT_WORKFLOW];

export const URLS = {
  WEBSITE: `${PREFIX.DNS_RECORD_NAME}.${process.env.CLOUDFLARE_DOMAIN_NAME}`
} as const;
export type URLS = typeof URLS[keyof typeof URLS];
