import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ tenantId: string }> }
) {
  const { tenantId } = await params;

  try {
    const body = await req.json();
    const { name, email, role, password } = body;

    if (!name || !email || !role || !password) {
      return NextResponse.json({ success: false, error: 'All fields are required' }, { status: 400 });
    }

    const tenant = await prisma.tenant.findFirst({
      where: { OR: [{ id: tenantId }, { domain: tenantId }] }
    });

    if (!tenant) {
      return NextResponse.json({ success: false, error: 'School not found' }, { status: 404 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json({ success: false, error: 'Email already registered' }, { status: 400 });
    }

    // Try to find role, if not found create without roleId
    let roleId = null;
    const roleData = await prisma.role.findFirst({
      where: { name: role }
    });
    if (roleData) roleId = roleData.id;

    const hashedPassword = await bcrypt.hash(password, 10);

    // Split name into firstName and lastName
    const nameParts = name.trim().split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || null;

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: hashedPassword,
        firstName,
        lastName,
        ...(roleId ? { roleId } : {}),
        tenantId: tenant.id,
      }
    });

    return NextResponse.json({ success: true, userId: user.id });
  } catch (error: any) {
    console.error('Staff creation error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to create staff member' }, { status: 500 });
  }
}