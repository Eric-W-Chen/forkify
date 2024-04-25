/* A config.js file is used in software projects to centralize configuration settings, making it easier to manage different aspects of your application. 

Contents of config.js:
Environment-Specific Settings: This includes different parameters for development, testing, and production environments, such as database URLs, API endpoints, and server ports.
API Keys and Credentials: Securely store API keys and other credentials your application needs for interacting with external services. For production, it's safer to use environment variables or secure services to manage these.
Application Settings: General settings that influence application behavior, like feature toggles, session parameters, and pagination defaults.
Connection and Performance Settings: Configurations for performance optimization, such as request timeouts, database connection pools, and rate limits.
Security Settings: Settings related to security features, including CORS configurations, SSL/TLS setups, and security headers.

Using a config.js file effectively helps maintain a cleaner, more secure, and easily maintainable codebase by centralizing and managing settings separately from application logic. */
export const API_URL = `https://forkify-api.herokuapp.com/api/v2/recipes`;
export const TIMEOUT_SEC = 10;
export const RES_PER_PAGE = 10;
export const API_KEY = '786378a9-17fb-4888-b735-553b6c89e880';
export const MODAL_CLOSE_SEC = 2500;
