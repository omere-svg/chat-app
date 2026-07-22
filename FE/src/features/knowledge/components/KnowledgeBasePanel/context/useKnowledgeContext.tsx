import { createContext, useContext } from 'react'
import { useKnowledgePanel } from '@/features/knowledge/hooks/useKnowledgePanel.ts'
import type { UseKnowledgePanelValue } from '@/features/knowledge/types/knowledge.ts'
import type { KnowledgeProviderProps } from '../KnowledgeBasePanel.types.ts'

const KnowledgeContext = createContext<UseKnowledgePanelValue | null>(null)

export function KnowledgeProvider({
  children,
}: KnowledgeProviderProps): React.ReactElement {
  const value = useKnowledgePanel()

  return <KnowledgeContext.Provider value={value}>{children}</KnowledgeContext.Provider>
}

export function useKnowledgeContext(): UseKnowledgePanelValue {
  const context = useContext(KnowledgeContext)
  if (context === null) {
    throw new Error('useKnowledgeContext must be used within a KnowledgeProvider')
  }
  return context
}
