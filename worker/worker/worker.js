/**
 * Helper functions that when passed a request will return a
 * boolean indicating if the request uses that HTTP method,
 * header, host or referrer.
 */
const Method = method => req =>
  req.method.toLowerCase() === method.toLowerCase()
const Connect = Method('connect')
const Delete = Method('delete')
const Get = Method('get')
const Head = Method('head')
const Options = Method('options')
const Patch = Method('patch')
const Post = Method('post')
const Put = Method('put')
const Trace = Method('trace')

const Header = (header, val) => req => req.headers.get(header) === val
const Host = host => Header('host', host.toLowerCase())
const Referrer = host => Header('referrer', host.toLowerCase())

const Path = regExp => req => {
  const url = new URL(req.url)
  const path = url.pathname
  const match = path.match(regExp) || []
  return match[0] === path
}

/**
 * The Router handles determines which handler is matched given the
 * conditions present for each request.
 */
class Router {
  constructor() {
    this.routes = []
  }

  handle(conditions, handler) {
    this.routes.push({
      conditions,
      handler,
    })
    return this
  }

  connect(url, handler) {
    return this.handle([Connect, Path(url)], handler)
  }

  delete(url, handler) {
    return this.handle([Delete, Path(url)], handler)
  }

  get(url, handler) {
    return this.handle([Get, Path(url)], handler)
  }

  head(url, handler) {
    return this.handle([Head, Path(url)], handler)
  }

  options(url, handler) {
    return this.handle([Options, Path(url)], handler)
  }

  patch(url, handler) {
    return this.handle([Patch, Path(url)], handler)
  }

  post(url, handler) {
    return this.handle([Post, Path(url)], handler)
  }

  put(url, handler) {
    return this.handle([Put, Path(url)], handler)
  }

  trace(url, handler) {
    return this.handle([Trace, Path(url)], handler)
  }

  all(handler) {
    return this.handle([], handler)
  }

  route(req) {
    const route = this.resolve(req)

    if (route) {
      return route.handler(req)
    }

    return new Response('resource not found', {
      status: 404,
      statusText: 'not found',
      headers: {
        'content-type': 'text/plain',
      },
    })
  }

  /**
   * resolve returns the matching route for a request that returns
   * true for all conditions (if any).
   */
  resolve(req) {
    return this.routes.find(r => {
      if (!r.conditions || (Array.isArray(r) && !r.conditions.length)) {
        return true
      }

      if (typeof r.conditions === 'function') {
        return r.conditions(req)
      }

      return r.conditions.every(c => c(req))
    })
  }
}

const headers = new Headers({
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*'
})

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handler_tweet_sig_target(request) {
  try {
    const {searchParams} = new URL(request.url)
    let pk = decodeURI(searchParams.get('pk'))
    let handle = searchParams.get('handle')
    const {build_vc} = wasm_bindgen;
    await wasm_bindgen(wasm)
    const sig_target = build_vc(pk, handle)
    return new Response(sig_target, {status: 200, headers: headers})
  } catch (error) {
    return new Response(error, {status: 500, headers: headers})
  }
}

async function handler_witness_tweet(request) {
  try {
    const {searchParams} = new URL(request.url)
    let pk = decodeURI(searchParams.get('pk'))
    let handle = searchParams.get('handle')
    let tweet_id = searchParams.get('tweet_id')
    const {witness_tweet} = wasm_bindgen;
    await wasm_bindgen(wasm)
    const vc = await witness_tweet(TZPROFILES_ME_PRIVATE_KEY, pk, TWITTER_BEARER_TOKEN, handle, tweet_id)
    return new Response(vc, {status: 200, headers: headers})
  } catch (error) {
    return new Response(error, {status: 500, headers: headers})
  }
}

async function handleRequest(request) {
  const r = new Router()
  r.get('/tweet_sig_target', request => handler_tweet_sig_target(request))
  r.get('/witness_tweet', request => handler_witness_tweet(request))
  const resp = await r.route(request)
  return resp
}