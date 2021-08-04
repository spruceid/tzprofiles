/**
 * Helper functions that when passed a request will return a
 * boolean indicating if the request uses that HTTP method,
 * header, host or referrer.
 */
const Method = (method) => (req) => req.method.toLowerCase() === method.toLowerCase();
const Connect = Method("connect");
const Delete = Method("delete");
const Get = Method("get");
const Head = Method("head");
const Options = Method("options");
const Patch = Method("patch");
const Post = Method("post");
const Put = Method("put");
const Trace = Method("trace");

const Header = (header, val) => (req) => req.headers.get(header) === val;
const Host = (host) => Header("host", host.toLowerCase());
const Referrer = (host) => Header("referrer", host.toLowerCase());

const Path = (regExp) => (req) => {
  const url = new URL(req.url);
  const path = url.pathname;
  const match = path.match(regExp) || [];
  return match[0] === path;
};

/**
 * The Router handles determines which handler is matched given the
 * conditions present for each request.
 */
class Router {
  constructor() {
    this.routes = [];
  }

  handle(conditions, handler) {
    this.routes.push({
      conditions,
      handler,
    });
    return this;
  }

  connect(url, handler) {
    return this.handle([Connect, Path(url)], handler);
  }

  delete(url, handler) {
    return this.handle([Delete, Path(url)], handler);
  }

  get(url, handler) {
    return this.handle([Get, Path(url)], handler);
  }

  head(url, handler) {
    return this.handle([Head, Path(url)], handler);
  }

  options(url, handler) {
    return this.handle([Options, Path(url)], handler);
  }

  patch(url, handler) {
    return this.handle([Patch, Path(url)], handler);
  }

  post(url, handler) {
    return this.handle([Post, Path(url)], handler);
  }

  put(url, handler) {
    return this.handle([Put, Path(url)], handler);
  }

  trace(url, handler) {
    return this.handle([Trace, Path(url)], handler);
  }

  all(handler) {
    return this.handle([], handler);
  }

  route(req) {
    const route = this.resolve(req);

    if (route) {
      return route.handler(req);
    }

    return new Response("resource not found", {
      status: 404,
      statusText: "not found",
      headers: {
        "content-type": "text/plain",
      },
    });
  }

  /**
   * resolve returns the matching route for a request that returns
   * true for all conditions (if any).
   */
  resolve(req) {
    return this.routes.find((r) => {
      if (!r.conditions || (Array.isArray(r) && !r.conditions.length)) {
        return true;
      }

      if (typeof r.conditions === "function") {
        return r.conditions(req);
      }

      return r.conditions.every((c) => c(req));
    });
  }
}

const headers = new Headers({
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,OPTIONS",
  "Access-Control-Max-Age": "86400",
};

addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method === "OPTIONS") {
    // Handle CORS preflight requests
    event.respondWith(handleOptions(request));
  } else {
    event.respondWith(handleRequest(request));
  }
});

function handleOptions(request) {
  // Make sure the necessary headers are present
  // for this to be a valid pre-flight request
  let headers = request.headers;
  if (headers.get("Origin") !== null && headers.get("Access-Control-Request-Method") !== null && headers.get("Access-Control-Request-Headers") !== null) {
    // Handle CORS pre-flight request.
    // If you want to check or reject the requested method + headers
    // you can do that here.
    let respHeaders = {
      ...corsHeaders,
      // Allow all future content Request headers to go back to browser
      // such as Authorization (Bearer) or X-Client-Name-Version
      "Access-Control-Allow-Headers": request.headers.get("Access-Control-Request-Headers"),
    };

    return new Response(null, {
      headers: respHeaders,
    });
  } else {
    // Handle standard OPTIONS request.
    // If you want to allow other HTTP Methods, you can do that here.
    return new Response(null, {
      headers: {
        Allow: "GET, OPTIONS",
      },
    });
  }
}

async function handler_witness_tweet(request) {
  try {
    const { searchParams } = new URL(request.url);
    let pk = decodeURI(searchParams.get("pk"));
    let handle = searchParams.get("handle");
    let tweet_id = searchParams.get("tweet_id");
    const { witness_tweet } = wasm_bindgen;
    await wasm_bindgen(wasm);
    const vc = await witness_tweet(TZPROFILES_ME_PRIVATE_KEY, pk, TWITTER_BEARER_TOKEN, handle, tweet_id);
    return new Response(vc, { status: 200, headers: headers });
  } catch (error) {
    return new Response(error, { status: 500, headers: headers });
  }
}

