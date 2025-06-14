var Rapfi = (() => {
  var t =
    'undefined' != typeof document && document.currentScript ? document.currentScript.src : void 0
  return function (e) {
    var n, r, a
    ;(e = e || {}),
      n || (n = void 0 !== e ? e : {}),
      (n.ready = new Promise(function (t, e) {
        ;(r = t), (a = e)
      })),
      n.pb || (n.pb = 0),
      n.pb++,
      n.ENVIRONMENT_IS_PTHREAD ||
        (function (t) {
          function e() {
            function e(t, e, n) {
              ;(this.start = t), (this.end = e), (this.audio = n)
            }
            function r(r) {
              if (!r) throw 'Loading data file failed.' + Error().stack
              if (!(r instanceof ArrayBuffer))
                throw 'bad input to processPackageData' + Error().stack
              ;(r = new Uint8Array(r)), (e.prototype.ob = r), (r = t.files)
              for (var a = 0; a < r.length; ++a) e.prototype.Ka[r[a].filename].onload()
              n.removeRunDependency('datafile_rapfi-single.data')
            }
            e.prototype = {
              Ka: {},
              open: function (t, e) {
                ;(this.name = e), (this.Ka[e] = this), n.addRunDependency('fp ' + this.name)
              },
              onload: function () {
                this.Ua(this.ob.subarray(this.start, this.end))
              },
              Ua: function (t) {
                n.FS_createDataFile(this.name, null, t, !0, !0, !0),
                  n.removeRunDependency('fp ' + this.name),
                  (this.Ka[this.name] = null)
              },
            }
            for (var a = t.files, i = 0; i < a.length; ++i)
              new e(a[i].start, a[i].end, a[i].audio || 0).open('GET', a[i].filename)
            n.addRunDependency('datafile_rapfi-single.data'),
              n.Ob || (n.Ob = {}),
              (n.Ob['rapfi-single.data'] = { uc: !1 }),
              s ? (r(s), (s = null)) : (c = r)
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
            'function' != typeof n.locateFilePackage ||
              n.locateFile ||
              ((n.locateFile = n.locateFilePackage),
              b(
                'warning: you defined Module.locateFilePackage, that has been renamed to Module.locateFile (using your locateFilePackage for now)',
              ))
          var r,
            a,
            i,
            o,
            u = n.locateFile ? n.locateFile('rapfi-single.data', '') : 'rapfi-single.data',
            f = t.remote_package_size,
            c = null,
            s = n.getPreloadedPackage ? n.getPreloadedPackage(u, f) : null
          s ||
            ((r = u),
            (a = f),
            (i = function (t) {
              c ? (c(t), (c = null)) : (s = t)
            }),
            (o = new XMLHttpRequest()).open('GET', r, !0),
            (o.responseType = 'arraybuffer'),
            (o.onprogress = function (t) {
              var e = a
              if ((t.total && (e = t.total), t.loaded)) {
                o.Ka
                  ? (n.Za[r].loaded = t.loaded)
                  : ((o.Ka = !0), n.Za || (n.Za = {}), (n.Za[r] = { loaded: t.loaded, total: e }))
                var i,
                  u = (e = t = 0)
                for (i in n.Za) {
                  var f = n.Za[i]
                  ;(t += f.total), (e += f.loaded), u++
                }
                ;(t = Math.ceil((t * n.pb) / u)),
                  n.setStatus && n.setStatus('Downloading data... (' + e + '/' + t + ')')
              } else !n.Za && n.setStatus && n.setStatus('Downloading data...')
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
              i(o.response)
            }),
            o.send(null)),
            n.calledRun ? e() : (n.preRun || (n.preRun = []), n.preRun.push(e))
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
      (n.sendCommand = n.sendCommand || null),
      (n.receiveStdout = n.receiveStdout || ((t) => console.log(t))),
      (n.receiveStderr = n.receiveStderr || ((t) => console.error(t))),
      (n.onEngineReady = n.onEngineReady || (() => {})),
      n.preRun || (n.preRun = []),
      n.preRun.push(function () {
        var t = '',
          e = 0
        let r = '',
          a = ''
        Qt(
          function () {
            return e < t.length ? t.charCodeAt(e++) : null
          },
          function (t) {
            t && 10 != t ? (r += String.fromCharCode(t)) : (n.receiveStdout(r), (r = ''))
          },
          function (t) {
            t && 10 != t ? (a += String.fromCharCode(t)) : (n.receiveStderr(a), (a = ''))
          },
        )
        let i = n.cwrap('gomocupLoopOnce', 'number', [])
        n.sendCommand = function (n) {
          ;(t = n + '\n'), (e = 0), i()
        }
      }),
      (n.onRuntimeInitialized = function () {
        n.onEngineReady()
      })
    var i,
      o,
      u,
      f = Object.assign({}, n),
      c = './this.program',
      s = (t, e) => {
        throw e
      },
      l = 'object' == typeof window,
      h = 'function' == typeof importScripts,
      d = ''
    ;(l || h) &&
      (h
        ? (d = self.location.href)
        : 'undefined' != typeof document &&
          document.currentScript &&
          (d = document.currentScript.src),
      t && (d = t),
      (d =
        0 !== d.indexOf('blob:') ? d.substr(0, d.replace(/[?#].*/, '').lastIndexOf('/') + 1) : ''),
      (i = (t) => {
        var e = new XMLHttpRequest()
        return e.open('GET', t, !1), e.send(null), e.responseText
      }),
      h &&
        (u = (t) => {
          var e = new XMLHttpRequest()
          return (
            e.open('GET', t, !1),
            (e.responseType = 'arraybuffer'),
            e.send(null),
            new Uint8Array(e.response)
          )
        }),
      (o = (t, e, n) => {
        var r = new XMLHttpRequest()
        r.open('GET', t, !0),
          (r.responseType = 'arraybuffer'),
          (r.onload = () => {
            200 == r.status || (0 == r.status && r.response) ? e(r.response) : n()
          }),
          (r.onerror = n),
          r.send(null)
      }))
    var p,
      w = n.print || console.log.bind(console),
      b = n.printErr || console.warn.bind(console)
    Object.assign(n, f),
      (f = null),
      n.thisProgram && (c = n.thisProgram),
      n.quit && (s = n.quit),
      n.wasmBinary && (p = n.wasmBinary)
    var m = n.noExitRuntime || !0
    'object' != typeof WebAssembly && J('no native wasm support detected')
    var v,
      y,
      g,
      M,
      _,
      R,
      S,
      H = !1,
      k = 'undefined' != typeof TextDecoder ? new TextDecoder('utf8') : void 0
    function A(t, e) {
      for (var n = e + NaN, r = e; t[r] && !(r >= n); ) ++r
      if (16 < r - e && t.buffer && k) return k.decode(t.subarray(e, r))
      for (n = ''; e < r; ) {
        var a = t[e++]
        if (128 & a) {
          var i = 63 & t[e++]
          if (192 == (224 & a)) n += String.fromCharCode(((31 & a) << 6) | i)
          else {
            var o = 63 & t[e++]
            65536 >
            (a =
              224 == (240 & a)
                ? ((15 & a) << 12) | (i << 6) | o
                : ((7 & a) << 18) | (i << 12) | (o << 6) | (63 & t[e++]))
              ? (n += String.fromCharCode(a))
              : ((a -= 65536), (n += String.fromCharCode(55296 | (a >> 10), 56320 | (1023 & a))))
          }
        } else n += String.fromCharCode(a)
      }
      return n
    }
    function I(t) {
      return t ? A(M, t) : ''
    }
    function F(t, e, n, r) {
      if (!(0 < r)) return 0
      var a = n
      r = n + r - 1
      for (var i = 0; i < t.length; ++i) {
        var o = t.charCodeAt(i)
        if (
          (55296 <= o &&
            57343 >= o &&
            (o = (65536 + ((1023 & o) << 10)) | (1023 & t.charCodeAt(++i))),
          127 >= o)
        ) {
          if (n >= r) break
          e[n++] = o
        } else {
          if (2047 >= o) {
            if (n + 1 >= r) break
            e[n++] = 192 | (o >> 6)
          } else {
            if (65535 >= o) {
              if (n + 2 >= r) break
              e[n++] = 224 | (o >> 12)
            } else {
              if (n + 3 >= r) break
              ;(e[n++] = 240 | (o >> 18)), (e[n++] = 128 | ((o >> 12) & 63))
            }
            e[n++] = 128 | ((o >> 6) & 63)
          }
          e[n++] = 128 | (63 & o)
        }
      }
      return (e[n] = 0), n - a
    }
    function E() {
      var t = v.buffer
      ;(y = t),
        (n.HEAP8 = g = new Int8Array(t)),
        (n.HEAP16 = _ = new Int16Array(t)),
        (n.HEAP32 = R = new Int32Array(t)),
        (n.HEAPU8 = M = new Uint8Array(t)),
        (n.HEAPU16 = new Uint16Array(t)),
        (n.HEAPU32 = S = new Uint32Array(t)),
        (n.HEAPF32 = new Float32Array(t)),
        (n.HEAPF64 = new Float64Array(t))
    }
    var D,
      C = [],
      G = [],
      O = []
    function T() {
      var t = n.preRun.shift()
      C.unshift(t)
    }
    var P,
      j,
      L,
      x = 0,
      U = null,
      N = null
    function Y() {
      x++, n.monitorRunDependencies && n.monitorRunDependencies(x)
    }
    function z() {
      if (
        (x--,
        n.monitorRunDependencies && n.monitorRunDependencies(x),
        0 == x && (null !== U && (clearInterval(U), (U = null)), N))
      ) {
        var t = N
        ;(N = null), t()
      }
    }
    function J(t) {
      throw (
        (n.onAbort && n.onAbort(t),
        b((t = 'Aborted(' + t + ')')),
        (H = !0),
        (t = new WebAssembly.RuntimeError(t + '. Build with -sASSERTIONS for more info.')),
        a(t),
        t)
      )
    }
    function W() {
      return P.startsWith('data:application/octet-stream;base64,')
    }
    if (((P = 'rapfi-single.wasm'), !W())) {
      var K = P
      P = n.locateFile ? n.locateFile(K, d) : d + K
    }
    function X() {
      var t = P
      try {
        if (t == P && p) return new Uint8Array(p)
        if (u) return u(t)
        throw 'both async and sync fetching of the wasm failed'
      } catch (t) {
        J(t)
      }
    }
    function q(t) {
      ;(this.name = 'ExitStatus'),
        (this.message = 'Program terminated with exit(' + t + ')'),
        (this.status = t)
    }
    function V(t) {
      for (; 0 < t.length; ) t.shift()(n)
    }
    var Q = [],
      B = 0,
      $ = 0
    function Z(t) {
      ;(this.bb = t),
        (this.La = t - 24),
        (this.Yb = function (t) {
          S[(this.La + 4) >> 2] = t
        }),
        (this.Ka = function () {
          return S[(this.La + 4) >> 2]
        }),
        (this.Wb = function (t) {
          S[(this.La + 8) >> 2] = t
        }),
        (this.dc = function () {
          return S[(this.La + 8) >> 2]
        }),
        (this.Xb = function () {
          R[this.La >> 2] = 0
        }),
        (this.wb = function (t) {
          g[(this.La + 12) | 0] = t ? 1 : 0
        }),
        (this.Tb = function () {
          return 0 != g[(this.La + 12) | 0]
        }),
        (this.xb = function (t) {
          g[(this.La + 13) | 0] = t ? 1 : 0
        }),
        (this.Ib = function () {
          return 0 != g[(this.La + 13) | 0]
        }),
        (this.Vb = function (t, e) {
          this.Ua(0), this.Yb(t), this.Wb(e), this.Xb(), this.wb(!1), this.xb(!1)
        }),
        (this.ob = function () {
          R[this.La >> 2] += 1
        }),
        (this.lc = function () {
          var t = R[this.La >> 2]
          return (R[this.La >> 2] = t - 1), 1 === t
        }),
        (this.Ua = function (t) {
          S[(this.La + 16) >> 2] = t
        }),
        (this.Sb = function () {
          return S[(this.La + 16) >> 2]
        }),
        (this.Ub = function () {
          if (He(this.Ka())) return S[this.bb >> 2]
          var t = this.Sb()
          return 0 !== t ? t : this.bb
        })
    }
    function tt(t) {
      return be(new Z(t).La)
    }
    var et = []
    function nt(t) {
      var e = et[t]
      return e || (t >= et.length && (et.length = t + 1), (et[t] = e = D.get(t))), e
    }
    var rt = (t, e) => {
        for (var n = 0, r = t.length - 1; 0 <= r; r--) {
          var a = t[r]
          '.' === a
            ? t.splice(r, 1)
            : '..' === a
              ? (t.splice(r, 1), n++)
              : n && (t.splice(r, 1), n--)
        }
        if (e) for (; n; n--) t.unshift('..')
        return t
      },
      at = (t) => {
        var e = '/' === t.charAt(0),
          n = '/' === t.substr(-1)
        return (
          (t = rt(
            t.split('/').filter((t) => !!t),
            !e,
          ).join('/')) ||
            e ||
            (t = '.'),
          t && n && (t += '/'),
          (e ? '/' : '') + t
        )
      },
      it = (t) => {
        var e = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/.exec(t).slice(1)
        return (t = e[0]), (e = e[1]), t || e ? (e && (e = e.substr(0, e.length - 1)), t + e) : '.'
      },
      ot = (t) => {
        if ('/' === t) return '/'
        var e = (t = (t = at(t)).replace(/\/$/, '')).lastIndexOf('/')
        return -1 === e ? t : t.substr(e + 1)
      }
    function ut() {
      for (var t = '', e = !1, n = arguments.length - 1; -1 <= n && !e; n--) {
        if ('string' != typeof (e = 0 <= n ? arguments[n] : '/'))
          throw new TypeError('Arguments to path.resolve must be strings')
        if (!e) return ''
        ;(t = e + '/' + t), (e = '/' === e.charAt(0))
      }
      return (
        (e ? '/' : '') +
          (t = rt(
            t.split('/').filter((t) => !!t),
            !e,
          ).join('/')) || '.'
      )
    }
    function ft(t, e) {
      for (var n = 0, r = 0; r < t.length; ++r) {
        var a = t.charCodeAt(r)
        127 >= a
          ? n++
          : 2047 >= a
            ? (n += 2)
            : 55296 <= a && 57343 >= a
              ? ((n += 4), ++r)
              : (n += 3)
      }
      return (t = F(t, (n = Array(n + 1)), 0, n.length)), e && (n.length = t), n
    }
    var ct = []
    function st(t, e) {
      ;(ct[t] = { input: [], Na: [], ab: e }), jt(t, pt)
    }
    var lt,
      ht,
      dt,
      pt = {
        open: function (t) {
          var e = ct[t.node.fb]
          if (!e) throw new St(43)
          ;(t.Ma = e), (t.seekable = !1)
        },
        close: function (t) {
          t.Ma.ab.ib(t.Ma)
        },
        ib: function (t) {
          t.Ma.ab.ib(t.Ma)
        },
        read: function (t, e, n, r) {
          if (!t.Ma || !t.Ma.ab.Hb) throw new St(60)
          for (var a = 0, i = 0; i < r; i++) {
            try {
              var o = t.Ma.ab.Hb(t.Ma)
            } catch (t) {
              throw new St(29)
            }
            if (void 0 === o && 0 === a) throw new St(6)
            if (null == o) break
            a++, (e[n + i] = o)
          }
          return a && (t.node.timestamp = Date.now()), a
        },
        write: function (t, e, n, r) {
          if (!t.Ma || !t.Ma.ab.ub) throw new St(60)
          try {
            for (var a = 0; a < r; a++) t.Ma.ab.ub(t.Ma, e[n + a])
          } catch (t) {
            throw new St(29)
          }
          return r && (t.node.timestamp = Date.now()), a
        },
      },
      wt = {
        Hb: function (t) {
          if (!t.input.length) {
            var e = null
            if (
              ('undefined' != typeof window && 'function' == typeof window.prompt
                ? null !== (e = window.prompt('Input: ')) && (e += '\n')
                : 'function' == typeof readline && null !== (e = readline()) && (e += '\n'),
              !e)
            )
              return null
            t.input = ft(e, !0)
          }
          return t.input.shift()
        },
        ub: function (t, e) {
          null === e || 10 === e ? (w(A(t.Na, 0)), (t.Na = [])) : 0 != e && t.Na.push(e)
        },
        ib: function (t) {
          t.Na && 0 < t.Na.length && (w(A(t.Na, 0)), (t.Na = []))
        },
      },
      bt = {
        ub: function (t, e) {
          null === e || 10 === e ? (b(A(t.Na, 0)), (t.Na = [])) : 0 != e && t.Na.push(e)
        },
        ib: function (t) {
          t.Na && 0 < t.Na.length && (b(A(t.Na, 0)), (t.Na = []))
        },
      },
      mt = {
        Qa: null,
        Ta: function () {
          return mt.createNode(null, '/', 16895, 0)
        },
        createNode: function (t, e, n, r) {
          if (24576 == (61440 & n) || 4096 == (61440 & n)) throw new St(63)
          return (
            mt.Qa ||
              (mt.Qa = {
                dir: {
                  node: {
                    Pa: mt.Ha.Pa,
                    Oa: mt.Ha.Oa,
                    cb: mt.Ha.cb,
                    jb: mt.Ha.jb,
                    Qb: mt.Ha.Qb,
                    nb: mt.Ha.nb,
                    Rb: mt.Ha.Rb,
                    Pb: mt.Ha.Pb,
                    kb: mt.Ha.kb,
                  },
                  stream: { Wa: mt.Ia.Wa },
                },
                file: {
                  node: { Pa: mt.Ha.Pa, Oa: mt.Ha.Oa },
                  stream: {
                    Wa: mt.Ia.Wa,
                    read: mt.Ia.read,
                    write: mt.Ia.write,
                    zb: mt.Ia.zb,
                    tb: mt.Ia.tb,
                    Mb: mt.Ia.Mb,
                  },
                },
                link: { node: { Pa: mt.Ha.Pa, Oa: mt.Ha.Oa, gb: mt.Ha.gb }, stream: {} },
                Cb: { node: { Pa: mt.Ha.Pa, Oa: mt.Ha.Oa }, stream: Pt },
              }),
            16384 == (61440 & (n = Et(t, e, n, r)).mode)
              ? ((n.Ha = mt.Qa.dir.node), (n.Ia = mt.Qa.dir.stream), (n.Ga = {}))
              : 32768 == (61440 & n.mode)
                ? ((n.Ha = mt.Qa.file.node), (n.Ia = mt.Qa.file.stream), (n.Ja = 0), (n.Ga = null))
                : 40960 == (61440 & n.mode)
                  ? ((n.Ha = mt.Qa.link.node), (n.Ia = mt.Qa.link.stream))
                  : 8192 == (61440 & n.mode) && ((n.Ha = mt.Qa.Cb.node), (n.Ia = mt.Qa.Cb.stream)),
            (n.timestamp = Date.now()),
            t && ((t.Ga[e] = n), (t.timestamp = n.timestamp)),
            n
          )
        },
        vc: function (t) {
          return t.Ga
            ? t.Ga.subarray
              ? t.Ga.subarray(0, t.Ja)
              : new Uint8Array(t.Ga)
            : new Uint8Array(0)
        },
        Fb: function (t, e) {
          var n = t.Ga ? t.Ga.length : 0
          n >= e ||
            ((e = Math.max(e, (n * (1048576 > n ? 2 : 1.125)) >>> 0)),
            0 != n && (e = Math.max(e, 256)),
            (n = t.Ga),
            (t.Ga = new Uint8Array(e)),
            0 < t.Ja && t.Ga.set(n.subarray(0, t.Ja), 0))
        },
        mc: function (t, e) {
          if (t.Ja != e)
            if (0 == e) (t.Ga = null), (t.Ja = 0)
            else {
              var n = t.Ga
              ;(t.Ga = new Uint8Array(e)),
                n && t.Ga.set(n.subarray(0, Math.min(e, t.Ja))),
                (t.Ja = e)
            }
        },
        Ha: {
          Pa: function (t) {
            var e = {}
            return (
              (e.cc = 8192 == (61440 & t.mode) ? t.id : 1),
              (e.rb = t.id),
              (e.mode = t.mode),
              (e.kc = 1),
              (e.uid = 0),
              (e.ec = 0),
              (e.fb = t.fb),
              16384 == (61440 & t.mode)
                ? (e.size = 4096)
                : 32768 == (61440 & t.mode)
                  ? (e.size = t.Ja)
                  : 40960 == (61440 & t.mode)
                    ? (e.size = t.link.length)
                    : (e.size = 0),
              (e.Ab = new Date(t.timestamp)),
              (e.Nb = new Date(t.timestamp)),
              (e.Eb = new Date(t.timestamp)),
              (e.ac = 4096),
              (e.bc = Math.ceil(e.size / e.ac)),
              e
            )
          },
          Oa: function (t, e) {
            void 0 !== e.mode && (t.mode = e.mode),
              void 0 !== e.timestamp && (t.timestamp = e.timestamp),
              void 0 !== e.size && mt.mc(t, e.size)
          },
          cb: function () {
            throw Ht[44]
          },
          jb: function (t, e, n, r) {
            return mt.createNode(t, e, n, r)
          },
          Qb: function (t, e, n) {
            if (16384 == (61440 & t.mode)) {
              try {
                var r = Ft(e, n)
              } catch (t) {}
              if (r) for (var a in r.Ga) throw new St(55)
            }
            delete t.parent.Ga[t.name],
              (t.parent.timestamp = Date.now()),
              (t.name = n),
              (e.Ga[n] = t),
              (e.timestamp = t.parent.timestamp),
              (t.parent = e)
          },
          nb: function (t, e) {
            delete t.Ga[e], (t.timestamp = Date.now())
          },
          Rb: function (t, e) {
            var n,
              r = Ft(t, e)
            for (n in r.Ga) throw new St(55)
            delete t.Ga[e], (t.timestamp = Date.now())
          },
          Pb: function (t) {
            var e,
              n = ['.', '..']
            for (e in t.Ga) t.Ga.hasOwnProperty(e) && n.push(e)
            return n
          },
          kb: function (t, e, n) {
            return ((t = mt.createNode(t, e, 41471, 0)).link = n), t
          },
          gb: function (t) {
            if (40960 != (61440 & t.mode)) throw new St(28)
            return t.link
          },
        },
        Ia: {
          read: function (t, e, n, r, a) {
            var i = t.node.Ga
            if (a >= t.node.Ja) return 0
            if (8 < (t = Math.min(t.node.Ja - a, r)) && i.subarray) e.set(i.subarray(a, a + t), n)
            else for (r = 0; r < t; r++) e[n + r] = i[a + r]
            return t
          },
          write: function (t, e, n, r, a, i) {
            if ((e.buffer === g.buffer && (i = !1), !r)) return 0
            if ((((t = t.node).timestamp = Date.now()), e.subarray && (!t.Ga || t.Ga.subarray))) {
              if (i) return (t.Ga = e.subarray(n, n + r)), (t.Ja = r)
              if (0 === t.Ja && 0 === a) return (t.Ga = e.slice(n, n + r)), (t.Ja = r)
              if (a + r <= t.Ja) return t.Ga.set(e.subarray(n, n + r), a), r
            }
            if ((mt.Fb(t, a + r), t.Ga.subarray && e.subarray)) t.Ga.set(e.subarray(n, n + r), a)
            else for (i = 0; i < r; i++) t.Ga[a + i] = e[n + i]
            return (t.Ja = Math.max(t.Ja, a + r)), r
          },
          Wa: function (t, e, n) {
            if (
              (1 === n
                ? (e += t.position)
                : 2 === n && 32768 == (61440 & t.node.mode) && (e += t.node.Ja),
              0 > e)
            )
              throw new St(28)
            return e
          },
          zb: function (t, e, n) {
            mt.Fb(t.node, e + n), (t.node.Ja = Math.max(t.node.Ja, e + n))
          },
          tb: function (t, e, n, r, a) {
            if (32768 != (61440 & t.node.mode)) throw new St(43)
            if (((t = t.node.Ga), 2 & a || t.buffer !== y)) {
              if (
                ((0 < n || n + e < t.length) &&
                  (t = t.subarray ? t.subarray(n, n + e) : Array.prototype.slice.call(t, n, n + e)),
                (n = !0),
                J(),
                !(e = void 0))
              )
                throw new St(48)
              g.set(t, e)
            } else (n = !1), (e = t.byteOffset)
            return { La: e, tc: n }
          },
          Mb: function (t, e, n, r, a) {
            if (32768 != (61440 & t.node.mode)) throw new St(43)
            return 2 & a || mt.Ia.write(t, e, 0, r, n, !1), 0
          },
        },
      },
      vt = null,
      yt = {},
      gt = [],
      Mt = 1,
      _t = null,
      Rt = !0,
      St = null,
      Ht = {},
      kt = (t, e = {}) => {
        if (!(t = ut('/', t))) return { path: '', node: null }
        if (8 < (e = Object.assign({ Gb: !0, vb: 0 }, e)).vb) throw new St(32)
        t = rt(
          t.split('/').filter((t) => !!t),
          !1,
        )
        for (var n = vt, r = '/', a = 0; a < t.length; a++) {
          var i = a === t.length - 1
          if (i && e.parent) break
          if (
            ((n = Ft(n, t[a])),
            (r = at(r + '/' + t[a])),
            n.eb && (!i || (i && e.Gb)) && (n = n.eb.root),
            !i || e.hb)
          )
            for (i = 0; 40960 == (61440 & n.mode); )
              if (((n = zt(r)), (r = ut(it(r), n)), (n = kt(r, { vb: e.vb + 1 }).node), 40 < i++))
                throw new St(32)
        }
        return { path: r, node: n }
      },
      At = (t) => {
        for (var e; ; ) {
          if (t === t.parent)
            return (t = t.Ta.Lb), e ? ('/' !== t[t.length - 1] ? t + '/' + e : t + e) : t
          ;(e = e ? t.name + '/' + e : t.name), (t = t.parent)
        }
      },
      It = (t, e) => {
        for (var n = 0, r = 0; r < e.length; r++) n = ((n << 5) - n + e.charCodeAt(r)) | 0
        return ((t + n) >>> 0) % _t.length
      },
      Ft = (t, e) => {
        var n
        if ((n = (n = Gt(t, 'x')) ? n : t.Ha.cb ? 0 : 2)) throw new St(n, t)
        for (n = _t[It(t.id, e)]; n; n = n.$a) {
          var r = n.name
          if (n.parent.id === t.id && r === e) return n
        }
        return t.Ha.cb(t, e)
      },
      Et = (t, e, n, r) => (
        (t = new de(t, e, n, r)), (e = It(t.parent.id, t.name)), (t.$a = _t[e]), (_t[e] = t)
      ),
      Dt = { r: 0, 'r+': 2, w: 577, 'w+': 578, a: 1089, 'a+': 1090 },
      Ct = (t) => {
        var e = ['r', 'w', 'rw'][3 & t]
        return 512 & t && (e += 'w'), e
      },
      Gt = (t, e) =>
        Rt
          ? 0
          : !e.includes('r') || 292 & t.mode
            ? (e.includes('w') && !(146 & t.mode)) || (e.includes('x') && !(73 & t.mode))
              ? 2
              : 0
            : 2,
      Ot = (t, e) => {
        try {
          return Ft(t, e), 20
        } catch (t) {}
        return Gt(t, 'wx')
      },
      Tt = (t, e) => (
        ht ||
          (((ht = function () {
            this.Ka = {}
          }).prototype = {}),
          Object.defineProperties(ht.prototype, {
            object: {
              get: function () {
                return this.node
              },
              set: function (t) {
                this.node = t
              },
            },
            flags: {
              get: function () {
                return this.Ka.flags
              },
              set: function (t) {
                this.Ka.flags = t
              },
            },
            position: {
              get: function () {
                return this.Ka.position
              },
              set: function (t) {
                this.Ka.position = t
              },
            },
          })),
        (t = Object.assign(new ht(), t)),
        (e = ((t = 0) => {
          for (; 4096 >= t; t++) if (!gt[t]) return t
          throw new St(33)
        })(e)),
        (t.Va = e),
        (gt[e] = t)
      ),
      Pt = {
        open: (t) => {
          ;(t.Ia = yt[t.node.fb].Ia), t.Ia.open && t.Ia.open(t)
        },
        Wa: () => {
          throw new St(70)
        },
      },
      jt = (t, e) => {
        yt[t] = { Ia: e }
      },
      Lt = (t, e) => {
        var n = '/' === e,
          r = !e
        if (n && vt) throw new St(10)
        if (!n && !r) {
          var a = kt(e, { Gb: !1 })
          if (((e = a.path), (a = a.node).eb)) throw new St(10)
          if (16384 != (61440 & a.mode)) throw new St(54)
        }
        ;(e = { type: t, xc: {}, Lb: e, jc: [] }),
          ((t = t.Ta(e)).Ta = e),
          (e.root = t),
          n ? (vt = t) : a && ((a.eb = e), a.Ta && a.Ta.jc.push(e))
      },
      xt = (t, e, n) => {
        var r = kt(t, { parent: !0 }).node
        if (!(t = ot(t)) || '.' === t || '..' === t) throw new St(28)
        var a = Ot(r, t)
        if (a) throw new St(a)
        if (!r.Ha.jb) throw new St(63)
        return r.Ha.jb(r, t, e, n)
      },
      Ut = (t, e, n) => (void 0 === n && ((n = e), (e = 438)), xt(t, 8192 | e, n)),
      Nt = (t, e) => {
        if (!ut(t)) throw new St(44)
        var n = kt(e, { parent: !0 }).node
        if (!n) throw new St(44)
        e = ot(e)
        var r = Ot(n, e)
        if (r) throw new St(r)
        if (!n.Ha.kb) throw new St(63)
        n.Ha.kb(n, e, t)
      },
      Yt = (t) => {
        var e = kt(t, { parent: !0 }).node
        if (!e) throw new St(44)
        var n = ot(t)
        t = Ft(e, n)
        t: {
          try {
            var r = Ft(e, n)
          } catch (t) {
            r = t.Sa
            break t
          }
          r = Gt(e, 'wx') || (16384 == (61440 & r.mode) ? 31 : 0)
        }
        if (r) throw new St(r)
        if (!e.Ha.nb) throw new St(63)
        if (t.eb) throw new St(10)
        if ((e.Ha.nb(e, n), (e = It(t.parent.id, t.name)), _t[e] === t)) _t[e] = t.$a
        else
          for (e = _t[e]; e; ) {
            if (e.$a === t) {
              e.$a = t.$a
              break
            }
            e = e.$a
          }
      },
      zt = (t) => {
        if (!(t = kt(t).node)) throw new St(44)
        if (!t.Ha.gb) throw new St(28)
        return ut(At(t.parent), t.Ha.gb(t))
      },
      Jt = (t, e) => {
        if (!(t = 'string' == typeof t ? kt(t, { hb: !0 }).node : t).Ha.Oa) throw new St(63)
        t.Ha.Oa(t, { mode: (4095 & e) | (-4096 & t.mode), timestamp: Date.now() })
      },
      Wt = (t, e, r) => {
        if ('' === t) throw new St(44)
        if ('string' == typeof e) {
          var a = Dt[e]
          if (void 0 === a) throw Error('Unknown file open mode: ' + e)
          e = a
        }
        if (((r = 64 & e ? (4095 & (void 0 === r ? 438 : r)) | 32768 : 0), 'object' == typeof t))
          var i = t
        else {
          t = at(t)
          try {
            i = kt(t, { hb: !(131072 & e) }).node
          } catch (t) {}
        }
        if (((a = !1), 64 & e))
          if (i) {
            if (128 & e) throw new St(20)
          } else (i = xt(t, r, 0)), (a = !0)
        if (!i) throw new St(44)
        if ((8192 == (61440 & i.mode) && (e &= -513), 65536 & e && 16384 != (61440 & i.mode)))
          throw new St(54)
        if (
          !a &&
          (r = i
            ? 40960 == (61440 & i.mode)
              ? 32
              : 16384 == (61440 & i.mode) && ('r' !== Ct(e) || 512 & e)
                ? 31
                : Gt(i, Ct(e))
            : 44)
        )
          throw new St(r)
        if (512 & e && !a) {
          if (!(r = 'string' == typeof (r = i) ? kt(r, { hb: !0 }).node : r).Ha.Oa) throw new St(63)
          if (16384 == (61440 & r.mode)) throw new St(31)
          if (32768 != (61440 & r.mode)) throw new St(28)
          if ((a = Gt(r, 'w'))) throw new St(a)
          r.Ha.Oa(r, { size: 0, timestamp: Date.now() })
        }
        return (
          (e &= -131713),
          (i = Tt({
            node: i,
            path: At(i),
            flags: e,
            seekable: !0,
            position: 0,
            Ia: i.Ia,
            sc: [],
            error: !1,
          })).Ia.open && i.Ia.open(i),
          !n.logReadFiles || 1 & e || (dt || (dt = {}), t in dt || (dt[t] = 1)),
          i
        )
      },
      Kt = (t) => {
        if (null === t.Va) throw new St(8)
        t.qb && (t.qb = null)
        try {
          t.Ia.close && t.Ia.close(t)
        } catch (t) {
          throw t
        } finally {
          gt[t.Va] = null
        }
        t.Va = null
      },
      Xt = (t, e, n) => {
        if (null === t.Va) throw new St(8)
        if (!t.seekable || !t.Ia.Wa) throw new St(70)
        if (0 != n && 1 != n && 2 != n) throw new St(28)
        ;(t.position = t.Ia.Wa(t, e, n)), (t.sc = [])
      },
      qt = (t, e, n, r, a, i) => {
        if (0 > r || 0 > a) throw new St(28)
        if (null === t.Va) throw new St(8)
        if (!(2097155 & t.flags)) throw new St(8)
        if (16384 == (61440 & t.node.mode)) throw new St(31)
        if (!t.Ia.write) throw new St(28)
        t.seekable && 1024 & t.flags && Xt(t, 0, 2)
        var o = void 0 !== a
        if (o) {
          if (!t.seekable) throw new St(70)
        } else a = t.position
        return (e = t.Ia.write(t, e, n, r, a, i)), o || (t.position += e), e
      },
      Vt = () => {
        St ||
          (((St = function (t, e) {
            ;(this.node = e),
              (this.nc = function (t) {
                this.Sa = t
              }),
              this.nc(t),
              (this.message = 'FS error')
          }).prototype = Error()),
          (St.prototype.constructor = St),
          [44].forEach((t) => {
            ;(Ht[t] = new St(t)), (Ht[t].stack = '<generic error, no stack>')
          }))
      },
      Qt = (t, e, r) => {
        ;(lt = !0),
          Vt(),
          (n.stdin = t || n.stdin),
          (n.stdout = e || n.stdout),
          (n.stderr = r || n.stderr),
          n.stdin ? te('/dev', 'stdin', n.stdin) : Nt('/dev/tty', '/dev/stdin'),
          n.stdout ? te('/dev', 'stdout', null, n.stdout) : Nt('/dev/tty', '/dev/stdout'),
          n.stderr ? te('/dev', 'stderr', null, n.stderr) : Nt('/dev/tty1', '/dev/stderr'),
          Wt('/dev/stdin', 0),
          Wt('/dev/stdout', 1),
          Wt('/dev/stderr', 1)
      },
      Bt = (t, e) => {
        var n = 0
        return t && (n |= 365), e && (n |= 146), n
      },
      $t = (t, e) => {
        for (t = 'string' == typeof t ? t : At(t), e = e.split('/').reverse(); e.length; ) {
          var n = e.pop()
          if (n) {
            var r = at(t + '/' + n)
            try {
              xt(r, 16895, 0)
            } catch (t) {}
            t = r
          }
        }
        return r
      },
      Zt = (t, e, n, r, a, i) => {
        var o = e
        if (
          (t && ((t = 'string' == typeof t ? t : At(t)), (o = e ? at(t + '/' + e) : t)),
          (t = Bt(r, a)),
          (o = xt(o, (4095 & (void 0 !== t ? t : 438)) | 32768, 0)),
          n)
        ) {
          if ('string' == typeof n) {
            for (e = Array(n.length), r = 0, a = n.length; r < a; ++r) e[r] = n.charCodeAt(r)
            n = e
          }
          Jt(o, 146 | t), (e = Wt(o, 577)), qt(e, n, 0, n.length, 0, i), Kt(e), Jt(o, t)
        }
        return o
      },
      te = (t, e, n, r) => {
        ;(t = at(('string' == typeof t ? t : At(t)) + '/' + e)),
          (e = Bt(!!n, !!r)),
          te.Kb || (te.Kb = 64)
        var a = te.Kb++ << 8
        return (
          jt(a, {
            open: (t) => {
              t.seekable = !1
            },
            close: () => {
              r && r.buffer && r.buffer.length && r(10)
            },
            read: (t, e, r, a) => {
              for (var i = 0, o = 0; o < a; o++) {
                try {
                  var u = n()
                } catch (t) {
                  throw new St(29)
                }
                if (void 0 === u && 0 === i) throw new St(6)
                if (null == u) break
                i++, (e[r + o] = u)
              }
              return i && (t.node.timestamp = Date.now()), i
            },
            write: (t, e, n, a) => {
              for (var i = 0; i < a; i++)
                try {
                  r(e[n + i])
                } catch (t) {
                  throw new St(29)
                }
              return a && (t.node.timestamp = Date.now()), i
            },
          }),
          Ut(t, e, a)
        )
      },
      ee = (t) => {
        if (!(t.hc || t.ic || t.link || t.Ga)) {
          if ('undefined' != typeof XMLHttpRequest)
            throw Error(
              'Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.',
            )
          if (!i) throw Error('Cannot load without read() or XMLHttpRequest.')
          try {
            ;(t.Ga = ft(i(t.url), !0)), (t.Ja = t.Ga.length)
          } catch (t) {
            throw new St(29)
          }
        }
      },
      ne = (t, e, n, r, a) => {
        function i() {
          ;(this.sb = !1), (this.Ka = [])
        }
        if (
          ((i.prototype.get = function (t) {
            if (!(t > this.length - 1 || 0 > t)) {
              var e = t % this.Db
              return this.Jb((t / this.Db) | 0)[e]
            }
          }),
          (i.prototype.Ua = function (t) {
            this.Jb = t
          }),
          (i.prototype.Bb = function () {
            var t = new XMLHttpRequest()
            if (
              (t.open('HEAD', n, !1),
              t.send(null),
              !((200 <= t.status && 300 > t.status) || 304 === t.status))
            )
              throw Error("Couldn't load " + n + '. Status: ' + t.status)
            var e,
              r = Number(t.getResponseHeader('Content-length')),
              a = (e = t.getResponseHeader('Accept-Ranges')) && 'bytes' === e
            t = (e = t.getResponseHeader('Content-Encoding')) && 'gzip' === e
            var i = 1048576
            a || (i = r)
            var o = this
            o.Ua((t) => {
              var e = t * i,
                a = (t + 1) * i - 1
              if (((a = Math.min(a, r - 1)), void 0 === o.Ka[t])) {
                var u = o.Ka
                if (e > a)
                  throw Error('invalid range (' + e + ', ' + a + ') or no bytes requested!')
                if (a > r - 1) throw Error('only ' + r + ' bytes available! programmer error!')
                var f = new XMLHttpRequest()
                if (
                  (f.open('GET', n, !1),
                  r !== i && f.setRequestHeader('Range', 'bytes=' + e + '-' + a),
                  (f.responseType = 'arraybuffer'),
                  f.overrideMimeType && f.overrideMimeType('text/plain; charset=x-user-defined'),
                  f.send(null),
                  !((200 <= f.status && 300 > f.status) || 304 === f.status))
                )
                  throw Error("Couldn't load " + n + '. Status: ' + f.status)
                ;(e =
                  void 0 !== f.response
                    ? new Uint8Array(f.response || [])
                    : ft(f.responseText || '', !0)),
                  (u[t] = e)
              }
              if (void 0 === o.Ka[t]) throw Error('doXHR failed!')
              return o.Ka[t]
            }),
              (!t && r) ||
                ((i = r = 1),
                (i = r = this.Jb(0).length),
                w('LazyFiles on gzip forces download of the whole file when length is accessed')),
              (this.$b = r),
              (this.Zb = i),
              (this.sb = !0)
          }),
          'undefined' != typeof XMLHttpRequest)
        ) {
          if (!h)
            throw 'Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc'
          var o = new i()
          Object.defineProperties(o, {
            length: {
              get: function () {
                return this.sb || this.Bb(), this.$b
              },
            },
            Db: {
              get: function () {
                return this.sb || this.Bb(), this.Zb
              },
            },
          })
          var u = void 0
        } else (u = n), (o = void 0)
        var f = ((t, e, n, r) => (
          (t = at(('string' == typeof t ? t : At(t)) + '/' + e)),
          (n = Bt(n, r)),
          xt(t, (4095 & (void 0 !== n ? n : 438)) | 32768, 0)
        ))(t, e, r, a)
        o ? (f.Ga = o) : u && ((f.Ga = null), (f.url = u)),
          Object.defineProperties(f, {
            Ja: {
              get: function () {
                return this.Ga.length
              },
            },
          })
        var c = {}
        return (
          Object.keys(f.Ia).forEach((t) => {
            var e = f.Ia[t]
            c[t] = function () {
              return ee(f), e.apply(null, arguments)
            }
          }),
          (c.read = (t, e, n, r, a) => {
            if ((ee(f), a >= (t = t.node.Ga).length)) e = 0
            else {
              if (((r = Math.min(t.length - a, r)), t.slice))
                for (var i = 0; i < r; i++) e[n + i] = t[a + i]
              else for (i = 0; i < r; i++) e[n + i] = t.get(a + i)
              e = r
            }
            return e
          }),
          (c.tb = () => {
            throw (ee(f), J(), new St(48))
          }),
          (f.Ia = c),
          f
        )
      },
      re = (t, e, n, r, a, i, u, f, c, s) => {
        function l(n) {
          function o(n) {
            s && s(), f || Zt(t, e, n, r, a, c), i && i(), z()
          }
          ;(void 0).wc(n, h, o, () => {
            u && u(), z()
          }) || o(n)
        }
        var h = e ? ut(at(t + '/' + e)) : t
        Y(),
          'string' == typeof n
            ? (function (t, e, n) {
                var r = 'al ' + t
                o(
                  t,
                  (e) => {
                    e || J('Loading data file "' + t + '" failed (no arrayBuffer).'),
                      l(new Uint8Array(e)),
                      r && z()
                  },
                  () => {
                    if (!n) throw 'Loading data file "' + t + '" failed.'
                    n()
                  },
                ),
                  r && Y()
              })(n, 0, u)
            : l(n)
      },
      ae = void 0
    function ie() {
      return R[((ae += 4) - 4) >> 2]
    }
    function oe(t) {
      if (!(t = gt[t])) throw new St(8)
      return t
    }
    var ue,
      fe = {}
    function ce() {
      if (!ue) {
        var t,
          e = {
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
            _: c || './this.program',
          }
        for (t in fe) void 0 === fe[t] ? delete e[t] : (e[t] = fe[t])
        var n = []
        for (t in e) n.push(t + '=' + e[t])
        ue = n
      }
      return ue
    }
    function se(t) {
      return 0 == t % 4 && (0 != t % 100 || 0 == t % 400)
    }
    var le = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
      he = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
    function de(t, e, n, r) {
      t || (t = this),
        (this.parent = t),
        (this.Ta = t.Ta),
        (this.eb = null),
        (this.id = Mt++),
        (this.name = e),
        (this.mode = n),
        (this.Ha = {}),
        (this.Ia = {}),
        (this.fb = r)
    }
    Object.defineProperties(de.prototype, {
      read: {
        get: function () {
          return !(365 & ~this.mode)
        },
        set: function (t) {
          t ? (this.mode |= 365) : (this.mode &= -366)
        },
      },
      write: {
        get: function () {
          return !(146 & ~this.mode)
        },
        set: function (t) {
          t ? (this.mode |= 146) : (this.mode &= -147)
        },
      },
      ic: {
        get: function () {
          return 16384 == (61440 & this.mode)
        },
      },
      hc: {
        get: function () {
          return 8192 == (61440 & this.mode)
        },
      },
    }),
      Vt(),
      (_t = Array(4096)),
      Lt(mt, '/'),
      xt('/tmp', 16895, 0),
      xt('/home', 16895, 0),
      xt('/home/web_user', 16895, 0),
      (() => {
        xt('/dev', 16895, 0),
          jt(259, { read: () => 0, write: (t, e, n, r) => r }),
          Ut('/dev/null', 259),
          st(1280, wt),
          st(1536, bt),
          Ut('/dev/tty', 1280),
          Ut('/dev/tty1', 1536)
        var t = (function () {
          if ('object' == typeof crypto && 'function' == typeof crypto.getRandomValues) {
            var t = new Uint8Array(1)
            return () => (crypto.getRandomValues(t), t[0])
          }
          return () => J('randomDevice')
        })()
        te('/dev', 'random', t),
          te('/dev', 'urandom', t),
          xt('/dev/shm', 16895, 0),
          xt('/dev/shm/tmp', 16895, 0)
      })(),
      (() => {
        xt('/proc', 16895, 0)
        var t = xt('/proc/self', 16895, 0)
        xt('/proc/self/fd', 16895, 0),
          Lt(
            {
              Ta: () => {
                var e = Et(t, 'fd', 16895, 73)
                return (
                  (e.Ha = {
                    cb: (t, e) => {
                      var n = gt[+e]
                      if (!n) throw new St(8)
                      return ((t = {
                        parent: null,
                        Ta: { Lb: 'fake' },
                        Ha: { gb: () => n.path },
                      }).parent = t)
                    },
                  }),
                  e
                )
              },
            },
            '/proc/self/fd',
          )
      })(),
      (n.FS_createPath = $t),
      (n.FS_createDataFile = Zt),
      (n.FS_createPreloadedFile = re),
      (n.FS_unlink = Yt),
      (n.FS_createLazyFile = ne),
      (n.FS_createDevice = te)
    var pe = {
      l: function (t) {
        return me(t + 24) + 24
      },
      n: function (t) {
        return (t = new Z(t)).Tb() || (t.wb(!0), B--), t.xb(!1), Q.push(t), t.ob(), t.Ub()
      },
      o: function () {
        ye(0)
        var t = Q.pop()
        if (t.lc() && !t.Ib()) {
          var e = t.dc()
          e && nt(e)(t.bb), tt(t.bb)
        }
        $ = 0
      },
      a: function () {
        var t = $
        if (!t) return ge(0), 0
        var e = new Z(t)
        e.Ua(t)
        var n = e.Ka()
        if (!n) return ge(0), t
        for (var r = 0; r < arguments.length; r++) {
          var a = arguments[r]
          if (0 === a || a === n) break
          if (Se(a, n, e.La + 16)) return ge(a), t
        }
        return ge(n), t
      },
      e: function () {
        var t = $
        if (!t) return ge(0), 0
        var e = new Z(t)
        e.Ua(t)
        var n = e.Ka()
        if (!n) return ge(0), t
        for (var r = 0; r < arguments.length; r++) {
          var a = arguments[r]
          if (0 === a || a === n) break
          if (Se(a, n, e.La + 16)) return ge(a), t
        }
        return ge(n), t
      },
      q: function () {
        var t = $
        if (!t) return ge(0), 0
        var e = new Z(t)
        e.Ua(t)
        var n = e.Ka()
        if (!n) return ge(0), t
        for (var r = 0; r < arguments.length; r++) {
          var a = arguments[r]
          if (0 === a || a === n) break
          if (Se(a, n, e.La + 16)) return ge(a), t
        }
        return ge(n), t
      },
      m: tt,
      G: function () {
        var t = Q.pop()
        t || J('no exception to throw')
        var e = t.bb
        throw (t.Ib() || (Q.push(t), t.xb(!0), t.wb(!1), B++), ($ = e), e)
      },
      p: function (t, e, n) {
        throw (new Z(t).Vb(e, n), ($ = t), B++, t)
      },
      ga: function () {
        return B
      },
      f: function (t) {
        throw ($ || ($ = t), t)
      },
      J: function (t, e, n) {
        ae = n
        try {
          var r = oe(t)
          switch (e) {
            case 0:
              var a = ie()
              return 0 > a ? -28 : Tt(r, a).Va
            case 1:
            case 2:
            case 6:
            case 7:
              return 0
            case 3:
              return r.flags
            case 4:
              return (a = ie()), (r.flags |= a), 0
            case 5:
              return (a = ie()), (_[(a + 0) >> 1] = 2), 0
            case 16:
            case 8:
            default:
              return -28
            case 9:
              return (R[ve() >> 2] = 28), -1
          }
        } catch (t) {
          if (!(t instanceof St)) throw t
          return -t.Sa
        }
      },
      fa: function (t, e, n) {
        ae = n
        try {
          var r = oe(t)
          switch (e) {
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
              return r.Ma ? 0 : -59
            case 21519:
              if (!r.Ma) return -59
              var a = ie()
              return (R[a >> 2] = 0)
            case 21520:
              return r.Ma ? -28 : -59
            case 21531:
              if (((t = a = ie()), !r.Ia.fc)) throw new St(59)
              return r.Ia.fc(r, e, t)
            default:
              return -28
          }
        } catch (t) {
          if (!(t instanceof St)) throw t
          return -t.Sa
        }
      },
      ha: function (t, e, n, r) {
        ae = r
        try {
          var a = (e = I(e))
          if ('/' === a.charAt(0)) e = a
          else {
            var i = -100 === t ? '/' : oe(t).path
            if (0 == a.length) throw new St(44)
            e = at(i + '/' + a)
          }
          var o = r ? ie() : 0
          return Wt(e, n, o).Va
        } catch (t) {
          if (!(t instanceof St)) throw t
          return -t.Sa
        }
      },
      $: function (t, e) {
        try {
          t = I(t)
          t: {
            try {
              var n = kt(t, { hb: !0 }).node
              if (!n) throw new St(44)
              if (!n.Ha.Pa) throw new St(63)
              var r = n.Ha.Pa(n)
            } catch (e) {
              if (e && e.node && at(t) !== at(At(e.node))) {
                var a = -54
                break t
              }
              throw e
            }
            ;(R[e >> 2] = r.cc),
              (R[(e + 8) >> 2] = r.rb),
              (R[(e + 12) >> 2] = r.mode),
              (S[(e + 16) >> 2] = r.kc),
              (R[(e + 20) >> 2] = r.uid),
              (R[(e + 24) >> 2] = r.ec),
              (R[(e + 28) >> 2] = r.fb),
              (L = [
                r.size >>> 0,
                ((j = r.size),
                1 <= +Math.abs(j)
                  ? 0 < j
                    ? (0 | Math.min(+Math.floor(j / 4294967296), 4294967295)) >>> 0
                    : ~~+Math.ceil((j - +(~~j >>> 0)) / 4294967296) >>> 0
                  : 0),
              ]),
              (R[(e + 40) >> 2] = L[0]),
              (R[(e + 44) >> 2] = L[1]),
              (R[(e + 48) >> 2] = 4096),
              (R[(e + 52) >> 2] = r.bc),
              (L = [
                Math.floor(r.Ab.getTime() / 1e3) >>> 0,
                ((j = Math.floor(r.Ab.getTime() / 1e3)),
                1 <= +Math.abs(j)
                  ? 0 < j
                    ? (0 | Math.min(+Math.floor(j / 4294967296), 4294967295)) >>> 0
                    : ~~+Math.ceil((j - +(~~j >>> 0)) / 4294967296) >>> 0
                  : 0),
              ]),
              (R[(e + 56) >> 2] = L[0]),
              (R[(e + 60) >> 2] = L[1]),
              (S[(e + 64) >> 2] = 0),
              (L = [
                Math.floor(r.Nb.getTime() / 1e3) >>> 0,
                ((j = Math.floor(r.Nb.getTime() / 1e3)),
                1 <= +Math.abs(j)
                  ? 0 < j
                    ? (0 | Math.min(+Math.floor(j / 4294967296), 4294967295)) >>> 0
                    : ~~+Math.ceil((j - +(~~j >>> 0)) / 4294967296) >>> 0
                  : 0),
              ]),
              (R[(e + 72) >> 2] = L[0]),
              (R[(e + 76) >> 2] = L[1]),
              (S[(e + 80) >> 2] = 0),
              (L = [
                Math.floor(r.Eb.getTime() / 1e3) >>> 0,
                ((j = Math.floor(r.Eb.getTime() / 1e3)),
                1 <= +Math.abs(j)
                  ? 0 < j
                    ? (0 | Math.min(+Math.floor(j / 4294967296), 4294967295)) >>> 0
                    : ~~+Math.ceil((j - +(~~j >>> 0)) / 4294967296) >>> 0
                  : 0),
              ]),
              (R[(e + 88) >> 2] = L[0]),
              (R[(e + 92) >> 2] = L[1]),
              (S[(e + 96) >> 2] = 0),
              (L = [
                r.rb >>> 0,
                ((j = r.rb),
                1 <= +Math.abs(j)
                  ? 0 < j
                    ? (0 | Math.min(+Math.floor(j / 4294967296), 4294967295)) >>> 0
                    : ~~+Math.ceil((j - +(~~j >>> 0)) / 4294967296) >>> 0
                  : 0),
              ]),
              (R[(e + 104) >> 2] = L[0]),
              (R[(e + 108) >> 2] = L[1]),
              (a = 0)
          }
          return a
        } catch (t) {
          if (!(t instanceof St)) throw t
          return -t.Sa
        }
      },
      L: function () {
        return !0
      },
      F: function () {
        J('')
      },
      ia: () => performance.now(),
      M: function (t, e, n) {
        M.copyWithin(t, e, e + n)
      },
      B: function (t) {
        var e = M.length
        if (1073741824 < (t >>>= 0)) return !1
        for (var n = 1; 4 >= n; n *= 2) {
          var r = e * (1 + 0.2 / n)
          r = Math.min(r, t + 100663296)
          var a = Math
          ;(r = Math.max(t, r)),
            (a = a.min.call(a, 1073741824, r + ((65536 - (r % 65536)) % 65536)))
          t: {
            try {
              v.grow((a - y.byteLength + 65535) >>> 16), E()
              var i = 1
              break t
            } catch (t) {}
            i = void 0
          }
          if (i) return !0
        }
        return !1
      },
      ba: function (t, e) {
        var n = 0
        return (
          ce().forEach(function (r, a) {
            var i = e + n
            for (a = S[(t + 4 * a) >> 2] = i, i = 0; i < r.length; ++i) g[0 | a++] = r.charCodeAt(i)
            ;(g[0 | a] = 0), (n += r.length + 1)
          }),
          0
        )
      },
      ca: function (t, e) {
        var n = ce()
        S[t >> 2] = n.length
        var r = 0
        return (
          n.forEach(function (t) {
            r += t.length + 1
          }),
          (S[e >> 2] = r),
          0
        )
      },
      Q: function (t) {
        m || (n.onExit && n.onExit(t), (H = !0)), s(t, new q(t))
      },
      K: function (t) {
        try {
          var e = oe(t)
          return Kt(e), 0
        } catch (t) {
          if (!(t instanceof St)) throw t
          return t.Sa
        }
      },
      ea: function (t, e, n, r) {
        try {
          t: {
            var a = oe(t)
            t = e
            for (var i = (e = 0); i < n; i++) {
              var o = S[t >> 2],
                u = S[(t + 4) >> 2]
              t += 8
              var f = a,
                c = o,
                s = u,
                l = void 0,
                h = g
              if (0 > s || 0 > l) throw new St(28)
              if (null === f.Va) throw new St(8)
              if (1 == (2097155 & f.flags)) throw new St(8)
              if (16384 == (61440 & f.node.mode)) throw new St(31)
              if (!f.Ia.read) throw new St(28)
              var d = void 0 !== l
              if (d) {
                if (!f.seekable) throw new St(70)
              } else l = f.position
              var p = f.Ia.read(f, h, c, s, l)
              d || (f.position += p)
              var w = p
              if (0 > w) {
                var b = -1
                break t
              }
              if (((e += w), w < u)) break
            }
            b = e
          }
          return (S[r >> 2] = b), 0
        } catch (t) {
          if (!(t instanceof St)) throw t
          return t.Sa
        }
      },
      X: function (t, e, n, r, a) {
        try {
          if (
            ((e = (n + 2097152) >>> 0 < 4194305 - !!e ? (e >>> 0) + 4294967296 * n : NaN), isNaN(e))
          )
            return 61
          var i = oe(t)
          return (
            Xt(i, e, r),
            (L = [
              i.position >>> 0,
              ((j = i.position),
              1 <= +Math.abs(j)
                ? 0 < j
                  ? (0 | Math.min(+Math.floor(j / 4294967296), 4294967295)) >>> 0
                  : ~~+Math.ceil((j - +(~~j >>> 0)) / 4294967296) >>> 0
                : 0),
            ]),
            (R[a >> 2] = L[0]),
            (R[(a + 4) >> 2] = L[1]),
            i.qb && 0 === e && 0 === r && (i.qb = null),
            0
          )
        } catch (t) {
          if (!(t instanceof St)) throw t
          return t.Sa
        }
      },
      da: function (t, e, n, r) {
        try {
          t: {
            var a = oe(t)
            t = e
            for (var i = (e = 0); i < n; i++) {
              var o = S[t >> 2],
                u = S[(t + 4) >> 2]
              t += 8
              var f = qt(a, g, o, u)
              if (0 > f) {
                var c = -1
                break t
              }
              e += f
            }
            c = e
          }
          return (S[r >> 2] = c), 0
        } catch (t) {
          if (!(t instanceof St)) throw t
          return t.Sa
        }
      },
      Z: function (t, e) {
        var n = Me()
        try {
          return nt(t)(e)
        } catch (t) {
          if ((_e(n), t !== t + 0)) throw t
          ye(1, 0)
        }
      },
      Y: function (t, e, n) {
        var r = Me()
        try {
          return nt(t)(e, n)
        } catch (t) {
          if ((_e(r), t !== t + 0)) throw t
          ye(1, 0)
        }
      },
      A: function (t) {
        var e = Me()
        try {
          return nt(t)()
        } catch (t) {
          if ((_e(e), t !== t + 0)) throw t
          ye(1, 0)
        }
      },
      c: function (t, e) {
        var n = Me()
        try {
          return nt(t)(e)
        } catch (t) {
          if ((_e(n), t !== t + 0)) throw t
          ye(1, 0)
        }
      },
      E: function (t, e, n) {
        var r = Me()
        try {
          return nt(t)(e, n)
        } catch (t) {
          if ((_e(r), t !== t + 0)) throw t
          ye(1, 0)
        }
      },
      D: function (t, e, n) {
        var r = Me()
        try {
          return nt(t)(e, n)
        } catch (t) {
          if ((_e(r), t !== t + 0)) throw t
          ye(1, 0)
        }
      },
      b: function (t, e, n) {
        var r = Me()
        try {
          return nt(t)(e, n)
        } catch (t) {
          if ((_e(r), t !== t + 0)) throw t
          ye(1, 0)
        }
      },
      d: function (t, e, n, r) {
        var a = Me()
        try {
          return nt(t)(e, n, r)
        } catch (t) {
          if ((_e(a), t !== t + 0)) throw t
          ye(1, 0)
        }
      },
      _: function (t, e, n, r, a) {
        var i = Me()
        try {
          return nt(t)(e, n, r, a)
        } catch (t) {
          if ((_e(i), t !== t + 0)) throw t
          ye(1, 0)
        }
      },
      I: function (t, e, n, r, a, i) {
        var o = Me()
        try {
          return nt(t)(e, n, r, a, i)
        } catch (t) {
          if ((_e(o), t !== t + 0)) throw t
          ye(1, 0)
        }
      },
      x: function (t, e, n, r, a, i) {
        var o = Me()
        try {
          return nt(t)(e, n, r, a, i)
        } catch (t) {
          if ((_e(o), t !== t + 0)) throw t
          ye(1, 0)
        }
      },
      C: function (t, e, n, r, a, i) {
        var o = Me()
        try {
          return nt(t)(e, n, r, a, i)
        } catch (t) {
          if ((_e(o), t !== t + 0)) throw t
          ye(1, 0)
        }
      },
      t: function (t, e, n, r, a, i, o) {
        var u = Me()
        try {
          return nt(t)(e, n, r, a, i, o)
        } catch (t) {
          if ((_e(u), t !== t + 0)) throw t
          ye(1, 0)
        }
      },
      H: function (t, e, n, r, a, i, o, u) {
        var f = Me()
        try {
          return nt(t)(e, n, r, a, i, o, u)
        } catch (t) {
          if ((_e(f), t !== t + 0)) throw t
          ye(1, 0)
        }
      },
      z: function (t, e, n, r, a, i, o, u, f, c, s, l) {
        var h = Me()
        try {
          return nt(t)(e, n, r, a, i, o, u, f, c, s, l)
        } catch (t) {
          if ((_e(h), t !== t + 0)) throw t
          ye(1, 0)
        }
      },
      O: function (t, e, n, r, a, i, o) {
        var u = Me()
        try {
          return Fe(t, e, n, r, a, i, o)
        } catch (t) {
          if ((_e(u), t !== t + 0)) throw t
          ye(1, 0)
        }
      },
      P: function (t, e, n, r, a, i) {
        var o = Me()
        try {
          return Oe(t, e, n, r, a, i)
        } catch (t) {
          if ((_e(o), t !== t + 0)) throw t
          ye(1, 0)
        }
      },
      R: function (t, e, n, r, a) {
        var i = Me()
        try {
          return Ge(t, e, n, r, a)
        } catch (t) {
          if ((_e(i), t !== t + 0)) throw t
          ye(1, 0)
        }
      },
      W: function (t, e, n, r) {
        var a = Me()
        try {
          return ke(t, e, n, r)
        } catch (t) {
          if ((_e(a), t !== t + 0)) throw t
          ye(1, 0)
        }
      },
      S: function (t) {
        var e = Me()
        try {
          return Ie(t)
        } catch (t) {
          if ((_e(e), t !== t + 0)) throw t
          ye(1, 0)
        }
      },
      V: function (t, e) {
        var n = Me()
        try {
          return Ae(t, e)
        } catch (t) {
          if ((_e(n), t !== t + 0)) throw t
          ye(1, 0)
        }
      },
      T: function (t, e, n) {
        var r = Me()
        try {
          return De(t, e, n)
        } catch (t) {
          if ((_e(r), t !== t + 0)) throw t
          ye(1, 0)
        }
      },
      N: function (t, e, n, r) {
        var a = Me()
        try {
          return Ce(t, e, n, r)
        } catch (t) {
          if ((_e(a), t !== t + 0)) throw t
          ye(1, 0)
        }
      },
      h: function (t) {
        var e = Me()
        try {
          nt(t)()
        } catch (t) {
          if ((_e(e), t !== t + 0)) throw t
          ye(1, 0)
        }
      },
      k: function (t, e) {
        var n = Me()
        try {
          nt(t)(e)
        } catch (t) {
          if ((_e(n), t !== t + 0)) throw t
          ye(1, 0)
        }
      },
      g: function (t, e, n) {
        var r = Me()
        try {
          nt(t)(e, n)
        } catch (t) {
          if ((_e(r), t !== t + 0)) throw t
          ye(1, 0)
        }
      },
      i: function (t, e, n, r) {
        var a = Me()
        try {
          nt(t)(e, n, r)
        } catch (t) {
          if ((_e(a), t !== t + 0)) throw t
          ye(1, 0)
        }
      },
      j: function (t, e, n, r, a) {
        var i = Me()
        try {
          nt(t)(e, n, r, a)
        } catch (t) {
          if ((_e(i), t !== t + 0)) throw t
          ye(1, 0)
        }
      },
      u: function (t, e, n, r, a, i) {
        var o = Me()
        try {
          nt(t)(e, n, r, a, i)
        } catch (t) {
          if ((_e(o), t !== t + 0)) throw t
          ye(1, 0)
        }
      },
      w: function (t, e, n, r, a, i, o) {
        var u = Me()
        try {
          nt(t)(e, n, r, a, i, o)
        } catch (t) {
          if ((_e(u), t !== t + 0)) throw t
          ye(1, 0)
        }
      },
      s: function (t, e, n, r, a, i, o, u) {
        var f = Me()
        try {
          nt(t)(e, n, r, a, i, o, u)
        } catch (t) {
          if ((_e(f), t !== t + 0)) throw t
          ye(1, 0)
        }
      },
      v: function (t, e, n, r, a, i, o, u, f, c, s) {
        var l = Me()
        try {
          nt(t)(e, n, r, a, i, o, u, f, c, s)
        } catch (t) {
          if ((_e(l), t !== t + 0)) throw t
          ye(1, 0)
        }
      },
      y: function (t, e, n, r, a, i, o, u, f, c, s, l, h, d, p, w) {
        var b = Me()
        try {
          nt(t)(e, n, r, a, i, o, u, f, c, s, l, h, d, p, w)
        } catch (t) {
          if ((_e(b), t !== t + 0)) throw t
          ye(1, 0)
        }
      },
      U: function (t, e, n, r) {
        var a = Me()
        try {
          Ee(t, e, n, r)
        } catch (t) {
          if ((_e(a), t !== t + 0)) throw t
          ye(1, 0)
        }
      },
      r: function (t) {
        return t
      },
      aa: function (t, e, n, r) {
        return (function (t, e, n, r) {
          function a(t, e, n) {
            for (t = 'number' == typeof t ? t.toString() : t || ''; t.length < e; ) t = n[0] + t
            return t
          }
          function i(t, e) {
            return a(t, e, '0')
          }
          function o(t, e) {
            function n(t) {
              return 0 > t ? -1 : 0 < t ? 1 : 0
            }
            var r
            return (
              0 === (r = n(t.getFullYear() - e.getFullYear())) &&
                0 === (r = n(t.getMonth() - e.getMonth())) &&
                (r = n(t.getDate() - e.getDate())),
              r
            )
          }
          function u(t) {
            switch (t.getDay()) {
              case 0:
                return new Date(t.getFullYear() - 1, 11, 29)
              case 1:
                return t
              case 2:
                return new Date(t.getFullYear(), 0, 3)
              case 3:
                return new Date(t.getFullYear(), 0, 2)
              case 4:
                return new Date(t.getFullYear(), 0, 1)
              case 5:
                return new Date(t.getFullYear() - 1, 11, 31)
              case 6:
                return new Date(t.getFullYear() - 1, 11, 30)
            }
          }
          function f(t) {
            var e = t.Xa
            for (t = new Date(new Date(t.Ya + 1900, 0, 1).getTime()); 0 < e; ) {
              var n = t.getMonth(),
                r = (se(t.getFullYear()) ? le : he)[n]
              if (!(e > r - t.getDate())) {
                t.setDate(t.getDate() + e)
                break
              }
              ;(e -= r - t.getDate() + 1),
                t.setDate(1),
                11 > n ? t.setMonth(n + 1) : (t.setMonth(0), t.setFullYear(t.getFullYear() + 1))
            }
            return (
              (n = new Date(t.getFullYear() + 1, 0, 4)),
              (e = u(new Date(t.getFullYear(), 0, 4))),
              (n = u(n)),
              0 >= o(e, t)
                ? 0 >= o(n, t)
                  ? t.getFullYear() + 1
                  : t.getFullYear()
                : t.getFullYear() - 1
            )
          }
          var c = R[(r + 40) >> 2]
          for (var s in ((r = {
            qc: R[r >> 2],
            pc: R[(r + 4) >> 2],
            lb: R[(r + 8) >> 2],
            yb: R[(r + 12) >> 2],
            mb: R[(r + 16) >> 2],
            Ya: R[(r + 20) >> 2],
            Ra: R[(r + 24) >> 2],
            Xa: R[(r + 28) >> 2],
            yc: R[(r + 32) >> 2],
            oc: R[(r + 36) >> 2],
            rc: c ? I(c) : '',
          }),
          (n = I(n)),
          (c = {
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
            n = n.replace(new RegExp(s, 'g'), c[s])
          var l = 'Sunday Monday Tuesday Wednesday Thursday Friday Saturday'.split(' '),
            h =
              'January February March April May June July August September October November December'.split(
                ' ',
              )
          for (s in ((c = {
            '%a': function (t) {
              return l[t.Ra].substring(0, 3)
            },
            '%A': function (t) {
              return l[t.Ra]
            },
            '%b': function (t) {
              return h[t.mb].substring(0, 3)
            },
            '%B': function (t) {
              return h[t.mb]
            },
            '%C': function (t) {
              return i(((t.Ya + 1900) / 100) | 0, 2)
            },
            '%d': function (t) {
              return i(t.yb, 2)
            },
            '%e': function (t) {
              return a(t.yb, 2, ' ')
            },
            '%g': function (t) {
              return f(t).toString().substring(2)
            },
            '%G': function (t) {
              return f(t)
            },
            '%H': function (t) {
              return i(t.lb, 2)
            },
            '%I': function (t) {
              return 0 == (t = t.lb) ? (t = 12) : 12 < t && (t -= 12), i(t, 2)
            },
            '%j': function (t) {
              for (var e = 0, n = 0; n <= t.mb - 1; e += (se(t.Ya + 1900) ? le : he)[n++]);
              return i(t.yb + e, 3)
            },
            '%m': function (t) {
              return i(t.mb + 1, 2)
            },
            '%M': function (t) {
              return i(t.pc, 2)
            },
            '%n': function () {
              return '\n'
            },
            '%p': function (t) {
              return 0 <= t.lb && 12 > t.lb ? 'AM' : 'PM'
            },
            '%S': function (t) {
              return i(t.qc, 2)
            },
            '%t': function () {
              return '\t'
            },
            '%u': function (t) {
              return t.Ra || 7
            },
            '%U': function (t) {
              return i(Math.floor((t.Xa + 7 - t.Ra) / 7), 2)
            },
            '%V': function (t) {
              var e = Math.floor((t.Xa + 7 - ((t.Ra + 6) % 7)) / 7)
              if ((2 >= (t.Ra + 371 - t.Xa - 2) % 7 && e++, e))
                53 == e && (4 == (n = (t.Ra + 371 - t.Xa) % 7) || (3 == n && se(t.Ya)) || (e = 1))
              else {
                e = 52
                var n = (t.Ra + 7 - t.Xa - 1) % 7
                ;(4 == n || (5 == n && se((t.Ya % 400) - 1))) && e++
              }
              return i(e, 2)
            },
            '%w': function (t) {
              return t.Ra
            },
            '%W': function (t) {
              return i(Math.floor((t.Xa + 7 - ((t.Ra + 6) % 7)) / 7), 2)
            },
            '%y': function (t) {
              return (t.Ya + 1900).toString().substring(2)
            },
            '%Y': function (t) {
              return t.Ya + 1900
            },
            '%z': function (t) {
              var e = 0 <= (t = t.oc)
              return (
                (t = Math.abs(t) / 60),
                (e ? '+' : '-') + String('0000' + ((t / 60) * 100 + (t % 60))).slice(-4)
              )
            },
            '%Z': function (t) {
              return t.rc
            },
            '%%': function () {
              return '%'
            },
          }),
          (n = n.replace(/%%/g, '\0\0')),
          c))
            n.includes(s) && (n = n.replace(new RegExp(s, 'g'), c[s](r)))
          return (s = ft((n = n.replace(/\0\0/g, '%')), !1)).length > e
            ? 0
            : (g.set(s, t), s.length - 1)
        })(t, e, n, r)
      },
    }
    !(function () {
      function t(t) {
        ;(n.asm = t.exports), (v = n.asm.ja), E(), (D = n.asm.oa), G.unshift(n.asm.ka), z()
      }
      function e(e) {
        t(e.instance)
      }
      function r(t) {
        return (
          p || (!l && !h) || 'function' != typeof fetch
            ? Promise.resolve().then(function () {
                return X()
              })
            : fetch(P, { credentials: 'same-origin' })
                .then(function (t) {
                  if (!t.ok) throw "failed to load wasm binary file at '" + P + "'"
                  return t.arrayBuffer()
                })
                .catch(function () {
                  return X()
                })
        )
          .then(function (t) {
            return WebAssembly.instantiate(t, i)
          })
          .then(function (t) {
            return t
          })
          .then(t, function (t) {
            b('failed to asynchronously prepare wasm: ' + t), J(t)
          })
      }
      var i = { a: pe }
      if ((Y(), n.instantiateWasm))
        try {
          return n.instantiateWasm(i, t)
        } catch (t) {
          return b('Module.instantiateWasm callback failed with error: ' + t), !1
        }
      ;(p ||
      'function' != typeof WebAssembly.instantiateStreaming ||
      W() ||
      'function' != typeof fetch
        ? r(e)
        : fetch(P, { credentials: 'same-origin' }).then(function (t) {
            return WebAssembly.instantiateStreaming(t, i).then(e, function (t) {
              return (
                b('wasm streaming compile failed: ' + t),
                b('falling back to ArrayBuffer instantiation'),
                r(e)
              )
            })
          })
      ).catch(a)
    })(),
      (n.___wasm_call_ctors = function () {
        return (n.___wasm_call_ctors = n.asm.ka).apply(null, arguments)
      }),
      (n._gomocupLoopOnce = function () {
        return (n._gomocupLoopOnce = n.asm.la).apply(null, arguments)
      })
    var we,
      be = (n._free = function () {
        return (be = n._free = n.asm.ma).apply(null, arguments)
      }),
      me = (n._malloc = function () {
        return (me = n._malloc = n.asm.na).apply(null, arguments)
      }),
      ve = (n.___errno_location = function () {
        return (ve = n.___errno_location = n.asm.pa).apply(null, arguments)
      }),
      ye = (n._setThrew = function () {
        return (ye = n._setThrew = n.asm.qa).apply(null, arguments)
      }),
      ge = (n.setTempRet0 = function () {
        return (ge = n.setTempRet0 = n.asm.ra).apply(null, arguments)
      }),
      Me = (n.stackSave = function () {
        return (Me = n.stackSave = n.asm.sa).apply(null, arguments)
      }),
      _e = (n.stackRestore = function () {
        return (_e = n.stackRestore = n.asm.ta).apply(null, arguments)
      }),
      Re = (n.stackAlloc = function () {
        return (Re = n.stackAlloc = n.asm.ua).apply(null, arguments)
      }),
      Se = (n.___cxa_can_catch = function () {
        return (Se = n.___cxa_can_catch = n.asm.va).apply(null, arguments)
      }),
      He = (n.___cxa_is_pointer_type = function () {
        return (He = n.___cxa_is_pointer_type = n.asm.wa).apply(null, arguments)
      }),
      ke = (n.dynCall_iij = function () {
        return (ke = n.dynCall_iij = n.asm.xa).apply(null, arguments)
      }),
      Ae = (n.dynCall_ji = function () {
        return (Ae = n.dynCall_ji = n.asm.ya).apply(null, arguments)
      }),
      Ie = (n.dynCall_j = function () {
        return (Ie = n.dynCall_j = n.asm.za).apply(null, arguments)
      }),
      Fe = (n.dynCall_iiiiij = function () {
        return (Fe = n.dynCall_iiiiij = n.asm.Aa).apply(null, arguments)
      }),
      Ee = (n.dynCall_vij = function () {
        return (Ee = n.dynCall_vij = n.asm.Ba).apply(null, arguments)
      }),
      De = (n.dynCall_jii = function () {
        return (De = n.dynCall_jii = n.asm.Ca).apply(null, arguments)
      }),
      Ce = (n.dynCall_jiii = function () {
        return (Ce = n.dynCall_jiii = n.asm.Da).apply(null, arguments)
      }),
      Ge = (n.dynCall_iiij = function () {
        return (Ge = n.dynCall_iiij = n.asm.Ea).apply(null, arguments)
      }),
      Oe = (n.dynCall_iiiij = function () {
        return (Oe = n.dynCall_iiiij = n.asm.Fa).apply(null, arguments)
      })
    function Te() {
      function t() {
        if (!we && ((we = !0), (n.calledRun = !0), !H)) {
          if (
            (n.noFSInit || lt || Qt(),
            (Rt = !1),
            V(G),
            r(n),
            n.onRuntimeInitialized && n.onRuntimeInitialized(),
            n.postRun)
          )
            for ('function' == typeof n.postRun && (n.postRun = [n.postRun]); n.postRun.length; ) {
              var t = n.postRun.shift()
              O.unshift(t)
            }
          V(O)
        }
      }
      if (!(0 < x)) {
        if (n.preRun)
          for ('function' == typeof n.preRun && (n.preRun = [n.preRun]); n.preRun.length; ) T()
        V(C),
          0 < x ||
            (n.setStatus
              ? (n.setStatus('Running...'),
                setTimeout(function () {
                  setTimeout(function () {
                    n.setStatus('')
                  }, 1),
                    t()
                }, 1))
              : t())
      }
    }
    if (
      ((n.addRunDependency = Y),
      (n.removeRunDependency = z),
      (n.FS_createPath = $t),
      (n.FS_createDataFile = Zt),
      (n.FS_createPreloadedFile = re),
      (n.FS_createLazyFile = ne),
      (n.FS_createDevice = te),
      (n.FS_unlink = Yt),
      (n.cwrap = function (t, e, r, a) {
        var i = (r = r || []).every((t) => 'number' === t || 'boolean' === t)
        return 'string' !== e && i && !a
          ? n['_' + t]
          : function () {
              return (function (t, e, r, a) {
                var i = {
                  string: (t) => {
                    var e = 0
                    if (null != t && 0 !== t) {
                      var n = 1 + (t.length << 2)
                      ;(e = Re(n)), F(t, M, e, n)
                    }
                    return e
                  },
                  array: (t) => {
                    var e = Re(t.length)
                    return g.set(t, e), e
                  },
                }
                t = n['_' + t]
                var o,
                  u = [],
                  f = 0
                if (a)
                  for (var c = 0; c < a.length; c++) {
                    var s = i[r[c]]
                    s ? (0 === f && (f = Me()), (u[c] = s(a[c]))) : (u[c] = a[c])
                  }
                return (
                  (o = r = t.apply(null, u)),
                  0 !== f && _e(f),
                  'string' === e ? I(o) : 'boolean' === e ? !!o : o
                )
              })(t, e, r, arguments)
            }
      }),
      (N = function t() {
        we || Te(), we || (N = t)
      }),
      n.preInit)
    )
      for ('function' == typeof n.preInit && (n.preInit = [n.preInit]); 0 < n.preInit.length; )
        n.preInit.pop()()
    return Te(), e.ready
  }
})()
'object' == typeof exports && 'object' == typeof module
  ? (module.exports = Rapfi)
  : 'function' == typeof define && define.amd
    ? define([], function () {
        return Rapfi
      })
    : 'object' == typeof exports && (exports.Rapfi = Rapfi)
