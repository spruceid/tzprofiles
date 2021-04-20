let wasm;

let cachedTextDecoder = new TextDecoder('utf-8', {
  ignoreBOM: true,
  fatal: true,
});

cachedTextDecoder.decode();

let cachegetUint8Memory0 = null;
function getUint8Memory0() {
  if (
    cachegetUint8Memory0 === null ||
    cachegetUint8Memory0.buffer !== wasm.memory.buffer
  ) {
    cachegetUint8Memory0 = new Uint8Array(wasm.memory.buffer);
  }
  return cachegetUint8Memory0;
}

function getStringFromWasm0(ptr, len) {
  return cachedTextDecoder.decode(getUint8Memory0().subarray(ptr, ptr + len));
}

const heap = new Array(32).fill(undefined);

heap.push(undefined, null, true, false);

let heap_next = heap.length;

function addHeapObject(obj) {
  if (heap_next === heap.length) heap.push(heap.length + 1);
  const idx = heap_next;
  heap_next = heap[idx];

  heap[idx] = obj;
  return idx;
}

function getObject(idx) {
  return heap[idx];
}

function dropObject(idx) {
  if (idx < 36) return;
  heap[idx] = heap_next;
  heap_next = idx;
}

function takeObject(idx) {
  const ret = getObject(idx);
  dropObject(idx);
  return ret;
}

let WASM_VECTOR_LEN = 0;

let cachedTextEncoder = new TextEncoder('utf-8');

const encodeString =
  typeof cachedTextEncoder.encodeInto === 'function'
    ? function (arg, view) {
        return cachedTextEncoder.encodeInto(arg, view);
      }
    : function (arg, view) {
        const buf = cachedTextEncoder.encode(arg);
        view.set(buf);
        return {
          read: arg.length,
          written: buf.length,
        };
      };

function passStringToWasm0(arg, malloc, realloc) {
  if (realloc === undefined) {
    const buf = cachedTextEncoder.encode(arg);
    const ptr = malloc(buf.length);
    getUint8Memory0()
      .subarray(ptr, ptr + buf.length)
      .set(buf);
    WASM_VECTOR_LEN = buf.length;
    return ptr;
  }

  let len = arg.length;
  let ptr = malloc(len);

  const mem = getUint8Memory0();

  let offset = 0;

  for (; offset < len; offset++) {
    const code = arg.charCodeAt(offset);
    if (code > 0x7f) break;
    mem[ptr + offset] = code;
  }

  if (offset !== len) {
    if (offset !== 0) {
      arg = arg.slice(offset);
    }
    ptr = realloc(ptr, len, (len = offset + arg.length * 3));
    const view = getUint8Memory0().subarray(ptr + offset, ptr + len);
    const ret = encodeString(arg, view);

    offset += ret.written;
  }

  WASM_VECTOR_LEN = offset;
  return ptr;
}

let cachegetInt32Memory0 = null;
function getInt32Memory0() {
  if (
    cachegetInt32Memory0 === null ||
    cachegetInt32Memory0.buffer !== wasm.memory.buffer
  ) {
    cachegetInt32Memory0 = new Int32Array(wasm.memory.buffer);
  }
  return cachegetInt32Memory0;
}

function debugString(val) {
  // primitive types
  const type = typeof val;
  if (type == 'number' || type == 'boolean' || val == null) {
    return `${val}`;
  }
  if (type == 'string') {
    return `"${val}"`;
  }
  if (type == 'symbol') {
    const description = val.description;
    if (description == null) {
      return 'Symbol';
    } else {
      return `Symbol(${description})`;
    }
  }
  if (type == 'function') {
    const name = val.name;
    if (typeof name == 'string' && name.length > 0) {
      return `Function(${name})`;
    } else {
      return 'Function';
    }
  }
  // objects
  if (Array.isArray(val)) {
    const length = val.length;
    let debug = '[';
    if (length > 0) {
      debug += debugString(val[0]);
    }
    for (let i = 1; i < length; i++) {
      debug += ', ' + debugString(val[i]);
    }
    debug += ']';
    return debug;
  }
  // Test for built-in
  const builtInMatches = /\[object ([^\]]+)\]/.exec(toString.call(val));
  let className;
  if (builtInMatches.length > 1) {
    className = builtInMatches[1];
  } else {
    // Failed to match the standard '[object ClassName]'
    return toString.call(val);
  }
  if (className == 'Object') {
    // we're a user defined class or Object
    // JSON.stringify avoids problems with cycles, and is generally much
    // easier than looping through ownProperties of `val`.
    try {
      return 'Object(' + JSON.stringify(val) + ')';
    } catch (_) {
      return 'Object';
    }
  }
  // errors
  if (val instanceof Error) {
    return `${val.name}: ${val.message}\n${val.stack}`;
  }
  // TODO we could test for more things here, like `Set`s and `Map`s.
  return className;
}

