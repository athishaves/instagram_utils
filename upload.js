import { IgApiClient } from "instagram-private-api";
import { readFile } from "fs";
import { promisify } from "util";
const readFileAsync = promisify(readFile);

const args = process.argv.slice(2);
if (args.length != 5) {
  console.error(
    "Usage: node upload.js <username> <password> <caption> <video_path> <cover_path>"
  );
  process.exit(1);
}

const [username, password, caption, video_path, cover_path] = args;

const ig = new IgApiClient();

async function login(username, password) {
  ig.state.generateDevice(username);
  await ig.account.login(username, password);
}

(async (username, password, video_path, cover_path, caption) => {
  await login(username, password);

  const publishResult = await ig.publish.video({
    video: await readFileAsync(video_path),
    coverImage: await readFileAsync(cover_path),
    caption: caption,
  });

  console.log(publishResult);
})(username, password, video_path, cover_path, caption);
