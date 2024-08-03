const puppeteer = require("puppeteer");

async function requestDownload() {
  const browser = await puppeteer.launch({
    headless: false,
    args: ["--disable-notifications"],
  }); //TODO set to true for prod
  const page = await browser.newPage();

  // Listen for browser dialog events and dismiss them
  page.on("dialog", async (dialog) => {
    console.log(dialog.message());
    await dialog.dismiss();
  });

  async function handlePostLoginPopups() {
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
            button.innerText.toLowerCase().includes("no thanks")
          ) {
            button.click();
          }
        });
      });
    } catch (e) {
      // No popups found, continue with the script
      console.log("No popups to handle");
    }
  }

  async function clickContinue() {
    await page.goto(
      "https://www.facebook.com/settings/?tab=download_your_information"
    );
    console.log("going to download info");

    await page.waitForNavigation({ waitUntil: "networkidle0" });
    await handlePostLoginPopups();
    const ariaLabel = "Continue";

    await page.waitForSelector(`a[aria-label="${ariaLabel}"]`);
    await page.click(`a[aria-label="${ariaLabel}"]`);
    console.log("continue button clicked ");
  }

  async function clickDownloadTransferInfo() {
    await page.waitForNavigation();

    // Perform actions on the new page
    // Example: Click a div with role="button" and tabindex="0"
    const divSelector =
      'div[role="button"][tabindex="0"][class="x1i10hfl xjbqb8w x1ejq31n xd10rxx x1sy0etr x17r0tee x972fbf xcfux6l x1qhh985 xm0m39n x1ypdohk xe8uvvx xdj266r x11i5rnm xat24cr x1mh8g0r xexx8yu x4uap5 x18d9i69 xkhd6sd x16tdsg8 x1hl2dhg xggy1nq x1o1ewxj x3x9cwd x1e5q0jg x13rtm0m x87ps6o x1lku1pv x1a2a7pz x9f619 x3nfvp2 xdt5ytf xl56j7k x1n2onr6 xh8yej3"]';
    await page.waitForSelector(divSelector);

    console.log("download or transfer button found");
    await page.click(divSelector);
    console.log("Download button clicked");
  }
  async function clickSpecificTypes() {
    console.log("trying to find list div");
    await page.waitForSelector('div[role="list"]');
    console.log("found list div");
    // Example: Click the second div with role="listitem" within a div with role="list"
    const listItemButtonSelector =
      'div[role="list"] > div[role="listitem"]:nth-of-type(2) div[role="button"]';

    await page.waitForSelector(listItemButtonSelector);
    console.log("types selector found");
    await page.click(listItemButtonSelector);
    console.log("types selector clicked");
  }

  async function clickMessagesAndNext() {
    // Wait for the input element to be visible
    const inputSelector = 'div input[name="Messages-checkbox"]';
    await page.waitForSelector(inputSelector);
    console.log("messages checkbox found");
    await page.click(inputSelector);

    console.log("checkbox checked");
    // Change the aria-checked attribute from false to true
    await page.evaluate(() => {
      const inputElement = document.querySelector(
        'div input[name="Messages-checkbox"]'
      );
      if (inputElement) {
        inputElement.setAttribute("aria-checked", "true");
      }
      console.log("checkbox clicked");
    });

    // Optional: Verify the change
    const ariaCheckedValue = await page.evaluate(() => {
      const inputElement = document.querySelector(
        'div input[name="Messages-checkbox"]'
      );
      return inputElement ? inputElement.getAttribute("aria-checked") : null;
    });
    console.log("aria-checked value:", ariaCheckedValue);

    console.log("looking for div");
    const divSelector = 'div[role="button"][tabindex="0"]';
    await page.waitForSelector(divSelector);
    console.log("found next button");
    //await page.click(divSelector);
    // Use evaluate to perform the click
    await page.evaluate((selector) => {
      const button = document.querySelector(selector);
      if (button) {
        button.click();
      }
    }, divSelector);
    console.log("clicked");
  }

  async function clickDownloadDeviceAndNext() {
    //await page.waitForNavigation();
    // Wait for the input element to be visible
    {
      /* const inputSelector = 'div input[name="Download to device"]';
    console.log("looking for input");
    await page.waitForSelector(inputSelector);
    console.log("found input");
    // Change the aria-checked attribute from false to true
    await page.evaluate(() => {
      const inputElement = document.querySelector(
        'input[name="Download to device"]'
      );
      if (inputElement) {
        inputElement.setAttribute("aria-checked", "true");
      }
    });
    console.log("checkbox checked");
*/
    }
    const divSelector = 'div[role="button"][tabindex="0"]';
    await page.waitForSelector(divSelector);
    console.log("found button");
    await page.click(divSelector);
    console.log("button clicked");
  }

  async function dateRangeAllTime() {
    // Wait for the list to be present
    await page.waitForSelector('div[role="list"]');

    // Find the first list item within the list
    const listItem = await page.$('div[role="list"] > div[role="listitem"]');

    if (listItem) {
      // Find the button within the list item
      const button = await listItem.$('div[role="button"]');

      if (button) {
        // Click the button
        await button.click();
        console.log("Button clicked!");
      } else {
        console.log("Button not found within the list item");
      }
    } else {
      console.log("List item not found within the list");
    }

    await page.waitForSelector('input[name="All time"]');

    // Change the aria-checked property to 'true'
    await page.evaluate(() => {
      const inputElement = document.querySelector('input[name="All time"]');
      if (inputElement) {
        inputElement.setAttribute("aria-checked", "true");
      } else {
        console.log("Input element not found");
      }
    });

    const divSelector = 'div[role="button"][tabindex="0"]';
    await page.waitForSelector(divSelector);
    await page.click(divSelector);
  }

  async function clickFormatJSON() {
    const divSelector =
      'div[role="list"] > div[role="listitem"]:nth-of-type(2) div[role="button"]';
    await page.waitForSelector(divSelector);
    await page.click(divSelector);

    await page.evaluate(() => {
      const inputElement = document.querySelector('div input[name="JSON"]');
      if (inputElement) {
        inputElement.setAttribute("aria-checked", "true");
      }
    });

    const saveDiv = 'div[role="button"][tabindex="0"]';
    await page.waitForSelector(saveDiv);
    await page.click(saveDiv);
  }

  async function createFiles() {
    const divSelector = 'div[role="button"][tabindex="0"]';
    await page.waitForSelector(divSelector);
    await page.click(divSelector);
  }

  await clickContinue();
  await clickDownloadTransferInfo();
  await clickSpecificTypes();
  await clickMessagesAndNext();
  await clickDownloadDeviceAndNext();
  await dateRangeAllTime();
  await clickFormatJSON();
  await createFiles();
}

// Run the main function
requestDownload().catch((error) => {
  console.error("Error during automation:", error);
});
