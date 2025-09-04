-- Database Backup Created: 2025-09-04T00:30:33.561Z
-- Schema Backup

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@map("accounts")
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("sessions")
}

model User {
  id                String            @id @default(cuid())
  name              String?
  email             String            @unique
  emailVerified     DateTime?
  image             String?
  ufEmail           String?
  ufEmailVerified   Boolean           @default(false)
  profileCompleted  Boolean           @default(false)
  phoneNumber       String?
  dailyListingCount Int               @default(0)
  lastListingDate   DateTime?
  otpCode           String?
  otpExpiry         DateTime?
  otpAttempts       Int               @default(0)
  verifyToken       String?
  verifyTokenExpiry DateTime?
  trustScore        Int               @default(0)
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt
  termsAccepted     Boolean           @default(false)
  termsAcceptedAt   DateTime?
  privacyAccepted   Boolean           @default(false)
  privacyAcceptedAt DateTime?
  accounts          Account[]
  contactEvents     ContactEvent[]
  draftSessions     DraftSession[]
  favorites         Favorite[]
  giveawayEntries   GiveawayEntry[]
  leaderboardWeeks  LeaderboardWeek[]
  listings          Listing[]
  referralCode      ReferralCode?
  referralsReceived Referral?         @relation("ReferralReferee")
  referralsGiven    Referral[]        @relation("ReferralReferrer")
  rewards           Reward[]
  sessions          Session[]

  @@map("users")
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
  @@map("verificationtokens")
}

model Listing {
  id          String         @id @default(cuid())
  title       String
  description String?
  price       Float
  category    String?
  condition   String?
  meetingSpot String?
  status      ListingStatus  @default(DRAFT)
  expiresAt   DateTime
  createdAt   DateTime       @default(now())
  updatedAt   DateTime       @updatedAt
  userId      String
  views       Int            @default(0)
  soldAt      DateTime?
  contacts    ContactEvent[]
  favorites   Favorite[]
  images      Image[]
  user        User           @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("listings")
}

model Image {
  id        String   @id @default(cuid())
  url       String
  filename  String?
  createdAt DateTime @default(now())
  listingId String
  listing   Listing  @relation(fields: [listingId], references: [id], onDelete: Cascade)

  @@map("images")
}

model VerificationAttempt {
  id        String   @id @default(cuid())
  email     String
  ipAddress String
  success   Boolean  @default(false)
  createdAt DateTime @default(now())

  @@map("verification_attempts")
}

model OTP {
  id        String   @id @default(uuid())
  email     String
  code      String
  expiresAt DateTime @map("expires_at")
  attempts  Int?     @default(0)
  createdAt DateTime @default(now()) @map("created_at")

  @@map("otp_codes")
}

model Giveaway {
  id          String          @id @default(cuid())
  title       String
  description String?
  prize       String
  startDate   DateTime
  endDate     DateTime
  isActive    Boolean         @default(true)
  createdAt   DateTime        @default(now())
  updatedAt   DateTime        @updatedAt
  entries     GiveawayEntry[]

  @@map("giveaways")
}

model GiveawayEntry {
  id                String    @id @default(cuid())
  userId            String
  giveawayId        String
  instagramFollowed Boolean   @default(false)
  ufEmailVerified   Boolean   @default(false)
  hasPostedListing  Boolean   @default(false)
  isEligible        Boolean   @default(false)
  instagramUsername String?
  verifiedAt        DateTime?
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  giveaway          Giveaway  @relation(fields: [giveawayId], references: [id], onDelete: Cascade)
  user              User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, giveawayId])
  @@map("giveaway_entries")
}

model Favorite {
  id        String   @id @default(cuid())
  userId    String
  listingId String
  createdAt DateTime @default(now())
  listing   Listing  @relation(fields: [listingId], references: [id], onDelete: Cascade)
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, listingId])
  @@map("favorites")
}

