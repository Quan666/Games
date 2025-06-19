/**
 * 浏览器检测工具
 * 用于检测当前浏览器类型，特别是Safari浏览器
 */

/**
 * 检测是否为Safari浏览器
 */
export function isSafari(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return false
  }
  
  const userAgent = navigator.userAgent.toLowerCase()
  
  // 检测Safari但排除Chrome（Chrome也包含Safari字符串）
  return userAgent.includes('safari') && 
         !userAgent.includes('chrome') && 
         !userAgent.includes('chromium') && 
         !userAgent.includes('edge')
}

/**
 * 检测是否为移动Safari
 */
export function isMobileSafari(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return false
  }
  
  const userAgent = navigator.userAgent.toLowerCase()
  
  return isSafari() && (
    userAgent.includes('mobile') || 
    userAgent.includes('iphone') || 
    userAgent.includes('ipad')
  )
}

/**
 * 检测是否为桌面Safari
 */
export function isDesktopSafari(): boolean {
  return isSafari() && !isMobileSafari()
}

/**
 * 获取浏览器类型字符串
 */
export function getBrowserType(): string {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return 'unknown'
  }
  
  const userAgent = navigator.userAgent.toLowerCase()
  
  if (userAgent.includes('chrome') && !userAgent.includes('edge')) {
    return 'chrome'
  } else if (userAgent.includes('firefox')) {
    return 'firefox'
  } else if (userAgent.includes('edge')) {
    return 'edge'
  } else if (isSafari()) {
    return 'safari'
  } else if (userAgent.includes('opera')) {
    return 'opera'
  }
  
  return 'unknown'
}
