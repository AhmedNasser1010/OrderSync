import React from 'react'
import { Helmet } from 'react-helmet-async'

function SEO({ title, description }) {
  return (
    <Helmet>
      <title>{title}</title>
      <meta name='description' content={description} />
    </Helmet>
  )
}

export default SEO