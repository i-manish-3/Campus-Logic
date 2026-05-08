'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

import { hash } from 'bcryptjs';

export async function createTransportDriver(tenantIdOrDomain: string, formData: FormData) {
  const tenant = await prisma.tenant.findUnique({ where: { domain: tenantIdOrDomain } }) ||
                 await prisma.tenant.findUnique({ where: { id: tenantIdOrDomain } });
  if (!tenant) return { error: 'Tenant not found' };
  const tenantId = tenant.id;

  const name = formData.get('name') as string;
  const phone = formData.get('phone') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const dobStr = formData.get('dob') as string;
  const licenseNumber = formData.get('licenseNumber') as string;

  if (!name || !phone || !email || !password) {
    return { error: 'Name, Phone, Email and Password are required' };
  }

  try {
    const passwordHash = await hash(password, 10);
    const dob = dobStr ? new Date(dobStr) : null;

    await prisma.$transaction(async (tx) => {
      // 1. Create User
      const user = await tx.user.create({
        data: {
          email,
          passwordHash,
          firstName: name.split(' ')[0],
          lastName: name.split(' ').slice(1).join(' '),
          tenantId,
          isActive: true,
        }
      });

      // 2. Create Driver linked to User
      const photo = formData.get('photo') as string;
      await tx.transportDriver.create({
        data: {
          name,
          phone,
          dob,
          licenseNumber,
          photoUrl: photo || null,
          userId: user.id,
          tenantId,
        },
      });
    });

    revalidatePath(`/school/${tenantId}/transport`);
    revalidatePath(`/school/${tenantId}/transport/drivers`);
    return { success: true };
  } catch (error: any) {
    console.error(error);
    if (error.code === 'P2002') return { error: 'Email already exists' };
    return { error: 'Failed to register driver' };
  }
}

export async function updateTransportDriver(tenantIdOrDomain: string, driverId: string, formData: FormData) {
  const tenant = await prisma.tenant.findUnique({ where: { domain: tenantIdOrDomain } }) ||
                 await prisma.tenant.findUnique({ where: { id: tenantIdOrDomain } });
  if (!tenant) return { error: 'Tenant not found' };
  const tenantId = tenant.id;

  const name = formData.get('name') as string;
  const phone = formData.get('phone') as string;
  const dobStr = formData.get('dob') as string;
  const licenseNumber = formData.get('licenseNumber') as string;
  const photo = formData.get('photo') as string;

  if (!name || !phone) return { error: 'Name and Phone are required' };

  try {
    const dob = dobStr ? new Date(dobStr) : null;

    await prisma.transportDriver.update({
      where: { id: driverId, tenantId },
      data: {
        name,
        phone,
        dob,
        licenseNumber,
        photoUrl: photo || undefined,
      },
    });

    revalidatePath(`/school/${tenantId}/transport`);
    revalidatePath(`/school/${tenantId}/transport/drivers`);
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: 'Failed to update driver' };
  }
}

export async function toggleDriverStatus(tenantIdOrDomain: string, driverId: string, isActive: boolean) {
  const tenant = await prisma.tenant.findUnique({ where: { domain: tenantIdOrDomain } }) ||
                 await prisma.tenant.findUnique({ where: { id: tenantIdOrDomain } });
  if (!tenant) return { error: 'Tenant not found' };
  const tenantId = tenant.id;

  try {
    await prisma.transportDriver.update({
      where: { id: driverId, tenantId },
      data: { isActive },
    });
    revalidatePath(`/school/${tenantId}/transport/drivers`);
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: 'Failed to update status' };
  }
}

export async function deleteTransportDriver(tenantId: string, driverId: string) {
  try {
    await prisma.$transaction(async (tx) => {
      const driver = await tx.transportDriver.findUnique({
        where: { id: driverId, tenantId }
      });
      
      if (driver?.userId) {
        // Option 1: Delete the user too (might be risky if shared, but here it's 1:1)
        await tx.user.delete({ where: { id: driver.userId } });
      } else {
        await tx.transportDriver.delete({ where: { id: driverId, tenantId } });
      }
    });
    revalidatePath(`/school/${tenantId}/transport/drivers`);
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: 'Failed to delete driver. They might be assigned to routes.' };
  }
}

