import path from "path";
import fs from "fs";
import YAML from "yamljs";

const loadYamlDirectory = (directory: string) => {
  const files = fs
    .readdirSync(directory)
    .filter((file) => file.endsWith(".yaml") || file.endsWith(".yml"));

  return files.reduce<Record<string, unknown>>((acc, file) => {
    const filePath = path.join(directory, file);
    const content = YAML.load(filePath);

    Object.assign(acc, content);

    return acc;
  }, {});
};

const swaggerSchemas = loadYamlDirectory(path.join(__dirname, "schemas"));
const swaggerRoutes = loadYamlDirectory(path.join(__dirname, "routes"));
const swaggerParameters = loadYamlDirectory(path.join(__dirname, "parameters"));

const swaggerDocument = {
  openapi: "3.0.0",

  info: {
    title: "Mobo API",
    version: "1.0.0",
    description:
      "API for controlling the Mobo smart farming lychee harvesting system.",
  },

  servers: [
    {
      url: "http://localhost:5000",
      description: "Development server",
    },
    {
      url: "https://mobo-m9ug.onrender.com",
      description: "Production server",
    },
  ],

  components: {
    schemas: swaggerSchemas,
    parameters: swaggerParameters,

    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },

      cookieAuth: {
        type: "apiKey",
        in: "cookie",
        name: "token",
      },
    },
  },

  paths: swaggerRoutes,
};

export default swaggerDocument;
