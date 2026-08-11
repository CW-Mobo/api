import jwt from "jsonwebtoken";

export interface IUserPayload {
  id: string;
  userRole: "family_farmer" | "company_admin" | "company_worker";
  company?: string;
}

// GERA UM TOKEN JWT COM O PAYLOAD DO USUÁRIO
export const generateToken = (payload: IUserPayload) => {
  if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET não definido");

  // Expiração em 1 dia (24h)
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1d" });
};