export async function createTransportRoute(tenantIdOrDomain: string, formData: FormData) {
  const tenant = await prisma.tenant.findUnique({ where: { domain: tenantIdOrDomain } }) ||
                 await prisma.tenant.findUnique({ where: { id: tenantIdOrDomain } });
  if (!tenant) return { error: 'Tenant not found' };
  const tenantId = tenant.id;

  const name = formData.get('name') as string;
  const vehicleNumber = formData.get('vehicleNumber') as string;
  const driverId = formData.get('driverId') as string;
  const sessionId = formData.get('sessionId') as string;
  const baseFeeStr = formData.get('baseFee') as string;
  const activeMonths = formData.get('activeMonths') as string; // "APR,MAY,JUN..."
  const stopsJson = formData.get('stopsJson') as string; // JSON string
  
  let baseFee = parseFloat(baseFeeStr || '0');
  
  // If no base fee is provided but stops exist, we can optionally default to 0 or first stop fare.
  // But usually, the baseFee field is mandatory in the UI now.
  if (isNaN(baseFee)) baseFee = 0;

  if (!name || !sessionId) return { error: 'Route Name and Session are required' };

  try {
    await prisma.$transaction(async (tx) => {
      // 1. Create Route with new fields
      const route = await tx.transportRoute.create({
        data: {
          name,
          vehicleNumber,
          driverId: driverId || null,
          feeAmount: baseFee,
          stopsJson,
          activeMonths,
          sessionId,
          tenantId,
        },
      });

      // 2. Fetch the specific session
      const session = await tx.academicSession.findUnique({
        where: { id: sessionId }
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
            amount: baseFee,
            frequency: 'MONTHLY',
            tenantId,
          }
        });

        // 5. Generate Installments only for active months
        const installments = [];
        const monthCodes = (activeMonths || '').split(',');
        const startDate = new Date(session.startDate);
        
        for (let i = 0; i < 12; i++) {
          const dueDate = new Date(startDate);
          dueDate.setMonth(startDate.getMonth() + i);
          
          // Get 3-letter month code (e.g., "APR")
          const monthCode = dueDate.toLocaleString('default', { month: 'short' }).toUpperCase();
          
          if (monthCodes.includes(monthCode)) {
            installments.push({
              feeStructureId: structure.id,
              name: 'Transport - ' + dueDate.toLocaleString('default', { month: 'long' }),
              dueDate,
              amount: baseFee,
            });
          }
        }

        if (installments.length > 0) {
          await tx.feeInstallment.createMany({
            data: installments
          });
        }
      }
    });

    revalidatePath(`/school/${tenantId}/transport`);
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: 'Failed to create Transport Route. Check for duplicate names.' };
  }
}

export async function updateTransportRoute(tenantIdOrDomain: string, routeId: string, formData: FormData) {
  const tenant = await prisma.tenant.findUnique({ where: { domain: tenantIdOrDomain } }) ||
                 await prisma.tenant.findUnique({ where: { id: tenantIdOrDomain } });
  if (!tenant) return { error: 'Tenant not found' };
  const tenantId = tenant.id;

  const name = formData.get('name') as string;
  const vehicleNumber = formData.get('vehicleNumber') as string;
  const driverId = formData.get('driverId') as string;
  const sessionId = formData.get('sessionId') as string;
  const baseFeeStr = formData.get('baseFee') as string;
  const activeMonths = formData.get('activeMonths') as string;
  const stopsJson = formData.get('stopsJson') as string;
  
  let baseFee = parseFloat(baseFeeStr || '0');
  if (isNaN(baseFee)) baseFee = 0;

  if (!name || !sessionId) return { error: 'Route Name and Session are required' };

  try {
    await prisma.$transaction(async (tx) => {
      // 1. Update Route
      const route = await tx.transportRoute.update({
        where: { id: routeId, tenantId },
        data: {
          name,
          vehicleNumber,
          driverId: driverId || null,
          feeAmount: baseFee,
          stopsJson,
          activeMonths,
          sessionId,
        },
      });

      // 2. Resolve Academic Session
      const session = await tx.academicSession.findUnique({
        where: { id: sessionId }
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

        // 4. Ensure Fee Structure exists for this route and session
        let structure = await tx.feeStructure.findFirst({
          where: { transportRouteId: route.id, sessionId: session.id, tenantId }
        });

        if (!structure) {
          structure = await tx.feeStructure.create({
            data: {
              feeHeadId: transportHead.id,
              sessionId: session.id,
              transportRouteId: route.id,
              amount: baseFee,
              frequency: 'MONTHLY',
              tenantId,
            }
          });
        } else {
          // Update structure amount if it changed
          await tx.feeStructure.update({
            where: { id: structure.id },
            data: { amount: baseFee }
          });
        }

        // 5. Sync Installments only for active months
        const monthCodes = (activeMonths || '').split(',');
        const startDate = new Date(session.startDate);
        
        const DB_MONTH_MAP = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
        
        for (let i = 0; i < 12; i++) {
          const dueDate = new Date(startDate);
          dueDate.setMonth(startDate.getMonth() + i);
          
          const monthCode = DB_MONTH_MAP[dueDate.getMonth()];
          const monthLong = dueDate.toLocaleString('default', { month: 'long' });
          const installmentName = 'Transport - ' + monthLong;
          
          if (monthCodes.includes(monthCode)) {
            // Check if this installment already exists for this structure
            const existingInstallment = await tx.feeInstallment.findFirst({
              where: { 
                feeStructureId: structure.id,
                name: installmentName
              }
            });

            if (!existingInstallment) {
              await tx.feeInstallment.create({
                data: {
                  feeStructureId: structure.id,
                  name: installmentName,
                  dueDate,
                  amount: baseFee,
                }
              });
            } else if (existingInstallment.amount !== baseFee) {
              // Update amount if changed (only if not paid, but keep it simple for now)
              await tx.feeInstallment.update({
                where: { id: existingInstallment.id },
                data: { amount: baseFee }
              });
            }
          } else {
            // If month is NOT active, we could delete PENDING installments, 
            // but that's risky if students already have records. 
            // For now, we only add missing ones.
          }
        }
      }
    });

    revalidatePath(`/school/${tenantId}/transport`);
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: 'Failed to update route and sync fee structures' };
  }
}

export async function deleteTransportRoute(tenantIdOrDomain: string, routeId: string) {
  const tenant = await prisma.tenant.findUnique({ where: { domain: tenantIdOrDomain } }) ||
                 await prisma.tenant.findUnique({ where: { id: tenantIdOrDomain } });
  if (!tenant) return { error: 'Tenant not found' };
  const tenantId = tenant.id;

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
