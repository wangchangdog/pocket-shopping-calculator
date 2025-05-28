import { useState } from 'react'
import CameraTest from './components/CameraTest'
import OCRTest from './components/OCRTest'
import StorageTest from './components/StorageTest'
import PerformanceTest from './components/PerformanceTest'

type TestTab = 'camera' | 'ocr' | 'storage' | 'performance'

function App() {
  const [activeTab, setActiveTab] = useState<TestTab>('camera')

  const tabs = [
    { id: 'camera' as const, label: 'カメラテスト', icon: '📸' },
    { id: 'ocr' as const, label: 'OCRテスト', icon: '🔍' },
    { id: 'storage' as const, label: 'ストレージテスト', icon: '💾' },
    { id: 'performance' as const, label: 'パフォーマンス', icon: '⚡' },
  ]

  const renderContent = () => {
    switch (activeTab) {
      case 'camera':
        return <CameraTest />
      case 'ocr':
        return <OCRTest />
      case 'storage':
        return <StorageTest />
      case 'performance':
        return <PerformanceTest />
      default:
        return <CameraTest />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-md mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-center text-gray-900">
            📱 ポケット会計 - 技術検証
          </h1>
          <p className="text-sm text-gray-600 text-center mt-1">
            OCR・カメラ・ストレージ機能の動作検証
          </p>
        </div>
      </header>

      {/* Tab Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-md mx-auto px-4">
          <div className="flex space-x-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-3 px-2 text-sm font-medium text-center transition-colors ${
                  activeTab === tab.id
                    ? 'text-primary-600 border-b-2 border-primary-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="flex flex-col items-center gap-1">
                  <span className="text-lg">{tab.icon}</span>
                  <span className="text-xs">{tab.label}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-md mx-auto px-4 py-6">
        {renderContent()}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-8">
        <div className="max-w-md mx-auto px-4 py-4 text-center">
          <p className="text-xs text-gray-500">
            技術検証用プロトタイプ - GitHub Pagesでデプロイ済み
          </p>
        </div>
      </footer>
    </div>
  )
}

export default App