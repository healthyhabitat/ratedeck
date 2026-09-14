import { cookies } from "next/headers";
import { CreateApp } from "@/components/CreateApp";
import { UNLOCK_COOKIE, verifyUnlockToken } from "@/lib/unlock";

export const metadata = {
  title: "Create — RateDeck",
  description:
    "Generate your freelance rate card from skills, years, market, and engagement type.",
};

export default async function CreatePage() {
  const jar = await cookies();
  const unlocked = await verifyUnlockToken(jar.get(UNLOCK_COOKIE)?.value);

  return <CreateApp initialUnlocked={unlocked} />;
}
