'use client'

import { useState, useTransition } from 'react'
import { addLibraryItemAction, deleteLibraryItemAction, autofillLibraryItemAction, type LibraryItemPayload } from '../libraryActions'

const ITEM_TYPES = ['book', 'podcast', 'course'] as const
type ItemType = typeof ITEM_TYPES[number]

const GAP_TAGS = [
  'Strategic Thinking', 'Leadership', 'Communication', 'Data Analysis',
  'Financial Acumen', 'Customer Obsession', 'Innovation', 'Execution',
  'Stakeholder Management', 'Coaching', 'Technical Skills', 'Sales',
  'Marketing', 'Operations', 'Product Management', 'Culture Building',
]

interface LibraryItem {
  id: string
  type: ItemType
  title: string
  author?: string | null
  url?: string | null
  description?: string | null
  platform?: string | null
  gap_tags: string[]
}

const TYPE_ICONS: Record<ItemType, string> = {
  book: '📚',
  podcast: '🎙',
  course: '🎓',
}

const TYPE_COLORS: Record<ItemType, string> = {
  book: 'bg-amber-50 text-amber-700 border-amber-200',
  podcast: 'bg-violet-50 text-violet-700 border-violet-200',
  course: 'bg-emerald-50 text-emerald-700 border-emerald-200',
}

