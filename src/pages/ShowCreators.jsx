import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import CreatorCard from '../components/CreatorCard.jsx'
import { supabase } from '../client.js'
import { sampleCreators } from '../sampleCreators.js'

function ShowCreators() {
  const [creators, setCreators] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchCreators = async () => {
      try {
        setLoading(true)
        setError('')
        const { data, error: fetchError } = await supabase
          .from('creators')
          .select('*')
          .order('created_at', { ascending: false })

        if (fetchError) {
          throw fetchError
        }

        setCreators(data || [])
      } catch (err) {
        console.error('Error fetching creators:', err)
        setCreators([])
        setError(
          `${err.message || 'Unable to load creators.'} Check that the table is named creators, columns are name, url, description, and imageURL, RLS allows select/insert/update/delete, and your .env has VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.`,
        )
      } finally {
        setLoading(false)
      }
    }

    fetchCreators()
  }, [])

  const showingSamples = !loading && creators.length === 0
  const displayedCreators = showingSamples ? sampleCreators : creators

  const handleDeleteCreator = async (creator, isSample) => {
    if (isSample) {
      setError('Sample creators are for display only. Add real creators to Supabase to edit or delete.')
      return
    }

    const confirmed = window.confirm('Are you sure you want to delete this creator?')

    if (!confirmed) {
      return
    }

    setError('')

    try {
      const { error: deleteError } = await supabase
        .from('creators')
        .delete()
        .eq('id', creator.id)

      if (deleteError) {
        throw deleteError
      }

      setCreators((currentCreators) =>
        currentCreators.filter((item) => item.id !== creator.id),
      )
    } catch (err) {
      console.error('Error deleting creator:', err)
      setError(
        `${err.message || 'Unable to delete creator.'} Check that RLS allows delete and the creators table id matches this creator.`,
      )
    }
  }

  return (
    <section className="hero-section">
      <div className="hero-copy">
        <p className="eyebrow">CodePath WEB103 Prework</p>
        <h1>Creatorverse</h1>
        <p>
          A simple React + Supabase CRUD app built for the CodePath WEB103
          Prework submission.
        </p>
        <div className="hero-actions">
          <Link className="button" to="/new">
            Add Creator
          </Link>
          <a className="button button-secondary" href="#creator-grid">
            Browse Creators
          </a>
        </div>
      </div>

      {error && <div className="notice notice-error">{error}</div>}

      {showingSamples && displayedCreators.length > 0 && (
        <div className="notice">
          Showing sample creators.
        </div>
      )}

      {loading ? (
        <div className="loading-card">Loading creators...</div>
      ) : displayedCreators.length === 0 ? (
        <section className="empty-state">
          <h2>No creators to show</h2>
          <p>Add a creator to rebuild your Creatorverse.</p>
          <Link className="button" to="/new">
            Add Creator
          </Link>
        </section>
      ) : (
        <div id="creator-grid" className="creator-grid">
          {displayedCreators.map((creator) => (
            <CreatorCard
              key={creator.id}
              creator={creator}
              isSample={String(creator.id).startsWith('sample-')}
              onDelete={handleDeleteCreator}
            />
          ))}
        </div>
      )}
    </section>
  )
}

export default ShowCreators
