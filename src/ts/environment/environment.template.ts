export type EnvironmentType = 'dev' | 'staging' | 'prod' | '{{ENVIRONMENT}}';
export const environment: EnvironmentType = '{{ENVIRONMENT}}'; // Initial value is '{{ENVIRONMENT}}', but it can change dynamically
