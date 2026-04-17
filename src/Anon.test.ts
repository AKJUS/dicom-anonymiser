import Anonymize from "./Anon";
import DicomMessage from "./Message";
const fs = require("fs");

function readFileBuffer(path: string): ArrayBuffer {
  const b = fs.readFileSync(path);
  return b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength);
}

function anonymiseFixture(path: string) {
  const dcm = DicomMessage.readFile(readFileBuffer(path));
  const anon = Anonymize(dcm.dict);
  const writtenBytes = Buffer.from(dcm.write(anon));
  return { dcm, anon, writtenBytes };
}

describe("Anonymize strips previously-kept SQ-VR tags", () => {
  it("strips RequestAttributesSequence carrying nested physician PN", () => {
    const { anon, writtenBytes } = anonymiseFixture(
      "fixtures/01_ras_physician.dcm"
    );

    expect(anon["00400275"]).toBeUndefined();
    expect(writtenBytes.includes("TEST^")).toBe(false);
  });

  it("strips RequestAttributesSequence carrying nested source-institution UIDs", () => {
    const { anon, writtenBytes } = anonymiseFixture(
      "fixtures/02_ras_uids.dcm"
    );

    expect(anon["00400275"]).toBeUndefined();
    expect(writtenBytes.includes("1.3.12.2.1107.5.1.7.TEST")).toBe(false);
  });

  it("preserves safe top-level tags (sanity check on assertion pattern)", () => {
    const { anon } = anonymiseFixture("fixtures/01_ras_physician.dcm");

    expect(anon["00080060"]).toBeDefined();
  });
});
