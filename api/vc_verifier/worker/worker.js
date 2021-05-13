addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

/**
 * Fetch and log a request
 * @param {Request} request
 */
async function handleRequest(request) {
  if (!request.body) {
    return new Response("Empty body", {status: 400})
  }
  const {verifyCredential} = wasm_bindgen;
  await wasm_bindgen(wasm)
  return request.text().then(body => {
    return verifyCredential(body, "{}").then(result => {
      const resultJSON = JSON.parse(result)
      if (resultJSON.errors.length > 0) {
        return new Response(JSON.stringify(resultJSON.errors), {status: 400})
      } else {
        return new Response("", {status: 200})
      }
    }).catch(e => {
      return new Response(e, {status: 500})
    })
  })
}
