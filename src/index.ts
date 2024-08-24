import imagemin from "imagemin";
import imageminWebp from "imagemin-webp";
import fs from "node:fs";
import * as Commander from "commander";

type OptimizeImagesArgs = {
  destination: string;
  origin: string;
};
async function optimizeImages({ destination, origin }: OptimizeImagesArgs) {
  return await imagemin([`${origin}/*.{jpg,png,webp,gif}`], {
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
  const { destination, origin } = options;

  if (!destination || !origin) {
    throw new Error("You need to pass destination and origin parameters");
  }

  if (!fs.existsSync(destination) || !fs.existsSync(origin)) {
    throw new Error("The folders do not exist");
  }

  if (
    !fs.statSync(destination).isDirectory() ||
    !fs.statSync(origin).isDirectory()
  ) {
    throw new Error("The parameters need to be folders");
  }
}

function getParameters() {
  try {
    Commander.program
      .version("0.0.1")
      .option("-d, --destination <destination>", "Destination")
      .option("-o, --origin <origin>", "Origin")
      .parse(process.argv);
    Commander.program.parse();

    const options = Commander.program.opts();
    checkParametersExistsAndAreValidFolders(options);

    const { destination, origin } = options;

    console.log({ options });

    return { destination, origin };
  } catch (error : any) {
    console.error(error.message);
    process.exit(1);
  }
}

(async () => {
  const { destination, origin } = getParameters();

  try {
    const directories = getDirectories(origin);
    console.log({ directories });

    await Promise.all(
      directories.map(async (directory) => {
        await optimizeImages({
          destination: `${destination}/${directory}`,
          origin: `${origin}/${directory}`,
        });
      })
    );
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
