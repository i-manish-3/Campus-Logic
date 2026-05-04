'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function createTransportRoute(tenantId: string, formData: FormData) {
  const name = formData.get('name') as string;
  const vehicleNumber = formData.get('vehicleNumber') as string;
  const driverName = formData.get('driverName') as string;
  const driverPhone = formData.get('driverPhone') as string;
  const feeAmountStr = formData.get('feeAmount') as string;

  if (!name || !feeAmountStr) return { error: 'Route Name and Fee Amount are required' };

  const feeAmount = parseFloat(feeAmountStr);
  if (isNaN(feeAmount)) return { error: 'Invalid Fee Amount' };

  try {
    await prisma.$transaction(async (tx) => {
      // 1. Create Route
      const route = await tx.transportRoute.create({
        data: {
          name,
          vehicleNumber,
          driverName,
          driverPhone,
          feeAmount,
          tenantId,
        },
      });

      // 2. Find Current Session
      const session = await tx.academicSession.findFirst({
        where: { tenantId, isCurrent: true }
      });

      if (session) {
        // 3. Find/Create "Transport Fee" Head
        let transportHead = await tx.feeHead.findFirst({
          where: { name: 'Transport Fee', tenantId }
        });

        if (!transportHead) {
          transportHead = await tx.feeHead.create({
            data: {
              name: 'Transport Fee',
              description: 'Fees for school bus/transportation services.',
              tenantId
            }
          });
        }

        // 4. Create Fee Structure for this route
        const structure = await tx.feeStructure.create({
          data: {
            feeHeadId: transportHead.id,
            sessionId: session.id,
            transportRouteId: route.id,
            amount: feeAmount,
            frequency: 'MONTHLY',
            tenantId,
          }
        });

        // 5. Generate Monthly Installments
        const installments = [];
        const startDate = new Date(session.startDate);
        for (let i = 0; i < 12; i++) {
          const dueDate = new Date(startDate);
          dueDate.setMonth(startDate.getMonth() + i);
          installments.push({
            feeStructureId: structure.id,
            name: 'Transport - ' + dueDate.toLocaleString('default', { month: 'long' }),
            dueDate,
            amount: feeAmount,
          });
        }

        await tx.feeInstallment.createMany({
          data: installments
        });
      }
    });

    revalidatePath(`/school/${tenantId}/transport`);
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: 'Failed to create Transport Route. Name may already exist.' };
  }
}

export async function deleteTransportRoute(tenantId: string, routeId: string) {
  try {
    await prisma.transportRoute.delete({
      where: { id: routeId, tenantId },
    });
    revalidatePath(`/school/${tenantId}/transport`);
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: 'Failed to delete route. It might be assigned to students.' };
  }
}