function makeMutClosure(arg0, arg1, dtor, f) {
  const state = { a: arg0, b: arg1, cnt: 1, dtor };
  const real = (...args) => {
    // First up with a closure we increment the internal reference
    // count. This ensures that the Rust closure environment won't
    // be deallocated while we're invoking it.
    state.cnt++;
    const a = state.a;
    state.a = 0;
    try {
      return f(a, state.b, ...args);
    } finally {
      if (--state.cnt === 0) {
        wasm.__wbindgen_export_2.get(state.dtor)(a, state.b);
      } else {
        state.a = a;
      }
    }
  };
  real.original = state;

  return real;
}
function __wbg_adapter_26(arg0, arg1, arg2) {
  wasm._dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h5259db2c487d9b42(
    arg0,
    arg1,
    addHeapObject(arg2)
  );
}

/**
 * @returns {string}
 */
export function getVersion() {
  try {
    const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
    wasm.getVersion(retptr);
    var r0 = getInt32Memory0()[retptr / 4 + 0];
    var r1 = getInt32Memory0()[retptr / 4 + 1];
    return getStringFromWasm0(r0, r1);
  } finally {
    wasm.__wbindgen_add_to_stack_pointer(16);
    wasm.__wbindgen_free(r0, r1);
  }
}

/**
 * @param {string} did
 * @param {string} input_metadata
 * @returns {Promise<any>}
 */
export function resolveDID(did, input_metadata) {
  var ptr0 = passStringToWasm0(
    did,
    wasm.__wbindgen_malloc,
    wasm.__wbindgen_realloc
  );
  var len0 = WASM_VECTOR_LEN;
  var ptr1 = passStringToWasm0(
    input_metadata,
    wasm.__wbindgen_malloc,
    wasm.__wbindgen_realloc
  );
  var len1 = WASM_VECTOR_LEN;
  var ret = wasm.resolveDID(ptr0, len0, ptr1, len1);
  return takeObject(ret);
}

/**
 * @returns {string}
 */
export function generateEd25519Key() {
  try {
    const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
    wasm.generateEd25519Key(retptr);
    var r0 = getInt32Memory0()[retptr / 4 + 0];
    var r1 = getInt32Memory0()[retptr / 4 + 1];
    return getStringFromWasm0(r0, r1);
  } finally {
    wasm.__wbindgen_add_to_stack_pointer(16);
    wasm.__wbindgen_free(r0, r1);
  }
}

/**
 * @param {string} method_pattern
 * @param {string} jwk
 * @returns {string}
 */
export function keyToDID(method_pattern, jwk) {
  try {
    const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
    var ptr0 = passStringToWasm0(
      method_pattern,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc
    );
    var len0 = WASM_VECTOR_LEN;
    var ptr1 = passStringToWasm0(
      jwk,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc
    );
    var len1 = WASM_VECTOR_LEN;
    wasm.keyToDID(retptr, ptr0, len0, ptr1, len1);
    var r0 = getInt32Memory0()[retptr / 4 + 0];
    var r1 = getInt32Memory0()[retptr / 4 + 1];
    return getStringFromWasm0(r0, r1);
  } finally {
    wasm.__wbindgen_add_to_stack_pointer(16);
    wasm.__wbindgen_free(r0, r1);
  }
}

/**
 * @param {string} method_pattern
 * @param {string} jwk
 * @returns {Promise<any>}
 */
