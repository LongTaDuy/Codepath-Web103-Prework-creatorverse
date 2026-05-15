import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../client.js'

const emptyForm = {
  name: '',
  url: '',
  description: '',
  imageURL: '',
}

function isValidUrl(value) {
  try {
    new URL(value)
    return true
  } catch {
    return false
  }
}

function EditCreator() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isSample = String(id).startsWith('sample-')
  const creatorId = Number(id)
  const [formData, setFormData] = useState(emptyForm)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [errors, setErrors] = useState({})
  const [pageError, setPageError] = useState('')

  useEffect(() => {
    const fetchCreator = async () => {
      if (isSample) {
        setPageError('Sample creators are for display only. Add real creators to Supabase to edit or delete.')
        setLoading(false)
        return
      }

      if (Number.isNaN(creatorId)) {
        setPageError('Invalid creator id.')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('creators')
          .select('*')
          .eq('id', creatorId)
          .single()

        if (error) {
          throw error
        }

        setFormData({
          name: data.name || '',
          url: data.url || '',
          description: data.description || '',
          imageURL: data.imageURL || '',
        })
      } catch (err) {
        console.error('Error fetching creator for editing:', err)
        setPageError(
          `${err.message || 'Unable to load creator for editing.'} Check that the table is named creators, columns are name, url, description, and imageURL, RLS allows select, and your .env has VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.`,
        )
      } finally {
        setLoading(false)
      }
    }

    fetchCreator()
  }, [creatorId, id, isSample])

  const validateForm = () => {
    const nextErrors = {}

    if (!formData.name.trim()) {
      nextErrors.name = 'Name is required.'
    }

    if (!formData.url.trim()) {
      nextErrors.url = 'Creator URL is required.'
    } else if (!isValidUrl(formData.url)) {
      nextErrors.url = 'Enter a valid URL including https://.'
    }

    if (!formData.description.trim()) {
      nextErrors.description = 'Description is required.'
    }

    if (formData.imageURL.trim() && !isValidUrl(formData.imageURL)) {
      nextErrors.imageURL = 'Enter a valid image URL including https://.'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setPageError('')

    if (!validateForm()) {
      return
    }

    if (isSample) {
      setPageError('Sample creators are for display only. Add real creators to Supabase to edit or delete.')
      return
    }

    if (Number.isNaN(creatorId)) {
      setPageError('Invalid creator id.')
      return
    }

    try {
      setSubmitting(true)
      const { data, error } = await supabase
        .from('creators')
        .update({
          name: formData.name.trim(),
          url: formData.url.trim(),
          description: formData.description.trim(),
          imageURL: formData.imageURL.trim() || null,
        })
        .eq('id', creatorId)
        .select()
        .single()

      if (error) {
        throw error
      }

      navigate(`/creator/${data.id}`)
    } catch (err) {
      console.error('Error updating creator:', err)
      setPageError(
        `${err.message || 'Unable to update creator.'} Check that RLS allows update and the creators table columns match exactly.`,
      )
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    const confirmed = window.confirm('Delete this creator from Creatorverse?')

    if (!confirmed) {
      return
    }

    if (isSample) {
      setPageError('Sample creators are for display only. Add real creators to Supabase to edit or delete.')
      return
    }

    if (Number.isNaN(creatorId)) {
      setPageError('Invalid creator id.')
      return
    }

    try {
      setDeleting(true)
      const { error } = await supabase.from('creators').delete().eq('id', creatorId)

      if (error) {
        throw error
      }

      navigate('/')
    } catch (err) {
      console.error('Error deleting creator:', err)
      setPageError(
        `${err.message || 'Unable to delete creator.'} Check that RLS allows delete and the creators table id matches this creator.`,
      )
      setDeleting(false)
    }
  }

  if (loading) {
    return <div className="loading-card">Loading editor...</div>
  }

  return (
    <section className="form-page">
      <div className="form-intro">
        <p className="eyebrow">Edit Creator</p>
        <h1>Update this creator profile.</h1>
        <p>Keep details accurate so your Creatorverse stays useful.</p>
      </div>

      <form className="creator-form" onSubmit={handleSubmit} noValidate>
        {pageError && <div className="notice notice-error">{pageError}</div>}

        <label>
          Name
          <input name="name" value={formData.name} onChange={handleChange} />
          {errors.name && <span className="field-error">{errors.name}</span>}
        </label>

        <label>
          Channel URL
          <input name="url" value={formData.url} onChange={handleChange} />
          {errors.url && <span className="field-error">{errors.url}</span>}
        </label>

        <label>
          Description
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="5"
          />
          {errors.description && (
            <span className="field-error">{errors.description}</span>
          )}
        </label>

        <label>
          Image URL
          <input
            name="imageURL"
            value={formData.imageURL}
            onChange={handleChange}
          />
          {errors.imageURL && (
            <span className="field-error">{errors.imageURL}</span>
          )}
        </label>

        <div className="form-actions">
          <button
            className="button"
            type="submit"
            disabled={submitting || isSample}
          >
            {submitting ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            className="button button-danger"
            type="button"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
          <Link className="button button-secondary" to="/">
            Cancel
          </Link>
        </div>
      </form>
    </section>
  )
}

export default EditCreator
