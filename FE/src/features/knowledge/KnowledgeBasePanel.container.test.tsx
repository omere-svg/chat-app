import { afterEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { KnowledgeBasePanelContainer } from './KnowledgeBasePanel.container.tsx'
import { apiClient, ApiError } from '../../api/apiClient.ts'
import type { KnowledgeDocument } from '../../types/api.ts'

const readyDoc: KnowledgeDocument = {
  id: 'kdoc-1',
  filename: 'notes.md',
  status: 'ready',
  chunkCount: 3,
  byteSize: 2048,
  createdAt: '2026-01-01T00:00:00.000Z',
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('KnowledgeBasePanelContainer', () => {
  it('loads and lists the user documents', async () => {
    vi.spyOn(apiClient, 'listKnowledgeDocuments').mockResolvedValue({ documents: [readyDoc] })

    render(<KnowledgeBasePanelContainer />)

    expect(await screen.findByText('notes.md')).toBeInTheDocument()
    expect(screen.getByText(/3 chunks/)).toBeInTheDocument()
  })

  it('rejects an oversize file client-side without calling the API', async () => {
    const user = userEvent.setup()
    vi.spyOn(apiClient, 'listKnowledgeDocuments').mockResolvedValue({ documents: [] })
    const upload = vi.spyOn(apiClient, 'uploadKnowledgeDocument')

    render(<KnowledgeBasePanelContainer />)
    await screen.findByText(/no documents yet/i)

    const tooBig = new File([new Uint8Array(1_000_001)], 'big.txt', { type: 'text/plain' })
    await user.upload(screen.getByLabelText('Upload document'), tooBig)

    expect(await screen.findByRole('alert')).toHaveTextContent(/too large/i)
    expect(upload).not.toHaveBeenCalled()
  })

  it('rejects an unsupported extension client-side without calling the API', async () => {
    vi.spyOn(apiClient, 'listKnowledgeDocuments').mockResolvedValue({ documents: [] })
    const upload = vi.spyOn(apiClient, 'uploadKnowledgeDocument')

    render(<KnowledgeBasePanelContainer />)
    await screen.findByText(/no documents yet/i)

    // fireEvent bypasses the input's `accept` filter so we can drive the container's
    // own extension validation directly.
    const wrongType = new File(['data'], 'image.png', { type: 'image/png' })
    fireEvent.change(screen.getByLabelText('Upload document'), {
      target: { files: [wrongType] },
    })

    expect(await screen.findByRole('alert')).toHaveTextContent(/supported/i)
    expect(upload).not.toHaveBeenCalled()
  })

  it('uploads a valid file and shows it in the list', async () => {
    const user = userEvent.setup()
    vi.spyOn(apiClient, 'listKnowledgeDocuments').mockResolvedValue({ documents: [] })
    vi.spyOn(apiClient, 'uploadKnowledgeDocument').mockResolvedValue({ document: readyDoc })

    render(<KnowledgeBasePanelContainer />)
    await screen.findByText(/no documents yet/i)

    const file = new File(['hello world'], 'notes.md', { type: 'text/markdown' })
    await user.upload(screen.getByLabelText('Upload document'), file)

    expect(await screen.findByText('notes.md')).toBeInTheDocument()
  })

  it('deletes a document on confirm', async () => {
    const user = userEvent.setup()
    vi.spyOn(apiClient, 'listKnowledgeDocuments').mockResolvedValue({ documents: [readyDoc] })
    vi.spyOn(apiClient, 'deleteKnowledgeDocument').mockResolvedValue(undefined)

    render(<KnowledgeBasePanelContainer />)
    await screen.findByText('notes.md')

    await user.click(screen.getByRole('button', { name: /delete notes.md/i }))

    await waitFor(() => {
      expect(screen.queryByText('notes.md')).not.toBeInTheDocument()
    })
  })

  it('keeps the document and surfaces an error when delete fails', async () => {
    const user = userEvent.setup()
    vi.spyOn(apiClient, 'listKnowledgeDocuments').mockResolvedValue({ documents: [readyDoc] })
    vi.spyOn(apiClient, 'deleteKnowledgeDocument').mockRejectedValue(
      new ApiError(500, { code: 'INTERNAL_ERROR', message: 'server fell over' }),
    )

    render(<KnowledgeBasePanelContainer />)
    await screen.findByText('notes.md')

    await user.click(screen.getByRole('button', { name: /delete notes.md/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent('server fell over')
    // The document is preserved on a failed delete.
    expect(screen.getByText('notes.md')).toBeInTheDocument()
  })
})