model ContactEvent {
  id          String      @id @default(cuid())
  listingId   String
  contacterId String
  contactType ContactType
  message     String?
  createdAt   DateTime    @default(now())
  contacter   User        @relation(fields: [contacterId], references: [id], onDelete: Cascade)
  listing     Listing     @relation(fields: [listingId], references: [id], onDelete: Cascade)

  @@map("contact_events")
}

model ReferralCode {
  userId          String          @id @map("user_id")
  code            String          @unique
  createdAt       DateTime?       @default(now()) @map("created_at") @db.Timestamptz(6)
  referral_clicks ReferralClick[]
  user            User            @relation(fields: [userId], references: [id], onDelete: Cascade, onUpdate: NoAction)
  referrals       Referral[]

  @@map("referral_codes")
}

model ReferralClick {
  id             String       @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  code           String
  ipHash         String       @map("ip_hash")
  uaHash         String       @map("ua_hash")
  ts             DateTime?    @default(now()) @db.Timestamptz(6)
  referral_codes ReferralCode @relation(fields: [code], references: [code], onDelete: Cascade, onUpdate: NoAction)

  @@index([code], map: "idx_referral_clicks_code")
  @@index([ts], map: "idx_referral_clicks_ts")
  @@map("referral_clicks")
}

model Referral {
  id             String       @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  code           String
  referrerUserId String       @map("referrer_user_id")
  refereeUserId  String       @unique @map("referee_user_id")
  status         String?      @default("clicked")
  reason         String?
  ts             DateTime?    @default(now()) @db.Timestamptz(6)
  referral_codes ReferralCode @relation(fields: [code], references: [code], onDelete: Cascade, onUpdate: NoAction)
  referee        User         @relation("ReferralReferee", fields: [refereeUserId], references: [id], onDelete: Cascade, onUpdate: NoAction)
  referrer       User         @relation("ReferralReferrer", fields: [referrerUserId], references: [id], onDelete: Cascade, onUpdate: NoAction)

  @@index([refereeUserId], map: "idx_referrals_referee")
  @@index([referrerUserId], map: "idx_referrals_referrer")
  @@index([status], map: "idx_referrals_status")
  @@map("referrals")
}

model Reward {
  id          String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  userId      String    @map("user_id")
  type        String
  amountCents Int       @map("amount_cents")
  tier        Int
  source      String?   @default("referral")
  status      String?   @default("pending")
  ts          DateTime? @default(now()) @db.Timestamptz(6)
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade, onUpdate: NoAction)

  @@index([userId, status], map: "idx_rewards_user_status")
  @@map("rewards")
}

model LeaderboardWeek {
  weekId    String    @map("week_id")
  userId    String    @map("user_id")
  points    Int       @default(0)
  rank      Int
  updatedAt DateTime? @default(now()) @updatedAt @map("updated_at") @db.Timestamptz(6)
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade, onUpdate: NoAction)

  @@id([weekId, userId])
  @@index([weekId, points(sort: Desc)], map: "idx_leaderboard_week_points")
  @@map("leaderboard_week")
}

enum ListingStatus {
  DRAFT
  PENDING_INFO
  READY
  PUBLISHED
  EXPIRED
  BLOCKED
  SHADOW_BANNED
  SOLD
}

enum ContactType {
  EMAIL
  SMS
  PHONE
  VIEW_CONTACT
}

model DraftSession {
  id                   Int      @id @default(autoincrement())
  sessionId            String   @unique @map("session_id")
  userId               String   @map("user_id")
  draftData            String   @map("draft_data") // JSON string
  currentStep          Int      @default(0) @map("current_step")
  completionPercentage Int      @default(0) @map("completion_percentage")
  isActive             Boolean  @default(true) @map("is_active")
  lastSaved            DateTime @default(now()) @map("last_saved")
  createdAt            DateTime @default(now()) @map("created_at")
  deletedAt            DateTime? @map("deleted_at")

  // Relations
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([sessionId])
  @@index([isActive, lastSaved])
  @@index([userId, isActive, lastSaved])
  @@map("draft_sessions")
}
