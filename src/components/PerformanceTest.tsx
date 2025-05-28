import { useState, useEffect } from 'react'

interface PerformanceMetrics {
  deviceInfo: {
    userAgent: string
    platform: string
    memory?: number
    cores?: number
  }
  networkInfo: {
    effectiveType?: string
    downlink?: number
    rtt?: number
  }
  timing: {
    domLoading: number
    domInteractive: number
    domComplete: number
    loadEventEnd: number
  }
  memory?: {
    usedJSHeapSize: number
    totalJSHeapSize: number
    jsHeapSizeLimit: number
  }
}

export default function PerformanceTest() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [logs, setLogs] = useState<string[]>([])
  const [frameRate, setFrameRate] = useState<number | null>(null)

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 9)])
  }

  // パフォーマンス指標を収集
  const collectMetrics = (): PerformanceMetrics => {
    const timing = performance.timing
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    
    const metrics: PerformanceMetrics = {
      deviceInfo: {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
      },
      networkInfo: {},
      timing: {
        domLoading: navigation?.domLoading || timing.domLoading,
        domInteractive: navigation?.domInteractive || timing.domInteractive,
        domComplete: navigation?.domComplete || timing.domComplete,
        loadEventEnd: navigation?.loadEventEnd || timing.loadEventEnd,
      }
    }

    // デバイス情報
    if ('deviceMemory' in navigator) {
      metrics.deviceInfo.memory = (navigator as any).deviceMemory
    }
    if ('hardwareConcurrency' in navigator) {
      metrics.deviceInfo.cores = navigator.hardwareConcurrency
    }

    // ネットワーク情報
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      metrics.networkInfo = {
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt,
      }
    }

    // メモリ使用量
    if ('memory' in performance) {
      const memory = (performance as any).memory
      metrics.memory = {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit,
      }
    }

    return metrics
  }

  // FPS測定
  const measureFrameRate = (): Promise<number> => {
    return new Promise((resolve) => {
      let frames = 0
      const startTime = performance.now()
      const duration = 1000 // 1秒間測定

      const countFrame = () => {
        frames++
        const elapsed = performance.now() - startTime
        
        if (elapsed < duration) {
          requestAnimationFrame(countFrame)
        } else {
          const fps = Math.round((frames * 1000) / elapsed)
          resolve(fps)
        }
      }

      requestAnimationFrame(countFrame)
    })
  }

  // CPU負荷テスト
  const cpuStressTest = (): Promise<number> => {
    return new Promise((resolve) => {
      const startTime = performance.now()
      const duration = 1000 // 1秒間の計算
      let operations = 0

      const calculate = () => {
        const endTime = startTime + duration
        
        while (performance.now() < endTime) {
          // 簡単な数学計算でCPUに負荷をかける
          Math.sin(Math.random()) * Math.cos(Math.random())
          operations++
        }
        
        resolve(operations)
      }

      // 次のフレームで実行してUIをブロックしないようにする
      requestAnimationFrame(calculate)
    })
  }

  // メモリテスト
  const memoryTest = () => {
    const arrays: number[][] = []
    const startMemory = metrics?.memory?.usedJSHeapSize || 0
    
    // メモリを消費するために大きな配列を作成
    for (let i = 0; i < 100; i++) {
      arrays.push(new Array(10000).fill(Math.random()))
    }
    
    // ガベージコレクションを強制実行（可能であれば）
    if ('gc' in window) {
      (window as any).gc()
    }
    
    const endMemory = collectMetrics().memory?.usedJSHeapSize || 0
    const memoryIncrease = endMemory - startMemory
    
    addLog(`メモリテスト: ${formatBytes(memoryIncrease)}增加`)
    
    // メモリを解放
    arrays.length = 0
    
    return memoryIncrease
  }

  // 総合パフォーマンステスト
  const runPerformanceTest = async () => {
    setIsRunning(true)
    addLog('パフォーマンステストを開始します...')
    
    try {
      // 基本指標を収集
      const collectedMetrics = collectMetrics()
      setMetrics(collectedMetrics)
      addLog('デバイス情報を収集しました')
      
      // FPS測定
      addLog('FPS測定を開始...')
      const fps = await measureFrameRate()
      setFrameRate(fps)
      addLog(`FPS: ${fps}`)
      
      // CPUテスト
      addLog('CPUテストを開始...')
      const cpuOps = await cpuStressTest()
      addLog(`CPU性能: ${(cpuOps / 1000).toFixed(0)}K ops/sec`)
      
      // メモリテスト
      memoryTest()
      
      addLog('パフォーマンステスト完了')
    } catch (error) {
      addLog(`テストエラー: ${error instanceof Error ? error.message : '不明なエラー'}`)
    } finally {
      setIsRunning(false)
    }
  }

  // 初期設定
  useEffect(() => {
    const initialMetrics = collectMetrics()
    setMetrics(initialMetrics)
  }, [])

  const formatBytes = (bytes: number): string => {
    if (bytes < 1024) return `${bytes}B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
  }

  const getDevicePerformanceRating = (): { score: number, rating: string, color: string } => {
    if (!metrics) return { score: 0, rating: '不明', color: 'gray' }
    
    let score = 0
    
    // CPUコア数によるスコア
    if (metrics.deviceInfo.cores) {
      score += Math.min(metrics.deviceInfo.cores * 10, 40)
    }
    
    // メモリによるスコア
    if (metrics.deviceInfo.memory) {
      score += Math.min(metrics.deviceInfo.memory * 10, 30)
    }
    
    // FPSによるスコア
    if (frameRate) {
      score += Math.min(frameRate / 2, 30)
    }
    
    if (score >= 80) return { score, rating: '高性能', color: 'green' }
    if (score >= 60) return { score, rating: '中性能', color: 'yellow' }
    if (score >= 40) return { score, rating: '低性能', color: 'orange' }
    return { score, rating: '非常に低い', color: 'red' }
  }

  const performanceRating = getDevicePerformanceRating()

  return (
    <div className="space-y-6">
      {/* パフォーマンススコア */}
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">⚡ パフォーマンステスト</h2>
        
        <div className="text-center mb-4">
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-${performanceRating.color}-100 text-${performanceRating.color}-700`}>
            <span className="text-2xl font-bold">{performanceRating.score}</span>
            <span className="text-sm font-medium">{performanceRating.rating}</span>
          </div>
        </div>
        
        <button
          onClick={runPerformanceTest}
          disabled={isRunning}
          className="w-full py-3 px-4 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
        >
          {isRunning ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              テスト実行中...
            </div>
          ) : (
            'パフォーマンステスト実行'
          )}
        </button>
      </div>

      {/* デバイス情報 */}
      {metrics && (
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h3 className="text-md font-semibold mb-3">📱 デバイス情報</h3>
          
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              {metrics.deviceInfo.memory && (
                <div className="bg-blue-50 rounded p-3">
                  <div className="text-xs text-blue-600">メモリ</div>
                  <div className="font-bold text-blue-700">{metrics.deviceInfo.memory}GB</div>
                </div>
              )}
              {metrics.deviceInfo.cores && (
                <div className="bg-green-50 rounded p-3">
                  <div className="text-xs text-green-600">CPUコア</div>
                  <div className="font-bold text-green-700">{metrics.deviceInfo.cores}コア</div>
                </div>
              )}
            </div>
            
            {frameRate && (
              <div className="bg-purple-50 rounded p-3 text-center">
                <div className="text-xs text-purple-600">FPS</div>
                <div className="font-bold text-purple-700">{frameRate} fps</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ネットワーク情報 */}
      {metrics?.networkInfo.effectiveType && (
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h3 className="text-md font-semibold mb-3">🌐 ネットワーク</h3>
          
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-orange-50 rounded p-3">
              <div className="text-xs text-orange-600">接続タイプ</div>
              <div className="font-bold text-orange-700">{metrics.networkInfo.effectiveType}</div>
            </div>
            {metrics.networkInfo.downlink && (
              <div className="bg-cyan-50 rounded p-3">
                <div className="text-xs text-cyan-600">ダウンリンク</div>
                <div className="font-bold text-cyan-700">{metrics.networkInfo.downlink}Mbps</div>
              </div>
            )}
            {metrics.networkInfo.rtt && (
              <div className="bg-pink-50 rounded p-3">
                <div className="text-xs text-pink-600">RTT</div>
                <div className="font-bold text-pink-700">{metrics.networkInfo.rtt}ms</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* メモリ使用量 */}
      {metrics?.memory && (
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h3 className="text-md font-semibold mb-3">🧠 メモリ使用量</h3>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>使用中:</span>
              <span className="font-mono">{formatBytes(metrics.memory.usedJSHeapSize)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>割り当て:</span>
              <span className="font-mono">{formatBytes(metrics.memory.totalJSHeapSize)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>上限:</span>
              <span className="font-mono">{formatBytes(metrics.memory.jsHeapSizeLimit)}</span>
            </div>
            
            {/* メモリ使用率バー */}
            <div className="mt-3">
              <div className="bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${Math.min((metrics.memory.usedJSHeapSize / metrics.memory.jsHeapSizeLimit) * 100, 100)}%` 
                  }}
                />
              </div>
              <div className="text-xs text-gray-500 mt-1 text-center">
                {((metrics.memory.usedJSHeapSize / metrics.memory.jsHeapSizeLimit) * 100).toFixed(1)}% 使用中
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ログ */}
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <h3 className="text-md font-semibold mb-3">📄 ログ</h3>
        <div className="bg-gray-50 rounded border p-3 h-32 overflow-y-auto">
          {logs.length === 0 ? (
            <p className="text-gray-500 text-sm">ログはまだありません</p>
          ) : (
            <div className="space-y-1">
              {logs.map((log, index) => (
                <div key={index} className="text-xs font-mono text-gray-700">
                  {log}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}