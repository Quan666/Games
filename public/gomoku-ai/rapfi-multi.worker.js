'use strict'
var Module = {},
  initializedJS = !1,
  pendingNotifiedProxyingQueues = []
function threadPrintErr() {
  var e = Array.prototype.slice.call(arguments).join(' ')
  console.error(e)
}
function threadAlert() {
  var e = Array.prototype.slice.call(arguments).join(' ')
  postMessage({ cmd: 'alert', text: e, threadId: Module._pthread_self() })
}
var err = threadPrintErr
;(self.alert = threadAlert),
  (Module.instantiateWasm = (e, t) => {
    var r = new WebAssembly.Instance(Module.wasmModule, e)
    return t(r), (Module.wasmModule = null), r.exports
  }),
  (self.onunhandledrejection = (e) => {
    throw e.reason ?? e
  }),
  (self.onmessage = (e) => {
    try {
      if ('load' === e.data.cmd) {
        if (
          ((Module.wasmModule = e.data.wasmModule),
          (Module.wasmMemory = e.data.wasmMemory),
          (Module.buffer = Module.wasmMemory.buffer),
          (Module.ENVIRONMENT_IS_PTHREAD = !0),
          'string' == typeof e.data.urlOrBlob)
        )
          importScripts(e.data.urlOrBlob)
        else {
          var t = URL.createObjectURL(e.data.urlOrBlob)
          importScripts(t), URL.revokeObjectURL(t)
        }
        Rapfi(Module).then(function (e) {
          Module = e
        })
      } else if ('run' === e.data.cmd) {
        ;(Module.__performance_now_clock_drift = performance.now() - e.data.time),
          Module.__emscripten_thread_init(e.data.pthread_ptr, 0, 0, 1),
          Module.establishStackSpace(),
          Module.PThread.receiveObjectTransfer(e.data),
          Module.PThread.threadInitTLS(),
          initializedJS ||
            (pendingNotifiedProxyingQueues.forEach((e) => {
              Module.executeNotifiedProxyingQueue(e)
            }),
            (pendingNotifiedProxyingQueues = []),
            (initializedJS = !0))
        try {
          Module.invokeEntryPoint(e.data.start_routine, e.data.arg)
        } catch (e) {
          if ('unwind' != e) {
            if (!(e instanceof Module.ExitStatus)) throw e
            Module.keepRuntimeAlive() || Module.__emscripten_thread_exit(e.status)
          }
        }
      } else
        'cancel' === e.data.cmd
          ? Module._pthread_self() && Module.__emscripten_thread_exit(-1)
          : 'setimmediate' === e.data.target ||
            ('processProxyingQueue' === e.data.cmd
              ? initializedJS
                ? Module.executeNotifiedProxyingQueue(e.data.queue)
                : pendingNotifiedProxyingQueues.push(e.data.queue)
              : (err('worker.js received unknown command ' + e.data.cmd), err(e.data)))
    } catch (e) {
      throw (Module.__emscripten_thread_crashed && Module.__emscripten_thread_crashed(), e)
    }
  })