export function keyToVerificationMethod(method_pattern, jwk) {
  var ptr0 = passStringToWasm0(
    method_pattern,
    wasm.__wbindgen_malloc,
    wasm.__wbindgen_realloc
  );
  var len0 = WASM_VECTOR_LEN;
  var ptr1 = passStringToWasm0(
    jwk,
    wasm.__wbindgen_malloc,
    wasm.__wbindgen_realloc
  );
  var len1 = WASM_VECTOR_LEN;
  var ret = wasm.keyToVerificationMethod(ptr0, len0, ptr1, len1);
  return takeObject(ret);
}

/**
 * @param {string} credential
 * @param {string} linked_data_proof_options
 * @param {string} key
 * @returns {Promise<any>}
 */
export function issueCredential(credential, linked_data_proof_options, key) {
  var ptr0 = passStringToWasm0(
    credential,
    wasm.__wbindgen_malloc,
    wasm.__wbindgen_realloc
  );
  var len0 = WASM_VECTOR_LEN;
  var ptr1 = passStringToWasm0(
    linked_data_proof_options,
    wasm.__wbindgen_malloc,
    wasm.__wbindgen_realloc
  );
  var len1 = WASM_VECTOR_LEN;
  var ptr2 = passStringToWasm0(
    key,
    wasm.__wbindgen_malloc,
    wasm.__wbindgen_realloc
  );
  var len2 = WASM_VECTOR_LEN;
  var ret = wasm.issueCredential(ptr0, len0, ptr1, len1, ptr2, len2);
  return takeObject(ret);
}

/**
 * @param {string} credential
 * @param {string} linked_data_proof_options
 * @param {string} public_key
 * @returns {Promise<any>}
 */
export function prepareIssueCredential(
  credential,
  linked_data_proof_options,
  public_key
) {
  var ptr0 = passStringToWasm0(
    credential,
    wasm.__wbindgen_malloc,
    wasm.__wbindgen_realloc
  );
  var len0 = WASM_VECTOR_LEN;
  var ptr1 = passStringToWasm0(
    linked_data_proof_options,
    wasm.__wbindgen_malloc,
    wasm.__wbindgen_realloc
  );
  var len1 = WASM_VECTOR_LEN;
  var ptr2 = passStringToWasm0(
    public_key,
    wasm.__wbindgen_malloc,
    wasm.__wbindgen_realloc
  );
  var len2 = WASM_VECTOR_LEN;
  var ret = wasm.prepareIssueCredential(ptr0, len0, ptr1, len1, ptr2, len2);
  return takeObject(ret);
}

/**
 * @param {string} credential
 * @param {string} preparation
 * @param {string} signature
 * @returns {Promise<any>}
 */
export function completeIssueCredential(credential, preparation, signature) {
  var ptr0 = passStringToWasm0(
    credential,
    wasm.__wbindgen_malloc,
    wasm.__wbindgen_realloc
  );
  var len0 = WASM_VECTOR_LEN;
  var ptr1 = passStringToWasm0(
    preparation,
    wasm.__wbindgen_malloc,
    wasm.__wbindgen_realloc
  );
  var len1 = WASM_VECTOR_LEN;
  var ptr2 = passStringToWasm0(
    signature,
    wasm.__wbindgen_malloc,
    wasm.__wbindgen_realloc
  );
  var len2 = WASM_VECTOR_LEN;
  var ret = wasm.completeIssueCredential(ptr0, len0, ptr1, len1, ptr2, len2);
  return takeObject(ret);
}

/**
 * @param {string} vc
 * @param {string} linked_data_proof_options
 * @returns {Promise<any>}
 */
export function verifyCredential(vc, linked_data_proof_options) {
  var ptr0 = passStringToWasm0(
    vc,
    wasm.__wbindgen_malloc,
    wasm.__wbindgen_realloc
  );
  var len0 = WASM_VECTOR_LEN;
  var ptr1 = passStringToWasm0(
    linked_data_proof_options,
    wasm.__wbindgen_malloc,
    wasm.__wbindgen_realloc
  );
  var len1 = WASM_VECTOR_LEN;
  var ret = wasm.verifyCredential(ptr0, len0, ptr1, len1);
  return takeObject(ret);
}

/**
 * @param {string} presentation
 * @param {string} linked_data_proof_options
 * @param {string} key
 * @returns {Promise<any>}
 */
