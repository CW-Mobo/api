import mongoose, { Schema, Model } from "mongoose";
import { IUser, IFarmerDetails, UserRole } from "./users.types";

// SCHEMA PARA DETALHES DE AGRICULTORES FAMILIARES
const FarmerDetailsSchema: Schema<IFarmerDetails> = new Schema({
  cpf: {
    type: String,
    required: true,
    validate: {
      validator: (v: string) => /^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(v),
      message: "CPF inválido!",
    },
  },
  dap: {
    type: String,
    required: true,
    minlength: 10,
    uppercase: true,
  },
});

// SCHEMA PRINCIPAL DO DOCUMENTO USUÁRIO
const UserSchema: Schema<IUser> = new Schema(
  {
    userImage: { type: String },

    userName: {
      type: String,
      required: true,
    },

    userEmail: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    userPassword: {
      type: String,
      required: true,
    },

    userPhone: {
      type: String,
      trim: true,
    },

    userRole: {
      type: String,
      enum: [
        "family_farmer",
        "company_admin",
        "company_worker",
      ] satisfies UserRole[],
      required: true,
    },

    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: function (this: IUser) {
        return this.userRole !== "family_farmer";
      },
    },

    farmerDetails: {
      type: FarmerDetailsSchema,
      required: function (this: IUser) {
        return this.userRole === "family_farmer";
      },
    },
  },
  { timestamps: true },
);

// MÉTODO PARA REMOVER A SENHA DO OBJETO JSON RETORNADO
UserSchema.methods.toJSON = function () {
  const userObject = this.toObject();

  delete userObject.userPassword;

  return userObject;
};

// CRIANDO O MODELO DE USUÁRIO
const User: Model<IUser> = mongoose.model<IUser>("User", UserSchema);

export default User;
