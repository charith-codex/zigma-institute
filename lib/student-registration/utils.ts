import { randomInt } from "node:crypto";
import { Buffer } from "node:buffer";

import PDFDocument from "pdfkit";
import QRCode from "qrcode";
import type { Prisma } from "@prisma/client";

export type PendingProfileImageSource = {
  base64?: string | null;
  url?: string | null;
  mimeType?: string | null;
};

const PASSWORD_ALPHABET =
  "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";

const CARD_WIDTH = 360;
const CARD_HEIGHT = 220;
const CARD_PADDING = 24;
const PHOTO_FRAME_WIDTH = 126;
const PHOTO_FRAME_HEIGHT = 156;
const PHOTO_WIDTH = 110;
const PHOTO_HEIGHT = 140;
const QR_SIZE = 96;

function ensureJpeg(buffer: Buffer, mimeType?: string | null) {
  if (mimeType && !/image\/(jpeg|jpg)/i.test(mimeType)) {
    throw new Error("Only JPEG photos are supported for card generation");
  }

  if (buffer.length < 4 || buffer[0] !== 0xff || buffer[1] !== 0xd8) {
    throw new Error("Student profile photo must be a JPEG image");
  }
}

export function generateRandomPassword(length = 12) {
  const characters = PASSWORD_ALPHABET;
  const charsLength = characters.length;
  let password = "";

  for (let index = 0; index < length; index += 1) {
    password += characters[randomInt(charsLength)];
  }

  return password;
}

export async function generateStudentPublicId(
  prisma: Prisma.TransactionClient,
  now = new Date()
) {
  const year = now.getFullYear();
  const prefix = `STU-${year}`;

  const latest = await prisma.student.findFirst({
    where: {
      studentPublicId: {
        startsWith: prefix,
      },
    },
    orderBy: {
      studentPublicId: "desc",
    },
    select: {
      studentPublicId: true,
    },
  });

  const lastNumber = latest?.studentPublicId
    ? Number.parseInt(latest.studentPublicId.slice(prefix.length), 10)
    : 0;

  const nextNumber = Number.isFinite(lastNumber) ? lastNumber + 1 : 1;
  return `${prefix}${nextNumber.toString().padStart(5, "0")}`;
}

