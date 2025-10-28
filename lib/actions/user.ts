"use server";

import { isRedirectError } from "next/dist/client/components/redirect-error";
import { auth, signIn, signOut } from "@/auth";
import { prisma } from "@/db/prisma";
import { revalidatePath } from "next/cache";
import { hashSync } from "bcrypt-ts-edge";
import { z } from "zod";
import { createUserSchema, signInFormSchema } from "../validators";
import { convertToPlainObject } from "../utils";

export type ActionState = {
  success: boolean;
  message: string;
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
