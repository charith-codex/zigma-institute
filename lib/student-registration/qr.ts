import { Buffer } from "node:buffer";

/*
 * Portions of this file are adapted from "QRCode for JavaScript" by Kazuhiko Arase
 * (https://github.com/kazuhikoarase/qrcode-generator) which is licensed under the
 * MIT License. The adapted implementation below keeps the minimal functionality
 * required to generate QR matrices for byte mode data within this project.
 */

const EXP_TABLE = new Array<number>(256);
const LOG_TABLE = new Array<number>(256);

for (let i = 0; i < 8; i += 1) {
  EXP_TABLE[i] = 1 << i;
}
for (let i = 8; i < 256; i += 1) {
  EXP_TABLE[i] =
    EXP_TABLE[i - 4]! ^
    EXP_TABLE[i - 5]! ^
    EXP_TABLE[i - 6]! ^
    EXP_TABLE[i - 8]!;
}
for (let i = 0; i < 255; i += 1) {
  LOG_TABLE[EXP_TABLE[i]!] = i;
}

function gexp(n: number): number {
  if (n < 0) {
    return EXP_TABLE[(n % 255) + 255]!;
  }
  return EXP_TABLE[n % 255]!;
}

function glog(n: number): number {
  if (n < 1) {
    throw new Error("glog(" + n + ")");
  }
  return LOG_TABLE[n]!;
}

class QRPolynomial {
  #num: number[];

  constructor(num: number[], shift: number) {
    if (num.length === 0) {
      throw new Error("num must contain data");
    }

    let offset = 0;
    while (offset < num.length && num[offset] === 0) {
      offset += 1;
    }

    this.#num = new Array(num.length - offset + shift);
    for (let i = 0; i < num.length - offset; i += 1) {
      this.#num[i] = num[i + offset]!;
    }
  }

  get length(): number {
    return this.#num.length;
  }

  at(index: number): number {
    return this.#num[index]!;
  }

  multiply(e: QRPolynomial): QRPolynomial {
    const num = new Array(this.length + e.length - 1).fill(0);

    for (let i = 0; i < this.length; i += 1) {
      for (let j = 0; j < e.length; j += 1) {
        num[i + j]! ^= gexp(glog(this.at(i)!) + glog(e.at(j)!));
      }
    }

    return new QRPolynomial(num, 0);
  }

  mod(e: QRPolynomial): QRPolynomial {
    if (this.length - e.length < 0) {
      return this;
    }

    const ratio = glog(this.at(0)!) - glog(e.at(0)!);
    const num = this.#num.slice();

    for (let i = 0; i < e.length; i += 1) {
      num[i]! ^= gexp(glog(e.at(i)!) + ratio);
    }

    return new QRPolynomial(num, 0).mod(e);
  }
}

function getErrorCorrectPolynomial(errorCorrectLength: number): QRPolynomial {
  let poly = new QRPolynomial([1], 0);

  for (let i = 0; i < errorCorrectLength; i += 1) {
    poly = poly.multiply(new QRPolynomial([1, gexp(i)], 0));
  }

  return poly;
}

function getMask(maskPattern: number, i: number, j: number): boolean {
  switch (maskPattern) {
    case 0:
      return (i + j) % 2 === 0;
    case 1:
      return i % 2 === 0;
    case 2:
      return j % 3 === 0;
    case 3:
      return (i + j) % 3 === 0;
    case 4:
      return (Math.floor(i / 2) + Math.floor(j / 3)) % 2 === 0;
    case 5:
      return ((i * j) % 2) + ((i * j) % 3) === 0;
    case 6:
      return (((i * j) % 2) + ((i * j) % 3)) % 2 === 0;
    case 7:
      return (((i + j) % 2) + ((i * j) % 3)) % 2 === 0;
    default:
      throw new Error("bad maskPattern:" + maskPattern);
  }
}

const PAD0 = 0xec;
const PAD1 = 0x11;

const RS_BLOCK_TABLE: Record<number, number[]> = {
  // Version 4, Level Q
  4: [6, 0, 0, 0, 0, 0, 0, 0],
  // Version 5, Level Q
  5: [8, 0, 0, 0, 0, 0, 0, 0],
  // Version 6, Level Q
  6: [10, 0, 0, 0, 0, 0, 0, 0],
};

function getRSBlocks(typeNumber: number) {
  const rsBlock = RS_BLOCK_TABLE[typeNumber];

  if (!rsBlock) {
    throw new Error(`bad rs block @ typeNumber: ${typeNumber}`);
  }

  const list: { totalCount: number; dataCount: number }[] = [];

  const totalCount = rsBlock[0]!;
  const dataCount = totalCount - 10; // Level Q (25%) for versions 4-6
  const rsBlocks = Math.floor((typeNumber + 7) / 2);

  for (let i = 0; i < rsBlocks; i += 1) {
    list.push({ totalCount, dataCount });
  }

  return list;
}

