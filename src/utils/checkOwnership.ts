import { Types } from "mongoose";
import { IUserPayload } from "./jwt";

interface OwnedDocument {
  user?: Types.ObjectId | string;
  company?: Types.ObjectId | string;
}

// EXTRAI O ID DO USUÁRIO E DA EMPRESA DE UM DOCUMENTO PARA VERIFICAÇÃO DE PROPRIEDADE
export function ownedFields(doc: { user?: any; company?: any }) {
  return {
    user: doc.user as Types.ObjectId | string,
    company: doc.company as Types.ObjectId | string,
  };
}

// ATRIBUI O ID DO USUÁRIO OU DA EMPRESA AO DOCUMENTO, DEPENDENDO DO TIPO DE USUÁRIO
export function assignOwnership<
  T extends { user?: unknown; company?: unknown },
>(userSession: IUserPayload, doc: T): void {
  if (userSession.userRole === "family_farmer") {
    doc.user = userSession.id as any;
  } else {
    doc.company = userSession.company as any;
  }
}

// VERIFICA SE O USUÁRIO TEM PERMISSÃO PARA ACESSAR O DOCUMENTO, COM BASE NO TIPO DE USUÁRIO E NA PROPRIEDADE DO DOCUMENTO
export function checkOwnership<T extends OwnedDocument>(
  userSession: IUserPayload,
  doc: T,
): void {
  if (
    userSession.userRole === "family_farmer" &&
    (!doc.user || !new Types.ObjectId(doc.user).equals(userSession.id))
  ) {
    throw new Error("Acesso negado: este conteúdo não pertence a você.");
  }

  if (
    userSession.userRole !== "family_farmer" &&
    (!doc.company ||
      !new Types.ObjectId(doc.company).equals(userSession.company))
  ) {
    throw new Error("Acesso negado: este conteúdo não pertence à sua empresa.");
  }
}
