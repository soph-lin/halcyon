import { prisma } from "@/lib/db/prisma";

const SITE_SETTINGS_ID = "site";

export type SiteSettings = {
  profileImageUrl: string | null;
};

export async function getSiteSettings(): Promise<SiteSettings> {
  const settings = await prisma.siteSettings.findUnique({
    where: { id: SITE_SETTINGS_ID },
    select: { profileImageUrl: true },
  });

  return {
    profileImageUrl: settings?.profileImageUrl ?? null,
  };
}

export async function setProfileImageUrl(profileImageUrl: string): Promise<void> {
  await prisma.siteSettings.upsert({
    where: { id: SITE_SETTINGS_ID },
    create: {
      id: SITE_SETTINGS_ID,
      profileImageUrl,
    },
    update: {
      profileImageUrl,
    },
  });
}
