import { useState, useEffect } from 'react'

interface StorageStats {
  localStorage: {
    used: number
    available: number
    quota: number
  }
  indexedDB: {
    supported: boolean
    quota?: number
    used?: number
  }
}

interface TestData {
  id: string
  sessionId: string
  items: {
    id: string
    name: string
    price: number
    quantity: number
  }[]
  totalAmount: number
  createdAt: string
}

export default function StorageTest() {
  const [stats, setStats] = useState<StorageStats | null>(null)
  const [testData, setTestData] = useState<TestData[]>([])
  const [logs, setLogs] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 9)])
  }

  // ストレージ統計情報を取得
  const getStorageStats = async (): Promise<StorageStats> => {
    const stats: StorageStats = {
      localStorage: {
        used: 0,
        available: 0,
        quota: 0
      },
      indexedDB: {
        supported: false
      }
    }

    // localStorageの統計
    try {
      let localStorageUsed = 0
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key) {
          const value = localStorage.getItem(key) || ''
          localStorageUsed += key.length + value.length
        }
      }
      
      stats.localStorage.used = localStorageUsed
      // 一般的にlocalStorageの容量上限は5-10MB
      const estimatedQuota = 5 * 1024 * 1024 // 5MB
      stats.localStorage.quota = estimatedQuota
      stats.localStorage.available = estimatedQuota - localStorageUsed
    } catch (error) {
      addLog('localStorage統計取得エラー')
    }

    // IndexedDBのサポート確認
    if ('indexedDB' in window) {
      stats.indexedDB.supported = true
      
      // Storage APIがサポートされている場合は統計情報を取得
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        try {
          const estimate = await navigator.storage.estimate()
          stats.indexedDB.quota = estimate.quota
          stats.indexedDB.used = estimate.usage
        } catch (error) {
          addLog('IndexedDB統計取得エラー')
        }
      }
    }

    return stats
  }

  // テストデータを生成
  const generateTestData = (): TestData => {
    const items = [
      { id: '1', name: 'リンゴ', price: 150, quantity: 3 },
      { id: '2', name: 'バナナ', price: 200, quantity: 1 },
      { id: '3', name: '牙ブラシ', price: 380, quantity: 2 },
      { id: '4', name: 'シャンプー', price: 580, quantity: 1 },
    ]
    
    const randomItems = items.sort(() => Math.random() - 0.5).slice(0, Math.floor(Math.random() * 3) + 2)
    const totalAmount = randomItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    
    return {
      id: `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      sessionId: `session-${Date.now()}`,
      items: randomItems,
      totalAmount,
      createdAt: new Date().toISOString()
    }
  }

  // localStorageテスト
  const testLocalStorage = () => {
    try {
      const data = generateTestData()
      const key = `shopping-session-${data.id}`
      
      // データを保存
      localStorage.setItem(key, JSON.stringify(data))
      
      // 保存したデータを読み込み
      const saved = localStorage.getItem(key)
      if (saved) {
        const parsedData = JSON.parse(saved) as TestData
        setTestData(prev => [parsedData, ...prev.slice(0, 4)]) // 最新5件まで保持
        addLog(`localStorage保存成功: ${key} (${saved.length}文字)`)
      }
    } catch (error) {
      addLog(`localStorageエラー: ${error instanceof Error ? error.message : '不明なエラー'}`)
    }
  }

  // データをクリア
  const clearTestData = () => {
    try {
      // localStorageからテストデータを削除
      const keysToDelete: string[] = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith('shopping-session-')) {
          keysToDelete.push(key)
        }
      }
      
      keysToDelete.forEach(key => localStorage.removeItem(key))
      
      setTestData([])
      addLog(`localStorageクリア完了: ${keysToDelete.length}件削除`)
    } catch (error) {
      addLog(`クリアエラー: ${error instanceof Error ? error.message : '不明なエラー'}`)
    }
  }

  // パフォーマンステスト
  const performanceTest = async () => {
    setIsLoading(true)
    addLog('パフォーマンステストを開始します...')
    
    try {
      const testCount = 100
      const startTime = performance.now()
      
      // 大量のデータを連続保存
      for (let i = 0; i < testCount; i++) {
        const data = generateTestData()
        const key = `perf-test-${i}`
        localStorage.setItem(key, JSON.stringify(data))
      }
      
      const saveTime = performance.now()
      
      // 大量のデータを連続読み込み
      for (let i = 0; i < testCount; i++) {
        const key = `perf-test-${i}`
        const data = localStorage.getItem(key)
        if (data) {
          JSON.parse(data)
        }
      }
      
      const loadTime = performance.now()
      
      // テストデータをクリーンアップ
      for (let i = 0; i < testCount; i++) {
        localStorage.removeItem(`perf-test-${i}`)
      }
      
      const cleanupTime = performance.now()
      
      addLog(`パフォーマンス結果 (${testCount}件):`)
      addLog(`- 保存: ${Math.round(saveTime - startTime)}ms`)
      addLog(`- 読み込み: ${Math.round(loadTime - saveTime)}ms`)
      addLog(`- 削除: ${Math.round(cleanupTime - loadTime)}ms`)
      
    } catch (error) {
      addLog(`パフォーマンステストエラー: ${error instanceof Error ? error.message : '不明なエラー'}`)
    } finally {
      setIsLoading(false)
    }
  }

  // 統計情報を更新
  const refreshStats = async () => {
    try {
      const newStats = await getStorageStats()
      setStats(newStats)
      addLog('ストレージ統計を更新しました')
    } catch (error) {
      addLog('統計更新エラー')
    }
  }

  // 初期読み込み
  useEffect(() => {
    refreshStats()
  }, [])

  const formatBytes = (bytes: number): string => {
    if (bytes < 1024) return `${bytes}B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
  }

  return (
    <div className="space-y-6">
      {/* ストレージ統計 */}
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">💾 ストレージテスト</h2>
          <button
            onClick={refreshStats}
            className="px-3 py-1 bg-gray-500 hover:bg-gray-600 text-white text-sm rounded font-medium transition-colors"
          >
            更新
          </button>
        </div>
        
        {stats ? (
          <div className="space-y-4">
            {/* localStorage統計 */}
            <div className="border rounded-lg p-3">
              <h3 className="font-medium text-sm text-gray-700 mb-2">localStorage</h3>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-blue-50 rounded p-2">
                  <div className="text-xs text-blue-600">使用量</div>
                  <div className="font-bold text-blue-700">{formatBytes(stats.localStorage.used)}</div>
                </div>
                <div className="bg-green-50 rounded p-2">
                  <div className="text-xs text-green-600">利用可能</div>
                  <div className="font-bold text-green-700">{formatBytes(stats.localStorage.available)}</div>
                </div>
                <div className="bg-gray-50 rounded p-2">
                  <div className="text-xs text-gray-600">予想上限</div>
                  <div className="font-bold text-gray-700">{formatBytes(stats.localStorage.quota)}</div>
                </div>
              </div>
            </div>

            {/* IndexedDB統計 */}
            <div className="border rounded-lg p-3">
              <h3 className="font-medium text-sm text-gray-700 mb-2">IndexedDB</h3>
              {stats.indexedDB.supported ? (
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="bg-purple-50 rounded p-2">
                    <div className="text-xs text-purple-600">サポート</div>
                    <div className="font-bold text-purple-700">✓ 対応</div>
                  </div>
                  {stats.indexedDB.quota && (
                    <div className="bg-orange-50 rounded p-2">
                      <div className="text-xs text-orange-600">上限</div>
                      <div className="font-bold text-orange-700">{formatBytes(stats.indexedDB.quota)}</div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center text-red-600">非対応</div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-500">読み込み中...</div>
        )}
      </div>

      {/* テストコントロール */}
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <h3 className="text-md font-semibold mb-3">🧪 テスト実行</h3>
        
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={testLocalStorage}
            className="py-3 px-4 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium transition-colors"
          >
            データ保存
          </button>
          
          <button
            onClick={clearTestData}
            className="py-3 px-4 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
          >
            データクリア
          </button>
        </div>
        
        <button
          onClick={performanceTest}
          disabled={isLoading}
          className="w-full mt-3 py-3 px-4 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              パフォーマンステスト中...
            </div>
          ) : (
            'パフォーマンステスト
          )}
        </button>
      </div>

      {/* 保存されたデータ */}
      {testData.length > 0 && (
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h3 className="text-md font-semibold mb-3">🗃️ 保存データ</h3>
          
          <div className="space-y-2">
            {testData.map((data) => (
              <div key={data.id} className="border rounded p-3">
                <div className="flex justify-between items-start mb-2">
                  <div className="text-sm font-medium text-gray-700">
                    セッション: {data.sessionId}
                  </div>
                  <div className="text-lg font-bold text-primary-600">
                    ¥{data.totalAmount.toLocaleString()}
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  {data.items.length}点 - {new Date(data.createdAt).toLocaleString()}
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {data.items.map((item) => (
                    <span key={item.id} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                      {item.name} ×{item.quantity}
                    </span>
                  ))}
                </div>
              </div>
            ))}
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