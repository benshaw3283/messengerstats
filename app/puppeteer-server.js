const puppeteer = require("puppeteer");

const cors = require("cors");
const express = require("express");

const app = express();
process.env.DEBUG = "puppeteer:*";
process.env.DISPLAY = ":1";

// Enable CORS for all routes
app.use(cors());

const activeJobs = new Set(); // Track active jobs
/*}
const startXvfb = () => {
  exec("Xvfb :1 -screen 0 1280x1024x24 &", (error, stdout, stderr) => {
    if (error) {
      console.error(`Error starting Xvfb: ${error.message}`);
      return;
    }
    console.log("Xvfb stdout:", stdout);
    console.log("Xvfb stderr:", stderr);
    console.log("Xvfb started");
  });
};
*/

const launchPuppeteer = async (jobID) => {
  if (activeJobs.has(jobID)) {
    console.log(`Job ${jobID} is already active. Skipping.`);
    return;
  }
  activeJobs.add(jobID);
  let browser;

  try {
    console.log("Launching Puppeteer...");

    browser = await puppeteer.launch({
      headless: false,
      executablePath:
        "/home/benshaw3283/.cache/puppeteer/chrome/linux-130.0.6723.58/chrome-linux64/chrome",
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-features=OutOfBlinkCors",
        "--disable-features=AudioServiceOutOfProcess",
        "--disable-dev-shm-usage",
        "--disable-software-rasterizer",
        "--disable-background-timer-throttling",
        "--disable-backgrounding-occluded-windows",
        "--disable-breakpad",
        "--disable-gpu",
        "--enable-logging",
        "--use-gl=swiftshader",
        "--display=:1",
        "--disable-notifications",
      ],
      dumpio: true, // Log browser output to console
    });
    const page = await browser.newPage();
    // await page.setViewport({ width: 1280, height: 1024 }); // Match VNC resolution
    {
      /*}  await page.evaluate(() => {
      document.documentElement.requestFullscreen().catch(console.error);
    });
    */
    }
    page.setDefaultNavigationTimeout(240000); // Set timeout to 4 minutes

    // Block pop-ups and notifications
    await page.evaluateOnNewDocument(() => {
      window.Notification = null;
      window.alert = () => {};
      window.confirm = () => true;
      window.prompt = () => "";
    });

    await runAutomationWithRetries(page);
  } catch (error) {
    console.error("Error during Puppeteer launch:", error);
  } finally {
    if (browser) await browser.close();
    activeJobs.delete(jobID);
  }
};

const runAutomation = async (page) => {
  try {
    console.log("Starting automation script...");
    await page.goto(
      "https://www.facebook.com/settings/?tab=download_your_information",
      { waitUntil: "networkidle2" }
    );
    console.log("Navigated to download page");

    await handlePostLoginPopups(page);

    await clickContinue(page);
    await clickDownloadTransferInfo(page);
    await clickSpecificTypes(page);
    await clickMessagesAndNext(page);
    await clickDownloadDeviceAndNext(page);
    await dateRangeAllTime(page);
    await clickFormatJSON(page);
    await createFiles(page);

    console.log("Automation run successfully");
  } catch (error) {
    console.log("Error during automation:", error);
  }
};

const maxRetries = 3;

