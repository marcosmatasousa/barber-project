import prisma from "../../src/lib/prisma";
import { hash } from "../../src/lib/argon2";

async function main() {
  try {
    const hashedPassword = await hash("admin");
    if (hashedPassword) {
      await prisma.users.create({
        data: {
          name: "Marcos",
          username: "admin",
          password: hashedPassword,
          role: "admin",
        },
      });
      console.log("Admin criado");
    }
  } catch (error) {
    console.log(error);
  }
}

main();
