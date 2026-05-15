import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../client.js'
import { sampleCreators } from '../sampleCreators.js'

function ViewCreator() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [creator, setCreator] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleting, setDeleting] = useState(false)

  const isSample = String(id).startsWith('sample-')
  const creatorId = Number(id)

  useEffect(() => {
    const fetchCreator = async () => {
      try {
        setLoading(true)

        if (isSample) {
          const sampleCreator = sampleCreators.find((item) => item.id === id)
          setCreator(sampleCreator || null)
          return
        }

        if (Number.isNaN(creatorId)) {
          setCreator(null)
          return
        }

        const { data, error: fetchError } = await supabase
          .from('creators')
          .select('*')
          .eq('id', creatorId)
          .single()

        if (fetchError) {
          throw fetchError
        }

        setCreator(data)
      } catch (err) {
        console.error('Error fetching creator:', err)
        setError(
          `${err.message || 'Unable to load this creator.'} Check that the creators table exists, RLS allows select, and your .env values are correct.`,
        )
      } finally {
        setLoading(false)
      }
    }

    fetchCreator()
  }, [creatorId, id, isSample])

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Delete ${creator.name} from Creatorverse? This cannot be undone.`,
    )

    if (!confirmed) {
      return
    }

    if (isSample) {
      setError('Sample creators are for display only. Add real creators to Supabase to edit or delete.')
      return
    }

    if (Number.isNaN(creatorId)) {
      setError('Invalid creator id.')
      return
    }

    try {
      setDeleting(true)
      const { error: deleteError } = await supabase
        .from('creators')
        .delete()
        .eq('id', creatorId)

      if (deleteError) {
        throw deleteError
      }

      navigate('/')
    } catch (err) {
      console.error('Error deleting creator:', err)
      setError(
        `${err.message || 'Unable to delete creator.'} Check that RLS allows delete and the creators table id matches this creator.`,
      )
      setDeleting(false)
    }
  }

  if (loading) {
    return <div className="loading-card">Loading creator...</div>
  }

  if (!creator) {
    return (
      <section className="empty-state">
        <h1>Creator not found</h1>
        <p>This creator may have been deleted or the link may be incorrect.</p>
        <Link className="button" to="/">
          Back to Home
        </Link>
      </section>
    )
  }

  return (
    <section className="detail-layout">
      <div className="detail-image-wrap">
        {creator.imageURL ? (
          <img
            className="detail-image"
            src={creator.imageURL}
            alt={`${creator.name} creator profile`}
          />
        ) : (
          <div className="detail-placeholder" aria-hidden="true">
            {creator.name.slice(0, 2).toUpperCase()}
          </div>
        )}
      </div>

      <div className="detail-card">
        <p className="eyebrow">{isSample ? 'Sample Creator' : 'Creator Profile'}</p>
        <h1>{creator.name}</h1>
        <p>{creator.description}</p>

        <a
          className="creator-url detail-url"
          href={creator.url}
          target="_blank"
          rel="noreferrer"
        >
          {creator.url}
        </a>

        {error && <div className="notice notice-error">{error}</div>}

        <div className="detail-actions">
          {!isSample && (
            <>
              <Link className="button" to={`/edit/${creator.id}`}>
                Edit
              </Link>
              <button
                className="button button-danger"
                type="button"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </>
          )}
          <Link className="button button-secondary" to="/">
            Back to Home
          </Link>
          <a
            className="button button-ghost"
            href={creator.url}
            target="_blank"
            rel="noreferrer"
          >
            Visit Channel
          </a>
        </div>
      </div>
    </section>
  )
}

export default ViewCreator
