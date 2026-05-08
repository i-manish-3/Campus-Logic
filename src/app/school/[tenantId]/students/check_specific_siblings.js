const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const students = await prisma.studentProfile.findMany({
    where: {
      admissionNumber: { in: ['221', '726'] }
    },
    include: {
      user: true,
      parentProfile: {
        include: {
          user: true,
          students: {
            include: {
              user: true,
              enrollments: { include: { class: true } }
            }
          }
        }
      }
    }
  });

  students.forEach(s => {
    console.log(`Student Admission No: ${s.admissionNumber}`);
    console.log(`Name: ${s.user.firstName} ${s.user.lastName}`);
    console.log(`Parent Name: ${s.parentProfile?.user.firstName} ${s.parentProfile?.user.lastName}`);
    console.log(`Siblings Found: ${s.parentProfile?.students.map(sib => sib.user.firstName).join(', ')}`);
    console.log('---');
  });
}

main();
