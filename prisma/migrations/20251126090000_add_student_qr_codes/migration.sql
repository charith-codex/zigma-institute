-- Add QR code storage for students and registrations
ALTER TABLE "Student"
ADD COLUMN "qrCodeUrl" TEXT;

ALTER TABLE "StudentRegistration"
ADD COLUMN "qrCodeUrl" TEXT;
