"use server";

import { isRedirectError } from "next/dist/client/components/redirect-error";
import { auth, signIn, signOut } from "@/auth";
import { prisma } from "@/db/prisma";
import { revalidatePath } from "next/cache";
import { hashSync } from "bcrypt-ts-edge";
import { createHash, randomBytes } from "crypto";
import { z } from "zod";
import {
  createUserSchema,
  forgotPasswordSchema,
  profileUpdateSchema,
  resetPasswordSchema,
  signInFormSchema,
} from "../validators";
import { convertToPlainObject } from "../utils";
import { sendPasswordResetEmail } from "@/email";

export type ActionState = {
  success: boolean;
  message: string;
};

const hashToken = (token: string): string => {
  return createHash("sha256").update(token).digest("hex");
};

// Sign in the user with credentials
export async function signInWithCredentials(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const user = signInFormSchema.parse({
      email: formData.get("email"),
      password: formData.get("password"),
    });

    await signIn("credentials", user);

    return { success: true, message: "Signed in successfully" };
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    return { success: false, message: "Invalid email or password" };
  }
}

// Sign out user
export async function signOutUser() {
  await signOut();
}

export async function requestPasswordReset(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const { email } = forgotPasswordSchema.parse({
      email: formData.get("email"),
    });

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !user.password) {
      return {
        success: true,
        message: "If your email is registered, you will receive a reset link shortly.",
      };
    }

    await prisma.passwordResetToken.deleteMany({ where: { email } });

    const rawToken = randomBytes(32).toString("hex");
    const hashedToken = hashToken(rawToken);

    await prisma.passwordResetToken.create({
      data: {
        email,
        token: hashedToken,
        expires: new Date(Date.now() + 30 * 60 * 1000),
      },
    });

    await sendPasswordResetEmail(email, rawToken);

    return {
      success: true,
      message: "If your email is registered, you will receive a reset link shortly.",
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, message: error.issues[0]?.message ?? "Invalid email" };
    }

    console.error("Failed to request password reset:", error);
    return {
      success: false,
      message: "Unable to process your request right now. Please try again.",
    };
  }
}

export async function resetPassword(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const { token, password } = resetPasswordSchema.parse({
      token: formData.get("token"),
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
    });

    const hashedToken = hashToken(token);
    const resetRecord = await prisma.passwordResetToken.findFirst({
      where: { token: hashedToken },
    });

    if (!resetRecord || resetRecord.expires < new Date()) {
      return { success: false, message: "Invalid or expired reset link." };
    }

    const user = await prisma.user.findUnique({ where: { email: resetRecord.email } });

    if (!user) {
      await prisma.passwordResetToken.deleteMany({ where: { email: resetRecord.email } });
      return { success: false, message: "Account not found." };
    }

    const hashedPassword = hashSync(password, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    await prisma.passwordResetToken.deleteMany({ where: { email: user.email } });

    return { success: true, message: "Password reset successfully. You can now sign in." };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, message: error.issues[0]?.message ?? "Invalid request" };
    }

    console.error("Failed to reset password:", error);
    return {
      success: false,
      message: "Unable to reset password. Please try again.",
    };
  }
}

// Create a new user
export async function createUser(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    // Check session & permissions
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return {
        success: false,
        message: "You are not authorized to perform this action.",
      };
    }

    // validate input via Zod
    const payload = createUserSchema.parse({
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
      role: formData.get("role"),
      address: formData.get("address") || undefined,
      phone: formData.get("phone"),
      dob: formData.get("dob"),
      joinDate: formData.get("joinDate") || undefined,
    });

    const hashedPassword = hashSync(payload.password, 10);

    // Insert into Prisma DB
    await prisma.user.create({
      data: {
        name: payload.name,
        email: payload.email,
        password: hashedPassword,
        role: payload.role,
        address: payload.address,
        phone: payload.phone,
        dob: payload.dob ? new Date(payload.dob) : null,
        joinDate: payload.joinDate ? new Date(payload.joinDate) : null,
      },
    });

    revalidatePath("/dashboard/users");

    return {
      success: true,
      message: "User created successfully.",
    };
  } catch (error) {
    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: error.issues[0]?.message || "Invalid form submission.",
      };
    }

    // Handle Prisma unique constraint violation
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code?: string }).code === "P2002"
    ) {
      return {
        success: false,
        message: "A user with this email already exists.",
      };
    }

    console.error("Failed to create user:", error);
    return {
      success: false,
      message: "Something went wrong while creating the user.",
    };
  }
}

export async function getUsers() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  return convertToPlainObject(users);
}

export async function updateUserProfile(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return {
        success: false,
        message: "You must be signed in to update your profile.",
      };
    }

    const parsed = profileUpdateSchema.parse({
      name: formData.get("name"),
      phone: formData.get("phone"),
      address: formData.get("address"),
      dob: formData.get("dob"),
      gender: formData.get("gender"),
    });

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: parsed.name,
        phone: parsed.phone,
        address: parsed.address,
        dob: parsed.dob ? new Date(parsed.dob) : null,
        gender: parsed.gender ?? null,
      },
    });

    revalidatePath("/user/profile");

    return {
      success: true,
      message: "Profile updated successfully.",
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: error.issues[0]?.message ?? "Invalid profile details.",
      };
    }

    console.error("Failed to update profile:", error);
    return {
      success: false,
      message: "Unable to update profile right now. Please try again.",
    };
  }
}
