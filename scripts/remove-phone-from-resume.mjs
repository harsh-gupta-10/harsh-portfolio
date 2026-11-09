import { readFileSync, writeFileSync } from "fs";
import zlib from "zlib";
import { PDFDocument } from "pdf-lib";

async function run() {
  const inputPath = "/home/gupta/.gemini/antigravity/brain/42575a66-d84d-4369-9d86-e7f3308d19f5/.user_uploaded/media_1794252463752.pdf";
  const outputPath = "public/Harsh_Gupta_Resume.pdf";

  const pdfBytes = readFileSync(inputPath);
  const doc = await PDFDocument.load(pdfBytes);
  const page1 = doc.getPage(0);

  // 1. Modify page 1 content stream
  const { Contents } = page1.node.normalizedEntries();
  const arr = doc.context.lookup(Contents);
  const rawStream = doc.context.lookup(arr.get(1));
  let inflated = zlib.inflateSync(Buffer.from(rawStream.contents)).toString("latin1");

  // Verify phone number is in stream
  if (!inflated.includes("9821185590")) {
    throw new Error("Phone number not found in stream 1!");
  }

  // Original target block:
  // BT
  // 28.8 683.377 Td
  // [(+91)-333(9821185590)] TJ
  // /F63 9.9626 Tf
  // [<>-334(j)] TJ
  // /F57 9.9626 Tf
  // [<>-333(harshgupta24716@gmail.com)] TJ
  // ET
  // q
  // 1 0 0 1 109.054 680.046 cm
  // 0.398 w
  // 0 0 m
  // 125.722 0 l
  // S
  // Q
  // BT
  // /F63 9.9626 Tf
  // 238.098 683.377 Td
  // [(j)] TJ
  // /F57 9.9626 Tf
  // -209.298 -11.955 Td
  // [(link)28(edin.com/in/harsh-gupta-2b41692b1)] TJ
  // ET

  const oldBlock = `BT
28.8 683.377 Td
[(+91)-333(9821185590)] TJ
/F63 9.9626 Tf
[<>-334(j)] TJ
/F57 9.9626 Tf
[<>-333(harshgupta24716@gmail.com)] TJ
ET
q
1 0 0 1 109.054 680.046 cm
0.398 w
0 0 m
125.722 0 l
S
Q
BT
/F63 9.9626 Tf
238.098 683.377 Td
[(j)] TJ
/F57 9.9626 Tf
-209.298 -11.955 Td
[(link)28(edin.com/in/harsh-gupta-2b41692b1)] TJ
ET`;

  const newBlock = `BT
28.8 683.377 Td
/F57 9.9626 Tf
[(harshgupta24716@gmail.com)] TJ
ET
q
1 0 0 1 28.8 680.046 cm
0.398 w
0 0 m
125.722 0 l
S
Q
BT
/F57 9.9626 Tf
28.8 671.422 Td
[(link)28(edin.com/in/harsh-gupta-2b41692b1)] TJ
ET`;

  if (!inflated.includes(oldBlock)) {
    console.log("Could not find exact old block, searching snippet...");
    const idx = inflated.indexOf("9821185590");
    console.log("Surrounding 300 chars:", JSON.stringify(inflated.slice(idx - 60, idx + 240)));
    throw new Error("Mismatch in old block string");
  }

  inflated = inflated.replace(oldBlock, newBlock);
  const deflated = zlib.deflateSync(Buffer.from(inflated, "latin1"));
  rawStream.contents = deflated;

  // 2. Remove tel: annotation and adjust mailto rect on Page 1
  const { Annots } = page1.node.normalizedEntries();
  if (Annots) {
    const annotsArr = doc.context.lookup(Annots);
    let telIndex = -1;
    let mailtoAnnot = null;

    for (let i = 0; i < annotsArr.size(); i++) {
      const annot = doc.context.lookup(annotsArr.get(i));
      const a = annot ? doc.context.lookup(annot.get(doc.context.obj("A"))) : null;
      const uriObj = a ? doc.context.lookup(a.get(doc.context.obj("URI"))) : null;
      const uri = uriObj ? uriObj.toString() : "";

      if (uri.includes("tel:") || uri.includes("9821185590")) {
        telIndex = i;
      }
      if (uri.includes("mailto:")) {
        mailtoAnnot = annot;
      }
    }

    if (mailtoAnnot) {
      // Shift mailto rectangle left to match new text position (x = 27.8 to 155.5)
      // Original: [ 108.058 678.452 235.773 691.846 ]
      // New: [ 27.803 678.452 155.518 691.846 ]
      const { PDFArray, PDFNumber } = await import("pdf-lib");
      const newRect = doc.context.obj([
        PDFNumber.of(27.803),
        PDFNumber.of(678.452),
        PDFNumber.of(155.518),
        PDFNumber.of(691.846),
      ]);
      mailtoAnnot.set(doc.context.obj("Rect"), newRect);
    }

    if (telIndex !== -1) {
      annotsArr.remove(telIndex);
      console.log("Removed tel annot at index", telIndex);
    }
  }

  const modifiedBytes = await doc.save();
  writeFileSync(outputPath, modifiedBytes);
  console.log("Successfully saved updated resume to", outputPath, "(bytes:", modifiedBytes.length, ")");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
