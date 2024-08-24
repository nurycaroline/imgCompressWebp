import imagemin from "imagemin";
import imageminWebp from "imagemin-webp";
import fs from "node:fs";
import * as Commander from "commander";

type OptimizeImagesArgs = {
  destination: string;
  origem: string;
};
async function optimizeImages({ destination, origem }: OptimizeImagesArgs) {
  return await imagemin([`${origem}/*.{jpg,png,webp,gif}`], {
    destination: destination,
    plugins: [
      imageminWebp({
        // quality: 100,
        // preset: "picture",
        metadata: "none",
      }),
    ],
  });
}

function getDirectories(path: string) {
  return fs.readdirSync(path).filter(function (file) {
    return fs.statSync(path + "/" + file).isDirectory();
  });
}

function checkParametersExistsAndAreValidFolders(options: any) {
  const { destination, origem } = options;

  if (!destination || !origem) {
    throw new Error("You need to pass destination and origem parameters");
  }

  if (!fs.existsSync(destination) || !fs.existsSync(origem)) {
    throw new Error("The folders do not exist");
  }

  if (
    !fs.statSync(destination).isDirectory() ||
    !fs.statSync(origem).isDirectory()
  ) {
    throw new Error("The parameters need to be folders");
  }
}

function getParameters() {
  try {
    Commander.program
      .version("0.0.1")
      .option("-d, --destination <destination>", "Destination")
      .option("-o, --origem <origem>", "Origem")
      .parse(process.argv);
    Commander.program.parse();

    const options = Commander.program.opts();
    checkParametersExistsAndAreValidFolders(options);

    const { destination, origem } = options;

    console.log({ options });

    return { destination, origem };
  } catch (error : any) {
    console.error(error.message);
    process.exit(1);
  }
}

(async () => {
  const { destination, origem } = getParameters();

  try {
    const directories = getDirectories(origem);
    console.log({ directories });

    await Promise.all(
      directories.map(async (directory) => {
        await optimizeImages({
          destination: `${destination}/${directory}`,
          origem: `${origem}/${directory}`,
        });
      })
    );
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