const runAutomationWithRetries = async (page) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Attempt ${attempt} of ${maxRetries}`);
      await runAutomation(page);
      console.log("Automation run successfully");
      await page.evaluate(() => {
        const message = document.createElement("div");
        message.textContent =
          "Automation complete! You can now close this window.";
        message.style.position = "fixed";
        message.style.top = "20px";
        message.style.left = "50%";
        message.style.transform = "translateX(-50%)";
        message.style.padding = "10px 20px";
        message.style.backgroundColor = "green";
        message.style.color = "white";
        message.style.fontSize = "18px";
        message.style.zIndex = "1000";
        document.body.appendChild(message);
      });

      await new Promise((resolve) => setTimeout(resolve, 8000));
      break; // Exit loop if successful
    } catch (error) {
      console.error(`Error during automation (attempt ${attempt}):`, error);
      if (attempt === maxRetries) {
        console.error("Max retries reached, aborting.");
        break;
      }

      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  }
};

async function handlePostLoginPopups(page) {
  try {
    await page.waitForSelector('div[role="dialog"] button', {
      timeout: 1000,
    });
    await page.evaluate(() => {
      const dialogButtons = document.querySelectorAll(
        'div[role="dialog"] button'
      );
      dialogButtons.forEach((button) => {
        if (
          button.innerText.toLowerCase().includes("not now") ||
          button.innerText.toLowerCase().includes("no thanks") ||
          button.innerText.toLowerCase().includes("block")
        ) {
          button.click();
        }
      });
    });
  } catch (e) {
    console.log("No popups to handle");
  }
}

const retryClick = async (page, selector, retries = 3) => {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      await page.waitForSelector(selector, { visible: true });
      await page.click(selector);
      console.log(`Clicked element: ${selector}`);
      return;
    } catch (error) {
      console.log(
        `Failed to click ${selector} (attempt ${attempt + 1}):`,
        error
      );

      if (attempt < retries - 1) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } else {
        console.log(`Max retries reached for ${selector}. Moving on.`);
      }
    }
  }
};

async function clickContinue(page) {
  await page.goto(
    "https://www.facebook.com/settings/?tab=download_your_information",
    { waitUntil: ["load", "domcontentloaded", "networkidle2"] },
    { timeout: 240000 }
  );
  console.log("going to download info");

  await page.waitForNavigation({ waitUntil: "networkidle2" });
  await handlePostLoginPopups();
  const ariaLabel = "Continue";

  await page.waitForSelector(`a[aria-label="${ariaLabel}"]`);
  await retryClick(page, `a[aria-label="${ariaLabel}"]`);
  console.log("continue button clicked ");
}

async function clickDownloadTransferInfo(page) {
  await page.waitForNavigation();

  const divSelector =
    'div[role="button"][tabindex="0"][class="x1i10hfl xjbqb8w x1ejq31n xd10rxx x1sy0etr x17r0tee x972fbf xcfux6l x1qhh985 xm0m39n x1ypdohk xe8uvvx xdj266r x11i5rnm xat24cr x1mh8g0r xexx8yu x4uap5 x18d9i69 xkhd6sd x16tdsg8 x1hl2dhg xggy1nq x1o1ewxj x3x9cwd x1e5q0jg x13rtm0m x87ps6o x1lku1pv x1a2a7pz x9f619 x3nfvp2 xdt5ytf xl56j7k x1n2onr6 xh8yej3"]';
  try {
    await page.waitForSelector(divSelector);
  } catch (err) {
    console.log("Couldnt find downloadtransferinfo button:", err);
  }

  console.log("download or transfer button found");
  await retryClick(page, divSelector);

  console.log("Download button clicked");
}
async function clickSpecificTypes(page) {
  console.log("trying to find list div");
  try {
    await page.waitForSelector('div[role="list"]');
  } catch (err) {
    console.log("Couldnt find specifictypes:", err);
  }
  console.log("found list div");

  const listItemButtonSelector =
    'div[role="list"] > div[role="listitem"]:nth-of-type(2) div[role="button"]';

  try {
    await page.waitForSelector(listItemButtonSelector);
  } catch (err) {
    console.log("couldnt find listitembutton:", err);
  }
  console.log("types selector found");
  await retryClick(page, listItemButtonSelector);
  console.log("types selector clicked");
}

async function clickMessagesAndNext(page) {
  const inputSelector =
    "label:nth-of-type(3) > div > div > div.x9f619.x1n2onr6.x1ja2u2z.xdt5ytf.x2lah0s.x193iq5w.xeuugli.x78zum5 > div > input";
  try {
    await page.waitForSelector(inputSelector, { visible: true });
    console.log("Messages checkbox found");
  } catch (err) {
    console.log("couldnt find messages checkbox:", err);
  }

  await page.evaluate(() => {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach((checkbox, index) => {
      console.log(`Checkbox ${index}:`, checkbox.getAttribute("name"));
    });
  });

  await page.evaluate(async (selector) => {
    const checkbox = document.querySelector(selector);
    if (checkbox) {
      checkbox.click();
      console.log("Checkbox clicked");
      await new Promise((resolve) => setTimeout(resolve, 500)); // Wait for any JavaScript handling
      checkbox.setAttribute("aria-checked", "true");
    } else {
      console.log("Checkbox not found");
    }
  }, inputSelector);

  await page.waitForFunction(
    (selector) => {
      const checkbox = document.querySelector(selector);
      return checkbox && checkbox.getAttribute("aria-checked") === "true";
    },
    { timeout: 5000 },
    inputSelector
  );
  console.log("Checkbox checked");

  const divSelector =
    "div > div:nth-child(1) > div > div > div > div > div.x78zum5.xdt5ytf.x1iyjqo2 > div > div > div > div > div > div.x1o1ewxj.x3x9cwd.x1e5q0jg.x13rtm0m.x78zum5.xdt5ytf.x1iyjqo2.x1al4vs7 > div > div.xlp1x4z.x1ey2m1c.xds687c.x10l6tqk.x17qophe.x1jx94hy.xv7j57z > div.x6ikm8r.x10wlt62 > div > div > div > div > div > div > div";

  try {
    await page.waitForSelector(divSelector, { visible: true });
    console.log("Next button found");
  } catch (err) {
    console.log("couldnt find next button:", err);
  }

  await page.waitForFunction(
    (selector) => {
      const button = document.querySelector(selector);
      return (
        button &&
        !button.disabled &&
        button.getAttribute("aria-disabled") !== "true"
      );
    },
    {},
    divSelector
  );

  await page.evaluate((selector) => {
    const button = document.querySelector(selector);
    if (button) {
      button.click();
    }
  }, divSelector);
  console.log("Next button clicked");
}

async function clickDownloadDeviceAndNext(page) {
  const divSelector =
    "div > div:nth-child(1) > div > div > div > div > div.x78zum5.xdt5ytf.x1iyjqo2 > div > div > div > div > div > div.x1o1ewxj.x3x9cwd.x1e5q0jg.x13rtm0m.x78zum5.xdt5ytf.x1iyjqo2.x1al4vs7 > div > div.xb57i2i.x1q594ok.x5lxg6s.x78zum5.xdt5ytf.x6ikm8r.x1ja2u2z.x1pq812k.x1rohswg.xfk6m8.x1yqm8si.xjx87ck.xx8ngbg.xwo3gff.x1n2onr6.x1oyok0e.x1odjw0f.x1iyjqo2.xy5w88m > div.x78zum5.xdt5ytf.x1iyjqo2.x1n2onr6.xaci4zi > div.x78zum5.xdt5ytf.x1iyjqo2.xx6bls6.x889kno > div > div > div:nth-child(3) > div > div > div > div > div:nth-child(1) > div > div.x9f619.x1n2onr6.x1ja2u2z.x1qjc9v5.x78zum5.xdt5ytf.xl56j7k.xeuugli.xdl72j9.x1iyjqo2.x2lah0s.x1mq37bv.x1pi30zi.x1swvt13.x1gw22gp.x188425o.x19cbwz6.x79zeqe.xgugjxj.x2oemzd > div > div.x9f619.x1ja2u2z.x78zum5.x1n2onr6.x1iyjqo2.xs83m0k.xeuugli.x1qughib.x6s0dn4.x1a02dak.x1q0g3np.xdl72j9 > div > div > div";
  console.log("Looking for download next button");

  try {
    await page.waitForSelector(divSelector, { visible: true });
    console.log("Found download next button");
  } catch (err) {
    console.log("Couldn't find download next button:", err);
    return;
  }

  await page.hover(divSelector);
  await new Promise((resolve) => setTimeout(resolve, 500));

  const clicked = await retryClick(page, divSelector);

  if (clicked) {
    console.log("Button clicked successfully");
  } else {
    console.log("Failed to click the button after retries");
  }
}

async function dateRangeAllTime(page) {
  console.log("trying to find button inside listitem");

  const selector =
    "div > div:nth-child(1) > div > div > div > div > div.x78zum5.xdt5ytf.x1iyjqo2 > div > div > div > div > div > div.x1o1ewxj.x3x9cwd.x1e5q0jg.x13rtm0m.x78zum5.xdt5ytf.x1iyjqo2.x1al4vs7 > div > div.xb57i2i.x1q594ok.x5lxg6s.x78zum5.xdt5ytf.x6ikm8r.x1ja2u2z.x1pq812k.x1rohswg.xfk6m8.x1yqm8si.xjx87ck.xx8ngbg.xwo3gff.x1n2onr6.x1oyok0e.x1odjw0f.x1iyjqo2.xy5w88m > div.x78zum5.xdt5ytf.x1iyjqo2.x1n2onr6.xaci4zi.x129vozr > div.x78zum5.xdt5ytf.x1iyjqo2.xx6bls6.x889kno > div > div > div:nth-child(4) > div > div > div > div > div > div > div";
  try {
    await page.waitForSelector(selector);
    console.log("found date range div");
  } catch (err) {
    console.log("Couldnt find date range button:", err);
  }

  await retryClick(page, selector);
  console.log("button clicked");

  console.log("looking for All time input");
  const checkbox =
    "div > div:nth-child(1) > div > div > div > div > div.x78zum5.xdt5ytf.x1iyjqo2 > div > div > div > div > div > div.x1o1ewxj.x3x9cwd.x1e5q0jg.x13rtm0m.x78zum5.xdt5ytf.x1iyjqo2.x1al4vs7 > div > div.xb57i2i.x1q594ok.x5lxg6s.x78zum5.xdt5ytf.x6ikm8r.x1ja2u2z.x1pq812k.x1rohswg.xfk6m8.x1yqm8si.xjx87ck.xx8ngbg.xwo3gff.x1n2onr6.x1oyok0e.x1odjw0f.x1iyjqo2.xy5w88m > div.x78zum5.xdt5ytf.x1iyjqo2.x1n2onr6.xaci4zi.x129vozr > div.x78zum5.xdt5ytf.x1iyjqo2.xx6bls6.x889kno > div > div > div:nth-child(2) > div > div > div > div > label:nth-child(13) > div.x9f619.x1n2onr6.x1ja2u2z.x1qjc9v5.x78zum5.xdt5ytf.xl56j7k.xeuugli.xdl72j9.x1iyjqo2.x2lah0s.x1mq37bv.x1pi30zi.x1swvt13.x1gw22gp.x188425o.x19cbwz6.x79zeqe.xgugjxj.x2oemzd > div > div.x9f619.x1n2onr6.x1ja2u2z.xdt5ytf.x2lah0s.x193iq5w.xeuugli.x78zum5 > div > input";
  try {
    await page.waitForSelector(checkbox);
  } catch (err) {
    console.log("couldnt find all time input:", err);
  }
  console.log("all time input found");

  await page.evaluate(async (selector) => {
    const checkbox = document.querySelector(selector);
    if (checkbox) {
      checkbox.click();
      console.log("Checkbox clicked");
      await new Promise((resolve) => setTimeout(resolve, 500));
      checkbox.setAttribute("aria-checked", "true");
    } else {
      console.log("Checkbox not found");
    }
  }, checkbox);

  await page.waitForFunction(
    (selector) => {
      const checkbox = document.querySelector(selector);
      return checkbox && checkbox.getAttribute("aria-checked") === "true";
    },
    { timeout: 5000 },
    checkbox
  );
  console.log("Checkbox checked");

  const divSelector =
    "div > div:nth-child(1) > div > div > div > div > div.x78zum5.xdt5ytf.x1iyjqo2 > div > div > div > div > div > div.x1o1ewxj.x3x9cwd.x1e5q0jg.x13rtm0m.x78zum5.xdt5ytf.x1iyjqo2.x1al4vs7 > div > div.xlp1x4z.x1ey2m1c.xds687c.x10l6tqk.x17qophe.xv7j57z > div.x6ikm8r.x10wlt62 > div > div > div > div > div > div > div";
  console.log("looking for save button");
  try {
    await page.waitForSelector(divSelector);
  } catch (err) {
    console.log("couldnt find save button:", err);
  }
  console.log("save button found");
  await retryClick(page, divSelector);

  console.log("save button clicked");
}

async function clickFormatJSON(page) {
  const divSelector =
    "div > div:nth-child(1) > div > div > div > div > div.x78zum5.xdt5ytf.x1iyjqo2 > div > div > div > div > div > div.x1o1ewxj.x3x9cwd.x1e5q0jg.x13rtm0m.x78zum5.xdt5ytf.x1iyjqo2.x1al4vs7 > div > div.xb57i2i.x1q594ok.x5lxg6s.x78zum5.xdt5ytf.x6ikm8r.x1ja2u2z.x1pq812k.x1rohswg.xfk6m8.x1yqm8si.xjx87ck.xx8ngbg.xwo3gff.x1n2onr6.x1oyok0e.x1odjw0f.x1iyjqo2.xy5w88m > div.x78zum5.xdt5ytf.x1iyjqo2.x1n2onr6.xaci4zi.x129vozr > div.x78zum5.xdt5ytf.x1iyjqo2.xx6bls6.x889kno > div > div > div:nth-child(5) > div > div > div > div > div > div:nth-child(3) > div";
  console.log("looking for button");
  try {
    await page.waitForSelector(divSelector);
    console.log("button found");
  } catch (err) {
    console.log("couldnt find format json button:", err);
  }

  const buttonProperties = await page.evaluate((selector) => {
    const button = document.querySelector(selector);
    if (!button) {
      return null;
    }
    const properties = {
      offsetWidth: button.offsetWidth,
      offsetHeight: button.offsetHeight,
      visibility: window.getComputedStyle(button).visibility,
      display: window.getComputedStyle(button).display,
      disabled: button.disabled,
      ariaDisabled: button.getAttribute("aria-disabled"),
      innerText: button.innerText,
      innerHTML: button.innerHTML,
      name: button.getAttribute("name"),
    };
    return properties;
  }, divSelector);
  console.log(buttonProperties);

  await page.evaluate((selector) => {
    const button = document.querySelector(selector);
    if (button) {
      button.click();
      console.log("Button clicked via evaluate");
    } else {
      console.log("Button not found for click");
    }
  }, divSelector);

  console.log("button clicked");

  const checkboxJSON =
    "div > div:nth-child(1) > div > div > div > div > div.x78zum5.xdt5ytf.x1iyjqo2 > div > div > div > div > div > div.x1o1ewxj.x3x9cwd.x1e5q0jg.x13rtm0m.x78zum5.xdt5ytf.x1iyjqo2.x1al4vs7 > div > div.xb57i2i.x1q594ok.x5lxg6s.x78zum5.xdt5ytf.x6ikm8r.x1ja2u2z.x1pq812k.x1rohswg.xfk6m8.x1yqm8si.xjx87ck.xx8ngbg.xwo3gff.x1n2onr6.x1oyok0e.x1odjw0f.x1iyjqo2.xy5w88m > div.x78zum5.xdt5ytf.x1iyjqo2.x1n2onr6.xaci4zi.x129vozr > div.x78zum5.xdt5ytf.x1iyjqo2.xx6bls6.x889kno > div > div > div:nth-child(2) > div > div > div > div > label:nth-child(3) > div.x9f619.x1n2onr6.x1ja2u2z.x1qjc9v5.x78zum5.xdt5ytf.xl56j7k.xeuugli.xdl72j9.x1iyjqo2.x2lah0s.x1mq37bv.x1pi30zi.x1swvt13.x1gw22gp.x188425o.x19cbwz6.x79zeqe.xgugjxj.x2oemzd > div > div.x9f619.x1n2onr6.x1ja2u2z.xdt5ytf.x2lah0s.x193iq5w.xeuugli.x78zum5 > div > input";
  try {
    await page.waitForSelector(checkboxJSON);
  } catch (err) {
    console.log("couldnt find json checkbox", err);
  }

  await page.evaluate(async (selector) => {
    const checkbox = document.querySelector(selector);
    if (checkbox) {
      checkbox.click();
      console.log("Checkbox clicked");
      await new Promise((resolve) => setTimeout(resolve, 500));
      checkbox.setAttribute("aria-checked", "true");
    } else {
      console.log("Checkbox not found");
    }
  }, checkboxJSON);

  await page.waitForFunction(
    (selector) => {
      const checkbox = document.querySelector(selector);
      return checkbox && checkbox.getAttribute("aria-checked") === "true";
    },
    { timeout: 5000 },
    checkboxJSON
  );
  console.log("JSON Checkbox checked");

  const saveDiv =
    "div > div:nth-child(1) > div > div > div > div > div.x78zum5.xdt5ytf.x1iyjqo2 > div > div > div > div > div > div.x1o1ewxj.x3x9cwd.x1e5q0jg.x13rtm0m.x78zum5.xdt5ytf.x1iyjqo2.x1al4vs7 > div > div.xlp1x4z.x1ey2m1c.xds687c.x10l6tqk.x17qophe.xv7j57z > div.x6ikm8r.x10wlt62 > div > div > div > div > div > div > div";
  await page.waitForSelector(saveDiv);
  console.log("button found");
  await retryClick(page, saveDiv);

  console.log("button clicked");
}

async function createFiles(page) {
  const divSelector =
    "div > div:nth-child(1) > div > div > div > div > div.x78zum5.xdt5ytf.x1iyjqo2 > div > div > div > div > div > div.x1o1ewxj.x3x9cwd.x1e5q0jg.x13rtm0m.x78zum5.xdt5ytf.x1iyjqo2.x1al4vs7 > div > div.xlp1x4z.x1ey2m1c.xds687c.x10l6tqk.x17qophe.xv7j57z > div.x6ikm8r.x10wlt62 > div > div > div:nth-child(1) > div > div > div > div";

  await page.waitForSelector(divSelector);
  console.log("found create files button");

  await page.evaluate(async (selector) => {
    const checkbox = document.querySelector(selector);
    if (checkbox) {
      checkbox.click();
      console.log("div clicked");
      await new Promise((resolve) => setTimeout(resolve, 500));
    } else {
      console.log("div not found");
    }
  }, divSelector);
  console.log("clicked create files");
}

app.get("/automation-status", (req, res) => {
  const hasActiveJobs = activeJobs.size > 0;
  res.json({ automationActive: hasActiveJobs });
});

app.get("/start", async (req, res) => {
  try {
    const jobID = Date.now().toString();
    await launchPuppeteer(jobID);
    console.log("Puppeteer started successfully!");
    res.send(`Automation job ${jobID} started`);
  } catch (error) {
    console.error("Error during Puppeteer launch:", error);
    res.status(500).send("Automation error");
  }
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
  //startXvfb();
});
