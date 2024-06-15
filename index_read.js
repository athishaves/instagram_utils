import playwright from "playwright";

// ======== DETAILS ========

const other_user = "mommys_fabric";
const post = "C0TI9jjPieH";

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

// ======== INIT ========

const browserType = "chromium";
const browser = await playwright[browserType].launch();
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

await page.fill("[name=username]", username);
await page.fill('[type="password"]', password);
await page.click("[type=submit]");
console.log("3");

await delay(5000);

// ======== USER PROFILE ========

// await page.goto(`https://www.instagram.com/${other_user}`);
// console.log("4");

// await delay(5000);
// console.log("5");

// await page.screenshot({ path: `profile-${other_user}.png` });
// console.log("6");

// const images = await page.evaluate(() => {
//   const images = document.querySelectorAll("img");
//   const urls = Array.from(images).map((v) => v.src);
//   return urls;
// });
// console.log("7");
// console.log(images);

// ======== POST ========

await page.goto(`https://www.instagram.com/p/${post}`);
console.log("4");

await delay(5000);
console.log("5");

await page.screenshot({ path: `post-${post}.png` });
console.log("6");

const { comments, page_info } = await page.evaluate(() => {
  const scriptTags = document.querySelectorAll("script[data-content-len]");
  let comments = [];
  let page_info = null;

  for (const scriptTag of scriptTags) {
    const jsonText = scriptTag?.textContent;
    if (jsonText) {
      try {
        const jsonData = JSON.parse(jsonText);

        const potentialCommentsSection =
          jsonData?.require?.[0]?.[3]?.[0]?.__bbox?.require?.[0]?.[3]?.[1]
            ?.__bbox?.result?.data
            ?.xdt_api__v1__media__media_id__comments__connection;

        if (potentialCommentsSection) {
          const isInterestedComment = (comment) => {
            comment = comment.toLowerCase();
            return (
              comment.includes("price") ||
              comment.includes("pp") ||
              comment.includes("much") ||
              comment.includes("order") ||
              comment.includes("cost") ||
              comment.includes("how")
            );
          };

          const commentsSection = potentialCommentsSection;
          page_info = commentsSection.page_info;
          for (let comment of commentsSection.edges) {
            const commentData = comment.node;
            const commentText = commentData?.text ?? "";
            console.log("========== COMMENT", commentText);
            if (isInterestedComment(commentText)) {
              const comm = {
                user: commentData?.user?.username,
                profile_pic: commentData?.user?.profile_pic_url,
                comment: commentData?.text,
                created_at: commentData?.created_at,
              };
              comments.push(comm);
            } else {
              console.log("[NOT INCLUDED]", commentText);
            }
          }
          break;
        }
      } catch (error) {
        console.error("Error parsing JSON:", error);
      }
    }
  }

  return { comments, page_info };
});

console.log("7");
console.log(comments);
console.log(page_info);

await browser.close();