async function handler_discord_message(request) {
  try {
    const { witness_discord } = wasm_bindgen;
    const { searchParams } = new URL(request.url);

    const pk = decodeURI(searchParams.get("pk"));
    const message_id = searchParams.get("messageId");
    const channel_id = searchParams.get("channelId");
    const discord_handle = searchParams.get("discordHandle");

    await wasm_bindgen(wasm);
    const discordVc = await witness_discord(TZPROFILES_ME_PRIVATE_KEY, pk, DISCORD_AUTHORIZATION_TOKEN, discord_handle, channel_id, message_id);

    return new Response(JSON.stringify(discordVc), {
      status: 200,
      headers: headers,
    });
  } catch (error) {
    return new Response(error, { status: 500, headers: headers });
  }
}

async function handler_dns_lookup(request) {
  try {
    const { dns_lookup } = wasm_bindgen;
    const { searchParams } = new URL(request.url);

    const pk = decodeURI(searchParams.get("pk"));

    let domain = decodeURI(searchParams.get("domain"));

    await wasm_bindgen(wasm);
    const dns_vc = await dns_lookup(TZPROFILES_ME_PRIVATE_KEY, pk, domain);

    return new Response(JSON.stringify(dns_vc), {
      status: 200,
      headers: headers,
    });
  } catch (error) {
    return new Response(error, { status: 500, headers: headers });
  }
}

async function handler_witness_instagram_post(request) {
  try {
    const { searchParams } = new URL(request.url);

    let pk = decodeURI(searchParams.get("pk"));
    let handle = searchParams.get("handle");
    let sig_type = searchParams.get("sig_type");

    let kvEntry = await INSTAGRAM_CLAIM.get(handle.toLowerCase());
    if (!kvEntry) {
      throw new Error(`Could not find claim for ${handle}`);
    }

    let kvObj = JSON.parse(kvEntry);
    if (!kvObj?.link || !kvObj?.sig) {
      throw new Error(`Could not find claim for ${handle}`);
    }

    const { witness_instagram_post } = wasm_bindgen;
    await wasm_bindgen(wasm);

    const vc = await witness_instagram_post(TZPROFILES_ME_PRIVATE_KEY, pk, handle, kvObj.link, kvObj.sig, sig_type);

    return new Response(vc, { status: 200, headers: headers });
  } catch (error) {
    return new Response(JSON.stringify(error), {
      status: 500,
      headers: headers,
    });
  }
}

async function handler_instagram_login(request) {
  try {
    const { searchParams } = new URL(request.url);

    const code = searchParams.get("code");

    const { handle_instagram_login } = wasm_bindgen;
    await wasm_bindgen(wasm);

    let kvEntry = await handle_instagram_login(IG_APP_ID, IG_APP_SECRET, IG_REDIRECT_URI, code);
    let kvObj = JSON.parse(kvEntry);

    await INSTAGRAM_CLAIM.put(kvObj.key.toLowerCase(), JSON.stringify(kvObj.val));

    const res = `<html>
    <body>
      <p>Instagram claim has been prepared.</p> 
      <p>Please return to Tezos Profiles to save it to your profile!</p> 
    </body>
</html>`;

    return new Response(res, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "text/html",
      },
    });
  } catch (error) {
    let res = {
      message: error?.message || error,
    };

    return new Response(JSON.stringify(res), { status: 500, headers: headers });
  }
}

async function handler_data_deletion(request) {
  return new Response(
    JSON.stringify({
      code: `${+new Date.now()}`,
      url: `https://tzprofiles.com/instagram-data-deletion`,
    })
  );
}

async function handleRequest(request) {
  const r = new Router();
  r.get("/witness_tweet", (request) => handler_witness_tweet(request));
  r.get("/witness_instagram_post", (request) => handler_witness_instagram_post(request));
  r.get("/instagram_login", (request) => handler_instagram_login(request));
  r.get("/instagram_data_deletion", (request) => handler_data_deletion(request));
  r.get("/instagram-deauth", (request) => handler_data_deletion(request));
  r.get("/witness_discord", (request) => handler_discord_message(request));
  r.get("/dns_lookup", (request) => handler_dns_lookup(request));
  const resp = await r.route(request);
  return resp;
}
