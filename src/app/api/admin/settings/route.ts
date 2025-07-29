import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET: Get all settings
export async function GET() {
  try {
    const settings = await prisma.appSettings.findUnique({
      where: { id: "singleton" },
    });

    if (!settings) {
      return NextResponse.json({ payload: {} });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

// POST: Create or update settings
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Upsert settings - create if doesn't exist, update if it does
    const settings = await prisma.appSettings.upsert({
      where: { id: "singleton" },
      update: {
        payload: body,
        updatedAt: new Date(),
      },
      create: {
        id: "singleton",
        payload: body,
      },
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error saving settings:", error);
    return NextResponse.json(
      { error: "Failed to save settings" },
      { status: 500 }
    );
  }
}

// PUT: Update settings
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();

    const settings = await prisma.appSettings.update({
      where: { id: "singleton" },
      data: {
        payload: body,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}

// DELETE: Reset settings to empty
export async function DELETE() {
  try {
    const settings = await prisma.appSettings.update({
      where: { id: "singleton" },
      data: {
        payload: {},
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error resetting settings:", error);
    return NextResponse.json(
      { error: "Failed to reset settings" },
      { status: 500 }
    );
  }
}

// --- Sub-user management endpoints (to be implemented) ---
// Example: GET /api/admin/settings/subusers, POST /api/admin/settings/subusers, etc.
// These will allow the super user to create, update, delete, and list sub-users and their permissions.
