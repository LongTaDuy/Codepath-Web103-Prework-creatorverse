import { Link } from 'react-router-dom'
import { useState } from 'react'

function CreatorCard({ creator, isSample = false, onDelete }) {
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (!onDelete) {
      return
    }

    setDeleting(true)
    try {
      await onDelete(creator, isSample)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <article className="creator-card">
      {creator.imageURL ? (
        <img
          className="creator-card-image"
          src={creator.imageURL}
          alt={`${creator.name} creator preview`}
        />
      ) : (
        <div className="creator-card-placeholder" aria-hidden="true">
          {creator.name.slice(0, 2).toUpperCase()}
        </div>
      )}

      <div className="creator-card-body">
        <div>
          <p className="eyebrow">{isSample ? 'Sample creator' : 'Featured creator'}</p>
          <h2>{creator.name}</h2>
          <p>{creator.description}</p>
        </div>

        <a
          href={creator.url}
          target="_blank"
          rel="noreferrer"
          className="creator-url"
        >
          {creator.url}
        </a>

        <div className="card-actions">
          <Link className="button button-secondary" to={`/creator/${creator.id}`}>
            View
          </Link>
          {!isSample && (
            <>
              <Link className="button button-ghost" to={`/edit/${creator.id}`}>
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
          <a
            href={creator.url}
            target="_blank"
            rel="noreferrer"
            className="button button-secondary"
          >
            Visit Channel
          </a>
        </div>
      </div>
    </article>
  )
}

export default CreatorCard