export function issuePresentation(
  presentation,
  linked_data_proof_options,
  key
) {
  var ptr0 = passStringToWasm0(
    presentation,
    wasm.__wbindgen_malloc,
    wasm.__wbindgen_realloc
  );
  var len0 = WASM_VECTOR_LEN;
  var ptr1 = passStringToWasm0(
    linked_data_proof_options,
    wasm.__wbindgen_malloc,
    wasm.__wbindgen_realloc
  );
  var len1 = WASM_VECTOR_LEN;
  var ptr2 = passStringToWasm0(
    key,
    wasm.__wbindgen_malloc,
    wasm.__wbindgen_realloc
  );
  var len2 = WASM_VECTOR_LEN;
  var ret = wasm.issuePresentation(ptr0, len0, ptr1, len1, ptr2, len2);
  return takeObject(ret);
}

/**
 * @param {string} vp
 * @param {string} linked_data_proof_options
 * @returns {Promise<any>}
 */
export function verifyPresentation(vp, linked_data_proof_options) {
  var ptr0 = passStringToWasm0(
    vp,
    wasm.__wbindgen_malloc,
    wasm.__wbindgen_realloc
  );
  var len0 = WASM_VECTOR_LEN;
  var ptr1 = passStringToWasm0(
    linked_data_proof_options,
    wasm.__wbindgen_malloc,
    wasm.__wbindgen_realloc
  );
  var len1 = WASM_VECTOR_LEN;
  var ret = wasm.verifyPresentation(ptr0, len0, ptr1, len1);
  return takeObject(ret);
}

/**
 * @param {string} holder
 * @param {string} linked_data_proof_options
 * @param {string} key
 * @returns {Promise<any>}
 */
export function DIDAuth(holder, linked_data_proof_options, key) {
  var ptr0 = passStringToWasm0(
    holder,
    wasm.__wbindgen_malloc,
    wasm.__wbindgen_realloc
  );
  var len0 = WASM_VECTOR_LEN;
  var ptr1 = passStringToWasm0(
    linked_data_proof_options,
    wasm.__wbindgen_malloc,
    wasm.__wbindgen_realloc
  );
  var len1 = WASM_VECTOR_LEN;
  var ptr2 = passStringToWasm0(
    key,
    wasm.__wbindgen_malloc,
    wasm.__wbindgen_realloc
  );
  var len2 = WASM_VECTOR_LEN;
  var ret = wasm.DIDAuth(ptr0, len0, ptr1, len1, ptr2, len2);
  return takeObject(ret);
}

/**
 * @param {string} tz
 * @returns {Promise<any>}
 */
export function JWKFromTezos(tz) {
  var ptr0 = passStringToWasm0(
    tz,
    wasm.__wbindgen_malloc,
    wasm.__wbindgen_realloc
  );
  var len0 = WASM_VECTOR_LEN;
  var ret = wasm.JWKFromTezos(ptr0, len0);
  return takeObject(ret);
}

function handleError(f) {
  return function () {
    try {
      return f.apply(this, arguments);
    } catch (e) {
      wasm.__wbindgen_exn_store(addHeapObject(e));
    }
  };
}

function getArrayU8FromWasm0(ptr, len) {
  return getUint8Memory0().subarray(ptr / 1, ptr / 1 + len);
}
function __wbg_adapter_98(arg0, arg1, arg2, arg3) {
  wasm.wasm_bindgen__convert__closures__invoke2_mut__h761989ca316c0cf3(
    arg0,
    arg1,
    addHeapObject(arg2),
    addHeapObject(arg3)
  );
}

async function load(module, imports) {
  if (typeof Response === 'function' && module instanceof Response) {
    if (typeof WebAssembly.instantiateStreaming === 'function') {
      try {
        return await WebAssembly.instantiateStreaming(module, imports);
      } catch (e) {
        if (module.headers.get('Content-Type') != 'application/wasm') {
          console.warn(
            '`WebAssembly.instantiateStreaming` failed because your server does not serve wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n',
            e
          );
        } else {
          throw e;
        }
      }
    }

    const bytes = await module.arrayBuffer();
    return await WebAssembly.instantiate(bytes, imports);
  } else {
    const instance = await WebAssembly.instantiate(module, imports);

    if (instance instanceof WebAssembly.Instance) {
      return { instance, module };
    } else {
      return instance;
    }
  }
}

