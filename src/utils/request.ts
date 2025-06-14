import axios from 'axios'

// 创建axios实例
const service = axios.create({
  // 服务接口请求
  baseURL: import.meta.env.VITE_APP_BASE_API,
  // 超时设置
  timeout: 1800000,
  headers: { 'Content-Type': 'application/json;charset=utf-8' },
})

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    // 可在此处添加 token
    const token = localStorage.getItem('token')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// 响应拦截器
service.interceptors.response.use(
  (response) => {
    // 可根据实际后端返回结构调整
    const res = response.data
    if (res.code && res.code !== 200) {
      // 全局错误提示
      alert(res.message || '请求错误')
      return Promise.reject(res.message || 'Error')
    } else {
      return res
    }
  },
  (error) => {
    alert(error.message || '网络错误')
    return Promise.reject(error)
  },
)

// 通用请求方法
export default service
