import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request, { params }: { params: Promise<{ tenantId: string }> }) {
  const { tenantId } = await params;

  const tenant = await prisma.tenant.findUnique({ where: { domain: tenantId } }) ||
               await prisma.tenant.findUnique({ where: { id: tenantId } });

  if (!tenant) {
    return NextResponse.json([]);
  }

  const classes = await prisma.class.findMany({
    where: { tenantId: tenant.id },
    select: { id: true, name: true },
    orderBy: { order: 'asc' }
  });

  return NextResponse.json(classes);
}