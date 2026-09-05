import { Types } from "mongoose";
import { IUserPayload } from "./jwt";

interface OwnedDocument {
  user?: Types.ObjectId | string;
  company?: Types.ObjectId | string;
}

// EXTRAI O ID DO USUÁRIO E DA EMPRESA DE UM DOCUMENTO PARA VERIFICAÇÃO DE PROPRIEDADE
export function ownedFields(doc: {
  user?: string | Types.ObjectId;
  company?: string | Types.ObjectId;
}): OwnedDocument {
  return {
    user: doc.user,
    company: doc.company,
  };
}

// ATRIBUI O ID DO USUÁRIO OU DA EMPRESA AO DOCUMENTO, DEPENDENDO DO TIPO DE USUÁRIO
export function assignOwnership<
  T extends {
    user?: Types.ObjectId | string;
    company?: Types.ObjectId | string;
  },
>(userSession: IUserPayload, doc: T): void {
  if (userSession.userRole === "family_farmer") {
    doc.user = userSession.id;
  } else {
    if (!userSession.company) {
      throw new Error("Usuário não está vinculado a uma empresa.");
    }

    doc.company = userSession.company;
  }
}

// VERIFICA SE O USUÁRIO TEM PERMISSÃO PARA ACESSAR O DOCUMENTO, COM BASE NO TIPO DE USUÁRIO E NA PROPRIEDADE DO DOCUMENTO
export function checkOwnership<T extends OwnedDocument>(
  userSession: IUserPayload,
  doc: T,
): void {
  if (userSession.userRole === "family_farmer") {
    if (!doc.user || !new Types.ObjectId(doc.user).equals(userSession.id)) {
      throw new Error("Acesso negado: este conteúdo não pertence a você.");
    }

    return;
  }

  if (
    !doc.company ||
    !userSession.company ||
    !new Types.ObjectId(doc.company).equals(userSession.company)
  ) {
    throw new Error("Acesso negado: este conteúdo não pertence à sua empresa.");
  }
}
