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
    let pk = decodeURIComponent(searchParams.get("pk"));
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

    const pk = decodeURIComponent(searchParams.get("pk"));
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

    const pk = decodeURIComponent(searchParams.get("pk"));
    const domain = decodeURI(searchParams.get("domain"));

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

async function handle_github_lookup(request) {
  try {
    const { gist_lookup } = wasm_bindgen;
    const { searchParams } = new URL(request.url);

    const pk = decodeURIComponent(searchParams.get("pk"));
    const gistId = decodeURIComponent(searchParams.get("gistId"));
    const githubUsername = decodeURIComponent(searchParams.get("handle"));

    await wasm_bindgen(wasm);
    const vc = await gist_lookup(TZPROFILES_ME_PRIVATE_KEY, pk, gistId, githubUsername);

    return new Response(vc, {
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

    let pk = decodeURIComponent(searchParams.get("pk"));
    let handle = searchParams.get("handle");

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

    const vc = await witness_instagram_post(
      TZPROFILES_ME_PRIVATE_KEY,
      pk,
      handle,
      kvObj.link,
      kvObj.sig,
    );

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

    const { handle_instagram_tzp_login } = wasm_bindgen;
    await wasm_bindgen(wasm);

    let kvEntry = await handle_instagram_tzp_login(
      IG_APP_ID,
      IG_APP_SECRET,
      IG_REDIRECT_URI,
      code
    );

    let kvObj = JSON.parse(kvEntry);

    await INSTAGRAM_CLAIM.put(kvObj.key.toLowerCase(), JSON.stringify(kvObj.val));

    const res = `<html>
    <body>
      <p>Instagram claim has been prepared.</p> 
      <p>Please return to the previous page to save it to your profile!</p> 
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
      code: `${Date.now()}`,
      url: `https://tzprofiles.com/instagram-data-deletion`,
    })
  );
}

const igDemoPage = `<html>
<head>
    <title>Instagram Claim Demo</title>
    <link href="https://unpkg.com/tailwindcss@^2/dist/tailwind.min.css" rel="stylesheet">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/uuid/8.3.2/uuid.min.js"
        integrity="sha512-UNM1njAgOFUa74Z0bADwAq8gbTcqZC8Ej4xPSzpnh0l6KMevwvkBvbldF9uR++qKeJ+MOZHRjV1HZjoRvjDfNQ=="
        crossorigin="anonymous" referrerpolicy="no-referrer"></script>
</head>

<body>
    <div>
        <form class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
            <h1>Instagram Account Ownership Witness</h1>
            <div id="sig-cont" class="mb-4">
                <p>1) Paste the following as a line in a post caption (new or edited)</p>
                <pre id="uuid"></pre>
            </div>
            <div id="handle-container" class="mb-4">
                    <label for="handle" class="block text-gray-700 "> 
                      2) Enter Your Instagram Handle
                    </label>
                    <input 
                      type="text" 
                      id="handle" 
                      class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      placeholder="Handle"
                    />
            </div>
            <div id="auth-cont" class="mb-4">
                <p>3)
                    Visit <a 
                        id="outlink"
                        class="font-bold text-sm text-blue-500 hover:text-blue-800"
                        href=""
                        target="_blank">this link</a> to authorize the post look up.
                </p>
            </div>
            <div id="verif-cont" class="mb-4">
                <p>4) Click to verify post contains target caption: <button 
                        class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        id="witness">Witness</button></p>
            </div>
            <div id="verification-result"></div>
        </form>
    </div>
    <script defer>
        function docReady(fn) {
            if (document.readyState === "complete" || document.readyState === "interactive") {
                setTimeout(fn, 1);
            } else {
                document.addEventListener("DOMContentLoaded", fn);
            }
        }
        docReady(() => {
            let button = document.getElementById("witness");
            let uuidElm = document.getElementById("uuid");
            let outlineElm = document.getElementById("outlink");
            let verification = 'uuid:' + uuid.v4();
            let outlink = "https://api.instagram.com/oauth/authorize?client_id=210009324358917&redirect_uri=" + window.location.origin + "/demo_instagram_login&scope=user_profile,user_media&response_type=code"
            uuidElm.innerHTML = verification;
            outlineElm.href = outlink;

            button.onclick = async (e) => {
                e.preventDefault();
                let url = window.location.origin + "/demo_instagram_witness?&handle=" + document.getElementById("handle").value.trim() + "&uuid=" + verification.slice(5)
                let res = await fetch(url);
                if (res.ok) {
                    document.getElementById("verification-result").innerHTML = "Account ownership witnessed!"
                } else {
                    document.getElementById("verification-result").innerHTML = "Verification failed"
                }
            }
        })
    </script>
</body>

</html>`;

async function handler_instagram_demo(_request) {
  return new Response(igDemoPage, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "text/html",
    },
  });
}

async function handler_instagram_demo_login(request) {
  try {
    const { searchParams } = new URL(request.url);

    const code = searchParams.get("code");

    const { handle_demo_instagram_login } = wasm_bindgen;
    await wasm_bindgen(wasm);

    let kvEntry = await handle_demo_instagram_login(
      IG_APP_ID,
      IG_APP_SECRET,
      IG_DEMO_REDIRECT_URI,
      code
    );
    let kvObj = JSON.parse(kvEntry);

    await INSTAGRAM_CLAIM.put(kvObj.key.toLowerCase(), JSON.stringify(kvObj.val));

    const res = `<html>
    <body>
      <p>Instagram account ownership has been verified.</p> 
      <p>Please return to the previous page to redeem your verification proof.</p> 
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

async function handler_instagram_demo_witness(request) {
  try {
    const { searchParams } = new URL(request.url);

    let uuid = decodeURIComponent(searchParams.get("uuid"));
    let handle = searchParams.get("handle");

    let kvEntry = await INSTAGRAM_CLAIM.get(handle.toLowerCase());
    if (!kvEntry) {
      throw new Error(`Could not find claim for ${handle}`);
    }

    let kvObj = JSON.parse(kvEntry);
    if (!kvObj?.link || !kvObj?.sig) {
      throw new Error(`Could not find claim for ${handle}`);
    }

    if (kvObj.sig !== uuid) {
      throw new Error(`Mismatched UUIDs, ${kvObj.sig} v. ${uuid}`)
    }

    return new Response(kvEntry, { status: 200, headers: headers });
  } catch (error) {
    return new Response(JSON.stringify(error), {
      status: 500,
      headers: headers,
    });
  }
}


async function handleRequest(request) {
  const r = new Router();
  r.get("/demo_instagram_ui", (request) => handler_instagram_demo(request));
  r.get("/demo_instagram_login", (request) => handler_instagram_demo_login(request));
  r.get("/demo_instagram_witness", (request) => handler_instagram_demo_witness(request));
  r.get("/witness_tweet", (request) => handler_witness_tweet(request));
  // TODO uncomment when the time has come
  // r.get("/witness_instagram", (request) => handler_witness_instagram_post(request));
  // r.get("/instagram_login", (request) => handler_instagram_login(request));
  // r.get("/instagram_data_deletion", (request) => handler_data_deletion(request));
  // r.get("/instagram-deauth", (request) => handler_data_deletion(request));
  r.get("/witness_discord", (request) => handler_discord_message(request));
  r.get("/witness_dns", (request) => handler_dns_lookup(request));
  r.get("/witness_github", (request) => handle_github_lookup(request));
  const resp = await r.route(request);
  return resp;
}