export default function LibraryManager({ initialItems }: { initialItems: LibraryItem[] }) {
  const [items, setItems] = useState<LibraryItem[]>(initialItems)
  const [activeTab, setActiveTab] = useState<ItemType>('book')
  const [showForm, setShowForm] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [isLoadingMeta, setIsLoadingMeta] = useState(false)

  // Form state
  const [urlInput, setUrlInput]           = useState('')
  const [formTitle, setFormTitle]         = useState('')
  const [formAuthor, setFormAuthor]       = useState('')
  const [formDesc, setFormDesc]           = useState('')
  const [formPlatform, setFormPlatform]   = useState('')
  const [formTags, setFormTags]           = useState<string[]>([])
  const [formError, setFormError]         = useState('')

  const filtered = items.filter(i => i.type === activeTab)

  function resetForm() {
    setUrlInput(''); setFormTitle(''); setFormAuthor(''); setFormDesc('')
    setFormPlatform(''); setFormTags([]); setFormError('')
  }

  async function handleAutofill() {
    if (!urlInput.trim()) return
    setIsLoadingMeta(true)
    try {
      const meta = await autofillLibraryItemAction(urlInput.trim())
      if (meta.title) setFormTitle(meta.title)
      if (meta.author) setFormAuthor(meta.author)
      if (meta.description) setFormDesc(meta.description)
      if (meta.platform) setFormPlatform(meta.platform)
    } catch {
      // silently ignore, user can fill in manually
    } finally {
      setIsLoadingMeta(false)
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!formTitle.trim()) { setFormError('Title is required'); return }
    setFormError('')
    startTransition(async () => {
      try {
        await addLibraryItemAction({
          type: activeTab,
          title: formTitle.trim(),
          author: formAuthor.trim() || undefined,
          url: urlInput.trim() || undefined,
          description: formDesc.trim() || undefined,
          platform: formPlatform.trim() || undefined,
          gap_tags: formTags,
        })
        // Optimistic update
        const fakeItem: LibraryItem = {
          id: Date.now().toString(),
          type: activeTab,
          title: formTitle.trim(),
          author: formAuthor.trim() || null,
          url: urlInput.trim() || null,
          description: formDesc.trim() || null,
          platform: formPlatform.trim() || null,
          gap_tags: formTags,
        }
        setItems(prev => [fakeItem, ...prev])
        resetForm()
        setShowForm(false)
      } catch (err) {
        setFormError(err instanceof Error ? err.message : 'Failed to save')
      }
    })
  }

  function handleDelete(id: string) {
    if (!confirm('Remove this item from the library?')) return
    startTransition(async () => {
      await deleteLibraryItemAction(id)
      setItems(prev => prev.filter(i => i.id !== id))
    })
  }

  function toggleTag(tag: string) {
    setFormTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])
  }

  const inputCls = 'w-full bg-white border border-ink/10 rounded-xl px-4 py-3 text-sm font-body text-ink placeholder-ink-faint focus:outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/10 transition-colors'

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-1 bg-mckinsey-light p-1 rounded-xl w-fit">
        {ITEM_TYPES.map(t => (
          <button
            key={t}
            onClick={() => { setActiveTab(t); setShowForm(false) }}
            className={`px-5 py-2 rounded-lg font-body text-sm font-500 transition-colors capitalize ${
              activeTab === t ? 'bg-white text-ink shadow-sm' : 'text-ink-faint hover:text-ink'
            }`}
          >
            {TYPE_ICONS[t]} {t}s <span className="ml-1 text-xs opacity-60">({items.filter(i => i.type === t).length})</span>
          </button>
        ))}
      </div>

      {/* Add button */}
      {!showForm && (
        <button
          onClick={() => { setShowForm(true); resetForm() }}
          className="flex items-center gap-2 px-4 py-2.5 btn-brand text-white text-sm font-body font-500 rounded-xl transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add {activeTab}
        </button>
      )}

      {/* Add form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 space-y-4 shadow-sm">
          <h3 className="font-display text-lg font-500 text-ink capitalize">Add {activeTab}</h3>

          {/* URL + autofill */}
          <div>
            <label className="block font-body text-xs font-500 text-ink-mid uppercase tracking-wider mb-1.5">
              URL (paste to auto-fill details)
            </label>
            <div className="flex gap-2">
              <input
                value={urlInput}
                onChange={e => setUrlInput(e.target.value)}
                placeholder={
                  activeTab === 'book' ? 'https://amazon.com/…'
                    : activeTab === 'podcast' ? 'https://open.spotify.com/…'
                    : 'https://coursera.org/…'
                }
                className={inputCls + ' flex-1'}
              />
              <button
                type="button"
                onClick={handleAutofill}
                disabled={!urlInput.trim() || isLoadingMeta}
                className="px-4 py-3 bg-mckinsey-blue/10 hover:bg-mckinsey-blue/20 disabled:opacity-40 text-mckinsey-blue text-sm font-body font-500 rounded-xl transition-colors whitespace-nowrap"
              >
                {isLoadingMeta ? 'Fetching…' : 'Auto-fill'}
              </button>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block font-body text-xs font-500 text-ink-mid uppercase tracking-wider mb-1.5">Title *</label>
              <input value={formTitle} onChange={e => setFormTitle(e.target.value)} required placeholder="Title" className={inputCls} />
            </div>
            <div>
              <label className="block font-body text-xs font-500 text-ink-mid uppercase tracking-wider mb-1.5">
                {activeTab === 'book' ? 'Author' : activeTab === 'podcast' ? 'Host' : 'Instructor'}
              </label>
              <input value={formAuthor} onChange={e => setFormAuthor(e.target.value)} placeholder="Author / Host" className={inputCls} />
            </div>
            <div>
              <label className="block font-body text-xs font-500 text-ink-mid uppercase tracking-wider mb-1.5">Platform</label>
              <input value={formPlatform} onChange={e => setFormPlatform(e.target.value)} placeholder="e.g. Spotify, Coursera, Amazon" className={inputCls} />
            </div>
            <div className="sm:col-span-2">
              <label className="block font-body text-xs font-500 text-ink-mid uppercase tracking-wider mb-1.5">Description</label>
              <textarea value={formDesc} onChange={e => setFormDesc(e.target.value)} rows={3} placeholder="What will the user learn or gain?" className={`${inputCls} resize-none`} />
            </div>
          </div>

          {/* Gap tags */}
          <div>
            <label className="block font-body text-xs font-500 text-ink-mid uppercase tracking-wider mb-2">
              Relevant gap areas (select all that apply)
            </label>
            <div className="flex flex-wrap gap-2">
              {GAP_TAGS.map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1 rounded-full text-xs font-body font-500 border transition-colors ${
                    formTags.includes(tag)
                      ? 'bg-mckinsey-blue text-white border-mckinsey-blue'
                      : 'bg-white text-ink-mid border-ink/15 hover:border-mckinsey-blue/50 hover:text-mckinsey-blue'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {formError && (
            <p className="text-sm font-body text-red-600 bg-red-50 rounded-xl px-4 py-3">{formError}</p>
          )}

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={isPending} className="px-5 py-2.5 btn-brand disabled:opacity-50 text-white text-sm font-body font-500 rounded-xl transition-colors">
              {isPending ? 'Saving…' : `Add ${activeTab}`}
            </button>
            <button type="button" onClick={() => { setShowForm(false); resetForm() }} className="px-5 py-2.5 text-ink-mid hover:text-ink text-sm font-body transition-colors">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Items list */}
      {filtered.length === 0 && !showForm && (
        <div className="text-center py-16 bg-mckinsey-light rounded-2xl">
          <p className="text-3xl mb-3">{TYPE_ICONS[activeTab]}</p>
          <p className="font-body text-sm text-ink-mid">No {activeTab}s yet in the library.</p>
          <p className="font-body text-xs text-ink-faint mt-1">Add the first one using the button above.</p>
        </div>
      )}

      <div className="space-y-3">
        {filtered.map(item => (
          <div key={item.id} className="bg-white rounded-2xl p-5 flex gap-4 items-start shadow-sm group">
            <div className={`shrink-0 px-2.5 py-1 rounded-lg text-xs font-body font-500 border capitalize ${TYPE_COLORS[item.type]}`}>
              {TYPE_ICONS[item.type]} {item.type}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-body text-sm font-600 text-ink">
                    {item.url ? (
                      <a href={item.url} target="_blank" rel="noopener noreferrer" className="hover:text-mckinsey-blue transition-colors">
                        {item.title}
                      </a>
                    ) : item.title}
                  </p>
                  {item.author && (
                    <p className="font-body text-xs text-ink-mid mt-0.5">{item.author} {item.platform && `· ${item.platform}`}</p>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-ink-faint hover:text-red-500 p-1"
                  title="Remove from library"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
              {item.description && (
                <p className="font-body text-xs text-ink-faint mt-1.5 line-clamp-2">{item.description}</p>
              )}
              {item.gap_tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {item.gap_tags.map(tag => (
                    <span key={tag} className="px-2 py-0.5 bg-mckinsey-blue/10 text-mckinsey-blue text-[10px] font-body font-500 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
