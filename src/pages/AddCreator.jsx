import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../client.js'

const initialFormState = {
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

function AddCreator() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState(initialFormState)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

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
    setSubmitError('')

    if (!validateForm()) {
      return
    }

    try {
      setSubmitting(true)
      const { data, error } = await supabase
        .from('creators')
        .insert([
          {
            name: formData.name.trim(),
            url: formData.url.trim(),
            description: formData.description.trim(),
            imageURL: formData.imageURL.trim() || null,
          },
        ])
        .select()

      if (error) {
        throw error
      }

      if (!data?.length) {
        throw new Error('Creator was not returned after insert.')
      }

      navigate('/')
    } catch (err) {
      console.error('Error adding creator:', err)
      setSubmitError(
        `${err.message || 'Unable to add creator.'} Check that the table is named creators, columns are name, url, description, and imageURL, RLS allows insert, and your .env has VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.`,
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="form-page">
      <div className="form-intro">
        <p className="eyebrow">New Creator</p>
        <h1>Add a creator to your universe.</h1>
        <p>
          Save their profile, best link, and optional image so they are easy to
          find later.
        </p>
      </div>

      <form className="creator-form" onSubmit={handleSubmit} noValidate>
        {submitError && <div className="notice notice-error">{submitError}</div>}

        <label>
          Name
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g. Fireship"
          />
          {errors.name && <span className="field-error">{errors.name}</span>}
        </label>

        <label>
          Channel URL
          <input
            name="url"
            value={formData.url}
            onChange={handleChange}
            placeholder="https://www.youtube.com/@Fireship"
          />
          {errors.url && <span className="field-error">{errors.url}</span>}
        </label>

        <label>
          Description
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="What makes this creator worth following?"
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
            placeholder="https://example.com/image.jpg"
          />
          {errors.imageURL && (
            <span className="field-error">{errors.imageURL}</span>
          )}
        </label>

        <div className="form-actions">
          <button className="button" type="submit" disabled={submitting}>
            {submitting ? 'Saving...' : 'Add Creator'}
          </button>
          <Link className="button button-secondary" to="/">
            Cancel
          </Link>
        </div>
      </form>
    </section>
  )
}

export default AddCreator
