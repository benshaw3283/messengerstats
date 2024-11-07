const puppeteer = require("puppeteer");
import { NextResponse } from "next/server";

export async function GET(request) {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: false,
      args: ["--disable-notifications"],
    });
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
        "https://accountscenter.facebook.com/info_and_permissions/dyi/"
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
      const inputSelector =
        "label:nth-of-type(3) > div > div > div.x9f619.x1n2onr6.x1ja2u2z.xdt5ytf.x2lah0s.x193iq5w.xeuugli.x78zum5 > div > input";

      await page.waitForSelector(inputSelector, { visible: true });
      console.log("Messages checkbox found");

      // Log multiple checkboxes
      await page.evaluate(() => {
        const checkboxes = document.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach((checkbox, index) => {
          console.log(`Checkbox ${index}:`, checkbox.getAttribute("name"));
        });
      });

      // Click the checkbox
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

      // Wait for aria-checked attribute to be 'true'
      await page.waitForFunction(
        (selector) => {
          const checkbox = document.querySelector(selector);
          return checkbox && checkbox.getAttribute("aria-checked") === "true";
        },
        { timeout: 5000 },
        inputSelector
      );
      console.log("Checkbox checked");

      // Define the selector for the next button
      const divSelector =
        "div > div:nth-child(1) > div > div > div > div > div.x78zum5.xdt5ytf.x1iyjqo2 > div > div > div > div > div > div.x1o1ewxj.x3x9cwd.x1e5q0jg.x13rtm0m.x78zum5.xdt5ytf.x1iyjqo2.x1al4vs7 > div > div.xlp1x4z.x1ey2m1c.xds687c.x10l6tqk.x17qophe.x1jx94hy.xv7j57z > div.x6ikm8r.x10wlt62 > div > div > div > div > div > div > div";

      await page.waitForSelector(divSelector, { visible: true });
      console.log("Next button found");

      // Wait for the next button to be enabled
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
      const divSelector =
        "div > div:nth-child(1) > div > div > div > div > div.x78zum5.xdt5ytf.x1iyjqo2 > div > div > div > div > div > div.x1o1ewxj.x3x9cwd.x1e5q0jg.x13rtm0m.x78zum5.xdt5ytf.x1iyjqo2.x1al4vs7 > div > div.xb57i2i.x1q594ok.x5lxg6s.x78zum5.xdt5ytf.x6ikm8r.x1ja2u2z.x1pq812k.x1rohswg.xfk6m8.x1yqm8si.xjx87ck.xx8ngbg.xwo3gff.x1n2onr6.x1oyok0e.x1odjw0f.x1iyjqo2.xy5w88m > div.x78zum5.xdt5ytf.x1iyjqo2.x1n2onr6.xaci4zi > div.x78zum5.xdt5ytf.x1iyjqo2.xx6bls6.x889kno > div > div > div:nth-child(3) > div > div > div > div > div:nth-child(1) > div";
      console.log("looking for download next button");

      /*  const buttonProperties = await page.evaluate((selector) => {
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
        };
        return properties;
      }, divSelector);
*/
      //console.log(buttonProperties);
      await page.waitForSelector(divSelector);
      console.log("found button");
      await page.click(divSelector);
      console.log("button clicked");
    }

    async function dateRangeAllTime() {
      // Wait for the list to be present
      console.log("trying to find button inside listitem");

      const selector =
        "div > div:nth-child(1) > div > div > div > div > div.x78zum5.xdt5ytf.x1iyjqo2 > div > div > div > div > div > div.x1o1ewxj.x3x9cwd.x1e5q0jg.x13rtm0m.x78zum5.xdt5ytf.x1iyjqo2.x1al4vs7 > div > div.xb57i2i.x1q594ok.x5lxg6s.x78zum5.xdt5ytf.x6ikm8r.x1ja2u2z.x1pq812k.x1rohswg.xfk6m8.x1yqm8si.xjx87ck.xx8ngbg.xwo3gff.x1n2onr6.x1oyok0e.x1odjw0f.x1iyjqo2.xy5w88m > div.x78zum5.xdt5ytf.x1iyjqo2.x1n2onr6.xaci4zi.x129vozr > div.x78zum5.xdt5ytf.x1iyjqo2.xx6bls6.x889kno > div > div > div:nth-child(4) > div > div > div > div > div > div > div";
      await page.waitForSelector(selector);
      console.log("found date range div");

      await page.click(selector);
      console.log("button clicked");

      console.log("looking for All time input");
      const checkbox =
        "div > div:nth-child(1) > div > div > div > div > div.x78zum5.xdt5ytf.x1iyjqo2 > div > div > div > div > div > div.x1o1ewxj.x3x9cwd.x1e5q0jg.x13rtm0m.x78zum5.xdt5ytf.x1iyjqo2.x1al4vs7 > div > div.xb57i2i.x1q594ok.x5lxg6s.x78zum5.xdt5ytf.x6ikm8r.x1ja2u2z.x1pq812k.x1rohswg.xfk6m8.x1yqm8si.xjx87ck.xx8ngbg.xwo3gff.x1n2onr6.x1oyok0e.x1odjw0f.x1iyjqo2.xy5w88m > div.x78zum5.xdt5ytf.x1iyjqo2.x1n2onr6.xaci4zi.x129vozr > div.x78zum5.xdt5ytf.x1iyjqo2.xx6bls6.x889kno > div > div > div:nth-child(2) > div > div > div > div > label:nth-child(7) > div.x9f619.x1n2onr6.x1ja2u2z.x1qjc9v5.x78zum5.xdt5ytf.xl56j7k.xeuugli.xdl72j9.x1iyjqo2.x2lah0s.x1mq37bv.x1pi30zi.x1swvt13.x1gw22gp.x188425o.x19cbwz6.x79zeqe.xgugjxj.x2oemzd > div > div.x9f619.x1n2onr6.x1ja2u2z.xdt5ytf.x2lah0s.x193iq5w.xeuugli.x78zum5 > div > input";
      await page.waitForSelector(checkbox);
      console.log("all time input found");
      // Click the checkbox
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
      }, checkbox);

      // Wait for aria-checked attribute to be 'true'
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
      await page.waitForSelector(divSelector);
      console.log("save button found");
      await page.click(divSelector);
      console.log("save button clicked");
    }

    async function clickFormatJSON() {
      const divSelector =
        "div > div:nth-child(1) > div > div > div > div > div.x78zum5.xdt5ytf.x1iyjqo2 > div > div > div > div > div > div.x1o1ewxj.x3x9cwd.x1e5q0jg.x13rtm0m.x78zum5.xdt5ytf.x1iyjqo2.x1al4vs7 > div > div.xb57i2i.x1q594ok.x5lxg6s.x78zum5.xdt5ytf.x6ikm8r.x1ja2u2z.x1pq812k.x1rohswg.xfk6m8.x1yqm8si.xjx87ck.xx8ngbg.xwo3gff.x1n2onr6.x1oyok0e.x1odjw0f.x1iyjqo2.xy5w88m > div.x78zum5.xdt5ytf.x1iyjqo2.x1n2onr6.xaci4zi.x129vozr > div.x78zum5.xdt5ytf.x1iyjqo2.xx6bls6.x889kno > div > div > div:nth-child(5) > div > div > div > div > div > div:nth-child(3) > div";
      console.log("looking for button");
      await page.waitForSelector(divSelector);
      console.log("button found");
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
      //await page.click(divSelector);
      // Click using page.evaluate
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
      await page.waitForSelector(checkboxJSON);

      // Click the checkbox
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
      }, checkboxJSON);

      // Wait for aria-checked attribute to be 'true'
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
      await page.click(saveDiv);
      console.log("button clicked");
    }

    async function createFiles() {
      const divSelector =
        "div > div:nth-child(1) > div > div > div > div > div.x78zum5.xdt5ytf.x1iyjqo2 > div > div > div > div > div > div.x1o1ewxj.x3x9cwd.x1e5q0jg.x13rtm0m.x78zum5.xdt5ytf.x1iyjqo2.x1al4vs7 > div > div.xlp1x4z.x1ey2m1c.xds687c.x10l6tqk.x17qophe.xv7j57z > div.x6ikm8r.x10wlt62 > div > div > div:nth-child(1) > div > div > div > div";

      await page.waitForSelector(divSelector);
      console.log("found create files button");
      //await page.click(divSelector);
      await page.evaluate(async (selector) => {
        const checkbox = document.querySelector(selector);
        if (checkbox) {
          checkbox.click();
          console.log("div clicked");
          await new Promise((resolve) => setTimeout(resolve, 500)); // Wait for any JavaScript handling
        } else {
          console.log("div not found");
        }
      }, divSelector);
      console.log("clicked create files");
      if (browser) {
        await browser.close();
      }
    }

    await clickContinue();
    await clickDownloadTransferInfo();
    await clickSpecificTypes();
    await clickMessagesAndNext();
    await clickDownloadDeviceAndNext();
    await dateRangeAllTime();
    await clickFormatJSON();
    await createFiles();
    return NextResponse.json({ message: "Automation run successfully" });
  } catch (error) {
    console.error("Error details:", error);
    return NextResponse.json({
      message: "Error running automation",
      error: error.message,
    });
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
