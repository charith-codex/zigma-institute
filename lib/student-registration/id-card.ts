import { Buffer } from "node:buffer";

import { createQrMatrix } from "./qr";

export interface StudentIdCardData {
  studentName: string;
  studentPublicId: string;
  studentEmail: string;
  guardianName: string;
  courses: string[];
  instituteName: string;
  instituteTagline: string;
  instituteAddress: string;
  studentPhotoUrl: string;
}

export interface StudentIdCardAssets {
  photoBuffer: Buffer;
  photoWidth: number;
  photoHeight: number;
  qrMatrix: boolean[][];
  qrPayload: string;
}

const CARD_WIDTH = 960;
const CARD_HEIGHT = 560;
const PHOTO_WIDTH = 260;
const PHOTO_HEIGHT = 320;
const QR_SIZE = 200;
const QR_MARGIN = 12;

function assertJpeg(buffer: Buffer): void {
  if (buffer.length < 4 || buffer[0] !== 0xff || buffer[1] !== 0xd8) {
    throw new Error("Student photo must be a JPEG image");
  }
}

function getJpegDimensions(buffer: Buffer): { width: number; height: number } {
  assertJpeg(buffer);
  let offset = 2;

  while (offset < buffer.length) {
    if (buffer[offset] !== 0xff) {
      throw new Error("Invalid JPEG structure");
    }

    const marker = buffer[offset + 1];
    if (marker === undefined) {
      break;
    }

    if (marker === 0xc0 || marker === 0xc2) {
      const height = buffer.readUInt16BE(offset + 5);
      const width = buffer.readUInt16BE(offset + 7);
      return { width, height };
    }

    const length = buffer.readUInt16BE(offset + 2);
    if (!Number.isFinite(length) || length <= 0) {
      break;
    }

    offset += 2 + length;
  }

  throw new Error("Unable to determine JPEG dimensions");
}

async function fetchImageBuffer(url: string): Promise<Buffer> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Unable to load student photo (${response.status})`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

function escapeXml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function escapePdfString(input: string): string {
  return input.replace(/([\\()])/g, "\\$1");
}

function formatColor(color: string): { r: number; g: number; b: number } {
  const hex = color.replace("#", "");
  const r = Number.parseInt(hex.slice(0, 2), 16) / 255;
  const g = Number.parseInt(hex.slice(2, 4), 16) / 255;
  const b = Number.parseInt(hex.slice(4, 6), 16) / 255;
  return { r, g, b };
}

function formatNumber(value: number): string {
  return Number.parseFloat(value.toFixed(3)).toString();
}

function buildQrSvg(matrix: boolean[][]): string {
  const dimension = matrix.length;
  const scale = (QR_SIZE - QR_MARGIN * 2) / dimension;
  const pieces: string[] = [];

  for (let row = 0; row < dimension; row += 1) {
    for (let col = 0; col < dimension; col += 1) {
      if (!matrix[row]?.[col]) continue;
      const x = QR_MARGIN + col * scale;
      const y = QR_MARGIN + row * scale;
      pieces.push(
        `<rect x="${formatNumber(x)}" y="${formatNumber(
          y
        )}" width="${formatNumber(scale)}" height="${formatNumber(scale)}" rx="1" ry="1" />`
      );
    }
  }

  return pieces.join("");
}

function buildQrPdfPath(
  matrix: boolean[][],
  originX: number,
  originY: number
): string {
  const dimension = matrix.length;
  const scale = (QR_SIZE - QR_MARGIN * 2) / dimension;
  const segments: string[] = [];

  for (let row = 0; row < dimension; row += 1) {
    for (let col = 0; col < dimension; col += 1) {
      if (!matrix[row]?.[col]) continue;
      const x = originX + QR_MARGIN + col * scale;
      const y = originY + QR_MARGIN + (dimension - row - 1) * scale;
      segments.push(
        `${formatNumber(x)} ${formatNumber(y)} ${formatNumber(
          scale
        )} ${formatNumber(scale)} re`
      );
    }
  }

  if (segments.length === 0) {
    return "";
  }

  return `${segments.join("\n")}\nf`;
}

function chunkCourses(courses: string[]): string[] {
  if (courses.length === 0) {
    return ["Assigned via LMS after approval"];
  }

  const lines: string[] = [];
  let current = "";

  for (const course of courses) {
    const next = current.length === 0 ? course : `${current}, ${course}`;
    if (next.length > 48 && current.length > 0) {
      lines.push(current);
      current = course;
    } else {
      current = next;
    }
  }

  if (current.length > 0) {
    lines.push(current);
  }

  return lines.slice(0, 3);
}