function createData(
  typeNumber: number,
  data: number[],
  errorCorrectionLength: number
): number[] {
  const rsBlocks = getRSBlocks(typeNumber);
  const buffer: number[] = [];

  let totalDataCount = 0;
  for (const block of rsBlocks) {
    totalDataCount += block.dataCount;
  }

  if (data.length > totalDataCount) {
    throw new Error(
      `code length overflow. data: ${data.length}, max: ${totalDataCount}`
    );
  }

  let offset = 0;

  while (offset < data.length) {
    buffer.push(data[offset]!);
    offset += 1;
  }

  if (buffer.length !== totalDataCount) {
    for (let i = 0; i < totalDataCount - data.length; i += 1) {
      buffer.push(i % 2 === 0 ? PAD0 : PAD1);
    }
  }

  const dcdata: number[][] = [];
  const ecdata: number[][] = [];

  let index = 0;

  for (const rsBlock of rsBlocks) {
    const dcCount = rsBlock.dataCount;
    const ecCount = rsBlock.totalCount - rsBlock.dataCount;

    const dc: number[] = new Array(dcCount);

    for (let i = 0; i < dc.length; i += 1) {
      dc[i] = buffer[i + index]!;
    }
    index += dc.length;
    dcdata.push(dc);

    const rsPoly = getErrorCorrectPolynomial(ecCount);
    const rawPoly = new QRPolynomial(dc, rsPoly.length - 1);
    const modPoly = rawPoly.mod(rsPoly);

    const ec: number[] = new Array(rsPoly.length - 1);
    for (let i = 0; i < ec.length; i += 1) {
      const modIndex = i + modPoly.length - ec.length;
      ec[i] = modIndex >= 0 ? modPoly.at(modIndex)! : 0;
    }
    ecdata.push(ec);
  }

  let totalCodeCount = 0;
  for (const rsBlock of rsBlocks) {
    totalCodeCount += rsBlock.totalCount;
  }

  const dataArray: number[] = new Array(totalCodeCount);
  let dataIndex = 0;

  for (let i = 0; i < rsBlocks[0]!.dataCount; i += 1) {
    for (let r = 0; r < rsBlocks.length; r += 1) {
      if (i < dcdata[r]!.length) {
        dataArray[dataIndex] = dcdata[r]![i]!;
        dataIndex += 1;
      }
    }
  }

  for (
    let i = 0;
    i < rsBlocks[0]!.totalCount - rsBlocks[0]!.dataCount;
    i += 1
  ) {
    for (let r = 0; r < rsBlocks.length; r += 1) {
      if (i < ecdata[r]!.length) {
        dataArray[dataIndex] = ecdata[r]![i]!;
        dataIndex += 1;
      }
    }
  }

  return dataArray;
}

function setupPositionProbePattern(
  modules: (boolean | null)[][],
  row: number,
  col: number
) {
  for (let r = -1; r <= 7; r += 1) {
    if (row + r <= -1 || modules.length <= row + r) continue;

    for (let c = -1; c <= 7; c += 1) {
      if (col + c <= -1 || modules.length <= col + c) continue;

      if (
        (0 <= r && r <= 6 && (c === 0 || c === 6)) ||
        (0 <= c && c <= 6 && (r === 0 || r === 6)) ||
        (2 <= r && r <= 4 && 2 <= c && c <= 4)
      ) {
        modules[row + r]![col + c] = true;
      } else {
        modules[row + r]![col + c] = false;
      }
    }
  }
}

function setupTimingPattern(modules: (boolean | null)[][]) {
  for (let r = 8; r < modules.length - 8; r += 1) {
    modules[r]![6] = r % 2 === 0;
    modules[6]![r] = r % 2 === 0;
  }
}

function mapData(
  modules: (boolean | null)[][],
  data: number[],
  maskPattern: number
) {
  let inc = -1;
  let row = modules.length - 1;
  let bitIndex = 7;
  let byteIndex = 0;

  for (let col = modules.length - 1; col > 0; col -= 2) {
    if (col === 6) col -= 1;

    while (true) {
      for (let c = 0; c < 2; c += 1) {
        if (modules[row]![col - c] === null) {
          let dark = false;

          if (byteIndex < data.length) {
            dark = ((data[byteIndex]! >>> bitIndex) & 1) === 1;
          }

          if (getMask(maskPattern, row, col - c)) {
            dark = !dark;
          }

          modules[row]![col - c] = dark;
          bitIndex -= 1;

          if (bitIndex === -1) {
            byteIndex += 1;
            bitIndex = 7;
          }
        }
      }

      row += inc;

      if (row < 0 || modules.length <= row) {
        row -= inc;
        inc = -inc;
        break;
      }
    }
  }
}

function createMatrix(typeNumber: number, data: number[]): boolean[][] {
  const moduleCount = typeNumber * 4 + 17;
  const modules: (boolean | null)[][] = new Array(moduleCount)
    .fill(null)
    .map(() => new Array<boolean | null>(moduleCount).fill(null));

  setupPositionProbePattern(modules, 0, 0);
  setupPositionProbePattern(modules, moduleCount - 7, 0);
  setupPositionProbePattern(modules, 0, moduleCount - 7);
  setupTimingPattern(modules);

  // Reserve format information areas
  for (let i = 0; i < 8; i += 1) {
    if (modules[i]![8] === null) modules[i]![8] = false;
    if (modules[8]![moduleCount - 1 - i] === null)
      modules[8]![moduleCount - 1 - i] = false;
  }
  modules[8]![moduleCount - 8] = true;

  const maskPattern = 0;
  mapData(modules, data, maskPattern);

  return modules.map((row) => row.map((cell) => Boolean(cell)));
}

function stringToUtf8Bytes(input: string): number[] {
  return Array.from(Buffer.from(input, "utf8"));
}

export function createQrMatrix(input: string): boolean[][] {
  const data = stringToUtf8Bytes(input);

  const typeNumber = data.length > 80 ? 6 : data.length > 60 ? 5 : 4;
  const errorCorrectionLength = 25; // approximate for versions used
  const encoded = createData(typeNumber, data, errorCorrectionLength);
  return createMatrix(typeNumber, encoded);
}
