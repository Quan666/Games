var Rapfi = (() => {
  var e =
    'undefined' != typeof document && document.currentScript ? document.currentScript.src : void 0
  return function (t) {
    function r() {
      return R.buffer != x && L(R.buffer), D
    }
    function n() {
      return R.buffer != x && L(R.buffer), F
    }
    function a() {
      return R.buffer != x && L(R.buffer), C
    }
    function o() {
      return R.buffer != x && L(R.buffer), j
    }
    function i() {
      return R.buffer != x && L(R.buffer), O
    }
    var u, c, f
    ;(t = t || {}),
      u || (u = void 0 !== t ? t : {}),
      (u.ready = new Promise(function (e, t) {
        ;(c = e), (f = t)
      })),
      u.Nb || (u.Nb = 0),
      u.Nb++,
      u.ENVIRONMENT_IS_PTHREAD ||
        (function (e) {
          function t() {
            function t(e, t, r) {
              ;(this.start = e), (this.end = t), (this.audio = r)
            }
            function r(r) {
              if (!r) throw 'Loading data file failed.' + Error().stack
              if (!(r instanceof ArrayBuffer))
                throw 'bad input to processPackageData' + Error().stack
              ;(r = new Uint8Array(r)), (t.prototype.Mb = r), (r = e.files)
              for (var n = 0; n < r.length; ++n) t.prototype.cb[r[n].filename].onload()
              u.removeRunDependency('datafile_rapfi-multi.data')
            }
            t.prototype = {
              cb: {},
              open: function (e, t) {
                ;(this.name = t), (this.cb[t] = this), u.addRunDependency('fp ' + this.name)
              },
              onload: function () {
                this.qb(this.Mb.subarray(this.start, this.end))
              },
              qb: function (e) {
                u.FS_createDataFile(this.name, null, e, !0, !0, !0),
                  u.removeRunDependency('fp ' + this.name),
                  (this.cb[this.name] = null)
              },
            }
            for (var n = e.files, a = 0; a < n.length; ++a)
              new t(n[a].start, n[a].end, n[a].audio || 0).open('GET', n[a].filename)
            u.addRunDependency('datafile_rapfi-multi.data'),
              u.pc || (u.pc = {}),
              (u.pc['rapfi-multi.data'] = { jd: !1 }),
              s ? (r(s), (s = null)) : (f = r)
          }
          'object' == typeof window
            ? window.encodeURIComponent(
                window.location.pathname
                  .toString()
                  .substring(0, window.location.pathname.toString().lastIndexOf('/')) + '/',
              )
            : 'undefined' == typeof process &&
              'undefined' != typeof location &&
              encodeURIComponent(
                location.pathname
                  .toString()
                  .substring(0, location.pathname.toString().lastIndexOf('/')) + '/',
              ),
            'function' != typeof u.locateFilePackage ||
              u.locateFile ||
              ((u.locateFile = u.locateFilePackage),
              A(
                'warning: you defined Module.locateFilePackage, that has been renamed to Module.locateFile (using your locateFilePackage for now)',
              ))
          var r,
            n,
            a,
            o,
            i = u.locateFile ? u.locateFile('rapfi-multi.data', '') : 'rapfi-multi.data',
            c = e.remote_package_size,
            f = null,
            s = u.getPreloadedPackage ? u.getPreloadedPackage(i, c) : null
          s ||
            ((r = i),
            (n = c),
            (a = function (e) {
              f ? (f(e), (f = null)) : (s = e)
            }),
            (o = new XMLHttpRequest()).open('GET', r, !0),
            (o.responseType = 'arraybuffer'),
            (o.onprogress = function (e) {
              var t = n
              if ((e.total && (t = e.total), e.loaded)) {
                o.cb
                  ? (u.vb[r].loaded = e.loaded)
                  : ((o.cb = !0), u.vb || (u.vb = {}), (u.vb[r] = { loaded: e.loaded, total: t }))
                var a,
                  i = (t = e = 0)
                for (a in u.vb) {
                  var c = u.vb[a]
                  ;(e += c.total), (t += c.loaded), i++
                }
                ;(e = Math.ceil((e * u.Nb) / i)),
                  u.setStatus && u.setStatus('Downloading data... (' + t + '/' + e + ')')
              } else !u.vb && u.setStatus && u.setStatus('Downloading data...')
            }),
            (o.onerror = function () {
              throw Error('NetworkError for: ' + r)
            }),
            (o.onload = function () {
              if (
                !(
                  200 == o.status ||
                  304 == o.status ||
                  206 == o.status ||
                  (0 == o.status && o.response)
                )
              )
                throw Error(o.statusText + ' : ' + o.responseURL)
              a(o.response)
            }),
            o.send(null)),
            u.calledRun ? t() : (u.preRun || (u.preRun = []), u.preRun.push(t))
        })({
          files: [
            { filename: '/config-210901.toml', start: 0, end: 602 },
            { filename: '/config-220723.toml', start: 602, end: 1203 },
            { filename: '/config-default.toml', start: 1203, end: 3040 },
            { filename: '/model210901.bin', start: 3040, end: 26244 },
            { filename: '/model220723.bin', start: 26244, end: 85974 },
          ],
          remote_package_size: 85974,
        }),
      (u.sendCommand = u.sendCommand || null),
      (u.receiveStdout = u.receiveStdout || ((e) => console.log(e))),
      (u.receiveStderr = u.receiveStderr || ((e) => console.error(e))),
      (u.onEngineReady = u.onEngineReady || (() => {})),
      u.preRun || (u.preRun = []),
      u.preRun.push(function () {
        var e = '',
          t = 0
        let r = '',
          n = ''
        rt(
          function () {
            return t < e.length ? e.charCodeAt(t++) : null
          },
          function (e) {
            e && 10 != e ? (r += String.fromCharCode(e)) : (u.receiveStdout(r), (r = ''))
          },
          function (e) {
            e && 10 != e ? (n += String.fromCharCode(e)) : (u.receiveStderr(n), (n = ''))
          },
        )
        let a = u.cwrap('gomocupLoopOnce', 'number', [])
        u.sendCommand = function (r) {
          ;(e = r + '\n'), (t = 0), a()
        }
      }),
      (u.onRuntimeInitialized = function () {
        u.onEngineReady()
      })
    var s,
      l,
      b,
      h = Object.assign({}, u),
      d = './this.program',
      p = (e, t) => {
        throw t
      },
      m = 'object' == typeof window,
      w = 'function' == typeof importScripts,
      y =
        'object' == typeof process &&
        'object' == typeof process.fd &&
        'string' == typeof process.fd.node,
      v = u.ENVIRONMENT_IS_PTHREAD || !1,
      g = ''
    function _(e) {
      return u.locateFile ? u.locateFile(e, g) : g + e
    }
    ;(m || w) &&
      (w
        ? (g = self.location.href)
        : 'undefined' != typeof document &&
          document.currentScript &&
          (g = document.currentScript.src),
      e && (g = e),
      (g =
        0 !== g.indexOf('blob:') ? g.substr(0, g.replace(/[?#].*/, '').lastIndexOf('/') + 1) : ''),
      (s = (e) => {
        var t = new XMLHttpRequest()
        return t.open('GET', e, !1), t.send(null), t.responseText
      }),
      w &&
        (b = (e) => {
          var t = new XMLHttpRequest()
          return (
            t.open('GET', e, !1),
            (t.responseType = 'arraybuffer'),
            t.send(null),
            new Uint8Array(t.response)
          )
        }),
      (l = (e, t, r) => {
        var n = new XMLHttpRequest()
        n.open('GET', e, !0),
          (n.responseType = 'arraybuffer'),
          (n.onload = () => {
            200 == n.status || (0 == n.status && n.response) ? t(n.response) : r()
          }),
          (n.onerror = r),
          n.send(null)
      }))
    var M,
      k = u.print || console.log.bind(console),
      A = u.printErr || console.warn.bind(console)
    Object.assign(u, h),
      (h = null),
      u.thisProgram && (d = u.thisProgram),
      u.quit && (p = u.quit),
      u.wasmBinary && (M = u.wasmBinary)
    var S = u.noExitRuntime || !0
    'object' != typeof WebAssembly && ee('no native wasm support detected')
    var R,
      E,
      x,
      D,
      F,
      T,
      C,
      j,
      O,
      P = !1,
      Z = 'undefined' != typeof TextDecoder ? new TextDecoder('utf8') : void 0
    function $(e, t) {
      for (var r = t + NaN, n = t; e[n] && !(n >= r); ) ++n
      if (16 < n - t && e.buffer && Z)
        return Z.decode(e.buffer instanceof SharedArrayBuffer ? e.slice(t, n) : e.subarray(t, n))
      for (r = ''; t < n; ) {
        var a = e[t++]
        if (128 & a) {
          var o = 63 & e[t++]
          if (192 == (224 & a)) r += String.fromCharCode(((31 & a) << 6) | o)
          else {
            var i = 63 & e[t++]
            65536 >
            (a =
              224 == (240 & a)
                ? ((15 & a) << 12) | (o << 6) | i
                : ((7 & a) << 18) | (o << 12) | (i << 6) | (63 & e[t++]))
              ? (r += String.fromCharCode(a))
              : ((a -= 65536), (r += String.fromCharCode(55296 | (a >> 10), 56320 | (1023 & a))))
          }
        } else r += String.fromCharCode(a)
      }
      return r
    }
    function I(e) {
      return e ? $(n(), e) : ''
    }
    function H(e, t, r, n) {
      if (!(0 < n)) return 0
      var a = r
      n = r + n - 1
      for (var o = 0; o < e.length; ++o) {
        var i = e.charCodeAt(o)
        if (
          (55296 <= i &&
            57343 >= i &&
            (i = (65536 + ((1023 & i) << 10)) | (1023 & e.charCodeAt(++o))),
          127 >= i)
        ) {
          if (r >= n) break
          t[r++] = i
        } else {
          if (2047 >= i) {
            if (r + 1 >= n) break
            t[r++] = 192 | (i >> 6)
          } else {
            if (65535 >= i) {
              if (r + 2 >= n) break
              t[r++] = 224 | (i >> 12)
            } else {
              if (r + 3 >= n) break
              ;(t[r++] = 240 | (i >> 18)), (t[r++] = 128 | ((i >> 12) & 63))
            }
            t[r++] = 128 | ((i >> 6) & 63)
          }
          t[r++] = 128 | (63 & i)
        }
      }
      return (t[r] = 0), r - a
    }
    function L(e) {
      ;(x = e),
        (u.HEAP8 = D = new Int8Array(e)),
        (u.HEAP16 = T = new Int16Array(e)),
        (u.HEAP32 = C = new Int32Array(e)),
        (u.HEAPU8 = F = new Uint8Array(e)),
        (u.HEAPU16 = new Uint16Array(e)),
        (u.HEAPU32 = j = new Uint32Array(e)),
        (u.HEAPF32 = new Float32Array(e)),
        (u.HEAPF64 = O = new Float64Array(e))
    }
    v && (x = u.buffer)
    var U = u.INITIAL_MEMORY || 134217728
    if (v) (R = u.wasmMemory), (x = u.buffer)
    else if (u.wasmMemory) R = u.wasmMemory
    else if (
      !(
        (R = new WebAssembly.Memory({ initial: U / 65536, maximum: 16384, shared: !0 }))
          .buffer instanceof SharedArrayBuffer
      )
    )
      throw (
        (A(
          'requested a shared WebAssembly.Memory but the returned buffer is not a SharedArrayBuffer, indicating that while the browser has SharedArrayBuffer it does not have WebAssembly threads support - you may need to set a flag',
        ),
        y &&
          console.log(
            '(on node you may need: --experimental-wasm-threads --experimental-wasm-bulk-memory and also use a recent version)',
          ),
        Error('bad memory'))
      )
    R && (x = R.buffer), (U = x.byteLength), L(x)
    var z,
      q = [],
      N = [],
      B = []
    function Y() {
      v || (u.noFSInit || we || rt(), (De = !1), mt(N))
    }
    function W() {
      var e = u.preRun.shift()
      q.unshift(e)
    }
    var X,
      G = 0,
      V = null,
      J = null
    function Q() {
      G++, u.monitorRunDependencies && u.monitorRunDependencies(G)
    }
    function K() {
      if (
        (G--,
        u.monitorRunDependencies && u.monitorRunDependencies(G),
        0 == G && (null !== V && (clearInterval(V), (V = null)), J))
      ) {
        var e = J
        ;(J = null), e()
      }
    }
    function ee(e) {
      throw (
        (v ? postMessage({ cmd: 'onAbort', arg: e }) : u.onAbort && u.onAbort(e),
        A((e = 'Aborted(' + e + ')')),
        (P = !0),
        (e = new WebAssembly.RuntimeError(e + '. Build with -sASSERTIONS for more info.')),
        f(e),
        e)
      )
    }
    function te() {
      return X.startsWith('data:application/octet-stream;base64,')
    }
    function re() {
      var e = X
      try {
        if (e == X && M) return new Uint8Array(M)
        if (b) return b(e)
        throw 'both async and sync fetching of the wasm failed'
      } catch (e) {
        ee(e)
      }
    }
    ;(X = 'rapfi-multi.wasm'), te() || (X = _(X))
    var ne,
      ae,
      oe = {}
    function ie(e) {
      ;(this.name = 'ExitStatus'),
        (this.message = 'Program terminated with exit(' + e + ')'),
        (this.status = e)
    }
    function ue(e) {
      ;(e = pt.ob[e]) || ee(), pt.sc(e)
    }
    function ce(e) {
      var t = pt.Jc()
      if (!t) return 6
      pt.Eb.push(t), (pt.ob[e.nb] = t), (t.nb = e.nb)
      var r = { cmd: 'run', start_routine: e.Yc, arg: e.zc, pthread_ptr: e.nb }
      return (
        (t.Db = () => {
          ;(r.time = performance.now()), t.postMessage(r, e.dd)
        }),
        t.loaded && (t.Db(), delete t.Db),
        0
      )
    }
    var fe = (e, t) => {
        for (var r = 0, n = e.length - 1; 0 <= n; n--) {
          var a = e[n]
          '.' === a
            ? e.splice(n, 1)
            : '..' === a
              ? (e.splice(n, 1), r++)
              : r && (e.splice(n, 1), r--)
        }
        if (t) for (; r; r--) e.unshift('..')
        return e
      },
      se = (e) => {
        var t = '/' === e.charAt(0),
          r = '/' === e.substr(-1)
        return (
          (e = fe(
            e.split('/').filter((e) => !!e),
            !t,
          ).join('/')) ||
            t ||
            (e = '.'),
          e && r && (e += '/'),
          (t ? '/' : '') + e
        )
      },
      le = (e) => {
        var t = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/.exec(e).slice(1)
        return (e = t[0]), (t = t[1]), e || t ? (t && (t = t.substr(0, t.length - 1)), e + t) : '.'
      },
      be = (e) => {
        if ('/' === e) return '/'
        var t = (e = (e = se(e)).replace(/\/$/, '')).lastIndexOf('/')
        return -1 === t ? e : e.substr(t + 1)
      }
    function he() {
      for (var e = '', t = !1, r = arguments.length - 1; -1 <= r && !t; r--) {
        if ('string' != typeof (t = 0 <= r ? arguments[r] : '/'))
          throw new TypeError('Arguments to path.resolve must be strings')
        if (!t) return ''
        ;(e = t + '/' + e), (t = '/' === t.charAt(0))
      }
      return (
        (t ? '/' : '') +
          (e = fe(
            e.split('/').filter((e) => !!e),
            !t,
          ).join('/')) || '.'
      )
    }
    function de(e, t) {
      for (var r = 0, n = 0; n < e.length; ++n) {
        var a = e.charCodeAt(n)
        127 >= a
          ? r++
          : 2047 >= a
            ? (r += 2)
            : 55296 <= a && 57343 >= a
              ? ((r += 4), ++n)
              : (r += 3)
      }
      return (e = H(e, (r = Array(r + 1)), 0, r.length)), t && (r.length = e), r
    }
    var pe = []
    function me(e, t) {
      ;(pe[e] = { input: [], gb: [], xb: t }), qe(e, ge)
    }
    var we,
      ye,
      ve,
      ge = {
        open: function (e) {
          var t = pe[e.node.Bb]
          if (!t) throw new Fe(43)
          ;(e.fb = t), (e.seekable = !1)
        },
        close: function (e) {
          e.fb.xb.Gb(e.fb)
        },
        Gb: function (e) {
          e.fb.xb.Gb(e.fb)
        },
        read: function (e, t, r, n) {
          if (!e.fb || !e.fb.xb.hc) throw new Fe(60)
          for (var a = 0, o = 0; o < n; o++) {
            try {
              var i = e.fb.xb.hc(e.fb)
            } catch (e) {
              throw new Fe(29)
            }
            if (void 0 === i && 0 === a) throw new Fe(6)
            if (null == i) break
            a++, (t[r + o] = i)
          }
          return a && (e.node.timestamp = Date.now()), a
        },
        write: function (e, t, r, n) {
          if (!e.fb || !e.fb.xb.Tb) throw new Fe(60)
          try {
            for (var a = 0; a < n; a++) e.fb.xb.Tb(e.fb, t[r + a])
          } catch (e) {
            throw new Fe(29)
          }
          return n && (e.node.timestamp = Date.now()), a
        },
      },
      _e = {
        hc: function (e) {
          if (!e.input.length) {
            var t = null
            if (
              ('undefined' != typeof window && 'function' == typeof window.prompt
                ? null !== (t = window.prompt('Input: ')) && (t += '\n')
                : 'function' == typeof readline && null !== (t = readline()) && (t += '\n'),
              !t)
            )
              return null
            e.input = de(t, !0)
          }
          return e.input.shift()
        },
        Tb: function (e, t) {
          null === t || 10 === t ? (k($(e.gb, 0)), (e.gb = [])) : 0 != t && e.gb.push(t)
        },
        Gb: function (e) {
          e.gb && 0 < e.gb.length && (k($(e.gb, 0)), (e.gb = []))
        },
      },
      Me = {
        Tb: function (e, t) {
          null === t || 10 === t ? (A($(e.gb, 0)), (e.gb = [])) : 0 != t && e.gb.push(t)
        },
        Gb: function (e) {
          e.gb && 0 < e.gb.length && (A($(e.gb, 0)), (e.gb = []))
        },
      },
      ke = {
        jb: null,
        mb: function () {
          return ke.createNode(null, '/', 16895, 0)
        },
        createNode: function (e, t, r, n) {
          if (24576 == (61440 & r) || 4096 == (61440 & r)) throw new Fe(63)
          return (
            ke.jb ||
              (ke.jb = {
                dir: {
                  node: {
                    ib: ke.$a.ib,
                    hb: ke.$a.hb,
                    zb: ke.$a.zb,
                    Hb: ke.$a.Hb,
                    rc: ke.$a.rc,
                    Lb: ke.$a.Lb,
                    tc: ke.$a.tc,
                    qc: ke.$a.qc,
                    Ib: ke.$a.Ib,
                  },
                  stream: { sb: ke.ab.sb },
                },
                file: {
                  node: { ib: ke.$a.ib, hb: ke.$a.hb },
                  stream: {
                    sb: ke.ab.sb,
                    read: ke.ab.read,
                    write: ke.ab.write,
                    Yb: ke.ab.Yb,
                    Sb: ke.ab.Sb,
                    nc: ke.ab.nc,
                  },
                },
                link: { node: { ib: ke.$a.ib, hb: ke.$a.hb, Cb: ke.$a.Cb }, stream: {} },
                bc: { node: { ib: ke.$a.ib, hb: ke.$a.hb }, stream: ze },
              }),
            16384 == (61440 & (r = Ze(e, t, r, n)).mode)
              ? ((r.$a = ke.jb.dir.node), (r.ab = ke.jb.dir.stream), (r.Za = {}))
              : 32768 == (61440 & r.mode)
                ? ((r.$a = ke.jb.file.node), (r.ab = ke.jb.file.stream), (r.bb = 0), (r.Za = null))
                : 40960 == (61440 & r.mode)
                  ? ((r.$a = ke.jb.link.node), (r.ab = ke.jb.link.stream))
                  : 8192 == (61440 & r.mode) && ((r.$a = ke.jb.bc.node), (r.ab = ke.jb.bc.stream)),
            (r.timestamp = Date.now()),
            e && ((e.Za[t] = r), (e.timestamp = r.timestamp)),
            r
          )
        },
        kd: function (e) {
          return e.Za
            ? e.Za.subarray
              ? e.Za.subarray(0, e.bb)
              : new Uint8Array(e.Za)
            : new Uint8Array(0)
        },
        ec: function (e, t) {
          var r = e.Za ? e.Za.length : 0
          r >= t ||
            ((t = Math.max(t, (r * (1048576 > r ? 2 : 1.125)) >>> 0)),
            0 != r && (t = Math.max(t, 256)),
            (r = e.Za),
            (e.Za = new Uint8Array(t)),
            0 < e.bb && e.Za.set(r.subarray(0, e.bb), 0))
        },
        Wc: function (e, t) {
          if (e.bb != t)
            if (0 == t) (e.Za = null), (e.bb = 0)
            else {
              var r = e.Za
              ;(e.Za = new Uint8Array(t)),
                r && e.Za.set(r.subarray(0, Math.min(t, e.bb))),
                (e.bb = t)
            }
        },
        $a: {
          ib: function (e) {
            var t = {}
            return (
              (t.Fc = 8192 == (61440 & e.mode) ? e.id : 1),
              (t.Qb = e.id),
              (t.mode = e.mode),
              (t.Tc = 1),
              (t.uid = 0),
              (t.Lc = 0),
              (t.Bb = e.Bb),
              16384 == (61440 & e.mode)
                ? (t.size = 4096)
                : 32768 == (61440 & e.mode)
                  ? (t.size = e.bb)
                  : 40960 == (61440 & e.mode)
                    ? (t.size = e.link.length)
                    : (t.size = 0),
              (t.$b = new Date(e.timestamp)),
              (t.oc = new Date(e.timestamp)),
              (t.dc = new Date(e.timestamp)),
              (t.Bc = 4096),
              (t.Cc = Math.ceil(t.size / t.Bc)),
              t
            )
          },
          hb: function (e, t) {
            void 0 !== t.mode && (e.mode = t.mode),
              void 0 !== t.timestamp && (e.timestamp = t.timestamp),
              void 0 !== t.size && ke.Wc(e, t.size)
          },
          zb: function () {
            throw Te[44]
          },
          Hb: function (e, t, r, n) {
            return ke.createNode(e, t, r, n)
          },
          rc: function (e, t, r) {
            if (16384 == (61440 & e.mode)) {
              try {
                var n = Pe(t, r)
              } catch (e) {}
              if (n) for (var a in n.Za) throw new Fe(55)
            }
            delete e.parent.Za[e.name],
              (e.parent.timestamp = Date.now()),
              (e.name = r),
              (t.Za[r] = e),
              (t.timestamp = e.parent.timestamp),
              (e.parent = t)
          },
          Lb: function (e, t) {
            delete e.Za[t], (e.timestamp = Date.now())
          },
          tc: function (e, t) {
            var r,
              n = Pe(e, t)
            for (r in n.Za) throw new Fe(55)
            delete e.Za[t], (e.timestamp = Date.now())
          },
          qc: function (e) {
            var t,
              r = ['.', '..']
            for (t in e.Za) e.Za.hasOwnProperty(t) && r.push(t)
            return r
          },
          Ib: function (e, t, r) {
            return ((e = ke.createNode(e, t, 41471, 0)).link = r), e
          },
          Cb: function (e) {
            if (40960 != (61440 & e.mode)) throw new Fe(28)
            return e.link
          },
        },
        ab: {
          read: function (e, t, r, n, a) {
            var o = e.node.Za
            if (a >= e.node.bb) return 0
            if (8 < (e = Math.min(e.node.bb - a, n)) && o.subarray) t.set(o.subarray(a, a + e), r)
            else for (n = 0; n < e; n++) t[r + n] = o[a + n]
            return e
          },
          write: function (e, t, n, a, o, i) {
            if ((t.buffer === r().buffer && (i = !1), !a)) return 0
            if ((((e = e.node).timestamp = Date.now()), t.subarray && (!e.Za || e.Za.subarray))) {
              if (i) return (e.Za = t.subarray(n, n + a)), (e.bb = a)
              if (0 === e.bb && 0 === o) return (e.Za = t.slice(n, n + a)), (e.bb = a)
              if (o + a <= e.bb) return e.Za.set(t.subarray(n, n + a), o), a
            }
            if ((ke.ec(e, o + a), e.Za.subarray && t.subarray)) e.Za.set(t.subarray(n, n + a), o)
            else for (i = 0; i < a; i++) e.Za[o + i] = t[n + i]
            return (e.bb = Math.max(e.bb, o + a)), a
          },
          sb: function (e, t, r) {
            if (
              (1 === r
                ? (t += e.position)
                : 2 === r && 32768 == (61440 & e.node.mode) && (t += e.node.bb),
              0 > t)
            )
              throw new Fe(28)
            return t
          },
          Yb: function (e, t, r) {
            ke.ec(e.node, t + r), (e.node.bb = Math.max(e.node.bb, t + r))
          },
          Sb: function (e, t, n, a, o) {
            if (32768 != (61440 & e.node.mode)) throw new Fe(43)
            if (((e = e.node.Za), 2 & o || e.buffer !== x)) {
              if (
                ((0 < n || n + t < e.length) &&
                  (e = e.subarray ? e.subarray(n, n + t) : Array.prototype.slice.call(e, n, n + t)),
                (n = !0),
                ee(),
                !(t = void 0))
              )
                throw new Fe(48)
              r().set(e, t)
            } else (n = !1), (t = e.byteOffset)
            return { eb: t, gd: n }
          },
          nc: function (e, t, r, n, a) {
            if (32768 != (61440 & e.node.mode)) throw new Fe(43)
            return 2 & a || ke.ab.write(e, t, 0, n, r, !1), 0
          },
        },
      },
      Ae = null,
      Se = {},
      Re = [],
      Ee = 1,
      xe = null,
      De = !0,
      Fe = null,
      Te = {},
      Ce = (e, t = {}) => {
        if (!(e = he('/', e))) return { path: '', node: null }
        if (8 < (t = Object.assign({ fc: !0, Ub: 0 }, t)).Ub) throw new Fe(32)
        e = fe(
          e.split('/').filter((e) => !!e),
          !1,
        )
        for (var r = Ae, n = '/', a = 0; a < e.length; a++) {
          var o = a === e.length - 1
          if (o && t.parent) break
          if (
            ((r = Pe(r, e[a])),
            (n = se(n + '/' + e[a])),
            r.Ab && (!o || (o && t.fc)) && (r = r.Ab.root),
            !o || t.Fb)
          )
            for (o = 0; 40960 == (61440 & r.mode); )
              if (((r = Ge(n)), (n = he(le(n), r)), (r = Ce(n, { Ub: t.Ub + 1 }).node), 40 < o++))
                throw new Fe(32)
        }
        return { path: n, node: r }
      },
      je = (e) => {
        for (var t; ; ) {
          if (e === e.parent)
            return (e = e.mb.mc), t ? ('/' !== e[e.length - 1] ? e + '/' + t : e + t) : e
          ;(t = t ? e.name + '/' + t : e.name), (e = e.parent)
        }
      },
      Oe = (e, t) => {
        for (var r = 0, n = 0; n < t.length; n++) r = ((r << 5) - r + t.charCodeAt(n)) | 0
        return ((e + r) >>> 0) % xe.length
      },
      Pe = (e, t) => {
        var r
        if ((r = (r = He(e, 'x')) ? r : e.$a.zb ? 0 : 2)) throw new Fe(r, e)
        for (r = xe[Oe(e.id, t)]; r; r = r.wb) {
          var n = r.name
          if (r.parent.id === e.id && n === t) return r
        }
        return e.$a.zb(e, t)
      },
      Ze = (e, t, r, n) => (
        (e = new Gt(e, t, r, n)), (t = Oe(e.parent.id, e.name)), (e.wb = xe[t]), (xe[t] = e)
      ),
      $e = { r: 0, 'r+': 2, w: 577, 'w+': 578, a: 1089, 'a+': 1090 },
      Ie = (e) => {
        var t = ['r', 'w', 'rw'][3 & e]
        return 512 & e && (t += 'w'), t
      },
      He = (e, t) =>
        De
          ? 0
          : !t.includes('r') || 292 & e.mode
            ? (t.includes('w') && !(146 & e.mode)) || (t.includes('x') && !(73 & e.mode))
              ? 2
              : 0
            : 2,
      Le = (e, t) => {
        try {
          return Pe(e, t), 20
        } catch (e) {}
        return He(e, 'wx')
      },
      Ue = (e, t) => (
        ye ||
          (((ye = function () {
            this.cb = {}
          }).prototype = {}),
          Object.defineProperties(ye.prototype, {
            object: {
              get: function () {
                return this.node
              },
              set: function (e) {
                this.node = e
              },
            },
            flags: {
              get: function () {
                return this.cb.flags
              },
              set: function (e) {
                this.cb.flags = e
              },
            },
            position: {
              get: function () {
                return this.cb.position
              },
              set: function (e) {
                this.cb.position = e
              },
            },
          })),
        (e = Object.assign(new ye(), e)),
        (t = ((e = 0) => {
          for (; 4096 >= e; e++) if (!Re[e]) return e
          throw new Fe(33)
        })(t)),
        (e.rb = t),
        (Re[t] = e)
      ),
      ze = {
        open: (e) => {
          ;(e.ab = Se[e.node.Bb].ab), e.ab.open && e.ab.open(e)
        },
        sb: () => {
          throw new Fe(70)
        },
      },
      qe = (e, t) => {
        Se[e] = { ab: t }
      },
      Ne = (e, t) => {
        var r = '/' === t,
          n = !t
        if (r && Ae) throw new Fe(10)
        if (!r && !n) {
          var a = Ce(t, { fc: !1 })
          if (((t = a.path), (a = a.node).Ab)) throw new Fe(10)
          if (16384 != (61440 & a.mode)) throw new Fe(54)
        }
        ;(t = { type: e, md: {}, mc: t, Sc: [] }),
          ((e = e.mb(t)).mb = t),
          (t.root = e),
          r ? (Ae = e) : a && ((a.Ab = t), a.mb && a.mb.Sc.push(t))
      },
      Be = (e, t, r) => {
        var n = Ce(e, { parent: !0 }).node
        if (!(e = be(e)) || '.' === e || '..' === e) throw new Fe(28)
        var a = Le(n, e)
        if (a) throw new Fe(a)
        if (!n.$a.Hb) throw new Fe(63)
        return n.$a.Hb(n, e, t, r)
      },
      Ye = (e, t, r) => (void 0 === r && ((r = t), (t = 438)), Be(e, 8192 | t, r)),
      We = (e, t) => {
        if (!he(e)) throw new Fe(44)
        var r = Ce(t, { parent: !0 }).node
        if (!r) throw new Fe(44)
        t = be(t)
        var n = Le(r, t)
        if (n) throw new Fe(n)
        if (!r.$a.Ib) throw new Fe(63)
        r.$a.Ib(r, t, e)
      },
      Xe = (e) => {
        var t = Ce(e, { parent: !0 }).node
        if (!t) throw new Fe(44)
        var r = be(e)
        e = Pe(t, r)
        e: {
          try {
            var n = Pe(t, r)
          } catch (e) {
            n = e.lb
            break e
          }
          n = He(t, 'wx') || (16384 == (61440 & n.mode) ? 31 : 0)
        }
        if (n) throw new Fe(n)
        if (!t.$a.Lb) throw new Fe(63)
        if (e.Ab) throw new Fe(10)
        if ((t.$a.Lb(t, r), (t = Oe(e.parent.id, e.name)), xe[t] === e)) xe[t] = e.wb
        else
          for (t = xe[t]; t; ) {
            if (t.wb === e) {
              t.wb = e.wb
              break
            }
            t = t.wb
          }
      },
      Ge = (e) => {
        if (!(e = Ce(e).node)) throw new Fe(44)
        if (!e.$a.Cb) throw new Fe(28)
        return he(je(e.parent), e.$a.Cb(e))
      },
      Ve = (e, t) => {
        if (!(e = 'string' == typeof e ? Ce(e, { Fb: !0 }).node : e).$a.hb) throw new Fe(63)
        e.$a.hb(e, { mode: (4095 & t) | (-4096 & e.mode), timestamp: Date.now() })
      },
      Je = (e, t, r) => {
        if ('' === e) throw new Fe(44)
        if ('string' == typeof t) {
          var n = $e[t]
          if (void 0 === n) throw Error('Unknown file open mode: ' + t)
          t = n
        }
        if (((r = 64 & t ? (4095 & (void 0 === r ? 438 : r)) | 32768 : 0), 'object' == typeof e))
          var a = e
        else {
          e = se(e)
          try {
            a = Ce(e, { Fb: !(131072 & t) }).node
          } catch (e) {}
        }
        if (((n = !1), 64 & t))
          if (a) {
            if (128 & t) throw new Fe(20)
          } else (a = Be(e, r, 0)), (n = !0)
        if (!a) throw new Fe(44)
        if ((8192 == (61440 & a.mode) && (t &= -513), 65536 & t && 16384 != (61440 & a.mode)))
          throw new Fe(54)
        if (
          !n &&
          (r = a
            ? 40960 == (61440 & a.mode)
              ? 32
              : 16384 == (61440 & a.mode) && ('r' !== Ie(t) || 512 & t)
                ? 31
                : He(a, Ie(t))
            : 44)
        )
          throw new Fe(r)
        if (512 & t && !n) {
          if (!(r = 'string' == typeof (r = a) ? Ce(r, { Fb: !0 }).node : r).$a.hb) throw new Fe(63)
          if (16384 == (61440 & r.mode)) throw new Fe(31)
          if (32768 != (61440 & r.mode)) throw new Fe(28)
          if ((n = He(r, 'w'))) throw new Fe(n)
          r.$a.hb(r, { size: 0, timestamp: Date.now() })
        }
        return (
          (t &= -131713),
          (a = Ue({
            node: a,
            path: je(a),
            flags: t,
            seekable: !0,
            position: 0,
            ab: a.ab,
            ed: [],
            error: !1,
          })).ab.open && a.ab.open(a),
          !u.logReadFiles || 1 & t || (ve || (ve = {}), e in ve || (ve[e] = 1)),
          a
        )
      },
      Qe = (e) => {
        if (null === e.rb) throw new Fe(8)
        e.Ob && (e.Ob = null)
        try {
          e.ab.close && e.ab.close(e)
        } catch (e) {
          throw e
        } finally {
          Re[e.rb] = null
        }
        e.rb = null
      },
      Ke = (e, t, r) => {
        if (null === e.rb) throw new Fe(8)
        if (!e.seekable || !e.ab.sb) throw new Fe(70)
        if (0 != r && 1 != r && 2 != r) throw new Fe(28)
        ;(e.position = e.ab.sb(e, t, r)), (e.ed = [])
      },
      et = (e, t, r, n, a, o) => {
        if (0 > n || 0 > a) throw new Fe(28)
        if (null === e.rb) throw new Fe(8)
        if (!(2097155 & e.flags)) throw new Fe(8)
        if (16384 == (61440 & e.node.mode)) throw new Fe(31)
        if (!e.ab.write) throw new Fe(28)
        e.seekable && 1024 & e.flags && Ke(e, 0, 2)
        var i = void 0 !== a
        if (i) {
          if (!e.seekable) throw new Fe(70)
        } else a = e.position
        return (t = e.ab.write(e, t, r, n, a, o)), i || (e.position += t), t
      },
      tt = () => {
        Fe ||
          (((Fe = function (e, t) {
            ;(this.node = t),
              (this.Xc = function (e) {
                this.lb = e
              }),
              this.Xc(e),
              (this.message = 'FS error')
          }).prototype = Error()),
          (Fe.prototype.constructor = Fe),
          [44].forEach((e) => {
            ;(Te[e] = new Fe(e)), (Te[e].stack = '<generic error, no stack>')
          }))
      },
      rt = (e, t, r) => {
        ;(we = !0),
          tt(),
          (u.stdin = e || u.stdin),
          (u.stdout = t || u.stdout),
          (u.stderr = r || u.stderr),
          u.stdin ? it('/dev', 'stdin', u.stdin) : We('/dev/tty', '/dev/stdin'),
          u.stdout ? it('/dev', 'stdout', null, u.stdout) : We('/dev/tty', '/dev/stdout'),
          u.stderr ? it('/dev', 'stderr', null, u.stderr) : We('/dev/tty1', '/dev/stderr'),
          Je('/dev/stdin', 0),
          Je('/dev/stdout', 1),
          Je('/dev/stderr', 1)
      },
      nt = (e, t) => {
        var r = 0
        return e && (r |= 365), t && (r |= 146), r
      },
      at = (e, t) => {
        for (e = 'string' == typeof e ? e : je(e), t = t.split('/').reverse(); t.length; ) {
          var r = t.pop()
          if (r) {
            var n = se(e + '/' + r)
            try {
              Be(n, 16895, 0)
            } catch (e) {}
            e = n
          }
        }
        return n
      },
      ot = (e, t, r, n, a, o) => {
        var i = t
        if (
          (e && ((e = 'string' == typeof e ? e : je(e)), (i = t ? se(e + '/' + t) : e)),
          (e = nt(n, a)),
          (i = Be(i, (4095 & (void 0 !== e ? e : 438)) | 32768, 0)),
          r)
        ) {
          if ('string' == typeof r) {
            for (t = Array(r.length), n = 0, a = r.length; n < a; ++n) t[n] = r.charCodeAt(n)
            r = t
          }
          Ve(i, 146 | e), (t = Je(i, 577)), et(t, r, 0, r.length, 0, o), Qe(t), Ve(i, e)
        }
        return i
      },
      it = (e, t, r, n) => {
        ;(e = se(('string' == typeof e ? e : je(e)) + '/' + t)),
          (t = nt(!!r, !!n)),
          it.lc || (it.lc = 64)
        var a = it.lc++ << 8
        return (
          qe(a, {
            open: (e) => {
              e.seekable = !1
            },
            close: () => {
              n && n.buffer && n.buffer.length && n(10)
            },
            read: (e, t, n, a) => {
              for (var o = 0, i = 0; i < a; i++) {
                try {
                  var u = r()
                } catch (e) {
                  throw new Fe(29)
                }
                if (void 0 === u && 0 === o) throw new Fe(6)
                if (null == u) break
                o++, (t[n + i] = u)
              }
              return o && (e.node.timestamp = Date.now()), o
            },
            write: (e, t, r, a) => {
              for (var o = 0; o < a; o++)
                try {
                  n(t[r + o])
                } catch (e) {
                  throw new Fe(29)
                }
              return a && (e.node.timestamp = Date.now()), o
            },
          }),
          Ye(e, t, a)
        )
      },
      ut = (e) => {
        if (!(e.Qc || e.Rc || e.link || e.Za)) {
          if ('undefined' != typeof XMLHttpRequest)
            throw Error(
              'Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.',
            )
          if (!s) throw Error('Cannot load without read() or XMLHttpRequest.')
          try {
            ;(e.Za = de(s(e.url), !0)), (e.bb = e.Za.length)
          } catch (e) {
            throw new Fe(29)
          }
        }
      },
      ct = (e, t, r, n, a) => {
        function o() {
          ;(this.Rb = !1), (this.cb = [])
        }
        if (
          ((o.prototype.get = function (e) {
            if (!(e > this.length - 1 || 0 > e)) {
              var t = e % this.cc
              return this.jc((e / this.cc) | 0)[t]
            }
          }),
          (o.prototype.qb = function (e) {
            this.jc = e
          }),
          (o.prototype.ac = function () {
            var e = new XMLHttpRequest()
            if (
              (e.open('HEAD', r, !1),
              e.send(null),
              !((200 <= e.status && 300 > e.status) || 304 === e.status))
            )
              throw Error("Couldn't load " + r + '. Status: ' + e.status)
            var t,
              n = Number(e.getResponseHeader('Content-length')),
              a = (t = e.getResponseHeader('Accept-Ranges')) && 'bytes' === t
            e = (t = e.getResponseHeader('Content-Encoding')) && 'gzip' === t
            var o = 1048576
            a || (o = n)
            var i = this
            i.qb((e) => {
              var t = e * o,
                a = (e + 1) * o - 1
              if (((a = Math.min(a, n - 1)), void 0 === i.cb[e])) {
                var u = i.cb
                if (t > a)
                  throw Error('invalid range (' + t + ', ' + a + ') or no bytes requested!')
                if (a > n - 1) throw Error('only ' + n + ' bytes available! programmer error!')
                var c = new XMLHttpRequest()
                if (
                  (c.open('GET', r, !1),
                  n !== o && c.setRequestHeader('Range', 'bytes=' + t + '-' + a),
                  (c.responseType = 'arraybuffer'),
                  c.overrideMimeType && c.overrideMimeType('text/plain; charset=x-user-defined'),
                  c.send(null),
                  !((200 <= c.status && 300 > c.status) || 304 === c.status))
                )
                  throw Error("Couldn't load " + r + '. Status: ' + c.status)
                ;(t =
                  void 0 !== c.response
                    ? new Uint8Array(c.response || [])
                    : de(c.responseText || '', !0)),
                  (u[e] = t)
              }
              if (void 0 === i.cb[e]) throw Error('doXHR failed!')
              return i.cb[e]
            }),
              (!e && n) ||
                ((o = n = 1),
                (o = n = this.jc(0).length),
                k('LazyFiles on gzip forces download of the whole file when length is accessed')),
              (this.yc = n),
              (this.xc = o),
              (this.Rb = !0)
          }),
          'undefined' != typeof XMLHttpRequest)
        ) {
          if (!w)
            throw 'Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc'
          var i = new o()
          Object.defineProperties(i, {
            length: {
              get: function () {
                return this.Rb || this.ac(), this.yc
              },
            },
            cc: {
              get: function () {
                return this.Rb || this.ac(), this.xc
              },
            },
          })
          var u = void 0
        } else (u = r), (i = void 0)
        var c = ((e, t, r, n) => (
          (e = se(('string' == typeof e ? e : je(e)) + '/' + t)),
          (r = nt(r, n)),
          Be(e, (4095 & (void 0 !== r ? r : 438)) | 32768, 0)
        ))(e, t, n, a)
        i ? (c.Za = i) : u && ((c.Za = null), (c.url = u)),
          Object.defineProperties(c, {
            bb: {
              get: function () {
                return this.Za.length
              },
            },
          })
        var f = {}
        return (
          Object.keys(c.ab).forEach((e) => {
            var t = c.ab[e]
            f[e] = function () {
              return ut(c), t.apply(null, arguments)
            }
          }),
          (f.read = (e, t, r, n, a) => {
            if ((ut(c), a >= (e = e.node.Za).length)) t = 0
            else {
              if (((n = Math.min(e.length - a, n)), e.slice))
                for (var o = 0; o < n; o++) t[r + o] = e[a + o]
              else for (o = 0; o < n; o++) t[r + o] = e.get(a + o)
              t = n
            }
            return t
          }),
          (f.Sb = () => {
            throw (ut(c), ee(), new Fe(48))
          }),
          (c.ab = f),
          c
        )
      },
      ft = (e, t, r, n, a, o, i, u, c, f) => {
        function s(r) {
          function s(r) {
            f && f(), u || ot(e, t, r, n, a, c), o && o(), K()
          }
          ;(void 0).ld(r, b, s, () => {
            i && i(), K()
          }) || s(r)
        }
        var b = t ? he(se(e + '/' + t)) : e
        Q(),
          'string' == typeof r
            ? (function (e, t, r) {
                var n = 'al ' + e
                l(
                  e,
                  (t) => {
                    t || ee('Loading data file "' + e + '" failed (no arrayBuffer).'),
                      s(new Uint8Array(t)),
                      n && K()
                  },
                  () => {
                    if (!r) throw 'Loading data file "' + e + '" failed.'
                    r()
                  },
                ),
                  n && Q()
              })(r, 0, i)
            : s(r)
      },
      st = void 0
    function lt() {
      return (st += 4), a()[(st - 4) >> 2]
    }
    function bt(e) {
      if (!(e = Re[e])) throw new Fe(8)
      return e
    }
    function ht(e) {
      if (v) return Pt(1, 1, e)
      S || (pt.Zc(), u.onExit && u.onExit(e), (P = !0)), p(e, new ie(e))
    }
    function dt(e, t) {
      if (!t && v) throw (wt(e), 'unwind')
      ht(e)
    }
    var pt = {
      pb: [],
      Eb: [],
      wc: [],
      ob: {},
      Pb: function () {
        v ? pt.Oc() : pt.Nc()
      },
      Nc: function () {
        for (var e = 1 + navigator.hardwareConcurrency; e--; ) pt.Zb()
      },
      Oc: function () {
        ;(pt.receiveObjectTransfer = pt.Uc),
          (pt.threadInitTLS = pt.vc),
          (pt.setExitStatus = pt.uc),
          (S = !1)
      },
      uc: function () {},
      Zc: function () {
        for (var e of Object.values(pt.ob)) pt.sc(e)
        for (e of pt.pb) e.terminate()
        pt.pb = []
      },
      sc: function (e) {
        var t = e.nb
        delete pt.ob[t], pt.pb.push(e), pt.Eb.splice(pt.Eb.indexOf(e), 1), (e.nb = 0), ir(t)
      },
      Uc: function () {},
      vc: function () {
        pt.wc.forEach((e) => e())
      },
      kc: function (t, r) {
        ;(t.onmessage = (e) => {
          var n = (e = e.data).cmd
          if ((t.nb && (pt.Ec = t.nb), e.targetThread && e.targetThread != er())) {
            var a = pt.ob[e.nd]
            a
              ? a.postMessage(e, e.transferList)
              : A(
                  'Internal error! Worker sent a message "' +
                    n +
                    '" to target pthread ' +
                    e.targetThread +
                    ', but that thread no longer exists!',
                )
          } else
            'processProxyingQueue' === n
              ? Ot(e.queue)
              : 'spawnThread' === n
                ? ce(e)
                : 'cleanupThread' === n
                  ? ue(e.thread)
                  : 'killThread' === n
                    ? ((e = e.thread),
                      (n = pt.ob[e]),
                      delete pt.ob[e],
                      n.terminate(),
                      ir(e),
                      pt.Eb.splice(pt.Eb.indexOf(n), 1),
                      (n.nb = 0))
                    : 'cancelThread' === n
                      ? pt.ob[e.thread].postMessage({ cmd: 'cancel' })
                      : 'loaded' === n
                        ? ((t.loaded = !0), r && r(t), t.Db && (t.Db(), delete t.Db))
                        : 'print' === n
                          ? k('Thread ' + e.threadId + ': ' + e.text)
                          : 'printErr' === n
                            ? A('Thread ' + e.threadId + ': ' + e.text)
                            : 'alert' === n
                              ? alert('Thread ' + e.threadId + ': ' + e.text)
                              : 'setimmediate' === e.target
                                ? t.postMessage(e)
                                : 'onAbort' === n
                                  ? u.onAbort && u.onAbort(e.arg)
                                  : n && A('worker sent an unknown command ' + n)
          pt.Ec = void 0
        }),
          (t.onerror = (e) => {
            throw (A('worker sent an error! ' + e.filename + ':' + e.lineno + ': ' + e.message), e)
          }),
          t.postMessage({
            cmd: 'load',
            urlOrBlob: u.mainScriptUrlOrBlob || e,
            wasmMemory: R,
            wasmModule: E,
          })
      },
      Zb: function () {
        var e = _('rapfi-multi.worker.js')
        pt.pb.push(new Worker(e))
      },
      Jc: function () {
        return 0 == pt.pb.length && (pt.Zb(), pt.kc(pt.pb[0])), pt.pb.pop()
      },
    }
    function mt(e) {
      for (; 0 < e.length; ) e.shift()(u)
    }
    function wt(e) {
      if (v) return Pt(2, 0, e)
      try {
        dt(e)
      } catch (e) {
        e instanceof ie || 'unwind' == e || p(1, e)
      }
    }
    ;(u.PThread = pt),
      (u.establishStackSpace = function () {
        var e = er(),
          t = a()[(e + 44) >> 2]
        ;(e = a()[(e + 48) >> 2]), sr(t, t - e), br(t)
      })
    var yt = []
    function vt(e) {
      var t = yt[e]
      return t || (e >= yt.length && (yt.length = e + 1), (yt[e] = t = z.get(e))), t
    }
    function gt(e, t) {
      r().set(e, t)
    }
    u.invokeEntryPoint = function (e, t) {
      ;(e = vt(e)(t)), S ? pt.uc(e) : ur(e)
    }
    var _t,
      Mt,
      kt = [],
      At = 0,
      St = 0
    function Rt(e) {
      ;(this.yb = e),
        (this.eb = e - 24),
        (this.Mc = function (e) {
          o()[(this.eb + 4) >> 2] = e
        }),
        (this.cb = function () {
          return o()[(this.eb + 4) >> 2]
        }),
        (this.Hc = function (e) {
          o()[(this.eb + 8) >> 2] = e
        }),
        (this.Kc = function () {
          return o()[(this.eb + 8) >> 2]
        }),
        (this.Ic = function () {
          a()[this.eb >> 2] = 0
        }),
        (this.Vb = function (e) {
          ;(e = e ? 1 : 0), (r()[(this.eb + 12) | 0] = e)
        }),
        (this.Dc = function () {
          return 0 != r()[(this.eb + 12) | 0]
        }),
        (this.Wb = function (e) {
          ;(e = e ? 1 : 0), (r()[(this.eb + 13) | 0] = e)
        }),
        (this.ic = function () {
          return 0 != r()[(this.eb + 13) | 0]
        }),
        (this.Pb = function (e, t) {
          this.qb(0), this.Mc(e), this.Hc(t), this.Ic(), this.Vb(!1), this.Wb(!1)
        }),
        (this.Mb = function () {
          Atomics.add(a(), this.eb >> 2, 1)
        }),
        (this.Vc = function () {
          return 1 === Atomics.sub(a(), this.eb >> 2, 1)
        }),
        (this.qb = function (e) {
          o()[(this.eb + 16) >> 2] = e
        }),
        (this.Ac = function () {
          return o()[(this.eb + 16) >> 2]
        }),
        (this.Gc = function () {
          if (pr(this.cb())) return o()[this.yb >> 2]
          var e = this.Ac()
          return 0 !== e ? e : this.yb
        })
    }
    function Et(e) {
      return Qt(new Rt(e).eb)
    }
    function xt(e, t, r, n) {
      return v ? Pt(3, 1, e, t, r, n) : Dt(e, t, r, n)
    }
    function Dt(e, t, r, n) {
      if ('undefined' == typeof SharedArrayBuffer)
        return (
          A('Current environment does not support SharedArrayBuffer, pthreads are not available!'),
          6
        )
      var a = []
      return v && 0 === a.length
        ? xt(e, t, r, n)
        : ((e = { Yc: r, nb: e, zc: n, dd: a }),
          v ? ((e.hd = 'spawnThread'), postMessage(e, a), 0) : ce(e))
    }
    function Ft(e, t, r) {
      if (v) return Pt(4, 1, e, t, r)
      st = r
      try {
        var n = bt(e)
        switch (t) {
          case 0:
            var o = lt()
            return 0 > o ? -28 : Ue(n, o).rb
          case 1:
          case 2:
          case 6:
          case 7:
            return 0
          case 3:
            return n.flags
          case 4:
            return (o = lt()), (n.flags |= o), 0
          case 5:
            return (o = lt()), R.buffer != x && L(R.buffer), (T[(o + 0) >> 1] = 2), 0
          case 16:
          case 8:
          default:
            return -28
          case 9:
            return (a()[tr() >> 2] = 28), -1
        }
      } catch (e) {
        if (!(e instanceof Fe)) throw e
        return -e.lb
      }
    }
    function Tt(e, t, r) {
      if (v) return Pt(5, 1, e, t, r)
      st = r
      try {
        var n = bt(e)
        switch (t) {
          case 21509:
          case 21505:
          case 21510:
          case 21511:
          case 21512:
          case 21506:
          case 21507:
          case 21508:
          case 21523:
          case 21524:
            return n.fb ? 0 : -59
          case 21519:
            if (!n.fb) return -59
            var o = lt()
            return (a()[o >> 2] = 0)
          case 21520:
            return n.fb ? -28 : -59
          case 21531:
            if (((e = o = lt()), !n.ab.Pc)) throw new Fe(59)
            return n.ab.Pc(n, t, e)
          default:
            return -28
        }
      } catch (e) {
        if (!(e instanceof Fe)) throw e
        return -e.lb
      }
    }
    function Ct(e, t, r, n) {
      if (v) return Pt(6, 1, e, t, r, n)
      st = n
      try {
        var a = (t = I(t))
        if ('/' === a.charAt(0)) t = a
        else {
          var o = -100 === e ? '/' : bt(e).path
          if (0 == a.length) throw new Fe(44)
          t = se(o + '/' + a)
        }
        var i = n ? lt() : 0
        return Je(t, r, i).rb
      } catch (e) {
        if (!(e instanceof Fe)) throw e
        return -e.lb
      }
    }
    function jt(e, t) {
      if (v) return Pt(7, 1, e, t)
      try {
        e = I(e)
        e: {
          try {
            var r = Ce(e, { Fb: !0 }).node
            if (!r) throw new Fe(44)
            if (!r.$a.ib) throw new Fe(63)
            var n = r.$a.ib(r)
          } catch (t) {
            if (t && t.node && se(e) !== se(je(t.node))) {
              var i = -54
              break e
            }
            throw t
          }
          ;(a()[t >> 2] = n.Fc),
            (a()[(t + 8) >> 2] = n.Qb),
            (a()[(t + 12) >> 2] = n.mode),
            (o()[(t + 16) >> 2] = n.Tc),
            (a()[(t + 20) >> 2] = n.uid),
            (a()[(t + 24) >> 2] = n.Lc),
            (a()[(t + 28) >> 2] = n.Bb),
            (ae = [
              n.size >>> 0,
              ((ne = n.size),
              1 <= +Math.abs(ne)
                ? 0 < ne
                  ? (0 | Math.min(+Math.floor(ne / 4294967296), 4294967295)) >>> 0
                  : ~~+Math.ceil((ne - +(~~ne >>> 0)) / 4294967296) >>> 0
                : 0),
            ]),
            (a()[(t + 40) >> 2] = ae[0]),
            (a()[(t + 44) >> 2] = ae[1]),
            (a()[(t + 48) >> 2] = 4096),
            (a()[(t + 52) >> 2] = n.Cc),
            (ae = [
              Math.floor(n.$b.getTime() / 1e3) >>> 0,
              ((ne = Math.floor(n.$b.getTime() / 1e3)),
              1 <= +Math.abs(ne)
                ? 0 < ne
                  ? (0 | Math.min(+Math.floor(ne / 4294967296), 4294967295)) >>> 0
                  : ~~+Math.ceil((ne - +(~~ne >>> 0)) / 4294967296) >>> 0
                : 0),
            ]),
            (a()[(t + 56) >> 2] = ae[0]),
            (a()[(t + 60) >> 2] = ae[1]),
            (o()[(t + 64) >> 2] = 0),
            (ae = [
              Math.floor(n.oc.getTime() / 1e3) >>> 0,
              ((ne = Math.floor(n.oc.getTime() / 1e3)),
              1 <= +Math.abs(ne)
                ? 0 < ne
                  ? (0 | Math.min(+Math.floor(ne / 4294967296), 4294967295)) >>> 0
                  : ~~+Math.ceil((ne - +(~~ne >>> 0)) / 4294967296) >>> 0
                : 0),
            ]),
            (a()[(t + 72) >> 2] = ae[0]),
            (a()[(t + 76) >> 2] = ae[1]),
            (o()[(t + 80) >> 2] = 0),
            (ae = [
              Math.floor(n.dc.getTime() / 1e3) >>> 0,
              ((ne = Math.floor(n.dc.getTime() / 1e3)),
              1 <= +Math.abs(ne)
                ? 0 < ne
                  ? (0 | Math.min(+Math.floor(ne / 4294967296), 4294967295)) >>> 0
                  : ~~+Math.ceil((ne - +(~~ne >>> 0)) / 4294967296) >>> 0
                : 0),
            ]),
            (a()[(t + 88) >> 2] = ae[0]),
            (a()[(t + 92) >> 2] = ae[1]),
            (o()[(t + 96) >> 2] = 0),
            (ae = [
              n.Qb >>> 0,
              ((ne = n.Qb),
              1 <= +Math.abs(ne)
                ? 0 < ne
                  ? (0 | Math.min(+Math.floor(ne / 4294967296), 4294967295)) >>> 0
                  : ~~+Math.ceil((ne - +(~~ne >>> 0)) / 4294967296) >>> 0
                : 0),
            ]),
            (a()[(t + 104) >> 2] = ae[0]),
            (a()[(t + 108) >> 2] = ae[1]),
            (i = 0)
        }
        return i
      } catch (e) {
        if (!(e instanceof Fe)) throw e
        return -e.lb
      }
    }
    function Ot(e) {
      Atomics.store(a(), e >> 2, 1), er() && or(e), Atomics.compareExchange(a(), e >> 2, 1, 0)
    }
    function Pt(e, t) {
      var r = arguments.length - 2,
        n = arguments
      return (function (e) {
        var t = lr()
        return (e = e()), br(t), e
      })(() => {
        for (var a = hr(8 * r), o = a >> 3, u = 0; u < r; u++) {
          var c = n[2 + u]
          i()[o + u] = c
        }
        return ar(e, r, a, t)
      })
    }
    ;(u.executeNotifiedProxyingQueue = Ot),
      (Mt = v ? () => performance.now() - u.__performance_now_clock_drift : () => performance.now())
    var Zt,
      $t = [],
      It = {}
    function Ht() {
      if (!Zt) {
        var e,
          t = {
            USER: 'web_user',
            LOGNAME: 'web_user',
            PATH: '/',
            PWD: '/',
            HOME: '/home/web_user',
            LANG:
              (
                ('object' == typeof navigator && navigator.languages && navigator.languages[0]) ||
                'C'
              ).replace('-', '_') + '.UTF-8',
            _: d || './this.program',
          }
        for (e in It) void 0 === It[e] ? delete t[e] : (t[e] = It[e])
        var r = []
        for (e in t) r.push(e + '=' + t[e])
        Zt = r
      }
      return Zt
    }
    function Lt(e, t) {
      if (v) return Pt(8, 1, e, t)
      var n = 0
      return (
        Ht().forEach(function (a, i) {
          var u = t + n
          for (i = o()[(e + 4 * i) >> 2] = u, u = 0; u < a.length; ++u)
            r()[0 | i++] = a.charCodeAt(u)
          ;(r()[0 | i] = 0), (n += a.length + 1)
        }),
        0
      )
    }
    function Ut(e, t) {
      if (v) return Pt(9, 1, e, t)
      var r = Ht()
      o()[e >> 2] = r.length
      var n = 0
      return (
        r.forEach(function (e) {
          n += e.length + 1
        }),
        (o()[t >> 2] = n),
        0
      )
    }
    function zt(e) {
      if (v) return Pt(10, 1, e)
      try {
        var t = bt(e)
        return Qe(t), 0
      } catch (e) {
        if (!(e instanceof Fe)) throw e
        return e.lb
      }
    }
    function qt(e, t, n, a) {
      if (v) return Pt(11, 1, e, t, n, a)
      try {
        e: {
          var i = bt(e)
          e = t
          for (var u = (t = 0); u < n; u++) {
            var c = o()[e >> 2],
              f = o()[(e + 4) >> 2]
            e += 8
            var s = i,
              l = r(),
              b = c,
              h = f,
              d = void 0
            if (0 > h || 0 > d) throw new Fe(28)
            if (null === s.rb) throw new Fe(8)
            if (1 == (2097155 & s.flags)) throw new Fe(8)
            if (16384 == (61440 & s.node.mode)) throw new Fe(31)
            if (!s.ab.read) throw new Fe(28)
            var p = void 0 !== d
            if (p) {
              if (!s.seekable) throw new Fe(70)
            } else d = s.position
            var m = s.ab.read(s, l, b, h, d)
            p || (s.position += m)
            var w = m
            if (0 > w) {
              var y = -1
              break e
            }
            if (((t += w), w < f)) break
          }
          y = t
        }
        return (o()[a >> 2] = y), 0
      } catch (e) {
        if (!(e instanceof Fe)) throw e
        return e.lb
      }
    }
    function Nt(e, t, r, n, o) {
      if (v) return Pt(12, 1, e, t, r, n, o)
      try {
        if (
          ((t = (r + 2097152) >>> 0 < 4194305 - !!t ? (t >>> 0) + 4294967296 * r : NaN), isNaN(t))
        )
          return 61
        var i = bt(e)
        return (
          Ke(i, t, n),
          (ae = [
            i.position >>> 0,
            ((ne = i.position),
            1 <= +Math.abs(ne)
              ? 0 < ne
                ? (0 | Math.min(+Math.floor(ne / 4294967296), 4294967295)) >>> 0
                : ~~+Math.ceil((ne - +(~~ne >>> 0)) / 4294967296) >>> 0
              : 0),
          ]),
          (a()[o >> 2] = ae[0]),
          (a()[(o + 4) >> 2] = ae[1]),
          i.Ob && 0 === t && 0 === n && (i.Ob = null),
          0
        )
      } catch (e) {
        if (!(e instanceof Fe)) throw e
        return e.lb
      }
    }
    function Bt(e, t, n, a) {
      if (v) return Pt(13, 1, e, t, n, a)
      try {
        e: {
          var i = bt(e)
          e = t
          for (var u = (t = 0); u < n; u++) {
            var c = o()[e >> 2],
              f = o()[(e + 4) >> 2]
            e += 8
            var s = et(i, r(), c, f)
            if (0 > s) {
              var l = -1
              break e
            }
            t += s
          }
          l = t
        }
        return (o()[a >> 2] = l), 0
      } catch (e) {
        if (!(e instanceof Fe)) throw e
        return e.lb
      }
    }
    function Yt(e) {
      return 0 == e % 4 && (0 != e % 100 || 0 == e % 400)
    }
    var Wt = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
      Xt = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
    function Gt(e, t, r, n) {
      e || (e = this),
        (this.parent = e),
        (this.mb = e.mb),
        (this.Ab = null),
        (this.id = Ee++),
        (this.name = t),
        (this.mode = r),
        (this.$a = {}),
        (this.ab = {}),
        (this.Bb = n)
    }
    pt.Pb(),
      Object.defineProperties(Gt.prototype, {
        read: {
          get: function () {
            return !(365 & ~this.mode)
          },
          set: function (e) {
            e ? (this.mode |= 365) : (this.mode &= -366)
          },
        },
        write: {
          get: function () {
            return !(146 & ~this.mode)
          },
          set: function (e) {
            e ? (this.mode |= 146) : (this.mode &= -147)
          },
        },
        Rc: {
          get: function () {
            return 16384 == (61440 & this.mode)
          },
        },
        Qc: {
          get: function () {
            return 8192 == (61440 & this.mode)
          },
        },
      }),
      tt(),
      (xe = Array(4096)),
      Ne(ke, '/'),
      Be('/tmp', 16895, 0),
      Be('/home', 16895, 0),
      Be('/home/web_user', 16895, 0),
      (() => {
        Be('/dev', 16895, 0),
          qe(259, { read: () => 0, write: (e, t, r, n) => n }),
          Ye('/dev/null', 259),
          me(1280, _e),
          me(1536, Me),
          Ye('/dev/tty', 1280),
          Ye('/dev/tty1', 1536)
        var e = (function () {
          if ('object' == typeof crypto && 'function' == typeof crypto.getRandomValues) {
            var e = new Uint8Array(1)
            return () => (crypto.getRandomValues(e), e[0])
          }
          return () => ee('randomDevice')
        })()
        it('/dev', 'random', e),
          it('/dev', 'urandom', e),
          Be('/dev/shm', 16895, 0),
          Be('/dev/shm/tmp', 16895, 0)
      })(),
      (() => {
        Be('/proc', 16895, 0)
        var e = Be('/proc/self', 16895, 0)
        Be('/proc/self/fd', 16895, 0),
          Ne(
            {
              mb: () => {
                var t = Ze(e, 'fd', 16895, 73)
                return (
                  (t.$a = {
                    zb: (e, t) => {
                      var r = Re[+t]
                      if (!r) throw new Fe(8)
                      return ((e = {
                        parent: null,
                        mb: { mc: 'fake' },
                        $a: { Cb: () => r.path },
                      }).parent = e)
                    },
                  }),
                  t
                )
              },
            },
            '/proc/self/fd',
          )
      })(),
      (u.FS_createPath = at),
      (u.FS_createDataFile = ot),
      (u.FS_createPreloadedFile = ft),
      (u.FS_unlink = Xe),
      (u.FS_createLazyFile = ct),
      (u.FS_createDevice = it)
    var Vt = [null, ht, wt, xt, Ft, Tt, Ct, jt, Lt, Ut, zt, qt, Nt, Bt],
      Jt = {
        m: function (e) {
          return Kt(e + 24) + 24
        },
        o: function (e) {
          return (e = new Rt(e)).Dc() || (e.Vb(!0), At--), e.Wb(!1), kt.push(e), e.Mb(), e.Gc()
        },
        p: function () {
          cr(0)
          var e = kt.pop()
          if (e.Vc() && !e.ic()) {
            var t = e.Kc()
            t && vt(t)(e.yb), Et(e.yb)
          }
          St = 0
        },
        b: function () {
          var e = St
          if (!e) return fr(0), 0
          var t = new Rt(e)
          t.qb(e)
          var r = t.cb()
          if (!r) return fr(0), e
          for (var n = 0; n < arguments.length; n++) {
            var a = arguments[n]
            if (0 === a || a === r) break
            if (dr(a, r, t.eb + 16)) return fr(a), e
          }
          return fr(r), e
        },
        g: function () {
          var e = St
          if (!e) return fr(0), 0
          var t = new Rt(e)
          t.qb(e)
          var r = t.cb()
          if (!r) return fr(0), e
          for (var n = 0; n < arguments.length; n++) {
            var a = arguments[n]
            if (0 === a || a === r) break
            if (dr(a, r, t.eb + 16)) return fr(a), e
          }
          return fr(r), e
        },
        r: function () {
          var e = St
          if (!e) return fr(0), 0
          var t = new Rt(e)
          t.qb(e)
          var r = t.cb()
          if (!r) return fr(0), e
          for (var n = 0; n < arguments.length; n++) {
            var a = arguments[n]
            if (0 === a || a === r) break
            if (dr(a, r, t.eb + 16)) return fr(a), e
          }
          return fr(r), e
        },
        n: Et,
        K: function () {
          var e = kt.pop()
          e || ee('no exception to throw')
          var t = e.yb
          throw (e.ic() || (kt.push(e), e.Wb(!0), e.Vb(!1), At++), (St = t), t)
        },
        q: function (e, t, r) {
          throw (new Rt(e).Pb(t, r), (St = e), At++, e)
        },
        ja: function () {
          return At
        },
        ra: function (e) {
          rr(e, !w, 1, !m), pt.vc()
        },
        O: function (e) {
          v ? postMessage({ cmd: 'cleanupThread', thread: e }) : ue(e)
        },
        na: Dt,
        f: function (e) {
          throw (St || (St = e), e)
        },
        M: Ft,
        ia: Tt,
        ka: Ct,
        da: jt,
        oa: function () {
          return 2097152
        },
        sa: function () {
          return !0
        },
        ta: function (e, t, r, n) {
          if (e == t) setTimeout(() => Ot(n))
          else if (v) postMessage({ targetThread: e, cmd: 'processProxyingQueue', queue: n })
          else {
            if (!(e = pt.ob[e])) return
            e.postMessage({ cmd: 'processProxyingQueue', queue: n })
          }
          return 1
        },
        qa: function () {
          return -1
        },
        G: function () {
          ee('')
        },
        P: function () {
          w ||
            (_t || (_t = {}),
            _t[
              'Blocking on the main thread is very dangerous, see https://emscripten.org/docs/porting/pthreads.html#blocking-on-the-main-browser-thread'
            ] ||
              ((_t[
                'Blocking on the main thread is very dangerous, see https://emscripten.org/docs/porting/pthreads.html#blocking-on-the-main-browser-thread'
              ] = 1),
              A(
                'Blocking on the main thread is very dangerous, see https://emscripten.org/docs/porting/pthreads.html#blocking-on-the-main-browser-thread',
              )))
        },
        w: Mt,
        U: function (e, t, r) {
          n().copyWithin(e, t, t + r)
        },
        ca: function () {
          return navigator.hardwareConcurrency
        },
        pa: function (e, t, r) {
          ;($t.length = t), (r >>= 3)
          for (var n = 0; n < t; n++) $t[n] = i()[r + n]
          return (0 > e ? oe[-e - 1] : Vt[e]).apply(null, $t)
        },
        ma: function (e) {
          var t = n().length
          if ((e >>>= 0) <= t || 1073741824 < e) return !1
          for (var r = 1; 4 >= r; r *= 2) {
            var a = t * (1 + 0.2 / r)
            a = Math.min(a, e + 100663296)
            var o = Math
            ;(a = Math.max(e, a)),
              (o = o.min.call(o, 1073741824, a + ((65536 - (a % 65536)) % 65536)))
            e: {
              try {
                R.grow((o - x.byteLength + 65535) >>> 16), L(R.buffer)
                var i = 1
                break e
              } catch (e) {}
              i = void 0
            }
            if (i) return !0
          }
          return !1
        },
        Q: function () {
          throw 'unwind'
        },
        fa: Lt,
        ga: Ut,
        H: dt,
        N: zt,
        ha: qt,
        $: Nt,
        la: Bt,
        ba: function (e, t) {
          var r = lr()
          try {
            return vt(e)(t)
          } catch (e) {
            if ((br(r), e !== e + 0)) throw e
            cr(1, 0)
          }
        },
        aa: function (e, t, r) {
          var n = lr()
          try {
            return vt(e)(t, r)
          } catch (e) {
            if ((br(n), e !== e + 0)) throw e
            cr(1, 0)
          }
        },
        F: function (e) {
          var t = lr()
          try {
            return vt(e)()
          } catch (e) {
            if ((br(t), e !== e + 0)) throw e
            cr(1, 0)
          }
        },
        d: function (e, t) {
          var r = lr()
          try {
            return vt(e)(t)
          } catch (e) {
            if ((br(r), e !== e + 0)) throw e
            cr(1, 0)
          }
        },
        L: function (e, t, r) {
          var n = lr()
          try {
            return vt(e)(t, r)
          } catch (e) {
            if ((br(n), e !== e + 0)) throw e
            cr(1, 0)
          }
        },
        E: function (e, t, r) {
          var n = lr()
          try {
            return vt(e)(t, r)
          } catch (e) {
            if ((br(n), e !== e + 0)) throw e
            cr(1, 0)
          }
        },
        c: function (e, t, r) {
          var n = lr()
          try {
            return vt(e)(t, r)
          } catch (e) {
            if ((br(n), e !== e + 0)) throw e
            cr(1, 0)
          }
        },
        e: function (e, t, r, n) {
          var a = lr()
          try {
            return vt(e)(t, r, n)
          } catch (e) {
            if ((br(a), e !== e + 0)) throw e
            cr(1, 0)
          }
        },
        D: function (e, t, r, n, a) {
          var o = lr()
          try {
            return vt(e)(t, r, n, a)
          } catch (e) {
            if ((br(o), e !== e + 0)) throw e
            cr(1, 0)
          }
        },
        J: function (e, t, r, n, a, o) {
          var i = lr()
          try {
            return vt(e)(t, r, n, a, o)
          } catch (e) {
            if ((br(i), e !== e + 0)) throw e
            cr(1, 0)
          }
        },
        z: function (e, t, r, n, a, o) {
          var i = lr()
          try {
            return vt(e)(t, r, n, a, o)
          } catch (e) {
            if ((br(i), e !== e + 0)) throw e
            cr(1, 0)
          }
        },
        C: function (e, t, r, n, a, o) {
          var i = lr()
          try {
            return vt(e)(t, r, n, a, o)
          } catch (e) {
            if ((br(i), e !== e + 0)) throw e
            cr(1, 0)
          }
        },
        v: function (e, t, r, n, a, o, i) {
          var u = lr()
          try {
            return vt(e)(t, r, n, a, o, i)
          } catch (e) {
            if ((br(u), e !== e + 0)) throw e
            cr(1, 0)
          }
        },
        I: function (e, t, r, n, a, o, i, u) {
          var c = lr()
          try {
            return vt(e)(t, r, n, a, o, i, u)
          } catch (e) {
            if ((br(c), e !== e + 0)) throw e
            cr(1, 0)
          }
        },
        B: function (e, t, r, n, a, o, i, u, c, f, s, l) {
          var b = lr()
          try {
            return vt(e)(t, r, n, a, o, i, u, c, f, s, l)
          } catch (e) {
            if ((br(b), e !== e + 0)) throw e
            cr(1, 0)
          }
        },
        S: function (e, t, r, n, a, o, i) {
          var u = lr()
          try {
            return vr(e, t, r, n, a, o, i)
          } catch (e) {
            if ((br(u), e !== e + 0)) throw e
            cr(1, 0)
          }
        },
        T: function (e, t, r, n, a, o) {
          var i = lr()
          try {
            return Ar(e, t, r, n, a, o)
          } catch (e) {
            if ((br(i), e !== e + 0)) throw e
            cr(1, 0)
          }
        },
        V: function (e, t, r, n, a) {
          var o = lr()
          try {
            return kr(e, t, r, n, a)
          } catch (e) {
            if ((br(o), e !== e + 0)) throw e
            cr(1, 0)
          }
        },
        _: function (e, t, r, n) {
          var a = lr()
          try {
            return mr(e, t, r, n)
          } catch (e) {
            if ((br(a), e !== e + 0)) throw e
            cr(1, 0)
          }
        },
        W: function (e) {
          var t = lr()
          try {
            return yr(e)
          } catch (e) {
            if ((br(t), e !== e + 0)) throw e
            cr(1, 0)
          }
        },
        Z: function (e, t) {
          var r = lr()
          try {
            return wr(e, t)
          } catch (e) {
            if ((br(r), e !== e + 0)) throw e
            cr(1, 0)
          }
        },
        X: function (e, t, r) {
          var n = lr()
          try {
            return _r(e, t, r)
          } catch (e) {
            if ((br(n), e !== e + 0)) throw e
            cr(1, 0)
          }
        },
        R: function (e, t, r, n) {
          var a = lr()
          try {
            return Mr(e, t, r, n)
          } catch (e) {
            if ((br(a), e !== e + 0)) throw e
            cr(1, 0)
          }
        },
        i: function (e) {
          var t = lr()
          try {
            vt(e)()
          } catch (e) {
            if ((br(t), e !== e + 0)) throw e
            cr(1, 0)
          }
        },
        j: function (e, t) {
          var r = lr()
          try {
            vt(e)(t)
          } catch (e) {
            if ((br(r), e !== e + 0)) throw e
            cr(1, 0)
          }
        },
        h: function (e, t, r) {
          var n = lr()
          try {
            vt(e)(t, r)
          } catch (e) {
            if ((br(n), e !== e + 0)) throw e
            cr(1, 0)
          }
        },
        k: function (e, t, r, n) {
          var a = lr()
          try {
            vt(e)(t, r, n)
          } catch (e) {
            if ((br(a), e !== e + 0)) throw e
            cr(1, 0)
          }
        },
        l: function (e, t, r, n, a) {
          var o = lr()
          try {
            vt(e)(t, r, n, a)
          } catch (e) {
            if ((br(o), e !== e + 0)) throw e
            cr(1, 0)
          }
        },
        u: function (e, t, r, n, a, o) {
          var i = lr()
          try {
            vt(e)(t, r, n, a, o)
          } catch (e) {
            if ((br(i), e !== e + 0)) throw e
            cr(1, 0)
          }
        },
        y: function (e, t, r, n, a, o, i) {
          var u = lr()
          try {
            vt(e)(t, r, n, a, o, i)
          } catch (e) {
            if ((br(u), e !== e + 0)) throw e
            cr(1, 0)
          }
        },
        t: function (e, t, r, n, a, o, i, u) {
          var c = lr()
          try {
            vt(e)(t, r, n, a, o, i, u)
          } catch (e) {
            if ((br(c), e !== e + 0)) throw e
            cr(1, 0)
          }
        },
        x: function (e, t, r, n, a, o, i, u, c, f, s) {
          var l = lr()
          try {
            vt(e)(t, r, n, a, o, i, u, c, f, s)
          } catch (e) {
            if ((br(l), e !== e + 0)) throw e
            cr(1, 0)
          }
        },
        A: function (e, t, r, n, a, o, i, u, c, f, s, l, b, h, d, p) {
          var m = lr()
          try {
            vt(e)(t, r, n, a, o, i, u, c, f, s, l, b, h, d, p)
          } catch (e) {
            if ((br(m), e !== e + 0)) throw e
            cr(1, 0)
          }
        },
        Y: function (e, t, r, n) {
          var a = lr()
          try {
            gr(e, t, r, n)
          } catch (e) {
            if ((br(a), e !== e + 0)) throw e
            cr(1, 0)
          }
        },
        s: function (e) {
          return e
        },
        a: R || u.wasmMemory,
        ea: function (e, t, r, n) {
          return (function (e, t, r, n) {
            function o(e, t, r) {
              for (e = 'number' == typeof e ? e.toString() : e || ''; e.length < t; ) e = r[0] + e
              return e
            }
            function i(e, t) {
              return o(e, t, '0')
            }
            function u(e, t) {
              function r(e) {
                return 0 > e ? -1 : 0 < e ? 1 : 0
              }
              var n
              return (
                0 === (n = r(e.getFullYear() - t.getFullYear())) &&
                  0 === (n = r(e.getMonth() - t.getMonth())) &&
                  (n = r(e.getDate() - t.getDate())),
                n
              )
            }
            function c(e) {
              switch (e.getDay()) {
                case 0:
                  return new Date(e.getFullYear() - 1, 11, 29)
                case 1:
                  return e
                case 2:
                  return new Date(e.getFullYear(), 0, 3)
                case 3:
                  return new Date(e.getFullYear(), 0, 2)
                case 4:
                  return new Date(e.getFullYear(), 0, 1)
                case 5:
                  return new Date(e.getFullYear() - 1, 11, 31)
                case 6:
                  return new Date(e.getFullYear() - 1, 11, 30)
              }
            }
            function f(e) {
              var t = e.tb
              for (e = new Date(new Date(e.ub + 1900, 0, 1).getTime()); 0 < t; ) {
                var r = e.getMonth(),
                  n = (Yt(e.getFullYear()) ? Wt : Xt)[r]
                if (!(t > n - e.getDate())) {
                  e.setDate(e.getDate() + t)
                  break
                }
                ;(t -= n - e.getDate() + 1),
                  e.setDate(1),
                  11 > r ? e.setMonth(r + 1) : (e.setMonth(0), e.setFullYear(e.getFullYear() + 1))
              }
              return (
                (r = new Date(e.getFullYear() + 1, 0, 4)),
                (t = c(new Date(e.getFullYear(), 0, 4))),
                (r = c(r)),
                0 >= u(t, e)
                  ? 0 >= u(r, e)
                    ? e.getFullYear() + 1
                    : e.getFullYear()
                  : e.getFullYear() - 1
              )
            }
            var s = a()[(n + 40) >> 2]
            for (var l in ((n = {
              bd: a()[n >> 2],
              ad: a()[(n + 4) >> 2],
              Jb: a()[(n + 8) >> 2],
              Xb: a()[(n + 12) >> 2],
              Kb: a()[(n + 16) >> 2],
              ub: a()[(n + 20) >> 2],
              kb: a()[(n + 24) >> 2],
              tb: a()[(n + 28) >> 2],
              od: a()[(n + 32) >> 2],
              $c: a()[(n + 36) >> 2],
              cd: s ? I(s) : '',
            }),
            (r = I(r)),
            (s = {
              '%c': '%a %b %d %H:%M:%S %Y',
              '%D': '%m/%d/%y',
              '%F': '%Y-%m-%d',
              '%h': '%b',
              '%r': '%I:%M:%S %p',
              '%R': '%H:%M',
              '%T': '%H:%M:%S',
              '%x': '%m/%d/%y',
              '%X': '%H:%M:%S',
              '%Ec': '%c',
              '%EC': '%C',
              '%Ex': '%m/%d/%y',
              '%EX': '%H:%M:%S',
              '%Ey': '%y',
              '%EY': '%Y',
              '%Od': '%d',
              '%Oe': '%e',
              '%OH': '%H',
              '%OI': '%I',
              '%Om': '%m',
              '%OM': '%M',
              '%OS': '%S',
              '%Ou': '%u',
              '%OU': '%U',
              '%OV': '%V',
              '%Ow': '%w',
              '%OW': '%W',
              '%Oy': '%y',
            })))
              r = r.replace(new RegExp(l, 'g'), s[l])
            var b = 'Sunday Monday Tuesday Wednesday Thursday Friday Saturday'.split(' '),
              h =
                'January February March April May June July August September October November December'.split(
                  ' ',
                )
            for (l in ((s = {
              '%a': function (e) {
                return b[e.kb].substring(0, 3)
              },
              '%A': function (e) {
                return b[e.kb]
              },
              '%b': function (e) {
                return h[e.Kb].substring(0, 3)
              },
              '%B': function (e) {
                return h[e.Kb]
              },
              '%C': function (e) {
                return i(((e.ub + 1900) / 100) | 0, 2)
              },
              '%d': function (e) {
                return i(e.Xb, 2)
              },
              '%e': function (e) {
                return o(e.Xb, 2, ' ')
              },
              '%g': function (e) {
                return f(e).toString().substring(2)
              },
              '%G': function (e) {
                return f(e)
              },
              '%H': function (e) {
                return i(e.Jb, 2)
              },
              '%I': function (e) {
                return 0 == (e = e.Jb) ? (e = 12) : 12 < e && (e -= 12), i(e, 2)
              },
              '%j': function (e) {
                for (var t = 0, r = 0; r <= e.Kb - 1; t += (Yt(e.ub + 1900) ? Wt : Xt)[r++]);
                return i(e.Xb + t, 3)
              },
              '%m': function (e) {
                return i(e.Kb + 1, 2)
              },
              '%M': function (e) {
                return i(e.ad, 2)
              },
              '%n': function () {
                return '\n'
              },
              '%p': function (e) {
                return 0 <= e.Jb && 12 > e.Jb ? 'AM' : 'PM'
              },
              '%S': function (e) {
                return i(e.bd, 2)
              },
              '%t': function () {
                return '\t'
              },
              '%u': function (e) {
                return e.kb || 7
              },
              '%U': function (e) {
                return i(Math.floor((e.tb + 7 - e.kb) / 7), 2)
              },
              '%V': function (e) {
                var t = Math.floor((e.tb + 7 - ((e.kb + 6) % 7)) / 7)
                if ((2 >= (e.kb + 371 - e.tb - 2) % 7 && t++, t))
                  53 == t && (4 == (r = (e.kb + 371 - e.tb) % 7) || (3 == r && Yt(e.ub)) || (t = 1))
                else {
                  t = 52
                  var r = (e.kb + 7 - e.tb - 1) % 7
                  ;(4 == r || (5 == r && Yt((e.ub % 400) - 1))) && t++
                }
                return i(t, 2)
              },
              '%w': function (e) {
                return e.kb
              },
              '%W': function (e) {
                return i(Math.floor((e.tb + 7 - ((e.kb + 6) % 7)) / 7), 2)
              },
              '%y': function (e) {
                return (e.ub + 1900).toString().substring(2)
              },
              '%Y': function (e) {
                return e.ub + 1900
              },
              '%z': function (e) {
                var t = 0 <= (e = e.$c)
                return (
                  (e = Math.abs(e) / 60),
                  (t ? '+' : '-') + String('0000' + ((e / 60) * 100 + (e % 60))).slice(-4)
                )
              },
              '%Z': function (e) {
                return e.cd
              },
              '%%': function () {
                return '%'
              },
            }),
            (r = r.replace(/%%/g, '\0\0')),
            s))
              r.includes(l) && (r = r.replace(new RegExp(l, 'g'), s[l](n)))
            return (l = de((r = r.replace(/\0\0/g, '%')), !1)).length > t
              ? 0
              : (gt(l, e), l.length - 1)
          })(e, t, r, n)
        },
      }
    !(function () {
      function e(e, t) {
        if (
          ((u.asm = e.exports),
          pt.wc.push(u.asm.za),
          (z = u.asm.ya),
          N.unshift(u.asm.ua),
          (E = t),
          !v)
        ) {
          var r = pt.pb.length
          pt.pb.forEach(function (e) {
            pt.kc(e, function () {
              --r || K()
            })
          })
        }
      }
      function t(t) {
        e(t.instance, t.module)
      }
      function r(e) {
        return (
          M || (!m && !w) || 'function' != typeof fetch
            ? Promise.resolve().then(function () {
                return re()
              })
            : fetch(X, { credentials: 'same-origin' })
                .then(function (e) {
                  if (!e.ok) throw "failed to load wasm binary file at '" + X + "'"
                  return e.arrayBuffer()
                })
                .catch(function () {
                  return re()
                })
        )
          .then(function (e) {
            return WebAssembly.instantiate(e, n)
          })
          .then(function (e) {
            return e
          })
          .then(e, function (e) {
            A('failed to asynchronously prepare wasm: ' + e), ee(e)
          })
      }
      var n = { a: Jt }
      if ((v || Q(), u.instantiateWasm))
        try {
          return u.instantiateWasm(n, e)
        } catch (e) {
          return A('Module.instantiateWasm callback failed with error: ' + e), !1
        }
      ;(M ||
      'function' != typeof WebAssembly.instantiateStreaming ||
      te() ||
      'function' != typeof fetch
        ? r(t)
        : fetch(X, { credentials: 'same-origin' }).then(function (e) {
            return WebAssembly.instantiateStreaming(e, n).then(t, function (e) {
              return (
                A('wasm streaming compile failed: ' + e),
                A('falling back to ArrayBuffer instantiation'),
                r(t)
              )
            })
          })
      ).catch(f)
    })(),
      (u.___wasm_call_ctors = function () {
        return (u.___wasm_call_ctors = u.asm.ua).apply(null, arguments)
      }),
      (u._gomocupLoopOnce = function () {
        return (u._gomocupLoopOnce = u.asm.va).apply(null, arguments)
      })
    var Qt = (u._free = function () {
        return (Qt = u._free = u.asm.wa).apply(null, arguments)
      }),
      Kt = (u._malloc = function () {
        return (Kt = u._malloc = u.asm.xa).apply(null, arguments)
      })
    u.__emscripten_tls_init = function () {
      return (u.__emscripten_tls_init = u.asm.za).apply(null, arguments)
    }
    var er = (u._pthread_self = function () {
        return (er = u._pthread_self = u.asm.Aa).apply(null, arguments)
      }),
      tr = (u.___errno_location = function () {
        return (tr = u.___errno_location = u.asm.Ba).apply(null, arguments)
      }),
      rr = (u.__emscripten_thread_init = function () {
        return (rr = u.__emscripten_thread_init = u.asm.Ca).apply(null, arguments)
      })
    u.__emscripten_thread_crashed = function () {
      return (u.__emscripten_thread_crashed = u.asm.Da).apply(null, arguments)
    }
    var nr,
      ar = (u._emscripten_run_in_main_runtime_thread_js = function () {
        return (ar = u._emscripten_run_in_main_runtime_thread_js = u.asm.Ea).apply(null, arguments)
      }),
      or = (u.__emscripten_proxy_execute_task_queue = function () {
        return (or = u.__emscripten_proxy_execute_task_queue = u.asm.Fa).apply(null, arguments)
      }),
      ir = (u.__emscripten_thread_free_data = function () {
        return (ir = u.__emscripten_thread_free_data = u.asm.Ga).apply(null, arguments)
      }),
      ur = (u.__emscripten_thread_exit = function () {
        return (ur = u.__emscripten_thread_exit = u.asm.Ha).apply(null, arguments)
      }),
      cr = (u._setThrew = function () {
        return (cr = u._setThrew = u.asm.Ia).apply(null, arguments)
      }),
      fr = (u.setTempRet0 = function () {
        return (fr = u.setTempRet0 = u.asm.Ja).apply(null, arguments)
      }),
      sr = (u._emscripten_stack_set_limits = function () {
        return (sr = u._emscripten_stack_set_limits = u.asm.Ka).apply(null, arguments)
      }),
      lr = (u.stackSave = function () {
        return (lr = u.stackSave = u.asm.La).apply(null, arguments)
      }),
      br = (u.stackRestore = function () {
        return (br = u.stackRestore = u.asm.Ma).apply(null, arguments)
      }),
      hr = (u.stackAlloc = function () {
        return (hr = u.stackAlloc = u.asm.Na).apply(null, arguments)
      }),
      dr = (u.___cxa_can_catch = function () {
        return (dr = u.___cxa_can_catch = u.asm.Oa).apply(null, arguments)
      }),
      pr = (u.___cxa_is_pointer_type = function () {
        return (pr = u.___cxa_is_pointer_type = u.asm.Pa).apply(null, arguments)
      }),
      mr = (u.dynCall_iij = function () {
        return (mr = u.dynCall_iij = u.asm.Qa).apply(null, arguments)
      }),
      wr = (u.dynCall_ji = function () {
        return (wr = u.dynCall_ji = u.asm.Ra).apply(null, arguments)
      }),
      yr = (u.dynCall_j = function () {
        return (yr = u.dynCall_j = u.asm.Sa).apply(null, arguments)
      }),
      vr = (u.dynCall_iiiiij = function () {
        return (vr = u.dynCall_iiiiij = u.asm.Ta).apply(null, arguments)
      }),
      gr = (u.dynCall_vij = function () {
        return (gr = u.dynCall_vij = u.asm.Ua).apply(null, arguments)
      }),
      _r = (u.dynCall_jii = function () {
        return (_r = u.dynCall_jii = u.asm.Va).apply(null, arguments)
      }),
      Mr = (u.dynCall_jiii = function () {
        return (Mr = u.dynCall_jiii = u.asm.Wa).apply(null, arguments)
      }),
      kr = (u.dynCall_iiij = function () {
        return (kr = u.dynCall_iiij = u.asm.Xa).apply(null, arguments)
      }),
      Ar = (u.dynCall_iiiij = function () {
        return (Ar = u.dynCall_iiiij = u.asm.Ya).apply(null, arguments)
      })
    function Sr() {
      function e() {
        if (
          !nr &&
          ((nr = !0), (u.calledRun = !0), !P) &&
          (Y(), c(u), u.onRuntimeInitialized && u.onRuntimeInitialized(), !v)
        ) {
          if (u.postRun)
            for ('function' == typeof u.postRun && (u.postRun = [u.postRun]); u.postRun.length; ) {
              var e = u.postRun.shift()
              B.unshift(e)
            }
          mt(B)
        }
      }
      if (!(0 < G))
        if (v) c(u), Y(), postMessage({ cmd: 'loaded' })
        else {
          if (u.preRun)
            for ('function' == typeof u.preRun && (u.preRun = [u.preRun]); u.preRun.length; ) W()
          mt(q),
            0 < G ||
              (u.setStatus
                ? (u.setStatus('Running...'),
                  setTimeout(function () {
                    setTimeout(function () {
                      u.setStatus('')
                    }, 1),
                      e()
                  }, 1))
                : e())
        }
    }
    if (
      ((u.addRunDependency = Q),
      (u.removeRunDependency = K),
      (u.FS_createPath = at),
      (u.FS_createDataFile = ot),
      (u.FS_createPreloadedFile = ft),
      (u.FS_createLazyFile = ct),
      (u.FS_createDevice = it),
      (u.FS_unlink = Xe),
      (u.keepRuntimeAlive = function () {
        return S
      }),
      (u.wasmMemory = R),
      (u.cwrap = function (e, t, r, a) {
        var o = (r = r || []).every((e) => 'number' === e || 'boolean' === e)
        return 'string' !== t && o && !a
          ? u['_' + e]
          : function () {
              return (function (e, t, r, a) {
                var o = {
                  string: (e) => {
                    var t = 0
                    if (null != e && 0 !== e) {
                      var r = 1 + (e.length << 2),
                        a = (t = hr(r))
                      H(e, n(), a, r)
                    }
                    return t
                  },
                  array: (e) => {
                    var t = hr(e.length)
                    return gt(e, t), t
                  },
                }
                e = u['_' + e]
                var i,
                  c = [],
                  f = 0
                if (a)
                  for (var s = 0; s < a.length; s++) {
                    var l = o[r[s]]
                    l ? (0 === f && (f = lr()), (c[s] = l(a[s]))) : (c[s] = a[s])
                  }
                return (
                  (i = r = e.apply(null, c)),
                  0 !== f && br(f),
                  'string' === t ? I(i) : 'boolean' === t ? !!i : i
                )
              })(e, t, r, arguments)
            }
      }),
      (u.ExitStatus = ie),
      (u.PThread = pt),
      (J = function e() {
        nr || Sr(), nr || (J = e)
      }),
      u.preInit)
    )
      for ('function' == typeof u.preInit && (u.preInit = [u.preInit]); 0 < u.preInit.length; )
        u.preInit.pop()()
    return Sr(), t.ready
  }
})()
'object' == typeof exports && 'object' == typeof module
  ? (module.exports = Rapfi)
  : 'function' == typeof define && define.amd
    ? define([], function () {
        return Rapfi
      })
    : 'object' == typeof exports && (exports.Rapfi = Rapfi)
