import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const list = [
    ["ベンチプレス", "CHEST"],
    ["インクラインダンベルプレス", "CHEST"],
    ["ラットプルダウン", "BACK"],
    ["スクワット", "LEGS"],
    ["レッグプレス", "LEGS"],
    ["ショルダープレス", "SHOULDERS"],
    ["バイセップカール", "ARMS"],
    ["トライセップスプレスダウン", "ARMS"],
    ["カーフレイズ", "CALVES"],
    ["クランチ", "ABS"],
  ];

  for (const [name, bodyPart] of list) {
    await prisma.exercise.upsert({
      where: {
        name,
      } as any,
      update: {},
      create: {
        name,
        bodyParts: [
          bodyPart as
            | "CHEST"
            | "BACK"
            | "LEGS"
            | "ABS"
            | "ARMS"
            | "SHOULDERS"
            | "FOREARMS"
            | "CALVES"
            | "OTHER",
        ],
        createdBy: null,
      } as any,
    });
  }

  console.log("初期種目データの投入が完了しました");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
