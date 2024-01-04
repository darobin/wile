/* global browser */

console.warn(`in UR bg — secure: ${window.isSecureContext}, sw: ${navigator.serviceWorker}`);

function listener (details) {
  return { redirectUrl: 'https://cv.berjon.com/' };
  // let filter = browser.webRequest.filterResponseData(details.requestId);
  // let decoder = new TextDecoder("utf-8");
  // let encoder = new TextEncoder();

  // filter.ondata = (event) => {
  //   let str = decoder.decode(event.data, { stream: true });
  //   // Just change any instance of Example in the HTTP response
  //   // to WebExtension Example.
  //   str = str.replace(/Robin/g, "Fuckwit");
  //   filter.write(encoder.encode(str));
  //   filter.disconnect();
  // };
  // console.warn(`in listener`);
  // return {};
}

browser.webRequest.onBeforeRequest.addListener(
  listener,
  {
    urls: [
      `${browser.extension.getURL("")}*`,
      "https://2017.im/*",
      "https://*.2017.im/*",
    ],
  },
  ["blocking"]
);
