!(function (e, t) {
  'object' == typeof exports && 'object' == typeof module
    ? (module.exports = t())
    : 'function' == typeof define && define.amd
      ? define([], t)
      : 'object' == typeof exports
        ? (exports.GomokuAI = t())
        : (e.GomokuAI = t())
})(this, function () {
  return (function () {
    'use strict'
    var e,
      t,
      s,
      i = {
        d: function (e, t) {
          for (var s in t)
            i.o(t, s) && !i.o(e, s) && Object.defineProperty(e, s, { enumerable: !0, get: t[s] })
        },
        o: function (e, t) {
          return Object.prototype.hasOwnProperty.call(e, t)
        },
      },
      n = {}
    function a() {
      let e = void 0 !== self.SharedArrayBuffer
      if (e)
        try {
          e =
            new WebAssembly.Memory({ initial: 1, maximum: 1, shared: !0 }).buffer instanceof
            self.SharedArrayBuffer
        } catch (t) {
          e = !1
        }
      return e
    }
    function l(e) {
      const t = parseFloat(e)
      return isNaN(t)
        ? e.startsWith('+M')
          ? 4e4 - parseInt(e.substring(2))
          : e.startsWith('-M')
            ? -4e4 + parseInt(e.substring(2))
            : -8e4
        : t
    }
    i.d(n, {
      default: function () {
        return r
      },
    }),
      (function (e) {
        ;(e[(e.WebAssembly = 0)] = 'WebAssembly'),
          (e[(e.WebAssemblyWorker = 1)] = 'WebAssemblyWorker')
      })(e || (e = {}))
    class o {
      constructor(t = './assets/') {
        ;(this.callback = null),
          (this.engineInstance = null),
          (this.assetsPath = t),
          (this.engineType = a() ? e.WebAssembly : e.WebAssemblyWorker)
      }
      async init(t) {
        return (
          (this.callback = t),
          new Promise((t, s) => {
            this.engineType === e.WebAssembly
              ? this.initWebAssembly().then(t).catch(s)
              : this.initWebAssemblyWorker().then(t).catch(s)
          })
        )
      }
      async initWebAssembly() {
        const e = this.assetsPath + 'rapfi-multi.js'
        try {
          const t = document.createElement('script')
          return (
            (t.src = e),
            new Promise((e, s) => {
              ;(t.onload = () => {
                const t = this.assetsPath
                window
                  .Rapfi({
                    locateFile: (e) => t + e,
                    receiveStdout: (e) => this.processOutput(e),
                    receiveStderr: () => {},
                    onEngineReady: () => {
                      var t
                      null === (t = this.callback) || void 0 === t || t.call(this, { ok: !0 }), e()
                    },
                  })
                  .then((e) => {
                    this.engineInstance = e
                  })
                  .catch((e) => {
                    console.error('Failed to load engine module: ' + e), s(e)
                  })
              }),
                (t.onerror = s),
                document.head.appendChild(t)
            })
          )
        } catch (e) {
          throw (console.error('Failed to import MTEngine: ' + e), e)
        }
      }
      async initWebAssemblyWorker() {
        return (
          this.assetsPath,
          new Promise((e, t) => {
            const s = new URL(this.assetsPath, window.location.href).href,
              i = new URL('rapfi-single.js', s).href,
              n = new Blob(
                [
                  "\n        let EngineInstance = null;\n        \n        self.onmessage = function (e) {\n          if (e.data.command != null) {\n            if (EngineInstance) {\n              EngineInstance.sendCommand(e.data.command);\n            }\n          } else if (e.data.engineScriptURL != null) {\n            const engineScriptURL = e.data.engineScriptURL;\n            const engineDirURL = e.data.engineDirURL;\n            \n            self.importScripts(engineScriptURL);\n\n            self['Rapfi']({\n              locateFile: (url) => engineDirURL + url,\n              receiveStdout: (o) => self.postMessage({ stdout: o }),\n              receiveStderr: (o) => self.postMessage({ stderr: o }),\n              onEngineReady: () => self.postMessage({ ready: true }),\n            })\n              .then((instance) => (EngineInstance = instance))\n              .catch((err) => console.error('Failed to load engine module: ' + err));\n          } else {\n            console.warn('worker received unknown data:', e.data);\n          }\n        };\n      ",
                ],
                { type: 'application/javascript' },
              ),
              a = URL.createObjectURL(n)
            ;(this.engineInstance = new Worker(a)),
              (this.engineInstance.onmessage = (t) => {
                var s
                null != t.data.ready
                  ? (null === (s = this.callback) || void 0 === s || s.call(this, { ok: !0 }), e())
                  : null != t.data.stdout && this.processOutput(t.data.stdout)
              }),
              (this.engineInstance.onerror = (e) => {
                this.engineInstance.terminate(),
                  console.error('Worker error [' + e.message + ']. Retry after 250ms...'),
                  setTimeout(() => this.init(this.callback), 250),
                  t(e)
              }),
              this.engineInstance.postMessage({ engineScriptURL: i, engineDirURL: s })
          })
        )
      }
      sendCommand(t) {
        var s, i
        'string' == typeof t &&
          0 !== t.length &&
          (this.engineType === e.WebAssembly
            ? null === (s = this.engineInstance) || void 0 === s || s.sendCommand(t)
            : this.engineType === e.WebAssemblyWorker &&
              (null === (i = this.engineInstance) || void 0 === i || i.postMessage({ command: t })))
      }
      stopThinking() {
        var t
        return this.engineType === e.WebAssembly
          ? (this.sendCommand('YXSTOP'), !1)
          : this.engineType === e.WebAssemblyWorker &&
              (console.warn('No support for SAB, will stop by terminating worker.'),
              null === (t = this.engineInstance) || void 0 === t || t.terminate(),
              this.init(this.callback),
              !0)
      }
      processOutput(e) {
        var t, s, i, n, a, l, o, h, r, c, d, u, m, p, g, f, b
        const k = e.indexOf(' ')
        if (-1 === k) {
          if ('OK' === e) return
          if ('SWAP' === e)
            null === (t = this.callback) || void 0 === t || t.call(this, { swap: !0 })
          else {
            const t = e.split(',')
            null === (s = this.callback) || void 0 === s || s.call(this, { pos: [+t[0], +t[1]] })
          }
          return
        }
        const v = e.substring(0, k),
          T = e.substring(k + 1)
        if ('MESSAGE' === v)
          if (T.startsWith('REALTIME')) {
            const e = T.split(' ')
            if (e.length < 3)
              null === (i = this.callback) ||
                void 0 === i ||
                i.call(this, { realtime: { type: e[1] } })
            else {
              const t = e[2].split(',')
              null === (n = this.callback) ||
                void 0 === n ||
                n.call(this, { realtime: { type: e[1], pos: [+t[0], +t[1]] } })
            }
          } else null === (a = this.callback) || void 0 === a || a.call(this, { msg: T })
        else if ('INFO' === v) {
          const e = T.indexOf(' '),
            t = T.substring(0, e),
            s = T.substring(e + 1)
          if ('PV' === t)
            null === (l = this.callback) || void 0 === l || l.call(this, { multipv: s })
          else if ('DEPTH' === t)
            null === (o = this.callback) || void 0 === o || o.call(this, { depth: +s })
          else if ('SELDEPTH' === t)
            null === (h = this.callback) || void 0 === h || h.call(this, { seldepth: +s })
          else if ('NODES' === t)
            null === (r = this.callback) || void 0 === r || r.call(this, { nodes: +s })
          else if ('TOTALNODES' === t)
            null === (c = this.callback) || void 0 === c || c.call(this, { totalnodes: +s })
          else if ('SPEED' === t)
            null === (d = this.callback) || void 0 === d || d.call(this, { speed: +s })
          else if ('EVAL' === t)
            null === (u = this.callback) || void 0 === u || u.call(this, { eval: s })
          else if ('WINRATE' === t)
            null === (m = this.callback) || void 0 === m || m.call(this, { winrate: parseFloat(s) })
          else if ('BESTLINE' === t) {
            const e =
              (null === (p = s.match(/([A-Z]\d+)/g)) || void 0 === p
                ? void 0
                : p.map((e) => {
                    const t = e.match(/([A-Z])(\d+)/)
                    return t ? [t[1].charCodeAt(0) - 'A'.charCodeAt(0), +t[2] - 1] : [0, 0]
                  })) || []
            null === (g = this.callback) || void 0 === g || g.call(this, { bestline: e })
          }
        } else if ('ERROR' === v)
          null === (f = this.callback) || void 0 === f || f.call(this, { error: T })
        else if ('FORBID' === v) {
          const e = (T.match(/.{4}/g) || []).map((e) => {
            const t = e.match(/([0-9][0-9])([0-9][0-9])/)
            return t ? [+t[1], +t[2]] : [0, 0]
          })
          null === (b = this.callback) || void 0 === b || b.call(this, { forbid: e })
        }
      }
      destroy() {
        this.engineType === e.WebAssemblyWorker &&
          this.engineInstance &&
          this.engineInstance.terminate(),
          (this.engineInstance = null),
          (this.callback = null)
      }
    }
    !(function (e) {
      ;(e[(e.FREESTYLE = 0)] = 'FREESTYLE'),
        (e[(e.STANDARD = 1)] = 'STANDARD'),
        (e[(e.RENJU = 2)] = 'RENJU')
    })(t || (t = {})),
      (function (e) {
        ;(e[(e.BLACK = 1)] = 'BLACK'), (e[(e.WHITE = 2)] = 'WHITE')
      })(s || (s = {}))
    const h = ['config-default.toml', 'config-210901.toml', 'config-220723.toml']
    var r = class {
      constructor(e) {
        ;(this.ready = !1),
          (this.thinking = !1),
          (this.timeUsed = 0),
          (this.lastThinkTime = 0),
          (this.lastThinkPosition = []),
          (this.currentConfig = null),
          (this.hashSize = null),
          (this.startSize = 0),
          (this.needRestart = !1),
          (this.outputs = {
            pos: null,
            swap: !1,
            currentPV: 0,
            pv: [{ depth: 0, seldepth: 0, nodes: 0, eval: '-', winrate: 0, bestline: [] }],
            nodes: 0,
            speed: 0,
            msg: null,
            realtime: { best: [], lost: [], thinking: [], thought: [] },
            forbid: [],
            error: null,
          }),
          (this.messages = []),
          (this.posCallback = null),
          (this.realtimeCallback = null),
          (this.config = {
            rule: 0,
            threads: a() ? Math.max(Math.floor(navigator.hardwareConcurrency / 2), 1) : 1,
            candRange: 3,
            strength: 100,
            turnTime: 5e3,
            matchTime: 9999e3,
            maxDepth: 64,
            maxNodes: 0,
            nbest: 1,
            configIndex: h.length - 1,
            hashSize: 256,
            pondering: !1,
            showDetail: !0,
          }),
          (this.engine = new o(e))
      }
      async init(e) {
        return (
          (this.realtimeCallback = e || null),
          this.engine.init((e) => {
            this.handleEngineResponse(e)
          })
        )
      }
      setConfig(e) {
        this.config = { ...this.config, ...e }
      }
      getStatus() {
        return { ready: this.ready, thinking: this.thinking, timeUsed: this.timeUsed }
      }
      getOutput() {
        return { ...this.outputs }
      }
      getMessages() {
        return [...this.messages]
      }
      getBestlineString(e = 0) {
        const t = this.outputs.pv[e]
        return t
          ? t.bestline
              .map((e) => String.fromCharCode('A'.charCodeAt(0) + e[0]) + (e[1] + 1))
              .join(' ')
          : ''
      }
      async think(e, t = 15, s) {
        if (!this.ready) throw new Error('Engine is not ready!')
        ;(this.thinking = !0),
          (this.outputs.swap = !1),
          this.clearMessages(),
          this.reloadConfig(),
          this.updateHashSize(),
          this.sendInfo(),
          (this.needRestart || this.startSize !== t) &&
            (this.engine.sendCommand('START ' + t),
            (this.needRestart = !1),
            (this.startSize = t),
            this.clearUsedTime())
        const i = Math.max((this.config.matchTime || 9999e3) - this.timeUsed, 1)
        if (
          (this.engine.sendCommand('INFO TIME_LEFT ' + i),
          this.sendBoard(e, !1),
          this.setThinkStartTime(),
          (this.lastThinkPosition = [...e]),
          this.clearOutput(),
          s)
        ) {
          const e = 2 === s.mode ? 'YXBALANCETWO ' + (s.bias || 0) : 'YXBALANCEONE ' + (s.bias || 0)
          this.engine.sendCommand(e)
        } else this.engine.sendCommand('YXNBEST ' + (this.config.nbest || 1))
        return new Promise((e) => {
          this.posCallback = e
        })
      }
      stop() {
        var e
        if (!this.thinking) return !1
        if (this.engine.stopThinking()) {
          ;(this.ready = !1),
            this.clearRealtime('best'),
            this.clearRealtime('lost'),
            this.clearRealtime('thinking'),
            this.clearRealtime('thought'),
            this.addUsedTime(),
            this.sortPV(),
            (this.thinking = !1)
          const t = null === (e = this.outputs.pv[0]) || void 0 === e ? void 0 : e.bestline[0]
          if (t) {
            const e = [t[0], this.startSize - 1 - t[1]]
            ;(this.outputs.pos = e), this.posCallback && this.posCallback(e)
          }
          return (this.needRestart = !0), (this.currentConfig = null), (this.hashSize = null), !0
        }
        return !1
      }
      restartAI() {
        ;(this.needRestart = !0), this.clearUsedTime(), this.clearOutput()
      }
      async checkForbid(e, s = 15) {
        return (
          (this.outputs.forbid = []),
          this.ready
            ? (this.getGameRule() === t.RENJU &&
                (this.sendInfo(),
                (this.needRestart || this.startSize !== s) &&
                  (this.engine.sendCommand('START ' + s),
                  (this.needRestart = !1),
                  (this.startSize = s)),
                this.sendBoard(e, !1),
                this.engine.sendCommand('YXSHOWFORBID')),
              this.outputs.forbid)
            : []
        )
      }
      destroy() {
        this.engine.destroy()
      }
      handleEngineResponse(e) {
        var t, s, i, n
        e.realtime
          ? this.handleRealtimeResponse(e.realtime)
          : e.msg
            ? ((this.outputs.msg = e.msg),
              this.addMessage(e.msg),
              null ===
                (s = null === (t = this.realtimeCallback) || void 0 === t ? void 0 : t.onMessage) ||
                void 0 === s ||
                s.call(t, e.msg))
            : e.multipv
              ? 'DONE' === e.multipv
                ? (this.outputs.currentPV = 0)
                : (this.outputs.currentPV = +e.multipv)
              : e.depth
                ? this.setPVOutput('depth', e.depth)
                : e.seldepth
                  ? this.setPVOutput('seldepth', e.seldepth)
                  : e.nodes
                    ? this.setPVOutput('nodes', e.nodes)
                    : e.totalnodes
                      ? (this.outputs.nodes = e.totalnodes)
                      : e.speed
                        ? (this.outputs.speed = e.speed)
                        : e.eval
                          ? this.setPVOutput('eval', e.eval)
                          : e.winrate
                            ? this.setPVOutput('winrate', e.winrate)
                            : e.bestline
                              ? this.setPVOutput('bestline', e.bestline)
                              : e.pos
                                ? ((this.outputs.pos = e.pos),
                                  this.addUsedTime(),
                                  this.clearRealtime('best'),
                                  this.clearRealtime('lost'),
                                  this.sortPV(),
                                  (this.thinking = !1),
                                  this.posCallback && this.posCallback(e.pos))
                                : e.swap
                                  ? (this.outputs.swap = e.swap)
                                  : e.ok
                                    ? ((this.ready = !0),
                                      this.checkForbid(this.lastThinkPosition, this.startSize))
                                    : e.forbid
                                      ? (this.outputs.forbid = e.forbid)
                                      : e.error &&
                                        ((this.outputs.error = e.error),
                                        this.addMessage('Error: ' + e.error)),
          null ===
            (n = null === (i = this.realtimeCallback) || void 0 === i ? void 0 : i.onProgress) ||
            void 0 === n ||
            n.call(i, this.getOutput())
      }
      handleRealtimeResponse(e) {
        var t, s, i, n, a, l, o, h
        switch (e.type) {
          case 'REFRESH':
            this.clearRealtime('thinking'), this.clearRealtime('thought')
            break
          case 'POS':
            this.addRealtime('thinking', e.pos),
              null ===
                (s =
                  null === (t = this.realtimeCallback) || void 0 === t ? void 0 : t.onThinking) ||
                void 0 === s ||
                s.call(t, e.pos)
            break
          case 'DONE':
            this.addRealtime('thought', e.pos),
              this.clearRealtime('thinking'),
              null ===
                (n = null === (i = this.realtimeCallback) || void 0 === i ? void 0 : i.onThought) ||
                void 0 === n ||
                n.call(i, e.pos)
            break
          case 'LOST':
            this.addRealtime('lost', e.pos),
              null ===
                (l = null === (a = this.realtimeCallback) || void 0 === a ? void 0 : a.onLost) ||
                void 0 === l ||
                l.call(a, e.pos)
            break
          case 'BEST':
            this.clearRealtime('best'),
              this.addRealtime('best', e.pos),
              null ===
                (h = null === (o = this.realtimeCallback) || void 0 === o ? void 0 : o.onBest) ||
                void 0 === h ||
                h.call(o, e.pos)
        }
      }
      sendInfo() {
        this.engine.sendCommand('INFO RULE ' + (this.config.rule || 0)),
          this.engine.sendCommand('INFO THREAD_NUM ' + (this.config.threads || 1)),
          this.engine.sendCommand('INFO CAUTION_FACTOR ' + (this.config.candRange || 3)),
          this.engine.sendCommand('INFO STRENGTH ' + (this.config.strength || 100)),
          this.engine.sendCommand('INFO TIMEOUT_TURN ' + this.getTurnTime()),
          this.engine.sendCommand('INFO TIMEOUT_MATCH ' + this.getMatchTime()),
          this.engine.sendCommand('INFO MAX_DEPTH ' + this.getDepth()),
          this.engine.sendCommand('INFO MAX_NODE ' + this.getNodes()),
          this.engine.sendCommand('INFO SHOW_DETAIL ' + (this.config.showDetail ? 3 : 2)),
          this.engine.sendCommand('INFO PONDERING ' + (this.config.pondering ? 1 : 0)),
          this.engine.sendCommand('INFO SWAPABLE 1')
      }
      sendBoard(e, t) {
        let s = t ? 'BOARD' : 'YXBOARD',
          i = e.length % 2 == 0 ? 1 : 2
        for (const t of e) (s += ' ' + t[0] + ',' + t[1] + ',' + i), (i = 3 - i)
        ;(s += ' DONE'), this.engine.sendCommand(s)
      }
      reloadConfig() {
        if ((this.config.configIndex || 0) === this.currentConfig) return
        this.currentConfig = this.config.configIndex || 0
        const e = h[this.currentConfig] || ''
        this.engine.sendCommand('RELOADCONFIG ' + e)
      }
      updateHashSize() {
        ;(this.config.hashSize || 256) !== this.hashSize &&
          ((this.hashSize = this.config.hashSize || 256),
          this.engine.sendCommand('INFO HASH_SIZE ' + 1024 * this.hashSize),
          this.addMessage(`Hash size reset to ${this.hashSize} MB.`))
      }
      getTurnTime() {
        return this.config.turnTime || 5e3
      }
      getMatchTime() {
        return this.config.matchTime || 9999e3
      }
      getDepth() {
        return this.config.maxDepth || 64
      }
      getNodes() {
        return this.config.maxNodes || 0
      }
      getGameRule() {
        switch (this.config.rule) {
          case 0:
          case 5:
          default:
            return t.FREESTYLE
          case 1:
            return t.STANDARD
          case 2:
          case 4:
            return t.RENJU
        }
      }
      clearUsedTime() {
        this.timeUsed = 0
      }
      addUsedTime() {
        this.timeUsed += Date.now() - this.lastThinkTime
      }
      setThinkStartTime() {
        this.lastThinkTime = Date.now()
      }
      addMessage(e) {
        this.messages.push(e)
      }
      clearMessages() {
        this.messages = []
      }
      setPVOutput(e, t) {
        this.outputs.pv[this.outputs.currentPV] ||
          (this.outputs.pv[this.outputs.currentPV] = {
            depth: 0,
            seldepth: 0,
            nodes: 0,
            eval: '-',
            winrate: 0,
            bestline: [],
          }),
          (this.outputs.pv[this.outputs.currentPV][e] = t)
      }
      clearOutput() {
        ;(this.outputs.pv = [
          { depth: 0, seldepth: 0, nodes: 0, eval: '-', winrate: 0, bestline: [] },
        ]),
          (this.outputs.pos = null),
          (this.outputs.nodes = 0),
          (this.outputs.speed = 0),
          (this.outputs.forbid = [])
      }
      addRealtime(e, t) {
        this.outputs.realtime[e].push(t)
      }
      clearRealtime(e) {
        this.outputs.realtime[e] = []
      }
      sortPV() {
        const e = (e) =>
          !!this.outputs.pos &&
          e[0] === this.outputs.pos[0] &&
          e[1] === this.startSize - 1 - this.outputs.pos[1]
        this.outputs.pv.sort((t, s) =>
          t.bestline[0] && e(t.bestline[0])
            ? -1
            : s.bestline[0] && e(s.bestline[0])
              ? 1
              : l(s.eval) - l(t.eval),
        )
      }
    }
    return n.default
  })()
})
