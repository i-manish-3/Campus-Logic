const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const students = await prisma.studentProfile.findMany({
    include: {
      parentProfile: {
        include: {
          students: true
        }
      }
    }
  });

  console.log('Total Students:', students.length);
  students.forEach(s => {
    console.log(`Student: ${s.admissionNumber}, ParentID: ${s.parentProfileId}, Siblings Count: ${s.parentProfile?.students.length - 1 || 0}`);
  });
}

main();
