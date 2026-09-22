import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",

    info: {
      title: "Mobo API",
      version: "1.0.0",
      description:
        "API for controlling the Mobo smart lychee harvesting system",
    },

    servers: [
      {
        url: "http://localhost:3000",
        description: "Development server",
      },
    ],

    components: {
      securitySchemes: {
        cookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "token",
          description:
            "Authentication JWT stored in an HttpOnly cookie.",
        },
      },
    },
  },

  apis: ["./src/modules/**/*.routes.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);