export async function prepareStudentIdCardAssets(
  data: StudentIdCardData
): Promise<StudentIdCardAssets> {
  const photoBuffer = await fetchImageBuffer(data.studentPhotoUrl);
  const { width, height } = getJpegDimensions(photoBuffer);
  const qrPayload = JSON.stringify({
    id: data.studentPublicId,
    name: data.studentName,
    email: data.studentEmail,
  });
  const qrMatrix = createQrMatrix(qrPayload);

  return {
    photoBuffer,
    photoWidth: width,
    photoHeight: height,
    qrMatrix,
    qrPayload,
  };
}

export function renderStudentIdCardSvg(
  data: StudentIdCardData,
  assets: StudentIdCardAssets
): string {
  const photoBase64 = assets.photoBuffer.toString("base64");
  const courses = chunkCourses(data.courses);

  const qrSvg = buildQrSvg(assets.qrMatrix);

  const courseText = courses
    .map(
      (course, index) =>
        `<tspan x="360" dy="${index === 0 ? 0 : 28}">${escapeXml(course)}</tspan>`
    )
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${CARD_WIDTH}" height="${CARD_HEIGHT}" viewBox="0 0 ${CARD_WIDTH} ${CARD_HEIGHT}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <clipPath id="photoMask">
      <rect x="48" y="144" width="${PHOTO_WIDTH}" height="${PHOTO_HEIGHT}" rx="24" />
    </clipPath>
    <style>
      .title { font-family: 'Helvetica', 'Arial', sans-serif; font-size: 42px; font-weight: 700; }
      .subtitle { font-family: 'Helvetica', 'Arial', sans-serif; font-size: 20px; font-weight: 500; }
      .label { font-family: 'Helvetica', 'Arial', sans-serif; font-size: 18px; font-weight: 600; }
      .value { font-family: 'Helvetica', 'Arial', sans-serif; font-size: 18px; font-weight: 400; }
    </style>
  </defs>
  <rect width="${CARD_WIDTH}" height="${CARD_HEIGHT}" rx="36" fill="#0F172A" />
  <rect x="24" y="24" width="${CARD_WIDTH - 48}" height="${CARD_HEIGHT - 48}" rx="28" fill="#111827" />
  <rect x="24" y="24" width="${CARD_WIDTH - 48}" height="160" rx="28" fill="#1E293B" />
  <text x="48" y="110" class="title" fill="#FFFFFF">${escapeXml(
    data.instituteName
  )}</text>
  <text x="48" y="140" class="subtitle" fill="#9CA3AF">${escapeXml(
    data.instituteTagline
  )}</text>
  <image href="data:image/jpeg;base64,${photoBase64}" width="${PHOTO_WIDTH}" height="${PHOTO_HEIGHT}" x="48" y="144" clip-path="url(#photoMask)" preserveAspectRatio="xMidYMid slice" />
  <rect x="48" y="144" width="${PHOTO_WIDTH}" height="${PHOTO_HEIGHT}" rx="24" stroke="#2563EB" stroke-width="3" fill="transparent" />
  <text x="360" y="220" class="subtitle" fill="#9CA3AF">Student Name</text>
  <text x="360" y="262" class="title" fill="#FFFFFF">${escapeXml(
    data.studentName
  )}</text>
  <text x="360" y="312" class="subtitle" fill="#9CA3AF">Student ID</text>
  <text x="360" y="348" class="value" fill="#FFFFFF">${escapeXml(
    data.studentPublicId
  )}</text>
  <text x="360" y="390" class="subtitle" fill="#9CA3AF">Email</text>
  <text x="360" y="426" class="value" fill="#FFFFFF">${escapeXml(
    data.studentEmail
  )}</text>
  <text x="360" y="466" class="subtitle" fill="#9CA3AF">Courses</text>
  <text x="360" y="504" class="value" fill="#FFFFFF">${courseText}</text>
  <text x="48" y="504" class="subtitle" fill="#9CA3AF">Guardian</text>
  <text x="48" y="540" class="value" fill="#FFFFFF">${escapeXml(
    data.guardianName
  )}</text>
  <text x="620" y="110" class="subtitle" fill="#9CA3AF" text-anchor="end">${escapeXml(
    data.instituteAddress
  )}</text>
  <g transform="translate(${CARD_WIDTH - QR_SIZE - 48}, ${CARD_HEIGHT - QR_SIZE - 48})">
    <rect width="${QR_SIZE}" height="${QR_SIZE}" rx="20" fill="#1E293B" />
    <g fill="#FFFFFF">${qrSvg}</g>
  </g>
</svg>`;
}

interface PdfObject {
  id: number;
  content: Buffer;
}

function createPdfBuilder() {
  const objects: PdfObject[] = [];

  function addObject(content: string | Buffer = ""): number {
    const id = objects.length + 1;
    const buffer = Buffer.isBuffer(content)
      ? content
      : Buffer.from(content, "utf8");
    objects.push({ id, content: buffer });
    return id;
  }

  function updateObject(id: number, content: string | Buffer): void {
    const index = objects.findIndex((object) => object.id === id);
    if (index === -1) {
      throw new Error(`PDF object ${id} not found`);
    }
    objects[index]!.content = Buffer.isBuffer(content)
      ? content
      : Buffer.from(content, "utf8");
  }

  function toBuffer(rootId: number): Buffer {
    const header = Buffer.from("%PDF-1.4\n");
    const body: Buffer[] = [];
    let offset = header.length;
    const offsets: number[] = [0];

    for (const object of objects) {
      const prefix = Buffer.from(`${object.id} 0 obj\n`);
      const suffix = Buffer.from("\nendobj\n");
      const composed = Buffer.concat([prefix, object.content, suffix]);
      body.push(composed);
      offsets.push(offset);
      offset += composed.length;
    }

    const xrefPosition = offset;
    let xref = `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
    for (let i = 1; i < offsets.length; i += 1) {
      xref += `${offsets[i]!.toString().padStart(10, "0")} 00000 n \n`;
    }

    const trailer = `trailer\n<< /Size ${
      objects.length + 1
    } /Root ${rootId} 0 R >>\nstartxref\n${xrefPosition}\n%%EOF`;

    return Buffer.concat([
      header,
      ...body,
      Buffer.from(xref, "utf8"),
      Buffer.from(trailer, "utf8"),
    ]);
  }

  return { addObject, updateObject, toBuffer };
}

