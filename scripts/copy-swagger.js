const fs = require("fs");
const path = require("path");

const source = path.join(__dirname, "../src/swagger");
const destination = path.join(__dirname, "../dist/swagger");

function copyYamlFiles(currentSource, currentDestination) {
  fs.mkdirSync(currentDestination, { recursive: true });

  for (const entry of fs.readdirSync(currentSource, {
    withFileTypes: true,
  })) {
    const sourcePath = path.join(currentSource, entry.name);
    const destinationPath = path.join(currentDestination, entry.name);

    if (entry.isDirectory()) {
      copyYamlFiles(sourcePath, destinationPath);
    } else if (entry.name.endsWith(".yaml") || entry.name.endsWith(".yml")) {
      fs.copyFileSync(sourcePath, destinationPath);
    }
  }
}

copyYamlFiles(source, destination);