export async function resolveProfileImageBuffer(
  source: PendingProfileImageSource
) {
  if (source.base64) {
    const matches = source.base64.match(/^data:([^;]+);base64,(.+)$/);
    const mimeType = matches?.[1] ?? source.mimeType ?? "image/jpeg";
    const data = matches?.[2] ?? source.base64;
    const buffer = Buffer.from(data, "base64");
    ensureJpeg(buffer, mimeType);
    return { buffer, mimeType: "image/jpeg" };
  }

  if (source.url) {
    const response = await fetch(source.url);

    if (!response.ok) {
      throw new Error("Unable to download profile photo from storage");
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const mimeType = response.headers.get("content-type") ?? source.mimeType;
    ensureJpeg(buffer, mimeType);
    return { buffer, mimeType: "image/jpeg" };
  }

  throw new Error("A profile photo is required to generate the ID card");
}

type CardContentOptions = {
  studentName: string;
  studentId: string;
  studentEmail: string;
  studentPhone: string;
  instituteName: string;
  studentPhoto: Buffer;
  profileImageMimeType?: string | null;
};

async function createQrBuffer(instituteName: string, studentId: string) {
  const data = `${instituteName}:${studentId}`;
  const qrBuffer = await QRCode.toBuffer(data, {
    type: "png",
    errorCorrectionLevel: "H",
    margin: 1,
    color: {
      dark: "#1a2340",
      light: "#ffffff",
    },
  });

  return qrBuffer;
}

function drawCard(
  doc: PDFDocument,
  options: CardContentOptions & { qrBuffer: Buffer }
) {
  const {
    studentName,
    studentId,
    studentEmail,
    studentPhone,
    instituteName,
    studentPhoto,
    qrBuffer,
  } = options;

  doc.save();
  doc.rect(0, 0, CARD_WIDTH, CARD_HEIGHT).fill("#f5f7fb");
  doc.restore();

  doc.save();
  doc.rect(0, CARD_HEIGHT - 72, CARD_WIDTH, 72).fill("#101b38");
  doc.restore();

  doc
    .fillColor("#ffffff")
    .font("Helvetica-Bold")
    .fontSize(20)
    .text(instituteName, CARD_PADDING, CARD_HEIGHT - 56, {
      width: CARD_WIDTH - CARD_PADDING * 2,
    });

  doc.save();
  doc
    .roundedRect(
      CARD_PADDING,
      CARD_PADDING,
      PHOTO_FRAME_WIDTH,
      PHOTO_FRAME_HEIGHT,
      16
    )
    .fill("#ffffff");
  doc.restore();

  doc.image(studentPhoto, CARD_PADDING + 8, CARD_PADDING + 8, {
    fit: [PHOTO_WIDTH, PHOTO_HEIGHT],
    align: "center",
    valign: "center",
  });

  const contentX = CARD_PADDING + PHOTO_FRAME_WIDTH + 20;
  const contentWidth = CARD_WIDTH - contentX - CARD_PADDING;

  doc
    .fillColor("#1a2340")
    .font("Helvetica-Bold")
    .fontSize(18)
    .text(studentName, contentX, CARD_PADDING + 12, {
      width: contentWidth,
    });

  doc
    .fillColor("#39405c")
    .font("Helvetica")
    .fontSize(12)
    .text(`Student ID: ${studentId}`, contentX, CARD_PADDING + 52);

  doc
    .fontSize(11)
    .text(studentEmail, contentX, CARD_PADDING + 74, {
      width: contentWidth,
    });

  doc.text(studentPhone, contentX, CARD_PADDING + 94, {
    width: contentWidth,
  });

  doc
    .moveTo(contentX, CARD_HEIGHT - 110)
    .lineTo(CARD_WIDTH - CARD_PADDING, CARD_HEIGHT - 110)
    .stroke("#d7deed");

  doc
    .font("Helvetica")
    .fontSize(10)
    .fillColor("#4e5675")
    .text(
      "This card grants access to the Zigma Institute LMS and on-site facilities.",
      contentX,
      CARD_HEIGHT - 102,
      {
        width: contentWidth,
      }
    );

  doc
    .fontSize(9)
    .fillColor("#7681a7")
    .text("Please present upon request. If found, return to Zigma Institute.", contentX, CARD_HEIGHT - 84, {
      width: contentWidth,
    });

  const qrX = CARD_WIDTH - CARD_PADDING - QR_SIZE;
  const qrY = CARD_PADDING;

  doc.save();
  doc
    .roundedRect(qrX - 6, qrY - 6, QR_SIZE + 12, QR_SIZE + 12, 10)
    .fill("#ffffff");
  doc.restore();

  doc.image(qrBuffer, qrX, qrY, { fit: [QR_SIZE, QR_SIZE] });

  doc
    .font("Helvetica")
    .fontSize(9)
    .fillColor("#526091")
    .text("Scan for institute verification", qrX - 30, qrY + QR_SIZE + 12, {
      width: QR_SIZE + 60,
      align: "center",
    });
}

async function renderCards(cards: CardContentOptions[]) {
  const doc = new PDFDocument({
    size: [CARD_WIDTH, CARD_HEIGHT],
    margin: 0,
    bufferPages: false,
    autoFirstPage: false,
  });

  const chunks: Buffer[] = [];
  const resultPromise = new Promise<Buffer>((resolve, reject) => {
    doc.on("data", (chunk) => chunks.push(chunk as Buffer));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", (error) => reject(error));
  });

  const cardsWithQr = await Promise.all(
    cards.map(async (card) => ({
      ...card,
      qrBuffer: await createQrBuffer(card.instituteName, card.studentId),
    }))
  );

  cardsWithQr.forEach((card) => {
    doc.addPage({ size: [CARD_WIDTH, CARD_HEIGHT], margin: 0 });
    drawCard(doc, card);
  });

  doc.end();
  return resultPromise;
}

export async function createStudentIdCardPdf(options: CardContentOptions) {
  ensureJpeg(options.studentPhoto, options.profileImageMimeType ?? "image/jpeg");
  return renderCards([options]);
}

export async function createBulkStudentIdCardsPdf(cards: CardContentOptions[]) {
  if (cards.length === 0) {
    throw new Error("No card data provided");
  }

  cards.forEach((card) =>
    ensureJpeg(card.studentPhoto, card.profileImageMimeType ?? "image/jpeg")
  );

  return renderCards(cards);
}
