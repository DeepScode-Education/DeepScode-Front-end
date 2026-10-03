import fs from "fs";
import path from "path";

const assetsDir = path.join(process.cwd(), "src/assets");
const srcDir = path.join(process.cwd(), "src");

const imageExtensions = [
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
  ".svg",
  ".gif",
];

function getFiles(dir: string): string[] {
  let results: string[] = [];

  for (const file of fs.readdirSync(dir)) {
    const full = path.join(dir, file);

    if (fs.statSync(full).isDirectory()) {
      results = results.concat(getFiles(full));
    } else {
      results.push(full);
    }
  }

  return results;
}

const images = getFiles(assetsDir).filter((file) =>
  imageExtensions.includes(path.extname(file).toLowerCase())
);

const sourceFiles = getFiles(srcDir).filter((file) =>
  /\.(ts|tsx|js|jsx)$/.test(file)
);

console.table(
  images.map((img) => {
    const fileName = path.basename(img);

    const usedIn = sourceFiles
      .filter((src) =>
        fs.readFileSync(src, "utf8").includes(fileName)
      )
      .map((src) => path.relative(srcDir, src));

    return {
      Image: path.relative(assetsDir, img),
      UsedIn: usedIn.length
        ? usedIn.join(", ")
        : "NOT USED",
    };
  })
);