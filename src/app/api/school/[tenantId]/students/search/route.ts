import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ tenantId: string }> }
) {
  const { tenantId } = await params;
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q') || '';
  const classId = searchParams.get('classId') || '';

  console.log('Search API Request:', { query, classId, tenantId });

  try {
    const tenant = await prisma.tenant.findFirst({
      where: {
        OR: [{ id: tenantId }, { domain: tenantId }]
      }
    });

    if (!tenant) return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });

    const students = await prisma.studentProfile.findMany({
      where: {
        tenantId: tenant.id,
        AND: [
          classId ? { enrollments: { some: { classId } } } : {},
          query ? {
            OR: [
              { user: { firstName: { contains: query } } },
              { user: { lastName: { contains: query } } },
              { admissionNumber: { contains: query } },
              { fatherName: { contains: query } }
            ]
          } : {}
        ]
      },
      include: {
        user: true,
        enrollments: {
          include: { class: true }
        }
      },
      take: 50,
      orderBy: { user: { firstName: 'asc' } }
    });

    console.log(`Found ${students.length} students for query: "${query}"`);
    return NextResponse.json(students);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to search students' }, { status: 500 });
  }
}