interface PdfCardContext {
  data: StudentIdCardData;
  assets: StudentIdCardAssets;
}

export function renderStudentIdCardsPdf(cards: PdfCardContext[]): Uint8Array {
  if (cards.length === 0) {
    throw new Error("No cards supplied for PDF rendering");
  }

  const builder = createPdfBuilder();
  const catalogId = builder.addObject();
  const pagesId = builder.addObject();
  const fontRegularId = builder.addObject(
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>"
  );
  const fontBoldId = builder.addObject(
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>"
  );

  const pageIds: number[] = [];

  cards.forEach((card, index) => {
    const imageName = `Im${index + 1}`;
    const imageObjectId = builder.addObject(
      Buffer.concat([
        Buffer.from(
          `<< /Type /XObject /Subtype /Image /Width ${card.assets.photoWidth} /Height ${card.assets.photoHeight} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${card.assets.photoBuffer.length} >>\nstream\n`
        ),
        card.assets.photoBuffer,
        Buffer.from("\nendstream"),
      ])
    );

    const contentCommands: string[] = [];

    // Background layers
    const background = formatColor("#0F172A");
    contentCommands.push(
      `${formatNumber(background.r)} ${formatNumber(background.g)} ${formatNumber(
        background.b
      )} rg`
    );
    contentCommands.push(`0 0 ${CARD_WIDTH} ${CARD_HEIGHT} re`);
    contentCommands.push("f");

    const innerBackground = formatColor("#111827");
    contentCommands.push(
      `${formatNumber(innerBackground.r)} ${formatNumber(
        innerBackground.g
      )} ${formatNumber(innerBackground.b)} rg`
    );
    contentCommands.push(
      `24 24 ${CARD_WIDTH - 48} ${CARD_HEIGHT - 48} re\nf`
    );

    const bannerColor = formatColor("#1E293B");
    contentCommands.push(
      `${formatNumber(bannerColor.r)} ${formatNumber(
        bannerColor.g
      )} ${formatNumber(bannerColor.b)} rg`
    );
    contentCommands.push(
      `24 ${CARD_HEIGHT - 184} ${CARD_WIDTH - 48} 160 re\nf`
    );

    // Student photo
    contentCommands.push("q");
    contentCommands.push("1 0 0 1 0 0 cm");
    const photoX = 48;
    const photoY = 144;
    contentCommands.push(
      `${PHOTO_WIDTH} 0 0 ${PHOTO_HEIGHT} ${photoX} ${photoY} cm`
    );
    contentCommands.push(`/${imageName} Do`);
    contentCommands.push("Q");

    const borderColor = formatColor("#2563EB");
    contentCommands.push(
      `${formatNumber(borderColor.r)} ${formatNumber(borderColor.g)} ${formatNumber(
        borderColor.b
      )} RG`
    );
    contentCommands.push(
      `3 w ${photoX} ${photoY} ${PHOTO_WIDTH} ${PHOTO_HEIGHT} re S`
    );

    const white = "1 1 1";
    const muted = formatColor("#9CA3AF");

    function drawText(
      text: string,
      x: number,
      y: number,
      size: number,
      bold = false,
      color: { r: number; g: number; b: number } | null = null
    ) {
      const rgb = color ?? null;
      contentCommands.push("BT");
      contentCommands.push(
        `/${bold ? "F2" : "F1"} ${formatNumber(size)} Tf`
      );
      if (rgb) {
        contentCommands.push(
          `${formatNumber(rgb.r)} ${formatNumber(rgb.g)} ${formatNumber(rgb.b)} rg`
        );
      } else {
        contentCommands.push(`${white} rg`);
      }
      contentCommands.push(`${formatNumber(x)} ${formatNumber(y)} Td`);
      contentCommands.push(`(${escapePdfString(text)}) Tj`);
      contentCommands.push("ET");
    }

    const topLabelY = CARD_HEIGHT - 92;
    drawText(card.data.instituteName, 48, topLabelY, 32, true);
    drawText(
      card.data.instituteTagline,
      48,
      topLabelY - 28,
      18,
      false,
      muted
    );

    drawText("Student Name", 360, CARD_HEIGHT - 208, 18, false, muted);
    drawText(card.data.studentName, 360, CARD_HEIGHT - 236, 26, true);

    drawText("Student ID", 360, CARD_HEIGHT - 276, 18, false, muted);
    drawText(card.data.studentPublicId, 360, CARD_HEIGHT - 304, 20);

    drawText("Email", 360, CARD_HEIGHT - 344, 18, false, muted);
    drawText(card.data.studentEmail, 360, CARD_HEIGHT - 372, 18);

    drawText("Courses", 360, CARD_HEIGHT - 412, 18, false, muted);
    const courseLines = chunkCourses(card.data.courses);
    courseLines.forEach((line, lineIndex) => {
      drawText(line, 360, CARD_HEIGHT - 440 - lineIndex * 22, 18);
    });

    drawText("Guardian", 48, CARD_HEIGHT - 412, 18, false, muted);
    drawText(card.data.guardianName, 48, CARD_HEIGHT - 440, 18);

    drawText(
      card.data.instituteAddress,
      CARD_WIDTH - 48,
      CARD_HEIGHT - 208,
      14,
      false,
      muted
    );

    const qrPath = buildQrPdfPath(
      card.assets.qrMatrix,
      CARD_WIDTH - QR_SIZE - 48,
      48
    );
    if (qrPath.length > 0) {
      const qrColor = formatColor("#1E293B");
      contentCommands.push(
        `${formatNumber(qrColor.r)} ${formatNumber(qrColor.g)} ${formatNumber(
          qrColor.b
        )} rg`
      );
      contentCommands.push(
        `${CARD_WIDTH - QR_SIZE - 48} 48 ${QR_SIZE} ${QR_SIZE} re\nf`
      );
      contentCommands.push(`${white} rg`);
      contentCommands.push(qrPath);
    }

    const contentString = contentCommands.join("\n");
    const contentObjectId = builder.addObject(
      `<< /Length ${Buffer.byteLength(contentString)} >>\nstream\n${contentString}\nendstream`
    );

    const pageId = builder.addObject(
      `<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${CARD_WIDTH} ${CARD_HEIGHT}] /Resources << /Font << /F1 ${fontRegularId} 0 R /F2 ${fontBoldId} 0 R >> /XObject << /${imageName} ${imageObjectId} 0 R >> >> /Contents ${contentObjectId} 0 R >>`
    );

    pageIds.push(pageId);
  });

  builder.updateObject(
    pagesId,
    `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(
      " "
    )}] /Count ${pageIds.length} >>`
  );
  builder.updateObject(catalogId, `<< /Type /Catalog /Pages ${pagesId} 0 R >>`);

  const pdfBuffer = builder.toBuffer(catalogId);
  return new Uint8Array(pdfBuffer.buffer, pdfBuffer.byteOffset, pdfBuffer.byteLength);
}
