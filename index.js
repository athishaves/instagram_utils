import playwright from "playwright";
import path from "path";

// ======== DETAILS ========

const args = process.argv.slice(2);
if (args.length != 4) {
  console.error(
    "Usage: node index.js <username> <password> <file_path> <caption>"
  );
  process.exit(1);
}

const [username, password, caption, file_path] = args;
const filePath = path.resolve(file_path);

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

// ======== INIT ========

const browserType = "firefox";
const browser = await playwright[browserType].launch({ headless: true });
const context = await browser.newContext();
const page = await context.newPage();
// page.on("console", (msg) => {
//   console.log(msg.text());
// });
console.log("0");

// ======== LOGIN ========

await page.goto("https://www.instagram.com/accounts/login/");
console.log("1");

await page.waitForSelector("[type=submit]", {
  state: "visible",
});
console.log("2");

// ======== ADD DETAILS ========

await page.fill("[name=username]", username);
await page.fill('[type="password"]', password);
await page.click("[type=submit]");
console.log("3");

await delay(10000);

// ======== NEW POST ========

await page.click("text=Create");
console.log("3.1");
await page.click('svg[aria-label="Post"]');
console.log("3.2");
await delay(2000);
console.log("4");

// ======== SELECT FILE ========

const fileChooserPromise = page.waitForEvent("filechooser");
await page.click("button:has-text('Select From Computer')");
await delay(1000);
console.log("4.0");

const fileChooser = await fileChooserPromise;
fileChooser.setFiles([filePath]);
await delay(1000);

console.log("4.1");
await delay(5000);
console.log("5");

await page.click("text=OK");
await delay(1000);
console.log("5.01");

await page.click("text=Next");
await delay(2000);
console.log("5.1");

await page.click("text=Next");
await delay(1000);

console.log("6");

await page.click('div[aria-label="Write a caption..."]');
await delay(2000);
console.log("6.1");

// await page.fill("[name=username]", caption);
for (const cap of caption) {
  console.log("Typing...", cap);
  await page.keyboard.type(cap);
  await delay(100);
}

await delay(1000);
console.log("6.2");

await page.click("text=Share");
console.log("7");

while (true) {
  try {
    console.log("Waiting...");
    await page.waitForSelector("text=Your reel has been shared.", {
      timeout: 1000,
    });
    break;
  } catch (e) {
    await delay(1000);
  }
}

console.log("Your reel is shared!");

await browser.close();
