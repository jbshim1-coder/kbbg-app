import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";
import fs from "fs";

function convertMdToDocx(mdFile, docxFile) {
  const md = fs.readFileSync(mdFile, "utf-8");
  const lines = md.split("\n");
  const children = [];

  for (const line of lines) {
    if (line.startsWith("# ")) {
      children.push(new Paragraph({ text: line.slice(2), heading: HeadingLevel.TITLE }));
    } else if (line.startsWith("## ")) {
      children.push(new Paragraph({ text: line.slice(3), heading: HeadingLevel.HEADING_1 }));
    } else if (line.startsWith("### ")) {
      children.push(new Paragraph({ text: line.slice(4), heading: HeadingLevel.HEADING_2 }));
    } else if (line.startsWith("#### ")) {
      children.push(new Paragraph({ text: line.slice(5), heading: HeadingLevel.HEADING_3 }));
    } else if (line.startsWith("> ")) {
      children.push(new Paragraph({ children: [new TextRun({ text: line.slice(2), italics: true })] }));
    } else if (line.startsWith("| ") && !line.includes("---")) {
      const cells = line.split("|").filter(c => c.trim()).map(c => c.trim());
      children.push(new Paragraph(cells.join("  |  ")));
    } else if (line.startsWith("- [ ] ")) {
      children.push(new Paragraph("☐ " + line.slice(6)));
    } else if (line.startsWith("- ") || line.startsWith("  - ")) {
      children.push(new Paragraph(line));
    } else if (line.startsWith("```") || line.startsWith("---")) {
      children.push(new Paragraph({ text: "" }));
    } else if (line.trim() === "") {
      children.push(new Paragraph({ text: "" }));
    } else {
      const boldRegex = /\*\*(.+?)\*\*/g;
      if (boldRegex.test(line)) {
        const parts = [];
        let lastIndex = 0;
        line.replace(/\*\*(.+?)\*\*/g, (match, p1, offset) => {
          if (offset > lastIndex) parts.push(new TextRun(line.slice(lastIndex, offset)));
          parts.push(new TextRun({ text: p1, bold: true }));
          lastIndex = offset + match.length;
        });
        if (lastIndex < line.length) parts.push(new TextRun(line.slice(lastIndex)));
        children.push(new Paragraph({ children: parts }));
      } else {
        children.push(new Paragraph(line));
      }
    }
  }

  const doc = new Document({ sections: [{ children }] });
  Packer.toBuffer(doc).then(buffer => {
    fs.writeFileSync(docxFile, buffer);
    console.log(docxFile + " 생성 완료");
  });
}

convertMdToDocx("docs/PROJECT_PLAN.md", "docs/PROJECT_PLAN.docx");
convertMdToDocx("docs/DEV_PLAN.md", "docs/DEV_PLAN.docx");
convertMdToDocx("docs/FULL_PLAN.md", "docs/FULL_PLAN.docx");