async function init(input) {
  if (typeof input === 'undefined') {
    input = new URL('didkit_wasm_bg.wasm', import.meta.url);
  }
  const imports = {};
  imports.wbg = {};
  imports.wbg.__wbindgen_string_new = function (arg0, arg1) {
    var ret = getStringFromWasm0(arg0, arg1);
    return addHeapObject(ret);
  };
  imports.wbg.__wbindgen_object_drop_ref = function (arg0) {
    takeObject(arg0);
  };
  imports.wbg.__wbindgen_json_serialize = function (arg0, arg1) {
    const obj = getObject(arg1);
    var ret = JSON.stringify(obj === undefined ? null : obj);
    var ptr0 = passStringToWasm0(
      ret,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc
    );
    var len0 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len0;
    getInt32Memory0()[arg0 / 4 + 0] = ptr0;
  };
  imports.wbg.__wbindgen_cb_drop = function (arg0) {
    const obj = takeObject(arg0).original;
    if (obj.cnt-- == 1) {
      obj.a = 0;
      return true;
    }
    var ret = false;
    return ret;
  };
  imports.wbg.__wbindgen_object_clone_ref = function (arg0) {
    var ret = getObject(arg0);
    return addHeapObject(ret);
  };
  imports.wbg.__wbg_fetch_01d048dd000bcda1 = function (arg0) {
    var ret = fetch(getObject(arg0));
    return addHeapObject(ret);
  };
  imports.wbg.__wbg_fetch_b45fb8bac0b4bf9a = function (arg0, arg1) {
    var ret = getObject(arg0).fetch(getObject(arg1));
    return addHeapObject(ret);
  };
  imports.wbg.__wbg_new_292b80706a9c24b1 = handleError(function () {
    var ret = new Headers();
    return addHeapObject(ret);
  });
  imports.wbg.__wbg_append_f8160687f3d187c8 = handleError(function (
    arg0,
    arg1,
    arg2,
    arg3,
    arg4
  ) {
    getObject(arg0).append(
      getStringFromWasm0(arg1, arg2),
      getStringFromWasm0(arg3, arg4)
    );
  });
  imports.wbg.__wbg_instanceof_Response_8295bf7aacde3233 = function (arg0) {
    var ret = getObject(arg0) instanceof Response;
    return ret;
  };
  imports.wbg.__wbg_url_0d028e72d84a1b8b = function (arg0, arg1) {
    var ret = getObject(arg1).url;
    var ptr0 = passStringToWasm0(
      ret,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc
    );
    var len0 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len0;
    getInt32Memory0()[arg0 / 4 + 0] = ptr0;
  };
  imports.wbg.__wbg_status_5580a898717a7097 = function (arg0) {
    var ret = getObject(arg0).status;
    return ret;
  };
  imports.wbg.__wbg_headers_f36154094992b8f5 = function (arg0) {
    var ret = getObject(arg0).headers;
    return addHeapObject(ret);
  };
  imports.wbg.__wbg_arrayBuffer_a98df6d58bb5ea26 = handleError(function (arg0) {
    var ret = getObject(arg0).arrayBuffer();
    return addHeapObject(ret);
  });
  imports.wbg.__wbg_newwithstrandinit_a58924208f457f33 = handleError(function (
    arg0,
    arg1,
    arg2
  ) {
    var ret = new Request(getStringFromWasm0(arg0, arg1), getObject(arg2));
    return addHeapObject(ret);
  });
  imports.wbg.__wbg_self_86b4b13392c7af56 = handleError(function () {
    var ret = self.self;
    return addHeapObject(ret);
  });
  imports.wbg.__wbg_static_accessor_MODULE_452b4680e8614c81 = function () {
    var ret = module;
    return addHeapObject(ret);
  };
  imports.wbg.__wbg_require_f5521a5b85ad2542 = function (arg0, arg1, arg2) {
    var ret = getObject(arg0).require(getStringFromWasm0(arg1, arg2));
    return addHeapObject(ret);
  };
  imports.wbg.__wbg_crypto_b8c92eaac23d0d80 = function (arg0) {
    var ret = getObject(arg0).crypto;
    return addHeapObject(ret);
  };
  imports.wbg.__wbg_msCrypto_9ad6677321a08dd8 = function (arg0) {
    var ret = getObject(arg0).msCrypto;
    return addHeapObject(ret);
  };
  imports.wbg.__wbindgen_is_undefined = function (arg0) {
    var ret = getObject(arg0) === undefined;
    return ret;
  };
  imports.wbg.__wbg_getRandomValues_dd27e6b0652b3236 = function (arg0) {
    var ret = getObject(arg0).getRandomValues;
    return addHeapObject(ret);
  };
  imports.wbg.__wbg_getRandomValues_e57c9b75ddead065 = function (arg0, arg1) {
    getObject(arg0).getRandomValues(getObject(arg1));
  };
  imports.wbg.__wbg_randomFillSync_d2ba53160aec6aba = function (
    arg0,
    arg1,
    arg2
  ) {
    getObject(arg0).randomFillSync(getArrayU8FromWasm0(arg1, arg2));
  };
  imports.wbg.__wbindgen_is_function = function (arg0) {
    var ret = typeof getObject(arg0) === 'function';
    return ret;
  };
  imports.wbg.__wbindgen_is_object = function (arg0) {
    const val = getObject(arg0);
    var ret = typeof val === 'object' && val !== null;
    return ret;
  };
  imports.wbg.__wbg_next_af8c20b8c0d81345 = function (arg0) {
    var ret = getObject(arg0).next;
    return addHeapObject(ret);
  };
  imports.wbg.__wbg_next_9d10ccb28a5fd327 = handleError(function (arg0) {
    var ret = getObject(arg0).next();
    return addHeapObject(ret);
  });
  imports.wbg.__wbg_done_faa42c8d1dd8ca9e = function (arg0) {
    var ret = getObject(arg0).done;
    return ret;
  };
  imports.wbg.__wbg_value_9befa7ab4a7326bf = function (arg0) {
    var ret = getObject(arg0).value;
    return addHeapObject(ret);
  };
  imports.wbg.__wbg_iterator_de2adb40693c8c47 = function () {
    var ret = Symbol.iterator;
    return addHeapObject(ret);
  };
  imports.wbg.__wbg_get_0c6963cbab34fbb6 = handleError(function (arg0, arg1) {
    var ret = Reflect.get(getObject(arg0), getObject(arg1));
    return addHeapObject(ret);
  });
  imports.wbg.__wbg_call_cb478d88f3068c91 = handleError(function (arg0, arg1) {
    var ret = getObject(arg0).call(getObject(arg1));
    return addHeapObject(ret);
  });
  imports.wbg.__wbg_newnoargs_3efc7bfa69a681f9 = function (arg0, arg1) {
    var ret = new Function(getStringFromWasm0(arg0, arg1));
    return addHeapObject(ret);
  };
  imports.wbg.__wbg_call_f5e0576f61ee7461 = handleError(function (
    arg0,
    arg1,
    arg2
  ) {
    var ret = getObject(arg0).call(getObject(arg1), getObject(arg2));
    return addHeapObject(ret);
  });
  imports.wbg.__wbg_getTime_135e6afc6013ba72 = function (arg0) {
    var ret = getObject(arg0).getTime();
    return ret;
  };
  imports.wbg.__wbg_new0_8e8ab0e7714cf1dd = function () {
    var ret = new Date();
    return addHeapObject(ret);
  };
  imports.wbg.__wbg_new_d14bf16e62c6b3d5 = function () {
    var ret = new Object();
    return addHeapObject(ret);
  };
  imports.wbg.__wbg_new_3ea8490cd276c848 = function (arg0, arg1) {
    try {
      var state0 = { a: arg0, b: arg1 };
      var cb0 = (arg0, arg1) => {
        const a = state0.a;
        state0.a = 0;
        try {
          return __wbg_adapter_98(a, state0.b, arg0, arg1);
        } finally {
          state0.a = a;
        }
      };
      var ret = new Promise(cb0);
      return addHeapObject(ret);
    } finally {
      state0.a = state0.b = 0;
    }
  };
  imports.wbg.__wbg_resolve_778af3f90b8e2b59 = function (arg0) {
    var ret = Promise.resolve(getObject(arg0));
    return addHeapObject(ret);
  };
  imports.wbg.__wbg_then_367b3e718069cfb9 = function (arg0, arg1) {
    var ret = getObject(arg0).then(getObject(arg1));
    return addHeapObject(ret);
  };
  imports.wbg.__wbg_then_ac66ca61394bfd21 = function (arg0, arg1, arg2) {
    var ret = getObject(arg0).then(getObject(arg1), getObject(arg2));
    return addHeapObject(ret);
  };
  imports.wbg.__wbg_self_05c54dcacb623b9a = handleError(function () {
    var ret = self.self;
    return addHeapObject(ret);
  });
  imports.wbg.__wbg_window_9777ce446d12989f = handleError(function () {
    var ret = window.window;
    return addHeapObject(ret);
  });
  imports.wbg.__wbg_globalThis_f0ca0bbb0149cf3d = handleError(function () {
    var ret = globalThis.globalThis;
    return addHeapObject(ret);
  });
  imports.wbg.__wbg_global_c3c8325ae8c7f1a9 = handleError(function () {
    var ret = global.global;
    return addHeapObject(ret);
  });
  imports.wbg.__wbg_buffer_ebc6c8e75510eae3 = function (arg0) {
    var ret = getObject(arg0).buffer;
    return addHeapObject(ret);
  };
  imports.wbg.__wbg_newwithbyteoffsetandlength_ca3d3d8811ecb569 = function (
    arg0,
    arg1,
    arg2
  ) {
    var ret = new Uint8Array(getObject(arg0), arg1 >>> 0, arg2 >>> 0);
    return addHeapObject(ret);
  };
  imports.wbg.__wbg_length_317f0dd77f7a6673 = function (arg0) {
    var ret = getObject(arg0).length;
    return ret;
  };
  imports.wbg.__wbg_new_135e963dedf67b22 = function (arg0) {
    var ret = new Uint8Array(getObject(arg0));
    return addHeapObject(ret);
  };
  imports.wbg.__wbg_set_4a5072a31008e0cb = function (arg0, arg1, arg2) {
    getObject(arg0).set(getObject(arg1), arg2 >>> 0);
  };
  imports.wbg.__wbg_newwithlength_78dc302d31527318 = function (arg0) {
    var ret = new Uint8Array(arg0 >>> 0);
    return addHeapObject(ret);
  };
  imports.wbg.__wbg_subarray_34c228a45c72d146 = function (arg0, arg1, arg2) {
    var ret = getObject(arg0).subarray(arg1 >>> 0, arg2 >>> 0);
    return addHeapObject(ret);
  };
  imports.wbg.__wbg_has_02d2073e8210eefc = handleError(function (arg0, arg1) {
    var ret = Reflect.has(getObject(arg0), getObject(arg1));
    return ret;
  });
  imports.wbg.__wbg_set_61642586f7156f4a = handleError(function (
    arg0,
    arg1,
    arg2
  ) {
    var ret = Reflect.set(getObject(arg0), getObject(arg1), getObject(arg2));
    return ret;
  });
  imports.wbg.__wbindgen_debug_string = function (arg0, arg1) {
    var ret = debugString(getObject(arg1));
    var ptr0 = passStringToWasm0(
      ret,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc
    );
    var len0 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len0;
    getInt32Memory0()[arg0 / 4 + 0] = ptr0;
  };
  imports.wbg.__wbindgen_throw = function (arg0, arg1) {
    throw new Error(getStringFromWasm0(arg0, arg1));
  };
  imports.wbg.__wbindgen_rethrow = function (arg0) {
    throw takeObject(arg0);
  };
  imports.wbg.__wbindgen_memory = function () {
    var ret = wasm.memory;
    return addHeapObject(ret);
  };
  imports.wbg.__wbindgen_closure_wrapper4919 = function (arg0, arg1, arg2) {
    var ret = makeMutClosure(arg0, arg1, 1175, __wbg_adapter_26);
    return addHeapObject(ret);
  };

  if (
    typeof input === 'string' ||
    (typeof Request === 'function' && input instanceof Request) ||
    (typeof URL === 'function' && input instanceof URL)
  ) {
    input = fetch(input);
  }

  const { instance, module } = await load(await input, imports);

  wasm = instance.exports;
  init.__wbindgen_wasm_module = module;

  return wasm;
}

export default init;
